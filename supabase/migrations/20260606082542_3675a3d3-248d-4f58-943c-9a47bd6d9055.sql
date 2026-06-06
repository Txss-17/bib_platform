
-- Settings (idempotent over v1 + v2 + v3)
CREATE TABLE IF NOT EXISTS public.onboarding_reminders_settings (
  user_id uuid PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_reminders_settings
  ADD COLUMN IF NOT EXISTS delay_hours integer NOT NULL DEFAULT 48,
  ADD COLUMN IF NOT EXISTS max_reminders integer NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Europe/Paris',
  ADD COLUMN IF NOT EXISTS role_seller_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS role_team_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS persona_seller_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS persona_team_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS custom_subject text,
  ADD COLUMN IF NOT EXISTS custom_preheader text,
  ADD COLUMN IF NOT EXISTS custom_cta_label text,
  ADD COLUMN IF NOT EXISTS per_step_rules jsonb NOT NULL DEFAULT '{}'::jsonb;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_reminders_settings TO authenticated;
GRANT ALL ON public.onboarding_reminders_settings TO service_role;

ALTER TABLE public.onboarding_reminders_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='onboarding_reminders_settings'
      AND policyname='Users manage own reminder settings'
  ) THEN
    CREATE POLICY "Users manage own reminder settings"
      ON public.onboarding_reminders_settings
      FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_onboarding_reminders_settings_updated_at
  ON public.onboarding_reminders_settings;
CREATE TRIGGER set_onboarding_reminders_settings_updated_at
  BEFORE UPDATE ON public.onboarding_reminders_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.onboarding_reminders_settings_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.delay_hours IS NULL OR NEW.delay_hours < 1 THEN NEW.delay_hours := 1; END IF;
  IF NEW.delay_hours > 720 THEN NEW.delay_hours := 720; END IF;
  IF NEW.max_reminders IS NULL OR NEW.max_reminders < 1 THEN NEW.max_reminders := 1; END IF;
  IF NEW.max_reminders > 10 THEN NEW.max_reminders := 10; END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS onboarding_reminders_settings_validate_trg
  ON public.onboarding_reminders_settings;
CREATE TRIGGER onboarding_reminders_settings_validate_trg
  BEFORE INSERT OR UPDATE ON public.onboarding_reminders_settings
  FOR EACH ROW EXECUTE FUNCTION public.onboarding_reminders_settings_validate();

-- Log (idempotent over v1 + v2 + v3)
CREATE TABLE IF NOT EXISTS public.onboarding_reminders_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  step_key text NOT NULL,
  attempt_no integer NOT NULL DEFAULT 1,
  sent_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_reminders_log
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS step_label text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'cron',
  ADD COLUMN IF NOT EXISTS detail text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz;

GRANT SELECT ON public.onboarding_reminders_log TO authenticated;
GRANT ALL ON public.onboarding_reminders_log TO service_role;

ALTER TABLE public.onboarding_reminders_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='onboarding_reminders_log'
      AND policyname='Users read own reminder log'
  ) THEN
    CREATE POLICY "Users read own reminder log"
      ON public.onboarding_reminders_log
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_onboarding_reminders_log_user_step
  ON public.onboarding_reminders_log (user_id, step_key, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_reminders_log_user_sent
  ON public.onboarding_reminders_log (user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_reminders_log_role
  ON public.onboarding_reminders_log (user_id, role, sent_at DESC);

-- Daily cron fallback at 10:00 UTC
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'onboarding-reminders-daily') THEN
    PERFORM cron.schedule(
      'onboarding-reminders-daily',
      '0 10 * * *',
      $cron$
      SELECT net.http_post(
        url := 'https://lfsiwtpctqxpzyskakey.supabase.co/functions/v1/onboarding-reminders',
        headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmc2l3dHBjdHF4cHp5c2tha2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Mjc3NzMsImV4cCI6MjA4NTIwMzc3M30.12ueKqvtO_Lp1R4VHNdQjWyF6mzsYru8LBDwlxQDPUw"}'::jsonb,
        body := '{"source":"cron"}'::jsonb
      );
      $cron$
    );
  END IF;
END $$;
