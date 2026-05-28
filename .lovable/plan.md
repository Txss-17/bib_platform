# Plan — Add-ons, équipe & espace membre

## 1. Add-ons dans Paramètres → Abonnement (compact)

Fichier : `src/pages/dashboard/Parametres.tsx` (onglet `abonnement`).

Sous le `SubscriptionPanel`, ajouter un **bloc unique `SectionCard` "Add-ons"** avec 3 lignes compactes (titre + prix + Switch/CTA) :

1. **Assurance litiges** — toggle qui appelle `useOpenBillingPortal` (ou une checkout `insurance_monthly`) ; état lu sur `profile.insurance_addon_enabled`.
2. **Boutiques supplémentaires** — petit stepper (+/−) avec prix unitaire ; CTA "Mettre à jour" → ouvre le billing portal.
3. **Membres d'équipe supplémentaires** — même pattern que ci-dessus.

Garder la page courte : pas de gros textes, 1 ligne / add-on, prix à droite, badge "Actif" si souscrit.

## 2. Onboarding membre — auto-join par email

Côté Auth (`src/contexts/AuthContext.tsx`) : après un `signIn`/signup réussi, appeler un nouveau RPC `claim_team_invites(_email text)` qui fait :

```sql
UPDATE public.boutique_members
SET user_id = auth.uid(), status = 'active'
WHERE LOWER(invited_email) = LOWER(_email)
  AND status = 'pending'
  AND user_id IS NULL;
```

Migration : créer la fonction `security definer` + autoriser `authenticated`. Ainsi tout membre invité rejoint automatiquement l'équipe à sa première connexion sans email/code.

Sur la page Équipe, garder le statut `pending` visible jusqu'à ce que le membre se connecte (auto-bascule en `active`).

## 3. Espace membre dédié

Réutiliser le **DashboardLayout** existant (pas de second espace) avec un **switcher boutique** en haut de la sidebar et un filtrage des menus par rôle.

- `DashboardSidebar.tsx` :
  - Ajouter un `<BoutiqueSwitcher />` au-dessus du profil card. Source = `useBoutiques()` (déjà filtre par owner) **+** nouvelle requête `useMemberBoutiques()` qui liste les boutiques où `boutique_members.user_id = auth.uid() AND status='active'`. L'union devient le scope courant, persisté via un nouveau `TeamScopeContext` (`{ boutiqueId, role }` dans `localStorage`).
  - Filtrer `mainNavItems` via `useTeamPermissions(currentBoutiqueId)` : un membre `support` ne voit que Dashboard + Commandes + Mes tickets ; `marketing` voit Boutiques + Analytics ; `manager` voit Produits/Commandes/Analytics ; `owner` voit tout.
- Routes existantes (`Boutiques`, `Produits`, `Commandes`, etc.) : passer `boutiqueId` via le contexte au lieu d'un fetch "toutes mes boutiques", pour qu'un membre ne voie que la boutique dont il fait partie.
- Sur les pages, si `!canAccess(module)` → rediriger vers `/dashboard` avec toast "Accès non autorisé".

Aucune nouvelle route `/team/*` — un membre arrive sur `/dashboard` comme un owner, mais avec une vue strictement réduite à ses permissions sur la boutique sélectionnée.

## 4. Page Équipe refondue

`src/pages/dashboard/Equipe.tsx` (réservée au rôle `owner`) :

- **Header KPI** : Membres actifs / Sièges disponibles (selon plan + add-ons) / Invitations en attente.
- **Card "Permissions par rôle"** : matrice visuelle (rôle × module) lisible, basée sur `ROLE_PERMISSIONS`. Sert de référence avant d'inviter.
- **Liste des membres** enrichie : avatar/initiales, email, badge rôle, badge statut, **dernière connexion** (jointure `auth.users.last_sign_in_at` via une vue ou via les colonnes du profil), bouton **changer le rôle** (Select inline → `useUpdateMemberRole`) et **retirer**.
- **Empty state** clair expliquant l'auto-join : "Le membre rejoindra l'équipe automatiquement à sa prochaine connexion avec cet email."
- Bouton "Acheter un siège supplémentaire" si limite atteinte → renvoie sur l'onglet Abonnement → Add-ons.

## Détails techniques

- Migration SQL : RPC `claim_team_invites`, et nouvelle policy SELECT sur `boutiques` permettant à un membre actif de lire la boutique où il est membre (sinon le switcher ne verra rien). Garder l'index sur `boutique_members(invited_email, status)`.
- Nouveau hook `useMemberBoutiques()` + `TeamScopeContext` (provider monté dans `DashboardLayout`).
- `useTeamPermissions` consommé partout où on monte un module dashboard (HOC ou check inline en début de page).
- Pas de changement aux edge functions ; pas de Stripe live tant que les price_id add-on ne sont pas créés — placer des CTA "Bientôt disponible" si `price_id` manquant côté front pour éviter de bloquer.
- Page Paramètres : ne pas allonger — n'ajouter QUE la card Add-ons dans l'onglet existant, pas de nouvel onglet.
