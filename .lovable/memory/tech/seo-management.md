---
name: SEO management
description: useSEO hook (title, meta, OG/Twitter, canonical, robots, JSON-LD, hreflang), dynamic sitemap edge function, robots.txt, SEO alerts dashboard, Search Console guide
type: feature
---
- `useSEO` centralises title/desc/canonical/robots/keywords/OG/Twitter/JSON-LD (`#bib-jsonld`) and hreflang `<link rel="alternate">` (class `bib-hreflang`, cleaned on unmount).
- Helper `buildLocaleAlternates(pathname?, locales=["fr","en"], defaultLocale="fr")` builds FR/EN + `x-default` using `?lang=`. Used by `BoutiquePublic` and `ProductPublic`.
- Edge function `sitemap-xml` (verify_jwt=false) returns dynamic XML sitemap with hreflang alternates for static pages + published boutiques + active products. 15min cache. URL: `https://lfsiwtpctqxpzyskakey.supabase.co/functions/v1/sitemap-xml`.
- `public/robots.txt` references the sitemap and disallows `/dashboard`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/mon-compte`.
- `SEOAnalytics.tsx` adds an alerts grid (severity high/medium/low): missing OG image, missing boutique/product description, missing product image, duplicate titles across boutiques+products, suboptimal title length.
- `Aide.tsx` ships a 6-step Google Search Console onboarding guide with one-click copy of the sitemap URL.
