CREATE TABLE public.merchant_legal_acceptances (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_key text NOT NULL CHECK (
    document_key IN ('cgu', 'cgv', 'privacy_ack')
  ),
  document_version text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, document_key, document_version)
);

ALTER TABLE public.merchant_legal_acceptances ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.merchant_legal_acceptances FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.merchant_legal_acceptances TO authenticated;
GRANT ALL ON public.merchant_legal_acceptances TO service_role;

CREATE POLICY merchant_legal_acceptances_read_own
  ON public.merchant_legal_acceptances
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.record_merchant_legal_acceptances()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accepted_versions jsonb;
BEGIN
  IF COALESCE(NEW.raw_user_meta_data ->> 'account_type', 'platform') = 'platform' THEN
    accepted_versions := NEW.raw_user_meta_data -> 'legal_acceptances';

    IF accepted_versions ->> 'cgu' IS DISTINCT FROM '2026-09'
       OR accepted_versions ->> 'cgv' IS DISTINCT FROM '2026-09'
       OR accepted_versions ->> 'privacy' IS DISTINCT FROM '2026-05-17' THEN
      RAISE EXCEPTION
        'L’acceptation des versions courantes des documents légaux est requise pour créer un compte marchand.';
    END IF;

    INSERT INTO public.merchant_legal_acceptances (
      user_id,
      document_key,
      document_version
    )
    VALUES
      (NEW.id, 'cgu', '2026-09'),
      (NEW.id, 'cgv', '2026-09'),
      (NEW.id, 'privacy_ack', '2026-05-17');
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.record_merchant_legal_acceptances()
  FROM PUBLIC, anon, authenticated;

CREATE TRIGGER record_merchant_legal_acceptances_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.record_merchant_legal_acceptances();
