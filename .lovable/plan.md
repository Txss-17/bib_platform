
# Plan : Commandes avancées + Rôles d'équipe

## Phase 1 — Base de données (migrations)

### Tables à créer :

**1. `order_issues` — Signalements clients**
- `id`, `order_id` (FK orders), `type` (enum: `not_received`, `return_request`, `defective`), `message`, `image_url`, `status` (enum: `pending`, `accepted`, `refused`, `resolved`, `escalated`), `created_at`, `deadline_at` (auto +48h), `customer_email`
- RLS : lecture pour le propriétaire de la boutique via `owns_boutique`, insertion anonyme (comme orders)

**2. `issue_responses` — Réponses vendeur aux signalements**
- `id`, `issue_id` (FK order_issues), `action` (enum: `accept`, `refuse`, `partial_refund`, `resend`, `other`), `message`, `created_at`
- RLS : insertion/lecture pour le propriétaire de la boutique

**3. `boutique_members` — Membres d'équipe**
- `id`, `boutique_id` (FK boutiques), `user_id` (FK auth.users), `role` (enum: `owner`, `manager`, `marketing`, `support`), `invited_email`, `status` (enum: `pending`, `active`, `removed`), `created_at`
- RLS : lecture/gestion pour le propriétaire, lecture pour les membres actifs

**4. Enum types :**
- `issue_type`: `not_received`, `return_request`, `defective`
- `issue_status`: `pending`, `accepted`, `refused`, `resolved`, `escalated`
- `issue_action`: `accept`, `refuse`, `partial_refund`, `resend`, `other`
- `team_role`: `owner`, `manager`, `marketing`, `support`
- `member_status`: `pending`, `active`, `removed`

### Modifications existantes :
- Ajouter colonne `has_protection` (boolean, default false) sur `boutiques`

## Phase 2 — Pages & composants

### Commandes (amélioration de l'existant)

**A. Page Commandes (`Commandes.tsx`)** — déjà existante
- Ajouter badge "Problème signalé" sur les commandes ayant un issue
- Ajouter onglet/filtre "Litiges" pour voir uniquement les commandes avec signalements

**B. Détail commande (`OrderDetailDialog.tsx`)** — améliorer
- Ajouter timeline visuelle : Commande → Expédition → Livraison
- Ajouter section "Signalements" avec liste des issues
- Interface de décision vendeur : boutons Accepter / Refuser / Proposer solution
- Afficher deadline 48h avec countdown
- Statut clair : En attente / Accepté / Refusé / Résolu / Escaladé

**C. Page publique signalement (nouveau)**
- `OrderIssueForm.tsx` — formulaire client accessible depuis le suivi de commande
- Choix du problème (3 options)
- Message optionnel + upload image
- Route : `/boutique/:slug/order-tracking` (ajouter bouton "Signaler un problème")

### Équipe (nouveau)

**D. Page Équipe (`Equipe.tsx`)**
- Liste des membres avec rôle, statut, date d'ajout
- Bouton "Inviter un membre" → dialog avec email + sélection rôle
- Bouton supprimer membre
- Limite selon abonnement (Standard=1, Growth=3, Premium=5+) avec message upgrade
- Route : `/dashboard/equipe`

**E. Système de permissions**
- Hook `useTeamPermissions()` qui retourne les modules accessibles selon le rôle
- Sidebar filtrée : chaque lien vérifie si le rôle courant y a accès
- Modules par rôle :
  - Owner : tout
  - Manager : produits, commandes, analytics
  - Marketing : boutique edit, storefront
  - Support : commandes (litiges uniquement), signalements

## Phase 3 — Hooks & logique

- `useOrderIssues()` — CRUD signalements
- `useIssueResponses()` — réponses vendeur
- `useBoutiqueMembers()` — gestion équipe
- `useTeamPermissions()` — permissions par rôle

## Fichiers créés
- `src/pages/dashboard/Equipe.tsx`
- `src/components/dashboard/OrderTimeline.tsx`
- `src/components/dashboard/OrderIssuePanel.tsx`
- `src/components/dashboard/IssueDecisionPanel.tsx`
- `src/components/dashboard/TeamMemberList.tsx`
- `src/components/dashboard/InviteMemberDialog.tsx`
- `src/components/storefront/OrderIssueForm.tsx`
- `src/hooks/useOrderIssues.ts`
- `src/hooks/useIssueResponses.ts`
- `src/hooks/useBoutiqueMembers.ts`
- `src/hooks/useTeamPermissions.ts`

## Fichiers modifiés
- `src/App.tsx` — nouvelle route `/dashboard/equipe`
- `src/components/dashboard/DashboardSidebar.tsx` — lien Équipe + filtrage par permissions
- `src/components/dashboard/OrderDetailDialog.tsx` — timeline + signalements + décisions
- `src/pages/OrderTracking.tsx` — bouton "Signaler un problème"
- `src/pages/dashboard/Commandes.tsx` — filtre litiges + badges
