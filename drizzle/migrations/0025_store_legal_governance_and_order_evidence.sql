-- Shared payload contract from Intrabib; no published content is seeded.
CREATE FUNCTION public.legal_required_text(p jsonb,k text) RETURNS text LANGUAGE plpgsql IMMUTABLE SET search_path=public,pg_temp AS $$
DECLARE v text:=btrim(p->>k);
BEGIN
 IF jsonb_typeof(p->k) IS DISTINCT FROM 'string' OR length(coalesce(v,'')) NOT BETWEEN 1 AND 200000
 THEN RAISE EXCEPTION 'legal_field_required: %',k USING ERRCODE='22023'; END IF;
 RETURN v;
END; $$;

CREATE FUNCTION public.validate_legal_governance_payload(kind text,p jsonb) RETURNS void
 LANGUAGE plpgsql IMMUTABLE SET search_path=public,pg_temp AS $$
DECLARE token text[]; key text; required text[]; body text; f jsonb;
 allowed text[]:=ARRAY['VENDEUR_NOM_LEGAL','SIREN_SIRET','ADRESSE','CONTACT_VENDEUR','TELEPHONE','FORME_OU_EI','MEDIATEUR_COORDONNEES','TVA_ID','BIB_IDENTITE_LEGALE_VERIFIEE','BIB_CONTACT','HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES','CAPITAL_SOCIAL','REGISTRE_IMMATRICULATION','BOUTIQUE_NOM','URL_BOUTIQUE','CGV_MODELE_VERSION','CGV_BOUTIQUE_VERSION','CGU_MODELE_VERSION','CGU_BOUTIQUE_VERSION','DATE_EFFET'];
BEGIN
 IF jsonb_typeof(p) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'invalid_legal_payload' USING ERRCODE='22023'; END IF;
 IF kind='model' THEN
  IF EXISTS(SELECT 1 FROM jsonb_object_keys(p) k WHERE NOT k=ANY(ARRAY['model_key','version','title','body','effective_at','locale']))
   OR p->>'model_key' IS NULL OR p->>'model_key' NOT IN('JUR-B01','JUR-B02','JUR-B03') OR p->>'locale' IS DISTINCT FROM 'fr'
   THEN RAISE EXCEPTION 'invalid_legal_model' USING ERRCODE='22023'; END IF;
  PERFORM public.legal_required_text(p,'version'); PERFORM public.legal_required_text(p,'title');
  IF public.legal_required_text(p,'effective_at') !~ '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$'
   THEN RAISE EXCEPTION 'legal_effective_date_requires_timezone' USING ERRCODE='22023'; END IF;
  PERFORM (p->>'effective_at')::timestamptz;
  body:=public.legal_required_text(p,'body');
  FOR token IN SELECT regexp_matches(body,'\{\{([^{}]+)\}\}','g') LOOP
   IF NOT token[1]=ANY(allowed)
    OR (p->>'model_key'<>'JUR-B01' AND token[1] LIKE 'CGV_%')
    OR (p->>'model_key'<>'JUR-B02' AND token[1] LIKE 'CGU_%')
   THEN RAISE EXCEPTION 'unknown_legal_placeholder: %',token[1] USING ERRCODE='22023'; END IF;
  END LOOP;
  IF regexp_replace(body,'\{\{[^{}]+\}\}','','g') LIKE '%{{%' OR regexp_replace(body,'\{\{[^{}]+\}\}','','g') LIKE '%}}%'
   THEN RAISE EXCEPTION 'malformed_legal_placeholder' USING ERRCODE='22023'; END IF;
  required:=CASE p->>'model_key'
   WHEN 'JUR-B01' THEN ARRAY['VENDEUR_NOM_LEGAL','BOUTIQUE_NOM','FORME_OU_EI','SIREN_SIRET','ADRESSE','CONTACT_VENDEUR','MEDIATEUR_COORDONNEES','CGV_MODELE_VERSION','CGV_BOUTIQUE_VERSION','DATE_EFFET']
   WHEN 'JUR-B02' THEN ARRAY['VENDEUR_NOM_LEGAL','BOUTIQUE_NOM','URL_BOUTIQUE','CGU_MODELE_VERSION','CGU_BOUTIQUE_VERSION','CONTACT_VENDEUR']
   ELSE ARRAY['VENDEUR_NOM_LEGAL','BOUTIQUE_NOM','URL_BOUTIQUE','FORME_OU_EI','SIREN_SIRET','ADRESSE','TVA_ID','CONTACT_VENDEUR','BIB_IDENTITE_LEGALE_VERIFIEE','BIB_CONTACT','HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES'] END;
  FOREACH key IN ARRAY required LOOP
   IF strpos(body,'{{'||key||'}}')=0 THEN RAISE EXCEPTION 'missing_legal_placeholder: %',key USING ERRCODE='22023'; END IF;
  END LOOP;
 ELSIF kind='identity' THEN
  IF EXISTS(SELECT 1 FROM jsonb_object_keys(p) k WHERE NOT k=ANY(ARRAY['store_id','owner_id','fields','legal_entity_id']))
   OR jsonb_typeof(p->'fields') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'invalid_legal_identity' USING ERRCODE='22023'; END IF;
  PERFORM public.legal_required_text(p,'store_id')::uuid; PERFORM public.legal_required_text(p,'owner_id')::uuid;
  f:=p->'fields';
  FOR key IN SELECT jsonb_object_keys(f) LOOP
   IF NOT key=ANY(allowed[1:13]) OR public.legal_required_text(f,key) LIKE '%{{%' OR f->>key LIKE '%}}%'
    THEN RAISE EXCEPTION 'invalid_identity_field: %',key USING ERRCODE='22023'; END IF;
  END LOOP;
  FOREACH key IN ARRAY ARRAY['VENDEUR_NOM_LEGAL','SIREN_SIRET','ADRESSE','CONTACT_VENDEUR','FORME_OU_EI','MEDIATEUR_COORDONNEES','TVA_ID','BIB_IDENTITE_LEGALE_VERIFIEE','BIB_CONTACT','HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES'] LOOP
   PERFORM public.legal_required_text(f,key);
  END LOOP;
  IF f->>'SIREN_SIRET' !~ '^(\d{9}|\d{14})$' OR f->>'CONTACT_VENDEUR' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
   THEN RAISE EXCEPTION 'invalid_identity_registration' USING ERRCODE='22023'; END IF;
 ELSE RAISE EXCEPTION 'invalid_legal_kind' USING ERRCODE='22023'; END IF;
