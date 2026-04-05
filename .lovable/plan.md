

# Plan : Filtre favoris, anti-doublon & analyse des manques

## Changements demandés

### 1. Empêcher l'ajout en double côté interface (`AddToBoutiqueDialog.tsx`)
- Charger les produits existants de l'utilisateur via `useProducts()`
- Quand une boutique est sélectionnée, vérifier si `supplier_product_id` existe déjà pour cette `boutique_id`
- Si oui : afficher un message d'avertissement inline et désactiver le bouton "Ajouter"
- Le backend gère déjà l'erreur `23505` mais l'UX sera proactive

### 2. Filtre "Favoris uniquement" (`ProduitsFournisseurs.tsx`)
- Ajouter un état `showFavoritesOnly` (boolean)
- Ajouter un bouton toggle Heart à côté des filtres existants (barre du haut)
- Intégrer le filtre dans la chaîne `filteredProducts` : si activé, ne garder que les produits où `isFavorite(product.id)` est `true`
- Compter les favoris et afficher le nombre sur le bouton

### 3. Ce qui manque pour un site professionnel (hors Stripe)

Voici les lacunes identifiées :

| Domaine | Manque | Impact |
|---------|--------|--------|
| **Notifications email** | Pas d'envoi réel d'emails (confirmation commande, changement statut) | Critique |
| **Export de données** | Pas d'export CSV/PDF pour commandes, ventes, rapports | Important |
| **Dashboard vide** | Le dashboard principal montre des données mockées, pas de données réelles connectées aux tables | Important |
| **Gestion clients** | Pas de page CRM / liste clients avec historique d'achats | Moyen |
| **Multi-langue storefront** | Le LanguageSwitcher existe mais la boutique publique est uniquement en français | Moyen |
| **Images produits multiples** | Un seul `image_url` sur `supplier_products`, pas de galerie | Moyen |
| **Politique de retour** | Pas de workflow retours/remboursements | Important |
| **Gestion stock réel** | Le champ stock a été ajouté mais pas connecté aux commandes (décrément auto) | Important |
| **SEO meta tags** | Pas de balises meta dynamiques sur les pages publiques des boutiques | Moyen |
| **Onboarding guidé** | Pas de tutoriel / wizard pour les nouveaux utilisateurs | Moyen |

## Fichiers modifiés
- `src/components/dashboard/AddToBoutiqueDialog.tsx` — vérification doublon avec données existantes
- `src/pages/dashboard/ProduitsFournisseurs.tsx` — bouton filtre favoris + logique

## Détails techniques

**Anti-doublon** : On importe `useProducts` dans le dialog. On filtre `products.filter(p => p.boutique_id === selectedBoutiqueId && p.supplier_product_id === product.id)`. Si résultat non vide → afficher `"Déjà ajouté à cette boutique"` avec une icône check et désactiver le bouton.

**Filtre favoris** : Un simple toggle button avec `Heart` icon (fill quand actif). Ajout d'une ligne dans le filtre : `const matchesFavorite = !showFavoritesOnly || isFavorite(product.id)`. Le compteur affiche `favorites.length` via le hook.

