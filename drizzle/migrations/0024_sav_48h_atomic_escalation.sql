-- SAV: the merchant is the legal seller. BIB's insured 48-hour takeover
-- is an operational escalation only; it does not transfer statutory liability.
-- Requires 0008_secure_order_issue_creation, 0012_order_issue_refunds,
-- plan insurance subscription metadata and the existing issue tables.
BEGIN;

CREATE TABLE public.sav_escalation_events (
 issue_id uuid PRIMARY KEY REFERENCES public.order_issues(id) ON DELETE RESTRICT,
 order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
 boutique_id uuid NOT NULL REFERENCES public.boutiques(id) ON DELETE RESTRICT,
 merchant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 due_at timestamptz NOT NULL,
 escalated_at timestamptz NOT NULL DEFAULT now(),
 insurance_verified_at timestamptz NOT NULL DEFAULT now(),
 environment text NOT NULL CHECK (environment IN ('sandbox','live')),
 reason text NOT NULL DEFAULT 'merchant_silence_48h'
   CHECK (reason='merchant_silence_48h')
);
CREATE INDEX sav_escalation_queue ON public.order_issues(deadline_at,id)
  WHERE status='pending';
CREATE INDEX sav_escalation_events_date ON public.sav_escalation_events(escalated_at,issue_id);
ALTER TABLE public.sav_escalation_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sav_escalation_events FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.sav_escalation_events TO service_role;

