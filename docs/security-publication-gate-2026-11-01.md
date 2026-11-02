# BIB Platform — Public-release security gate (2026-11-01)

## Security scan follow-up — 2026-11-02, prices / Pro / brand AI
Additional findings were traced to source and current Supabase policies.
Applied and verified in the connected database:
- `20261102123000_pricing_and_pro_sales_guards.sql`: merchant product
  prices and promotions cannot undercut the supplier base or exceed the
  supplier-authorized margin; Pro private sales require an active Pro
  subscription and protected usage counts. Three pricing/financial triggers
  were confirmed as present.
- `20261102123500_brand_ai_rate_limits.sql`: a service-role-only atomic
  quota of eight paid AI generations per boutique/hour. It is effective
  **only when the updated boutique-ai Edge Function is deployed**.
- `20261102124000_public_application_and_attachment_hardening.sql`: public
  partner applications must use the existing OTP-backed Edge workflow;
  anonymous ticket attachment uploads are disabled until an authenticated
  or signed-upload flow is implemented.

The source implementation of public checkout and POS also validates price
floors and maximum supplier margins before creating Stripe sessions.
POS requires a current Pro subscription matching the Stripe environment.
The obsolete, unauthenticated `generate-brand-dna` endpoint returns HTTP
410 in source; its deployment status has **not** been established.
`support-ai` now rejects client-authored `assistant` or `system` roles,
and the dashboard widget sends only user messages.

Read-only post-change checks confirmed that the active database no longer
has public INSERT policies on `orders` or `partner_onboarding_submissions`,
that public ticket attachment upload is disabled, and that pricing and
private-sale protection triggers are installed.
Existing product pricing audit: four products were checked; no recorded
supplier-margin or promotion anomalies were found.

Intentionally public reads remain for the `plans` catalogue and published
`boutique-media` assets. The media bucket itself is PUBLIC; never store
customer, support, KYC, contract or personal data there. Support attachment
storage remains PRIVATE. Public images should be separated from private
merchant media if merchants need non-public assets.

Not yet established: a successful TypeScript/build/test run, updated Edge
Functions deployed and active in Supabase, live negative-access tests with
anonymous/Starter/Pro accounts, the Stripe sandbox tampering matrix, and
a new Lovable security scan. The source and SQL work must not be represented
as closure of every scanner finding.

## Security hardening update — 2026-11-02
The connected BIB Platform Supabase database was inspected and the following
SQL protections were executed and verified in the live database:
- `20261102070000_critical_public_access_hardening.sql`: public order INSERT
  disabled, unverified guest order claiming closed, and owner-scoped boutique
  media writes.
- `20261102070100_support_ai_usage_limits.sql`: atomic per-user quota RPC and
  counters for AI calls and ticket creation.
- `20261102070200_financial_entitlement_partner_guards.sql`: triggers that
  reject client-side payment/order financial tampering, self-awarded plan/KYC
  entitlements, and applicant-side partner approval changes.

These were executed as targeted hardening statements; this does **not** mean
the pending Drizzle migrations 0015–0024 were applied. Do not mark historical
migration journals as complete without reconciliation.

GitHub Edge Function changes are **source edits only** until confirmed deployed.
The email functions now reject arbitrary browser-selected recipients and raw
template overrides; marketing HTML is sanitized. Existing authenticated
checkout/POS functions already calculate prices using the server database
instead of incoming line amounts and redirect through a trusted-origin check.

Remaining release blockers: deploy and verify all modified Edge Functions,
check legitimate workflows after RLS restrictions, reconcile pending Drizzle
migrations, run tests and Stripe sandbox tampering trials, add public
endpoint bot/abuse controls for checkout, public tickets, applications and
analytics, review other storage/public read access policies and rerun the
security scan. Critical findings not described in the supplied findings text
cannot be asserted fixed.

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

## Earlier proposed SQL patch (superseded for the controls listed above)
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
