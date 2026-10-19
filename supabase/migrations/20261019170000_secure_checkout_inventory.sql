
BEGIN;

-- =========================================================
-- 1. Quantité persistée par commande
-- =========================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_quantity_positive
  CHECK (quantity > 0);

-- =========================================================
-- 2. Réservations de stock liées aux commandes
-- =========================================================

CREATE TABLE IF NOT EXISTS public.product_stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE
    REFERENCES public.orders(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL
    REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  checkout_key UUID NOT NULL,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'confirmed', 'released')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_product_status
  ON public.product_stock_reservations(product_id, status);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_checkout_key
  ON public.product_stock_reservations(checkout_key);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_stripe_session
  ON public.product_stock_reservations(stripe_session_id);

-- =========================================================
-- 3. Journal d'audit des mouvements de stock
-- =========================================================

CREATE TABLE IF NOT EXISTS public.product_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL
    REFERENCES public.products(id) ON DELETE RESTRICT,
  order_id UUID REFERENCES public.orders(id) ON DELETE RESTRICT,
  quantity_delta INTEGER NOT NULL CHECK (quantity_delta <> 0),
  reason TEXT NOT NULL
    CHECK (reason IN ('sale', 'receipt', 'return', 'adjustment')),
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created
  ON public.product_stock_movements(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_order
  ON public.product_stock_movements(order_id);

-- =========================================================
-- 4. RLS : consultation uniquement côté marchand
-- =========================================================

ALTER TABLE public.product_stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view stock reservations"
  ON public.product_stock_reservations;

CREATE POLICY "Owners can view stock reservations"
ON public.product_stock_reservations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.boutiques b ON b.id = o.boutique_id
    WHERE o.id = order_id
      AND b.user_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Owners can view product stock movements"
  ON public.product_stock_movements;

CREATE POLICY "Owners can view product stock movements"
ON public.product_stock_movements
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    JOIN public.boutiques b ON b.id = p.boutique_id
    WHERE p.id = product_id
      AND b.user_id = (SELECT auth.uid())
  )
);

-- Pas de politique INSERT/UPDATE/DELETE pour les marchands :
-- les mouvements passent par les fonctions serveur autorisées.

-- =========================================================
-- 5. Interdire les modifications directes du stock
-- =========================================================

CREATE OR REPLACE FUNCTION public.guard_product_stock_write()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    IF TG_OP = 'INSERT' AND NEW.stock_quantity <> 0 THEN
      RAISE EXCEPTION
        'Le stock initial doit provenir d''une réception validée.'
        USING ERRCODE = '42501';
    END IF;

    IF TG_OP = 'UPDATE'
       AND NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity THEN
      RAISE EXCEPTION
        'La modification directe du stock est interdite.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_product_stock_write
  ON public.products;

CREATE TRIGGER trg_guard_product_stock_write
BEFORE INSERT OR UPDATE OF stock_quantity
ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.guard_product_stock_write();

-- Supprimer les anciennes signatures incompatibles de la migration précédente.
DROP FUNCTION IF EXISTS public.reserve_product_stock_checkout(UUID, UUID[]);
DROP FUNCTION IF EXISTS public.attach_product_stock_stripe_session(UUID, TEXT);
DROP FUNCTION IF EXISTS public.confirm_product_stock_checkout(TEXT);

-- =========================================================
-- 6. Réserver atomiquement le stock
-- Les commandes doivent déjà exister et contenir quantity.
-- =========================================================

