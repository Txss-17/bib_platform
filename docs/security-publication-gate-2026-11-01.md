# BIB Platform — Public-release security gate (2026-11-01)

## Current disposition
**DO NOT DEPLOY ALL PUBLIC ROUTES YET.** The Lovable scanner reported 29 findings and did not finish its analysis. Several critical server/database authorization issues have been confirmed on the connected Platform database. Code edits in GitHub do not certify deployed Edge Functions or database policy changes.

## Confirmed live database exposures (read-only audit)
- `orders`: INSERT RLS policy `Anyone can create orders for published boutiques` available to `anon,authenticated`.
- `orders`: UPDATE RLS `Customers update own orders link` may allow relinking with a caller-controlled customer email.
- `public.claim_guest_orders(uuid,text)` SECURITY DEFINER validates ownership of the supplied profile but trusts a caller-supplied email.
- `profiles`: authenticated user can UPDATE own record without field-level restrictions for paid plan or verification.
- `partner_onboarding_submissions`: applicant UPDATE policy does not protect approval, status or token columns.
- `orders`: merchant UPDATE policy does not protect payment status and amount columns against owner tampering.

## Code corrections recorded on GitHub
- `supabase/functions/send-boutique-email/index.ts`: identity verification; owner check; arbitrary HTML/subject overrides forbidden; variable escaping.
- `supabase/functions/support-ai/index.ts`: authenticated use, message role limits, verified ticket identity, boutique ownership.
- `supabase/functions/onboarding-reminders/index.ts`: own-user request or cron-key authentication. **Required configuration:** `ONBOARDING_REMINDERS_CRON_KEY` secret for scheduled jobs.
- `supabase/functions/send-transactional-email/index.ts`: server-side access required for third-party sends, with limited authenticated onboarding self-test. Browser-driven support-ticket status emails must be reimplemented in a privileged support workflow.
- `supabase/functions/send-marketing-campaign/index.ts`: only self-addressed test emails, escaped customer variables.
- `supabase/functions/_shared/return-url.ts`: HTTPS return destination allowlist reused by Stripe checkout, POS, subscription checkout and billing portal. Configure `BIB_PUBLIC_SITE_ORIGIN` for any additional legitimate site origin; do not use arbitrary wildcard hosts.
- `src/lib/exportUtils.ts`: formula-injection escaping for CSV cells and file header.
- Edge function logs: removed directly logged recipient addresses where identified.
- `src/components/onboarding/OnboardingWizard.tsx`: removes unpaid plan-tier grants from the account signup wizard.

## SQL patch, NOT APPLIED
`ops/security/critical-rbac-hardening.sql` contains controls for:
1. Prevent direct public order insertion.
2. Prevent arbitrary customer order relinking.
3. Bind `claim_guest_orders` to the email verified in `auth.users`.
4. Restrict modification of order payment/price fields to the trusted service role.
5. Restrict account plan, KYC and add-on entitlement updates to the trusted service role.
6. Restrict applicant-driven partner approval and access token changes.

This requires migration reconciliation, backup, staging test, then controlled deployment. It has **not** been run on the connected production database.

## Known unfinished work
- Database and storage policies beyond the named objects: other permissive RLS, five storage policies, order line creation and partner token authorization.
- Confirm that deployed Stripe/POS endpoints match their server-derived-price implementations; confirm webhook-only paid status updates with tampering tests.
- Audit public order/cart/refund, support/ticket and partner submission rate limits and anti-abuse controls.
- Review HTML sanitization in marketing campaigns and email templates, and validation of unsubscribe links.
- Replace browser-side support-ticket email with a scoped server-side workflow.
- Check access to all pages/routes for guest, merchant, team member and admin roles.
- Run unit tests, typecheck, build, an authenticated/anonymous RLS test matrix, Stripe sandbox test purchases, and rerun Lovable's incomplete security scan.
- Only after sign-off: remove the public-prelaunch route gate and deploy all pages. Do **not** publish or enable production payment operations on the basis of these source edits alone.

## Operational safeguards
- Do not expose `SUPABASE_SERVICE_ROLE_KEY`, Lovable API key, cron key or Stripe secrets in the frontend.
- Preserve test/live payment separation and ensure test orders are excluded from real logistics.
- Do not introduce a public registration or real checkout route until all critical findings are closed and verified.
