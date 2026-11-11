# BIB Platform — migration hors Lovable — readiness checklist

Status: **PREPARATION ONLY / NO PRODUCTION CHANGE**
Reference document (Drive BIB): https://docs.google.com/document/d/18lpUzk5j6jTKMw9m_s2XAPsALxdeP4OVkkqpbr-iv9M/edit
Tracking issue: https://github.com/Txss-17/bib_platform/issues/49

## Live source inventory (read-only PostgreSQL metadata, 2026-11-11)
79 public tables; 39 Supabase migrations; 116 public RLS policies; 6 Storage policies; 74 SECURITY DEFINER functions; 2 email identities; 57 Storage objects / 87,931,040 metadata bytes.
Storage: boutique-media (public, 10 MiB; image/video); support-attachments (private).
All Auth identities observed are email provider identities; no identity credentials were exported.

## Special risks
P0: supabase/functions/_shared/stripe.ts routes Stripe requests via connector-gateway.lovable.dev/stripe and LOVABLE_API_KEY. Replace direct Stripe SDK/API preserving sandbox/live, destination charges, Connect account identity, webhook signature, idempotency, refunds and reconciliation. Other LOVABLE_API_KEY references across AI/email/marketing require review. Drizzle migration journal is canonical per README; do not replay old supabase/migrations indiscriminately.

## Gate 0 — source and export rights
- [ ] Verify owner, production source project, database export/download method approved by Lovable; SELECT metadata access is **not** pg_dump permission.
- [ ] Capture safe aggregate counts, migration history versions, schema fingerprints and existing deployments.
- [ ] Secure encrypted storage outside the web root for DB dumps, object binary backups and Auth material. Never commit secrets, Auth hashes, personal data, payment records or dumps.
- [ ] Confirm database and Auth recovery path; if passwords cannot migrate safely, define reset/migration campaign.

## Gate 1 — destination
- [ ] Provision separate BIB-controlled Supabase dev/staging; then design prod independently. Record project ref in secured inventory, not credentials.
- [ ] Reconcile extensions, schema, RLS, roles/grants, SECURITY DEFINER search_path, functions/triggers, foreign keys, sequences and migration journal.
- [ ] Migrate Auth users, Storage objects and permissions separately. Check checksums and counts. Recreate secrets/Edge Functions, schedulers, outbound integrations, callback URLs and rate limits.
- [ ] Test signed-in and unauthenticated roles, negative RLS cases, login/recovery/MFA and PWA.

## Gate 2 — app-independent hosting
- [ ] Deploy frontend from GitHub on independent staging host with VITE_SUPABASE_URL and publishable key only; keep service-role and webhook secrets server-side.
- [ ] Verify CORS, redirects, cookies/session and CSP; smoke-test browser/mobile.
- [ ] Verify every critical flow before updating DNS. Avoid modifying 185.158.133.1 records until Go/No-Go.

## Gate 3 — cutover
- [ ] Run test restore from encrypted backup; validate consistency of writes/deltas and rollback after first new write.
- [ ] Confirm Stripe/email/notify integrations, logs and observability are **not** routed via Lovable.
- [ ] Obtain written Go/No-Go; cut over during controlled window; verify DNS/HTTPS/email and business workflows.
- [ ] Retire Lovable only after sustained validation, no active dependencies, and verified final backups.

## Relevant infrastructure facts
Domain hosts presently routed via Lovable A record 185.158.133.1 (TTL 300): apex, audit-set, carrieres, logistics, pack-legal, shop, store, suppliers, tarifs, workspace. Email MX smtp.google.com; notify.brand-in-a-box.space delegates to ns3/ns4.lovable.cloud. Preserve email/notify continuity.

All boxes start unchecked deliberately; do not mark complete without evidence (PR, deployment/test log, restore report).
