

# Dashboard responsive + fonctionnalites manquantes

## 1. Dashboard responsive (sidebar mobile)

**Probleme actuel** : La sidebar est fixe a `w-64` avec `ml-64` sur le contenu principal. Sur mobile, le contenu est cache derriere la sidebar.

**Solution** :
- Modifier `DashboardSidebar.tsx` pour utiliser un **Sheet** (drawer lateral) sur mobile et la sidebar fixe sur desktop
- Utiliser le hook `useIsMobile()` existant pour detecter la taille d'ecran
- Ajouter un bouton hamburger (`Menu` icon) dans le header de `DashboardLayout.tsx` visible uniquement sur mobile
- Supprimer le `ml-64` fixe et le rendre conditionnel (pas de marge sur mobile)
- La sidebar se ferme automatiquement apres un clic sur un lien de navigation en mode mobile

**Fichiers modifies** :
- `src/components/dashboard/DashboardSidebar.tsx` : wrapper Sheet sur mobile, sidebar classique sur desktop
- `src/components/dashboard/DashboardLayout.tsx` : ajout bouton hamburger, marge conditionnelle, passage du state open/close

## 2. Sauvegarde des parametres (Parametres.tsx)

**Probleme actuel** : Les champs du profil sont pre-remplis mais le bouton "Enregistrer" ne fait rien.

**Solution** :
- Ajouter des `useState` pour `fullName`, `businessName`, `businessType` initialises depuis `profile`
- Appeler `supabase.from("profiles").update(...)` au clic sur "Enregistrer"
- Appeler `refreshProfile()` du contexte Auth apres la sauvegarde
- Afficher un toast de succes/erreur
- Ajouter un state `saving` pour le loading du bouton

**Fichier modifie** : `src/pages/dashboard/Parametres.tsx`

## 3. Page Mot de passe oublie

**Solution** :
- Creer `src/pages/ForgotPassword.tsx` avec un formulaire email
- Appeler `supabase.auth.resetPasswordForEmail(email)`
- Message de confirmation apres envoi
- Lien retour vers `/login`
- Ajouter la route `/forgot-password` dans `App.tsx`

**Fichiers crees** : `src/pages/ForgotPassword.tsx`
**Fichiers modifies** : `src/App.tsx`

## 4. Page Aide & Support

**Solution** :
- Creer `src/pages/dashboard/Aide.tsx` avec :
  - Section FAQ (accordion avec questions frequentes)
  - Section contact (email support, formulaire simple)
  - Liens vers documentation
- Ajouter la route `/dashboard/aide` dans `App.tsx` (protegee)

**Fichiers crees** : `src/pages/dashboard/Aide.tsx`
**Fichiers modifies** : `src/App.tsx`

## 5. Confirmation de suppression

**Probleme actuel** : La suppression de boutiques et produits se fait sans confirmation.

**Solution** :
- Creer un composant reutilisable `ConfirmDeleteDialog.tsx` utilisant `AlertDialog` de shadcn/ui
- L'integrer dans `Boutiques.tsx` (suppression boutique) et `Produits.tsx` (suppression produit)
- Le dialog affiche un message clair ("Etes-vous sur de vouloir supprimer...") avec boutons Annuler/Supprimer

**Fichiers crees** : `src/components/dashboard/ConfirmDeleteDialog.tsx`
**Fichiers modifies** : `src/pages/dashboard/Boutiques.tsx`, `src/pages/dashboard/Produits.tsx`

## Resume des fichiers

| Action | Fichier |
|--------|---------|
| Modifier | `DashboardSidebar.tsx` |
| Modifier | `DashboardLayout.tsx` |
| Modifier | `Parametres.tsx` |
| Modifier | `App.tsx` |
| Modifier | `Boutiques.tsx` |
| Modifier | `Produits.tsx` |
| Creer | `ForgotPassword.tsx` |
| Creer | `Aide.tsx` |
| Creer | `ConfirmDeleteDialog.tsx` |