CREATE OR REPLACE FUNCTION public.reserve_product_stock_checkout(
  p_order_ids UUID[],
  p_checkout_key UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_existing_count INTEGER;
  v_requested_count INTEGER;
  v_reserved_count INTEGER := 0;
  v_available INTEGER;
  v_reserved INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur.'
      USING ERRCODE = '42501';
  END IF;

  IF p_checkout_key IS NULL
     OR p_order_ids IS NULL
     OR cardinality(p_order_ids) = 0 THEN
    RAISE EXCEPTION 'Réservation invalide.';
  END IF;

  SELECT count(*), count(DISTINCT x)
  INTO v_requested_count, v_existing_count
  FROM unnest(p_order_ids) AS t(x);

  IF v_requested_count <> v_existing_count THEN
    RAISE EXCEPTION 'La liste contient des commandes en double.';
  END IF;

  -- Une répétition de la même requête ne doit pas réserver
  -- une deuxième fois ni accepter une liste différente.
  SELECT count(*)
  INTO v_existing_count
  FROM public.product_stock_reservations r
  WHERE r.checkout_key = p_checkout_key;

  IF v_existing_count > 0 THEN
    IF v_existing_count <> cardinality(p_order_ids)
       OR EXISTS (
         SELECT 1
         FROM unnest(p_order_ids) requested(id)
         LEFT JOIN public.product_stock_reservations r
           ON r.order_id = requested.id
          AND r.checkout_key = p_checkout_key
         WHERE r.id IS NULL
       ) THEN
      RAISE EXCEPTION
        'Cette clé de réservation a déjà été utilisée avec un autre panier.';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.product_stock_reservations r
      WHERE r.checkout_key = p_checkout_key
        AND r.status <> 'reserved'
    ) THEN
      RAISE EXCEPTION 'Cette réservation n''est plus active.';
    END IF;

    RETURN v_existing_count;
  END IF;

  -- Verrouillage des produits dans l'ordre des UUID pour limiter
  -- les risques de blocage entre deux paniers concurrents.
  FOR v_order IN
    SELECT
      o.id AS order_id,
      o.product_id,
      o.boutique_id,
      o.quantity,
      o.payment_status,
      p.stock_quantity,
      p.status AS product_status,
      b.status AS boutique_status
    FROM public.orders o
    JOIN public.products p ON p.id = o.product_id
    JOIN public.boutiques b ON b.id = o.boutique_id
    WHERE o.id = ANY(p_order_ids)
    ORDER BY o.product_id, o.id
    FOR UPDATE OF p, o
  LOOP
    IF v_order.payment_status <> 'pending' THEN
      RAISE EXCEPTION 'Une commande n''est plus en attente de paiement.';
    END IF;

    IF v_order.product_status <> 'active'
       OR v_order.boutique_status <> 'published' THEN
      RAISE EXCEPTION 'Un produit ou une boutique n''est pas disponible.';
    END IF;

    SELECT COALESCE(SUM(r.quantity), 0)::INTEGER
    INTO v_reserved
    FROM public.product_stock_reservations r
    WHERE r.product_id = v_order.product_id
      AND r.status = 'reserved';

    v_available := v_order.stock_quantity - v_reserved;

    IF v_order.quantity <= 0 OR v_available < v_order.quantity THEN
      RAISE EXCEPTION 'Stock insuffisant pour le produit %.',
        v_order.product_id;
    END IF;
  END LOOP;

  IF (
    SELECT count(*)
    FROM public.orders o
    WHERE o.id = ANY(p_order_ids)
  ) <> cardinality(p_order_ids) THEN
    RAISE EXCEPTION 'Une ou plusieurs commandes sont introuvables.';
  END IF;

  -- Les verrous produits restent détenus jusqu'à la fin de la
  -- transaction RPC : deux paniers concurrents ne peuvent donc
  -- pas réserver le même stock disponible.
  INSERT INTO public.product_stock_reservations (
    order_id,
    product_id,
    quantity,
    checkout_key
  )
  SELECT o.id, o.product_id, o.quantity, p_checkout_key
  FROM public.orders o
  WHERE o.id = ANY(p_order_ids);

  GET DIAGNOSTICS v_reserved_count = ROW_COUNT;
  RETURN v_reserved_count;
END;
$$;

-- =========================================================
-- 7. Associer les réservations à la session Stripe
-- =========================================================

