

# Renommer les sections et supprimer Analyse Fournisseurs

## Changements

### 1. Sidebar (`DashboardSidebar.tsx`)
- "Produits" → "Mes Produits"
- "Produits fournisseurs" → "Catalogue Produits"
- Supprimer la ligne "Analyse Fournisseurs"
- Retirer l'import `Building2`

### 2. Page Produits (`Produits.tsx`)
- Renommer le titre du `DashboardLayout` en "Mes Produits"
- Ajouter un filtre par boutique (dropdown `Select`) et un filtre "Récent" pour trier par date de création
- Utiliser le hook `useBoutiques` pour alimenter le filtre boutique

### 3. Page ProduitsFournisseurs (`ProduitsFournisseurs.tsx`)
- Renommer le titre en "Catalogue Produits"

### 4. Routing (`App.tsx`)
- Supprimer la route `/dashboard/analyse-fournisseurs`
- Supprimer l'import `AnalyseFournisseurs`

### 5. Nettoyage
- Le fichier `AnalyseFournisseurs.tsx` reste dans le repo mais n'est plus accessible (pas de route, pas de lien sidebar)

### Fichiers modifiés
- `src/components/dashboard/DashboardSidebar.tsx`
- `src/pages/dashboard/Produits.tsx`
- `src/pages/dashboard/ProduitsFournisseurs.tsx`
- `src/App.tsx`

