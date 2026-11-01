-- Pro-only setting. This does not provision or verify custom-domain DNS.
CREATE OR REPLACE FUNCTION public.guard_pro_seo_public_origin()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE
  owner_id uuid;
BEGIN
  IF TG_OP='UPDATE' AND NEW.seo_public_origin IS NOT DISTINCT FROM OLD.seo_public_origin THEN
    RETURN NEW;
  END IF;
  IF NEW.seo_public_origin IS NULL OR auth.role()='service_role' THEN
    RETURN NEW;
  END IF;
  owner_id := CASE WHEN TG_OP='UPDATE' THEN OLD.user_id ELSE NEW.user_id END;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id=owner_id AND p.plan_tier::text='pro'
  ) THEN
    RAISE EXCEPTION 'pro_plan_required_for_custom_domain' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_pro_seo_public_origin ON public.boutiques;
CREATE TRIGGER guard_pro_seo_public_origin
BEFORE INSERT OR UPDATE OF seo_public_origin ON public.boutiques
FOR EACH ROW EXECUTE FUNCTION public.guard_pro_seo_public_origin();
