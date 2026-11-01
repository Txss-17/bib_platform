-- Real per-boutique alert settings and history. Store owners only.
CREATE TABLE IF NOT EXISTS public.boutique_alert_settings (
  boutique_id uuid PRIMARY KEY REFERENCES public.boutiques(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  views_drop_pct numeric NOT NULL DEFAULT 30 CHECK (views_drop_pct BETWEEN 5 AND 90),
  ctr_drop_pct numeric NOT NULL DEFAULT 1.5 CHECK (ctr_drop_pct BETWEEN 0 AND 100),
  ctr_floor numeric NOT NULL DEFAULT 1 CHECK (ctr_floor BETWEEN 0 AND 100),
  low_stock_ratio numeric NOT NULL DEFAULT 0.3 CHECK (low_stock_ratio BETWEEN 0 AND 1),
  audits_enabled boolean NOT NULL DEFAULT true,
  notify_email text,
  email_enabled boolean NOT NULL DEFAULT false,
  period_days integer NOT NULL DEFAULT 7 CHECK (period_days IN (7,14,30)),
  last_checked_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notification_email_format CHECK (
    notify_email IS NULL OR
    (length(notify_email) <= 254 AND notify_email ~* '^[^[:space:]@<>]+@[^[:space:]@<>]+[.][^[:space:]@<>]+$')
  )
);
CREATE TABLE IF NOT EXISTS public.boutique_alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('views_drop','ctr_drop','low_stock','audit')),
  severity text NOT NULL CHECK (severity IN ('info','warning','critical')),
  title text NOT NULL,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  email_status text CHECK (email_status IS NULL OR email_status IN ('sent','failed','skipped','not_configured')),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS boutique_alert_log_recent_idx ON public.boutique_alert_log(boutique_id,created_at DESC);
ALTER TABLE public.boutique_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boutique_alert_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Merchant manages own alert settings" ON public.boutique_alert_settings;
CREATE POLICY "Merchant manages own alert settings" ON public.boutique_alert_settings
FOR ALL TO authenticated
USING (public.owns_boutique(auth.uid(),boutique_id) AND public.bib_has_portal('platform'))
WITH CHECK (public.owns_boutique(auth.uid(),boutique_id) AND public.bib_has_portal('platform'));
DROP POLICY IF EXISTS "Merchant reads own alert history" ON public.boutique_alert_log;
CREATE POLICY "Merchant reads own alert history" ON public.boutique_alert_log
FOR SELECT TO authenticated USING(public.owns_boutique(auth.uid(),boutique_id) AND public.bib_has_portal('platform'));
DROP POLICY IF EXISTS "Merchant records own alerts" ON public.boutique_alert_log;
CREATE POLICY "Merchant records own alerts" ON public.boutique_alert_log
FOR INSERT TO authenticated WITH CHECK(public.owns_boutique(auth.uid(),boutique_id) AND public.bib_has_portal('platform'));
DROP POLICY IF EXISTS "Merchant resolves own alerts" ON public.boutique_alert_log;
CREATE POLICY "Merchant resolves own alerts" ON public.boutique_alert_log
FOR UPDATE TO authenticated USING(public.owns_boutique(auth.uid(),boutique_id) AND public.bib_has_portal('platform'))
WITH CHECK(public.owns_boutique(auth.uid(),boutique_id) AND public.bib_has_portal('platform'));
REVOKE ALL ON public.boutique_alert_settings,public.boutique_alert_log FROM anon;
GRANT SELECT,INSERT,UPDATE ON public.boutique_alert_settings,public.boutique_alert_log TO authenticated;
