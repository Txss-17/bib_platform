
-- 1. Create secure RPC function for order tracking
CREATE OR REPLACE FUNCTION public.track_order(_order_number text, _customer_email text)
RETURNS TABLE (
  order_number text,
  customer_name text,
  amount numeric,
  logistics_status text,
  created_at timestamptz,
  product_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.order_number,
    o.customer_name,
    o.amount,
    o.logistics_status::text,
    o.created_at,
    sp.name as product_name
  FROM public.orders o
  LEFT JOIN public.products p ON p.id = o.product_id
  LEFT JOIN public.supplier_products sp ON sp.id = p.supplier_product_id
  WHERE o.order_number = UPPER(TRIM(_order_number))
    AND o.customer_email = LOWER(TRIM(_customer_email))
  LIMIT 1;
$$;

-- 2. Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view orders by order_number and email" ON public.orders;

-- 3. Create email_templates table for boutique marketing emails
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'welcome', 'order_confirmation', 'shipping', 'promo'
  subject text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(boutique_id, type)
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their boutique email templates"
ON public.email_templates
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.boutiques
  WHERE boutiques.id = email_templates.boutique_id
    AND boutiques.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.boutiques
  WHERE boutiques.id = email_templates.boutique_id
    AND boutiques.user_id = auth.uid()
));

CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
