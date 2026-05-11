/**
 * Page Templates — bundles de scènes prêts à l'emploi pour créer une page en un clic.
 * Chaque template = un titre par défaut + un slug + une liste de scènes à seeder.
 */

export type PageTemplateKey =
  | "blank"
  | "products"
  | "cart"
  | "blog"
  | "about"
  | "contact";

export interface PageTemplateScene {
  sceneType: string;
  variant?: string;
  contentPatch?: Record<string, unknown>;
}

export interface PageTemplate {
  key: PageTemplateKey;
  label: string;
  emoji: string;
  description: string;
  defaultTitle: string;
  defaultSlug: string;
  seoTitle?: string;
  seoDescription?: string;
  scenes: PageTemplateScene[];
}

/** Slug réservé pour la page modèle d'une fiche produit. */
export const PRODUCT_PAGE_SLUG = "__product__";

/** Bundle de scènes par défaut pour le modèle de page produit. */
export const PRODUCT_PAGE_SCENES: PageTemplateScene[] = [
  { sceneType: "product-hero", variant: "image-left" },
  { sceneType: "product-description", variant: "centered" },
  { sceneType: "product-specs", variant: "table" },
  { sceneType: "trust-wall", variant: "badges-row", contentPatch: { title: "Achetez en confiance" } },
  { sceneType: "product-related", variant: "3-up" },
];

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    key: "blank",
    label: "Page vierge",
    emoji: "✨",
    description: "Une page vide à composer librement",
    defaultTitle: "Nouvelle page",
    defaultSlug: "page",
    scenes: [],
  },
  {
    key: "products",
    label: "Nos produits",
    emoji: "🛍️",
    description: "Hero + grille complète des produits + CTA",
    defaultTitle: "Nos produits",
    defaultSlug: "produits",
    seoTitle: "Nos produits — collection complète",
    seoDescription:
      "Découvrez notre collection complète. Pièces sélectionnées avec soin, livraison rapide.",
    scenes: [
      {
        sceneType: "hero-cinema",
        variant: "type-only",
        contentPatch: {
          title: "Toute la collection",
          subtitle: "Chaque pièce, soigneusement sélectionnée.",
          ctaLabel: "Explorer",
        },
      },
      { sceneType: "products-grid", variant: "4-up" },
      { sceneType: "cta-sticky" },
    ],
  },
  {
    key: "cart",
    label: "Panier",
    emoji: "🛒",
    description: "Page panier dédiée avec récap et CTA checkout",
    defaultTitle: "Mon panier",
    defaultSlug: "panier",
    seoTitle: "Votre panier",
    seoDescription: "Récapitulatif de votre commande avant validation.",
    scenes: [
      { sceneType: "cart-summary", variant: "full" },
      {
        sceneType: "trust-wall",
        variant: "badges-row",
        contentPatch: { title: "Achat 100 % sécurisé" },
      },
    ],
  },
  {
    key: "blog",
    label: "Blog / Journal",
    emoji: "📰",
    description: "Liste d'articles éditoriale + newsletter",
    defaultTitle: "Le journal",
    defaultSlug: "journal",
    seoTitle: "Le journal — actualités et coulisses",
    seoDescription:
      "Nos histoires, conseils et coulisses. Une lecture par mois, jamais plus.",
    scenes: [
      {
        sceneType: "hero-cinema",
        variant: "type-only",
        contentPatch: {
          title: "Le journal",
          subtitle: "Histoires, conseils et coulisses.",
          ctaLabel: "Lire le dernier article",
        },
      },
      { sceneType: "blog-list", variant: "grid" },
      { sceneType: "newsletter-editorial" },
    ],
  },
  {
    key: "about",
    label: "À propos",
    emoji: "🌿",
    description: "Manifeste + histoire + équipe + chiffres clés",
    defaultTitle: "À propos",
    defaultSlug: "a-propos",
    seoTitle: "À propos — notre histoire",
    seoDescription:
      "Découvrez notre histoire, nos valeurs et l'équipe derrière la maison.",
    scenes: [
      { sceneType: "manifesto-typographic" },
      { sceneType: "story-scrolly", variant: "alternating" },
      { sceneType: "founder-letter", variant: "portrait-left" },
      { sceneType: "stats-counter" },
      { sceneType: "team-grid", variant: "3-up" },
    ],
  },
  {
    key: "contact",
    label: "Contact",
    emoji: "✉️",
    description: "Formulaire + carte + FAQ rapide",
    defaultTitle: "Contact",
    defaultSlug: "contact",
    seoTitle: "Contactez-nous",
    seoDescription:
      "Une question ? Notre équipe vous répond sous 24 heures.",
    scenes: [
      { sceneType: "contact-form", variant: "split" },
      { sceneType: "map-location" },
      {
        sceneType: "faq-accordion",
        variant: "accordion",
        contentPatch: { title: "Questions fréquentes" },
      },
    ],
  },
];

export function findPageTemplate(key: PageTemplateKey): PageTemplate | undefined {
  return PAGE_TEMPLATES.find((t) => t.key === key);
}

/**
 * Heuristique simple : devine le type de page d'après son titre/slug
 * et renvoie une liste ordonnée de scene_types recommandés.
 */
export function recommendedSceneTypesForPage(
  title?: string | null,
  slug?: string | null,
): string[] {
  const haystack = `${title ?? ""} ${slug ?? ""}`.toLowerCase();
  const has = (...needles: string[]) => needles.some((n) => haystack.includes(n));

  if (has("produit", "shop", "boutique", "catalog")) {
    return ["products-grid", "product-spotlight", "showcase-magazine", "cta-sticky", "trust-wall"];
  }
  if (has("panier", "cart", "checkout")) {
    return ["cart-summary", "trust-wall", "cta-sticky", "faq-accordion"];
  }
  if (has("blog", "journal", "actu", "article", "news")) {
    return ["blog-list", "hero-cinema", "newsletter-editorial", "marquee-strip"];
  }
  if (has("propos", "about", "histoire", "story", "equipe", "team")) {
    return ["manifesto-typographic", "story-scrolly", "founder-letter", "team-grid", "stats-counter", "timeline"];
  }
  if (has("contact", "support", "aide", "help")) {
    return ["contact-form", "map-location", "faq-accordion"];
  }
  if (has("tarif", "prix", "pricing", "abonnement")) {
    return ["pricing-table", "comparison-table", "faq-accordion", "cta-sticky"];
  }
  // Fallback : grands classiques universels
  return ["hero-cinema", "showcase-magazine", "story-scrolly", "trust-wall", "cta-sticky"];
}