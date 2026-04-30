---
name: Pricing & plans
description: 3 plans marchands (Starter 79€/15%, Growth 149€/10%, Pro 299€/8%), add-ons Boutique Verte (19,99€) et Assurance, page /tarifs publique, sélection au wizard, hook usePlans + usePlanLimits + applyCommission
type: feature
---
- Table `plans` (référentiel public read-only) avec tier enum starter|growth|pro.
- profiles : plan_tier, plan_billing_cycle (monthly|annual −20%), green_addon_enabled, insurance_addon_enabled.
- Page publique `/tarifs` (et `/pricing`) : 3 cartes, toggle annuel, add-on Boutique Verte avec barème cartes cadeaux (10/30/50/100€), provisions livraison par catégorie (6/8/12/18€), bandeaux trust.
- Onboarding Wizard étendu en 4 étapes : nom, marché, business, **plan**. Lit `?plan=<tier>&cycle=<monthly|annual>` depuis Signup.
- `useCurrentPlan()` + `applyCommission(amount, plan)` pour affichage côté Ventes.
- `usePlanLimits()` : canCreateBoutique / canCreateProduct selon le plan (Starter 1/30, Growth 1/150, Pro 3/illimité).
- `<PlanCommissionBanner />` affiché en haut de Ventes — montre commission active + CTA upgrade.
