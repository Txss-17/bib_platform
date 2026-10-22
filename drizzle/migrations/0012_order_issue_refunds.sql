ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_environment text,
  ADD COLUMN IF NOT EXISTS refund_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS refunded_amount_cents bigint NOT NULL DEFAULT 0;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.orders'::regclass AND conname='orders_stripe_environment_check') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_stripe_environment_check CHECK (stripe_environment IS NULL OR stripe_environment IN ('sandbox','live'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.orders'::regclass AND conname='orders_refund_status_check') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_refund_status_check CHECK (refund_status IN ('none','pending','partial','refunded'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.orders'::regclass AND conname='orders_refunded_amount_nonnegative') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_refunded_amount_nonnegative CHECK (refunded_amount_cents >= 0);
  END IF;
END $$;

CREATE TABLE public.order_refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id),
  issue_id uuid NOT NULL REFERENCES public.order_issues(id),
  attempt integer NOT NULL CHECK (attempt > 0),
  stripe_refund_id text UNIQUE,
  payment_intent_id text,
  idempotency_key text NOT NULL UNIQUE,
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'eur' CHECK (currency = 'eur'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed')),
  stock_disposition text NOT NULL DEFAULT 'awaiting_return' CHECK (stock_disposition IN ('awaiting_return','restocked','not_restocked')),
  failure_reason text,
  processed_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issue_id, attempt)
);

CREATE INDEX order_refunds_order_status_idx ON public.order_refunds(order_id, status);
ALTER TABLE public.order_refunds ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_refunds FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.order_refunds TO service_role;

ALTER TABLE public.issue_responses
  ADD COLUMN IF NOT EXISTS refund_id uuid REFERENCES public.order_refunds(id);
CREATE UNIQUE INDEX IF NOT EXISTS issue_responses_refund_id_uidx
  ON public.issue_responses(refund_id) WHERE refund_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.guard_order_refund_fields()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role'
     AND (NEW.refund_status IS DISTINCT FROM OLD.refund_status
       OR NEW.refunded_amount_cents IS DISTINCT FROM OLD.refunded_amount_cents
       OR NEW.stripe_environment IS DISTINCT FROM OLD.stripe_environment) THEN
    RAISE EXCEPTION 'Les données de remboursement sont gérées par le serveur.' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guard_order_refund_fields
BEFORE UPDATE OF refund_status, refunded_amount_cents, stripe_environment ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.guard_order_refund_fields();

