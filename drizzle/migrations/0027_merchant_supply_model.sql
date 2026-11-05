-- Shared verbatim with Platform; copied into the two forward migrations.
CREATE FUNCTION public.supply_text(p jsonb,k text,max_length integer DEFAULT 2000) RETURNS text
 LANGUAGE plpgsql IMMUTABLE SET search_path=public,pg_temp AS $$
DECLARE v text:=p->>k;
BEGIN
 IF jsonb_typeof(p->k) IS DISTINCT FROM 'string' OR length(btrim(coalesce(v,''))) NOT BETWEEN 1 AND max_length
 THEN RAISE EXCEPTION 'required_supply_text: %',k USING ERRCODE='22023'; END IF; RETURN v;
END; $$;
CREATE FUNCTION public.supply_timestamp(value text) RETURNS timestamptz
 LANGUAGE plpgsql IMMUTABLE SET search_path=public,pg_temp AS $$
BEGIN
 IF value IS NULL OR value !~ '^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,3})?Z$'
 THEN RAISE EXCEPTION 'invalid_supply_validity' USING ERRCODE='22023'; END IF;
 RETURN value::timestamptz;
END; $$;
CREATE FUNCTION public.calculate_supply_quote(p jsonb) RETURNS jsonb
 LANGUAGE plpgsql IMMUTABLE SET search_path=public,pg_temp AS $$
DECLARE party jsonb; role text; line jsonb; components text[]:='{}'; net bigint:=0; tax bigint:=0; subtotal bigint; line_tax bigint;
 qty bigint; unit bigint; rate integer; issuer text; by_issuer jsonb:='{"supplier":0,"bib":0,"logistics":0}'; calculated jsonb:='[]'; by_issuer_net jsonb:='{"supplier":0,"bib":0,"logistics":0}';
