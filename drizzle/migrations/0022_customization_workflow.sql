-- Metadata is curated in Intranet and delivered through the authenticated bridge.
ALTER TABLE public.supplier_products ADD COLUMN IF NOT EXISTS customization_capabilities jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.supplier_products ADD COLUMN IF NOT EXISTS customization_terms jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.supplier_products ADD COLUMN IF NOT EXISTS catalog_details jsonb NOT NULL DEFAULT '{}'::jsonb;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.validate_customization_metadata(p_caps jsonb, p_terms jsonb, p_details jsonb)
RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path = public, pg_temp AS $$
DECLARE item record; entry jsonb;
BEGIN
  IF p_caps IS NULL OR p_terms IS NULL OR p_details IS NULL OR jsonb_typeof(p_caps) <> 'object' OR jsonb_typeof(p_terms) <> 'object' OR jsonb_typeof(p_details) <> 'object' THEN
    RAISE EXCEPTION 'invalid_customization_object' USING ERRCODE='22023';
  END IF;
  FOR item IN SELECT key,value FROM jsonb_each(p_caps) LOOP
    IF item.key='text' THEN
      IF jsonb_typeof(item.value)<>'boolean' THEN RAISE EXCEPTION 'invalid_text_capability' USING ERRCODE='22023'; END IF;
    ELSIF item.key IN ('logo','colors','materials','finishes','packaging','marking','dimensions') THEN
      IF jsonb_typeof(item.value)<>'array' OR jsonb_array_length(item.value)>50 THEN RAISE EXCEPTION 'invalid_capability_list' USING ERRCODE='22023'; END IF;
      FOR entry IN SELECT value FROM jsonb_array_elements(item.value) LOOP
        IF jsonb_typeof(entry)<>'string' OR char_length(btrim(entry #>> '{}')) NOT BETWEEN 1 AND 120
           OR (item.key='colors' AND (entry #>> '{}') !~ '^#[0-9A-Fa-f]{6}$') THEN
          RAISE EXCEPTION 'invalid_capability_value' USING ERRCODE='22023';
        END IF;
      END LOOP;
    ELSE RAISE EXCEPTION 'unsupported_capability_field' USING ERRCODE='22023';
    END IF;
  END LOOP;
  FOR item IN SELECT key,value FROM jsonb_each(p_terms) LOOP
    IF item.key IN ('moq','lead_time_days','surcharge_cents') THEN
      IF jsonb_typeof(item.value)<>'number' OR item.value::text !~ '^[0-9]+$'
         OR item.value::numeric > 10000000 OR (item.key<>'surcharge_cents' AND item.value::numeric < 1) THEN
        RAISE EXCEPTION 'invalid_customization_term' USING ERRCODE='22023';
      END IF;
    ELSIF item.key='currency' THEN
      IF jsonb_typeof(item.value)<>'string' OR (item.value #>> '{}') !~ '^[A-Z]{3}$' THEN RAISE EXCEPTION 'invalid_customization_currency' USING ERRCODE='22023'; END IF;
    ELSIF item.key='sample_required' THEN
      IF item.value <> 'true'::jsonb THEN RAISE EXCEPTION 'physical_sample_required' USING ERRCODE='22023'; END IF;
    ELSE RAISE EXCEPTION 'unsupported_customization_term' USING ERRCODE='22023'; END IF;
  END LOOP;
  IF p_terms ? 'surcharge_cents' AND NOT (p_terms ? 'currency') THEN
    RAISE EXCEPTION 'customization_currency_required' USING ERRCODE='22023';
  END IF;
  FOR item IN SELECT key,value FROM jsonb_each(p_details) LOOP
    IF item.key IN ('origin','weight','dimensions','ingredients','shelf_life') THEN
      IF jsonb_typeof(item.value)<>'string' OR char_length(item.value #>> '{}') > (CASE WHEN item.key='ingredients' THEN 4000 ELSE 300 END) THEN
        RAISE EXCEPTION 'invalid_catalog_detail' USING ERRCODE='22023';
      END IF;
    ELSIF item.key='gallery' THEN
      IF jsonb_typeof(item.value)<>'array' OR jsonb_array_length(item.value)>20 THEN RAISE EXCEPTION 'invalid_catalog_gallery' USING ERRCODE='22023'; END IF;
      FOR entry IN SELECT value FROM jsonb_array_elements(item.value) LOOP
        IF jsonb_typeof(entry)<>'string' OR char_length(entry #>> '{}')>2048 OR (entry #>> '{}') !~ '^https://[^/@[:space:]]+(/|$)' THEN RAISE EXCEPTION 'https_url_required' USING ERRCODE='22023'; END IF;
      END LOOP;
    ELSE RAISE EXCEPTION 'unsupported_catalog_detail' USING ERRCODE='22023'; END IF;
  END LOOP;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.validate_supplier_customization_metadata()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM public.validate_customization_metadata(NEW.customization_capabilities, NEW.customization_terms, NEW.catalog_details);
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS validate_supplier_customization_metadata ON public.supplier_products;
CREATE TRIGGER validate_supplier_customization_metadata BEFORE INSERT OR UPDATE OF customization_capabilities,customization_terms,catalog_details
ON public.supplier_products FOR EACH ROW EXECUTE FUNCTION public.validate_supplier_customization_metadata();
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS public.product_customization_dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  merchant_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  supplier_status text NOT NULL DEFAULT 'not_requested' CHECK (supplier_status IN ('not_requested','submitted','in_review','approved','changes_requested','rejected')),
  supplier_comment text, submitted_at timestamptz, reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_customization_dossiers ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
ALTER TABLE public.product_customization_dossiers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.product_customization_dossiers FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.product_customization_dossiers TO authenticated;
GRANT ALL ON public.product_customization_dossiers TO service_role;
DROP POLICY IF EXISTS product_customization_owner_read ON public.product_customization_dossiers;
CREATE POLICY product_customization_owner_read ON public.product_customization_dossiers FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.products p JOIN public.boutiques b ON b.id=p.boutique_id WHERE p.id=product_id AND b.user_id=auth.uid()));
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.validate_customization_configuration(p_config jsonb, p_caps jsonb)
RETURNS void LANGUAGE plpgsql IMMUTABLE SET search_path = public, pg_temp AS $$
DECLARE item record; option_pair record; selected text; qualified boolean := coalesce((p_caps->>'text')::boolean,false);
BEGIN
  IF p_config IS NULL OR jsonb_typeof(p_config)<>'object' THEN RAISE EXCEPTION 'invalid_customization_config' USING ERRCODE='22023'; END IF;
  FOR item IN SELECT key,value FROM jsonb_each(p_config) LOOP
    IF item.key NOT IN ('brand','color','logo','logoOption','packaging','marking','material','finish','dimensions','text','instructions')
       OR jsonb_typeof(item.value)<>'string'
       OR char_length(item.value #>> '{}') > (CASE WHEN item.key='instructions' THEN 2000 WHEN item.key='logo' THEN 2048 ELSE 300 END) THEN
      RAISE EXCEPTION 'unsupported_customization_field' USING ERRCODE='22023';
    END IF;
  END LOOP;
  FOR option_pair IN SELECT key,value FROM jsonb_each_text('{"color":"colors","logoOption":"logo","packaging":"packaging","marking":"marking","material":"materials","finish":"finishes","dimensions":"dimensions"}'::jsonb) LOOP
    IF jsonb_array_length(coalesce(p_caps->option_pair.value,'[]'::jsonb))>0 THEN qualified:=true; END IF;
    selected := coalesce(p_config->>option_pair.key,'');
    IF selected<>'' AND NOT EXISTS (SELECT 1 FROM jsonb_array_elements_text(coalesce(p_caps->option_pair.value,'[]'::jsonb)) AS x(value) WHERE x.value=selected) THEN
      RAISE EXCEPTION 'unsupported_customization_option: %', option_pair.key USING ERRCODE='22023';
    END IF;
  END LOOP;
  IF NOT qualified THEN RAISE EXCEPTION 'customization_not_qualified' USING ERRCODE='22023'; END IF;
  IF coalesce(p_config->>'logo','')<>'' AND (coalesce(p_config->>'logoOption','')='' OR (p_config->>'logo') !~ '^https://[^/@[:space:]]+(/|$)') THEN
    RAISE EXCEPTION 'logo_option_and_https_url_required' USING ERRCODE='22023';
  END IF;
  IF coalesce(p_config->>'text','')<>'' AND p_caps->'text' IS DISTINCT FROM 'true'::jsonb THEN
    RAISE EXCEPTION 'unsupported_customization_text' USING ERRCODE='22023';
  END IF;
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.save_product_customization_draft(p_product_id uuid, p_config jsonb, p_expected_version integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE caps jsonb; dossier public.product_customization_dossiers%ROWTYPE;
BEGIN
  SELECT sp.customization_capabilities INTO caps FROM public.products p
  JOIN public.boutiques b ON b.id=p.boutique_id JOIN public.supplier_products sp ON sp.id=p.supplier_product_id
  WHERE p.id=p_product_id AND b.user_id=auth.uid() AND sp.is_active=true FOR UPDATE OF p,b,sp;
  IF NOT FOUND THEN RAISE EXCEPTION 'owned_product_required' USING ERRCODE='42501'; END IF;
  PERFORM public.validate_customization_configuration(p_config,caps);
  SELECT * INTO dossier FROM public.product_customization_dossiers WHERE product_id=p_product_id FOR UPDATE;
  IF FOUND THEN
    IF p_expected_version IS DISTINCT FROM dossier.version THEN RAISE EXCEPTION 'customization_version_conflict' USING ERRCODE='40001'; END IF;
    IF dossier.merchant_config=p_config THEN RETURN to_jsonb(dossier); END IF;
    UPDATE public.product_customization_dossiers SET merchant_config=p_config, version=version+1,
      supplier_status='not_requested',supplier_comment=NULL,submitted_at=NULL,reviewed_at=NULL,updated_at=clock_timestamp()
    WHERE product_id=p_product_id RETURNING * INTO dossier;
  ELSE
    IF p_expected_version IS DISTINCT FROM 0 THEN RAISE EXCEPTION 'customization_version_conflict' USING ERRCODE='40001'; END IF;
    INSERT INTO public.product_customization_dossiers(product_id,merchant_config) VALUES(p_product_id,p_config) RETURNING * INTO dossier;
  END IF;
  RETURN to_jsonb(dossier);
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.submit_product_customization(p_product_id uuid, p_expected_version integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE caps jsonb; dossier public.product_customization_dossiers%ROWTYPE;
BEGIN
  SELECT sp.customization_capabilities INTO caps FROM public.products p
  JOIN public.boutiques b ON b.id=p.boutique_id JOIN public.supplier_products sp ON sp.id=p.supplier_product_id
  WHERE p.id=p_product_id AND b.user_id=auth.uid() AND sp.is_active=true FOR UPDATE OF p,b,sp;
  IF NOT FOUND THEN RAISE EXCEPTION 'owned_product_required' USING ERRCODE='42501'; END IF;
  SELECT * INTO dossier FROM public.product_customization_dossiers WHERE product_id=p_product_id FOR UPDATE;
  IF NOT FOUND OR dossier.version IS DISTINCT FROM p_expected_version THEN RAISE EXCEPTION 'customization_version_conflict' USING ERRCODE='40001'; END IF;
  PERFORM public.validate_customization_configuration(dossier.merchant_config,caps);
  IF btrim(coalesce(dossier.merchant_config->>'brand',''))=''
     OR (coalesce(dossier.merchant_config->>'logoOption','')<>'' AND coalesce(dossier.merchant_config->>'logo','')='') THEN
    RAISE EXCEPTION 'customization_incomplete' USING ERRCODE='22023';
  END IF;
  IF dossier.supplier_status IN ('submitted','in_review','approved') THEN RETURN to_jsonb(dossier); END IF;
  UPDATE public.product_customization_dossiers SET supplier_status='submitted', submitted_at=clock_timestamp(),updated_at=clock_timestamp()
  WHERE product_id=p_product_id RETURNING * INTO dossier;
  RETURN to_jsonb(dossier);
END;
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION public.apply_product_customization_review(p_product_id uuid,p_version integer,p_status text,p_comment text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE dossier public.product_customization_dossiers%ROWTYPE; caps jsonb; supplier_active boolean;
BEGIN
  IF p_status NOT IN ('in_review','approved','changes_requested','rejected') OR p_status IS NULL
     OR char_length(coalesce(p_comment,''))>2000
     OR (p_status IN ('changes_requested','rejected') AND btrim(coalesce(p_comment,''))='') THEN
    RAISE EXCEPTION 'invalid_customization_review' USING ERRCODE='22023';
  END IF;
  SELECT sp.customization_capabilities,sp.is_active INTO caps,supplier_active FROM public.products p
  JOIN public.boutiques b ON b.id=p.boutique_id JOIN public.supplier_products sp ON sp.id=p.supplier_product_id
  WHERE p.id=p_product_id FOR UPDATE OF p,b,sp;
  IF NOT FOUND OR (p_status='approved' AND supplier_active IS DISTINCT FROM true) THEN
    RAISE EXCEPTION 'active_catalog_product_required' USING ERRCODE='22023';
  END IF;
  SELECT * INTO dossier FROM public.product_customization_dossiers WHERE product_id=p_product_id FOR UPDATE;
  IF NOT FOUND OR dossier.version IS DISTINCT FROM p_version THEN RAISE EXCEPTION 'customization_version_conflict' USING ERRCODE='40001'; END IF;
  IF dossier.supplier_status=p_status AND dossier.supplier_comment IS NOT DISTINCT FROM p_comment THEN RETURN to_jsonb(dossier); END IF;
  IF dossier.supplier_status NOT IN ('submitted','in_review') THEN RAISE EXCEPTION 'customization_not_submitted' USING ERRCODE='22023'; END IF;
  IF p_status='approved' THEN PERFORM public.validate_customization_configuration(dossier.merchant_config,caps); END IF;
  UPDATE public.product_customization_dossiers SET supplier_status=p_status,supplier_comment=p_comment,
    reviewed_at=clock_timestamp(),updated_at=clock_timestamp() WHERE id=dossier.id RETURNING * INTO dossier;
  RETURN to_jsonb(dossier);
END;
$$;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.validate_customization_metadata(jsonb,jsonb,jsonb), public.validate_customization_configuration(jsonb,jsonb) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.save_product_customization_draft(uuid,jsonb,integer), public.submit_product_customization(uuid,integer), public.apply_product_customization_review(uuid,integer,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_product_customization_draft(uuid,jsonb,integer), public.submit_product_customization(uuid,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_product_customization_review(uuid,integer,text,text) TO service_role;
