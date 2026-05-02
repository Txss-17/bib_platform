---
name: Insurance add-on
description: Stripe add-on assurance vendeur (Starter 25€, Growth 45€, Pro 69€) synchronisé avec profiles.insurance_addon_enabled
type: feature
---
- 6 prix Stripe : `insurance_{tier}_{monthly|yearly}` (annuel = -20%)
- Plafonds : Starter 200€/litige (3/mois), Growth 400€/litige (5/mois), Pro 700€/litige (illimité)
- Trigger `sync_profile_plan_from_subscription` distingue `price_id LIKE 'insurance_%'` et bascule `profiles.insurance_addon_enabled`
- UI : `<SubscriptionPanel />` dans /dashboard/parametres → onglet Abonnement (gère plans + assurance + portail Stripe)
- Subscriptions table a colonne `kind` (default 'plan')
