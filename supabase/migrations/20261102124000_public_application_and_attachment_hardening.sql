-- Public applications already use verified OTP Edge Functions; direct browser
-- inserts bypass that proof and must be denied.
BEGIN;
DROP POLICY IF EXISTS "Anyone can submit a partner application"
  ON public.partner_onboarding_submissions;
REVOKE INSERT ON public.partner_onboarding_submissions FROM anon,authenticated;

-- Anonymous uploads can target any publicly created ticket ID; until signed
-- upload tokens exist, block guest attachments rather than accept arbitrary
-- modifications of another ticket.
DROP POLICY IF EXISTS "Anonymous can upload to storefront tickets" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous can add attachments to storefront tickets" ON public.support_ticket_attachments;
REVOKE INSERT ON public.support_ticket_attachments FROM anon;

-- The plans catalogue is deliberately public. Published boutique images
-- are deliberately public assets; neither policy grants write access.
COMMIT;
