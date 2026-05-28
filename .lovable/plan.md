
# Module Marketing & CRM Clients

## 1. Provider email — décision

**Lovable Emails** pour tout le bulk + transactionnel automatique.
- `From: Nom Boutique <{boutique-slug}@brand-in-a-box.space>` (domaine déjà vérifié `notify.brand-in-a-box.space`).
- Délivrabilité pro, unsubscribe + suppression list auto.
- **Gmail conservé** uniquement pour réponses 1-to-1 dans la page Commandes (déjà en place via `send-boutique-email`). Le vendeur peut le déconnecter sans impact sur les campagnes.

## 2. CRM Clients — nouvelle table + page

### Base de données
- **`boutique_customers`** : `id`, `boutique_id`, `email` (unique par boutique), `full_name`, `phone`, `city`, `country`, `total_spent_cents`, `orders_count`, `last_order_at`, `first_order_at`, `marketing_opt_in`, `source` (`order` / `newsletter_signup` / `import`), `tags[]`, `created_at`.
- **`boutique_customer_purchases`** (vue/agrégat) : lien `customer_id ↔ order_id` pour segmenter par produit/catégorie.
- **Trigger** : à chaque `INSERT` sur `orders` avec `payment_status='paid'` → upsert dans `boutique_customers` (incrément `total_spent`, `orders_count`, MAJ `last_order_at`).
- **RLS** : owner boutique = full access ; pas d'accès anon.
- **GRANTs** standards + `service_role`.

### Page Dashboard → Clients (nouveau menu)
- Liste paginée (avatar initiales, nom, email, total dépensé, nb commandes, dernière commande, badge opt-in).
- Filtres : recherche, opt-in only, dépensé > X, dernier achat, produit/catégorie acheté(e).
- Détail client : historique commandes, scans recyclage, tags éditables, opt-in toggle.
- Export CSV.
- Bouton **"Envoyer un message"** → préfill module Marketing.

### Opt-in newsletter storefront
- Bloc `StorefrontNewsletter` (existe déjà) → branché sur `boutique_customers` avec `source='newsletter_signup'`, `marketing_opt_in=true`. Double opt-in via email de confirmation transactionnel.

## 3. Module Marketing (nouvelle page Dashboard)

### Onglets
1. **Campagnes** — liste des envois passés + brouillons (newsletter, promo, message libre).
2. **Automations** — toggles ON/OFF :
   - Confirmation commande (déjà transactionnel, juste exposé)
   - Expédition (idem)
   - Relance panier abandonné (J+1h, J+24h) — nécessite tracking `storefront_events` type `cart_add`
   - Post-achat J+7 (demande d'avis)
   - Post-achat J+30 (cross-sell / fidélité)
3. **Segments** — visualisation des audiences (tous opt-in, par produit, par catégorie, top dépensé).
4. **Templates** — bibliothèque réutilisable (réutilise table `email_templates` existante).

### Composer de campagne
- Étape 1 : Type (Newsletter / Promo / Message libre).
- Étape 2 : Segment (tous opt-in, par produit/catégorie, sélection manuelle multi-clients).
- Étape 3 : Contenu (subject + éditeur HTML léger + variables `{{first_name}}`, `{{boutique_name}}` ; pour promo : code + montant + validité).
- Étape 4 : Aperçu + estimation destinataires + envoi immédiat ou programmé.
- Garde-fous : badge "marketing — opt-in only", check anti-spam (max N campagnes/jour selon plan).

## 4. Edge Functions

- **`send-marketing-campaign`** (nouveau) :
  - Auth : owner boutique.
  - Itère sur segment, pour chaque destinataire opt-in non-suppressed → enqueue dans `transactional_emails` queue (le dispatcher existant `process-email-queue` gère le rate limit).
  - Rend template via React Email avec data par destinataire.
  - Log dans nouvelle table `campaign_sends` (campaign_id, customer_id, status, sent_at).
- **`upsert-customer-from-order`** (DB trigger via pg_net) — alternative trigger SQL si plus simple.
- **`schedule-marketing-automations`** (cron via pg_cron) :
  - Toutes les heures : scan paniers abandonnés > 1h, commandes payées J+7, J+30 → enqueue campagne auto.

### Templates React Email à créer (dans `_shared/transactional-email-templates/`)
- `marketing-newsletter.tsx`
- `marketing-promo.tsx` (avec code + bouton)
- `marketing-custom.tsx` (HTML libre)
- `cart-abandoned.tsx`
- `post-purchase-review.tsx`
- `post-purchase-upsell.tsx`
- `newsletter-double-optin.tsx`

Tous ajoutés au `registry.ts`, redéployés via `deploy_edge_functions`.

## 5. Quotas par plan (`usePlanLimits`)

| Plan    | Contacts | Campagnes/mois | Automations |
|---------|----------|----------------|-------------|
| Starter | 500      | 2              | Transactionnel seul |
| Pro     | 5 000    | 20             | + Panier abandonné |
| Scale   | Illimité | Illimité       | + Post-achat J+7/J+30 |

Add-on "+5 000 contacts" achetable via Stripe (réutilise pattern AddOnsCompact).

## 6. UI/UX

- Nouveau menu sidebar : **Clients** (icône Users) et **Marketing** (icône Megaphone), entre Commandes et Analytics.
- Filtrage RBAC : rôle `marketing` voit ces 2 pages ; `support` voit Clients lecture seule ; `manager` tout.
- Mobile-first, palette marine/or, semantic tokens.

## Technique — résumé fichiers

- **Migration SQL** : `boutique_customers` + trigger + RLS + GRANTs + index `(boutique_id, email)`.
- **Edge Functions** : `send-marketing-campaign`, `schedule-marketing-automations` (+ templates).
- **Front** :
  - `src/pages/dashboard/Clients.tsx`
  - `src/pages/dashboard/Marketing.tsx` (Tabs : Campagnes / Automations / Segments / Templates)
  - `src/components/marketing/CampaignComposer.tsx`
  - `src/components/marketing/SegmentBuilder.tsx`
  - `src/hooks/useCustomers.ts`, `useCampaigns.ts`, `useAutomations.ts`
  - Sidebar + routes App.tsx
  - Bloc `StorefrontNewsletter` branché sur la nouvelle table
- **Cron** : pg_cron toutes les heures pour `schedule-marketing-automations`.

## Hors scope (proposé en V2)
- A/B testing campagnes
- WhatsApp / SMS
- Workflow visuel d'automation (drag & drop)
