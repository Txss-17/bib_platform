ALTER TABLE public.boutiques
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_og_image_url text,
  ADD COLUMN IF NOT EXISTS legal_business_name text,
  ADD COLUMN IF NOT EXISTS legal_siret text,
  ADD COLUMN IF NOT EXISTS legal_address text,
  ADD COLUMN IF NOT EXISTS legal_email text,
  ADD COLUMN IF NOT EXISTS legal_phone text,
  ADD COLUMN IF NOT EXISTS default_currency text NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS target_markets text[] NOT NULL DEFAULT ARRAY['EU']::text[];