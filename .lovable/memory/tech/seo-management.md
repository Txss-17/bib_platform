---
name: SEO management
description: useSEO hook, dynamic sitemap edge function, robots.txt, SEO alerts, multi-locale settings, Search Console URL inspection, on-page SEO inspector dock, bulk duplicate-titles fixer
type: feature
---
- `useSEO` centralises title/desc/canonical/robots/keywords/OG/Twitter/JSON-LD (`#bib-jsonld`) and hreflang `<link rel="alternate">` (class `bib-hreflang`, cleaned on unmount).
- Helper `buildLocaleAlternates(pathname?, locales?, defaultLocale?)` reads from `lib/seoSettings` (active locales + default locale + optional public origin) when args are omitted. Used by `BoutiquePublic` and `ProductPublic`.
- `lib/seoSettings.ts` persists `{ activeLocales, defaultLocale, publicOrigin }` in `localStorage` (key `bib.seo.settings.v1`). Hook `useSeoSettings()` reacts to changes via `bib:seo-settings-changed` event. Default is included in active locales automatically.
- Edge function `sitemap-xml` (verify_jwt=false) returns dynamic XML sitemap with hreflang alternates for static pages + published boutiques + active products. 15min cache.
- `public/robots.txt` references the sitemap and disallows `/dashboard`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/mon-compte`.
- `SEOAnalytics.tsx` shows alerts grid (high/medium/low) and a "Corriger les doublons" button opening `DuplicateTitlesDialog` — generates unique titles via templates ({name}, {category}, {boutique}); applies bulk UPDATE on `boutiques.name` (products are read-only, copy-only).
- `Aide.tsx` ships the GSC onboarding guide AND a URL Inspection launcher: select a published boutique/product, opens GSC pre-filled at `/search-console/inspect?resource_id=…&id=…`.
- `Parametres.tsx` exposes a "SEO" tab to toggle locales, choose `defaultLocale` (used for canonical + x-default), and set `publicOrigin` for custom domains. Live hreflang preview included.
- `PageSeoInspector.tsx` (component): floating dock visible only to the boutique owner on `BoutiquePublic`/`ProductPublic`. Shows status (OK/À améliorer/À corriger) for title, meta description, OG image, canonical and hreflang.
