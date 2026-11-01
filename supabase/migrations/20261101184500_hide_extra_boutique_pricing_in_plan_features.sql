-- Display only eligibility and capacity on Growth/Pro public pricing cards.
-- Extra boutique fees remain in the authenticated Stripe add-on checkout.
UPDATE public.plans
SET features = (
 SELECT jsonb_agg(
   CASE WHEN value LIKE '1 boutique incluse ; jusqu''à 3 avec options payantes (%'
     THEN to_jsonb('1 boutique incluse · jusqu''à 3 boutiques avec options supplémentaires'::text)
     ELSE to_jsonb(value) END ORDER BY ordinality
 )
 FROM jsonb_array_elements_text(features) WITH ORDINALITY AS items(value,ordinality)
)
WHERE tier::text IN ('growth','pro');
