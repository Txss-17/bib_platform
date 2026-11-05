CREATE TABLE public.supplier_products(id uuid PRIMARY KEY,intranet_id text,is_active boolean DEFAULT true,base_price numeric NOT NULL);
ALTER TABLE public.products ADD COLUMN supplier_product_id uuid REFERENCES public.supplier_products(id);
CREATE TABLE public.sample_purchases(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),product_id uuid,user_id uuid,stripe_session_id text UNIQUE,stripe_environment text,amount_cents integer,currency text,payment_status text,paid_at timestamptz);
CREATE TABLE public.sample_validations(id uuid DEFAULT gen_random_uuid(),visual_confirmed_at timestamptz,product_id uuid,user_id uuid,status text,ordered_at timestamptz,PRIMARY KEY(product_id,user_id));

CREATE TABLE public.stock_restock_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),product_id uuid,boutique_id uuid,supplier_product_id uuid);