BEGIN
 IF jsonb_typeof(p) IS DISTINCT FROM 'object' OR EXISTS(SELECT 1 FROM jsonb_object_keys(p) k WHERE NOT k=ANY(ARRAY['schema_version','model','purpose','merchant_id','boutique_id','catalog_id','supplier_id','quantity','currency','parties','lines','valid_until','mandate_reference','terms_reference','delivery_terms','ownership_terms']))
 OR jsonb_typeof(p->'schema_version') IS DISTINCT FROM 'number' OR p->>'schema_version' IS DISTINCT FROM '1' OR p->>'model' IS DISTINCT FROM 'transparent_intermediation' OR p->>'currency' IS DISTINCT FROM 'EUR'
 OR coalesce(p->>'purpose','') NOT IN('sample','stock','on_demand')
 THEN RAISE EXCEPTION 'invalid_supply_model' USING ERRCODE='22023'; END IF;
 FOREACH role IN ARRAY ARRAY['merchant_id','boutique_id','catalog_id','supplier_id'] LOOP
  PERFORM public.supply_text(p,role)::uuid;
 END LOOP;
 IF jsonb_typeof(p->'quantity') IS DISTINCT FROM 'number' OR (p->>'quantity') !~ '^[0-9]+$' OR (p->>'quantity')::bigint NOT BETWEEN 1 AND 100000
 THEN RAISE EXCEPTION 'invalid_supply_quantity' USING ERRCODE='22023'; END IF;
 IF jsonb_typeof(p->'parties') IS DISTINCT FROM 'object' OR EXISTS(SELECT 1 FROM jsonb_object_keys(p->'parties') k WHERE NOT k=ANY(ARRAY['merchant','supplier','bib','logistics']))
 THEN RAISE EXCEPTION 'invalid_supply_parties' USING ERRCODE='22023'; END IF;
 FOREACH role IN ARRAY ARRAY['merchant','supplier','bib','logistics'] LOOP
  party:=p->'parties'->role;
  IF role='logistics' AND party IS NULL THEN CONTINUE; END IF;
  IF jsonb_typeof(party) IS DISTINCT FROM 'object' OR EXISTS(SELECT 1 FROM jsonb_object_keys(party) k WHERE NOT k=ANY(ARRAY['entity_id','legal_name','registration_id','address','email','evidence_reference']))
  THEN RAISE EXCEPTION 'invalid_supply_party' USING ERRCODE='22023'; END IF;
  PERFORM public.supply_text(party,'entity_id')::uuid;
  PERFORM public.supply_text(party,'legal_name',500); PERFORM public.supply_text(party,'registration_id',500);
  PERFORM public.supply_text(party,'address',1000); PERFORM public.supply_text(party,'evidence_reference',500);
  IF public.supply_text(party,'email',500) !~ '^[^[:space:]@<>]+@[^[:space:]@<>]+\.[^[:space:]@<>]+$'
  THEN RAISE EXCEPTION 'invalid_supply_email' USING ERRCODE='22023'; END IF;
 END LOOP;
 IF p->'parties'->'supplier'->>'entity_id' IS DISTINCT FROM p->>'supplier_id'
 THEN RAISE EXCEPTION 'supplier_party_mismatch' USING ERRCODE='22023'; END IF;
 IF jsonb_typeof(p->'lines') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'lines')<>3
 THEN RAISE EXCEPTION 'three_supply_components_required' USING ERRCODE='22023'; END IF;
 FOR line IN SELECT jsonb_array_elements(p->'lines') LOOP
  IF jsonb_typeof(line) IS DISTINCT FROM 'object' OR EXISTS(SELECT 1 FROM jsonb_object_keys(line) k WHERE NOT k=ANY(ARRAY['component','issuer','label','quantity','unit_net_cents','tax_rate_bps','tax_reason']))
  OR coalesce(line->>'component','') NOT IN('goods','delivery','bib_fee') OR line->>'component'=ANY(components)
  OR coalesce(line->>'issuer','') NOT IN('supplier','bib','logistics')
  THEN RAISE EXCEPTION 'invalid_supply_line' USING ERRCODE='22023'; END IF;
  PERFORM public.supply_text(line,'label',500); PERFORM public.supply_text(line,'tax_reason',1000);
  FOREACH role IN ARRAY ARRAY['quantity','unit_net_cents','tax_rate_bps'] LOOP
   IF jsonb_typeof(line->role) IS DISTINCT FROM 'number' OR (line->>role) !~ '^[0-9]+$'
   THEN RAISE EXCEPTION 'invalid_supply_amount' USING ERRCODE='22023'; END IF;
  END LOOP;
  qty:=(line->>'quantity')::bigint; unit:=(line->>'unit_net_cents')::bigint; rate:=(line->>'tax_rate_bps')::integer; issuer:=line->>'issuer';
  IF qty NOT BETWEEN 1 AND 100000 OR unit NOT BETWEEN 0 AND 100000000 OR rate NOT BETWEEN 0 AND 10000
  OR (line->>'component'='goods' AND (issuer<>'supplier' OR qty<>(p->>'quantity')::bigint OR unit=0))
  OR (line->>'component'='bib_fee' AND issuer<>'bib') OR (issuer='logistics' AND NOT (p->'parties' ? 'logistics'))
  OR (p->'parties'->'merchant'->>'entity_id'=p->'parties'->'bib'->>'entity_id' AND issuer='bib' AND unit<>0)
  THEN RAISE EXCEPTION 'invalid_supply_issuer_or_amount' USING ERRCODE='22023'; END IF;
  subtotal:=qty*unit; line_tax:=floor((subtotal::numeric*rate+5000)/10000)::bigint;
  IF subtotal+line_tax>100000000000 THEN RAISE EXCEPTION 'supply_amount_limit' USING ERRCODE='22023'; END IF;
  net:=net+subtotal; tax:=tax+line_tax;
  by_issuer:=jsonb_set(by_issuer,ARRAY[issuer],to_jsonb((by_issuer->>issuer)::bigint+subtotal+line_tax));
  by_issuer_net:=jsonb_set(by_issuer_net,ARRAY[issuer],to_jsonb((by_issuer_net->>issuer)::bigint+subtotal));
  calculated:=calculated||jsonb_build_array(line||jsonb_build_object('net_cents',subtotal,'tax_cents',line_tax,'total_cents',subtotal+line_tax));
  components:=array_append(components,line->>'component');
 END LOOP;
 IF net+tax NOT BETWEEN 1 AND 100000000000 THEN RAISE EXCEPTION 'supply_amount_limit' USING ERRCODE='22023'; END IF;
 PERFORM public.supply_timestamp(public.supply_text(p,'valid_until'));
 FOREACH role IN ARRAY ARRAY['mandate_reference','terms_reference','delivery_terms','ownership_terms'] LOOP PERFORM public.supply_text(p,role); END LOOP;
 RETURN jsonb_build_object('currency','EUR','net_cents',net,'tax_cents',tax,'total_cents',net+tax,'by_issuer',by_issuer,'by_issuer_net',by_issuer_net,'lines',calculated);
