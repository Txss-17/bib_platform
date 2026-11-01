-- Only trusted server-side billing workflows may change paid plan entitlements.
CREATE OR REPLACE FUNCTION public.bib_guard_profile_entitlements()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.plan_tier IS DISTINCT FROM OLD.plan_tier
     OR NEW.plan_billing_cycle IS DISTINCT FROM OLD.plan_billing_cycle
     OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.trust_score IS DISTINCT FROM OLD.trust_score
     OR NEW.green_addon_enabled IS DISTINCT FROM OLD.green_addon_enabled
     OR NEW.insurance_addon_enabled IS DISTINCT FROM OLD.insurance_addon_enabled
  THEN
    RAISE EXCEPTION 'server_only_profile_entitlements' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END
$$;
DROP TRIGGER IF EXISTS bib_guard_profile_entitlements ON public.profiles;
CREATE TRIGGER bib_guard_profile_entitlements
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.bib_guard_profile_entitlements();