CREATE OR REPLACE FUNCTION public.attach_product_stock_stripe_session(
  p_checkout_key UUID,
  p_stripe_session_id TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur.'
      USING ERRCODE = '42501';
  END IF;

  IF p_stripe_session_id IS NULL OR p_stripe_session_id = '' THEN
    RAISE EXCEPTION 'Identifiant Stripe manquant.';
  END IF;

  UPDATE public.product_stock_reservations
  SET stripe_session_id = p_stripe_session_id,
      updated_at = now()
  WHERE checkout_key = p_checkout_key
    AND status = 'reserved'
    AND (stripe_session_id IS NULL
         OR stripe_session_id = p_stripe_session_id);

  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count = 0 OR EXISTS (
    SELECT 1
    FROM public.product_stock_reservations
    WHERE checkout_key = p_checkout_key
      AND (
        status <> 'reserved'
        OR stripe_session_id IS DISTINCT FROM p_stripe_session_id
      )
  ) THEN
    RAISE EXCEPTION 'Impossible d''associer la session Stripe à la réservation.';
  END IF;

  RETURN v_count;
END;
$$;

-- =========================================================
-- 8. Confirmer le paiement et sortir le stock une seule fois
-- =========================================================

CREATE OR REPLACE FUNCTION public.confirm_product_stock_checkout(
  p_stripe_session_id TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation RECORD;
  v_count INTEGER := 0;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur.'
      USING ERRCODE = '42501';
  END IF;

  -- Les verrous sur les réservations rendent les webhooks répétés
  -- idempotents : seule une réservation encore "reserved" est traitée.
  FOR v_reservation IN
    SELECT r.id, r.order_id, r.product_id, r.quantity
    FROM public.product_stock_reservations r
    WHERE r.stripe_session_id = p_stripe_session_id
      AND r.status = 'reserved'
    ORDER BY r.product_id, r.order_id
    FOR UPDATE
  LOOP
    PERFORM 1
    FROM public.products p
    WHERE p.id = v_reservation.product_id
    FOR UPDATE;

    UPDATE public.products
    SET stock_quantity = stock_quantity - v_reservation.quantity,
        cumulative_sales = cumulative_sales + v_reservation.quantity,
        updated_at = now()
    WHERE id = v_reservation.product_id
      AND stock_quantity >= v_reservation.quantity;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Stock incohérent lors de la confirmation du paiement.';
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
      'stripe-sale:' || p_stripe_session_id || ':' || v_reservation.order_id
    );

    UPDATE public.product_stock_reservations
    SET status = 'confirmed',
        updated_at = now()
    WHERE id = v_reservation.id;

    v_count := v_count + 1;
  END LOOP;

  IF v_count = 0 AND NOT EXISTS (
    SELECT 1
    FROM public.product_stock_reservations
    WHERE stripe_session_id = p_stripe_session_id
      AND status = 'confirmed'
  ) THEN
    RAISE EXCEPTION 'Aucune réservation active trouvée pour cette session.';
  END IF;

  UPDATE public.orders
  SET payment_status = 'paid',
      payment_completed_at = COALESCE(payment_completed_at, now()),
      logistics_status = CASE
      WHEN logistics_status = 'pending' THEN 'preparation'
      ELSE logistics_status
      END
  WHERE stripe_session_id = p_stripe_session_id
  AND payment_status <> 'paid';

  RETURN v_count;
END;
$$;

-- =========================================================
-- 9. Libérer les réservations par identifiant Stripe
-- =========================================================

CREATE OR REPLACE FUNCTION public.release_product_stock_checkout(
  p_stripe_session_id TEXT,
  p_failure_status TEXT DEFAULT 'failed'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur.'
      USING ERRCODE = '42501';
  END IF;

  IF p_failure_status NOT IN ('failed', 'expired') THEN
    RAISE EXCEPTION 'Statut de libération invalide.';
  END IF;

  UPDATE public.product_stock_reservations
  SET status = 'released',
      updated_at = now()
  WHERE stripe_session_id = p_stripe_session_id
    AND status = 'reserved';

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE public.orders
  SET payment_status = 'failed'
  WHERE stripe_session_id = p_stripe_session_id
    AND payment_status = 'pending';

  RETURN v_count;
END;
$$;

-- =========================================================
-- 10. Libérer une réservation si la création Stripe échoue
-- =========================================================

CREATE OR REPLACE FUNCTION public.release_product_stock_checkout_by_key(
  p_checkout_key UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  IF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur.'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.product_stock_reservations
  SET status = 'released',
      updated_at = now()
  WHERE checkout_key = p_checkout_key
    AND status = 'reserved'
    AND stripe_session_id IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  UPDATE public.orders o
  SET payment_status = 'failed'
  FROM public.product_stock_reservations r
  WHERE r.order_id = o.id
    AND r.checkout_key = p_checkout_key
    AND r.status = 'released'
    AND r.stripe_session_id IS NULL
    AND o.payment_status = 'pending';

  RETURN v_count;
END;
$$;

-- Ces fonctions ne doivent pas être appelables par un client connecté.
REVOKE ALL ON FUNCTION public.reserve_product_stock_checkout(UUID[], UUID)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.attach_product_stock_stripe_session(UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.confirm_product_stock_checkout(TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_product_stock_checkout(TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.release_product_stock_checkout_by_key(UUID)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.reserve_product_stock_checkout(UUID[], UUID)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.attach_product_stock_stripe_session(UUID, TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.confirm_product_stock_checkout(TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.release_product_stock_checkout(TEXT, TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.release_product_stock_checkout_by_key(UUID)
  TO service_role;

COMMIT;
