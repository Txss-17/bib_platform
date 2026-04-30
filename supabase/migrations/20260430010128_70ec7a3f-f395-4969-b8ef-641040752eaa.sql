-- Plans référentiel (Starter/Growth/Pro pour marchands)
CREATE TYPE public.plan_tier AS ENUM ('starter', 'growth', 'pro');

CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier plan_tier NOT NULL UNIQUE,
  name text NOT NULL,
  monthly_price_eur numeric NOT NULL,
  annual_monthly_price_eur numeric NOT NULL,
  commission_percent numeric NOT NULL,
  max_boutiques integer NOT NULL,
  max_products integer, -- NULL = illimité
  insurance_addon_price_eur numeric NOT NULL,
  insurance_per_dispute_cap_eur numeric NOT NULL,
  insurance_max_disputes_per_month integer, -- NULL = illimité
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans readable by everyone"
  ON public.plans FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO public.plans (tier, name, monthly_price_eur, annual_monthly_price_eur, commission_percent, max_boutiques, max_products, insurance_addon_price_eur, insurance_per_dispute_cap_eur, insurance_max_disputes_per_month, features, sort_order) VALUES
  ('starter', 'Starter', 79, 63, 15, 1, 30, 25, 200, 3,
   '["1 boutique prête à l''emploi","Jusqu''à 30 produits audités","Livraison EU incluse","Dashboard ventes basique","Support email 48h"]'::jsonb, 1),
  ('growth', 'Growth', 149, 119, 10, 1, 150, 45, 400, 5,
   '["1 boutique + sous-domaine personnalisé","Jusqu''à 150 produits audités","Livraison EU incluse","Analytics complets + export CSV","Support prioritaire 24h","Accès nouveaux produits J+7"]'::jsonb, 2),
  ('pro', 'Pro', 299, 239, 8, 3, NULL, 69, 700, NULL,
   '["Jusqu''à 3 boutiques multi-zones EU","Catalogue illimité","Livraison EU incluse","Analytics + accès API","Account manager dédié","Accès nouveaux produits J+1","Intégration ERP sur demande","Ventes privées + lot marchand"]'::jsonb, 3);

-- Lier profile à un plan (par défaut starter)
ALTER TABLE public.profiles
  ADD COLUMN plan_tier plan_tier NOT NULL DEFAULT 'starter',
  ADD COLUMN plan_billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (plan_billing_cycle IN ('monthly','annual')),
  ADD COLUMN green_addon_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN insurance_addon_enabled boolean NOT NULL DEFAULT false;