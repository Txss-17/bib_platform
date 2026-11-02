-- BIB support tickets require a one-time, server-issued explicit-consent offer.
-- Public prelaunch research stores no contact details, raw IPs or free text.
BEGIN;
CREATE TABLE IF NOT EXISTS public.support_ticket_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boutique_id uuid REFERENCES public.boutiques(id) ON DELETE SET NULL,
  conversation_hash text NOT NULL CHECK (length(conversation_hash)=64),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS support_ticket_offers_user_created
  ON public.support_ticket_offers(user_id,created_at DESC);
ALTER TABLE public.support_ticket_offers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.support_ticket_offers FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.support_ticket_offers TO service_role;

CREATE OR REPLACE FUNCTION public.consume_support_ticket_offer(
  p_offer_id uuid, p_user_id uuid, p_hash text, p_boutique_id uuid
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE consumed_id uuid;
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'service_role_required' USING ERRCODE='42501';
  END IF;
  UPDATE public.support_ticket_offers
  SET consumed_at=now()
  WHERE id=p_offer_id AND user_id=p_user_id AND conversation_hash=p_hash
    AND boutique_id IS NOT DISTINCT FROM p_boutique_id
    AND consumed_at IS NULL AND expires_at>now()
  RETURNING id INTO consumed_id;
  RETURN consumed_id IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.consume_support_ticket_offer(uuid,uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consume_support_ticket_offer(uuid,uuid,text,uuid) TO service_role;

CREATE TABLE IF NOT EXISTS public.prelaunch_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge text NOT NULL CHECK (challenge IN (
    'fraud','delivery','quality','returns','trust','visibility','costs')),
  solution text NOT NULL CHECK (solution IN (
    'verified_suppliers','secure_delivery','transparent_sav','brand_tools','product_quality','merchant_control')),
  role text NOT NULL CHECK (role IN ('merchant','customer','both','exploring')),
  locale text NOT NULL CHECK (locale IN ('fr','en')),
  visitor_digest text NOT NULL CHECK (length(visitor_digest)=64),
  survey_day date NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(visitor_digest,survey_day)
);
ALTER TABLE public.prelaunch_survey_responses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.prelaunch_survey_responses FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.prelaunch_survey_responses TO service_role;
COMMIT;