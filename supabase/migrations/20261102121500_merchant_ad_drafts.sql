-- Advertising workspace: merchant-owned drafts only.
-- No provider tokens or financial authorizations are stored here.
CREATE TABLE IF NOT EXISTS public.merchant_ad_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  platform text NOT NULL CHECK (platform IN ('meta','google')),
  objective text NOT NULL CHECK (objective IN ('traffic','sales','awareness')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  headline text NOT NULL CHECK (char_length(headline) BETWEEN 1 AND 120),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 1000),
  destination_url text NOT NULL CHECK (char_length(destination_url) BETWEEN 1 AND 1000),
  daily_budget_eur numeric(10,2) NOT NULL CHECK (daily_budget_eur >= 1 AND daily_budget_eur <= 10000),
  status text NOT NULL DEFAULT 'draft' CHECK (status='draft'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS merchant_ad_drafts_user_store_idx ON public.merchant_ad_drafts(user_id,boutique_id,created_at DESC);
ALTER TABLE public.merchant_ad_drafts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.merchant_ad_drafts FROM anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.merchant_ad_drafts TO authenticated;
DROP POLICY IF EXISTS "Merchant reads own ad drafts" ON public.merchant_ad_drafts;
DROP POLICY IF EXISTS "Merchant creates own ad drafts" ON public.merchant_ad_drafts;
DROP POLICY IF EXISTS "Merchant updates own ad drafts" ON public.merchant_ad_drafts;
DROP POLICY IF EXISTS "Merchant deletes own ad drafts" ON public.merchant_ad_drafts;
CREATE POLICY "Merchant reads own ad drafts" ON public.merchant_ad_drafts
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() AND EXISTS(
      SELECT 1 FROM public.boutiques b WHERE b.id=boutique_id AND b.user_id=auth.uid()
    )
  );
CREATE POLICY "Merchant creates own ad drafts" ON public.merchant_ad_drafts
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND EXISTS(SELECT 1 FROM public.boutiques b WHERE b.id=boutique_id AND b.user_id=auth.uid())
    AND (product_id IS NULL OR EXISTS(
      SELECT 1 FROM public.products p WHERE p.id=merchant_ad_drafts.product_id AND p.boutique_id=merchant_ad_drafts.boutique_id
    ))
  );
CREATE POLICY "Merchant updates own ad drafts" ON public.merchant_ad_drafts
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid() AND EXISTS(
      SELECT 1 FROM public.boutiques b WHERE b.id=boutique_id AND b.user_id=auth.uid()
    )
  ) WITH CHECK (
    user_id=auth.uid()
    AND EXISTS(SELECT 1 FROM public.boutiques b WHERE b.id=boutique_id AND b.user_id=auth.uid())
    AND (product_id IS NULL OR EXISTS(
      SELECT 1 FROM public.products p WHERE p.id=merchant_ad_drafts.product_id AND p.boutique_id=merchant_ad_drafts.boutique_id
    ))
  );
CREATE POLICY "Merchant deletes own ad drafts" ON public.merchant_ad_drafts
  FOR DELETE TO authenticated USING (
    user_id=auth.uid() AND EXISTS(
      SELECT 1 FROM public.boutiques b WHERE b.id=boutique_id AND b.user_id=auth.uid()
    )
  );
CREATE OR REPLACE FUNCTION public.validate_merchant_ad_draft()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
  IF NEW.destination_url !~ '^https://[^[:space:]]+$' THEN
    RAISE EXCEPTION 'ad_destination_must_be_https';
  END IF;
  IF NEW.status <> 'draft' THEN
    RAISE EXCEPTION 'ad_publication_requires_provider_connection';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS merchant_ad_draft_validate_trigger ON public.merchant_ad_drafts;
CREATE TRIGGER merchant_ad_draft_validate_trigger
  BEFORE INSERT OR UPDATE ON public.merchant_ad_drafts
  FOR EACH ROW EXECUTE FUNCTION public.validate_merchant_ad_draft();
