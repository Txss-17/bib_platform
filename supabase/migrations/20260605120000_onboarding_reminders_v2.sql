-- Extend onboarding reminders: settings + log status tracking
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
  ADD COLUMN IF NOT EXISTS custom_cta_label text;

CREATE OR REPLACE FUNCTION public.onboarding_reminders_settings_validate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.delay_hours IS NULL OR NEW.delay_hours < 1 THEN NEW.delay_hours := 1; END IF;
  IF NEW.delay_hours > 720 THEN NEW.delay_hours := 720; END IF;
  IF NEW.max_reminders IS NULL OR NEW.max_reminders < 1 THEN NEW.max_reminders := 1; END IF;
  IF NEW.max_reminders > 10 THEN NEW.max_reminders := 10; END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS onboarding_reminders_settings_validate_trg
  ON public.onboarding_reminders_settings;
CREATE TRIGGER onboarding_reminders_settings_validate_trg
  BEFORE INSERT OR UPDATE ON public.onboarding_reminders_settings
  FOR EACH ROW EXECUTE FUNCTION public.onboarding_reminders_settings_validate();

ALTER TABLE public.onboarding_reminders_log
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS step_label text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'cron',
  ADD COLUMN IF NOT EXISTS detail text;

CREATE INDEX IF NOT EXISTS idx_onboarding_reminders_log_user_sent
  ON public.onboarding_reminders_log (user_id, sent_at DESC);
