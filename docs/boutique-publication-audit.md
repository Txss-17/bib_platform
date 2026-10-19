# Boutique publication integrity — 2026-10-19

## Confirmed sources of truth

- `public.boutiques.status` (`draft` / `published`) controls public access. `studio_completed_at` records Studio completion.
- `public.boutique_scenes`: homepage records have `page_id IS NULL`; selected custom pages have a non-null `page_id`. Visibility is `is_visible`, order is `position`, contents are JSONB.
- Boutique SEO is persisted in `boutiques.seo_title`, `seo_description`, `seo_jsonld`; custom page SEO is separate in `boutique_pages`.
- Publication eligibility uses `products.status = active` joined to `supplier_products.is_active = true`. The eight-product preview is not a complete eligible-product count. Stock and sample validation are not enforced by the checked-in publication SQL; no new rules were introduced for them.
- `drizzle/schema.ts` is intentionally blank. Drizzle's journal has migrations 0000–0005; the publication SQL exists only under `supabase/migrations/20261018170000_secure_boutique_publication.sql`.

## Actual backend, not assumed migration state

Read-only inspection of `pg_trigger`, `pg_constraint` and `pg_policies` confirms **no installed publication trigger** on boutiques. Existing triggers cover plan limits, timestamps, legal-field formats, deletion safety and order dispatch. The checked-in publication migration must not be described as an applied backend rule.

The connected instance is shared by preview and published app. No migration, deployment, status change, product change or order creation was performed during this correction.

Actual rows: three boutiques, one published with six homepage scene records and two active products; two drafts without homepage scenes or active products. Old conversation counts were not used as schema/data evidence.

## Scoped correction

- Preserve the existing separate homepage query, explicitly filter homepage records in the validator and validate the first visible Hero in position order.
- Load Studio completion, persisted boutique SEO and an exact supplier-active product count independently of the editor preview.
- Block publication on query errors, loading/refetching and pending writes, including when stale cached data looks valid.
- Re-read persisted scenes, products and SEO immediately before the status update; French feedback and retry/Accueil/catalogue actions accompany failures.
- Remove the duplicate Publish control nested inside the Back button; retain the existing single publication action and navigation.
- Retain fullscreen media as the existing Studio-specific readiness requirement; the unapplied SQL only checks Hero title and CTA.

## Published boutique lifecycle and order tradeoffs

Scene visibility, deletion/content updates and product deactivation do not change boutique status today. Public rendering reads these edits directly. No scenes causes the legacy storefront fallback; no active products leaves an empty catalogue. The legacy `StorefrontPreview` also contains a sample-product fallback, which is an existing separate live-rendering risk, not corrected here.

The Studio now warns when published data no longer meets readiness requirements, but deliberately does not unpublish or block editing. These warnings refresh on query refetch and after scene writes; they are not a realtime cross-module invariant.

`create-storefront-checkout` uses a privileged client and trusts submitted product IDs/prices without resolving publication/product/supplier eligibility. Orders reference both product and boutique, but there is no cross-boutique composite constraint. Anonymous order-insert policy checks published status only; it does not constrain this privileged checkout path. Existing paid-order logistics dispatch does not depend on homepage scene validity. Existing order processing and tracking were not changed.

Automatic unpublication or new scene/product triggers would therefore risk public availability without fixing checkout integrity. A future safe backend work item should harden checkout first (authoritative product, boutique, price and quantity validation), then define whether publication is a transition gate or a continuous invariant, and add an atomic publication operation through this project's migration workflow. The client re-read reduces stale decisions but cannot eliminate concurrent-edit races or bypasses from other writers (including intranet import and settings).

## Verification scope

Targeted unit tests cover homepage isolation, hidden/deleted/edited scenes, position order, Studio completion, eligible-product count, loading/errors/pending writes, fullscreen media and SEO boundaries. Database inspection was read-only. No browser publication flow, checkout transaction or production validation was performed.