-- Close legacy multi-request bypass: the atomic RPC owns both the seller
-- response and the corresponding issue status. Stripe refunds remain separate.
REVOKE UPDATE,DELETE ON public.order_issues FROM PUBLIC,anon,authenticated;
REVOKE INSERT,UPDATE,DELETE ON public.issue_responses FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.respond_to_order_issue(
 p_issue_id uuid, p_action public.issue_action,
 p_message text DEFAULT NULL, p_new_status public.issue_status DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $rpc$
DECLARE
 actor uuid:=auth.uid();
 current_status public.issue_status;
 due timestamptz;
 outcome public.issue_status;
 response_id uuid;
 normalized_message text:=nullif(btrim(p_message),'');
BEGIN
 IF auth.role() IS DISTINCT FROM 'authenticated' OR actor IS NULL
   THEN RAISE EXCEPTION 'merchant_auth_required' USING ERRCODE='42501'; END IF;
 IF p_issue_id IS NULL OR p_action IS NULL OR p_new_status IS NULL
   THEN RAISE EXCEPTION 'incomplete_response' USING ERRCODE='22023'; END IF;
 SELECT i.status,i.deadline_at INTO current_status,due
 FROM public.order_issues i
 JOIN public.orders o ON o.id=i.order_id
 JOIN public.boutiques b ON b.id=o.boutique_id
 WHERE i.id=p_issue_id AND b.user_id=actor
 FOR UPDATE OF i;
 IF NOT FOUND THEN RAISE EXCEPTION 'issue_not_owned' USING ERRCODE='42501'; END IF;
 -- The 48-hour deadline enables BIB's insured takeover but must never
 -- permanently deprive an uninsured seller of the ability to respond.
 -- Before an actual atomic takeover, the merchant may still answer late;
 -- whichever transaction locks the issue first determines the outcome.
 IF current_status='escalated'
   THEN RAISE EXCEPTION 'bib_sav_escalation_required' USING ERRCODE='55000'; END IF;

 IF current_status='pending' THEN
   IF p_action='partial_refund' THEN
     RAISE EXCEPTION 'use_stripe_refund_workflow' USING ERRCODE='22023';
   ELSIF p_action='refuse' AND p_new_status='refused' THEN outcome:='refused';
   ELSIF p_action IN ('accept','resend','other') AND p_new_status='accepted' THEN outcome:='accepted';
   ELSE RAISE EXCEPTION 'invalid_merchant_response' USING ERRCODE='22023';
   END IF;
 ELSIF current_status='accepted' AND p_action='other' AND p_new_status='resolved'
   THEN outcome:='resolved';
 ELSE RAISE EXCEPTION 'invalid_issue_transition' USING ERRCODE='55000';
 END IF;

 IF (p_action IN ('refuse','resend','other') OR outcome='resolved')
   AND (normalized_message IS NULL OR char_length(normalized_message)<5) THEN
    RAISE EXCEPTION 'merchant_response_explanation_required' USING ERRCODE='22023';
 END IF;
 IF char_length(coalesce(normalized_message,''))>3000
   THEN RAISE EXCEPTION 'merchant_response_too_long' USING ERRCODE='22023'; END IF;

 INSERT INTO public.issue_responses(issue_id,action,message)
 VALUES(p_issue_id,p_action,normalized_message) RETURNING id INTO response_id;
 UPDATE public.order_issues SET status=outcome WHERE id=p_issue_id;
 RETURN response_id;
END;
$rpc$;
REVOKE ALL ON FUNCTION public.respond_to_order_issue(uuid,public.issue_action,text,public.issue_status)
 FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.respond_to_order_issue(uuid,public.issue_action,text,public.issue_status)
 TO authenticated,service_role;

CREATE OR REPLACE FUNCTION public.escalate_unanswered_order_issues(
 p_limit integer DEFAULT 100, p_environment text DEFAULT 'live'
) RETURNS TABLE(issue_id uuid,order_id uuid,boutique_id uuid,merchant_id uuid,deadline_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $worker$
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN
  RAISE EXCEPTION 'server_only_sav_escalation' USING ERRCODE='42501';
 END IF;
 IF p_limit IS NULL OR p_limit<1 OR p_limit>500 OR p_environment NOT IN ('sandbox','live')
 THEN RAISE EXCEPTION 'invalid_sav_worker_parameters' USING ERRCODE='22023'; END IF;
 RETURN QUERY
 WITH candidates AS MATERIALIZED (
  SELECT i.id AS issue_id,i.order_id,o.boutique_id,b.user_id AS merchant_id,
    i.deadline_at AS due_at
  FROM public.order_issues i
  JOIN public.orders o ON o.id=i.order_id
  JOIN public.boutiques b ON b.id=o.boutique_id
  JOIN public.profiles p ON p.user_id=b.user_id
  WHERE i.status='pending'
   AND i.created_at<=now()-interval '48 hours'
   AND i.deadline_at<=now()
   AND o.stripe_environment=p_environment
   AND coalesce(p.insurance_addon_enabled,false)=true
   AND EXISTS (
     SELECT 1 FROM public.subscriptions s
     WHERE s.user_id=b.user_id AND s.price_id LIKE 'insurance_%'
       AND s.status IN('active','trialing')
       AND (s.current_period_end IS NULL OR s.current_period_end>now())
   )
   AND NOT EXISTS (SELECT 1 FROM public.issue_responses r WHERE r.issue_id=i.id)
  ORDER BY i.deadline_at,i.id
  LIMIT p_limit
  FOR UPDATE OF i SKIP LOCKED
 ),
 moved AS (
  UPDATE public.order_issues i SET status='escalated'
  FROM candidates c WHERE i.id=c.issue_id AND i.status='pending'
  RETURNING i.id
 ),
 inserted AS (
  INSERT INTO public.sav_escalation_events(issue_id,order_id,boutique_id,merchant_id,due_at,environment)
  SELECT c.issue_id,c.order_id,c.boutique_id,c.merchant_id,c.due_at,p_environment
  FROM candidates c JOIN moved m ON m.id=c.issue_id
  ON CONFLICT(issue_id) DO NOTHING
  RETURNING sav_escalation_events.issue_id
 )
 SELECT c.issue_id,c.order_id,c.boutique_id,c.merchant_id,c.due_at
 FROM candidates c JOIN inserted e ON e.issue_id=c.issue_id;
END;
$worker$;
REVOKE ALL ON FUNCTION public.escalate_unanswered_order_issues(integer,text)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.escalate_unanswered_order_issues(integer,text)
 TO service_role;
COMMIT;
