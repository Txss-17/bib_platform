-- Boutique automatic alerts: configurable thresholds + audit log

CREATE TABLE IF NOT EXISTS public.boutique_alert_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  views_drop_pct integer NOT NULL DEFAULT 30,
  ctr_drop_pct numeric NOT NULL DEFAULT 1.5,
  ctr_floor numeric NOT NULL DEFAULT 1.0,
  low_stock_ratio numeric NOT NULL DEFAULT 0.3,
  audits_enabled boolean NOT NULL DEFAULT true,
  notify_email text,
  email_enabled boolean NOT NULL DEFAULT true,
  period_days integer NOT NULL DEFAULT 7,
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.boutique_alert_settings TO authenticated;
GRANT ALL ON public.boutique_alert_settings TO service_role;

ALTER TABLE public.boutique_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages alert settings"
ON public.boutique_alert_settings FOR ALL
TO authenticated
USING (public.owns_boutique(auth.uid(), boutique_id))
WITH CHECK (public.owns_boutique(auth.uid(), boutique_id));

CREATE TABLE IF NOT EXISTS public.boutique_alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL,
  type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  title text NOT NULL,
  message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  email_status text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS boutique_alert_log_boutique_idx
  ON public.boutique_alert_log (boutique_id, created_at DESC);

GRANT SELECT, UPDATE ON public.boutique_alert_log TO authenticated;
GRANT ALL ON public.boutique_alert_log TO service_role;

ALTER TABLE public.boutique_alert_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads alert log"
ON public.boutique_alert_log FOR SELECT
TO authenticated
USING (public.owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Owner can mark alerts resolved"
ON public.boutique_alert_log FOR UPDATE
TO authenticated
USING (public.owns_boutique(auth.uid(), boutique_id))
WITH CHECK (public.owns_boutique(auth.uid(), boutique_id));
