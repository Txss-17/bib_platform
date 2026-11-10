-- Forward-only. Validate in isolated staging before applying; no legacy SQL replay.
-- Optional email subscriptions are independent of accounts, orders and cookies.
CREATE TABLE public.marketing_service_configuration (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 enabled boolean NOT NULL DEFAULT false,
 public_origin text CHECK(public_origin ~ '^https://[a-z0-9][a-z0-9.-]*(:[0-9]+)?$'),
 confirmation_from_address text CHECK(confirmation_from_address ~ '^[a-z0-9][a-z0-9._+%=-]*@[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}$'),
 sender_domain text CHECK(sender_domain ~ '^[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}$'),
 bib_enabled boolean NOT NULL DEFAULT false,
 bib_controller_id uuid,
 bib_controller_name text CHECK(length(btrim(bib_controller_name)) BETWEEN 2 AND 250),
 CHECK(NOT enabled OR (public_origin IS NOT NULL AND confirmation_from_address IS NOT NULL AND sender_domain IS NOT NULL)),
 CHECK(NOT bib_enabled OR (bib_controller_id IS NOT NULL AND bib_controller_name IS NOT NULL))
);
INSERT INTO public.marketing_service_configuration(singleton) VALUES(true);
-- The old anonymous CRM insert is not the subscription endpoint anymore.
-- Guarded: the legacy CRM table is absent from some environments.
DO $guard$ BEGIN
 IF to_regclass('public.boutique_customers') IS NOT NULL THEN
  EXECUTE 'DROP POLICY IF EXISTS "Anon can insert newsletter signup on published boutique" ON public.boutique_customers';
  EXECUTE 'REVOKE INSERT ON public.boutique_customers FROM anon';
 END IF;
END $guard$;

CREATE TABLE public.marketing_subscriptions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 scope_key text NOT NULL,
 boutique_id uuid REFERENCES public.boutiques(id),
 controller_key text NOT NULL,
 controller_name text NOT NULL,
 audience_name text NOT NULL,
 email text NOT NULL CHECK(email=lower(btrim(email)) AND length(email)<=254 AND email ~ '^[a-z0-9][a-z0-9._+%=-]*@[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}$'),
 locale text NOT NULL CHECK(locale IN ('fr','en')),
 notice_version text NOT NULL,
 notice_text text NOT NULL,
 notice_hash text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','withdrawn')),
 generation integer NOT NULL DEFAULT 0,
 unsubscribe_token text NOT NULL DEFAULT replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','') UNIQUE,
 confirmed_at timestamptz,
 expires_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(scope_key,controller_key,email),
 CHECK(scope_key=coalesce(boutique_id::text,'bib'))
);
CREATE TABLE public.marketing_subscription_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 subscription_id uuid NOT NULL REFERENCES public.marketing_subscriptions(id) ON DELETE CASCADE,
 token_hash text NOT NULL UNIQUE,
 generation integer NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours',
 used_at timestamptz
);
CREATE TABLE public.marketing_consent_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 subscription_id uuid NOT NULL REFERENCES public.marketing_subscriptions(id) ON DELETE CASCADE,
 request_id uuid,
 action text NOT NULL CHECK(action IN ('requested','confirmed','withdrawn')),
 scope_key text NOT NULL,
 controller_key text NOT NULL,
 notice_version text NOT NULL,
 notice_hash text NOT NULL,
 notice_text text NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX marketing_requests_created_idx ON public.marketing_subscription_requests(created_at);
CREATE INDEX marketing_events_subscription_idx ON public.marketing_consent_events(subscription_id,occurred_at);
ALTER TABLE public.marketing_service_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_subscription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_consent_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.marketing_service_configuration,public.marketing_subscriptions,public.marketing_subscription_requests,public.marketing_consent_events FROM PUBLIC,anon,authenticated,service_role;
GRANT ALL ON public.marketing_service_configuration TO service_role;
GRANT SELECT ON public.marketing_subscriptions,public.marketing_subscription_requests,public.marketing_consent_events TO service_role;

CREATE FUNCTION public.marketing_subscription_context(p_boutique_id uuid DEFAULT NULL,p_locale text DEFAULT 'fr') RETURNS jsonb
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE cfg public.marketing_service_configuration; bundle jsonb; b public.boutiques;
 controller text; controller_id text; audience text; notice text; result jsonb;