END; $$;

CREATE TABLE public.legal_governance_configuration (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton), environment text NOT NULL CHECK(environment IN('sandbox','live')),
 public_origin text NOT NULL CHECK(public_origin ~ '^https://[a-zA-Z0-9.-]+(:[0-9]+)?$')
);
CREATE TABLE public.legal_governance_mirror (
 source_id uuid PRIMARY KEY, kind text NOT NULL CHECK(kind IN('model','identity')), payload jsonb NOT NULL,
 state text NOT NULL CHECK(state IN('published','withdrawn')), source_revision integer NOT NULL,
 activation_sequence bigint NOT NULL, delivery_sequence bigint NOT NULL, envelope jsonb NOT NULL,
 received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX legal_model_effectivity ON public.legal_governance_mirror((payload->>'model_key'),activation_sequence DESC) WHERE kind='model';
CREATE INDEX legal_identity_activation ON public.legal_governance_mirror((payload->>'store_id'),activation_sequence DESC) WHERE kind='identity';
CREATE TABLE public.store_order_legal_snapshots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), checkout_key uuid NOT NULL UNIQUE,
 boutique_id uuid NOT NULL REFERENCES public.boutiques(id), customer_email text NOT NULL,
 bundle jsonb NOT NULL, bundle_hash text NOT NULL, request_fingerprint jsonb NOT NULL,
 evidence_events jsonb NOT NULL,
 accepted_at timestamptz NOT NULL DEFAULT now(), acceptance_statement text NOT NULL DEFAULT 'storefront-legal-v1',
 channel text NOT NULL DEFAULT 'storefront_checkout', environment text NOT NULL CHECK(environment IN('sandbox','live'))
);
ALTER TABLE public.orders ADD COLUMN legal_snapshot_id uuid REFERENCES public.store_order_legal_snapshots(id);
CREATE INDEX orders_legal_snapshot ON public.orders(legal_snapshot_id);
ALTER TABLE public.legal_governance_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_governance_mirror ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_order_legal_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.legal_governance_configuration,public.legal_governance_mirror,public.store_order_legal_snapshots FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.legal_governance_configuration,public.legal_governance_mirror,public.store_order_legal_snapshots TO service_role;

