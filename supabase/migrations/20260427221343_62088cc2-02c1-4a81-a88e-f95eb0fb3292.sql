-- 1. Customer profiles (marketplace customer accounts, distinct from sellers)
CREATE TABLE public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  total_recycling_points integer NOT NULL DEFAULT 0,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own profile"
  ON public.customer_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Customers insert own profile"
  ON public.customer_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers update own profile"
  ON public.customer_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 2. Add columns to orders for customer linking
ALTER TABLE public.orders
  ADD COLUMN customer_profile_id uuid REFERENCES public.customer_profiles(id) ON DELETE SET NULL;

CREATE INDEX idx_orders_customer_profile ON public.orders(customer_profile_id);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);

-- Allow customers to view their own orders (by linked profile or by email match)
CREATE POLICY "Customers view their linked orders"
  ON public.orders FOR SELECT TO authenticated
  USING (
    customer_profile_id IN (
      SELECT id FROM public.customer_profiles WHERE user_id = auth.uid()
    )
  );

-- Allow customers to claim their guest orders by email after signup
CREATE POLICY "Customers update own orders link"
  ON public.orders FOR UPDATE TO authenticated
  USING (
    customer_email = (SELECT email FROM public.customer_profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    customer_profile_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid())
  );

-- 3. Add marketplace card fields to boutiques
ALTER TABLE public.boutiques
  ADD COLUMN cover_image_url text,
  ADD COLUMN tagline text;

-- 4. Gift cards (one per customer × boutique, fed by recycling)
CREATE TABLE public.gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id uuid NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  balance_cents integer NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (customer_profile_id, boutique_id)
);

ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own gift cards"
  ON public.gift_cards FOR SELECT TO authenticated
  USING (
    customer_profile_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Boutique owners view gift cards on their boutique"
  ON public.gift_cards FOR SELECT TO authenticated
  USING (public.owns_boutique(auth.uid(), boutique_id));

-- 5. Recycling scans (event log, source of truth for points)
CREATE TYPE public.recycling_source AS ENUM ('qr_scan', 'manual', 'pickup');

CREATE TABLE public.recycling_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_profile_id uuid NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  points integer NOT NULL CHECK (points > 0),
  source public.recycling_source NOT NULL DEFAULT 'qr_scan',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recycling_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own scans"
  ON public.recycling_scans FOR SELECT TO authenticated
  USING (
    customer_profile_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Boutique owners view scans on their boutique"
  ON public.recycling_scans FOR SELECT TO authenticated
  USING (public.owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Customers create own scans"
  ON public.recycling_scans FOR INSERT TO authenticated
  WITH CHECK (
    customer_profile_id IN (SELECT id FROM public.customer_profiles WHERE user_id = auth.uid())
  );

-- 6. Trigger: credit gift card and update total points when a scan is inserted
-- Rule: 1 point = 10 cents, credited on the boutique where recycling happened
CREATE OR REPLACE FUNCTION public.credit_gift_card_on_scan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Upsert gift card balance (+ points * 10 cents)
  INSERT INTO public.gift_cards (customer_profile_id, boutique_id, balance_cents)
  VALUES (NEW.customer_profile_id, NEW.boutique_id, NEW.points * 10)
  ON CONFLICT (customer_profile_id, boutique_id)
  DO UPDATE SET
    balance_cents = public.gift_cards.balance_cents + EXCLUDED.balance_cents,
    updated_at = now();

  -- Increment customer total recycling points
  UPDATE public.customer_profiles
  SET total_recycling_points = total_recycling_points + NEW.points,
      updated_at = now()
  WHERE id = NEW.customer_profile_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_credit_gift_card_on_scan
  AFTER INSERT ON public.recycling_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_gift_card_on_scan();

-- 7. Updated_at triggers on new tables
CREATE TRIGGER trg_customer_profiles_updated
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_gift_cards_updated
  BEFORE UPDATE ON public.gift_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Helper: claim guest orders by email after signup
CREATE OR REPLACE FUNCTION public.claim_guest_orders(_customer_profile_id uuid, _email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claimed_count integer;
BEGIN
  -- Verify caller owns the profile
  IF NOT EXISTS (
    SELECT 1 FROM public.customer_profiles
    WHERE id = _customer_profile_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE public.orders
  SET customer_profile_id = _customer_profile_id
  WHERE LOWER(TRIM(customer_email)) = LOWER(TRIM(_email))
    AND customer_profile_id IS NULL;

  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count;
END;
$$;