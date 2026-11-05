-- Require a verified, physically inspected paid sample before merchant supplier restock requests.
-- This guard is additive: it does not delete historical requests or alter existing stock.
-- A formal exception workflow must be separately designed and authorized; no client override here.
CREATE OR REPLACE FUNCTION public.require_sample_before_supplier_restock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT b.user_id INTO owner_id
  FROM public.products p
  JOIN public.boutiques b ON b.id = p.boutique_id
  WHERE p.id = NEW.product_id
    AND p.boutique_id = NEW.boutique_id
    AND p.supplier_product_id = NEW.supplier_product_id;
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'restock_product_owner_mismatch' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.sample_validations v
    JOIN public.sample_purchases sp
      ON sp.product_id = v.product_id AND sp.user_id = v.user_id
    WHERE v.product_id = NEW.product_id AND v.user_id = owner_id
      AND v.status = 'validated' AND v.visual_confirmed_at IS NOT NULL
      AND sp.payment_status = 'paid' AND sp.stripe_environment = 'live'
  ) THEN
    RAISE EXCEPTION 'validated_paid_sample_required_before_restock'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS supplier_restock_requires_validated_sample ON public.stock_restock_requests;
CREATE TRIGGER supplier_restock_requires_validated_sample
BEFORE INSERT ON public.stock_restock_requests
FOR EACH ROW EXECUTE FUNCTION public.require_sample_before_supplier_restock();

REVOKE ALL ON FUNCTION public.require_sample_before_supplier_restock() FROM PUBLIC, anon, authenticated;
