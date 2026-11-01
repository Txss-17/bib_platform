-- Starter product quota reduced from 30 to 15.
-- The front-end usePlanLimits hook reads public.plans.max_products.
UPDATE public.plans
SET max_products = 15,
    features = (
      SELECT jsonb_agg(
        CASE
          WHEN value = 'Jusqu''à 30 produits audités'
          THEN to_jsonb('Jusqu''à 15 produits audités'::text)
          ELSE to_jsonb(value)
        END ORDER BY ordinality
      )
      FROM jsonb_array_elements_text(to_jsonb(features))
      WITH ORDINALITY AS items(value, ordinality)
    )
WHERE tier::text = 'starter';
