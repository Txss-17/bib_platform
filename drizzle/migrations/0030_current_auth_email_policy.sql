-- Resolve the caller's current email without granting clients access to auth.users.
-- Identity comes from the validated subject, never editable metadata/email claims.
CREATE FUNCTION public.bib_current_auth_email()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT u.email::text FROM auth.users u WHERE u.id=(SELECT auth.uid());
$$;
REVOKE ALL ON FUNCTION public.bib_current_auth_email() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.bib_current_auth_email() TO authenticated;

ALTER POLICY "Applicants can read their own submission by email"
 ON public.partner_onboarding_submissions
 USING(contact_email=public.bib_current_auth_email());
ALTER POLICY "Applicants can update their own pending submission"
 ON public.partner_onboarding_submissions
 USING(contact_email=public.bib_current_auth_email() AND approved_at IS NULL)
 WITH CHECK(contact_email=public.bib_current_auth_email());