BEGIN
 SELECT * INTO cfg FROM public.marketing_service_configuration WHERE singleton;
 IF NOT coalesce(cfg.enabled,false) OR p_locale NOT IN ('fr','en') OR p_locale IS NULL
 THEN RAISE EXCEPTION 'marketing_unavailable' USING ERRCODE='55000'; END IF;
 IF p_boutique_id IS NULL THEN
  IF NOT cfg.bib_enabled THEN RAISE EXCEPTION 'marketing_unavailable' USING ERRCODE='55000'; END IF;
  controller:=cfg.bib_controller_name; controller_id:=cfg.bib_controller_id::text; audience:='BIB';
 ELSE
  -- Exact current seller and published legal documents; no merchant-imported flag is consent.
  bundle:=public.compose_store_legal_bundle(p_boutique_id,true);
  IF cfg.public_origin IS DISTINCT FROM (SELECT public_origin FROM public.legal_governance_configuration WHERE singleton)
  THEN RAISE EXCEPTION 'marketing_origin_mismatch' USING ERRCODE='55000'; END IF;
  SELECT * INTO b FROM public.boutiques WHERE id=p_boutique_id;
  controller:=bundle->'seller'->>'VENDEUR_NOM_LEGAL'; controller_id:=bundle->>'legal_entity_id'; audience:=b.name;
 END IF;
 IF coalesce(length(btrim(controller)),0)<2 OR controller_id IS NULL OR coalesce(length(btrim(audience)),0)=0
 THEN RAISE EXCEPTION 'marketing_identity_missing' USING ERRCODE='55000'; END IF;
 IF p_locale='en' THEN
  notice:=format('I agree to receive offers and news from %s by email, under the responsibility of %s. This choice is optional and independent of purchases, accounts and cookies. I can unsubscribe in every email. It does not cover other stores, partners, location tracking or device fingerprinting. My subscription expires after three years unless I subscribe again.',audience,controller);
  IF p_boutique_id IS NOT NULL THEN notice:=notice||' Offers may be selected according to the amount of my purchases from this sender, without using browsing statistics.'; END IF;
 ELSE
  notice:=format('J’accepte de recevoir par email les offres et nouveautés de %s, sous la responsabilité de %s. Ce choix est facultatif et indépendant des achats, du compte et des cookies. Je peux me désabonner dans chaque email. Il ne couvre ni les autres boutiques, ni les partenaires, ni la géolocalisation, ni l’empreinte de mon appareil. Mon abonnement expire après trois ans sans nouvelle inscription.',audience,controller);
  IF p_boutique_id IS NOT NULL THEN notice:=notice||' Les offres peuvent être sélectionnées selon le montant de mes achats auprès de cet expéditeur, sans utiliser mes statistiques de navigation.'; END IF;
 END IF;
 result:=jsonb_build_object('scope_key',coalesce(p_boutique_id::text,'bib'),'boutique_id',p_boutique_id,
  'controller_key',controller_id,'controller_name',controller,'audience_name',audience,'locale',p_locale,
  'notice_version','2026-11-05.1','notice_text',notice,'privacy_url',cfg.public_origin||'/confidentialite');
 RETURN result||jsonb_build_object('notice_hash',encode(sha256(convert_to(result::text,'UTF8')),'hex'));
END; $$;

CREATE FUNCTION public.record_marketing_consent_event(p_subscription_id uuid,p_action text,p_request_id uuid DEFAULT NULL) RETURNS void
 LANGUAGE sql SECURITY DEFINER SET search_path=public,pg_temp AS $$
 INSERT INTO public.marketing_consent_events(subscription_id,request_id,action,scope_key,controller_key,notice_version,notice_hash,notice_text)
 SELECT id,p_request_id,p_action,scope_key,controller_key,notice_version,notice_hash,notice_text FROM public.marketing_subscriptions WHERE id=p_subscription_id;
$$;

CREATE FUNCTION public.request_marketing_subscription(p_boutique_id uuid,p_locale text,p_email text,p_notice_hash text,p_accepted boolean) RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE ctx jsonb; cfg public.marketing_service_configuration; s public.marketing_subscriptions;
 email_normalized text:=lower(btrim(p_email)); token text; rid uuid; link text; notice_html text;
