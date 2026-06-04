-- Onboarding stuck-step email reminders
CREATE TABLE IF NOT EXISTS public.onboarding_reminders_settings (
  user_id uuid PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_reminders_settings TO authenticated;
GRANT ALL ON public.onboarding_reminders_settings TO service_role;

ALTER TABLE public.onboarding_reminders_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reminder settings"
  ON public.onboarding_reminders_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_onboarding_reminders_settings_updated_at
  BEFORE UPDATE ON public.onboarding_reminders_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.onboarding_reminders_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  step_key text NOT NULL,
  attempt_no integer NOT NULL DEFAULT 1,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_reminders_log_user_step
  ON public.onboarding_reminders_log (user_id, step_key, sent_at DESC);

GRANT SELECT ON public.onboarding_reminders_log TO authenticated;
GRANT ALL ON public.onboarding_reminders_log TO service_role;

ALTER TABLE public.onboarding_reminders_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reminder log"
  ON public.onboarding_reminders_log
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Daily cron at 10:00 UTC
SELECT cron.schedule(
  'onboarding-reminders-daily',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url := 'https://lfsiwtpctqxpzyskakey.supabase.co/functions/v1/onboarding-reminders',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmc2l3dHBjdHF4cHp5c2tha2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjc3NzMsImV4cCI6MjA4NTIwMzc3M30.12ueKqvtO_Lp1R4VHNdQjWyF6mzsYru8LBDwlxQDPUw"}'::jsonb,
    body := '{"source":"cron"}'::jsonb
  );
  $$
);
