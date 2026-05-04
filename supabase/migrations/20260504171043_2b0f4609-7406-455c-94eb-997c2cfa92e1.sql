REVOKE EXECUTE ON FUNCTION public.scene_analytics_summary(UUID, TIMESTAMPTZ) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.scene_analytics_summary(UUID, TIMESTAMPTZ) TO authenticated;