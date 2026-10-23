CREATE TABLE public.stock_restock_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
 supplier_product_id uuid NOT NULL REFERENCES public.supplier_products(id),
 boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE CASCADE,
 requested_quantity integer NOT NULL CHECK (requested_quantity > 0),
 catalog_moq integer NOT NULL CHECK (catalog_moq > 0),
 status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','ordered','received','rejected','cancelled')),
 note text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_restock_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.stock_restock_requests FROM PUBLIC, anon;
GRANT SELECT, INSERT ON public.stock_restock_requests TO authenticated;
GRANT ALL ON public.stock_restock_requests TO service_role;
CREATE POLICY restock_request_owner_read ON public.stock_restock_requests FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.boutiques b WHERE b.id=stock_restock_requests.boutique_id AND b.user_id=auth.uid()));
CREATE POLICY restock_request_owner_insert ON public.stock_restock_requests FOR INSERT TO authenticated WITH CHECK (status='requested' AND EXISTS (SELECT 1 FROM public.boutiques b JOIN public.products p ON p.boutique_id=b.id WHERE b.id=stock_restock_requests.boutique_id AND b.user_id=auth.uid() AND p.id=stock_restock_requests.product_id AND p.supplier_product_id=stock_restock_requests.supplier_product_id) AND EXISTS (SELECT 1 FROM public.supplier_products sp WHERE sp.id=stock_restock_requests.supplier_product_id AND stock_restock_requests.catalog_moq=sp.moq AND stock_restock_requests.requested_quantity>=sp.moq));