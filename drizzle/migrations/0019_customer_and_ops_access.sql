-- No historical balances, assignments or orders are rewritten by this migration.
-- Customer claims use only the caller's confirmed Supabase Auth email.
CREATE OR REPLACE FUNCTION public.claim_guest_orders(_customer_profile_id uuid, _email text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE verified_email text; claimed_count integer;
BEGIN
  SELECT lower(btrim(email)) INTO verified_email FROM auth.users
  WHERE id = auth.uid() AND email_confirmed_at IS NOT NULL;
  IF verified_email IS NULL OR verified_email = ''
     OR lower(btrim(_email)) IS DISTINCT FROM verified_email
     OR NOT EXISTS (SELECT 1 FROM public.customer_profiles
                    WHERE id = _customer_profile_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'confirmed_email_required' USING ERRCODE = '42501';
  END IF;
  UPDATE public.orders SET customer_profile_id = _customer_profile_id
  WHERE lower(btrim(customer_email)) = verified_email AND customer_profile_id IS NULL;
  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count;
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.claim_guest_orders(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_guest_orders(uuid, text) TO authenticated;
--> statement-breakpoint
DROP POLICY IF EXISTS "Customers update own orders link" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders for published boutiques" ON public.orders;
REVOKE INSERT ON public.orders FROM PUBLIC, anon, authenticated;
-- Merchant operations retain their existing RLS scope, with financial fields immutable.
REVOKE UPDATE ON public.orders FROM PUBLIC, anon, authenticated;
GRANT UPDATE (logistics_status, customer_validated) ON public.orders TO authenticated;
--> statement-breakpoint
-- A client must never choose its total, scan points or partner approval/token.
REVOKE INSERT, UPDATE, DELETE ON public.customer_profiles FROM PUBLIC, anon, authenticated;
GRANT INSERT (user_id, email, full_name, avatar_url, marketing_opt_in)
  ON public.customer_profiles TO authenticated;
GRANT UPDATE (email, full_name, avatar_url, marketing_opt_in)
  ON public.customer_profiles TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.partner_onboarding_submissions FROM PUBLIC, anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.recycling_scans FROM PUBLIC, anon, authenticated;
DROP POLICY IF EXISTS "Customers create own scans" ON public.recycling_scans;
--> statement-breakpoint
-- Circular has no server-verified physical receipt path yet. Fail closed rather
-- than issuing money from a client-provided points value, including through legacy callers.
CREATE OR REPLACE FUNCTION public.credit_gift_card_on_scan()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  RAISE EXCEPTION 'recycling_verification_required' USING ERRCODE = '42501';
END;
$$;
--> statement-breakpoint
-- Every Ops write locks and checks the existing assignment. It cannot claim or
-- reassign a shipment, and updates the tracking, order and event atomically.
CREATE OR REPLACE FUNCTION public.update_assigned_shipment(
  p_submission_id uuid, p_order_number text, p_patch jsonb,
  p_status text DEFAULT NULL, p_event_label text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE target_id uuid; row_count integer;
BEGIN
  IF p_status IS NOT NULL AND p_status NOT IN ('processing', 'shipped', 'delivered', 'returned') THEN
    RAISE EXCEPTION 'invalid_logistics_status' USING ERRCODE = '22023';
  END IF;
  IF p_patch IS NULL OR jsonb_typeof(p_patch) <> 'object'
     OR p_patch - ARRAY['driver_name','driver_phone','carrier','tracking_number','carton_size',
                        'last_location','eta','received_at','carton_printed_at','label_printed_at'] <> '{}'::jsonb THEN
    RAISE EXCEPTION 'invalid_shipment_patch' USING ERRCODE = '22023';
  END IF;
  -- Consistent partner -> order -> shipment lock order for assignment and tracking.
  PERFORM 1 FROM public.partner_onboarding_submissions
  WHERE id = p_submission_id AND portal = 'ops' AND status = 'approved' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'assigned_order_not_found' USING ERRCODE = 'P0002'; END IF;
  SELECT o.id INTO target_id FROM public.orders o
  JOIN public.order_shipments s ON s.order_id = o.id
  JOIN public.partner_onboarding_submissions p ON p.id = s.submission_id
  WHERE o.order_number = upper(btrim(p_order_number))
    AND o.payment_status = 'paid' AND o.stripe_environment = 'live'
    AND o.sales_channel = 'storefront'
    AND s.submission_id = p_submission_id AND p.portal = 'ops' AND p.status = 'approved'
  FOR UPDATE OF o, s;
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'assigned_order_not_found' USING ERRCODE = 'P0002';
  END IF;
  UPDATE public.order_shipments s SET
    driver_name = CASE WHEN p_patch ? 'driver_name' THEN p_patch->>'driver_name' ELSE s.driver_name END,
    driver_phone = CASE WHEN p_patch ? 'driver_phone' THEN p_patch->>'driver_phone' ELSE s.driver_phone END,
    carrier = CASE WHEN p_patch ? 'carrier' THEN p_patch->>'carrier' ELSE s.carrier END,
    tracking_number = CASE WHEN p_patch ? 'tracking_number' THEN p_patch->>'tracking_number' ELSE s.tracking_number END,
    carton_size = CASE WHEN p_patch ? 'carton_size' THEN p_patch->>'carton_size' ELSE s.carton_size END,
    last_location = CASE WHEN p_patch ? 'last_location' THEN p_patch->>'last_location' ELSE s.last_location END,
    eta = CASE WHEN p_patch ? 'eta' THEN (p_patch->>'eta')::date ELSE s.eta END,
    received_at = CASE WHEN p_patch ? 'received_at' THEN (p_patch->>'received_at')::timestamptz ELSE s.received_at END,
    carton_printed_at = CASE WHEN p_patch ? 'carton_printed_at' THEN (p_patch->>'carton_printed_at')::timestamptz ELSE s.carton_printed_at END,
    label_printed_at = CASE WHEN p_patch ? 'label_printed_at' THEN (p_patch->>'label_printed_at')::timestamptz ELSE s.label_printed_at END,
    updated_at = now()
  WHERE s.order_id = target_id AND s.submission_id = p_submission_id;
  GET DIAGNOSTICS row_count = ROW_COUNT;
  IF row_count <> 1 THEN RAISE EXCEPTION 'assignment_changed' USING ERRCODE = '40001'; END IF;
  IF p_status IS NOT NULL THEN
    UPDATE public.orders SET logistics_status = p_status::public.logistics_status WHERE id = target_id;
  END IF;
  IF nullif(btrim(p_event_label), '') IS NOT NULL THEN
    INSERT INTO public.shipment_events (order_id, status, label, location)
    VALUES (target_id, coalesce(p_status, 'update'), left(p_event_label, 200), p_patch->>'last_location');
  END IF;
  RETURN target_id;
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.update_assigned_shipment(uuid, text, jsonb, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_assigned_shipment(uuid, text, jsonb, text, text) TO service_role;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.assign_order_shipment(p_order_id uuid, p_submission_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE previous_submission uuid; target_order uuid;
BEGIN
  PERFORM 1 FROM public.partner_onboarding_submissions
  WHERE id = p_submission_id AND portal = 'ops' AND status = 'approved' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'eligible_partner_not_found' USING ERRCODE = 'P0002'; END IF;
  SELECT id INTO target_order FROM public.orders WHERE id = p_order_id
    AND payment_status = 'paid' AND stripe_environment = 'live' AND sales_channel = 'storefront' FOR UPDATE;
  IF target_order IS NULL THEN RAISE EXCEPTION 'eligible_order_not_found' USING ERRCODE = 'P0002'; END IF;
  INSERT INTO public.order_shipments (order_id) VALUES (target_order) ON CONFLICT (order_id) DO NOTHING;
  SELECT submission_id INTO previous_submission FROM public.order_shipments WHERE order_id = target_order FOR UPDATE;
  IF previous_submission IS NOT DISTINCT FROM p_submission_id THEN RETURN target_order; END IF;
  UPDATE public.order_shipments SET submission_id = p_submission_id, updated_at = now() WHERE order_id = target_order;
  INSERT INTO public.shipment_events (order_id, status, label)
  VALUES (target_order, 'assigned', 'Affectation à un partenaire logistique approuvé');
  RETURN target_order;
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.assign_order_shipment(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_order_shipment(uuid, uuid) TO service_role;
