-- Starter has no team workspace. Growth and Pro can manage a boutique team.
-- Preserve actual member visibility for accepted staff.
DROP POLICY IF EXISTS "Boutique owners can manage members" ON public.boutique_members;
CREATE POLICY "Growth Pro owners manage team"
 ON public.boutique_members FOR ALL TO authenticated
 USING (
  public.owns_boutique(auth.uid(),boutique_id)
  AND EXISTS(
   SELECT 1 FROM public.profiles p
   WHERE p.user_id=auth.uid() AND p.plan_tier::text IN ('growth','pro')
  )
 )
 WITH CHECK (
  public.owns_boutique(auth.uid(),boutique_id)
  AND EXISTS(
   SELECT 1 FROM public.profiles p
   WHERE p.user_id=auth.uid() AND p.plan_tier::text IN ('growth','pro')
  )
 );

CREATE OR REPLACE FUNCTION public.bib_enforce_team_limits()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
 owner_id uuid;
 tier text;
 used_seats int;
 allowed int;
BEGIN
 IF NEW.status='removed' THEN RETURN NEW; END IF;
 SELECT b.user_id INTO owner_id FROM public.boutiques b WHERE b.id=NEW.boutique_id;
 SELECT p.plan_tier::text INTO tier FROM public.profiles p WHERE p.user_id=owner_id;
 IF tier NOT IN ('growth','pro') OR tier IS NULL THEN
  RAISE EXCEPTION 'team_requires_growth_or_pro' USING ERRCODE='42501';
 END IF;
 IF NEW.role='owner' AND auth.role() <> 'service_role' THEN
  RAISE EXCEPTION 'owner_role_reserved' USING ERRCODE='42501';
 END IF;
 allowed:=CASE WHEN tier='growth' THEN 3 ELSE 10 END;
 PERFORM pg_advisory_xact_lock(hashtextextended(NEW.boutique_id::text,11));
 SELECT COUNT(*) INTO used_seats FROM public.boutique_members m
 WHERE m.boutique_id=NEW.boutique_id AND m.status <> 'removed'
   AND (TG_OP='INSERT' OR m.id <> NEW.id);
 IF used_seats >= allowed THEN
  RAISE EXCEPTION 'team_member_limit_reached' USING ERRCODE='42501';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS enforce_team_limits ON public.boutique_members;
CREATE TRIGGER enforce_team_limits BEFORE INSERT OR UPDATE OF status,role
 ON public.boutique_members FOR EACH ROW EXECUTE FUNCTION public.bib_enforce_team_limits();
UPDATE public.plans SET features=features || '["Gestion d’équipe et rôles"]'::jsonb
 WHERE tier::text IN ('growth','pro') AND NOT features @> '["Gestion d’équipe et rôles"]'::jsonb;
