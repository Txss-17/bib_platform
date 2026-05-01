---
name: Payments — Stripe
description: Built-in Stripe payments — subscription plans (managed_payments) + storefront checkout (automatic_tax)
type: feature
---
**Two flows**, both Embedded Checkout (`ui_mode: "embedded_page"`):

1. **Vendor subscriptions** (`bib_starter` / `bib_growth` / `bib_pro`, monthly+yearly = 6 prices). Edge function `create-checkout` uses `managed_payments: { enabled: true }` (full compliance, +3.5%). Webhook `payments-webhook` upserts `public.subscriptions`; trigger `sync_profile_plan_from_subscription` updates `profiles.plan_tier` + `plan_billing_cycle`. Triggered from `Tarifs.tsx` (modal embedded checkout for logged users, signup redirect otherwise).
2. **Public storefront orders** (physical goods). Edge function `create-storefront-checkout` creates pending `orders` rows (LKS26 trigger), then a Stripe session with `automatic_tax: { enabled: true }` (+0.5%) and `shipping_address_collection`. Webhook flips orders to `payment_status='paid'` + `logistics_status='preparation'` on `checkout.session.completed`.

Shared utility: `supabase/functions/_shared/stripe.ts` (`createStripeClient`, `verifyWebhook`, `corsHeaders`, `MANAGED_PAYMENTS_COUNTRIES`). All payment functions have `verify_jwt = false` in `config.toml`. Webhook URL pattern: `?env=sandbox|live`.

Frontend: `src/lib/stripe.ts` (env detection from `pk_test_` / `pk_live_`), `StripeEmbeddedCheckout`, `StorefrontEmbeddedCheckout`, `PaymentTestModeBanner`, return page `/checkout/return`. Test card `4242 4242 4242 4242`.

**DO NOT** instantiate Stripe SDK directly with `STRIPE_SANDBOX_API_KEY` — it's a gateway connection key, not a real Stripe secret. Always use `createStripeClient(env)`.