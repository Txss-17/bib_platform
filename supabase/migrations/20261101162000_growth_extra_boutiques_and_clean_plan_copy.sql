-- Correct current public plan cards without rewriting historical migration seeds.
-- Growth and Pro may add 1 or 2 paid boutiques (3 maximum including base).
-- Remove early product-release promises from both plans.
UPDATE public.plans
SET features = (
  SELECT COALESCE(jsonb_agg(
    CASE WHEN value = '1 boutique incluse'
      THEN to_jsonb('1 boutique incluse ; jusqu''à 3 avec options payantes (+19,99 €/mois pour 1 supplémentaire, +35,99 €/mois pour 2 supplémentaires)'::text)
      ELSE to_jsonb(value)
    END ORDER BY ordinality), '[]'::jsonb)
  FROM jsonb_array_elements_text(features) WITH ORDINALITY AS items(value, ordinality)
  WHERE value NOT LIKE 'Accès nouveaux produits J+%'
)
WHERE tier::text IN ('growth','pro');
