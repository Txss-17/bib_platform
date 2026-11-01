-- BIB Platform critical authorization hardening, 2026-11-01.
-- Apply only after staging rehearsal, backups, and reconciliation of pending
-- Platform migrations. Do not mark migration journals as applied manually.
-- Service role remains the only supported writer of trusted checkout amounts,
-- payment states, partner approvals, and paid-plan entitlement fields.
BEGIN;

-- Client-owned orders must be created by verified payment/POS functions.
DROP POLICY IF EXISTS "Anyone can create orders for published boutiques" ON public.orders;

-- A customer must never be able to link someone else's guest order by merely
-- claiming the corresponding email address. Any future claim flow requires
-- a server-side verified ownership proof and a scoped server-side operation.
DROP POLICY IF EXISTS "Customers update own orders link" ON public.orders;

-- This SECURITY DEFINER RPC originally trusted an email supplied by the caller.
-- A linked customer must own the profile AND the exact verified auth email.
CREATE OR REPLACE FUNCTION public.claim_guest_orders(
  _customer_profile_id uuid, _email text
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $
DECLARE
  verified_email text;
  claimed_count integer;
BEGIN
  SELECT lower(btrim(u.email)) INTO verified_email
  FROM auth.users u
  WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL;
  IF verified_email IS NULL OR
     lower(btrim(coalesce(_email, ''))) IS DISTINCT FROM verified_email OR
     NOT EXISTS (
       SELECT 1 FROM public.customer_profiles cp
       WHERE cp.id = _customer_profile_id
         AND cp.user_id = auth.uid()
         AND lower(btrim(cp.email)) = verified_email
     ) THEN
    RAISE EXCEPTION 'verified_customer_email_required' USING ERRCODE='42501';
  END IF;
  UPDATE public.orders
  SET customer_profile_id = _customer_profile_id
  WHERE lower(btrim(customer_email)) = verified_email
    AND customer_profile_id IS NULL;
  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count;
END
$;
REVOKE EXECUTE ON FUNCTION public.claim_guest_orders(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_guest_orders(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.bib_guard_order_financial_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'server_only_order_creation' USING ERRCODE = '42501';
  END IF;
  IF NEW.amount IS DISTINCT FROM OLD.amount
     OR NEW.product_id IS DISTINCT FROM OLD.product_id
     OR NEW.boutique_id IS DISTINCT FROM OLD.boutique_id
     OR NEW.quantity IS DISTINCT FROM OLD.quantity
     OR NEW.customer_profile_id IS DISTINCT FROM OLD.customer_profile_id
     OR NEW.customer_email IS DISTINCT FROM OLD.customer_email
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.payment_completed_at IS DISTINCT FROM OLD.payment_completed_at
     OR NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
     OR NEW.stripe_environment IS DISTINCT FROM OLD.stripe_environment
     OR NEW.refunded_amount_cents IS DISTINCT FROM OLD.refunded_amount_cents
     OR NEW.refund_status IS DISTINCT FROM OLD.refund_status
  THEN
    RAISE EXCEPTION 'server_only_order_financial_fields' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END
$$;
DROP TRIGGER IF EXISTS bib_guard_order_financial_fields ON public.orders;
CREATE TRIGGER bib_guard_order_financial_fields
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.bib_guard_order_financial_fields();

CREATE OR REPLACE FUNCTION public.bib_guard_profile_entitlements()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.plan_tier IS DISTINCT FROM OLD.plan_tier
     OR NEW.plan_billing_cycle IS DISTINCT FROM OLD.plan_billing_cycle
     OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.trust_score IS DISTINCT FROM OLD.trust_score
     OR NEW.green_addon_enabled IS DISTINCT FROM OLD.green_addon_enabled
     OR NEW.insurance_addon_enabled IS DISTINCT FROM OLD.insurance_addon_enabled
  THEN
    RAISE EXCEPTION 'server_only_profile_entitlements' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END
$$;
DROP TRIGGER IF EXISTS bib_guard_profile_entitlements ON public.profiles;
CREATE TRIGGER bib_guard_profile_entitlements
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.bib_guard_profile_entitlements();

CREATE OR REPLACE FUNCTION public.bib_guard_partner_approval()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'submitted'
       OR NEW.approved_at IS NOT NULL OR NEW.access_token IS NOT NULL
       OR NEW.support_ticket_id IS NOT NULL
    THEN
      RAISE EXCEPTION 'server_only_partner_approval' USING ERRCODE = '42501';
    END IF;
  ELSE
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
       OR NEW.access_token IS DISTINCT FROM OLD.access_token
       OR NEW.support_ticket_id IS DISTINCT FROM OLD.support_ticket_id
       OR NEW.portal IS DISTINCT FROM OLD.portal
       OR lower(NEW.contact_email) IS DISTINCT FROM lower(OLD.contact_email)
    THEN
      RAISE EXCEPTION 'server_only_partner_approval' USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END
$$;
DROP TRIGGER IF EXISTS bib_guard_partner_approval ON public.partner_onboarding_submissions;
CREATE TRIGGER bib_guard_partner_approval
BEFORE INSERT OR UPDATE ON public.partner_onboarding_submissions
FOR EACH ROW EXECUTE FUNCTION public.bib_guard_partner_approval();

COMMIT;
