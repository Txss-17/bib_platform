-- SECURITY PATCH (additive): operational partner portal is a minimally scoped projection.
-- The legacy RPC returned to_jsonb(_sub), including its access_token, KYC
-- attachments and potentially other internal onboarding fields. Never echo the
-- credential used to authorize a request.
--
-- This does not solve bearer-token lifetime, URL leakage or post-contract
-- invitation approval. Those are handled by a separate session migration.
CREATE OR REPLACE FUNCTION public.partner_load_operational_portal(_access_token text)
RETURNS TABLE (submission jsonb, documents jsonb, events jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE _sub public.partner_onboarding_submissions%ROWTYPE;
BEGIN
  IF _access_token IS NULL OR length(_access_token) < 16 THEN RETURN; END IF;
  SELECT * INTO _sub
  FROM public.partner_onboarding_submissions
  WHERE access_token = _access_token
    AND status = 'approved'
    AND email_verified_at IS NOT NULL
    AND portal IN ('suppliers','ops')
  LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  RETURN QUERY
  SELECT
    jsonb_build_object(
      'id',_sub.id,
      'portal',_sub.portal,
      'contact_email',_sub.contact_email,
      'contact_name',_sub.contact_name,
      'company',_sub.company,
      'status',_sub.status,
      'payload','{}'::jsonb,
      'approved_at',_sub.approved_at,
      'submitted_at',_sub.submitted_at
    ),
    coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id',d.id,'category',d.category,'file_name',d.file_name,
        'storage_path',d.storage_path,'mime_type',d.mime_type,
        'byte_size',d.byte_size,'status',d.status,'created_at',d.created_at
      ) ORDER BY d.created_at DESC)
      FROM public.partner_portal_documents d
      WHERE d.submission_id=_sub.id
    ),'[]'::jsonb),
    coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'id',e.id,'portal',e.portal,'kind',e.kind,
        'title',e.title,'payload',e.payload,'status',e.status,
        'created_at',e.created_at,'updated_at',e.updated_at
      ) ORDER BY e.created_at DESC)
      FROM public.partner_portal_events e
      WHERE e.submission_id=_sub.id AND e.portal=_sub.portal
    ),'[]'::jsonb);
END; $$;

REVOKE ALL ON FUNCTION public.partner_load_operational_portal(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.partner_load_operational_portal(text) TO anon, authenticated;
COMMENT ON FUNCTION public.partner_load_operational_portal(text)
 IS 'Verified approved operational partner only; no bearer tokens, KYC documents, internal notes or unrestricted submission dump.';
