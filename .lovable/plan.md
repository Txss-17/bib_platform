## 1. Composer Marketing en blocs (remplace le HTML brut)

Nouveau composant `src/components/marketing/BlockComposer.tsx` :

- **Liste de blocs réordonnables** (drag via dnd-kit déjà présent) avec types :
  - `heading` (titre + niveau H1/H2)
  - `text` (paragraphe simple)
  - `image` (upload vers `boutique-media` ou URL)
  - `button` (libellé + URL, rendu CTA marine/or)
  - `promo_code` (affichage encadré du `{{promo_code}}`)
  - `product_grid` (sélection 1–4 produits de la boutique → vignette + prix + lien)
  - `divider` / `spacer`
- **Sidebar gauche** : "Ajouter un bloc" (icônes + libellés FR clairs).
- **Édition à droite** : champs simples par bloc, jamais de HTML visible.
- **Aperçu live** au centre (rendu identique à l'email final, largeur 600px).
- **Sérialisation** : on stocke `body_blocks jsonb` et on génère `body_html` côté front au moment de l'envoi (fonction `renderBlocksToHtml()` en `src/lib/marketingBlocks.ts`).
- **Variables** insérables via menu (chip cliquable) : `{{first_name}}`, `{{boutique_name}}`, `{{promo_code}}` — plus de syntaxe à apprendre.
- **3 templates de départ** sélectionnables au lancement : Newsletter, Promo, Annonce.

Migration légère : ajout colonne `body_blocks jsonb` à `marketing_campaigns` (le `body_html` reste pour compat / audit).

## 2. Paramètres > Email marketing (nouvelle section repliable)

Dans `src/pages/dashboard/Parametres.tsx`, ajout d'une `Card` "Email marketing" (sous la section emails transactionnels existante, pas une page séparée — on garde la page courte). Contenu :

- **Expéditeur** : `from_name` + choix adresse (Gmail connectée OU `notify@brand-in-a-box.space`).
- **Signature & pied de page** : éditeur 3 champs (signature texte, lien Instagram, lien site) → injecté auto dans toutes les campagnes + mentions légales auto (adresse + désinscription).
- **Préférences d'envoi** : heure préférée (select), fréquence max/semaine (1/2/3/illimité), fuseau (auto-détecté).
- **Double opt-in newsletter** : switch on/off — si on, confirmation par email avant ajout à la liste.

Stockage : extension de `boutique_email_settings` avec colonnes `marketing_from_address`, `marketing_signature`, `marketing_footer_links jsonb`, `preferred_send_hour`, `max_per_week`, `timezone`, `double_opt_in_enabled`.

## 3. Refonte stats boutique — par page et par scène

Refonte de `src/pages/dashboard/BoutiqueAnalytics.tsx` :

### Header
- **Sélecteur boutique** (si plusieurs).
- **Sélecteur période** : `7j / 30j / 90j` avec badges de variation `+X% / -Y%` vs période précédente.

### Bloc KPIs globaux (4 cards)
Vues totales, Visiteurs uniques, Temps moyen, Taux de rebond — chaque card affiche la valeur + delta vs période précédente.

### Onglet "Par page"
Tableau des pages boutique (`boutique_pages`) avec colonnes :
- Page (titre + slug)
- Vues
- Visiteurs uniques
- Temps moyen
- Taux de rebond
- Clic → drill-down vers détail page

### Détail page (drawer ou route `/dashboard/analyse-boutiques/:boutiqueId/page/:pageId`)
- KPIs page
- **Liste des scènes** de la page avec : type, impressions, CTR, dwell moyen, scroll moyen, conversions (utilise `scene_analytics_summary` filtré sur les `scene_id` de la page).
- Sparkline 30j par scène.

### Onglet "Top produits"
- Tableau : Produit | Vues | Ajouts panier | Achats | Taux conversion
- Tri par vues / conversion.

### Données nécessaires
- `storefront_events` (existe) : `event_type` à enrichir si besoin avec `page_view`, `product_view`, `add_to_cart`, `bounce`. RPC `page_analytics_summary(_boutique_id, _since, _until)` à créer côté SQL pour agréger par `page_id` (extrait de `metadata->>'page_id'`).
- `scene_events` (existe) + RPC `scene_analytics_summary` (existe) → on l'utilise tel quel filtré par page.
- RPC `product_funnel_summary(_boutique_id, _since)` à créer pour top produits.

## Détails techniques

```text
src/
├── components/marketing/
│   ├── BlockComposer.tsx           # drag-list + sidebar + preview
│   ├── blocks/                     # un fichier par type de bloc
│   └── BlockPreview.tsx            # rendu live + utilisé pour render final
├── lib/marketingBlocks.ts          # types + renderBlocksToHtml()
├── pages/dashboard/
│   ├── Parametres.tsx              # + section Email marketing
│   └── BoutiqueAnalytics.tsx       # refonte complète
├── hooks/
│   ├── usePageAnalytics.ts         # new
│   └── useProductFunnel.ts         # new
supabase/migrations/
└── <ts>_marketing_blocks_and_analytics.sql
    - ALTER TABLE marketing_campaigns ADD COLUMN body_blocks jsonb
    - ALTER TABLE boutique_email_settings ADD COLUMNs (marketing_*, preferred_send_hour, ...)
    - CREATE FUNCTION page_analytics_summary(...)
    - CREATE FUNCTION product_funnel_summary(...)
```

Edge function `send-marketing-campaign` adaptée : accepte `body_blocks` OU `body_html`, applique signature + pied de page depuis `boutique_email_settings` avant envoi.

## Hors scope (V2)
- Heatmap clics, parcours utilisateurs.
- A/B testing campagnes.
- Éditeur visuel "WYSIWYG" libre (on garde la simplicité blocs).