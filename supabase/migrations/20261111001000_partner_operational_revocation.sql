-- Controlled operational revocation. A verified mailbox or an approved
-- application alone is NOT proof of operational authorization.
-- This adds an immediate fail-closed kill switch without altering the
-- pre-contract application and documentary onboarding workflow.
ALTER TABLE public.partner_onboarding_submissions
  ADD COLUMN IF NOT EXISTS operational_access_revoked_at timestamptz;

CREATE TABLE IF NOT EXISTS public.partner_portal_revocation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.partner_onboarding_submissions(id),
  reason text NOT NULL CHECK (length(btrim(reason)) BETWEEN 8 AND 1000),
  revoked_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.partner_portal_revocation_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.partner_portal_revocation_events FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.partner_portal_revocation_events TO service_role;

-- Service role is the only actor authorized to receive a verified revocation
-- instruction through a separately authenticated internal integration.
CREATE OR REPLACE FUNCTION public.revoke_partner_portal_operations(
  p_submission_id uuid, p_reason text
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path=public,pg_temp AS $$
DECLARE v_id uuid;
BEGIN
  IF p_submission_id IS NULL OR length(btrim(coalesce(p_reason,''))) NOT BETWEEN 8 AND 1000
  THEN RAISE EXCEPTION 'invalid_revocation' USING ERRCODE='22023'; END IF;
  SELECT id INTO v_id FROM public.partner_onboarding_submissions
  WHERE id=p_submission_id AND portal IN('suppliers','ops') FOR UPDATE;
  IF v_id IS NULL THEN RETURN false; END IF;
  UPDATE public.partner_onboarding_submissions
  SET operational_access_revoked_at=coalesce(operational_access_revoked_at,now())
  WHERE id=v_id;
  INSERT INTO public.partner_portal_revocation_events(submission_id,reason)
  VALUES(v_id,btrim(p_reason));
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.revoke_partner_portal_operations(uuid,text)
  FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_partner_portal_operations(uuid,text) TO service_role;

-- Replace the operational projection with a revocation-aware version.
CREATE OR REPLACE FUNCTION public.partner_load_operational_portal(_access_token text)
RETURNS TABLE (submission jsonb, documents jsonb, events jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE _sub public.partner_onboarding_submissions%ROWTYPE;
BEGIN
  IF _access_token IS NULL OR length(_access_token) < 16 THEN RETURN; END IF;
  SELECT * INTO _sub FROM public.partner_onboarding_submissions
  WHERE access_token=_access_token
    AND status='approved'
    AND email_verified_at IS NOT NULL
    AND access_token_expires_at>now()
    AND operational_access_revoked_at IS NULL
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
END $$;
REVOKE ALL ON FUNCTION public.partner_load_operational_portal(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.partner_load_operational_portal(text) TO anon,authenticated;

COMMENT ON FUNCTION public.revoke_partner_portal_operations(uuid,text)
 IS 'Service-only operational suspension; does not erase the partner candidature or signed contract.';
