
-- owns_boutique: used inside RLS policies. Authenticated needs it; anon also evaluates some policies.
REVOKE EXECUTE ON FUNCTION public.owns_boutique(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.owns_boutique(uuid, uuid) TO authenticated, anon;

-- track_order: public storefront tracking by email + order number (anonymous customers)
REVOKE EXECUTE ON FUNCTION public.track_order(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(text, text) TO anon, authenticated;

-- claim_guest_orders: only signed-in customers
REVOKE EXECUTE ON FUNCTION public.claim_guest_orders(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_guest_orders(uuid, text) TO authenticated;

-- has_active_subscription: only signed-in users querying their own status
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;

-- scene_analytics_summary: dashboard owners only
REVOKE EXECUTE ON FUNCTION public.scene_analytics_summary(uuid, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.scene_analytics_summary(uuid, timestamptz) TO authenticated;
