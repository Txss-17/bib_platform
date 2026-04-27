---
name: Customer Account (Marketplace)
description: Marketplace customer account at /mon-compte — orders multi-boutique, gift cards, recycling history. Auth shared with sellers but distinguished by customer_profiles row.
type: feature
---
**Route :** `/mon-compte`

Espace client unique (login partagé Supabase, mais profil distinct du vendeur via la table `customer_profiles`). Un même user_id peut techniquement avoir un `profiles` (vendeur) et/ou un `customer_profiles` (acheteur), mais en pratique séparé.

**Logique d'activation :**
1. Login via `/login` ou `/signup` standard.
2. À l'arrivée sur `/mon-compte`, si `customer_profiles` n'existe pas → écran « Activer mon compte ».
3. Activation : insert `customer_profiles` + appel RPC `claim_guest_orders(profile_id, email)` qui rattache toutes les commandes invité avec le même email.

**Onglets :**
- **Commandes** : toutes boutiques confondues, lien vers `/boutique/:slug/order-tracking`
- **Cartes cadeaux** : une carte par boutique avec solde (alimentée par recyclage)
- **Recyclage** : historique des scans + explainer (1 point = 0,10 € sur la boutique d'origine)

**CTA opt-in checkout :** dans `CheckoutForm.tsx`, écran de confirmation propose « Activer mon compte client » → `/signup?next=/mon-compte&email=...`.

**Hooks :** `src/hooks/useCustomerProfile.ts`
- `useCustomerProfile()` — profil courant
- `useCreateCustomerProfile()` — création + claim auto des commandes invité
- `useCustomerOrders()` — historique multi-boutiques
- `useCustomerGiftCards()` — cartes cadeaux par boutique (solde > 0)
- `useRecyclingHistory()` — 50 derniers scans
- `useRecordRecyclingScan()` — enregistre un scan (le trigger crédite la carte cadeau)

**Pages :** `src/pages/customer/MonCompte.tsx`