CREATE FUNCTION public.import_legal_governance_record(p_record jsonb,p_environment text,p_public_origin text) RETURNS text
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE old public.legal_governance_mirror; config public.legal_governance_configuration;
 id uuid:=(p_record->>'id')::uuid; seq bigint; activation bigint; rev integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('bib-legal-governance',0));
 IF p_environment NOT IN('sandbox','live') OR p_record->>'environment' IS DISTINCT FROM p_environment
 OR p_public_origin !~ '^https://[a-zA-Z0-9.-]+(:[0-9]+)?$' THEN RAISE EXCEPTION 'legal_environment_mismatch' USING ERRCODE='22023'; END IF;
 SELECT * INTO config FROM public.legal_governance_configuration WHERE singleton;
 IF FOUND AND (config.environment IS DISTINCT FROM p_environment OR config.public_origin IS DISTINCT FROM p_public_origin)
 THEN RAISE EXCEPTION 'legal_configuration_change_requires_review' USING ERRCODE='55000'; END IF;
 IF jsonb_typeof(p_record) IS DISTINCT FROM 'object' OR EXISTS(SELECT 1 FROM jsonb_object_keys(p_record) k WHERE NOT k=ANY(ARRAY['id','kind','payload','state','revision','environment','activation_sequence','delivery_sequence','legal_reviewer','direction_reviewer']))
 OR p_record->>'state' IS NULL OR p_record->>'state' NOT IN('published','withdrawn')
 OR coalesce(p_record->>'delivery_sequence','') !~ '^[1-9][0-9]{0,14}$' OR coalesce(p_record->>'activation_sequence','') !~ '^[1-9][0-9]{0,14}$'
 OR coalesce(p_record->>'revision','') !~ '^[1-9][0-9]{0,8}$' OR id IS NULL
 THEN RAISE EXCEPTION 'invalid_legal_delivery' USING ERRCODE='22023'; END IF;
 seq:=(p_record->>'delivery_sequence')::bigint; activation:=(p_record->>'activation_sequence')::bigint; rev:=(p_record->>'revision')::integer;
 IF seq<=activation THEN RAISE EXCEPTION 'invalid_legal_sequence' USING ERRCODE='22023'; END IF;
 PERFORM public.validate_legal_governance_payload(p_record->>'kind',p_record->'payload');
 PERFORM public.legal_required_text(p_record,'legal_reviewer')::uuid;
 IF p_record->>'kind'='model' THEN
  PERFORM public.legal_required_text(p_record,'direction_reviewer')::uuid;
  IF p_record->>'direction_reviewer'=p_record->>'legal_reviewer' THEN RAISE EXCEPTION 'independent_legal_reviews_required' USING ERRCODE='22023'; END IF;
 ELSE PERFORM public.legal_required_text(p_record->'payload','legal_entity_id')::uuid; END IF;
 SELECT * INTO old FROM public.legal_governance_mirror WHERE source_id=id;
 IF FOUND THEN
  IF seq=old.delivery_sequence THEN
   IF old.envelope IS DISTINCT FROM p_record THEN RAISE EXCEPTION 'legal_delivery_conflict' USING ERRCODE='40001'; END IF; RETURN 'replayed';
  ELSIF seq<old.delivery_sequence THEN RETURN 'stale'; END IF;
  IF p_record->'payload' IS DISTINCT FROM old.payload OR p_record->>'kind' IS DISTINCT FROM old.kind
   OR activation IS DISTINCT FROM old.activation_sequence OR rev<=old.source_revision
   OR old.state='withdrawn' OR p_record->>'state'<>'withdrawn'
   THEN RAISE EXCEPTION 'published_legal_record_is_immutable' USING ERRCODE='55000'; END IF;
 END IF;
 INSERT INTO public.legal_governance_configuration(singleton,environment,public_origin) VALUES(true,p_environment,p_public_origin) ON CONFLICT(singleton) DO NOTHING;
 INSERT INTO public.legal_governance_mirror(source_id,kind,payload,state,source_revision,activation_sequence,delivery_sequence,envelope)
 VALUES(id,p_record->>'kind',p_record->'payload',p_record->>'state',rev,activation,seq,p_record)
 ON CONFLICT(source_id) DO UPDATE SET state=excluded.state,source_revision=excluded.source_revision,delivery_sequence=excluded.delivery_sequence,envelope=excluded.envelope,received_at=now();
 RETURN 'applied';
