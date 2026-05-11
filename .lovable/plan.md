# Plan — Éditeur boutique multi-pages premium (vague 4)

Cette demande regroupe ~8 chantiers indépendants. Je propose de les livrer en **4 phases courtes** pour pouvoir tester chaque étape.

---

## Phase A — Pages : SEO + templates + scènes recommandées

1. **Champs SEO par page** (déjà en DB : `slug`, `seo_title`, `seo_description`)
   - Nouveau panneau "Métadonnées de la page" dans `StudioEditor` (au-dessus de la liste des scènes quand une page custom est active).
   - Champs : Titre, Slug (auto-slugify + édition manuelle), Titre SEO, Meta description (compteurs 60/160).
   - Lien public auto-généré affiché en lecture seule : `/boutique/{slug-boutique}/p/{slug-page}` + bouton copier.

2. **Templates de pages "1-clic"** depuis la barre d'onglets
   - Bouton `+` → menu déroulant : `Vide`, `Produits`, `Panier`, `Blog`, `À propos`, `Contact`.
   - Chaque template crée la page + insère un bundle de scènes pré-configurées (ex. Produits = `hero-cinema` + `products-grid` + `cta-sticky`).
   - Définis dans `src/lib/pageTemplates.ts`.

3. **Scènes recommandées par contexte de page**
   - Dans la bibliothèque "Ajouter une scène", section `Recommandées pour cette page` en haut, calculée depuis le titre/slug de la page (heuristique simple).

---

## Phase B — Héritage identité + override (finition)

4. **Application automatique** : quand l'utilisateur change palette/polices/tailles dans le panneau Identité, toutes les scènes de la page se mettent à jour instantanément (CSS vars sur le wrapper page) — **sauf** celles avec `style_overrides != null`.
5. **Inspector "Style" par scène** : toggle "Hériter / Personnaliser", color pickers, font selects (depuis `googleFonts.ts`), sliders tailles. Bouton "Réinitialiser → hériter".
6. Indicateur visuel sur la scène (chip "Override") quand non hérité.

---

## Phase C — Édition de la scène Produits + page produit

7. **Inspector enrichi `products-grid`** (ouvert au clic sur la scène) :
   - Réordonner les produits (drag handles) + filtrage (afficher tout / sélection manuelle).
   - **Forme du cadre** : carré, arrondi, cercle, organic-blob.
   - **Disposition** : 2/3/4 colonnes, masonry, carousel.
   - **Effet hover** : zoom, parallaxe, image alternée (galerie aléatoire), tilt 3D, shine.
   - Persistés dans `scene.content`.

8. **Mode "page produit" éditable**
   - Nouvelle entité conceptuelle : "page produit type" (template appliqué à tous les produits de la boutique).
   - Stockée comme une `boutique_pages` spéciale (`slug = "__product__"`, `mode = "rich"`, masquée du menu).
   - Quand l'utilisateur clique sur un produit dans l'aperçu (mode édition) → bascule l'éditeur sur cette page-template.
   - Scènes dispo : `product-hero` (galerie + prix + CTA), `product-description`, `product-specs`, `product-reviews`, `product-related`, `product-gallery-3d`.
   - Le rendu storefront (`/product/:id`) injecte les données du produit dans ces scènes.

---

## Phase D — Audio de fond + génération IA contextuelle + viewport responsive

9. **Son de fond boutique**
   - Nouveau champ `boutique.theme_settings.background_audio_url` (pas de migration nécessaire — JSONB existant).
   - Upload mp3 dans bucket `boutique-media`.
   - Lecteur global storefront (autoplay muté + bouton son en bas-droite, respect prefers-reduced-motion).
   - Inspector dans onglet "Identité" : upload + volume + bouton "off".

10. **Génération IA contextuelle d'images / vidéos**
    - Edge function existante `studio-image-gen` étendue : reçoit `boutique_id`, charge `boutique_brand_dna` (palette, ambiance, ton, audience, mots-clés) et **enrichit le prompt** avec ces données → images uniques, cohérentes avec l'identité.
    - Nouvelle action `generate_for_product` : génère 4 visuels (hero, lifestyle, détail, packshot) pour un produit donné, en s'appuyant sur le nom + catégorie + ADN boutique.
    - Bouton "✨ Générer" sur tout champ image dans l'inspector (scènes + page produit).
    - Vidéos : nouvelle action `generate_video` côté edge function (utilise videogen, prompt enrichi ADN). Stockés dans `boutique-media/generated/`.
    - Galerie "Mes générations" par boutique pour réutiliser.

11. **Viewport responsive de l'aperçu**
    - Toolbar au-dessus de l'aperçu : icônes 📱 Mobile / 📱 Tablette / 💻 Desktop.
    - Wrapper iframe-like avec largeurs fixes (375 / 768 / 1280) + scale-to-fit.
    - État local (pas persistant).

---

## Fichiers principaux impactés

- `src/lib/pageTemplates.ts` (nouveau — bundles de scènes par template)
- `src/lib/studioScenes.ts` (+ 6 scènes produit : `product-hero`, `product-description`, `product-specs`, `product-reviews`, `product-related`, `product-gallery-3d`)
- `src/components/dashboard/boutique/StudioEditor.tsx` (panneau SEO page, menu + templates, viewport switcher, audio panel)
- `src/components/dashboard/boutique/SceneInspectorPro.tsx` (Style override, inspector products-grid riche, boutons "Générer ✨")
- `src/components/dashboard/boutique/ProductPageEditor.tsx` (nouveau — éditeur de page produit type)
- `src/components/storefront/StudioSceneRenderer.tsx` (héritage CSS vars, formes/effets produits, scènes produit, lecteur audio)
- `src/hooks/useBrandStudio.ts` (mutation page-template, audio, generations)
- `supabase/functions/studio-image-gen/index.ts` (enrichissement ADN, mode produit, mode vidéo)
- Migration : table `boutique_generations` (historique des assets IA générés).

---

## Hors scope (proposition pour plus tard)

- Versioning des pages / brouillons.
- A/B testing par page.
- Marketplace de templates communautaires.
- Génération audio IA (musique d'ambiance auto).

---

**OK pour partir sur cet ordre Phase A → D ?** Si oui, je commence directement par la Phase A (qui débloque l'usage immédiat).