CREATE OR REPLACE FUNCTION public.reserve_order_issue_refund(
  p_issue_id uuid,
  p_amount_cents bigint,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_existing public.order_refunds%ROWTYPE;
  v_attempt integer;
  v_reserved bigint;
  v_id uuid;
  v_key text;
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur.' USING ERRCODE='42501';
  END IF;
  IF p_amount_cents IS NULL OR p_amount_cents < 1 THEN
    RAISE EXCEPTION 'Montant de remboursement invalide.';
  END IF;

  SELECT o.id AS order_id, o.amount, o.payment_status, o.stripe_session_id, o.stripe_environment,
         i.id AS issue_id, i.status AS issue_status
    INTO v_order
    FROM public.order_issues i
    JOIN public.orders o ON o.id = i.order_id
    JOIN public.boutiques b ON b.id = o.boutique_id
   WHERE i.id = p_issue_id AND b.user_id = p_user_id
   FOR UPDATE OF o;

  IF NOT FOUND THEN RAISE EXCEPTION 'Signalement introuvable.'; END IF;
  IF v_order.payment_status <> 'paid' THEN RAISE EXCEPTION 'Seule une commande payée peut être remboursée.'; END IF;
  IF v_order.issue_status NOT IN ('pending','accepted') THEN RAISE EXCEPTION 'Ce signalement n’est plus ouvert.'; END IF;
  IF v_order.stripe_session_id IS NULL OR v_order.stripe_environment IS NULL OR v_order.stripe_environment NOT IN ('sandbox','live') THEN
    RAISE EXCEPTION 'Le paiement Stripe de cette commande ne peut pas être retrouvé.';
  END IF;

  SELECT * INTO v_existing FROM public.order_refunds
   WHERE issue_id = p_issue_id AND status IN ('pending','succeeded')
   ORDER BY attempt DESC LIMIT 1;
  IF FOUND THEN
    IF v_existing.amount_cents <> p_amount_cents THEN
      RAISE EXCEPTION 'Un remboursement est déjà en cours ou terminé pour ce signalement.';
    END IF;
    RETURN jsonb_build_object(
      'refund_id', v_existing.id, 'order_id', v_existing.order_id,
      'stripe_session_id', v_order.stripe_session_id,
      'stripe_environment', v_order.stripe_environment,
      'amount_cents', v_existing.amount_cents, 'idempotency_key', v_existing.idempotency_key,
      'stripe_refund_id', v_existing.stripe_refund_id
    );
  END IF;

  SELECT coalesce(sum(amount_cents), 0) INTO v_reserved
    FROM public.order_refunds WHERE order_id = v_order.order_id AND status IN ('pending','succeeded');
  IF v_reserved + p_amount_cents > round(v_order.amount * 100)::bigint THEN
    RAISE EXCEPTION 'Le montant dépasse le solde remboursable de la ligne.';
  END IF;

  SELECT coalesce(max(attempt), 0) + 1 INTO v_attempt
    FROM public.order_refunds WHERE issue_id = p_issue_id;
  v_id := gen_random_uuid();
  v_key := 'bib-refund-' || v_id::text;
  INSERT INTO public.order_refunds(id, order_id, issue_id, attempt, idempotency_key, amount_cents, processed_by)
  VALUES (v_id, v_order.order_id, p_issue_id, v_attempt, v_key, p_amount_cents, p_user_id);
  UPDATE public.order_issues SET status = 'accepted' WHERE id = p_issue_id AND status = 'pending';

  RETURN jsonb_build_object(
    'refund_id', v_id, 'order_id', v_order.order_id,
    'stripe_session_id', v_order.stripe_session_id,
    'stripe_environment', v_order.stripe_environment,
    'amount_cents', p_amount_cents, 'idempotency_key', v_key,
    'stripe_refund_id', NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_order_issue_refund(
  p_refund_id uuid,
  p_status text,
  p_stripe_refund_id text DEFAULT NULL,
  p_payment_intent_id text DEFAULT NULL,
  p_failure_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_refund public.order_refunds%ROWTYPE;
  v_refunded bigint;
  v_order_total bigint;
  v_has_pending boolean;
  v_next_status text;
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Accès réservé au serveur.' USING ERRCODE='42501';
  END IF;
  IF p_status NOT IN ('pending','succeeded','failed') THEN RAISE EXCEPTION 'Statut de remboursement invalide.'; END IF;

  SELECT * INTO v_refund FROM public.order_refunds WHERE id = p_refund_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Remboursement introuvable.'; END IF;
  PERFORM 1 FROM public.orders WHERE id = v_refund.order_id FOR UPDATE;

  IF v_refund.status = 'succeeded' AND p_status <> 'succeeded' THEN
    p_status := 'succeeded';
  END IF;

  UPDATE public.order_refunds
     SET status = p_status,
         stripe_refund_id = coalesce(p_stripe_refund_id, stripe_refund_id),
         payment_intent_id = coalesce(p_payment_intent_id, payment_intent_id),
         failure_reason = CASE WHEN p_status = 'failed' THEN left(p_failure_reason, 500) ELSE NULL END,
         updated_at = now()
   WHERE id = p_refund_id;

  SELECT coalesce(sum(amount_cents), 0) INTO v_refunded
    FROM public.order_refunds WHERE order_id = v_refund.order_id AND status = 'succeeded';
  SELECT round(amount * 100)::bigint INTO v_order_total FROM public.orders WHERE id = v_refund.order_id;
  SELECT EXISTS(SELECT 1 FROM public.order_refunds WHERE order_id = v_refund.order_id AND status = 'pending') INTO v_has_pending;

  v_next_status := CASE
    WHEN v_refunded >= v_order_total THEN 'refunded'
    WHEN v_has_pending THEN 'pending'
    WHEN v_refunded > 0 THEN 'partial'
    ELSE 'none'
  END;
  UPDATE public.orders SET refunded_amount_cents = v_refunded, refund_status = v_next_status WHERE id = v_refund.order_id;

  IF p_status = 'succeeded' THEN
    UPDATE public.order_issues SET status = 'resolved' WHERE id = v_refund.issue_id;
    INSERT INTO public.issue_responses(issue_id, action, message, refund_id)
    VALUES (v_refund.issue_id, 'partial_refund',
      'Remboursement Stripe confirmé : ' || to_char(v_refund.amount_cents / 100.0, 'FM9999999990.00') || ' EUR. Stock en attente de réception contrôlée.',
      v_refund.id)
    ON CONFLICT (refund_id) WHERE refund_id IS NOT NULL DO UPDATE SET message = EXCLUDED.message;
  ELSIF p_status = 'pending' THEN
    UPDATE public.order_issues SET status = 'accepted' WHERE id = v_refund.issue_id AND status = 'pending';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_order_issue_refund(uuid,bigint,uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_order_issue_refund(uuid,text,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_order_issue_refund(uuid,bigint,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_order_issue_refund(uuid,text,text,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.track_order_refund_status(_order_number text, _customer_email text)
RETURNS TABLE(refund_status text, refunded_amount_cents bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT o.refund_status, o.refunded_amount_cents
  FROM public.orders o
  WHERE o.order_number = upper(btrim(_order_number))
    AND lower(btrim(o.customer_email)) = lower(btrim(_customer_email))
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.track_order_refund_status(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order_refund_status(text,text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.guard_fake_refund_issue_response()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.action = 'partial_refund' AND (
    NEW.refund_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.order_refunds r
      WHERE r.id = NEW.refund_id AND r.issue_id = NEW.issue_id AND r.status = 'succeeded'
    )
  ) THEN
    RAISE EXCEPTION 'Un remboursement ne peut être consigné qu’après confirmation Stripe.' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_guard_fake_refund_issue_response
BEFORE INSERT OR UPDATE OF action, refund_id ON public.issue_responses
FOR EACH ROW EXECUTE FUNCTION public.guard_fake_refund_issue_response();