END; $$;

CREATE FUNCTION public.store_legal_identity_fields(p_store_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT jsonb_strip_nulls(jsonb_build_object('VENDEUR_NOM_LEGAL',btrim(b.legal_business_name),'SIREN_SIRET',regexp_replace(b.legal_siret,'\s','','g'),
 'ADRESSE',btrim(b.legal_address),'CONTACT_VENDEUR',lower(btrim(b.legal_email)),'TELEPHONE',nullif(btrim(b.legal_phone),'')))
 FROM public.boutiques b WHERE b.id=p_store_id;
$$;
CREATE FUNCTION public.read_store_legal_identity_for_review(p_store_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public,pg_temp AS $$
 SELECT jsonb_build_object('store_id',b.id,'owner_id',b.user_id,'fields',public.store_legal_identity_fields(b.id),
 'base_hash',encode(sha256(convert_to(jsonb_build_object('store_id',b.id,'owner_id',b.user_id,'fields',public.store_legal_identity_fields(b.id))::text,'UTF8')),'hex')) FROM public.boutiques b WHERE b.id=p_store_id;
$$;

CREATE FUNCTION public.compose_store_legal_bundle(p_store_id uuid,p_require_published boolean DEFAULT true) RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE b public.boutiques; ident public.legal_governance_mirror; model public.legal_governance_mirror;
 config public.legal_governance_configuration; fields jsonb; docs jsonb:='[]'; bundle jsonb; key text; body text; item record;
BEGIN
 PERFORM pg_advisory_xact_lock_shared(hashtextextended('bib-legal-governance',0));
 SELECT * INTO config FROM public.legal_governance_configuration WHERE singleton;
 SELECT * INTO b FROM public.boutiques WHERE id=p_store_id;
 IF b.id IS NULL OR (p_require_published AND b.status::text<>'published') OR config.environment IS NULL
 THEN RAISE EXCEPTION 'store_legal_documents_unavailable' USING ERRCODE='55000'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(ARRAY[b.legal_business_name,b.legal_siret,b.legal_address,b.legal_email]) value WHERE length(btrim(coalesce(value,'')))=0)
 THEN RAISE EXCEPTION 'seller_identity_incomplete' USING ERRCODE='55000'; END IF;
 SELECT * INTO ident FROM public.legal_governance_mirror WHERE kind='identity' AND payload->>'store_id'=p_store_id::text ORDER BY activation_sequence DESC LIMIT 1;
 IF ident.source_id IS NULL OR ident.state<>'published' OR ident.payload->>'owner_id' IS DISTINCT FROM b.user_id::text
 OR NOT (ident.payload->'fields' @> public.store_legal_identity_fields(p_store_id))
 OR ident.payload->'fields'->>'TELEPHONE' IS DISTINCT FROM nullif(btrim(b.legal_phone),'')
 THEN RAISE EXCEPTION 'seller_identity_not_verified' USING ERRCODE='55000'; END IF;
 IF b.slug !~ '^[a-z0-9_-]+$' THEN RAISE EXCEPTION 'invalid_legal_store_url' USING ERRCODE='22023'; END IF;
 fields:=ident.payload->'fields'||jsonb_build_object('BOUTIQUE_NOM',b.name,'URL_BOUTIQUE',config.public_origin||'/boutique/'||b.slug);
 IF fields->>'BOUTIQUE_NOM' LIKE '%{{%' OR fields->>'BOUTIQUE_NOM' LIKE '%}}%' THEN RAISE EXCEPTION 'invalid_legal_store_name' USING ERRCODE='22023'; END IF;
 FOREACH key IN ARRAY ARRAY['JUR-B01','JUR-B02','JUR-B03'] LOOP
  SELECT * INTO model FROM public.legal_governance_mirror WHERE kind='model' AND payload->>'model_key'=key
   AND (payload->>'effective_at')::timestamptz<=now() ORDER BY (payload->>'effective_at')::timestamptz DESC,activation_sequence DESC LIMIT 1;
  IF model.source_id IS NULL OR model.state<>'published' THEN RAISE EXCEPTION 'approved_legal_model_required: %',key USING ERRCODE='55000'; END IF;
  body:=model.payload->>'body';
  FOR item IN SELECT * FROM jsonb_each_text(fields||jsonb_build_object(
   'CGV_MODELE_VERSION',model.payload->>'version','CGU_MODELE_VERSION',model.payload->>'version',
   'CGV_BOUTIQUE_VERSION',model.payload->>'version'||'-'||left(encode(sha256(convert_to(fields::text||ident.source_id::text,'UTF8')),'hex'),16),
   'CGU_BOUTIQUE_VERSION',model.payload->>'version'||'-'||left(encode(sha256(convert_to(fields::text||ident.source_id::text,'UTF8')),'hex'),16),
   'DATE_EFFET',model.payload->>'effective_at')) LOOP body:=replace(body,'{{'||item.key||'}}',item.value); END LOOP;
  IF body LIKE '%{{%' OR body LIKE '%}}%' THEN RAISE EXCEPTION 'unresolved_legal_fields' USING ERRCODE='55000'; END IF;
  docs:=docs||jsonb_build_array(jsonb_build_object('model_id',model.source_id,'model_key',key,'version',model.payload->>'version','title',model.payload->>'title',
   'locale','fr','effective_at',model.payload->>'effective_at','text',body,'hash',encode(sha256(convert_to(body,'UTF8')),'hex')));
 END LOOP;
 bundle:=jsonb_build_object('store_id',b.id,'legal_entity_id',ident.payload->>'legal_entity_id','identity_review_id',ident.source_id,'seller',fields,'environment',config.environment,'documents',docs);
 RETURN bundle||jsonb_build_object('bundle_hash',encode(sha256(convert_to(bundle::text,'UTF8')),'hex'));
END; $$;
CREATE FUNCTION public.get_store_legal_bundle(p_store_id uuid) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 RETURN public.compose_store_legal_bundle(p_store_id,NOT EXISTS(SELECT 1 FROM public.boutiques b WHERE b.id=p_store_id AND b.user_id=auth.uid()));
END; $$;

CREATE FUNCTION public.guard_store_legal_publication() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.status::text='published' THEN RAISE EXCEPTION 'publish_store_after_legal_review' USING ERRCODE='55000'; END IF;
  RETURN NEW;
 END IF;
 IF (NEW.user_id,NEW.legal_business_name,NEW.legal_siret,NEW.legal_address,NEW.legal_email,NEW.legal_phone)
 IS DISTINCT FROM (OLD.user_id,OLD.legal_business_name,OLD.legal_siret,OLD.legal_address,OLD.legal_email,OLD.legal_phone) THEN
  IF NEW.status::text='published' THEN NEW.status:='draft'; END IF;
 ELSIF NEW.status::text='published' AND OLD.status::text IS DISTINCT FROM 'published' THEN
  PERFORM public.compose_store_legal_bundle(OLD.id,false);
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER guard_store_legal_publication BEFORE INSERT OR UPDATE ON public.boutiques FOR EACH ROW EXECUTE FUNCTION public.guard_store_legal_publication();

CREATE FUNCTION public.guard_order_legal_snapshot() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE s public.store_order_legal_snapshots;
BEGIN
 IF TG_OP='UPDATE' THEN
  IF NEW.legal_snapshot_id IS DISTINCT FROM OLD.legal_snapshot_id THEN RAISE EXCEPTION 'order_legal_evidence_is_immutable' USING ERRCODE='55000'; END IF;
  IF OLD.legal_snapshot_id IS NOT NULL AND (NEW.legal_snapshot_id,NEW.boutique_id,NEW.customer_email,NEW.product_id,NEW.quantity,NEW.amount)
   IS DISTINCT FROM (OLD.legal_snapshot_id,OLD.boutique_id,OLD.customer_email,OLD.product_id,OLD.quantity,OLD.amount)
  THEN RAISE EXCEPTION 'order_legal_evidence_is_immutable' USING ERRCODE='55000'; END IF;
  RETURN NEW;
 END IF;
 IF coalesce(NEW.sales_channel,'storefront')<>'storefront' THEN RETURN NEW; END IF;
 SELECT * INTO s FROM public.store_order_legal_snapshots WHERE id=NEW.legal_snapshot_id;
 IF s.id IS NULL OR s.boutique_id IS DISTINCT FROM NEW.boutique_id OR s.customer_email IS DISTINCT FROM lower(btrim(NEW.customer_email)) OR s.environment IS DISTINCT FROM NEW.stripe_environment
 THEN RAISE EXCEPTION 'order_legal_snapshot_required' USING ERRCODE='55000'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER guard_order_legal_snapshot BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_order_legal_snapshot();
CREATE FUNCTION public.immutable_store_legal_evidence() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
BEGIN RAISE EXCEPTION 'store_legal_evidence_is_immutable' USING ERRCODE='55000'; END; $$;
CREATE TRIGGER immutable_store_legal_evidence BEFORE UPDATE OR DELETE ON public.store_order_legal_snapshots FOR EACH ROW EXECUTE FUNCTION public.immutable_store_legal_evidence();

CREATE FUNCTION public.create_storefront_legal_orders(p_checkout_key uuid,p_store_id uuid,p_bundle_hash text,p_accepted boolean,p_customer_name text,p_customer_email text,p_environment text,p_lines jsonb) RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE s public.store_order_legal_snapshots; bundle jsonb; fingerprint jsonb; line jsonb; ids jsonb:='[]'; o record;
 document jsonb; evidence jsonb;
BEGIN
 IF p_accepted IS DISTINCT FROM true OR p_bundle_hash !~ '^[a-f0-9]{64}$' OR p_checkout_key IS NULL OR p_bundle_hash IS NULL
  OR length(btrim(coalesce(p_customer_name,''))) NOT BETWEEN 1 AND 200 OR lower(btrim(coalesce(p_customer_email,''))) !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  OR jsonb_typeof(p_lines) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'legal_acceptance_required' USING ERRCODE='22023'; END IF;
 IF jsonb_array_length(p_lines) NOT BETWEEN 1 AND 100 OR (SELECT count(DISTINCT x->>'product_id') FROM jsonb_array_elements(p_lines)x)<>jsonb_array_length(p_lines)
 THEN RAISE EXCEPTION 'invalid_legal_checkout_lines' USING ERRCODE='22023'; END IF;
 fingerprint:=jsonb_build_object('store_id',p_store_id,'bundle_hash',p_bundle_hash,'customer_name',btrim(p_customer_name),'customer_email',lower(btrim(p_customer_email)),'environment',p_environment,'lines',p_lines);
 PERFORM pg_advisory_xact_lock(hashtextextended(p_checkout_key::text,0));
 PERFORM 1 FROM public.boutiques WHERE id=p_store_id FOR SHARE;
 bundle:=public.compose_store_legal_bundle(p_store_id,true);
 IF bundle->>'bundle_hash' IS DISTINCT FROM p_bundle_hash THEN RAISE EXCEPTION 'legal_documents_changed' USING ERRCODE='40001'; END IF;
 IF bundle->>'environment' IS DISTINCT FROM p_environment THEN RAISE EXCEPTION 'legal_environment_mismatch' USING ERRCODE='22023'; END IF;
 SELECT * INTO s FROM public.store_order_legal_snapshots WHERE checkout_key=p_checkout_key;
 IF FOUND THEN
  IF s.request_fingerprint IS DISTINCT FROM fingerprint THEN RAISE EXCEPTION 'legal_checkout_key_conflict' USING ERRCODE='40001'; END IF;
  RETURN (SELECT jsonb_agg(jsonb_build_object('id',stored_order.id,'order_number',stored_order.order_number) ORDER BY ordered_line.position)
   FROM jsonb_array_elements(s.request_fingerprint->'lines') WITH ORDINALITY ordered_line(value,position)
   JOIN public.orders stored_order ON stored_order.product_id=(ordered_line.value->>'product_id')::uuid AND stored_order.legal_snapshot_id=s.id);
 END IF;
 evidence:=jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'type','store_documents_presented','bundle_hash',p_bundle_hash,'recorded_at',now(),'channel','storefront_checkout'));
 FOR document IN SELECT jsonb_array_elements(bundle->'documents') LOOP
  IF document->>'model_key' IN('JUR-B01','JUR-B02') THEN
   evidence:=evidence||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),
    'type',CASE document->>'model_key' WHEN 'JUR-B01' THEN 'store_cgv_accepted' ELSE 'store_cgu_accepted' END,
    'model_id',document->'model_id','model_key',document->'model_key','version',document->'version',
    'document_hash',document->'hash','recorded_at',now(),'channel','storefront_checkout'));
  END IF;
 END LOOP;
 INSERT INTO public.store_order_legal_snapshots(checkout_key,boutique_id,customer_email,bundle,bundle_hash,request_fingerprint,evidence_events,environment)
 VALUES(p_checkout_key,p_store_id,lower(btrim(p_customer_email)),bundle,p_bundle_hash,fingerprint,evidence,p_environment) RETURNING * INTO s;
 FOR line IN SELECT jsonb_array_elements(p_lines) LOOP
  IF jsonb_typeof(line) IS DISTINCT FROM 'object' OR EXISTS(SELECT 1 FROM jsonb_object_keys(line) k WHERE NOT k=ANY(ARRAY['product_id','quantity','unit_cents']))
   OR coalesce(line->>'quantity','') !~ '^[1-9][0-9]{0,3}$' OR coalesce(line->>'unit_cents','') !~ '^[1-9][0-9]{0,8}$'
   OR NOT EXISTS(SELECT 1 FROM public.products WHERE id=(line->>'product_id')::uuid AND boutique_id=p_store_id AND status::text='active')
   THEN RAISE EXCEPTION 'invalid_legal_checkout_line' USING ERRCODE='22023'; END IF;
  INSERT INTO public.orders(boutique_id,product_id,quantity,customer_name,customer_email,amount,payment_status,stripe_environment,sales_channel,legal_snapshot_id)
  VALUES(p_store_id,(line->>'product_id')::uuid,(line->>'quantity')::integer,btrim(p_customer_name),lower(btrim(p_customer_email)),
   (line->>'unit_cents')::numeric*(line->>'quantity')::integer/100,'pending',p_environment,'storefront',s.id) RETURNING id,order_number INTO o;
  ids:=ids||jsonb_build_array(jsonb_build_object('id',o.id,'order_number',o.order_number));
 END LOOP;
 RETURN ids;
