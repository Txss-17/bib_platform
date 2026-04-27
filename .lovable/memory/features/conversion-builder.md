---
name: Conversion Builder
description: 6 nouvelles sections storefront (announcement, countdown, comparison, bundle, lookbook, sticky-cta) + 4 templates conversion (Fashion, Tech, One-product, Fitness) appliquables 1-clic
type: feature
---
**Nouvelles sections** (typées dans `SectionConfig.type`, données libres dans `section.data`) :
- `announcement` : bandeau supérieur (rendu hors liste, toujours en haut)
- `countdown` : timer urgence (`endsInHours`, `title`)
- `comparison` : tableau Us vs Them (`rows: {label, us, them}[]`)
- `bundle` : pack groupé (`items, originalPrice, bundlePrice` → calcule % et économie)
- `lookbook` : galerie 4 visuels asymétrique (`images: {url, alt}[]`)
- `sticky-cta` : CTA fixe bas-écran (rendu hors liste, en bas, masqué en mode preview)

**Composants** : `src/components/storefront/StorefrontConversionSections.tsx` (un seul fichier).

**Templates** : `conversionTemplates` dans `boutiqueTemplates.ts` — 4 presets (`fashion`, `tech`, `one-product`, `fitness`) appliqués via `applyConversionTemplate()` dans `BoutiqueEdit`. Réécrit sections + fonts + heroLayout + couleurs (marine/or) + heroTitle/Subtitle.

**UI éditeur** : onglet « Sections » → carte « Templates conversion » en haut (4 tuiles wireframe cliquables) + sélecteur « + Ajouter une section » qui filtre les sections déjà présentes.

Ancres : `#products` placé sur la grille produits pour le scroll du sticky-cta.
