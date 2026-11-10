-- Time-bound legacy dossier bearer. Apply only after verifying the OTP issuance
-- Edge Functions and portal read/action endpoints are deployed compatibly.
-- Existing unexpired/unknown legacy URLs intentionally require a fresh OTP:
-- NULL access_token_expires_at is never accepted.
ALTER TABLE public.partner_onboarding_submissions
  ADD COLUMN IF NOT EXISTS access_token_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS partner_submissions_token_expiry_idx
  ON public.partner_onboarding_submissions (access_token_expires_at)
  WHERE access_token IS NOT NULL;

-- Application / onboarding reads: exact same column interface as the legacy RPC.
CREATE OR REPLACE FUNCTION public.partner_load_submission(_access_token text)
RETURNS TABLE (
  id uuid, portal text, contact_email text, contact_name text,
  company text, status text, payload jsonb, kyc_attachments jsonb,
  support_ticket_id uuid, submitted_at timestamptz, approved_at timestamptz,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT s.id,s.portal,s.contact_email,s.contact_name,s.company,s.status,
    s.payload,s.kyc_attachments,s.support_ticket_id,s.submitted_at,
    s.approved_at,s.created_at,s.updated_at
  FROM public.partner_onboarding_submissions s
  WHERE s.access_token=_access_token
    AND s.email_verified_at IS NOT NULL
    AND s.access_token_expires_at > now()
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.partner_load_submission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.partner_load_submission(text) TO anon,authenticated;

-- History is scoped to the same currently valid session.
CREATE OR REPLACE FUNCTION public.partner_load_history(_access_token text)
RETURNS TABLE (
  id uuid, changed_at timestamptz, change_summary text,
  diff jsonb, actor_email text
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT h.id,h.changed_at,h.change_summary,h.diff,h.actor_email
  FROM public.partner_onboarding_history h
  JOIN public.partner_onboarding_submissions s ON s.id=h.submission_id
  WHERE s.access_token=_access_token
    AND s.email_verified_at IS NOT NULL
    AND s.access_token_expires_at > now()
  ORDER BY h.changed_at DESC LIMIT 100;
$$;
REVOKE ALL ON FUNCTION public.partner_load_history(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.partner_load_history(text) TO anon,authenticated;

-- Operational portal: no raw submission JSON and no indefinite bearer.
CREATE OR REPLACE FUNCTION public.partner_load_operational_portal(_access_token text)
RETURNS TABLE (submission jsonb, documents jsonb, events jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp
AS $$
DECLARE _sub public.partner_onboarding_submissions%ROWTYPE;
BEGIN
  IF _access_token IS NULL OR length(_access_token) < 16 THEN RETURN; END IF;
  SELECT * INTO _sub FROM public.partner_onboarding_submissions
  WHERE access_token=_access_token
    AND status='approved'
    AND email_verified_at IS NOT NULL
    AND access_token_expires_at > now()
    AND portal IN('suppliers','ops')
  LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;
  RETURN QUERY SELECT
    jsonb_build_object('id',_sub.id,'portal',_sub.portal,
      'contact_email',_sub.contact_email,'contact_name',_sub.contact_name,
      'company',_sub.company,'status',_sub.status,'payload','{}'::jsonb,
      'approved_at',_sub.approved_at,'submitted_at',_sub.submitted_at),
    coalesce((SELECT jsonb_agg(jsonb_build_object(
      'id',d.id,'category',d.category,'file_name',d.file_name,
      'storage_path',d.storage_path,'mime_type',d.mime_type,
      'byte_size',d.byte_size,'status',d.status,'created_at',d.created_at
    ) ORDER BY d.created_at DESC) FROM public.partner_portal_documents d
      WHERE d.submission_id=_sub.id),'[]'::jsonb),
    coalesce((SELECT jsonb_agg(jsonb_build_object(
      'id',e.id,'portal',e.portal,'kind',e.kind,'title',e.title,
      'payload',e.payload,'status',e.status,'created_at',e.created_at,
      'updated_at',e.updated_at
    ) ORDER BY e.created_at DESC) FROM public.partner_portal_events e
      WHERE e.submission_id=_sub.id AND e.portal=_sub.portal),'[]'::jsonb);
END; $$;
REVOKE ALL ON FUNCTION public.partner_load_operational_portal(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.partner_load_operational_portal(text) TO anon,authenticated;

COMMENT ON COLUMN public.partner_onboarding_submissions.access_token_expires_at
  IS 'Two-hour OTP-issued dossier bearer expiration. NULL means access denied until fresh verification; not a contract approval.';
