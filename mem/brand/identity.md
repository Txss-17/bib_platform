---
name: Brand-In-A-Box identity
description: Official brand name, logo, palette, typography and reusable Logo component
type: design
---
**Name**: Brand-In-A-Box (also acceptable: BIB)
**Tagline**: "Your brand. Ready to launch."
**Logo asset**: `src/assets/brand-in-a-box-logo.png` (open box with gold "B")

**Palette (HSL tokens in `index.css`)**:
- Marine `--bib-marine` / `--primary` = `215 55% 14%`
- Gold `--bib-gold` / `--accent` / `--secondary` = `41 55% 52%`
- Gold light `--bib-gold-light` = `41 65% 65%`
- Ivory `--bib-ivory` / `--background` = `40 30% 98%`

**Typography**:
- Display / headings: Playfair Display (serif, premium editorial)
- Body / UI: Inter

**Reusable component**: `<Logo />` from `@/components/Logo` — variants `full | compact | icon`, prop `onLight` for dark backgrounds. Never re-implement the wordmark inline.

**Premium CTAs**: Button variants `premium` (gold-on-marine, signature) and `gold` (gold gradient on marine text).

**Legacy note**: Tailwind classes `linksy-navy`, `linksy-teal`, `linksy-coral` still exist; their CSS variables now point to BIB palette (marine / gold / copper). Do not mass-rename.