BEGIN
 IF p_accepted IS DISTINCT FROM true OR coalesce(length(email_normalized),0)>254 OR email_normalized IS NULL
 OR email_normalized !~ '^[a-z0-9][a-z0-9._+%=-]*@[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}$'
 THEN RAISE EXCEPTION 'invalid_marketing_request' USING ERRCODE='22023'; END IF;
 ctx:=public.marketing_subscription_context(p_boutique_id,p_locale);
 IF p_notice_hash IS DISTINCT FROM ctx->>'notice_hash' THEN RAISE EXCEPTION 'marketing_notice_changed' USING ERRCODE='40001'; END IF;
 -- Short transaction-wide serialization gives deterministic rate limits without IP/device tracking.
 PERFORM pg_advisory_xact_lock(hashtextextended('bib-marketing-requests',0));
 IF EXISTS(SELECT 1 FROM public.suppressed_emails WHERE lower(email)=email_normalized) THEN RETURN jsonb_build_object('accepted',true); END IF;
 SELECT * INTO s FROM public.marketing_subscriptions WHERE scope_key=ctx->>'scope_key' AND controller_key=ctx->>'controller_key' AND email=email_normalized FOR UPDATE;
 IF s.status='active' AND s.expires_at>now() AND s.notice_hash=ctx->>'notice_hash' THEN RETURN jsonb_build_object('accepted',true); END IF;
 IF EXISTS(SELECT 1 FROM public.marketing_subscription_requests r JOIN public.marketing_subscriptions sub ON sub.id=r.subscription_id WHERE sub.email=email_normalized AND r.created_at>now()-interval '15 minutes')
 OR (SELECT count(*) FROM public.marketing_subscription_requests r JOIN public.marketing_subscriptions sub ON sub.id=r.subscription_id WHERE sub.email=email_normalized AND r.created_at>now()-interval '1 day')>=3
 THEN RETURN jsonb_build_object('accepted',true); END IF;
 IF (SELECT count(*) FROM public.marketing_subscription_requests WHERE created_at>now()-interval '1 hour')>=2000
 OR (SELECT count(*) FROM public.marketing_subscription_requests r JOIN public.marketing_subscriptions sub ON sub.id=r.subscription_id WHERE sub.scope_key=ctx->>'scope_key' AND r.created_at>now()-interval '1 hour')>=500
 THEN RAISE EXCEPTION 'marketing_rate_limited' USING ERRCODE='54000'; END IF;
 INSERT INTO public.marketing_subscriptions(scope_key,boutique_id,controller_key,controller_name,audience_name,email,locale,notice_version,notice_text,notice_hash)
 VALUES(ctx->>'scope_key',p_boutique_id,ctx->>'controller_key',ctx->>'controller_name',ctx->>'audience_name',email_normalized,p_locale,ctx->>'notice_version',ctx->>'notice_text',ctx->>'notice_hash')
 ON CONFLICT(scope_key,controller_key,email) DO UPDATE SET controller_name=excluded.controller_name,audience_name=excluded.audience_name,locale=excluded.locale,
 notice_version=excluded.notice_version,notice_text=excluded.notice_text,notice_hash=excluded.notice_hash,status='pending',expires_at=NULL,updated_at=now()
 RETURNING * INTO s;
 UPDATE public.marketing_subscriptions SET generation=generation+1 WHERE id=s.id RETURNING * INTO s;
 token:=replace(gen_random_uuid()::text||gen_random_uuid()::text,'-','');
 INSERT INTO public.marketing_subscription_requests(subscription_id,token_hash,generation)
 VALUES(s.id,encode(sha256(convert_to(token,'UTF8')),'hex'),s.generation) RETURNING id INTO rid;
 PERFORM public.record_marketing_consent_event(s.id,'requested',rid);
 SELECT * INTO cfg FROM public.marketing_service_configuration WHERE singleton;
 -- Token in the fragment is not transmitted in page requests or referrers. GET never opts in.
 link:=cfg.public_origin||'/communications?action=confirm#token='||token;
 notice_html:=replace(replace(replace(ctx->>'notice_text','&','&amp;'),'<','&lt;'),'>','&gt;');
 -- enqueue_email must be present in the validated mail infrastructure. Failure rolls back EVERYTHING.
 PERFORM public.enqueue_email('transactional_emails',jsonb_build_object(
  'message_id',rid,'idempotency_key','marketing-confirm:'||rid::text,'to',email_normalized,
  'from','BIB <'||cfg.confirmation_from_address||'>','sender_domain',cfg.sender_domain,
  'subject',CASE WHEN p_locale='en' THEN 'Confirm your email subscription' ELSE 'Confirmez votre abonnement par email' END,
  'html','<p>'||notice_html||'</p><p><a href="'||link||'">'||CASE WHEN p_locale='en' THEN 'Review and confirm my subscription' ELSE 'Vérifier et confirmer mon abonnement' END||'</a></p><p>'||CASE WHEN p_locale='en' THEN 'This link expires in 24 hours. If you did not request this subscription, ignore this email.' ELSE 'Ce lien expire dans 24 heures. Si vous n’avez pas demandé cet abonnement, ignorez cet email.' END||'</p>',
  'text',(ctx->>'notice_text')||E'\n'||link||E'\n'||CASE WHEN p_locale='en' THEN 'Link valid for 24 hours. Ignore if not requested.' ELSE 'Lien valable 24 heures. À ignorer si vous n’êtes pas à l’origine de la demande.' END,
  'purpose','transactional','label','marketing-subscription-confirmation','queued_at',now()));
 RETURN jsonb_build_object('accepted',true);
