-- Persist account-level notification preferences and per-boutique payout instructions.
-- No banking credentials or actual payout initiation are stored here.
CREATE TABLE IF NOT EXISTS public.account_notification_preferences (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 security_emails boolean NOT NULL DEFAULT true,
 account_updates boolean NOT NULL DEFAULT true,
 platform_announcements boolean NOT NULL DEFAULT false,
 weekly_digest boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.account_notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own notification preferences" ON public.account_notification_preferences;
DROP POLICY IF EXISTS "Users create own notification preferences" ON public.account_notification_preferences;
DROP POLICY IF EXISTS "Users update own notification preferences" ON public.account_notification_preferences;
CREATE POLICY "Users read own notification preferences" ON public.account_notification_preferences FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE POLICY "Users create own notification preferences" ON public.account_notification_preferences FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND public.bib_has_portal('platform'));
CREATE POLICY "Users update own notification preferences" ON public.account_notification_preferences FOR UPDATE TO authenticated USING(user_id=auth.uid() AND public.bib_has_portal('platform')) WITH CHECK(user_id=auth.uid() AND public.bib_has_portal('platform'));
-- Mandatory security and transactional messages are not disabled by personal preferences.
CREATE OR REPLACE FUNCTION public.bib_enforce_security_notification()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
 NEW.security_emails:=true;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS enforce_security_notification ON public.account_notification_preferences;
CREATE TRIGGER enforce_security_notification BEFORE INSERT OR UPDATE ON public.account_notification_preferences FOR EACH ROW EXECUTE FUNCTION public.bib_enforce_security_notification();

CREATE TABLE IF NOT EXISTS public.boutique_payout_preferences (
 boutique_id uuid PRIMARY KEY REFERENCES public.boutiques(id) ON DELETE CASCADE,
 payout_frequency text NOT NULL DEFAULT 'semi_monthly'
   CHECK(payout_frequency IN ('semi_monthly','monthly')),
 beneficiary_name text,
 payout_contact_email text,
 country_code text NOT NULL DEFAULT 'FR' CHECK(country_code ~ '^[A-Z]{2}$'),
 currency text NOT NULL DEFAULT 'EUR' CHECK(currency='EUR'),
 status text NOT NULL DEFAULT 'pending_verification' CHECK(status IN ('pending_verification','verified')),
 verified_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.boutique_payout_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners read boutique payout preferences" ON public.boutique_payout_preferences;
DROP POLICY IF EXISTS "Owners create boutique payout preferences" ON public.boutique_payout_preferences;
DROP POLICY IF EXISTS "Owners update boutique payout preferences" ON public.boutique_payout_preferences;
CREATE POLICY "Owners read boutique payout preferences" ON public.boutique_payout_preferences FOR SELECT TO authenticated USING(public.owns_boutique(auth.uid(),boutique_id));
CREATE POLICY "Owners create boutique payout preferences" ON public.boutique_payout_preferences FOR INSERT TO authenticated WITH CHECK(public.owns_boutique(auth.uid(),boutique_id) AND public.bib_has_portal('platform'));
CREATE POLICY "Owners update boutique payout preferences" ON public.boutique_payout_preferences FOR UPDATE TO authenticated USING(public.owns_boutique(auth.uid(),boutique_id) AND public.bib_has_portal('platform')) WITH CHECK(public.owns_boutique(auth.uid(),boutique_id));
CREATE OR REPLACE FUNCTION public.bib_guard_payout_verification()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
 IF auth.role() <> 'service_role' THEN
  NEW.status:='pending_verification';
  NEW.verified_at:=NULL;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_payout_verification ON public.boutique_payout_preferences;
CREATE TRIGGER guard_payout_verification BEFORE INSERT OR UPDATE ON public.boutique_payout_preferences FOR EACH ROW EXECUTE FUNCTION public.bib_guard_payout_verification();
