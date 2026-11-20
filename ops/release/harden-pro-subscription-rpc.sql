-- Security hotfix for issue #53. Apply with the reviewed release process, not by
-- replaying the historical Supabase migrations or editing the Drizzle ledger.
-- Restrict Pro entitlement lookups to the JWT subject or trusted service_role.
-- The existing private-sale trigger calls this function for the owning merchant.
-- create-pos-checkout uses a service_role admin client and must remain functional.
BEGIN;
CREATE OR REPLACE FUNCTION public.bib_has_active_pro_subscription(
  p_user_id uuid,
  p_environment text DEFAULT 'live'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT (
    (SELECT auth.role()) = 'service_role'
    OR (
      (SELECT auth.uid()) IS NOT NULL
      AND (SELECT auth.uid()) = p_user_id
    )
  ) AND EXISTS (
    SELECT 1
    FROM public.profiles pr
    JOIN public.subscriptions sub ON sub.user_id = pr.user_id
    WHERE pr.user_id = p_user_id
      AND pr.plan_tier::text = 'pro'
      AND sub.environment = p_environment
      AND sub.status IN ('active', 'trialing')
      AND (sub.current_period_end IS NULL OR sub.current_period_end > now())
  );
$function$;
REVOKE ALL ON FUNCTION public.bib_has_active_pro_subscription(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.bib_has_active_pro_subscription(uuid,text) TO authenticated, service_role;
COMMIT;
