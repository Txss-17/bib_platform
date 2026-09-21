/**
 * BIB Brand Studio — bibliothèque de scènes
 *
 * Cette bibliothèque constitue le contrat entre :
 * - le Brand Studio,
 * - le Scene Inspector,
 * - le renderer storefront,
 * - les bundles de génération,
 * - les scènes déjà persistées en base.
 *
 * Principe :
 * une variante n'est pas seulement un libellé.
 * Elle correspond à une véritable composition visuelle que le renderer
 * doit interpréter.
 */

export type SceneRole =
  | "hero"
  | "story"
  | "lookbook"
  | "showcase"
  | "trust"
  | "cta"
  | "faq"
  | "newsletter"
  | "press"
  | "comparison"
  | "founder"
  | "manifesto"
  | "marquee"
  | "gallery"
  | "stats"
  | "video"
  | "banner"
  | "products"
  | "blog"
  | "cart"
  | "contact"
  | "team"
  | "pricing"
  | "split"
  | "timeline"
  | "map"
  | "product";

export type SceneEditorGroup =
  | "content"
  | "layout"
  | "style"
  | "media"
  | "interaction"
  | "advanced";

export type SceneDensity =
  | "airy"
  | "balanced"
  | "dense";

export type SceneWidth =
  | "narrow"
  | "normal"
  | "wide"
  | "full";

export type SceneAlignment =
  | "left"
  | "center"
  | "right";

export interface SceneVariantDefinition {
  /**
   * Identifiant technique persistant.
   *
   * IMPORTANT :
   * ne pas renommer les variantes existantes sans migration.
   */
  id: string;

  /**
   * Libellé affiché dans le Studio.
   */
  name: string;

  /**
   * Description courte affichée sous le choix.
   */
  description: string;

  /**
   * Clé utilisée par le picker visuel.
   *
   * Elle permet au futur SceneVariantPicker de dessiner
   * une miniature sans dépendre du renderer complet.
   */
  preview:
    | "hero-full"
    | "hero-split"
    | "hero-type"
    | "hero-product"
    | "story-alternating"
    | "story-centered"
    | "story-pinned"
    | "gallery-asymmetric"
    | "gallery-grid"
    | "gallery-zigzag"
    | "products-editorial"
    | "products-catalog"
    | "products-carousel"
    | "trust-press"
    | "trust-reviews"
    | "trust-badges"
    | "cta-centered"
    | "cta-split"
    | "cta-sticky"
    | "faq-list"
    | "faq-columns"
    | "faq-accordion"
    | "newsletter-centered"
    | "newsletter-split"
    | "newsletter-minimal"
    | "press-scroll"
    | "press-grid"
    | "press-centered"
    | "comparison-check"
    | "comparison-stars"
    | "comparison-minimal"
    | "founder-letter"
    | "founder-left"
    | "founder-right"
    | "manifesto-xl"
    | "manifesto-stack"
    | "manifesto-marquee"
    | "marquee-dark"
    | "marquee-light"
    | "marquee-accent"
    | "marquee-outline"
    | "gallery-mosaic"
    | "gallery-uniform"
    | "gallery-masonry"
    | "stats-centered"
    | "stats-split"
    | "stats-minimal"
    | "video-fullscreen"
    | "video-boxed"
    | "video-split"
    | "banner-solid"
    | "banner-gradient"
    | "banner-outline"
    | "product-grid-3"
    | "product-grid-4"
    | "product-grid-compact"
    | "product-spotlight-left"
    | "product-spotlight-right"
    | "product-spotlight-centered"
    | "blog-grid"
    | "blog-list"
    | "blog-featured"
    | "cart-full"
    | "cart-compact"
    | "contact-centered"
    | "contact-split"
    | "team-grid-3"
    | "team-grid-4"
    | "team-circle"
    | "pricing-2"
    | "pricing-3"
    | "pricing-4"
    | "split-image-left"
    | "split-image-right"
    | "split-image-top"
    | "timeline-vertical"
    | "timeline-horizontal"
    | "map-split"
    | "map-centered"
    | "product-hero-left"
    | "product-hero-right"
    | "product-hero-tall"
    | "product-description-centered"
    | "product-description-columns"
    | "product-specs-table"
    | "product-specs-list"
    | "product-related-3"
    | "product-related-4"
    | "product-related-carousel";

  /**
   * Réglages proposés dans l'inspecteur pour cette variante.
   */
  supportedEditors?: SceneEditorGroup[];

  /**
   * Valeurs de mise en page recommandées.
   */
  defaults?: {
    width?: SceneWidth;
    align?: SceneAlignment;
    density?: SceneDensity;
  };
}

export interface SceneDefinition {
  id: string;
  role: SceneRole;
  name: string;
  tagline: string;
  description: string;

  /**
   * Variante par défaut.
   */
  defaultVariant: string;

  /**
   * Variantes visuelles réellement supportées.
   */
  variants: SceneVariantDefinition[];

  /**
   * Contenu par défaut enregistré dans boutique_scenes.content.
   */
  defaultContent: Record<string, unknown>;

