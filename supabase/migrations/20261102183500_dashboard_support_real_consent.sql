-- Dedicated dashboard support intake; never report success for unsaved messages.
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS consent_given_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_notice_version text;

CREATE OR REPLACE FUNCTION public.bib_guard_dashboard_support_ticket()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=public,pg_temp AS $$
DECLARE actor_email text;
BEGIN
  IF NEW.source <> 'dashboard_form' THEN RETURN NEW; END IF;
  IF auth.uid() IS NULL OR NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'dashboard_support_requires_owner';
  END IF;
  SELECT email INTO actor_email FROM auth.users WHERE id=auth.uid();
  IF actor_email IS NULL OR lower(btrim(NEW.contact_email)) <> lower(actor_email) THEN
    RAISE EXCEPTION 'dashboard_support_email_mismatch';
  END IF;
  IF NEW.subject IS NULL OR char_length(btrim(NEW.subject)) NOT BETWEEN 4 AND 160
    OR NEW.message IS NULL OR char_length(btrim(NEW.message)) NOT BETWEEN 10 AND 5000
    OR NEW.consent_given_at IS NULL OR NEW.consent_notice_version <> 'support-v1' THEN
    RAISE EXCEPTION 'dashboard_support_invalid_or_consent_missing';
  END IF;
  -- Serialize per user to prevent a simple concurrent quota bypass.
  PERFORM pg_advisory_xact_lock(hashtext('bib_support_' || auth.uid()::text));
  IF (SELECT count(*) FROM public.support_tickets
      WHERE user_id=auth.uid() AND source='dashboard_form'
        AND created_at >= now()-interval '1 day') >= 5 THEN
    RAISE EXCEPTION 'dashboard_support_daily_limit';
  END IF;
  NEW.status := 'open';
  NEW.boutique_id := NULL;
  NEW.ai_summary := NULL;
  NEW.ai_conversation := NULL;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bib_guard_dashboard_support_ticket ON public.support_tickets;
CREATE TRIGGER bib_guard_dashboard_support_ticket BEFORE INSERT ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.bib_guard_dashboard_support_ticket();
