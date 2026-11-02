-- Protect financial fields, paid entitlements and partner approval against
-- self-service UPDATE policies that otherwise allow privilege escalation.
BEGIN;

CREATE OR REPLACE FUNCTION public.bib_guard_order_financial_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF TG_OP='INSERT' THEN
    RAISE EXCEPTION 'server_only_order_creation' USING ERRCODE='42501';
  END IF;
  IF NEW.amount IS DISTINCT FROM OLD.amount
     OR NEW.product_id IS DISTINCT FROM OLD.product_id
     OR NEW.boutique_id IS DISTINCT FROM OLD.boutique_id
     OR NEW.quantity IS DISTINCT FROM OLD.quantity
     OR NEW.customer_email IS DISTINCT FROM OLD.customer_email
     OR NEW.payment_status IS DISTINCT FROM OLD.payment_status
     OR NEW.payment_completed_at IS DISTINCT FROM OLD.payment_completed_at
     OR NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
     OR NEW.stripe_environment IS DISTINCT FROM OLD.stripe_environment
     OR NEW.refunded_amount_cents IS DISTINCT FROM OLD.refunded_amount_cents
     OR NEW.refund_status IS DISTINCT FROM OLD.refund_status
  THEN RAISE EXCEPTION 'server_only_order_financial_fields' USING ERRCODE='42501';
  END IF;
  -- The verified guest-claim RPC may attach an order to its owner.
  -- The profile must belong to the authenticated caller, whose auth email
  -- was confirmed and exactly matches the order's customer email.
  IF NEW.customer_profile_id IS DISTINCT FROM OLD.customer_profile_id THEN
    IF OLD.customer_profile_id IS NOT NULL OR NEW.customer_profile_id IS NULL
       OR NOT EXISTS (
         SELECT 1 FROM public.customer_profiles cp
         JOIN auth.users u ON u.id=cp.user_id
         WHERE cp.id=NEW.customer_profile_id
           AND cp.user_id=auth.uid()
           AND u.email_confirmed_at IS NOT NULL
           AND lower(btrim(cp.email))=lower(btrim(u.email))
           AND lower(btrim(OLD.customer_email))=lower(btrim(u.email))
       ) THEN
      RAISE EXCEPTION 'verified_guest_order_claim_required' USING ERRCODE='42501';
    END IF;
  END IF;
  RETURN NEW;
END $;

DROP TRIGGER IF EXISTS bib_guard_order_financial_fields ON public.orders;
CREATE TRIGGER bib_guard_order_financial_fields
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.bib_guard_order_financial_fields();

CREATE OR REPLACE FUNCTION public.bib_guard_profile_entitlements()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF NEW.plan_tier IS DISTINCT FROM OLD.plan_tier
     OR NEW.plan_billing_cycle IS DISTINCT FROM OLD.plan_billing_cycle
     OR NEW.is_verified IS DISTINCT FROM OLD.is_verified
     OR NEW.trust_score IS DISTINCT FROM OLD.trust_score
     OR NEW.green_addon_enabled IS DISTINCT FROM OLD.green_addon_enabled
     OR NEW.insurance_addon_enabled IS DISTINCT FROM OLD.insurance_addon_enabled
  THEN RAISE EXCEPTION 'server_only_profile_entitlements' USING ERRCODE='42501';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS bib_guard_profile_entitlements ON public.profiles;
CREATE TRIGGER bib_guard_profile_entitlements
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.bib_guard_profile_entitlements();

CREATE OR REPLACE FUNCTION public.bib_guard_partner_approval()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;
  IF TG_OP='INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'submitted'
       OR NEW.approved_at IS NOT NULL OR NEW.access_token IS NOT NULL
       OR NEW.support_ticket_id IS NOT NULL
    THEN RAISE EXCEPTION 'server_only_partner_approval' USING ERRCODE='42501'; END IF;
  ELSE
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
       OR NEW.access_token IS DISTINCT FROM OLD.access_token
       OR NEW.support_ticket_id IS DISTINCT FROM OLD.support_ticket_id
       OR NEW.portal IS DISTINCT FROM OLD.portal
       OR lower(NEW.contact_email) IS DISTINCT FROM lower(OLD.contact_email)
    THEN RAISE EXCEPTION 'server_only_partner_approval' USING ERRCODE='42501'; END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS bib_guard_partner_approval ON public.partner_onboarding_submissions;
CREATE TRIGGER bib_guard_partner_approval
BEFORE INSERT OR UPDATE ON public.partner_onboarding_submissions
FOR EACH ROW EXECUTE FUNCTION public.bib_guard_partner_approval();
COMMIT;
