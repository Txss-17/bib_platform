-- Create rotation indicator enum
CREATE TYPE public.rotation_indicator AS ENUM ('green', 'yellow', 'orange', 'red');

-- Create order logistics status enum
CREATE TYPE public.logistics_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'returned');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed');

-- Create moq reservation status enum
CREATE TYPE public.moq_status AS ENUM ('reserved', 'confirmed', 'expired', 'cancelled');

-- Create boutique status enum
CREATE TYPE public.boutique_status AS ENUM ('draft', 'published');

-- Create product status enum
CREATE TYPE public.product_status AS ENUM ('active', 'paused');

-- 1. BOUTIQUES TABLE
CREATE TABLE public.boutiques (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  status boutique_status NOT NULL DEFAULT 'draft',
  logo_url TEXT,
  theme_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.boutiques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boutiques"
ON public.boutiques FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boutiques"
ON public.boutiques FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boutiques"
ON public.boutiques FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boutiques"
ON public.boutiques FOR DELETE
USING (auth.uid() = user_id);

-- Public access for storefront (read published boutiques)
CREATE POLICY "Anyone can view published boutiques"
ON public.boutiques FOR SELECT
USING (status = 'published');

CREATE INDEX idx_boutiques_user_id ON public.boutiques(user_id);
CREATE INDEX idx_boutiques_slug ON public.boutiques(slug);

-- 2. SUPPLIER PRODUCTS TABLE (LINKSY-validated catalog)
CREATE TABLE public.supplier_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  moq INTEGER NOT NULL DEFAULT 1,
  market TEXT NOT NULL DEFAULT 'EU',
  base_price DECIMAL(10,2) NOT NULL,
  max_margin_percent INTEGER NOT NULL DEFAULT 30,
  rotation_indicator rotation_indicator NOT NULL DEFAULT 'green',
  category TEXT NOT NULL,
  performance_history JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active supplier products
CREATE POLICY "Authenticated users can view active supplier products"
ON public.supplier_products FOR SELECT
TO authenticated
USING (is_active = true);

CREATE INDEX idx_supplier_products_category ON public.supplier_products(category);
CREATE INDEX idx_supplier_products_market ON public.supplier_products(market);

-- 3. PRODUCTS TABLE (Seller's boutique products)
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  boutique_id UUID NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  supplier_product_id UUID NOT NULL REFERENCES public.supplier_products(id),
  public_price DECIMAL(10,2) NOT NULL,
  applied_margin DECIMAL(5,2) NOT NULL,
  status product_status NOT NULL DEFAULT 'active',
  cumulative_sales INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Security definer function to check boutique ownership
CREATE OR REPLACE FUNCTION public.owns_boutique(_user_id UUID, _boutique_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.boutiques
    WHERE id = _boutique_id AND user_id = _user_id
  )
$$;

CREATE POLICY "Users can view their own products"
ON public.products FOR SELECT
USING (public.owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Users can create products in their boutiques"
ON public.products FOR INSERT
WITH CHECK (public.owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Users can update their own products"
ON public.products FOR UPDATE
USING (public.owns_boutique(auth.uid(), boutique_id));

CREATE POLICY "Users can delete their own products"
ON public.products FOR DELETE
USING (public.owns_boutique(auth.uid(), boutique_id));

-- Public can view products in published boutiques
CREATE POLICY "Anyone can view products in published boutiques"
ON public.products FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.boutiques
    WHERE id = boutique_id AND status = 'published'
  )
);

CREATE INDEX idx_products_boutique_id ON public.products(boutique_id);
CREATE INDEX idx_products_supplier_product_id ON public.products(supplier_product_id);

-- 4. ORDERS TABLE
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  boutique_id UUID NOT NULL REFERENCES public.boutiques(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  market TEXT NOT NULL DEFAULT 'EU',
  amount DECIMAL(10,2) NOT NULL,
  logistics_status logistics_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders for their boutiques"
ON public.orders FOR SELECT
USING (public.owns_boutique(auth.uid(), boutique_id));

CREATE INDEX idx_orders_boutique_id ON public.orders(boutique_id);
CREATE INDEX idx_orders_product_id ON public.orders(product_id);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);

-- Function to generate LINKSY order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_suffix TEXT;
  random_suffix TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');
  random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
  NEW.order_number := 'LKS' || year_suffix || '-' || random_suffix;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION public.generate_order_number();

-- 5. PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boutique_id UUID REFERENCES public.boutiques(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payout_date DATE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT
USING (auth.uid() = user_id);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_boutique_id ON public.payments(boutique_id);

-- 6. MOQ RESERVATIONS TABLE
CREATE TABLE public.moq_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_product_id UUID NOT NULL REFERENCES public.supplier_products(id),
  quantity INTEGER NOT NULL,
  status moq_status NOT NULL DEFAULT 'reserved',
  reserved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.moq_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MOQ reservations"
ON public.moq_reservations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create MOQ reservations"
ON public.moq_reservations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MOQ reservations"
ON public.moq_reservations FOR UPDATE
USING (auth.uid() = user_id);

CREATE INDEX idx_moq_reservations_user_id ON public.moq_reservations(user_id);
CREATE INDEX idx_moq_reservations_supplier_product_id ON public.moq_reservations(supplier_product_id);

-- Add updated_at triggers for tables that need it
CREATE TRIGGER update_boutiques_updated_at
BEFORE UPDATE ON public.boutiques
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;