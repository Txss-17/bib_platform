
-- 1) POS journal: QR URL + payment completion timestamp
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS pos_qr_url text,
  ADD COLUMN IF NOT EXISTS payment_completed_at timestamptz;

CREATE OR REPLACE FUNCTION public.set_payment_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
     AND NEW.payment_status IN ('paid','failed','canceled')
     AND NEW.payment_completed_at IS NULL THEN
    NEW.payment_completed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_set_payment_completed_at ON public.orders;
CREATE TRIGGER orders_set_payment_completed_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_payment_completed_at();

-- 2) Sample validations table (referenced by the app but missing)
CREATE TABLE IF NOT EXISTS public.sample_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'none' CHECK (status IN ('none','ordered','received','validated')),
  photo_url text,
  comment text,
  ordered_at timestamptz,
  validated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

ALTER TABLE public.sample_validations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their sample validations" ON public.sample_validations;
CREATE POLICY "Users manage their sample validations"
  ON public.sample_validations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
