CREATE ROLE anon NOLOGIN;CREATE ROLE authenticated NOLOGIN;CREATE ROLE service_role NOLOGIN BYPASSRLS;CREATE SCHEMA auth;
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 CREATE TABLE auth.users(id uuid PRIMARY KEY,raw_user_meta_data jsonb NOT NULL DEFAULT '{}');
 CREATE TABLE boutiques(id uuid PRIMARY KEY,user_id uuid,name text,slug text,status text DEFAULT 'draft',legal_business_name text,legal_siret text,legal_address text,legal_email text,legal_phone text);
 CREATE TABLE products(id uuid PRIMARY KEY,boutique_id uuid REFERENCES boutiques(id),status text);
 CREATE TABLE orders(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),order_number text UNIQUE DEFAULT ('BIB-'||upper(gen_random_uuid()::text)),boutique_id uuid REFERENCES boutiques(id),product_id uuid REFERENCES products(id),quantity integer,customer_name text,customer_email text,amount numeric,payment_status text,stripe_environment text,sales_channel text DEFAULT 'storefront',created_at timestamptz DEFAULT now());
 GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;GRANT ALL ON boutiques,products,orders TO service_role;
 GRANT SELECT,UPDATE ON boutiques TO authenticated;
 ALTER TABLE boutiques ENABLE ROW LEVEL SECURITY;CREATE POLICY boutique_owner ON boutiques FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
