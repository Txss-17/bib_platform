-- CRM Clients : table boutique_customers + agrégat depuis orders + RLS + GRANTs

CREATE TABLE IF NOT EXISTS public.boutique_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL,
  email text NOT NULL,
  full_name text,
  phone text,
  city text,
  country text,
  total_spent_cents bigint NOT NULL DEFAULT 0,
  orders_count integer NOT NULL DEFAULT 0,
  first_order_at timestamptz,
  last_order_at timestamptz,
  marketing_opt_in boolean NOT NULL DEFAULT false,
  opt_in_at timestamptz,
  source text NOT NULL DEFAULT 'order',
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (boutique_id, email)
);

CREATE INDEX IF NOT EXISTS idx_boutique_customers_boutique ON public.boutique_customers(boutique_id);
CREATE INDEX IF NOT EXISTS idx_boutique_customers_optin ON public.boutique_customers(boutique_id, marketing_opt_in) WHERE marketing_opt_in = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.boutique_customers TO authenticated;
GRANT INSERT ON public.boutique_customers TO anon;
GRANT ALL ON public.boutique_customers TO service_role;

ALTER TABLE public.boutique_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Boutique owners read own customers"
  ON public.boutique_customers FOR SELECT TO authenticated
  USING (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Boutique owners update own customers"
  ON public.boutique_customers FOR UPDATE TO authenticated
  USING (owns_boutique(auth.uid(), boutique_id))
  WITH CHECK (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Boutique owners delete own customers"
  ON public.boutique_customers FOR DELETE TO authenticated
  USING (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Boutique owners insert customers"
  ON public.boutique_customers FOR INSERT TO authenticated
  WITH CHECK (owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Anon can insert newsletter signup on published boutique"
  ON public.boutique_customers FOR INSERT TO anon
  WITH CHECK (
    source = 'newsletter_signup'
    AND EXISTS (
      SELECT 1 FROM public.boutiques b
      WHERE b.id = boutique_customers.boutique_id
        AND b.status = 'published'
    )
  );

-- Trigger: upsert customer from each paid order
CREATE OR REPLACE FUNCTION public.upsert_customer_from_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  amount_cents bigint;
BEGIN
  IF NEW.payment_status IS DISTINCT FROM 'paid' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.payment_status = 'paid' THEN
    RETURN NEW;
  END IF;

  amount_cents := COALESCE((NEW.amount * 100)::bigint, 0);

  INSERT INTO public.boutique_customers (
    boutique_id, email, full_name, source,
    total_spent_cents, orders_count, first_order_at, last_order_at
  )
  VALUES (
    NEW.boutique_id,
    lower(NEW.customer_email),
    NEW.customer_name,
    'order',
    amount_cents,
    1,
    COALESCE(NEW.payment_completed_at, NEW.created_at),
    COALESCE(NEW.payment_completed_at, NEW.created_at)
  )
  ON CONFLICT (boutique_id, email) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.boutique_customers.full_name),
    total_spent_cents = public.boutique_customers.total_spent_cents + amount_cents,
    orders_count = public.boutique_customers.orders_count + 1,
    last_order_at = GREATEST(public.boutique_customers.last_order_at, EXCLUDED.last_order_at),
    first_order_at = LEAST(public.boutique_customers.first_order_at, EXCLUDED.first_order_at),
    updated_at = now();

  RETURN NEW;
END;
$func$;

DROP TRIGGER IF EXISTS trg_upsert_customer_from_order ON public.orders;
CREATE TRIGGER trg_upsert_customer_from_order
  AFTER INSERT OR UPDATE OF payment_status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.upsert_customer_from_order();

-- Backfill from existing paid orders
INSERT INTO public.boutique_customers (
  boutique_id, email, full_name, source,
  total_spent_cents, orders_count, first_order_at, last_order_at
)
SELECT
  o.boutique_id,
  lower(o.customer_email),
  MAX(o.customer_name),
  'order',
  SUM((o.amount * 100)::bigint),
  COUNT(*)::int,
  MIN(COALESCE(o.payment_completed_at, o.created_at)),
  MAX(COALESCE(o.payment_completed_at, o.created_at))
FROM public.orders o
WHERE o.payment_status = 'paid'
GROUP BY o.boutique_id, lower(o.customer_email)
ON CONFLICT (boutique_id, email) DO NOTHING;

-- Campaigns log
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'newsletter',
  subject text NOT NULL,
  body_html text NOT NULL,
  segment jsonb NOT NULL DEFAULT '{"type":"all_opt_in"}'::jsonb,
  promo_code text,
  status text NOT NULL DEFAULT 'draft',
  recipients_count integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_boutique ON public.marketing_campaigns(boutique_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_campaigns TO authenticated;
GRANT ALL ON public.marketing_campaigns TO service_role;

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners full access campaigns"
  ON public.marketing_campaigns FOR ALL TO authenticated
  USING (owns_boutique(auth.uid(), boutique_id))
  WITH CHECK (owns_boutique(auth.uid(), boutique_id) AND user_id = auth.uid());

-- Automation toggles per boutique
CREATE TABLE IF NOT EXISTS public.marketing_automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL UNIQUE,
  cart_abandoned_enabled boolean NOT NULL DEFAULT false,
  post_purchase_review_enabled boolean NOT NULL DEFAULT false,
  post_purchase_upsell_enabled boolean NOT NULL DEFAULT false,
  newsletter_double_optin boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_automations TO authenticated;
GRANT ALL ON public.marketing_automations TO service_role;

ALTER TABLE public.marketing_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage automations"
  ON public.marketing_automations FOR ALL TO authenticated
  USING (owns_boutique(auth.uid(), boutique_id))
  WITH CHECK (owns_boutique(auth.uid(), boutique_id));
