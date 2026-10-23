CREATE TABLE public.product_customization_dossiers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
 merchant_config jsonb NOT NULL DEFAULT '{}'::jsonb,
 supplier_status text NOT NULL DEFAULT 'not_requested' CHECK (supplier_status IN ('not_requested','submitted','in_review','approved','changes_requested','rejected')),
 supplier_comment text,
 submitted_at timestamptz,
 reviewed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_customization_dossiers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_customization_dossiers FROM PUBLIC, anon;
GRANT SELECT, INSERT ON public.product_customization_dossiers TO authenticated;
GRANT UPDATE (merchant_config, updated_at) ON public.product_customization_dossiers TO authenticated;
GRANT ALL ON public.product_customization_dossiers TO service_role;
CREATE POLICY product_customization_owner_read ON public.product_customization_dossiers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.products p JOIN public.boutiques b ON b.id=p.boutique_id WHERE p.id=product_id AND b.user_id=auth.uid()));
CREATE POLICY product_customization_owner_insert ON public.product_customization_dossiers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.products p JOIN public.boutiques b ON b.id=p.boutique_id WHERE p.id=product_id AND b.user_id=auth.uid()));
CREATE POLICY product_customization_owner_update ON public.product_customization_dossiers FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.products p JOIN public.boutiques b ON b.id=p.boutique_id WHERE p.id=product_id AND b.user_id=auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.products p JOIN public.boutiques b ON b.id=p.boutique_id WHERE p.id=product_id AND b.user_id=auth.uid()));