END; $$;
CREATE FUNCTION public.track_order_legal_snapshot(_order_number text,_customer_email text) RETURNS jsonb
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT jsonb_build_object('bundle',s.bundle,'bundle_hash',s.bundle_hash,'accepted_at',s.accepted_at,'acceptance_statement',s.acceptance_statement,'channel',s.channel,'evidence_events',s.evidence_events)
 FROM public.orders o JOIN public.store_order_legal_snapshots s ON s.id=o.legal_snapshot_id
 WHERE o.order_number=upper(btrim(_order_number)) AND lower(btrim(o.customer_email))=lower(btrim(_customer_email)) LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.import_legal_governance_record(jsonb,text,text),public.store_legal_identity_fields(uuid),public.read_store_legal_identity_for_review(uuid),public.compose_store_legal_bundle(uuid,boolean),public.get_store_legal_bundle(uuid),public.create_storefront_legal_orders(uuid,uuid,text,boolean,text,text,text,jsonb),public.track_order_legal_snapshot(text,text),public.guard_store_legal_publication(),public.guard_order_legal_snapshot(),public.immutable_store_legal_evidence() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.import_legal_governance_record(jsonb,text,text),public.store_legal_identity_fields(uuid),public.read_store_legal_identity_for_review(uuid),public.compose_store_legal_bundle(uuid,boolean),public.create_storefront_legal_orders(uuid,uuid,text,boolean,text,text,text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_store_legal_bundle(uuid),public.track_order_legal_snapshot(text,text) TO anon,authenticated,service_role;

-- Keep the onboarding trigger aligned with the versions already shown by both
-- legalDocumentVersions.ts and .js. Preserve all historical acceptance rows.
CREATE OR REPLACE FUNCTION public.record_merchant_legal_acceptances() RETURNS trigger
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE accepted_versions jsonb;
BEGIN
 IF coalesce(NEW.raw_user_meta_data->>'account_type','platform')='platform' THEN
  accepted_versions:=NEW.raw_user_meta_data->'legal_acceptances';
  IF accepted_versions->>'cgu' IS DISTINCT FROM '2026-09' OR accepted_versions->>'cgv' IS DISTINCT FROM '2026-09'
   OR accepted_versions->>'privacy' IS DISTINCT FROM '2026-11-02' THEN
   RAISE EXCEPTION 'current_merchant_legal_versions_required' USING ERRCODE='22023'; END IF;
  INSERT INTO public.merchant_legal_acceptances(user_id,document_key,document_version) VALUES
   (NEW.id,'cgu','2026-09'),(NEW.id,'cgv','2026-09'),(NEW.id,'privacy_ack','2026-11-02');
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.record_merchant_legal_acceptances() FROM PUBLIC,anon,authenticated;

