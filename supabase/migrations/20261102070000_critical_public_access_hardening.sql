-- Critical public access hardening. Checkout sessions are created only by
-- service-role Edge Functions using database prices and stock reservations.
BEGIN;

DROP POLICY IF EXISTS "Anyone can create orders for published boutiques" ON public.orders;
REVOKE INSERT ON public.orders FROM anon, authenticated;

-- A matching email is not proof of ownership of a guest order.
DROP POLICY IF EXISTS "Customers update own orders link" ON public.orders;
-- Guest order claims are only permitted through an authenticated SQL function
-- that checks the current Auth user's confirmed email against the order.
CREATE OR REPLACE FUNCTION public.claim_guest_orders(
  _customer_profile_id uuid, _email text
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp
AS $$
DECLARE
  claimed_count integer := 0;
  confirmed_email text;
BEGIN
  IF auth.role() IS DISTINCT FROM 'authenticated' OR auth.uid() IS NULL THEN
    RAISE EXCEPTION 'authentication_required' USING ERRCODE='42501';
  END IF;

  SELECT lower(btrim(u.email)) INTO confirmed_email
  FROM auth.users u
  WHERE u.id=auth.uid() AND u.email_confirmed_at IS NOT NULL;

  IF confirmed_email IS NULL OR confirmed_email <> lower(btrim(coalesce(_email,''))) THEN
    RAISE EXCEPTION 'verified_email_required' USING ERRCODE='42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.customer_profiles cp
    WHERE cp.id=_customer_profile_id
      AND cp.user_id=auth.uid()
      AND lower(btrim(cp.email))=confirmed_email
  ) THEN
    RAISE EXCEPTION 'profile_email_mismatch' USING ERRCODE='42501';
  END IF;

  UPDATE public.orders o
  SET customer_profile_id=_customer_profile_id
  WHERE lower(btrim(o.customer_email))=confirmed_email
    AND o.customer_profile_id IS NULL;

  GET DIAGNOSTICS claimed_count=ROW_COUNT;
  RETURN claimed_count;
END $$;

REVOKE ALL ON FUNCTION public.claim_guest_orders(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_guest_orders(uuid,text) TO authenticated;

-- Merchant media uploads are owner-scoped. Existing public read policy is
-- intentional: these are assets published on public boutique storefronts.
DROP POLICY IF EXISTS "Authenticated users can upload boutique media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update boutique media" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete boutique media" ON storage.objects;
CREATE POLICY "Merchant media owner upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id='boutique-media' AND (storage.foldername(name))[1]=auth.uid()::text
  );
CREATE POLICY "Merchant media owner update" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id='boutique-media' AND (storage.foldername(name))[1]=auth.uid()::text
  ) WITH CHECK (
    bucket_id='boutique-media' AND (storage.foldername(name))[1]=auth.uid()::text
  );
CREATE POLICY "Merchant media owner delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id='boutique-media' AND (storage.foldername(name))[1]=auth.uid()::text
  );

COMMIT;
