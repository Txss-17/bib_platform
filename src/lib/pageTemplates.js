const PRODUCT_PAGE_SLUG = "__product__";
const PRODUCT_PAGE_SCENES = [
  { sceneType: "product-hero", variant: "image-left" },
  { sceneType: "product-description", variant: "centered" },
  { sceneType: "product-specs", variant: "table" },
  { sceneType: "trust-wall", variant: "badges-row", contentPatch: { title: "Achetez en confiance" } },
  { sceneType: "product-related", variant: "3-up" }
];
const PAGE_TEMPLATES = [
  {
    key: "blank",
    label: "Page vierge",
    emoji: "\u2728",
    description: "Une page vide \xE0 composer librement",
    defaultTitle: "Nouvelle page",
    defaultSlug: "page",
    scenes: []
  },
  {
    key: "products",
    label: "Nos produits",
    emoji: "\u{1F6CD}\uFE0F",
    description: "Hero + grille compl\xE8te des produits + CTA",
    defaultTitle: "Nos produits",
    defaultSlug: "produits",
    seoTitle: "Nos produits \u2014 collection compl\xE8te",
    seoDescription: "D\xE9couvrez notre collection compl\xE8te. Pi\xE8ces s\xE9lectionn\xE9es avec soin, livraison rapide.",
    scenes: [
      {
        sceneType: "hero-cinema",
        variant: "type-only",
        contentPatch: {
          title: "Toute la collection",
          subtitle: "Chaque pi\xE8ce, soigneusement s\xE9lectionn\xE9e.",
          ctaLabel: "Explorer"
        }
      },
      { sceneType: "products-grid", variant: "4-up" },
      { sceneType: "cta-sticky" }
    ]
  },
  {
    key: "cart",
    label: "Panier",
    emoji: "\u{1F6D2}",
    description: "Page panier d\xE9di\xE9e avec r\xE9cap et CTA checkout",
    defaultTitle: "Mon panier",
    defaultSlug: "panier",
    seoTitle: "Votre panier",
    seoDescription: "R\xE9capitulatif de votre commande avant validation.",
    scenes: [
      { sceneType: "cart-summary", variant: "full" },
      {
        sceneType: "trust-wall",
        variant: "badges-row",
        contentPatch: { title: "Achat 100 % s\xE9curis\xE9" }
      }
    ]
  },
  {
    key: "blog",
    label: "Blog / Journal",
    emoji: "\u{1F4F0}",
    description: "Liste d'articles \xE9ditoriale + newsletter",
    defaultTitle: "Le journal",
    defaultSlug: "journal",
    seoTitle: "Le journal \u2014 actualit\xE9s et coulisses",
    seoDescription: "Nos histoires, conseils et coulisses. Une lecture par mois, jamais plus.",
    scenes: [
      {
        sceneType: "hero-cinema",
        variant: "type-only",
        contentPatch: {
          title: "Le journal",
          subtitle: "Histoires, conseils et coulisses.",
          ctaLabel: "Lire le dernier article"
        }
      },
      { sceneType: "blog-list", variant: "grid" },
      { sceneType: "newsletter-editorial" }
    ]
  },
  {
    key: "about",
    label: "\xC0 propos",
    emoji: "\u{1F33F}",
    description: "Manifeste + histoire + \xE9quipe + chiffres cl\xE9s",
    defaultTitle: "\xC0 propos",
    defaultSlug: "a-propos",
    seoTitle: "\xC0 propos \u2014 notre histoire",
    seoDescription: "D\xE9couvrez notre histoire, nos valeurs et l'\xE9quipe derri\xE8re la maison.",
    scenes: [
      { sceneType: "manifesto-typographic" },
      { sceneType: "story-scrolly", variant: "alternating" },
      { sceneType: "founder-letter", variant: "portrait-left" },
      { sceneType: "stats-counter" },
      { sceneType: "team-grid", variant: "3-up" }
    ]
  },
  {
    key: "contact",
    label: "Contact",
    emoji: "\u2709\uFE0F",
    description: "Formulaire + carte + FAQ rapide",
    defaultTitle: "Contact",
    defaultSlug: "contact",
    seoTitle: "Contactez-nous",
    seoDescription: "Une question ? Notre \xE9quipe vous r\xE9pond sous 24 heures.",
    scenes: [
      { sceneType: "contact-form", variant: "split" },
      { sceneType: "map-location" },
      {
        sceneType: "faq-accordion",
        variant: "accordion",
        contentPatch: { title: "Questions fr\xE9quentes" }
      }
    ]
  }
];
function findPageTemplate(key) {
  return PAGE_TEMPLATES.find((t) => t.key === key);
}
function recommendedSceneTypesForPage(title, slug) {
  const haystack = `${title ?? ""} ${slug ?? ""}`.toLowerCase();
  const has = (...needles) => needles.some((n) => haystack.includes(n));
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
  return ["hero-cinema", "showcase-magazine", "story-scrolly", "trust-wall", "cta-sticky"];
}
export {
  PAGE_TEMPLATES,
  PRODUCT_PAGE_SCENES,
  PRODUCT_PAGE_SLUG,
  findPageTemplate,
  recommendedSceneTypesForPage
};
