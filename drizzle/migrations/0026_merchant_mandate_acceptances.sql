-- Additive, fail-closed evidence store for independently accepted merchant mandates.
-- This migration does not activate any mandate or publish draft contracts.
CREATE TABLE public.merchant_mandate_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_user_id uuid NOT NULL REFERENCES auth.users(id),
  merchant_legal_entity_id uuid NOT NULL,
  mandate_key text NOT NULL CHECK (mandate_key IN ('procurement', 'invoicing', 'sav_assistance')),
  document_version text NOT NULL CHECK (length(btrim(document_version)) BETWEEN 1 AND 100),
  document_sha256 text NOT NULL CHECK (document_sha256 ~ '^[a-f0-9]{64}$'),
  acceptance_label text NOT NULL CHECK (length(btrim(acceptance_label)) BETWEEN 1 AND 1000),
  signer_role text NOT NULL CHECK (length(btrim(signer_role)) BETWEEN 1 AND 200),
  accepted_at timestamptz NOT NULL DEFAULT now(),
  evidence_id uuid NOT NULL UNIQUE,
  revoked_at timestamptz,
  CONSTRAINT merchant_mandate_revocation_after_acceptance
    CHECK (revoked_at IS NULL OR revoked_at >= accepted_at),
  UNIQUE (merchant_user_id, merchant_legal_entity_id, mandate_key, document_version, document_sha256)
);
CREATE INDEX merchant_mandates_lookup
  ON public.merchant_mandate_acceptances(merchant_legal_entity_id, mandate_key, accepted_at DESC);
ALTER TABLE public.merchant_mandate_acceptances ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.merchant_mandate_acceptances FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.merchant_mandate_acceptances TO authenticated;
GRANT ALL ON public.merchant_mandate_acceptances TO service_role;
CREATE POLICY merchant_mandates_select_own
  ON public.merchant_mandate_acceptances FOR SELECT TO authenticated
  USING (merchant_user_id = (SELECT auth.uid()));
-- No INSERT/UPDATE/DELETE policy for browser users. A trusted backend must verify
-- identity, authority, document publication/hash and positive action before recording.
-- Revoke via an audited server-side operation, not by mutating original evidence.
COMMENT ON TABLE public.merchant_mandate_acceptances IS
  'Draft mandate evidence infrastructure; not a signature service or authorization to act.';
