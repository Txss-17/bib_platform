-- A physical sample can only be validated after a Stripe-confirmed purchase.
CREATE TABLE IF NOT EXISTS public.sample_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL UNIQUE,
  stripe_environment text NOT NULL CHECK (stripe_environment IN ('sandbox','live')),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'eur',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','expired')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sample_purchases_product_user_idx
  ON public.sample_purchases(product_id, user_id, payment_status);
ALTER TABLE public.sample_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own sample purchases" ON public.sample_purchases;
CREATE POLICY "Users read own sample purchases"
  ON public.sample_purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- Clients cannot forge payments, delivery states, or validations by writing rows directly.
DROP POLICY IF EXISTS "Users manage their sample validations" ON public.sample_validations;
DROP POLICY IF EXISTS "Users read own sample validations" ON public.sample_validations;
CREATE POLICY "Users read own sample validations"
  ON public.sample_validations FOR SELECT TO authenticated USING (auth.uid() = user_id);
ALTER TABLE public.sample_validations DROP CONSTRAINT IF EXISTS sample_validations_status_check;
ALTER TABLE public.sample_validations ADD CONSTRAINT sample_validations_status_check
  CHECK (status IN ('none','ordered','received','validated','to_validate','rejected'));

ALTER TABLE public.sample_validations
  ADD COLUMN IF NOT EXISTS visual_confirmed_at timestamptz;

CREATE OR REPLACE FUNCTION public.mark_paid_sample_received(p_product_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.sample_purchases s
    JOIN public.products p ON p.id = s.product_id
    JOIN public.boutiques b ON b.id = p.boutique_id
    WHERE s.product_id = p_product_id AND s.user_id = auth.uid()
      AND s.payment_status = 'paid' AND s.stripe_environment = 'live'
      AND b.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Verified sample purchase required';
  END IF;
  UPDATE public.sample_validations
     SET status='received'
   WHERE product_id=p_product_id AND user_id=auth.uid() AND status='ordered';
  IF NOT FOUND THEN RAISE EXCEPTION 'Sample not ready to receive'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.mark_paid_sample_received(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_paid_sample_received(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.validate_paid_sample(
  p_product_id uuid, p_comment text, p_photo_url text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR length(trim(coalesce(p_comment,''))) < 5 THEN
    RAISE EXCEPTION 'Visual inspection comment required';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.sample_purchases s
    JOIN public.products p ON p.id=s.product_id
    JOIN public.boutiques b ON b.id=p.boutique_id
    WHERE s.product_id=p_product_id AND s.user_id=auth.uid()
      AND s.payment_status='paid' AND s.stripe_environment='live'
      AND b.user_id=auth.uid()
  ) THEN RAISE EXCEPTION 'Verified sample purchase required'; END IF;
  UPDATE public.sample_validations
    SET status='validated', comment=left(trim(p_comment),2000),
        photo_url=p_photo_url, validated_at=now(), visual_confirmed_at=now()
    WHERE product_id=p_product_id AND user_id=auth.uid() AND status='received';
  IF NOT FOUND THEN RAISE EXCEPTION 'Sample must be received before validation'; END IF;
  UPDATE public.products SET status='active' WHERE id=p_product_id
    AND boutique_id IN (SELECT id FROM public.boutiques WHERE user_id=auth.uid());
END $$;
REVOKE ALL ON FUNCTION public.validate_paid_sample(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_paid_sample(uuid,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.review_paid_sample(
  p_product_id uuid, p_status text, p_comment text DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF auth.uid() IS NULL OR p_status NOT IN ('to_validate','rejected') OR NOT EXISTS (
    SELECT 1 FROM public.products p JOIN public.boutiques b ON b.id=p.boutique_id
    WHERE p.id=p_product_id AND b.user_id=auth.uid()
  ) THEN RAISE EXCEPTION 'Not authorized'; END IF;
  INSERT INTO public.sample_validations(product_id,user_id,status,comment,validated_at)
    VALUES (p_product_id,auth.uid(),p_status,p_comment,now())
    ON CONFLICT(product_id,user_id) DO UPDATE
      SET status=EXCLUDED.status, comment=EXCLUDED.comment,
          validated_at=now(), visual_confirmed_at=NULL;
  IF p_status='rejected' THEN
    UPDATE public.products SET status='paused' WHERE id=p_product_id;
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.review_paid_sample(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_paid_sample(uuid,text,text) TO authenticated;

-- Server-side publication guard: stock counts and client updates are not proof of inspection.
CREATE OR REPLACE FUNCTION public.require_verified_sample_before_activation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.status='active' AND OLD.status IS DISTINCT FROM 'active'
     AND NEW.supplier_product_id IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM public.sample_validations v
       JOIN public.sample_purchases s ON s.product_id=v.product_id AND s.user_id=v.user_id
       JOIN public.boutiques b ON b.id=NEW.boutique_id
       WHERE v.product_id=NEW.id AND v.user_id=b.user_id
         AND v.status='validated' AND v.visual_confirmed_at IS NOT NULL
         AND s.payment_status='paid'
         AND s.stripe_environment='live'
     ) THEN
    RAISE EXCEPTION 'Paid physical sample inspection required before activation';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS products_require_verified_sample ON public.products;
CREATE TRIGGER products_require_verified_sample
  BEFORE UPDATE OF status ON public.products FOR EACH ROW
  EXECUTE FUNCTION public.require_verified_sample_before_activation();
