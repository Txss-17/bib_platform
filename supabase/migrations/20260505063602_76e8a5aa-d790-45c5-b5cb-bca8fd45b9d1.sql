
-- Restrict authenticated-only functions
REVOKE EXECUTE ON FUNCTION public.claim_guest_orders(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.scene_analytics_summary(uuid, timestamptz) FROM PUBLIC, anon;
-- owns_boutique and track_order remain callable by anon: owns_boutique is required inside public-facing RLS USING expressions, track_order powers anonymous order tracking.
