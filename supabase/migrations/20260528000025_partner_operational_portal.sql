-- Partner operational portals (Lot 4) — surface for approved supplier & ops
-- partners: ad-hoc documents, catalog drafts, in-portal signals.

CREATE TABLE IF NOT EXISTS public.partner_portal_documents (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id  uuid NOT NULL REFERENCES public.partner_onboarding_submissions(id) ON DELETE CASCADE,
  category       text NOT NULL,
  file_name      text NOT NULL,
  storage_path   text NOT NULL,
  mime_type      text,
  byte_size      integer,
  status         text NOT NULL DEFAULT 'received'
                 CHECK (status IN ('received','validated','rejected')),
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_portal_documents_sub_idx
  ON public.partner_portal_documents (submission_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.partner_portal_documents TO service_role;
ALTER TABLE public.partner_portal_documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.partner_portal_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id  uuid NOT NULL REFERENCES public.partner_onboarding_submissions(id) ON DELETE CASCADE,
  portal         text NOT NULL CHECK (portal IN ('suppliers','ops')),
  kind           text NOT NULL CHECK (kind IN (
                   'catalog_draft','moq_request','issue_report',
                   'delivery_update','packaging_alert','return_logged'
                 )),
  title          text NOT NULL,
  payload        jsonb NOT NULL DEFAULT '{}'::jsonb,
  status         text NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open','in_progress','resolved','rejected')),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS partner_portal_events_sub_idx
  ON public.partner_portal_events (submission_id, created_at DESC);
CREATE INDEX IF NOT EXISTS partner_portal_events_kind_idx
  ON public.partner_portal_events (portal, kind, status);
GRANT SELECT, INSERT, UPDATE ON public.partner_portal_events TO service_role;
ALTER TABLE public.partner_portal_events ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_partner_portal_events_updated_at
  BEFORE UPDATE ON public.partner_portal_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.partner_load_operational_portal(_access_token text)
RETURNS TABLE (
  submission jsonb,
  documents  jsonb,
  events     jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sub public.partner_onboarding_submissions%ROWTYPE;
BEGIN
  SELECT * INTO _sub
  FROM public.partner_onboarding_submissions
  WHERE access_token = _access_token
  LIMIT 1;

  IF NOT FOUND OR _sub.status <> 'approved' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    to_jsonb(_sub) AS submission,
    COALESCE((
      SELECT jsonb_agg(to_jsonb(d) ORDER BY d.created_at DESC)
      FROM public.partner_portal_documents d
      WHERE d.submission_id = _sub.id
    ), '[]'::jsonb) AS documents,
    COALESCE((
      SELECT jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC)
      FROM public.partner_portal_events e
      WHERE e.submission_id = _sub.id
    ), '[]'::jsonb) AS events;
END;
$$;

GRANT EXECUTE ON FUNCTION public.partner_load_operational_portal(text) TO anon, authenticated;
