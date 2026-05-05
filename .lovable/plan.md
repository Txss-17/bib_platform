
# Lot 3 — Architecture email à 2 canaux

Deux canaux séparés, chacun avec son rôle clair :

| Canal | Expéditeur | Destinataire | Usage |
|-------|------------|--------------|-------|
| **Gmail OAuth (par vendeur)** | Boutique du vendeur | Client final | Confirmation commande, expédition, bienvenue, message manuel |
| **Lovable Email (plateforme)** | `notify.brand-in-a-box.space` | Vendeur (et admin) | Onboarding, KYC, alertes, factures, escalade litige |

Le connecteur Gmail mono-tenant actuel sera **désactivé** au profit d'OAuth Google natif où chaque vendeur connecte son propre compte.

---

## Partie A — Gmail OAuth multi-vendeurs

### A1. Prérequis (à réaliser par vous une seule fois, je vous guide)
1. Créer un projet Google Cloud
2. Activer Gmail API
3. Configurer OAuth consent screen (External, scope `gmail.send`)
4. Créer credentials OAuth 2.0 Web → me fournir `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
5. Redirect URI à enregistrer : `https://lfsiwtpctqxpzyskakey.supabase.co/functions/v1/gmail-oauth-callback`

Je créerai les 2 secrets via `add_secret` quand on y arrive.

### A2. Schéma DB
Nouvelle table `boutique_gmail_tokens` :
- `boutique_id` (unique, FK logique)
- `gmail_address` (l'adresse réellement connectée)
- `access_token`, `refresh_token` (chiffrés via service-role only — RLS bloque tout accès client)
- `expires_at`, `scope`, `connected_at`

RLS : aucun accès client direct (lecture/écriture service_role uniquement). Le statut "connecté" sera exposé via `boutique_email_settings.gmail_connected` + `gmail_address` (lecture owner).

### A3. Edge functions
- **`gmail-oauth-start`** : génère URL d'autorisation Google avec `state = boutique_id` signé
- **`gmail-oauth-callback`** : échange code → tokens, stocke en DB, marque la boutique connectée, redirige vers `/dashboard/boutique/:id/edit?tab=email&gmail=connected`
- **`send-boutique-email`** (refonte) : récupère le refresh_token de LA boutique concernée, rafraîchit l'access_token si expiré, appelle Gmail API directement (plus via gateway Lovable)
- **`gmail-disconnect`** : révoque token + supprime ligne

### A4. UI (BoutiqueEdit > onglet Email)
- Si non connecté : bouton "Connecter le Gmail de ma boutique" → ouvre `gmail-oauth-start` dans nouvelle fenêtre
- Si connecté : badge "Connecté en tant que `vendeur@gmail.com`" + bouton "Déconnecter"
- Settings auto-send (déjà en place) restent identiques
- Templates par boutique (déjà en place) restent identiques

### A5. Nettoyage
- Le connecteur Gmail Lovable mono-tenant sera retiré (`standard_connectors--disconnect`) après validation
- `GOOGLE_MAIL_API_KEY` + appels gateway supprimés du code

---

## Partie B — Suite emails plateforme (Lovable Email)

### B1. Setup infra
- `email_domain--check_email_domain_status` (vérifier si domaine déjà configuré sur `brand-in-a-box.space`)
- Si non : dialogue de setup pour `notify.brand-in-a-box.space`
- `email_domain--setup_email_infra` (queue, suppression, unsubscribe)
- `email_domain--scaffold_transactional_email` (Edge function `send-transactional-email` + registry)
- `email_domain--scaffold_auth_email_templates` (refonte des emails Supabase Auth aux couleurs BIB)

### B2. Templates React Email à créer (charte BIB : marine + or, Playfair + Inter)
Tous transactionnels (1:1, déclenchés par événement) :

**Vendeur :**
1. `seller-welcome` — après signup vendeur
2. `kyc-submitted` — accusé réception docs
3. `kyc-approved` / `kyc-rejected` — décision admin
4. `boutique-published` — première publication
5. `low-stock-alert` — produit critique (<10%)
6. `new-order-notification` — nouvelle commande reçue
7. `payout-issued` — versement effectué
8. `subscription-receipt` — facture Linksy/Stripe
9. `dispute-escalated` — litige >48h non traité

**Admin :**
10. `admin-new-kyc` — nouvelle vérification à traiter
11. `admin-dispute-escalation` — litige escaladé

**Client (fallback si Gmail non connecté) :**
12. `customer-order-confirmation-fallback`

### B3. Câblage
- Triggers DB → Edge functions → `send-transactional-email`
- Hook après signup pour `seller-welcome`
- Trigger sur `boutique_documents` insert pour KYC
- Trigger sur `orders` insert pour notification vendeur
- Trigger sur `order_issues` >48h pour escalade
- Webhook Stripe existant → ajout `payout-issued` + `subscription-receipt`

### B4. Page unsubscribe
Création `/email-preferences/unsubscribe` aux couleurs BIB.

---

## Détails techniques

### Stockage tokens Gmail
Tokens stockés en clair dans une table service-role-only (équivalent à la pratique standard Supabase). Pas d'accès client possible via RLS. Si le user veut rotation/chiffrement renforcé, possible en v2.

### Choix expéditeur dans `payments-webhook`
```text
SI boutique a Gmail OAuth connecté → send-boutique-email (Gmail vendeur)
SINON → send-transactional-email (customer-order-confirmation-fallback via Lovable Email)
```
Garantit qu'un client reçoit toujours sa confirmation, même si le vendeur n'a pas branché Gmail.

### Mémoire à mettre à jour
Nouvelle entrée `mem://features/email-system` documentant les 2 canaux, et update `mem://features/email-marketing` pour refléter la refonte.

---

## Ordre d'exécution proposé

1. **Étape 1 (Lovable Email)** — Setup domaine `notify.brand-in-a-box.space` + infra + scaffold transactional + page unsubscribe + 4 templates critiques (welcome, KYC, new-order-notification, fallback client)
2. **Étape 2 (Gmail OAuth)** — Demande des credentials Google → tables → 4 edge functions → refonte UI + refonte `send-boutique-email` + désactivation connecteur mono-tenant
3. **Étape 3** — Templates restants (8) + tous les triggers + auth email templates BIB + refonte facture Stripe

Chaque étape est livrable indépendamment. Je commence par l'étape 1 dès approbation (elle ne nécessite aucune action de votre part avant le dialogue de domaine).
