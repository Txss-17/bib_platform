
-- SEO international : configuration indépendante par boutique.
-- Les réglages existants seo_title, seo_description et seo_jsonld
-- sont conservés.

ALTER TABLE public.boutiques
  ADD COLUMN IF NOT EXISTS seo_active_locales text[]
    NOT NULL DEFAULT ARRAY['fr', 'en']::text[],
  ADD COLUMN IF NOT EXISTS seo_default_locale text
    NOT NULL DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS seo_public_origin text;

-- Langues prises en charge par l'interface BIB.
ALTER TABLE public.boutiques
  ADD CONSTRAINT boutiques_seo_active_locales_valid
  CHECK (
    cardinality(seo_active_locales) > 0
    AND seo_active_locales <@ ARRAY['fr', 'en', 'es', 'de', 'it']::text[]
  );

-- La langue par défaut doit faire partie des langues actives.
ALTER TABLE public.boutiques
  ADD CONSTRAINT boutiques_seo_default_locale_active
  CHECK (
    seo_default_locale = ANY(seo_active_locales)
    AND seo_default_locale = ANY(ARRAY['fr', 'en', 'es', 'de', 'it']::text[])
  );

-- Le domaine public est facultatif.
-- S'il est renseigné, il doit être une URL HTTP(S) absolue.
ALTER TABLE public.boutiques
  ADD CONSTRAINT boutiques_seo_public_origin_valid
  CHECK (
    seo_public_origin IS NULL
    OR seo_public_origin ~ '^https?://[^/[:space:]]+/?$'
  );
