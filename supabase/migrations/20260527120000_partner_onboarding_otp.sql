-- Partner onboarding: OTP verification + resumable submissions + change history.
-- All access from anon clients goes through SECURITY DEFINER RPCs that
-- validate either an email OTP or a per-submission access_token.

-- =====================================================================
-- 1. partner_email_otps : short-lived 6-digit codes (hashed)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_email_otps (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  portal        text NOT NULL CHECK (portal IN ('suppliers','ops')),
  code_hash     text NOT NULL,
  expires_at    timestamptz NOT NULL,
  attempts      integer NOT NULL DEFAULT 0,
  consumed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_email_otps_email_idx
  ON public.partner_email_otps (lower(email), portal, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.partner_email_otps TO service_role;
ALTER TABLE public.partner_email_otps ENABLE ROW LEVEL SECURITY;
-- No public policies — only the edge functions (service_role) touch this table.

-- =====================================================================
-- 2. partner_onboarding_submissions : the resumable dossier
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_onboarding_submissions (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal             text NOT NULL CHECK (portal IN ('suppliers','ops')),
  contact_email      text NOT NULL,
  contact_name       text,
  company            text,
  access_token       text NOT NULL UNIQUE,
  email_verified_at  timestamptz,
  status             text NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','email_verified','submitted','under_review','approved','rejected')),
  payload            jsonb NOT NULL DEFAULT '{}'::jsonb,
  kyc_attachments    jsonb NOT NULL DEFAULT '[]'::jsonb,
  support_ticket_id  uuid,
  submitted_at       timestamptz,
  approved_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_submissions_email_idx
  ON public.partner_onboarding_submissions (lower(contact_email), portal);
CREATE INDEX IF NOT EXISTS partner_submissions_ticket_idx
  ON public.partner_onboarding_submissions (support_ticket_id);

GRANT SELECT, INSERT, UPDATE ON public.partner_onboarding_submissions TO service_role;
ALTER TABLE public.partner_onboarding_submissions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_partner_submissions_updated_at
  BEFORE UPDATE ON public.partner_onboarding_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- 3. partner_onboarding_history : every change is logged for the Ops team
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.partner_onboarding_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   uuid NOT NULL REFERENCES public.partner_onboarding_submissions(id) ON DELETE CASCADE,
  changed_at      timestamptz NOT NULL DEFAULT now(),
  change_summary  text NOT NULL,
  diff            jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_email     text
);
CREATE INDEX IF NOT EXISTS partner_history_submission_idx
  ON public.partner_onboarding_history (submission_id, changed_at DESC);

GRANT SELECT, INSERT ON public.partner_onboarding_history TO service_role;
ALTER TABLE public.partner_onboarding_history ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 4. RPC : load a submission by access_token (used by resume/portail pages)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.partner_load_submission(_access_token text)
RETURNS TABLE (
  id uuid,
  portal text,
  contact_email text,
  contact_name text,
  company text,
  status text,
  payload jsonb,
  kyc_attachments jsonb,
  support_ticket_id uuid,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, portal, contact_email, contact_name, company, status, payload,
         kyc_attachments, support_ticket_id, submitted_at, approved_at,
         created_at, updated_at
  FROM public.partner_onboarding_submissions
  WHERE access_token = _access_token
    AND email_verified_at IS NOT NULL
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.partner_load_submission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.partner_load_submission(text) TO anon, authenticated;

-- =====================================================================
-- 5. RPC : list change history for a submission (portail "Historique")
-- =====================================================================
CREATE OR REPLACE FUNCTION public.partner_load_history(_access_token text)
RETURNS TABLE (
  id uuid,
  changed_at timestamptz,
  change_summary text,
  diff jsonb,
  actor_email text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.id, h.changed_at, h.change_summary, h.diff, h.actor_email
  FROM public.partner_onboarding_history h
  JOIN public.partner_onboarding_submissions s ON s.id = h.submission_id
  WHERE s.access_token = _access_token
    AND s.email_verified_at IS NOT NULL
  ORDER BY h.changed_at DESC
  LIMIT 100;
$$;

REVOKE ALL ON FUNCTION public.partner_load_history(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.partner_load_history(text) TO anon, authenticated;