END; $$;

CREATE FUNCTION public.manage_marketing_subscription(p_action text,p_token text) RETURNS jsonb
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE s public.marketing_subscriptions; r public.marketing_subscription_requests; ctx jsonb; valid boolean:=false;
BEGIN
 IF p_token IS NULL OR p_token !~ '^[a-f0-9]{64}$' OR p_action NOT IN ('inspect_confirmation','confirm','inspect_unsubscribe','withdraw') OR p_action IS NULL
 THEN RAISE EXCEPTION 'invalid_marketing_link' USING ERRCODE='22023'; END IF;
 IF p_action IN ('inspect_confirmation','confirm') THEN
  SELECT * INTO r FROM public.marketing_subscription_requests WHERE token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex');
  IF r.id IS NULL THEN RETURN jsonb_build_object('valid',false); END IF;
  SELECT * INTO s FROM public.marketing_subscriptions WHERE id=r.subscription_id FOR UPDATE;
  IF r.expires_at<=now() OR r.generation<>s.generation OR s.status='withdrawn' THEN RETURN jsonb_build_object('valid',false); END IF;
  ctx:=public.marketing_subscription_context(s.boutique_id,s.locale);
  IF ctx->>'notice_hash' IS DISTINCT FROM s.notice_hash OR ctx->>'controller_key' IS DISTINCT FROM s.controller_key
  THEN RETURN jsonb_build_object('valid',false); END IF;
  IF EXISTS(SELECT 1 FROM public.suppressed_emails WHERE lower(email)=s.email) THEN RETURN jsonb_build_object('valid',false); END IF;
  IF p_action='confirm' AND r.used_at IS NULL THEN
   UPDATE public.marketing_subscription_requests SET used_at=now() WHERE id=r.id;
   UPDATE public.marketing_subscriptions SET status='active',confirmed_at=now(),expires_at=now()+interval '3 years',updated_at=now() WHERE id=s.id RETURNING * INTO s;
   PERFORM public.record_marketing_consent_event(s.id,'confirmed',r.id);
  END IF;
 ELSE
  SELECT * INTO s FROM public.marketing_subscriptions WHERE unsubscribe_token=p_token FOR UPDATE;
  IF s.id IS NULL THEN RETURN jsonb_build_object('valid',false); END IF;
  -- Withdrawal works even if the seller changed, the service is disabled or documents are revoked.
  IF p_action='withdraw' AND s.status<>'withdrawn' THEN
   UPDATE public.marketing_subscriptions SET status='withdrawn',generation=generation+1,expires_at=NULL,updated_at=now() WHERE id=s.id RETURNING * INTO s;
   PERFORM public.record_marketing_consent_event(s.id,'withdrawn');
  END IF;
 END IF;
 RETURN jsonb_build_object('valid',true,'state',s.status,'audience_name',s.audience_name,'controller_name',s.controller_name,'notice_text',s.notice_text);
END; $$;

