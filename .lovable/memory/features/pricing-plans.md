---
name: Pricing & plans
description: Marchands Starter 79€/15%, Growth 149€/10%, Pro 299€/8%; add-ons boutiques supplémentaires, Boutique Verte et Assurance; données officielles public.plans.
type: feature
---
- Plans publics dans `public.plans` : Starter 1 boutique/15 produits/support e-mail 72 h; Growth 1 boutique/50 produits/support prioritaire 48 h; Pro 1 boutique/produits illimités/account manager dédié.
- Croissance des boutiques uniquement pour Growth et Pro : 1 incluse, 2 au total avec +19,99 €/mois, 3 au total avec +35,99 €/mois (paliers exclusifs, non cumulables). Quotas effectivement accordés uniquement après validation d'un abonnement Stripe actif : `boutique_extra_one_monthly` ou `boutique_extra_two_monthly`.
- Domaine personnalisé réservé au plan Pro, sous réserve de configuration et vérification DNS.
- Starter : indicateurs généraux; PAS d'analytiques des scènes/pages ni d'exports détaillés.
- Growth et Pro : analytiques complètes des pages, scènes, produits, exports CSV/PDF des statistiques. Le CRM de contacts ne propose AUCUN export.
- Aucun avantage « accès aux nouveaux produits J+... » dans les offres.
- `profiles.plan_tier` est un droit serveur, non modifiable par l'utilisateur. Inscription marchande publique temporairement fermée; inscription client Store autorisée; partenaires avec candidature et accès distincts.
- `usePlanLimits()` lit les quotas d'offres et les suppléments Stripe confirmés; `enforce_plan_limits` vérifie le quota en base.
- Page `/tarifs` : contenu depuis `public.plans` et non depuis une liste codée en dur.
- Offre client BIB Abonné : suivi de commande et « Retours gratuits : frais de retour pris en charge » parmi les avantages affichés. Ne pas confondre ces avantages avec les plans marchands.
