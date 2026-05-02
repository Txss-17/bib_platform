-- Add insurance subscription tracking
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'plan';

-- Update sync trigger to also handle insurance add-on
CREATE OR REPLACE FUNCTION public.sync_profile_plan_from_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_tier text;
  new_cycle text;
  is_insurance boolean;
BEGIN
  is_insurance := NEW.price_id LIKE 'insurance_%';

  IF is_insurance THEN
    -- Toggle insurance addon on profile based on subscription status
    IF NEW.status IN ('active', 'trialing') THEN
      UPDATE public.profiles
      SET insurance_addon_enabled = true,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.status IN ('canceled', 'unpaid', 'incomplete_expired') THEN
      -- Disable only if no other active insurance sub
      IF NOT EXISTS (
        SELECT 1 FROM public.subscriptions
        WHERE user_id = NEW.user_id
          AND price_id LIKE 'insurance_%'
          AND status IN ('active', 'trialing')
          AND id <> NEW.id
      ) THEN
        UPDATE public.profiles
        SET insurance_addon_enabled = false,
            updated_at = now()
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Plan subscription handling (unchanged)
  IF NEW.price_id IN ('starter_monthly', 'starter_yearly') THEN
    new_tier := 'starter';
  ELSIF NEW.price_id IN ('growth_monthly', 'growth_yearly') THEN
    new_tier := 'growth';
  ELSIF NEW.price_id IN ('pro_monthly', 'pro_yearly') THEN
    new_tier := 'pro';
  ELSE
    new_tier := NULL;
  END IF;

  IF NEW.price_id LIKE '%_yearly' THEN
    new_cycle := 'annual';
  ELSE
    new_cycle := 'monthly';
  END IF;

  IF NEW.status IN ('active', 'trialing') AND new_tier IS NOT NULL THEN
    UPDATE public.profiles
    SET plan_tier = new_tier::plan_tier,
        plan_billing_cycle = new_cycle,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSIF NEW.status IN ('canceled', 'unpaid', 'incomplete_expired') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = NEW.user_id
        AND price_id NOT LIKE 'insurance_%'
        AND status IN ('active', 'trialing')
        AND id <> NEW.id
    ) THEN
      UPDATE public.profiles
      SET plan_tier = 'starter'::plan_tier,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Make sure trigger exists
DROP TRIGGER IF EXISTS sync_profile_plan_trigger ON public.subscriptions;
CREATE TRIGGER sync_profile_plan_trigger
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_plan_from_subscription();