CREATE FUNCTION public.marketing_campaign_recipients(p_boutique_id uuid,p_min_spent_cents numeric DEFAULT NULL,p_subscription_id uuid DEFAULT NULL)
 RETURNS TABLE(subscription_id uuid,email text,full_name text,unsubscribe_token text,public_origin text,controller_name text)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE ctx jsonb;
BEGIN
 IF p_boutique_id IS NULL OR (p_min_spent_cents IS NOT NULL AND (p_min_spent_cents<0 OR p_min_spent_cents>1000000000000))
 THEN RAISE EXCEPTION 'invalid_marketing_audience' USING ERRCODE='22023'; END IF;
 ctx:=public.marketing_subscription_context(p_boutique_id,'fr');
 RETURN QUERY SELECT s.id,s.email,coalesce(c.full_name,''),s.unsubscribe_token,
 (SELECT cfg.public_origin FROM public.marketing_service_configuration cfg WHERE singleton),s.controller_name
 FROM public.marketing_subscriptions s
 LEFT JOIN LATERAL(SELECT bc.full_name FROM public.boutique_customers bc WHERE bc.boutique_id=p_boutique_id AND lower(btrim(bc.email))=s.email LIMIT 1) c ON true
 WHERE s.boutique_id=p_boutique_id AND s.controller_key=ctx->>'controller_key' AND s.status='active' AND s.expires_at>now()
 AND s.notice_hash=(public.marketing_subscription_context(p_boutique_id,s.locale)->>'notice_hash')
 AND (p_subscription_id IS NULL OR s.id=p_subscription_id)
 AND NOT EXISTS(SELECT 1 FROM public.suppressed_emails se WHERE lower(se.email)=s.email)
 AND (p_min_spent_cents IS NULL OR EXISTS(SELECT 1 FROM public.boutique_customers bc WHERE bc.boutique_id=p_boutique_id AND lower(btrim(bc.email))=s.email AND bc.total_spent_cents>=p_min_spent_cents))
 ORDER BY s.confirmed_at,s.id LIMIT 2000;
END; $$;

CREATE FUNCTION public.purge_expired_marketing_data() RETURNS integer
 LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE removed integer;
BEGIN
 -- Pending unconfirmed records: 7 days. Inactive proof: 3 years, without tracking opens.
 DELETE FROM public.marketing_subscriptions WHERE (status='pending' AND updated_at<now()-interval '7 days')
 OR (status='withdrawn' AND updated_at<now()-interval '3 years')
 OR (status='active' AND expires_at<now()-interval '3 years');
 GET DIAGNOSTICS removed=ROW_COUNT;
 DELETE FROM public.marketing_subscription_requests WHERE expires_at<now()-interval '7 days';
 RETURN removed;
END; $$;

CREATE FUNCTION public.get_boutique_marketing_subscribers(p_boutique_id uuid)
 RETURNS TABLE(email text,confirmed_at timestamptz,expires_at timestamptz,total_spent_cents bigint)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.boutiques WHERE id=p_boutique_id AND user_id=auth.uid())
 THEN RAISE EXCEPTION 'marketing_owner_required' USING ERRCODE='42501'; END IF;
 RETURN QUERY SELECT r.email,s.confirmed_at,s.expires_at,
 coalesce((SELECT max(bc.total_spent_cents) FROM public.boutique_customers bc WHERE bc.boutique_id=p_boutique_id AND lower(btrim(bc.email))=r.email),0)::bigint
 FROM public.marketing_campaign_recipients(p_boutique_id) r JOIN public.marketing_subscriptions s ON s.id=r.subscription_id;
END; $$;

REVOKE ALL ON FUNCTION public.marketing_subscription_context(uuid,text),public.record_marketing_consent_event(uuid,text,uuid),public.request_marketing_subscription(uuid,text,text,text,boolean),public.manage_marketing_subscription(text,text),public.marketing_campaign_recipients(uuid,numeric,uuid),public.purge_expired_marketing_data() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.get_boutique_marketing_subscribers(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_boutique_marketing_subscribers(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.marketing_subscription_context(uuid,text),public.request_marketing_subscription(uuid,text,text,text,boolean),public.manage_marketing_subscription(text,text),public.marketing_campaign_recipients(uuid,numeric,uuid),public.purge_expired_marketing_data() TO service_role;
