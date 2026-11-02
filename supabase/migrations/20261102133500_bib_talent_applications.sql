-- BIB Talent: private, consented expressions of interest (not employment offers).
-- Read and write via service-role only. No public table or public CV bucket.
BEGIN;
CREATE TABLE IF NOT EXISTS public.bib_talent_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254),
  location text CHECK (location IS NULL OR char_length(location) <= 120),
  current_activity text NOT NULL CHECK (char_length(current_activity) BETWEEN 2 AND 160),
  preferred_pole text NOT NULL CHECK (preferred_pole IN
    ('product_engineering','marketplace','communication','operations','quality_audit','undecided')),
  assigned_pole text NOT NULL CHECK (assigned_pole IN
    ('product_engineering','marketplace','communication','operations','quality_audit','talent_coordination')),
  owner_pole text NOT NULL DEFAULT 'talent_coordination' CHECK (owner_pole='talent_coordination'),
  contribution_type text NOT NULL CHECK (contribution_type IN ('volunteer','internship','future_opportunities','explore')),
  skills text NOT NULL CHECK (char_length(skills) BETWEEN 5 AND 1200),
  motivation text NOT NULL CHECK (char_length(motivation) BETWEEN 20 AND 1800),
  availability text NOT NULL CHECK (availability IN ('few_hours','part_time','flexible','discuss')),
  portfolio_url text CHECK (portfolio_url IS NULL OR char_length(portfolio_url) <= 500),
  locale text NOT NULL CHECK (locale IN ('fr','en')),
  consent_given_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_review','contacted','closed','withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  retention_until timestamptz NOT NULL DEFAULT (now() + interval '180 days'),
  network_digest text NOT NULL CHECK (char_length(network_digest)=64),
  application_digest text NOT NULL CHECK (char_length(application_digest)=64)
);
CREATE INDEX IF NOT EXISTS bib_talent_applications_routing_idx ON public.bib_talent_applications(assigned_pole,status,created_at DESC);
CREATE INDEX IF NOT EXISTS bib_talent_applications_retention_idx ON public.bib_talent_applications(retention_until);
CREATE UNIQUE INDEX IF NOT EXISTS bib_talent_applications_dedupe_idx ON public.bib_talent_applications(application_digest);
ALTER TABLE public.bib_talent_applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bib_talent_applications FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.bib_talent_applications TO service_role;
-- Intranet assigns authorized staff by functional pole; platform does not
-- expose a public/private applicant directory to merchant accounts.
COMMIT;