-- Offer update: Growth 50 products and 48h support; personalised domains
-- and paid additional boutiques are Pro-only. Do not confuse the commercial
-- display with activated Stripe entitlements.
UPDATE public.plans
SET max_products=50,
    max_boutiques=1,
    features=(
      SELECT jsonb_agg(CASE
        WHEN value='Jusqu''à 150 produits audités' THEN to_jsonb('Jusqu''à 50 produits audités'::text)
        WHEN value='Support prioritaire 24h' THEN to_jsonb('Support prioritaire 48h'::text)
        WHEN value='1 boutique + sous-domaine personnalisé' THEN to_jsonb('1 boutique incluse'::text)
        WHEN value='Analytics complets + export CSV' THEN to_jsonb('Analytics complets (pages, scènes, produits) + exports CSV et PDF'::text)
        ELSE to_jsonb(value) END ORDER BY ordinality)
      FROM jsonb_array_elements_text(features) WITH ORDINALITY AS items(value, ordinality)
    )
WHERE tier::text='growth';

UPDATE public.plans
SET max_boutiques=1,
    features=(
      SELECT jsonb_agg(CASE
        WHEN value='Jusqu''à 3 boutiques multi-zones EU'
        THEN to_jsonb('1 boutique incluse ; jusqu''à 3 avec options payantes (+19,99 €/mois pour 1 supplémentaire, +35,99 €/mois pour 2 supplémentaires)'::text)
        ELSE to_jsonb(value) END ORDER BY ordinality)
      FROM jsonb_array_elements_text(features) WITH ORDINALITY AS items(value, ordinality)
    ) || '["Domaine personnalisé réservé au plan Pro"]'::jsonb
WHERE tier::text='pro' AND NOT features @> '["Domaine personnalisé réservé au plan Pro"]'::jsonb;
