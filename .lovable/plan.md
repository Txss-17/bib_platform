## Objectif

Transformer l'éditeur boutique en un véritable "page builder multi-pages" où :
1. L'identité (palette, polices, tailles) s'applique automatiquement à toutes les scènes, avec un override par scène.
2. Un bouton **+** à côté de l'aperçu crée une nouvelle page vierge éditable avec les mêmes scènes.
3. Les pages créées apparaissent automatiquement dans le menu de la boutique (avec drag pour réordonner).
4. De nouvelles scènes adaptées à des pages spécifiques (produits, blog, panier, contact…) sont disponibles.

---

## 1. Identité héritée + override par scène

**Modèle**
- Ajouter un champ `style_overrides` (JSONB nullable) sur `boutique_scenes` : `{ palette?: {...}, fonts?: {...}, sizes?: {...} }`.
- Par défaut `null` → la scène hérite de `boutique_brand_dna`.

**Renderer (`StudioSceneRenderer.tsx`)**
- Calculer pour chaque scène un `effectiveStyle = merge(brandDNA, scene.style_overrides)`.
- Injecter via CSS vars locales (`--scene-primary`, `--scene-font-heading`, `--scene-h1-size`…) sur le wrapper de la scène, pas globalement.

**Inspector (`SceneInspectorPro.tsx`)**
- Nouveau panneau "Style" par scène avec :
  - Toggle "Hériter de l'identité" (par défaut ON).
  - Si OFF : pickers couleurs (primary/accent/bg/text), selects polices (réutiliser `googleFonts.ts`), sliders tailles titres/corps.
- Reset rapide → remet `style_overrides = null`.

---

## 2. Bouton **+** à côté de l'aperçu — création de pages

**UI (`StudioEditor.tsx`)**
- Au-dessus de l'aperçu : barre d'onglets-pages (chaque page = un onglet avec le titre éditable inline).
- À droite de la barre : bouton **+** → crée une page vierge (mode `rich`, scènes vides) et l'active.
- Clic sur un onglet = bascule l'éditeur sur cette page (scènes affichées + inspector).
- Drag&drop horizontal des onglets → met à jour `position` (impacte l'ordre dans le menu boutique).
- Inline edit du titre depuis l'onglet (double-clic ou icône ✏️).
- Suppression depuis menu contextuel (sauf page "Accueil" qui reste protégée).

**Suppression onglet "Pages" du rail gauche** (déjà existant via PagesManager) — fonctionnalité déplacée dans la barre d'onglets de l'aperçu.

**Génération initiale**
- À la complétion du Brand Studio Wizard : ne plus créer aucune page custom (uniquement la page "Accueil" implicite avec ses scènes). L'utilisateur ajoute ce qu'il veut via **+**.

**Données**
- Réutiliser `boutique_pages` existant. Ajouter colonne `scenes_page_id` sur `boutique_scenes` (nullable) :
  - `null` = scènes de la page d'accueil.
  - sinon = scènes appartenant à une page custom.
- Hook `useBoutiqueScenes(boutiqueId, pageId?)` filtre par page.

---

## 3. Menu storefront dynamique

`StorefrontHeader.tsx` (déjà adapté en phase 3) :
- Lire `boutique_pages` ordonnées par `position`.
- Rendre les liens `/boutique/:slug/p/:pageSlug`.
- L'ordre dans l'éditeur (drag onglets) = ordre menu en temps réel.

---

## 4. Nouvelles scènes "page-spécifiques"

Étendre `studioScenes.ts` + `StudioSceneRenderer.tsx` + `SceneInspectorPro.tsx` :

| Scène | Cas d'usage |
|---|---|
| `products-grid` | Page "Nos produits" — grille filtrable des produits boutique |
| `product-spotlight` | Met un produit en avant (image + descriptif + CTA) |
| `blog-list` | Liste articles (titre + image + extrait) — contenu éditable JSON |
| `blog-article` | Article unique (titre, hero, markdown body) |
| `cart-summary` | Résumé panier stylisé pour page panier custom |
| `contact-form` | Formulaire de contact (nom, email, message) |
| `team-grid` | "L'équipe" — cartes membres |
| `pricing-table` | Tarifs / formules |
| `image-text-split` | Bloc image+texte alternable (50/50) |
| `accordion-faq` | FAQ accordéon (variante de l'existant si manquant) |
| `map-location` | Adresse + carte intégrée |
| `timeline` | Frise chronologique (notre histoire) |

Chaque scène : type + `defaultContent` + variants + champs inspector.

---

## Plan d'exécution (séquentiel)

1. Migration DB : `style_overrides` sur `boutique_scenes`, `scenes_page_id` sur `boutique_scenes`.
2. Hook `useBoutiqueScenes` + mutations adaptés à `pageId`.
3. Renderer : merge identité + overrides via CSS vars locales.
4. Inspector : panneau Style (hériter / override).
5. UI barre d'onglets-pages au-dessus de l'aperçu (+ drag, + inline rename, + bouton +).
6. Retirer l'onglet "Pages" du rail gauche (l'edit avancé reste dispo via "⋯ → métadonnées").
7. Stop la création initiale de pages (wizard).
8. Ajouter les ~12 nouvelles scènes (def + render + inspector minimal).
9. Vérifier menu storefront + page publique custom rendent bien les nouvelles scènes.

---

## Fichiers principaux impactés

- **Migration** : nouvelle migration `boutique_scenes`.
- `src/lib/studioScenes.ts` (+ nouvelles scènes)
- `src/hooks/useBrandStudio.ts` (scope par pageId, mutation overrides)
- `src/hooks/useBoutiquePages.ts` (reorder)
- `src/components/dashboard/boutique/StudioEditor.tsx` (barre onglets + bouton +)
- `src/components/dashboard/boutique/SceneInspectorPro.tsx` (panneau Style)
- `src/components/storefront/StudioSceneRenderer.tsx` (merge + nouvelles scènes)
- `src/components/storefront/StorefrontHeader.tsx` (déjà OK, vérifier ordre)
- `src/pages/BoutiqueCustomPage.tsx` (rendre scènes custom de la page)

---

## Hors scope (proposition pour plus tard)

- Bibliothèque de templates de pages "prêts à l'emploi" (1 clic → page Contact prête).
- Versioning / brouillons de pages.
- A/B testing par page.