END; $$;
CREATE FUNCTION public.calculate_catalog_acquisition_price(p jsonb) RETURNS bigint
 LANGUAGE plpgsql IMMUTABLE SET search_path=public,pg_temp AS $$
DECLARE key text; total bigint:=0; amount bigint;
BEGIN
 IF jsonb_typeof(p) IS DISTINCT FROM 'object' OR EXISTS(SELECT 1 FROM jsonb_object_keys(p) k WHERE NOT k=ANY(ARRAY['version','currency','goods_unit_cents','delivery_unit_cents','bib_fee_unit_cents'])) OR p->>'currency' IS DISTINCT FROM 'EUR'
 THEN RAISE EXCEPTION 'invalid_acquisition_price' USING ERRCODE='22023'; END IF;
 PERFORM public.supply_text(p,'version',100);
 FOREACH key IN ARRAY ARRAY['goods_unit_cents','delivery_unit_cents','bib_fee_unit_cents'] LOOP
  IF jsonb_typeof(p->key) IS DISTINCT FROM 'number' OR (p->>key) !~ '^[0-9]+$' THEN RAISE EXCEPTION 'invalid_acquisition_price' USING ERRCODE='22023'; END IF;
  amount:=(p->>key)::bigint;
  IF amount NOT BETWEEN 0 AND 100000000 OR (key='goods_unit_cents' AND amount=0) THEN RAISE EXCEPTION 'invalid_acquisition_price' USING ERRCODE='22023'; END IF;
  total:=total+amount;
 END LOOP;
 IF total NOT BETWEEN 1 AND 100000000 THEN RAISE EXCEPTION 'invalid_acquisition_price' USING ERRCODE='22023'; END IF;
 RETURN total;
