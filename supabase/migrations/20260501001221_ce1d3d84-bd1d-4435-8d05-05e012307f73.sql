-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  price_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- has_active_subscription helper
CREATE OR REPLACE FUNCTION public.has_active_subscription(
  user_uuid uuid,
  check_env text DEFAULT 'live'
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND environment = check_env
      AND (
        (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  );
$$;

-- Sync profiles.plan_tier from active subscription price_id
CREATE OR REPLACE FUNCTION public.sync_profile_plan_from_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tier text;
  new_cycle text;
BEGIN
  -- Map price_id → tier + cycle
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

  -- Only sync when subscription is active or trialing
  IF NEW.status IN ('active', 'trialing') AND new_tier IS NOT NULL THEN
    UPDATE public.profiles
    SET plan_tier = new_tier,
        plan_billing_cycle = new_cycle,
        updated_at = now()
    WHERE user_id = NEW.user_id;
  ELSIF NEW.status IN ('canceled', 'unpaid', 'incomplete_expired') THEN
    -- Downgrade to starter on cancellation when no other active sub
    IF NOT EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = NEW.user_id
        AND status IN ('active', 'trialing')
        AND id <> NEW.id
    ) THEN
      UPDATE public.profiles
      SET plan_tier = 'starter',
          updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_plan_on_subscription_change ON public.subscriptions;
CREATE TRIGGER sync_plan_on_subscription_change
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_plan_from_subscription();

-- updated_at trigger
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add stripe_session_id + payment_status to orders for public checkout
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_session_id);