  /**
   * Clé utilisée pour le picker de scènes.
   */
  previewKey:
    | "hero-cinema"
    | "story-scrolly"
    | "lookbook-parallax"
    | "showcase-magazine"
    | "trust-wall"
    | "cta-sticky"
    | "faq-accordion"
    | "newsletter-editorial"
    | "press-strip"
    | "comparison-table"
    | "founder-letter"
    | "manifesto-typographic"
    | "marquee-strip"
    | "gallery-mosaic"
    | "stats-counter"
    | "video-fullscreen"
    | "banner-promo"
    | "products-grid"
    | "product-spotlight"
    | "blog-list"
    | "cart-summary"
    | "contact-form"
    | "team-grid"
    | "pricing-table"
    | "image-text-split"
    | "timeline"
    | "map-location"
    | "product-hero"
    | "product-description"
    | "product-specs"
    | "product-related";
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function variant(
  id: string,
  name: string,
  description: string,
  preview: SceneVariantDefinition["preview"],
  defaults?: SceneVariantDefinition["defaults"],
  supportedEditors: SceneEditorGroup[] = [
    "content",
    "layout",
    "style",
    "media",
    "interaction",
  ],
): SceneVariantDefinition {
  return {
    id,
    name,
    description,
    preview,
    defaults,
    supportedEditors,
  };
}

/* -------------------------------------------------------------------------- */
/* Scene definitions                                                           */
/* -------------------------------------------------------------------------- */

export const STUDIO_SCENES: SceneDefinition[] = [
  /* ---------------------------------------------------------------------- */
  /* HERO                                                                   */
  /* ---------------------------------------------------------------------- */

  {
    id: "hero-cinema",
    role: "hero",
    name: "Hero Cinéma",
    tagline: "Une ouverture forte qui donne immédiatement le ton de la marque.",
    description:
      "Hero immersif destiné à présenter l'identité de la boutique dès l'arrivée sur la page.",
    defaultVariant: "fullscreen",
    previewKey: "hero-cinema",

    variants: [
      variant(
        "fullscreen",
        "Immersif",
        "Image ou vidéo en grand format avec texte superposé.",
        "hero-full",
        { width: "full", align: "center", density: "airy" },
      ),
      variant(
        "split",
        "Éditorial split",
        "Image dominante d'un côté et contenu éditorial de l'autre.",
        "hero-split",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "type-only",
        "Typographique",
        "Une composition centrée sans image, portée par la typographie.",
        "hero-type",
        { width: "normal", align: "center", density: "airy" },
      ),
      variant(
        "product",
        "Produit signature",
        "Un produit mis au premier plan avec titre et CTA.",
        "hero-product",
        { width: "wide", align: "left", density: "balanced" },
      ),
    ],

    defaultContent: {
      eyebrow: "Maison",
      title: "Une nouvelle façon de porter l'élégance",
      subtitle: "Pièces conçues pour durer, racontées avec exigence.",
      ctaLabel: "Découvrir la collection",
      ctaUrl: "#shop",
      secondaryCtaLabel: "",
      secondaryCtaUrl: "",
      backgroundImage: null,
      videoUrl: null,
      overlayOpacity: 0.45,
      fullPageBackground: false,
      textAlign: "center",
      productId: null,
      focalPoint: "center",
    },
  },

  /* ---------------------------------------------------------------------- */
  /* STORY                                                                  */
  /* ---------------------------------------------------------------------- */

  {
    id: "story-scrolly",
    role: "story",
    name: "Story Scrollytelling",
    tagline: "Une narration construite comme un récit visuel.",
    description:
      "Trois à cinq chapitres pour raconter l'origine, le savoir-faire et la promesse de la marque.",
    defaultVariant: "alternating",
    previewKey: "story-scrolly",

    variants: [
      variant(
        "alternating",
        "Alterné",
        "Le texte et les images alternent de gauche à droite.",
        "story-alternating",
        { width: "wide", align: "left", density: "airy" },
      ),
      variant(
        "centered",
        "Centré",
        "Chaque chapitre est centré pour une narration plus calme.",
        "story-centered",
        { width: "normal", align: "center", density: "airy" },
      ),
      variant(
        "side-pinned",
        "Colonne fixe",
        "Le titre reste visuellement ancré pendant le défilement.",
        "story-pinned",
        { width: "wide", align: "left", density: "airy" },
      ),
    ],

    defaultContent: {
      eyebrow: "Notre histoire",
      title: "Tout commence par une obsession",
      chapters: [
        {
          eyebrow: "Origine",
          title: "Tout commence par une obsession",
          body: "Sourcer la matière la plus juste, sans compromis.",
          image: null,
        },
        {
          eyebrow: "Savoir-faire",
          title: "Façonné avec exigence",
          body: "Chaque pièce passe par plusieurs étapes de contrôle.",
          image: null,
        },
        {
          eyebrow: "Promesse",
          title: "Pensé pour durer",
          body: "Une création qui accompagne réellement son propriétaire.",
          image: null,
        },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* LOOKBOOK                                                               */
  /* ---------------------------------------------------------------------- */

  {
    id: "lookbook-parallax",
    role: "lookbook",
    name: "Lookbook",
    tagline: "Une présentation éditoriale des visuels de la marque.",
    description:
      "Une galerie de campagne pensée comme un magazine plutôt qu'une simple grille d'images.",
    defaultVariant: "asymmetric",
    previewKey: "lookbook-parallax",

    variants: [
      variant(
        "asymmetric",
        "Asymétrique",
        "Grandes images et petits visuels dans une composition éditoriale.",
        "gallery-asymmetric",
        { width: "wide", align: "left", density: "airy" },
      ),
      variant(
        "tiled",
        "Grille",
        "Composition régulière et facilement scannable.",
        "gallery-grid",
        { width: "wide", align: "center", density: "balanced" },
      ),
      variant(
        "zigzag",
        "Zigzag",
        "Alternance gauche/droite pour donner un rythme narratif.",
        "gallery-zigzag",
        { width: "wide", align: "left", density: "airy" },
      ),
    ],

    defaultContent: {
      title: "La nouvelle saison",
      subtitle: "Six pièces, six histoires.",
      images: [],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* SHOWCASE                                                               */
  /* ---------------------------------------------------------------------- */

  {
    id: "showcase-magazine",
    role: "showcase",
    name: "Vitrine Magazine",
    tagline: "Des produits présentés comme une sélection éditoriale.",
    description:
      "Une vitrine plus expressive qu'une grille catalogue classique.",
    defaultVariant: "3-up",
    previewKey: "showcase-magazine",

    variants: [
      variant(
        "3-up",
        "Éditorial 3",
        "Trois produits avec davantage d'espace et une hiérarchie forte.",
        "products-editorial",
        { width: "wide", align: "left", density: "airy" },
      ),
      variant(
        "4-up",
        "Catalogue 4",
        "Quatre produits par ligne pour une présentation plus dense.",
        "products-catalog",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "carousel",
        "Carousel",
        "Une rangée horizontale particulièrement adaptée au mobile.",
        "products-carousel",
        { width: "wide", align: "left", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "Sélection signature",
      subtitle: "Les indispensables à découvrir maintenant.",
      productIds: [],
      layout: "3-up",
      cardShape: "rounded",
      cardStyle: "minimal",
    },
  },

  /* ---------------------------------------------------------------------- */
  /* TRUST                                                                  */
  /* ---------------------------------------------------------------------- */

  {
    id: "trust-wall",
    role: "trust",
    name: "Mur de confiance",
    tagline: "Preuves, avis et garanties réunis dans une composition claire.",
    description:
      "Une section destinée à rassurer sans donner l'impression d'une page publicitaire.",
    defaultVariant: "reviews-first",
    previewKey: "trust-wall",

    variants: [
      variant(
        "press-first",
        "Presse",
        "Les références média occupent le premier plan.",
        "trust-press",
        { width: "wide", align: "center", density: "balanced" },
      ),
      variant(
        "reviews-first",
        "Avis clients",
        "Les témoignages deviennent l'élément principal.",
        "trust-reviews",
        { width: "wide", align: "center", density: "airy" },
      ),
      variant(
        "badges-row",
        "Garanties",
        "Une présentation horizontale des engagements et garanties.",
        "trust-badges",
        { width: "wide", align: "center", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "Ils nous font confiance",
      pressLogos: [],
      reviews: [
        {
          author: "Camille L.",
          quote: "Une expérience irréprochable.",
          rating: 5,
        },
        {
          author: "Hugo R.",
          quote: "Une finition et un service remarquables.",
          rating: 5,
        },
      ],
      badges: [
        "Vérifié par BIB",
        "Garantie",
        "Service client humain",
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* CTA                                                                    */
  /* ---------------------------------------------------------------------- */

  {
    id: "cta-sticky",
    role: "cta",
    name: "Conversion",
    tagline: "Une conclusion forte pour guider l'utilisateur.",
    description:
      "Bloc de conversion final avec variantes adaptées à différents objectifs.",
    defaultVariant: "centered",
    previewKey: "cta-sticky",

    variants: [
      variant(
        "centered",
        "Centré",
        "CTA éditorial centré, simple et élégant.",
        "cta-centered",
        { width: "normal", align: "center", density: "airy" },
      ),
      variant(
        "split-newsletter",
        "Action + newsletter",
        "Deux actions distinctes avec hiérarchie visuelle.",
        "cta-split",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "sticky-only",
        "Sticky mobile",
        "Une conclusion discrète complétée par une action persistante sur mobile.",
        "cta-sticky",
        { width: "normal", align: "center", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "Prêt à découvrir la collection ?",
      subtitle: "Découvrez les créations de la maison.",
      ctaLabel: "Découvrir",
      ctaSecondaryLabel: "",
      ctaUrl: "#shop",
      ctaSecondaryUrl: "",
      stickyEnabled: true,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* FAQ                                                                    */
  /* ---------------------------------------------------------------------- */

  {
    id: "faq-accordion",
    role: "faq",
    name: "FAQ",
    tagline: "Répondre clairement aux principales questions.",
    description:
      "Questions/réponses structurées pour améliorer la compréhension et réduire les objections.",
    defaultVariant: "accordion",
    previewKey: "faq-accordion",

    variants: [
      variant(
        "accordion",
        "Accordéon",
        "Lecture progressive avec une seule question ouverte à la fois.",
        "faq-accordion",
        { width: "normal", align: "left", density: "balanced" },
      ),
      variant(
        "two-column",
        "Deux colonnes",
        "Toutes les questions visibles dans une composition plus dense.",
        "faq-columns",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "list",
        "Liste",
        "Questions et réponses visibles sans interaction.",
        "faq-list",
        { width: "normal", align: "left", density: "airy" },
      ),
    ],

    defaultContent: {
      title: "Vos questions, nos réponses",
      items: [
        {
          q: "Quels sont vos délais de livraison ?",
          a: "Les délais sont indiqués au moment de la commande.",
        },
        {
          q: "Quelle est votre politique de retour ?",
          a: "Les modalités de retour sont précisées dans les conditions de la boutique.",
        },
        {
          q: "Comment entretenir le produit ?",
          a: "Consultez les recommandations indiquées sur la fiche produit.",
        },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* NEWSLETTER                                                             */
  /* ---------------------------------------------------------------------- */

  {
    id: "newsletter-editorial",
    role: "newsletter",
    name: "Newsletter éditoriale",
    tagline: "Une capture email intégrée à l'univers de la marque.",
    description:
      "Section newsletter conçue comme une vraie composante éditoriale du site.",
    defaultVariant: "centered",
    previewKey: "newsletter-editorial",

    variants: [
      variant(
        "centered",
        "Centrée",
        "Présentation minimaliste centrée.",
        "newsletter-centered",
        { width: "normal", align: "center", density: "airy" },
      ),
      variant(
        "split-image",
        "Image + inscription",
        "Image d'ambiance et formulaire côte à côte.",
        "newsletter-split",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "minimal",
        "Minimal",
        "Une ligne éditoriale très légère.",
        "newsletter-minimal",
        { width: "normal", align: "left", density: "compact" },
      ),
    ],

    defaultContent: {
      eyebrow: "Le journal",
      title: "Recevez nos nouveautés",
      subtitle: "Une communication sélectionnée, sans saturation.",
      placeholder: "Votre adresse email",
      ctaLabel: "S'abonner",
      image: null,
      benefits: [
        "Accès anticipé",
        "Nouveautés",
        "Histoires de la maison",
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* PRESS                                                                  */
  /* ---------------------------------------------------------------------- */

  {
    id: "press-strip",
    role: "press",
    name: "Presse",
    tagline: "Références médias et publications.",
    description:
      "Présente les médias ou partenaires ayant parlé de la marque.",
    defaultVariant: "scrolling",
    previewKey: "press-strip",

    variants: [
      variant(
        "scrolling",
        "Défilant",
        "Bandeau horizontal animé.",
        "press-scroll",
        { width: "full", align: "center", density: "compact" },
      ),
      variant(
        "static-grid",
        "Grille",
        "Logos disposés dans une grille stable.",
        "press-grid",
        { width: "wide", align: "center", density: "balanced" },
      ),
      variant(
        "centered",
        "Centré",
        "Une composition plus discrète et institutionnelle.",
        "press-centered",
        { width: "normal", align: "center", density: "compact" },
      ),
    ],

    defaultContent: {
      eyebrow: "Vu dans",
      logos: [
        { name: "Vogue", url: null },
        { name: "ELLE", url: null },
        { name: "Le Monde", url: null },
        { name: "Forbes", url: null },
        { name: "Madame Figaro", url: null },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* COMPARISON                                                             */
  /* ---------------------------------------------------------------------- */

  {
    id: "comparison-table",
    role: "comparison",
    name: "Comparatif",
    tagline: "Faire comprendre rapidement la proposition de valeur.",
    description:
      "Comparaison structurée entre la boutique et une alternative.",
    defaultVariant: "check-cross",
    previewKey: "comparison-table",

    variants: [
      variant(
        "check-cross",
        "Oui / non",
        "Lecture immédiate des avantages.",
        "comparison-check",
        { width: "normal", align: "center", density: "balanced" },
      ),
      variant(
        "stars",
        "Évaluation",
        "Comparaison sous forme de niveaux.",
        "comparison-stars",
        { width: "wide", align: "center", density: "balanced" },
      ),
      variant(
        "minimal",
        "Minimal",
        "Tableau très épuré.",
        "comparison-minimal",
        { width: "normal", align: "left", density: "airy" },
      ),
    ],

    defaultContent: {
      title: "Pourquoi nous choisir",
      brand_name: "Notre maison",
      competitor_name: "Alternative",
      rows: [
        {
          label: "Matières sélectionnées",
          us: true,
          them: false,
        },
        {
          label: "Garantie",
          us: true,
          them: false,
        },
        {
          label: "Service humain",
          us: true,
          them: false,
        },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* FOUNDER                                                                */
  /* ---------------------------------------------------------------------- */

  {
    id: "founder-letter",
    role: "founder",
    name: "Lettre du fondateur",
    tagline: "Donner un visage et une voix à la maison.",
    description:
      "Une prise de parole personnelle permettant de créer une relation plus directe avec le visiteur.",
    defaultVariant: "letter",
    previewKey: "founder-letter",

    variants: [
      variant(
        "letter",
        "Lettre",
        "Texte et signature dans une composition très éditoriale.",
        "founder-letter",
        { width: "normal", align: "center", density: "airy" },
      ),
      variant(
        "portrait-left",
        "Portrait gauche",
        "Portrait à gauche et texte à droite.",
        "founder-left",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "portrait-right",
        "Portrait droite",
        "Texte à gauche et portrait à droite.",
        "founder-right",
        { width: "wide", align: "left", density: "balanced" },
      ),
    ],

    defaultContent: {
      eyebrow: "Notre histoire",
      title: "Un mot du fondateur",
      body:
        "Quand j'ai imaginé cette maison, j'avais en tête une seule idée : faire mieux, avec exigence et cohérence.",
      signature: "Le fondateur",
      portraitUrl: null,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* MANIFESTO                                                              */
  /* ---------------------------------------------------------------------- */

  {
    id: "manifesto-typographic",
    role: "manifesto",
    name: "Manifeste",
    tagline: "Une déclaration de marque dominée par la typographie.",
    description:
      "Une scène sans dépendance à l'image, construite autour du message.",
    defaultVariant: "xl",
    previewKey: "manifesto-typographic",

    variants: [
      variant(
        "xl",
        "Monumental",
        "Très grande typographie et beaucoup d'espace.",
        "manifesto-xl",
        { width: "wide", align: "left", density: "airy" },
      ),
      variant(
        "stacked",
        "Empilé",
        "Plusieurs lignes hiérarchisées verticalement.",
        "manifesto-stack",
        { width: "normal", align: "left", density: "airy" },
      ),
      variant(
        "marquee",
        "Défilant",
        "Manifeste animé horizontalement.",
        "manifesto-marquee",
        { width: "full", align: "center", density: "compact" },
      ),
    ],

    defaultContent: {
      lines: [
        "Faire moins.",
        "Faire mieux.",
        "Faire pour durer.",
      ],
      footnote: "Notre manifeste.",
    },
  },

  /* ---------------------------------------------------------------------- */
  /* MARQUEE                                                                */
  /* ---------------------------------------------------------------------- */

  {
    id: "marquee-strip",
    role: "marquee",
    name: "Bande défilante",
    tagline: "Créer un rythme graphique entre deux sections.",
    description:
      "Bandeau horizontal personnalisable pour slogan, promesse ou information courte.",
    defaultVariant: "accent",
    previewKey: "marquee-strip",

    variants: [
      variant(
        "dark",
        "Sombre",
        "Fond sombre et texte contrasté.",
        "marquee-dark",
        { width: "full", align: "center", density: "compact" },
      ),
      variant(
        "light",
        "Clair",
        "Fond clair et composition légère.",
        "marquee-light",
        { width: "full", align: "center", density: "compact" },
      ),
      variant(
        "accent",
        "Accent",
        "Utilise la couleur principale de la marque.",
        "marquee-accent",
        { width: "full", align: "center", density: "compact" },
      ),
      variant(
        "outline",
        "Contour",
        "Trait et typographie sans fond plein.",
        "marquee-outline",
        { width: "full", align: "center", density: "compact" },
      ),
    ],

    defaultContent: {
      text: "Livraison offerte · Créations sélectionnées · Service humain",
      separator: "·",
      speed: 30,
      fontFamily: "",
      fontSize: 18,
      uppercase: true,
      direction: "left",
    },
  },

  /* ---------------------------------------------------------------------- */
  /* GALLERY                                                                */
  /* ---------------------------------------------------------------------- */

  {
    id: "gallery-mosaic",
    role: "gallery",
    name: "Galerie",
    tagline: "Créer un univers visuel autour de la marque.",
    description:
      "Galerie pouvant accueillir plusieurs ratios et plusieurs densités.",
    defaultVariant: "mosaic",
    previewKey: "gallery-mosaic",

    variants: [
      variant(
        "mosaic",
        "Mosaïque",
        "Composition libre avec plusieurs tailles d'images.",
        "gallery-mosaic",
        { width: "wide", align: "center", density: "airy" },
      ),
      variant(
        "uniform",
        "Uniforme",
        "Toutes les images utilisent le même ratio.",
        "gallery-uniform",
        { width: "wide", align: "center", density: "balanced" },
      ),
      variant(
        "masonry",
        "Masonry",
        "Colonnes de hauteurs variables.",
        "gallery-masonry",
        { width: "wide", align: "center", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "Notre univers",
      subtitle: "",
      images: [],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* STATS                                                                  */
  /* ---------------------------------------------------------------------- */

  {
    id: "stats-counter",
    role: "stats",
    name: "Chiffres clés",
    tagline: "Présenter quelques indicateurs mémorables.",
    description:
      "Bloc de chiffres destiné à donner de la preuve et du contexte.",
    defaultVariant: "centered",
    previewKey: "stats-counter",

    variants: [
      variant(
        "centered",
        "Centré",
        "Chiffres distribués régulièrement.",
        "stats-centered",
        { width: "wide", align: "center", density: "airy" },
      ),
      variant(
        "split",
        "Split",
        "Un chiffre principal et plusieurs chiffres secondaires.",
        "stats-split",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "minimal",
        "Minimal",
        "Petite bande de chiffres sans surcharge.",
        "stats-minimal",
        { width: "wide", align: "center", density: "compact" },
      ),
    ],

    defaultContent: {
      title: "Quelques chiffres",
      stats: [
        { value: "10K+", label: "Clients" },
        { value: "98%", label: "Avis positifs" },
        { value: "48h", label: "Délai moyen" },
        { value: "2 ans", label: "Garantie" },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* VIDEO                                                                  */
  /* ---------------------------------------------------------------------- */

  {
    id: "video-fullscreen",
    role: "video",
    name: "Vidéo immersive",
    tagline: "Une séquence vidéo intégrée à l'identité de la boutique.",
    description:
      "Vidéo plein écran, encadrée ou accompagnée de texte.",
    defaultVariant: "fullscreen",
    previewKey: "video-fullscreen",

    variants: [
      variant(
        "fullscreen",
        "Plein écran",
        "La vidéo occupe toute la largeur disponible.",
        "video-fullscreen",
        { width: "full", align: "center", density: "airy" },
      ),
      variant(
        "boxed",
        "Encadrée",
        "La vidéo est contenue dans une carte éditoriale.",
        "video-boxed",
        { width: "wide", align: "center", density: "balanced" },
      ),
      variant(
        "split",
        "Vidéo + texte",
        "Vidéo et contenu éditorial côte à côte.",
        "video-split",
        { width: "wide", align: "left", density: "balanced" },
      ),
    ],

    defaultContent: {
      videoUrl: "",
      poster: null,
      title: "Découvrez notre savoir-faire",
      subtitle: "Une image en mouvement pour raconter la maison.",
      ctaLabel: "Explorer",
      ctaUrl: "#",
      overlayOpacity: 0.4,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* BANNER                                                                 */
  /* ---------------------------------------------------------------------- */

  {
    id: "banner-promo",
    role: "banner",
    name: "Bandeau",
    tagline: "Information courte, annonce ou campagne.",
    description:
      "Bandeau horizontal utilisable pour une annonce ou une information importante.",
    defaultVariant: "solid",
    previewKey: "banner-promo",

    variants: [
      variant(
        "solid",
        "Uni",
        "Fond de couleur plein.",
        "banner-solid",
        { width: "full", align: "center", density: "compact" },
      ),
      variant(
        "gradient",
        "Dégradé",
        "Fond en dégradé issu de l'identité.",
        "banner-gradient",
        { width: "full", align: "center", density: "compact" },
      ),
      variant(
        "outline",
        "Contour",
        "Bandeau léger avec bordure.",
        "banner-outline",
        { width: "full", align: "center", density: "compact" },
      ),
    ],

    defaultContent: {
      text: "Découvrez les nouveautés de la maison.",
      ctaLabel: "",
      ctaUrl: "#",
      bgColor: "primary",
    },
  },

  /* ---------------------------------------------------------------------- */
  /* PRODUCTS                                                               */
  /* ---------------------------------------------------------------------- */

  {
    id: "products-grid",
    role: "products",
    name: "Grille produits",
    tagline: "Présenter le catalogue de la boutique.",
    description:
      "Grille de produits adaptée à la densité et au contexte de la page.",
    defaultVariant: "3-up",
    previewKey: "products-grid",

    variants: [
      variant(
        "3-up",
        "Éditorial 3",
        "Trois cartes avec image dominante et davantage d'espace.",
        "product-grid-3",
        { width: "wide", align: "left", density: "airy" },
      ),
      variant(
        "4-up",
        "Catalogue 4",
        "Quatre cartes pour une présentation plus dense.",
        "product-grid-4",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "compact",
        "Compact",
        "Plus de produits visibles simultanément.",
        "product-grid-compact",
        { width: "wide", align: "left", density: "dense" },
      ),
    ],

    defaultContent: {
      title: "Nos produits",
      subtitle: "Découvrez la collection.",
      layout: "3-up",
      cardShape: "rounded",
      cardStyle: "minimal",
      productIds: [],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* PRODUCT SPOTLIGHT                                                       */
  /* ---------------------------------------------------------------------- */

  {
    id: "product-spotlight",
    role: "products",
    name: "Produit phare",
    tagline: "Mettre une création au premier plan.",
    description:
      "Un produit sélectionné avec image dominante, description et CTA.",
    defaultVariant: "image-right",
    previewKey: "product-spotlight",

    variants: [
      variant(
        "image-left",
        "Image gauche",
        "Le visuel domine la partie gauche.",
        "product-spotlight-left",
        { width: "wide", align: "left", density: "airy" },
      ),
      variant(
        "image-right",
        "Image droite",
        "Le visuel domine la partie droite.",
        "product-spotlight-right",
        { width: "wide", align: "left", density: "airy" },
      ),
      variant(
        "centered",
        "Centré",
        "Produit et texte composés autour d'un axe central.",
        "product-spotlight-centered",
        { width: "normal", align: "center", density: "airy" },
      ),
    ],

    defaultContent: {
      productId: null,
      title: "Notre coup de cœur",
      subtitle: "Une création sélectionnée par la maison.",
      ctaLabel: "Voir le produit",
      ctaUrl: "#",
      backgroundImage: null,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* BLOG                                                                   */
  /* ---------------------------------------------------------------------- */

  {
    id: "blog-list",
    role: "blog",
    name: "Journal",
    tagline: "Articles et contenus éditoriaux.",
    description:
      "Présente les contenus de la marque avec plusieurs niveaux de hiérarchie.",
    defaultVariant: "grid",
    previewKey: "blog-list",

    variants: [
      variant(
        "grid",
        "Grille",
        "Articles présentés sous forme de cartes.",
        "blog-grid",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "list",
        "Liste",
        "Une lecture verticale plus éditoriale.",
        "blog-list",
        { width: "normal", align: "left", density: "airy" },
      ),
      variant(
        "featured",
        "Article principal",
        "Un article dominant suivi de contenus secondaires.",
        "blog-featured",
        { width: "wide", align: "left", density: "airy" },
      ),
    ],

    defaultContent: {
      title: "Le journal",
      subtitle: "",
      articles: [
        {
          title: "Notre engagement",
          excerpt: "Découvrez les coulisses de la maison.",
          image: null,
          url: "#",
        },
        {
          title: "Nos conseils",
          excerpt: "Quelques repères pour choisir.",
          image: null,
          url: "#",
        },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* CART                                                                   */
  /* ---------------------------------------------------------------------- */

  {
    id: "cart-summary",
    role: "cart",
    name: "Récapitulatif panier",
    tagline: "Résumé clair du panier.",
    description:
      "Bloc réservé aux contextes de panier et de commande.",
    defaultVariant: "full",
    previewKey: "cart-summary",

    variants: [
      variant(
        "full",
        "Complet",
        "Résumé détaillé du panier.",
        "cart-full",
        { width: "normal", align: "left", density: "balanced" },
      ),
      variant(
        "compact",
        "Compact",
        "Version plus légère pour les pages secondaires.",
        "cart-compact",
        { width: "normal", align: "left", density: "compact" },
      ),
    ],

    defaultContent: {
      title: "Votre panier",
      ctaLabel: "Passer commande",
      emptyText: "Votre panier est vide pour le moment.",
    },
  },

  /* ---------------------------------------------------------------------- */
  /* CONTACT                                                                */
  /* ---------------------------------------------------------------------- */

  {
    id: "contact-form",
    role: "contact",
    name: "Contact",
    tagline: "Permettre au visiteur de contacter la boutique.",
    description:
      "Formulaire de contact accompagné des coordonnées de la maison.",
    defaultVariant: "centered",
    previewKey: "contact-form",

    variants: [
      variant(
        "centered",
        "Centré",
        "Formulaire centré et focalisé.",
        "contact-centered",
        { width: "normal", align: "center", density: "airy" },
      ),
      variant(
        "split",
        "Deux colonnes",
        "Formulaire et informations côte à côte.",
        "contact-split",
        { width: "wide", align: "left", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "Contactez-nous",
      subtitle: "Une question ? Nous vous répondons rapidement.",
      ctaLabel: "Envoyer",
      contactEmail: "",
      contactPhone: "",
      contactAddress: "",
    },
  },

  /* ---------------------------------------------------------------------- */
  /* TEAM                                                                   */
  /* ---------------------------------------------------------------------- */

  {
    id: "team-grid",
    role: "team",
    name: "Équipe",
    tagline: "Présenter les personnes derrière la maison.",
    description:
      "Présentation de membres, artisans ou collaborateurs.",
    defaultVariant: "3-up",
    previewKey: "team-grid",

    variants: [
      variant(
        "3-up",
        "Trois colonnes",
        "Présentation équilibrée.",
        "team-grid-3",
        { width: "wide", align: "center", density: "airy" },
      ),
      variant(
        "4-up",
        "Quatre colonnes",
        "Présentation plus dense.",
        "team-grid-4",
        { width: "wide", align: "center", density: "balanced" },
      ),
      variant(
        "circle",
        "Portraits",
        "Portraits circulaires avec informations courtes.",
        "team-circle",
        { width: "wide", align: "center", density: "airy" },
      ),
    ],

    defaultContent: {
      title: "L'équipe",
      subtitle: "Les visages derrière la maison.",
      members: [
        {
          name: "Camille",
          role: "Fondatrice",
          photo: null,
          bio: "",
        },
        {
          name: "Hugo",
          role: "Direction artistique",
          photo: null,
          bio: "",
        },
        {
          name: "Léa",
          role: "Production",
          photo: null,
          bio: "",
        },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* PRICING                                                                */
  /* ---------------------------------------------------------------------- */

  {
    id: "pricing-table",
    role: "pricing",
    name: "Tarifs",
    tagline: "Présenter plusieurs offres ou formules.",
    description:
      "Cartes tarifaires avec une formule pouvant être mise en avant.",
    defaultVariant: "3-cols",
    previewKey: "pricing-table",

    variants: [
      variant(
        "2-cols",
        "Deux formules",
        "Deux offres avec davantage d'espace.",
        "pricing-2",
        { width: "wide", align: "center", density: "airy" },
      ),
      variant(
        "3-cols",
        "Trois formules",
        "Composition équilibrée.",
        "pricing-3",
        { width: "wide", align: "center", density: "balanced" },
      ),
      variant(
        "4-cols",
        "Quatre formules",
        "Comparaison plus dense.",
        "pricing-4",
        { width: "full", align: "center", density: "dense" },
      ),
    ],

    defaultContent: {
      title: "Nos formules",
      subtitle: "",
      plans: [
        {
          name: "Essentiel",
          price: "29€",
          period: "/mois",
          features: ["Accès catalogue", "Support email"],
          cta: "Choisir",
          featured: false,
        },
        {
          name: "Pro",
          price: "79€",
          period: "/mois",
          features: [
            "Fonctionnalités avancées",
            "Support prioritaire",
          ],
          cta: "Choisir",
          featured: true,
        },
        {
          name: "Premium",
          price: "199€",
          period: "/mois",
          features: [
            "Accompagnement",
            "Account manager",
          ],
          cta: "Contact",
          featured: false,
        },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* IMAGE + TEXT                                                           */
  /* ---------------------------------------------------------------------- */

  {
    id: "image-text-split",
    role: "split",
    name: "Image + texte",
    tagline: "Un bloc éditorial polyvalent.",
    description:
      "Image et contenu texte peuvent être inversés ou empilés sur mobile.",
    defaultVariant: "image-left",
    previewKey: "image-text-split",

    variants: [
      variant(
        "image-left",
        "Image gauche",
        "Image à gauche, contenu à droite.",
        "split-image-left",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "image-right",
        "Image droite",
        "Contenu à gauche, image à droite.",
        "split-image-right",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "image-top",
        "Image supérieure",
        "Image en haut et contenu en dessous.",
        "split-image-top",
        { width: "normal", align: "left", density: "balanced" },
      ),
    ],

    defaultContent: {
      eyebrow: "",
      title: "Notre histoire en image",
      subtitle:
        "Un aperçu de ce qui nous passionne au quotidien.",
      ctaLabel: "En savoir plus",
      ctaUrl: "#",
      image: null,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* TIMELINE                                                               */
  /* ---------------------------------------------------------------------- */

  {
    id: "timeline",
    role: "timeline",
    name: "Frise chronologique",
    tagline: "Faire parcourir l'histoire de la marque.",
    description:
      "Dates et étapes importantes dans une narration structurée.",
    defaultVariant: "vertical",
    previewKey: "timeline",

    variants: [
      variant(
        "vertical",
        "Verticale",
        "Lecture naturelle du haut vers le bas.",
        "timeline-vertical",
        { width: "normal", align: "left", density: "airy" },
      ),
      variant(
        "horizontal",
        "Horizontale",
        "Étapes distribuées sur une ligne.",
        "timeline-horizontal",
        { width: "wide", align: "center", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "Notre parcours",
      events: [
        {
          year: "2022",
          title: "La première idée",
          body: "Tout commence dans un petit atelier.",
        },
        {
          year: "2023",
          title: "Premier produit",
          body: "Lancement de la collection signature.",
        },
        {
          year: "2024",
          title: "Une communauté",
          body: "La maison commence à grandir.",
        },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* MAP                                                                    */
  /* ---------------------------------------------------------------------- */

  {
    id: "map-location",
    role: "map",
    name: "Adresse + carte",
    tagline: "Donner une présence physique à la boutique.",
    description:
      "Carte et informations pratiques.",
    defaultVariant: "split",
    previewKey: "map-location",

    variants: [
      variant(
        "split",
        "Carte + informations",
        "Carte et coordonnées côte à côte.",
        "map-split",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "centered",
        "Centré",
        "Carte et informations empilées.",
        "map-centered",
        { width: "normal", align: "center", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "Nous trouver",
      address: "12 rue de l'Atelier, 75001 Paris",
      mapEmbedUrl: "",
      hours: "Du lundi au samedi · 10h–19h",
    },
  },

  /* ---------------------------------------------------------------------- */
  /* PRODUCT HERO                                                           */
  /* ---------------------------------------------------------------------- */

  {
    id: "product-hero",
    role: "product",
    name: "Produit — Hero",
    tagline: "Le bloc principal d'une fiche produit.",
    description:
      "Grande image ou galerie, informations produit et action principale.",
    defaultVariant: "image-left",
    previewKey: "product-hero",

    variants: [
      variant(
        "image-left",
        "Image gauche",
        "Galerie à gauche, informations à droite.",
        "product-hero-left",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "image-right",
        "Image droite",
        "Informations à gauche, galerie à droite.",
        "product-hero-right",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "split-tall",
        "Galerie haute",
        "Grande galerie verticale avec informations persistantes.",
        "product-hero-tall",
        { width: "wide", align: "left", density: "airy" },
      ),
    ],

    defaultContent: {
      ctaLabel: "Ajouter au panier",
      showSku: true,
      showCategory: true,
      showAvailability: true,
    },
  },

  /* ---------------------------------------------------------------------- */
  /* PRODUCT DESCRIPTION                                                    */
  /* ---------------------------------------------------------------------- */

  {
    id: "product-description",
    role: "product",
    name: "Produit — Description",
    tagline: "Raconter le produit au-delà de la fiche technique.",
    description:
      "Section éditoriale dédiée à l'histoire et à l'usage du produit.",
    defaultVariant: "centered",
    previewKey: "product-description",

    variants: [
      variant(
        "centered",
        "Centrée",
        "Texte centré avec une largeur de lecture confortable.",
        "product-description-centered",
        { width: "normal", align: "center", density: "airy" },
      ),
      variant(
        "two-column",
        "Deux colonnes",
        "Texte réparti en deux colonnes sur grand écran.",
        "product-description-columns",
        { width: "wide", align: "left", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "À propos de ce produit",
      fallbackBody:
        "Décrivez ici l'histoire, la fabrication et les bénéfices de ce produit.",
    },
  },

  /* ---------------------------------------------------------------------- */
  /* PRODUCT SPECS                                                          */
  /* ---------------------------------------------------------------------- */

  {
    id: "product-specs",
    role: "product",
    name: "Produit — Caractéristiques",
    tagline: "Présenter clairement les informations techniques.",
    description:
      "Spécifications techniques sous forme de tableau ou de liste.",
    defaultVariant: "table",
    previewKey: "product-specs",

    variants: [
      variant(
        "table",
        "Tableau",
        "Présentation structurée en lignes.",
        "product-specs-table",
        { width: "normal", align: "left", density: "compact" },
      ),
      variant(
        "list",
        "Liste",
        "Présentation plus éditoriale et lisible sur mobile.",
        "product-specs-list",
        { width: "normal", align: "left", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "Caractéristiques",
      rows: [
        {
          label: "Matière",
          value: "À préciser",
        },
        {
          label: "Garantie",
          value: "À préciser",
        },
        {
          label: "Livraison",
          value: "À préciser",
        },
      ],
    },
  },

  /* ---------------------------------------------------------------------- */
  /* PRODUCT RELATED                                                        */
  /* ---------------------------------------------------------------------- */

  {
    id: "product-related",
    role: "product",
    name: "Produit — Recommandés",
    tagline: "Continuer la découverte dans la boutique.",
    description:
      "Produits complémentaires ou recommandations de la même boutique.",
    defaultVariant: "4-up",
    previewKey: "product-related",

    variants: [
      variant(
        "3-up",
        "Trois produits",
        "Trois recommandations aérées.",
        "product-related-3",
        { width: "wide", align: "left", density: "airy" },
      ),
      variant(
        "4-up",
        "Quatre produits",
        "Quatre recommandations compactes.",
        "product-related-4",
        { width: "wide", align: "left", density: "balanced" },
      ),
      variant(
        "carousel",
        "Carousel",
        "Défilement horizontal, particulièrement adapté au mobile.",
        "product-related-carousel",
        { width: "wide", align: "left", density: "balanced" },
      ),
    ],

    defaultContent: {
      title: "Vous aimerez aussi",
      limit: 4,
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Persisted scene record                                                     */
/* -------------------------------------------------------------------------- */

export interface SceneRecord {
  id: string;
  boutique_id: string;
  role: SceneRole;
  scene_type: string;
  variant: string;
  content: Record<string, unknown>;
  position: number;
  is_visible: boolean;

  /**
   * null = homepage.
   */
  page_id?: string | null;

  /**
   * Surcharges locales.
   * null = héritage complet du Brand DNA.
   */
  style_overrides?: {
    palette?: {
      primary?: string;
      accent?: string;
      surface?: string;
      ink?: string;
    };

    fonts?: {
      display?: string;
      body?: string;
    };

    sizes?: {
      h1?: number;
      body?: number;
    };

    layout?: {
      padding?:
        | "compact"
        | "normal"
        | "spacious";

      maxWidth?:
        | "narrow"
        | "normal"
        | "wide"
        | "full";

      align?:
        | "left"
        | "center"
        | "right";

      frame?:
        | "none"
        | "rounded"
        | "rounded-xl"
        | "sharp"
        | "blob"
        | "inset"
        | "ticket"
        | "tilt";

      preset?:
        | "none"
        | "flat"
        | "soft"
        | "elevated"
        | "outline"
        | "glass"
        | "spotlight"
        | "polaroid"
        | "neo";

      radii?: {
        tl?: number;
        tr?: number;
        br?: number;
        bl?: number;
      };

      borderWidth?: number;
      borderColor?: string;

      shadow?:
        | 0
        | 1
        | 2
        | 3
        | 4
        | 5;
    };

    background?: {
      color?: string | null;
      imageUrl?: string | null;
      videoUrl?: string | null;
      overlayOpacity?: number;
    };

    button?: {
      shape?:
        | "pill"
        | "rounded"
        | "square";

      variant?:
        | "solid"
        | "outline"
        | "ghost";

      floating?: boolean;

      size?:
        | "sm"
        | "md"
        | "lg";
    };

    animation?: {
      entry?:
        | "none"
        | "fade"
        | "fade-up"
        | "slide-left"
        | "slide-right"
        | "zoom"
        | "blur";

      duration?:
        | "fast"
        | "normal"
        | "slow";

      delay?: number;
    };
  } | null;
}

/* -------------------------------------------------------------------------- */
/* Lookup helpers                                                             */
/* -------------------------------------------------------------------------- */

export function findSceneDefinition(
  sceneType: string,
): SceneDefinition | undefined {
  return STUDIO_SCENES.find(
    (scene) => scene.id === sceneType,
  );
}

export function findSceneVariant(
  sceneType: string,
  variantId: string,
): SceneVariantDefinition | undefined {
  const scene = findSceneDefinition(sceneType);

  return scene?.variants.find(
    (variant) => variant.id === variantId,
  );
}

/**
 * Retourne une variante valide.
 *
 * Permet de rester compatible avec d'anciennes données
 * si une scène possède une variante inconnue.
 */
export function resolveSceneVariant(
  sceneType: string,
  variantId?: string | null,
): SceneVariantDefinition | undefined {
  const scene = findSceneDefinition(sceneType);

  if (!scene) {
    return undefined;
  }

  if (variantId) {
    const exact = scene.variants.find(
      (variant) => variant.id === variantId,
    );

    if (exact) {
      return exact;
    }
  }

  return scene.variants.find(
    (variant) => variant.id === scene.defaultVariant,
  ) ?? scene.variants[0];
}

/**
 * Normalise une scène existante.
 *
 * Le renderer peut utiliser cette fonction pour éviter qu'une donnée
 * historique invalide casse complètement la boutique.
 */
export function normalizeSceneRecord(
  scene: SceneRecord,
): SceneRecord {
  const definition = findSceneDefinition(
    scene.scene_type,
  );

  if (!definition) {
    return scene;
  }

  const resolved =
    resolveSceneVariant(
      scene.scene_type,
      scene.variant,
    );

  return {
    ...scene,
    role: definition.role,
    variant:
      resolved?.id ??
      definition.defaultVariant,
  };
}

/**
 * Renvoie les variantes utilisables par l'éditeur.
 */
export function getSceneVariants(
  sceneType: string,
): SceneVariantDefinition[] {
  return (
    findSceneDefinition(sceneType)?.variants ?? []
  );
}

/**
 * Vérifie qu'une variante est réellement déclarée
 * pour une scène donnée.
 */
export function isValidSceneVariant(
  sceneType: string,
  variantId: string,
): boolean {
  return !!findSceneVariant(
    sceneType,
    variantId,
  );
}

/* -------------------------------------------------------------------------- */
/* Studio bundles                                                             */
/* -------------------------------------------------------------------------- */

export interface StudioBundleScene {
  id: string;
  variant?: string;
}

export interface StudioBundle {
  key: string;
  name: string;
  description: string;
  scenes: StudioBundleScene[];
}

export const STUDIO_BUNDLES: StudioBundle[] = [
  {
    key: "narrative",
    name: "Narratif éditorial",
    description:
      "Une boutique construite autour de l'histoire, de l'identité et de la confiance.",
    scenes: [
      {
        id: "hero-cinema",
        variant: "fullscreen",
      },
      {
        id: "story-scrolly",
        variant: "alternating",
      },
      {
        id: "showcase-magazine",
        variant: "3-up",
      },
      {
        id: "founder-letter",
        variant: "letter",
      },
      {
        id: "trust-wall",
        variant: "reviews-first",
      },
      {
        id: "cta-sticky",
        variant: "centered",
      },
    ],
  },

  {
    key: "product-first",
    name: "Produit-first",
    description:
      "Une structure donnant rapidement accès aux produits et à la preuve.",
    scenes: [
      {
        id: "hero-cinema",
        variant: "split",
      },
      {
        id: "showcase-magazine",
        variant: "4-up",
      },
      {
        id: "lookbook-parallax",
        variant: "asymmetric",
      },
      {
        id: "trust-wall",
        variant: "badges-row",
      },
      {
        id: "faq-accordion",
        variant: "accordion",
      },
      {
        id: "cta-sticky",
        variant: "split-newsletter",
      },
    ],
  },

  {
    key: "minimal",
    name: "Minimal manifeste",
    description:
      "Une structure réduite qui laisse la typographie et les produits respirer.",
    scenes: [
      {
        id: "hero-cinema",
        variant: "type-only",
      },
      {
        id: "manifesto-typographic",
        variant: "stacked",
      },
      {
        id: "showcase-magazine",
        variant: "3-up",
      },
      {
        id: "newsletter-editorial",
        variant: "centered",
      },
      {
        id: "cta-sticky",
        variant: "centered",
      },
    ],
  },

  {
    key: "magazine",
    name: "Magazine éditorial",
    description:
      "Une structure plus riche en rythme visuel et en contenu éditorial.",
    scenes: [
      {
        id: "hero-cinema",
        variant: "split",
      },
      {
        id: "marquee-strip",
        variant: "accent",
      },
      {
        id: "lookbook-parallax",
        variant: "zigzag",
      },
      {
        id: "press-strip",
        variant: "scrolling",
      },
      {
        id: "showcase-magazine",
        variant: "carousel",
      },
      {
        id: "stats-counter",
        variant: "split",
      },
      {
        id: "newsletter-editorial",
        variant: "split-image",
      },
    ],
  },

  {
    key: "showroom",
    name: "Showroom signature",
    description:
      "Une présentation visuelle forte pour les marques très orientées produit.",
    scenes: [
      {
        id: "hero-cinema",
        variant: "fullscreen",
      },
      {
        id: "product-spotlight",
        variant: "image-right",
      },
      {
        id: "gallery-mosaic",
        variant: "mosaic",
      },
      {
        id: "image-text-split",
        variant: "image-left",
      },
      {
        id: "trust-wall",
        variant: "press-first",
      },
      {
        id: "cta-sticky",
        variant: "sticky-only",
      },
    ],
  },

  {
    key: "community",
    name: "Communauté & valeurs",
    description:
      "Une structure centrée sur les personnes, l'histoire et les valeurs.",
    scenes: [
      {
        id: "hero-cinema",
        variant: "type-only",
      },
      {
        id: "manifesto-typographic",
        variant: "xl",
      },
      {
        id: "founder-letter",
        variant: "portrait-left",
      },
      {
        id: "timeline",
        variant: "vertical",
      },
      {
        id: "showcase-magazine",
        variant: "3-up",
      },
      {
        id: "newsletter-editorial",
        variant: "minimal",
      },
      {
        id: "cta-sticky",
        variant: "centered",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Deterministic selection                                                    */
/* -------------------------------------------------------------------------- */

function hashSeed(seed: string): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash =
      (hash * 31 +
        seed.charCodeAt(index)) >>>
      0;
  }

  return hash;
}

export function pickStudioBundle(
  seed?: string,
): StudioBundle {
  if (!seed) {
    return STUDIO_BUNDLES[
      Math.floor(
        Math.random() *
          STUDIO_BUNDLES.length,
      )
    ];
  }

  return STUDIO_BUNDLES[
    hashSeed(seed) %
      STUDIO_BUNDLES.length
  ];
}

/* -------------------------------------------------------------------------- */
/* Default scene generation                                                   */
/* -------------------------------------------------------------------------- */

export function defaultStudioBundle(
  seed?: string,
): Array<
  Pick<
    SceneRecord,
    | "role"
    | "scene_type"
    | "variant"
    | "content"
    | "position"
    | "is_visible"
  >
> {
  const bundle = pickStudioBundle(seed);

  const seedValue =
    seed ??
    Math.random()
      .toString(36)
      .slice(2);

  let state =
    hashSeed(seedValue);

  const random = () => {
    state |= 0;

    state =
      (state + 0x6d2b79f5) |
      0;

    let value = Math.imul(
      state ^ (state >>> 15),
      1 | state,
    );

    value =
      (value +
        Math.imul(
          value ^ (value >>> 7),
          61 | value,
        )) ^
      value;

    return (
      (value ^ (value >>> 14)) >>>
      0
    ) / 4294967296;
  };

  const scenes = bundle.scenes.map(
    (bundleScene) => {
      const definition =
        findSceneDefinition(
          bundleScene.id,
        );

      if (!definition) {
        return null;
      }

      /**
       * 35 % de variation déterministe.
       *
       * L'objectif est d'éviter que toutes les boutiques générées
       * aient exactement la même composition tout en gardant
       * le bundle reconnaissable.
       */
      const shouldVary =
        random() < 0.35;

      const variant =
        shouldVary
          ? definition.variants[
              Math.floor(
                random() *
                  definition.variants.length,
              )
            ]?.id ??
            definition.defaultVariant
          : bundleScene.variant ??
            definition.defaultVariant;

      return {
        definition,
        variant,
      };
    },
  );

  const validScenes =
    scenes.filter(
      (
        scene,
      ): scene is {
        definition: SceneDefinition;
        variant: string;
      } => !!scene,
    );

  /**
   * Le hero reste toujours premier.
   *
   * La dernière scène reste idéalement une conversion.
   * Les scènes intermédiaires peuvent varier.
   */
  if (validScenes.length > 3) {
    const first = validScenes[0];
    const last =
      validScenes[
        validScenes.length - 1
      ];

    const middle =
      validScenes.slice(
        1,
        -1,
      );

    for (
      let index =
        middle.length - 1;
      index > 0;
      index -= 1
    ) {
      const target =
        Math.floor(
          random() *
            (index + 1),
        );

      [
        middle[index],
        middle[target],
      ] = [
        middle[target],
        middle[index],
      ];
    }

    validScenes.splice(
      0,
      validScenes.length,
      first,
      ...middle,
      last,
    );
  }

  return validScenes.map(
    (
      scene,
      position,
    ) => ({
      role:
        scene.definition.role,

      scene_type:
        scene.definition.id,

      variant:
        scene.variant,

      /**
       * On clone le contenu par scène.
       *
       * Cela évite qu'une mutation locale d'un objet
       * partagé entre deux scènes modifie accidentellement
       * le contenu d'une autre scène.
       */
      content:
        structuredClone(
          scene.definition
            .defaultContent,
        ),

      position,

      is_visible: true,
    }),
  );
}