END; $$;
REVOKE ALL ON FUNCTION public.supply_text(jsonb,text,integer),public.calculate_supply_quote(jsonb),public.calculate_catalog_acquisition_price(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.calculate_supply_quote(jsonb),public.calculate_catalog_acquisition_price(jsonb) TO authenticated,service_role;

REVOKE ALL ON FUNCTION public.supply_timestamp(text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.supply_timestamp(text) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.supply_text(jsonb,text,integer) TO authenticated,service_role;

ALTER TABLE public.supplier_products ADD COLUMN acquisition_pricing jsonb;
ALTER TABLE public.supplier_products ADD CONSTRAINT catalog_global_acquisition_price CHECK (
 acquisition_pricing IS NULL OR round(base_price::numeric*100)=public.calculate_catalog_acquisition_price(acquisition_pricing));

CREATE TABLE public.supply_payment_configuration (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton), enabled boolean NOT NULL DEFAULT false,
 platform_entity_id uuid, evidence_reference text,
 CHECK(NOT enabled OR (platform_entity_id IS NOT NULL AND length(btrim(coalesce(evidence_reference,'')))>0))
);
INSERT INTO public.supply_payment_configuration(singleton) VALUES(true);
CREATE TABLE public.supply_destination_routes (
 entity_id uuid NOT NULL, environment text NOT NULL CHECK(environment IN('sandbox','live')),
 flow text NOT NULL CHECK(flow IN('merchant_sale','merchant_acquisition')),
 model text NOT NULL DEFAULT 'destination_charges' CHECK(model IN('destination_charges','own_ei_principal')),
 account_id text CHECK(account_id ~ '^acct_[a-zA-Z0-9]+$'), enabled boolean NOT NULL DEFAULT false,
 evidence_reference text NOT NULL CHECK(length(btrim(evidence_reference)) BETWEEN 1 AND 500), tax_liability_approved boolean NOT NULL DEFAULT false,
 verified_at timestamptz NOT NULL, PRIMARY KEY(entity_id,environment,flow),
 CHECK(model='own_ei_principal' OR account_id IS NOT NULL)
);
CREATE TABLE public.merchant_supply_payments (
 quote_id uuid PRIMARY KEY, checkout_key uuid NOT NULL UNIQUE, merchant_id uuid NOT NULL, boutique_id uuid NOT NULL REFERENCES public.boutiques(id),
 payload jsonb NOT NULL, totals jsonb NOT NULL, quote_hash text NOT NULL, acceptance jsonb NOT NULL,
 environment text NOT NULL CHECK(environment IN('sandbox','live')), destination_account text NOT NULL,
 merchant_product_id uuid REFERENCES public.products(id),refunded_cents bigint NOT NULL DEFAULT 0,
 state text NOT NULL DEFAULT 'reserved' CHECK(state IN('reserved','checkout','paid','failed','refunded','partially_refunded','disputed')),
 stripe_session_id text UNIQUE, checkout_url text, stripe_payment_intent_id text,
 revision integer NOT NULL DEFAULT 1, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.merchant_supply_payment_events (
 event_id text PRIMARY KEY, quote_id uuid NOT NULL REFERENCES public.merchant_supply_payments(quote_id),
 state text NOT NULL, evidence jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.merchant_supply_payment_outbox (
 quote_id uuid NOT NULL REFERENCES public.merchant_supply_payments(quote_id), revision integer NOT NULL,
 command_key uuid NOT NULL DEFAULT gen_random_uuid(), payload jsonb NOT NULL, delivered_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(quote_id,revision)
);
ALTER TABLE public.supply_payment_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_destination_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_supply_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_supply_payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_supply_payment_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.supply_payment_configuration,public.supply_destination_routes,public.merchant_supply_payments,public.merchant_supply_payment_events,public.merchant_supply_payment_outbox FROM PUBLIC,anon,authenticated,service_role;
GRANT ALL ON public.supply_payment_configuration,public.supply_destination_routes TO service_role;
GRANT SELECT ON public.merchant_supply_payments,public.merchant_supply_payment_events,public.merchant_supply_payment_outbox TO service_role;
GRANT UPDATE(delivered_at) ON public.merchant_supply_payment_outbox TO service_role;

CREATE FUNCTION public.get_supply_destination_route(p_entity_id uuid,p_flow text,p_environment text) RETURNS jsonb
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.supply_destination_routes; cfg public.supply_payment_configuration;
BEGIN
 SELECT * INTO cfg FROM public.supply_payment_configuration WHERE singleton;
 SELECT * INTO r FROM public.supply_destination_routes WHERE entity_id=p_entity_id AND flow=p_flow AND environment=p_environment AND enabled;
 IF NOT coalesce(cfg.enabled,false) OR r.entity_id IS NULL OR NOT r.tax_liability_approved
 OR (r.model='own_ei_principal' AND (r.entity_id IS DISTINCT FROM cfg.platform_entity_id OR r.flow<>'merchant_sale'))
 THEN RAISE EXCEPTION 'verified_destination_unavailable' USING ERRCODE='55000'; END IF;
 RETURN jsonb_build_object('entity_id',r.entity_id,'flow',r.flow,'environment',r.environment,'model',r.model,'account_id',r.account_id,'enabled',r.enabled);
END; $$;
CREATE FUNCTION public.get_storefront_destination_route(p_boutique_id uuid,p_environment text) RETURNS jsonb
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE bundle jsonb;
BEGIN
 bundle:=public.compose_store_legal_bundle(p_boutique_id,true);
 IF bundle->>'environment' IS DISTINCT FROM p_environment THEN RAISE EXCEPTION 'payment_environment_mismatch' USING ERRCODE='22023'; END IF;
 RETURN public.get_supply_destination_route((bundle->>'legal_entity_id')::uuid,'merchant_sale',p_environment);
END; $$;
-- Canonical, current Platform proof. A browser-provided approval ID is never sufficient.
CREATE FUNCTION public.verified_supply_sample(p_merchant_id uuid,p_boutique_id uuid,p_catalog_id text,p_environment text) RETURNS jsonb
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE proof jsonb;
BEGIN
 IF p_environment IS NULL OR p_environment NOT IN('sandbox','live') OR NOT EXISTS(SELECT 1 FROM public.boutiques WHERE id=p_boutique_id AND user_id=p_merchant_id)
 THEN RAISE EXCEPTION 'verified_paid_sample_required' USING ERRCODE='42501'; END IF;
 SELECT jsonb_build_object('merchant_id',p_merchant_id,'boutique_id',p_boutique_id,'catalog_id',p_catalog_id,'product_id',p.id,'sample_id',v.id,'purchase_id',sp.id,
  'visual_confirmed_at',v.visual_confirmed_at,'environment',p_environment,'verified_at',to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) INTO proof
 FROM public.products p JOIN public.supplier_products c ON c.id=p.supplier_product_id
 JOIN public.sample_validations v ON v.product_id=p.id AND v.user_id=p_merchant_id
 JOIN public.sample_purchases sp ON sp.product_id=v.product_id AND sp.user_id=v.user_id
 WHERE p.boutique_id=p_boutique_id AND c.intranet_id=p_catalog_id AND c.is_active AND v.status='validated' AND v.visual_confirmed_at IS NOT NULL
 AND sp.payment_status='paid' AND sp.stripe_environment=p_environment ORDER BY v.visual_confirmed_at DESC LIMIT 1;
 IF proof IS NULL THEN RAISE EXCEPTION 'verified_paid_sample_required' USING ERRCODE='55000'; END IF;
 RETURN proof;
END; $$;
REVOKE ALL ON FUNCTION public.verified_supply_sample(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.verified_supply_sample(uuid,uuid,text,text) TO service_role;
CREATE FUNCTION public.reserve_merchant_supply_payment(p_quote jsonb,p_merchant_id uuid,p_boutique_id uuid,p_environment text,p_checkout_key uuid) RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE q public.merchant_supply_payments; bundle jsonb; route jsonb; totals jsonb; payload jsonb:=p_quote->'payload'; expected_hash text; merchant_product uuid;
BEGIN
 IF p_checkout_key IS NULL OR p_environment IS NULL OR p_environment NOT IN('sandbox','live') OR p_quote->>'state' IS DISTINCT FROM 'accepted'
 OR p_quote->>'checkout_eligible' IS DISTINCT FROM 'true'
 OR payload->>'merchant_id' IS DISTINCT FROM p_merchant_id::text OR payload->>'boutique_id' IS DISTINCT FROM p_boutique_id::text
 OR (payload->>'valid_until')::timestamptz<=now()
 OR NOT EXISTS(SELECT 1 FROM public.boutiques WHERE id=p_boutique_id AND user_id=p_merchant_id)
 THEN RAISE EXCEPTION 'accepted_supply_quote_required' USING ERRCODE='42501'; END IF;
 totals:=public.calculate_supply_quote(payload); expected_hash:=encode(sha256(convert_to(payload::text,'UTF8')),'hex');
 IF p_quote->>'quote_hash' IS DISTINCT FROM expected_hash OR p_quote->'totals' IS DISTINCT FROM totals
 OR p_quote->'acceptance'->>'quote_hash' IS DISTINCT FROM expected_hash OR p_quote->'acceptance'->>'actor_id' IS DISTINCT FROM p_merchant_id::text
 THEN RAISE EXCEPTION 'supply_evidence_mismatch' USING ERRCODE='22023'; END IF;
 bundle:=public.compose_store_legal_bundle(p_boutique_id,false);
 IF bundle->>'environment' IS DISTINCT FROM p_environment OR payload->'parties'->'merchant'->>'entity_id' IS DISTINCT FROM bundle->>'legal_entity_id'
 OR payload->'parties'->'merchant'->>'legal_name' IS DISTINCT FROM bundle->'seller'->>'VENDEUR_NOM_LEGAL'
 OR payload->'parties'->'merchant'->>'registration_id' IS DISTINCT FROM bundle->'seller'->>'SIREN_SIRET'
 OR payload->'parties'->'merchant'->>'address' IS DISTINCT FROM bundle->'seller'->>'ADRESSE'
 OR payload->'parties'->'bib'->>'entity_id' IS DISTINCT FROM (SELECT platform_entity_id::text FROM public.supply_payment_configuration WHERE singleton)
 THEN RAISE EXCEPTION 'current_supply_buyer_required' USING ERRCODE='40001'; END IF;
 IF (totals->'by_issuer'->>'logistics')::bigint<>0 THEN RAISE EXCEPTION 'destination_charges_single_beneficiary_required' USING ERRCODE='55000'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.supplier_products WHERE intranet_id=payload->>'catalog_id' AND is_active AND acquisition_pricing IS NOT NULL)
 THEN RAISE EXCEPTION 'approved_catalog_price_required' USING ERRCODE='55000'; END IF;
 SELECT p.id INTO merchant_product FROM public.products p JOIN public.supplier_products sp ON sp.id=p.supplier_product_id
 WHERE p.boutique_id=p_boutique_id AND sp.intranet_id=payload->>'catalog_id' ORDER BY p.id LIMIT 1;
 IF payload->>'purpose'<>'sample' THEN PERFORM public.verified_supply_sample(p_merchant_id,p_boutique_id,payload->>'catalog_id',p_environment); END IF;
 IF payload->>'purpose'='sample' THEN
  IF merchant_product IS NULL THEN RAISE EXCEPTION 'sample_product_selection_required' USING ERRCODE='22023'; END IF;
  -- Fail before calling Stripe if the staging mail/sample baseline has not been reconciled.
  PERFORM 1 FROM public.sample_purchases LIMIT 0; PERFORM 1 FROM public.sample_validations LIMIT 0;
 END IF;
 route:=public.get_supply_destination_route((payload->>'supplier_id')::uuid,'merchant_acquisition',p_environment);
 PERFORM pg_advisory_xact_lock(hashtextextended('supply-payment:'||(p_quote->>'id'),0));
 SELECT * INTO q FROM public.merchant_supply_payments WHERE quote_id=(p_quote->>'id')::uuid FOR UPDATE;
 IF FOUND THEN
  IF q.quote_hash IS DISTINCT FROM expected_hash OR q.merchant_id<>p_merchant_id OR q.boutique_id<>p_boutique_id OR q.environment<>p_environment OR q.destination_account IS DISTINCT FROM route->>'account_id' THEN RAISE EXCEPTION 'supply_checkout_conflict' USING ERRCODE='40001'; END IF;
  RETURN to_jsonb(q);
 END IF;
 INSERT INTO public.merchant_supply_payments(quote_id,checkout_key,merchant_id,boutique_id,payload,totals,quote_hash,acceptance,environment,destination_account,merchant_product_id)
 VALUES((p_quote->>'id')::uuid,p_checkout_key,p_merchant_id,p_boutique_id,payload,totals,expected_hash,p_quote->'acceptance',p_environment,route->>'account_id',merchant_product) RETURNING * INTO q;
 RETURN to_jsonb(q);
END; $$;
CREATE FUNCTION public.attach_merchant_supply_session(p_quote_id uuid,p_checkout_key uuid,p_session_id text,p_checkout_url text) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE q public.merchant_supply_payments;
BEGIN
 SELECT * INTO q FROM public.merchant_supply_payments WHERE quote_id=p_quote_id FOR UPDATE;
 IF q.quote_id IS NULL OR q.checkout_key IS DISTINCT FROM p_checkout_key OR p_session_id !~ '^cs_' OR p_checkout_url NOT LIKE 'https://checkout.stripe.com/%'
 OR q.state NOT IN('reserved','checkout') OR (q.stripe_session_id IS NOT NULL AND q.stripe_session_id<>p_session_id)
 THEN RAISE EXCEPTION 'supply_session_conflict' USING ERRCODE='40001'; END IF;
 UPDATE public.merchant_supply_payments SET stripe_session_id=p_session_id,checkout_url=p_checkout_url,state='checkout',updated_at=now() WHERE quote_id=p_quote_id;
END; $$;
CREATE FUNCTION public.record_merchant_supply_payment(p_session jsonb,p_payment_intent jsonb,p_environment text,p_event_id text) RETURNS void
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE q public.merchant_supply_payments; evidence jsonb; previous public.merchant_supply_payment_events; charge jsonb:=p_payment_intent->'latest_charge'; refunded bigint; initial_state text;
BEGIN
 SELECT * INTO previous FROM public.merchant_supply_payment_events WHERE event_id=p_event_id;
 IF FOUND THEN RETURN; END IF;
 SELECT * INTO q FROM public.merchant_supply_payments WHERE stripe_session_id=p_session->>'id' FOR UPDATE;
 IF q.quote_id IS NULL OR q.environment IS DISTINCT FROM p_environment OR p_session->>'payment_status' IS DISTINCT FROM 'paid'
 OR p_session->>'amount_total' IS DISTINCT FROM q.totals->>'total_cents' OR p_session->>'currency' IS DISTINCT FROM 'eur'
 OR p_session->'metadata'->>'supply_quote_id' IS DISTINCT FROM q.quote_id::text OR p_session->'metadata'->>'quote_hash' IS DISTINCT FROM q.quote_hash
 OR p_payment_intent->>'status' IS DISTINCT FROM 'succeeded' OR p_payment_intent->>'on_behalf_of' IS DISTINCT FROM q.destination_account
 OR p_payment_intent->'transfer_data'->>'destination' IS DISTINCT FROM q.destination_account
 OR coalesce((p_payment_intent->>'application_fee_amount')::bigint,0)<>(q.totals->'by_issuer'->>'bib')::bigint
 OR p_payment_intent->>'id' IS DISTINCT FROM p_session->>'payment_intent'
 OR p_payment_intent->>'amount_received' IS DISTINCT FROM q.totals->>'total_cents' OR p_payment_intent->>'currency' IS DISTINCT FROM 'eur'
 OR jsonb_typeof(charge) IS DISTINCT FROM 'object' OR charge->>'payment_intent' IS DISTINCT FROM p_payment_intent->>'id'
 OR charge->>'amount' IS DISTINCT FROM q.totals->>'total_cents' OR charge->>'currency' IS DISTINCT FROM 'eur' OR charge->>'paid' IS DISTINCT FROM 'true'
 OR coalesce(charge->>'amount_refunded','') !~ '^[0-9]+$'
 THEN RAISE EXCEPTION 'supply_payment_mismatch' USING ERRCODE='22023'; END IF;
 IF q.state='paid' THEN RETURN; END IF;
 IF q.state NOT IN('checkout','reserved') THEN RAISE EXCEPTION 'supply_payment_state_conflict' USING ERRCODE='40001'; END IF;
 -- Inspect the current expanded charge: a refund/dispute can arrive before checkout completion.
 refunded:=(charge->>'amount_refunded')::bigint;
 IF refunded>(q.totals->>'total_cents')::bigint THEN RAISE EXCEPTION 'supply_payment_mismatch' USING ERRCODE='22023'; END IF;
 initial_state:=CASE WHEN refunded=(q.totals->>'total_cents')::bigint THEN 'refunded' WHEN charge->>'disputed'='true' THEN 'disputed' WHEN refunded>0 THEN 'partially_refunded' ELSE 'paid' END;
 UPDATE public.merchant_supply_payments SET state=initial_state,refunded_cents=refunded,stripe_payment_intent_id=p_payment_intent->>'id',revision=revision+1,updated_at=now() WHERE quote_id=q.quote_id RETURNING * INTO q;
 evidence:=jsonb_build_object('quote_id',q.quote_id,'quote_hash',q.quote_hash,'environment',q.environment,'amount_cents',q.totals->'total_cents','currency','EUR',
  'supplier_cents',q.totals->'by_issuer'->'supplier','bib_revenue_cents',q.totals->'by_issuer_net'->'bib','bib_collected_cents',q.totals->'by_issuer'->'bib','stripe_session_id',q.stripe_session_id,'event_id',p_event_id,'state',q.state,'refunded_cents',q.refunded_cents,'requires_finance_review',q.state<>'paid','revision',q.revision);
 INSERT INTO public.merchant_supply_payment_events VALUES(p_event_id,q.quote_id,q.state,evidence,now());
 INSERT INTO public.merchant_supply_payment_outbox(quote_id,revision,payload) VALUES(q.quote_id,q.revision,evidence);
 IF q.payload->>'purpose'='sample' AND q.state='paid' THEN
  INSERT INTO public.sample_purchases(product_id,user_id,stripe_session_id,stripe_environment,amount_cents,currency,payment_status,paid_at)
  VALUES(q.merchant_product_id,q.merchant_id,q.stripe_session_id,q.environment,(q.totals->>'total_cents')::integer,'eur','paid',now()) ON CONFLICT(stripe_session_id) DO NOTHING;
  INSERT INTO public.sample_validations(product_id,user_id,status,ordered_at) VALUES(q.merchant_product_id,q.merchant_id,'ordered',now())
  ON CONFLICT(product_id,user_id) DO UPDATE SET status='ordered',ordered_at=now() WHERE sample_validations.status='none';
 END IF;
END; $$;
CREATE FUNCTION public.adjust_merchant_supply_payment(p_payment_intent_id text,p_environment text,p_event_id text,p_state text,p_refunded_cents bigint,p_evidence jsonb) RETURNS boolean
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE q public.merchant_supply_payments; evidence jsonb;
BEGIN
 SELECT * INTO q FROM public.merchant_supply_payments WHERE stripe_payment_intent_id=p_payment_intent_id AND environment=p_environment FOR UPDATE;
 IF q.quote_id IS NULL THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM public.merchant_supply_payment_events WHERE event_id=p_event_id) THEN RETURN true; END IF;
 IF p_refunded_cents<0 THEN RAISE EXCEPTION 'invalid_supply_adjustment' USING ERRCODE='22023'; END IF;
 IF p_refunded_cents<q.refunded_cents THEN RETURN true; END IF;
 IF p_state IS NULL OR p_state NOT IN('refunded','partially_refunded','disputed','paid') OR p_refunded_cents IS NULL OR p_refunded_cents>(q.totals->>'total_cents')::bigint
 OR (p_state='paid' AND p_evidence->>'dispute_status' IS DISTINCT FROM 'won')
 OR (p_state='paid' AND p_refunded_cents<>0) OR (p_state='partially_refunded' AND (p_refunded_cents<=0 OR p_refunded_cents>=(q.totals->>'total_cents')::bigint))
 OR (p_state='refunded' AND p_refunded_cents<>(q.totals->>'total_cents')::bigint)
 THEN RAISE EXCEPTION 'invalid_supply_adjustment' USING ERRCODE='22023'; END IF;
 UPDATE public.merchant_supply_payments SET state=p_state,refunded_cents=p_refunded_cents,revision=revision+1,updated_at=now() WHERE quote_id=q.quote_id RETURNING * INTO q;
 evidence:=jsonb_build_object('quote_id',q.quote_id,'quote_hash',q.quote_hash,'environment',q.environment,'amount_cents',q.totals->'total_cents','currency','EUR',
  'supplier_cents',q.totals->'by_issuer'->'supplier','bib_revenue_cents',q.totals->'by_issuer_net'->'bib','bib_collected_cents',q.totals->'by_issuer'->'bib','stripe_session_id',q.stripe_session_id,'event_id',p_event_id,'state',q.state,'refunded_cents',q.refunded_cents,'revision',q.revision,'requires_finance_review',true,'psp_evidence',p_evidence);
 INSERT INTO public.merchant_supply_payment_events VALUES(p_event_id,q.quote_id,q.state,evidence,now());
 INSERT INTO public.merchant_supply_payment_outbox(quote_id,revision,payload) VALUES(q.quote_id,q.revision,evidence);
 IF q.payload->>'purpose'='sample' THEN UPDATE public.sample_purchases SET payment_status=CASE WHEN p_state='paid' THEN 'paid' ELSE 'failed' END WHERE stripe_session_id=q.stripe_session_id AND stripe_environment=q.environment; END IF;
 RETURN true;
END; $$;
CREATE FUNCTION public.fail_merchant_supply_checkout(p_session_id text,p_environment text) RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path=public,pg_temp AS $$
 UPDATE public.merchant_supply_payments SET state='failed',updated_at=now() WHERE stripe_session_id=p_session_id AND environment=p_environment AND state IN('reserved','checkout');
$$;
CREATE FUNCTION public.get_own_supply_payments(p_boutique_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT coalesce(jsonb_agg(jsonb_build_object('quote_id',q.quote_id,'state',q.state,'amount_cents',q.totals->'total_cents','currency','EUR','updated_at',q.updated_at)),'[]') FROM public.merchant_supply_payments q
 WHERE q.boutique_id=p_boutique_id AND q.merchant_id=auth.uid() AND EXISTS(SELECT 1 FROM public.boutiques b WHERE b.id=p_boutique_id AND b.user_id=auth.uid());
$$;
REVOKE ALL ON FUNCTION public.get_supply_destination_route(uuid,text,text),public.get_storefront_destination_route(uuid,text),public.reserve_merchant_supply_payment(jsonb,uuid,uuid,text,uuid),public.attach_merchant_supply_session(uuid,uuid,text,text),public.record_merchant_supply_payment(jsonb,jsonb,text,text),public.get_own_supply_payments(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.get_supply_destination_route(uuid,text,text),public.get_storefront_destination_route(uuid,text),public.reserve_merchant_supply_payment(jsonb,uuid,uuid,text,uuid),public.attach_merchant_supply_session(uuid,uuid,text,text),public.record_merchant_supply_payment(jsonb,jsonb,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_own_supply_payments(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.adjust_merchant_supply_payment(text,text,text,text,bigint,jsonb),public.fail_merchant_supply_checkout(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_merchant_supply_payment(text,text,text,text,bigint,jsonb),public.fail_merchant_supply_checkout(text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.require_sample_before_supplier_restock() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE owner_id uuid; source_catalog text; environment text;
BEGIN
 SELECT b.user_id,c.intranet_id INTO owner_id,source_catalog FROM public.products p JOIN public.boutiques b ON b.id=p.boutique_id JOIN public.supplier_products c ON c.id=p.supplier_product_id
 WHERE p.id=NEW.product_id AND p.boutique_id=NEW.boutique_id AND p.supplier_product_id=NEW.supplier_product_id;
 SELECT configuration.environment INTO environment FROM public.legal_governance_configuration configuration WHERE singleton;
 PERFORM public.verified_supply_sample(owner_id,NEW.boutique_id,source_catalog,environment);
 RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS supplier_restock_requires_validated_sample ON public.stock_restock_requests;
CREATE TRIGGER supplier_restock_requires_validated_sample BEFORE INSERT ON public.stock_restock_requests FOR EACH ROW EXECUTE FUNCTION public.require_sample_before_supplier_restock();
REVOKE ALL ON FUNCTION public.require_sample_before_supplier_restock() FROM PUBLIC,anon,authenticated;
