---
name: Store
description: Public marketplace at /store with boutique cards, random product stories, customer accounts, gift cards funded by recycling
type: feature
---
**Route :** `/marketplace`

Vitrine publique listant toutes les boutiques en statut `published` :
- Cartes boutiques avec **stories produits aléatoires** (4:3, autoplay 2.5s, barres de progression style Instagram)
- Recherche + filtres par catégorie (sticky)
- Hero avec 3 trust badges : « 0 stock, 0 logistique », « Produits audités », « Recyclage récompensé »
- Clic sur une carte → `/boutique/:slug`

**Hook :** `usStoreBoutiques()` (`src/hooks/useStore.ts`) — charge les boutiques publiées + jusqu'à 8 produits actifs par boutique pour les stories.

**Composants :** `src/components/store/BoutiqueCard.tsx`

**Modèle de données associé :**
- `customer_profiles` — compte client marketplace (auth Supabase distincte du vendeur)
- `gift_cards` — solde par (client × boutique), en centimes
- `recycling_scans` — événements de recyclage, source de vérité des points
- **Règle figée : 1 point recyclé = 10 centimes crédités sur la carte cadeau de la boutique d'origine** (trigger `credit_gift_card_on_scan`)
- `claim_guest_orders(profile_id, email)` — fonction RPC pour rattacher les commandes invité après opt-in compte

**Champs ajoutés à `boutiques`** : `cover_image_url`, `tagline` (pour cartes marketplace).

**Stripe :** centralisé côté Brand-In-A-Box (PAS Stripe Connect). BIB encaisse, reverse les vendeurs via la table `payments` existante.
