-- Starter support email SLA: 72h instead of 48h.
-- Do not alter the separate 48h SAV/mediation escalation rules.
UPDATE public.plans
SET features = (
  SELECT jsonb_agg(
    CASE
      WHEN value = 'Support email 48h' THEN to_jsonb('Support email 72h'::text)
      ELSE to_jsonb(value)
    END ORDER BY ordinality
  )
  FROM jsonb_array_elements_text(to_jsonb(features))
       WITH ORDINALITY AS items(value, ordinality)
)
WHERE tier::text = 'starter'
  AND features::text LIKE '%Support email 48h%';
