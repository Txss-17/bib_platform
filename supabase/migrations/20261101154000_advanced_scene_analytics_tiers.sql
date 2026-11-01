-- Detailed scene analytics are available only to Growth/Pro boutique owners.
-- Public scene telemetry INSERT remains governed by its independent policy.
-- Starter retains general KPI access from other permitted aggregations.
DROP POLICY IF EXISTS "Owners can read scene events" ON public.scene_events;
CREATE POLICY "Growth and Pro owners read scene analytics"
ON public.scene_events FOR SELECT TO authenticated
USING (
  public.owns_boutique(auth.uid(), boutique_id)
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.plan_tier::text IN ('growth','pro')
  )
);
