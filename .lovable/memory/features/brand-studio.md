---
name: Brand Studio
description: Refonte de l'éditeur boutique — Studio guidé IA + scènes premium éditables (remplace drag-and-drop). Phase 1 Tour A livré (DB + edge function + wizard). Tour B à venir.
type: feature
---
**Tables**
- `boutique_brand_dna` — ADN de marque par boutique (1 ligne / boutique). Seed unique, palette HSL générée, typo (Google fonts), copy IA (tagline/hero/about/CTA), réponses du wizard. Public read si boutique publiée.
- `boutique_scenes` — scènes premium ordonnées (remplace l'ancien `theme_settings.sections`). Champs: `role`, `scene_type`, `variant`, `content` JSONB, `position`, `is_visible`. Public read si boutique publiée + visible.
- `boutiques.studio_completed_at` — timestamp; permet de détecter les boutiques héritées drag-and-drop.
- `boutiques.seo_jsonld` — JSON-LD enrichi généré (Tour B).

**Edge function** `boutique-ai` (verify_jwt par défaut, valide auth via service role + owns_boutique) — actions:
- `generate_brand_dna` → tool calling `compose_brand_dna` (Lovable AI gemini-2.5-flash)
- `generate_seo` → tool calling `compose_seo` (Tour B)
- `remix_scene` (Tour B)

**Bibliothèque** `src/lib/studioScenes.ts` — 6 scènes premium: hero-cinema, story-scrolly, lookbook-parallax, showcase-magazine, trust-wall, cta-sticky. Chacune typée + variants + contenu par défaut. `defaultStudioBundle()` produit le bundle initial (5 scènes).

**Hook** `src/hooks/useBrandStudio.ts` — `useBrandDNA`, `useBoutiqueScenes`, `useGenerateBrandDNA` (mutation qui appelle l'edge fn, persiste l'ADN, crée le bundle initial de scènes, marque `studio_completed_at`).

**UI** `src/components/dashboard/boutique/BrandStudioWizard.tsx` — wizard 5 étapes (audience, ambiance, ton, valeurs, inspiration) avec progress bar, validation par étape, génération IA finale.

**Tour B (livré)**:
- `StudioSceneRenderer` (`src/components/storefront/StudioSceneRenderer.tsx`) — rend Hero/Story/Lookbook/Showcase/Trust/CTA depuis `boutique_scenes` + injection couleurs ADN en CSS vars.
- `StudioEditor` (`src/components/dashboard/boutique/StudioEditor.tsx`) — split-screen rail gauche (scènes/identité/SEO) + preview live à droite. Inspector par scène (titre/sous-titre/CTA/chapitres/avis), reorder ↑↓, ajout via bibliothèque, suppression, switch visibilité, sélection variante.
- Hooks `useUpdateScene` / `useReorderScenes` / `useAddScene` / `useDeleteScene` / `useGenerateSeo` (dans `useBrandStudio.ts`).
- SEO Copilot via `boutique-ai` action `generate_seo` → persiste `boutiques.seo_title`, `seo_description`, `seo_jsonld` (blocks + keywords + h1).
- Routing: `BoutiqueEdit` early-return wizard si `!studio_completed_at`, sinon `<StudioEditor>`. L'ancien drag-and-drop reste dans le fichier (unreachable) pour itération future.
- `BoutiquePublic` route automatiquement vers `StudioSceneRenderer` quand `studio_completed_at` + scènes ≥ 1.