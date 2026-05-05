
ALTER FUNCTION public.owns_boutique(uuid, uuid) SECURITY INVOKER;
ALTER FUNCTION public.has_active_subscription(uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.scene_analytics_summary(uuid, timestamptz) SECURITY INVOKER;
