CREATE TABLE public.partner_onboarding_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal text NOT NULL,
  contact_email text NOT NULL,
  contact_name text,
  company text,
  status text NOT NULL DEFAULT 'submitted',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  kyc_attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  access_token text,
  support_ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX partner_onboarding_submissions_portal_idx ON public.partner_onboarding_submissions (portal);
CREATE INDEX partner_onboarding_submissions_email_idx ON public.partner_onboarding_submissions (contact_email);
CREATE UNIQUE INDEX partner_onboarding_submissions_token_idx ON public.partner_onboarding_submissions (access_token) WHERE access_token IS NOT NULL;

CREATE TRIGGER set_partner_onboarding_submissions_updated_at
  BEFORE UPDATE ON public.partner_onboarding_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE ON public.partner_onboarding_submissions TO authenticated;
GRANT INSERT, SELECT ON public.partner_onboarding_submissions TO anon;
GRANT ALL ON public.partner_onboarding_submissions TO service_role;

ALTER TABLE public.partner_onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Candidature publique : n'importe qui peut déposer un dossier.
CREATE POLICY "Anyone can submit a partner application"
  ON public.partner_onboarding_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Reprise de dossier via le jeton d'accès (OTP côté fonction serveur).
CREATE POLICY "Applicants can read their own submission by email"
  ON public.partner_onboarding_submissions FOR SELECT
  TO authenticated
  USING (contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Un candidat connecté peut mettre à jour son propre dossier tant qu'il n'est pas approuvé.
CREATE POLICY "Applicants can update their own pending submission"
  ON public.partner_onboarding_submissions FOR UPDATE
  TO authenticated
  USING (contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND approved_at IS NULL)
  WITH CHECK (contact_email = (SELECT email FROM auth.users WHERE id = auth.uid()));