# Lot 3 — Étape 2 : Gmail OAuth multi-vendeurs

Chaque vendeur connecte **son propre compte Gmail / Google Workspace** à sa boutique. Les emails clients (confirmation commande, expédition, bienvenue…) partent depuis l'adresse réelle du vendeur, sur **son domaine**. Aucun partage de compte, aucune usurpation.

---

## Action requise de votre côté (une seule fois)

Avant que je puisse coder, vous devez créer les credentials OAuth Google :

1. Aller sur https://console.cloud.google.com/ → créer le projet **"Brand-In-A-Box"**
2. **APIs & Services → Library** → activer **Gmail API**
3. **OAuth consent screen** :
   - User Type : **External**
   - App name : Brand-In-A-Box
   - Support email + developer email : le vôtre
   - Scopes : ajouter `https://www.googleapis.com/auth/gmail.send`
   - Test users : votre email (tant que l'app est en mode "Testing")
4. **Credentials → Create Credentials → OAuth Client ID** :
   - Type : **Web application**
   - Name : Brand-In-A-Box Web
   - **Authorized redirect URIs** :
     `https://lfsiwtpctqxpzyskakey.supabase.co/functions/v1/gmail-oauth-callback`
5. Récupérer **Client ID** + **Client Secret**

Quand vous avez les 2 valeurs, dites « ok j'ai les credentials » et je vous demanderai de les coller via le dialogue secrets sécurisé.

> Note : tant que l'app est "in Testing", seuls les emails Test users peuvent connecter. Pour ouvrir aux vrais vendeurs, il faudra basculer en "In production" (pas de revue Google nécessaire pour le scope `gmail.send` non sensible si vous restez sous 100 users, sinon vérification requise — j'expliquerai en temps voulu).

---

## Ce que je vais construire

### 1. Base de données
Nouvelle table `boutique_gmail_tokens` :
- `boutique_id` (unique)
- `gmail_address` (l'adresse réellement connectée, ex. `contact@maboutique.fr`)
- `access_token`, `refresh_token`, `expires_at`, `scope`, `connected_at`
- **RLS** : aucun accès client (lecture/écriture `service_role` uniquement). Le statut "connecté" reste exposé via `boutique_email_settings.gmail_connected` + `gmail_address` (lecture owner).

### 2. Quatre Edge Functions
| Fonction | Rôle |
|----------|------|
| `gmail-oauth-start` | Génère l'URL d'autorisation Google avec `state = boutique_id` signé (JWT) |
| `gmail-oauth-callback` | Échange code → tokens, stocke en DB, marque la boutique connectée, redirige vers `/dashboard/boutique/:id/edit?tab=email&gmail=connected` |
| `send-boutique-email` (refonte) | Récupère le refresh_token de LA boutique, rafraîchit l'access_token si expiré, appelle **Gmail API directement** (plus le gateway Lovable mono-tenant) |
| `gmail-disconnect` | Révoque le token côté Google + supprime la ligne DB |

### 3. UI (BoutiqueEdit → onglet Email)
- **Si non connecté** : bouton "Connecter le Gmail de ma boutique" → ouvre `gmail-oauth-start` dans une nouvelle fenêtre
- **Si connecté** : badge "Connecté en tant que `contact@maboutique.fr`" + bouton "Déconnecter"
- Settings auto-send (déjà en place) restent identiques
- Templates par boutique (déjà en place) restent identiques
- Toast de succès quand `?gmail=connected` est présent dans l'URL au retour

### 4. Refonte du choix expéditeur dans `payments-webhook`
```text
SI boutique a Gmail OAuth connecté → send-boutique-email (Gmail vendeur)
SINON → send-transactional-email (customer-order-confirmation fallback BIB)
```
Garantit qu'un client reçoit toujours sa confirmation, même si le vendeur n'a pas branché Gmail.

### 5. Nettoyage
- Désactivation du connecteur Gmail Lovable mono-tenant (`standard_connectors--disconnect`)
- Suppression des appels au gateway `connector-gateway.lovable.dev/google_mail/...` et de l'usage de `GOOGLE_MAIL_API_KEY` dans le code

### 6. Mémoire
Création de `mem://features/gmail-oauth-multi-vendeurs` documentant l'architecture (table, redirect URI, flow, choix expéditeur).

---

## Détails techniques

- **Tokens stockés en clair** dans une table service-role-only (pratique standard Supabase). Pas d'accès client possible via RLS.
- **Refresh automatique** : `send-boutique-email` vérifie `expires_at` ; si expiré, POST vers `oauth2.googleapis.com/token` avec le `refresh_token` et met à jour la DB.
- **Google Workspace** (`contact@maboutique.fr`) : OAuth fonctionne identiquement, SPF/DKIM venant du vrai domaine du vendeur, **aucune config DNS requise** côté plateforme.
- **Gmail perso** (`@gmail.com`) : fonctionne aussi, mais moins pro pour les clients.
- **Pas d'usurpation possible** : Google n'autorise l'envoi que depuis l'adresse connectée (ou alias vérifié dans Workspace).

---

## Ordre d'exécution

1. Vous créez les credentials Google (étapes ci-dessus)
2. Vous me dites « ok », je lance le dialogue `add_secret` pour `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET`
3. Je crée la table + les 4 edge functions + l'UI + la refonte `payments-webhook`
4. Je désactive le connecteur Gmail mono-tenant
5. Vous testez en connectant un Gmail sur une boutique

Dites-moi quand vous êtes prêt à créer les credentials Google, ou si vous voulez que je vous guide pas-à-pas dans la console Google Cloud.
