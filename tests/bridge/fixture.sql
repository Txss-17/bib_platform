CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_setting('request.jwt.claim.role', true) $$;
CREATE FUNCTION public.is_leadership(uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT false $$;
CREATE FUNCTION public.has_any_pole(uuid, text[]) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT false $$;
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz);
CREATE TYPE public.boutique_status AS ENUM ('draft','published');
CREATE TYPE public.logistics_status AS ENUM ('pending','processing','shipped','delivered','returned');
CREATE TABLE public.boutiques (id uuid PRIMARY KEY, status boutique_status NOT NULL DEFAULT 'draft');
CREATE TABLE public.customer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, email text NOT NULL,
  full_name text, avatar_url text, total_recycling_points integer NOT NULL DEFAULT 0,
  marketing_opt_in boolean NOT NULL DEFAULT false, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.orders (
  id uuid PRIMARY KEY, order_number text UNIQUE, customer_profile_id uuid,
  customer_email text, payment_status text, stripe_environment text, sales_channel text,
  logistics_status public.logistics_status DEFAULT 'pending', amount numeric DEFAULT 20,
  customer_validated boolean DEFAULT false
);
CREATE TABLE public.partner_onboarding_submissions (id uuid PRIMARY KEY, portal text, status text);
CREATE TABLE public.order_shipments (
  order_id uuid PRIMARY KEY REFERENCES public.orders(id), submission_id uuid REFERENCES public.partner_onboarding_submissions(id),
  driver_name text, driver_phone text, carrier text, tracking_number text, carton_size text, last_location text,
  eta date, received_at timestamptz, carton_printed_at timestamptz, label_printed_at timestamptz, updated_at timestamptz DEFAULT now()
);
CREATE TABLE public.shipment_events (id uuid DEFAULT gen_random_uuid(), order_id uuid REFERENCES public.orders(id), status text, label text, location text);
CREATE TABLE public.supplier_products (id uuid PRIMARY KEY);
CREATE TABLE public.products (id uuid PRIMARY KEY, platform_id uuid);
CREATE TABLE public.gift_cards (customer_profile_id uuid, balance_cents integer);
CREATE TABLE public.recycling_scans (id uuid DEFAULT gen_random_uuid(), customer_profile_id uuid, boutique_id uuid, points integer);
CREATE FUNCTION public.credit_gift_card_on_scan() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$;
CREATE TRIGGER credit_scan AFTER INSERT ON public.recycling_scans FOR EACH ROW EXECUTE FUNCTION public.credit_gift_card_on_scan();
CREATE TABLE public.shops (id uuid PRIMARY KEY);
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
