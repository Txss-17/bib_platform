
-- BIB Platform — opérations transactionnelles de stock
-- Dépend de 20261019160000_secure_product_inventory.sql.
-- Les Edge Functions doivent appeler ces RPC avec service_role.

BEGIN;

-- Réserver le stock pour les commandes déjà créées.
-- Chaque commande doit posséder sa quantité et son produit.
CREATE OR REPLACE FUNCTION public.reserve_product_stock_checkout(
  p_checkout_key UUID,
  p_order_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_product RECORD;
  v_reserved INTEGER;
  v_existing_count INTEGER;
  v_requested_count INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur'
      USING ERRCODE = '42501';
  END IF;

  IF p_checkout_key IS NULL
     OR p_order_ids IS NULL
     OR cardinality(p_order_ids) = 0 THEN
    RAISE EXCEPTION 'Checkout ou commandes invalides';
  END IF;

  -- Un même checkout ne doit pas réserver deux fois.
  SELECT COUNT(*)
  INTO v_existing_count
  FROM public.product_stock_reservations
  WHERE checkout_key = p_checkout_key;

  IF v_existing_count > 0 THEN
    SELECT COUNT(*)
    INTO v_requested_count
    FROM public.orders
    WHERE id = ANY(p_order_ids);

    IF v_existing_count <> v_requested_count THEN
      RAISE EXCEPTION 'Clé de checkout déjà utilisée avec un contenu différent';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.product_stock_reservations r
      WHERE r.checkout_key = p_checkout_key
        AND r.status <> 'reserved'
    ) THEN
      RAISE EXCEPTION 'Cette réservation a déjà changé de statut';
    END IF;

    RETURN jsonb_build_object(
      'ok', true,
      'idempotent_replay', true,
      'checkout_key', p_checkout_key
    );
  END IF;

  -- Verrouiller les produits dans un ordre stable pour limiter
  -- les interblocages entre paniers contenant plusieurs produits.
  FOR v_product IN
    SELECT p.id
    FROM public.products p
    WHERE p.id IN (
      SELECT o.product_id
      FROM public.orders o
      WHERE o.id = ANY(p_order_ids)
    )
    ORDER BY p.id
    FOR UPDATE
  LOOP
    NULL;
  END LOOP;

  -- Vérifier que toutes les commandes demandées existent.
  SELECT COUNT(*)
  INTO v_requested_count
  FROM public.orders
  WHERE id = ANY(p_order_ids);

  IF v_requested_count <> cardinality(p_order_ids) THEN
    RAISE EXCEPTION 'Une ou plusieurs commandes sont introuvables';
  END IF;

  -- Une seule commande par produit dans un même checkout.
  IF EXISTS (
    SELECT 1
    FROM public.orders
    WHERE id = ANY(p_order_ids)
    GROUP BY product_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Regrouper les lignes identiques avant réservation';
  END IF;

  -- Vérifier boutique, produit actif et quantité disponible.
  FOR v_order IN
    SELECT
      o.id AS order_id,
      o.product_id,
      o.boutique_id,
      o.quantity,
      p.stock_quantity,
      p.status AS product_status,
      p.boutique_id AS product_boutique_id,
      b.status AS boutique_status
    FROM public.orders o
    JOIN public.products p ON p.id = o.product_id
    JOIN public.boutiques b ON b.id = p.boutique_id
    WHERE o.id = ANY(p_order_ids)
    ORDER BY p.id
  LOOP
    IF v_order.quantity <= 0 THEN
      RAISE EXCEPTION 'Quantité de commande invalide';
    END IF;

    IF v_order.boutique_id <> v_order.product_boutique_id THEN
      RAISE EXCEPTION 'La commande ne correspond pas à la boutique du produit';
    END IF;

    IF v_order.product_status <> 'active'
       OR v_order.boutique_status <> 'published' THEN
      RAISE EXCEPTION 'Produit ou boutique non disponible à la vente';
    END IF;

    SELECT COALESCE(SUM(r.quantity), 0)::INTEGER
    INTO v_reserved
    FROM public.product_stock_reservations r
    WHERE r.product_id = v_order.product_id
      AND r.status = 'reserved';

    IF v_order.stock_quantity - v_reserved < v_order.quantity THEN
      RAISE EXCEPTION 'Stock insuffisant pour le produit %',
        v_order.product_id;
    END IF;
  END LOOP;

  -- Création atomique des réservations.
  INSERT INTO public.product_stock_reservations (
    order_id,
    product_id,
    quantity,
    checkout_key
  )
  SELECT
    o.id,
    o.product_id,
    o.quantity,
    p_checkout_key
  FROM public.orders o
  WHERE o.id = ANY(p_order_ids);

  RETURN jsonb_build_object(
    'ok', true,
    'idempotent_replay', false,
    'checkout_key', p_checkout_key,
    'reserved_orders', cardinality(p_order_ids)
  );
END;
$$;

-- Associer la session Stripe aux réservations.
CREATE OR REPLACE FUNCTION public.attach_product_stock_stripe_session(
  p_checkout_key UUID,
  p_stripe_session_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur'
      USING ERRCODE = '42501';
  END IF;

  IF p_stripe_session_id IS NULL OR p_stripe_session_id = '' THEN
    RAISE EXCEPTION 'Session Stripe invalide';
  END IF;

  UPDATE public.product_stock_reservations
  SET stripe_session_id = p_stripe_session_id,
      updated_at = now()
  WHERE checkout_key = p_checkout_key
    AND status = 'reserved'
    AND (
      stripe_session_id IS NULL
      OR stripe_session_id = p_stripe_session_id
    );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Réservation introuvable ou déjà traitée';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.product_stock_reservations
    WHERE checkout_key = p_checkout_key
      AND stripe_session_id IS DISTINCT FROM p_stripe_session_id
  ) THEN
    RAISE EXCEPTION 'Incohérence de session Stripe';
  END IF;
END;
$$;

-- Confirmer la vente après paiement effectif.
-- Le stock physique est décrémenté une seule fois par commande.
CREATE OR REPLACE FUNCTION public.confirm_product_stock_checkout(
  p_stripe_session_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation RECORD;
  v_confirmed INTEGER := 0;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur'
      USING ERRCODE = '42501';
  END IF;

  IF p_stripe_session_id IS NULL OR p_stripe_session_id = '' THEN
    RAISE EXCEPTION 'Session Stripe invalide';
  END IF;

  -- Verrouiller les réservations dans un ordre stable.
  PERFORM r.id
  FROM public.product_stock_reservations r
  WHERE r.stripe_session_id = p_stripe_session_id
  ORDER BY r.product_id, r.id
  FOR UPDATE;

  IF NOT EXISTS (
    SELECT 1
    FROM public.product_stock_reservations
    WHERE stripe_session_id = p_stripe_session_id
  ) THEN
    RAISE EXCEPTION 'Aucune réservation pour cette session';
  END IF;

  -- Une session déjà confirmée ne doit jamais débiter à nouveau.
  IF EXISTS (
    SELECT 1
    FROM public.product_stock_reservations
    WHERE stripe_session_id = p_stripe_session_id
      AND status = 'released'
  ) THEN
    RAISE EXCEPTION
      'Session payée mais réservation libérée : intervention requise';
  END IF;

  FOR v_reservation IN
    SELECT r.*
    FROM public.product_stock_reservations r
    WHERE r.stripe_session_id = p_stripe_session_id
      AND r.status = 'reserved'
    ORDER BY r.product_id, r.id
  LOOP
    -- Le produit reste verrouillé pendant la transaction.
    PERFORM 1
    FROM public.products
    WHERE id = v_reservation.product_id
    FOR UPDATE;

    UPDATE public.products
    SET stock_quantity = stock_quantity - v_reservation.quantity,
        cumulative_sales = cumulative_sales + v_reservation.quantity,
        updated_at = now()
    WHERE id = v_reservation.product_id
      AND stock_quantity >= v_reservation.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION
        'Stock incohérent lors de la confirmation de la vente';
    END IF;

    INSERT INTO public.product_stock_movements (
      product_id,
      order_id,
      quantity_delta,
      reason,
      idempotency_key
    )
    VALUES (
      v_reservation.product_id,
      v_reservation.order_id,
      -v_reservation.quantity,
      'sale',
      'sale:' || v_reservation.order_id::TEXT
    );

    UPDATE public.product_stock_reservations
    SET status = 'confirmed',
        updated_at = now()
    WHERE id = v_reservation.id;

    v_confirmed := v_confirmed + 1;
  END LOOP;

  UPDATE public.orders
  SET payment_status = 'completed',
      stripe_session_id = p_stripe_session_id
  WHERE id IN (
    SELECT r.order_id
    FROM public.product_stock_reservations r
    WHERE r.stripe_session_id = p_stripe_session_id
  );

  RETURN jsonb_build_object(
    'ok', true,
    'session_id', p_stripe_session_id,
    'newly_confirmed_reservations', v_confirmed
  );
END;
$$;

-- Libérer les réservations si Stripe confirme l'expiration
-- ou l'échec du paiement. Aucun stock physique n'est modifié.
CREATE OR REPLACE FUNCTION public.release_product_stock_checkout(
  p_stripe_session_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_released INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur'
      USING ERRCODE = '42501';
  END IF;

  IF p_stripe_session_id IS NULL OR p_stripe_session_id = '' THEN
    RAISE EXCEPTION 'Session Stripe invalide';
  END IF;

  -- Une réservation confirmée ne peut pas être libérée.
  IF EXISTS (
    SELECT 1
    FROM public.product_stock_reservations
    WHERE stripe_session_id = p_stripe_session_id
      AND status = 'confirmed'
  ) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'reason', 'already_confirmed'
    );
  END IF;

  UPDATE public.product_stock_reservations
  SET status = 'released',
      updated_at = now()
  WHERE stripe_session_id = p_stripe_session_id
    AND status = 'reserved';

  GET DIAGNOSTICS v_released = ROW_COUNT;

  UPDATE public.orders
  SET payment_status = 'failed',
      stripe_session_id = p_stripe_session_id
  WHERE id IN (
    SELECT r.order_id
    FROM public.product_stock_reservations r
    WHERE r.stripe_session_id = p_stripe_session_id
      AND r.status = 'released'
  )
  AND payment_status = 'pending';

  RETURN jsonb_build_object(
    'ok', true,
    'released_reservations', v_released
  );
END;
$$;

-- Ces fonctions ne sont pas des endpoints publics.
REVOKE ALL ON FUNCTION public.reserve_product_stock_checkout(UUID, UUID[])
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.attach_product_stock_stripe_session(UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_product_stock_checkout(TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_product_stock_checkout(TEXT)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.reserve_product_stock_checkout(UUID, UUID[])
  TO service_role;
GRANT EXECUTE ON FUNCTION public.attach_product_stock_stripe_session(UUID, TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_product_stock_checkout(TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.release_product_stock_checkout(TEXT)
  TO service_role;

COMMIT;
