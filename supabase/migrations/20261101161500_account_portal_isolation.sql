-- Immutable, server-maintained account portal classification.
-- Never authorize merchant functions based on user_metadata.account_type:
-- users can edit their own user metadata and can forge it at signup.
-- Existing account bootstrap: current merchant owns an existing boutique;
-- all other existing accounts are Store customers until staff provision them.
-- Future public signups default to Store. Partner access uses separate approved tokens.
BEGIN;
CREATE TABLE IF NOT EXISTS public.account_portals (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 portal text NOT NULL DEFAULT 'store' CHECK (portal IN ('store','platform')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.account_portals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Account holder reads own portal" ON public.account_portals;
CREATE POLICY "Account holder reads own portal"
 ON public.account_portals FOR SELECT TO authenticated
 USING (auth.uid()=user_id);
REVOKE ALL ON public.account_portals FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.account_portals TO authenticated;
GRANT ALL ON public.account_portals TO service_role;

INSERT INTO public.account_portals(user_id,portal)
SELECT u.id,
 CASE WHEN EXISTS(SELECT 1 FROM public.boutiques b WHERE b.user_id=u.id)
 THEN 'platform' ELSE 'store' END
FROM auth.users u
ON CONFLICT(user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.bib_new_account_store_only()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 INSERT INTO public.account_portals(user_id,portal)
 VALUES (NEW.id,'store') ON CONFLICT(user_id) DO NOTHING;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS bib_new_account_store_only ON auth.users;
CREATE TRIGGER bib_new_account_store_only AFTER INSERT ON auth.users
 FOR EACH ROW EXECUTE FUNCTION public.bib_new_account_store_only();

CREATE OR REPLACE FUNCTION public.bib_has_portal(requested text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT EXISTS (
  SELECT 1 FROM public.account_portals
   WHERE user_id=auth.uid() AND portal=requested
 );
$$;
REVOKE ALL ON FUNCTION public.bib_has_portal(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bib_has_portal(text) TO authenticated;

-- Merchant mutations must be made only by a trusted platform account.
DROP POLICY IF EXISTS "Users can create their own boutiques" ON public.boutiques;
CREATE POLICY "Merchants create their own boutiques"
 ON public.boutiques FOR INSERT TO authenticated
 WITH CHECK (auth.uid()=user_id AND public.bib_has_portal('platform'));
DROP POLICY IF EXISTS "Users can update their own boutiques" ON public.boutiques;
CREATE POLICY "Merchants update their own boutiques"
 ON public.boutiques FOR UPDATE TO authenticated
 USING (auth.uid()=user_id AND public.bib_has_portal('platform'))
 WITH CHECK (auth.uid()=user_id AND public.bib_has_portal('platform'));
DROP POLICY IF EXISTS "Users can delete their own boutiques" ON public.boutiques;
CREATE POLICY "Merchants delete their own boutiques"
 ON public.boutiques FOR DELETE TO authenticated
 USING (auth.uid()=user_id AND public.bib_has_portal('platform'));
COMMIT;
