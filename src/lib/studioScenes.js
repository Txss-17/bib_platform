const STUDIO_SCENES = [
  {
    id: "hero-cinema",
    role: "hero",
    name: "Hero Cin\xE9ma",
    tagline: "Plein \xE9cran immersif avec vid\xE9o ou visuel signature",
    description: "Une ouverture cin\xE9matographique : visuel ou vid\xE9o plein \xE9cran, titre \xE9ditorial, sous-titre \xE9tir\xE9, CTA discret. Parfait pour les marques narratives.",
    variants: ["fullscreen", "split", "type-only"],
    previewKey: "hero-cinema",
    defaultContent: {
      title: "Une nouvelle fa\xE7on de porter l'\xE9l\xE9gance",
      subtitle: "Pi\xE8ces con\xE7ues pour durer, racont\xE9es avec exigence.",
      ctaLabel: "D\xE9couvrir la collection",
      backgroundImage: null,
      videoUrl: null,
      overlayOpacity: 0.45,
      fullPageBackground: false,
      textAlign: "center"
    }
  },
  {
    id: "story-scrolly",
    role: "story",
    name: "Story Scrollytelling",
    tagline: "Narration verticale chapitre par chapitre",
    description: "Trois \xE0 cinq chapitres qui se r\xE9v\xE8lent au scroll, alternant texte et visuel. Id\xE9al pour raconter l'origine, le savoir-faire, la mission.",
    variants: ["alternating", "centered", "side-pinned"],
    previewKey: "story-scrolly",
    defaultContent: {
      chapters: [
        {
          eyebrow: "Origine",
          title: "Tout commence par une obsession",
          body: "Sourcer la mati\xE8re la plus juste, sans compromis.",
          image: null
        },
        {
          eyebrow: "Savoir-faire",
          title: "Fa\xE7onn\xE9 \xE0 la main, pens\xE9 pour durer",
          body: "Chaque pi\xE8ce passe par 14 \xE9tapes de contr\xF4le.",
          image: null
        },
        {
          eyebrow: "Promesse",
          title: "Une garantie qui parle pour nous",
          body: "R\xE9paration \xE0 vie, sur simple demande.",
          image: null
        }
      ]
    }
  },
  {
    id: "lookbook-parallax",
    role: "lookbook",
    name: "Lookbook Parallaxe",
    tagline: "Galerie \xE9ditoriale haute couture",
    description: "Grille asym\xE9trique avec parallaxe et l\xE9gendes flottantes. Met en avant 4 \xE0 6 visuels ic\xF4niques de la saison.",
    variants: ["asymmetric", "tiled", "zigzag"],
    previewKey: "lookbook-parallax",
    defaultContent: {
      title: "La nouvelle saison",
      subtitle: "Six pi\xE8ces, six histoires.",
      images: []
    }
  },
  {
    id: "showcase-magazine",
    role: "showcase",
    name: "Vitrine Magazine",
    tagline: "Produits mis en sc\xE8ne comme une \xE9ditoriale presse",
    description: "Trois \xE0 six produits pr\xE9sent\xE9s en vignettes 'magazine' \u2014 visuel large, eyebrow, prix discret, CTA inline.",
    variants: ["3-up", "4-up", "carousel"],
    previewKey: "showcase-magazine",
    defaultContent: {
      title: "S\xE9lection signature",
      subtitle: "Les indispensables \xE0 porter d\xE8s maintenant.",
      productIds: [],
      layout: "3-up",
      cardShape: "rounded",
      cardStyle: "minimal"
    }
  },
  {
    id: "trust-wall",
    role: "trust",
    name: "Mur de Confiance",
    tagline: "Avis, presse et garanties \xE0 fort impact",
    description: "Composition m\xEAlant logos presse, citations clients, badges qualit\xE9. Optimise la conversion \xE0 l'\xE9tape consideration.",
    variants: ["press-first", "reviews-first", "badges-row"],
    previewKey: "trust-wall",
    defaultContent: {
      title: "Ils nous font confiance",
      pressLogos: [],
      reviews: [
        { author: "Camille L.", quote: "La meilleure pi\xE8ce de mon dressing.", rating: 5 },
        { author: "Hugo R.", quote: "Service irr\xE9prochable, finition sublime.", rating: 5 }
      ],
      badges: ["Verified by Linksy", "Garantie 2 ans", "Livraison neutre carbone"]
    }
  },
  {
    id: "cta-sticky",
    role: "cta",
    name: "Conversion CTA",
    tagline: "Appel \xE0 l'action final + barre fixe sur mobile",
    description: "Bloc final hauteur r\xE9duite + barre sticky bas-\xE9cran sur mobile. Id\xE9al pour pousser l'achat ou l'abonnement newsletter.",
    variants: ["centered", "split-newsletter", "sticky-only"],
    previewKey: "cta-sticky",
    defaultContent: {
      title: "Pr\xEAt \xE0 passer \xE0 l'action ?",
      subtitle: "Rejoignez les 10 000 clients qui nous font d\xE9j\xE0 confiance.",
      ctaLabel: "Commander maintenant",
      ctaSecondaryLabel: "Recevoir la newsletter",
      stickyEnabled: true
    }
  },
  {
    id: "faq-accordion",
    role: "faq",
    name: "FAQ \xC9ditoriale",
    tagline: "Questions/r\xE9ponses d\xE9pliables, pens\xE9es SEO",
    description: "Accord\xE9on \xE9l\xE9gant qui r\xE9pond aux objections d'achat. Le JSON-LD FAQPage est g\xE9n\xE9r\xE9 automatiquement \xE0 partir du contenu.",
    variants: ["accordion", "two-column", "list"],
    previewKey: "faq-accordion",
    defaultContent: {
      title: "Vos questions, nos r\xE9ponses",
      items: [
        { q: "Quels sont vos d\xE9lais de livraison ?", a: "48 \xE0 72h en France m\xE9tropolitaine, 5 \xE0 7 jours en Europe." },
        { q: "Quelle est votre politique de retour ?", a: "Retours gratuits sous 30 jours, sans condition." },
        { q: "Vos produits sont-ils garantis ?", a: "Oui, garantie 2 ans incluse sur toute la collection." }
      ]
    }
  },
  {
    id: "newsletter-editorial",
    role: "newsletter",
    name: "Newsletter \xC9ditoriale",
    tagline: "Capture d'email premium au ton magazine",
    description: "Bloc newsletter avec promesse \xE9ditoriale forte, champ email \xE9pur\xE9 et b\xE9n\xE9fices list\xE9s. Con\xE7u pour la conversion.",
    variants: ["centered", "split-image", "minimal"],
    previewKey: "newsletter-editorial",
    defaultContent: {
      eyebrow: "Le journal",
      title: "Recevez nos exclusivit\xE9s avant tout le monde",
      subtitle: "Une lettre \xE9ditoriale par mois. Pas de spam, jamais.",
      placeholder: "Votre email",
      ctaLabel: "S'abonner",
      benefits: ["-10% sur la premi\xE8re commande", "Acc\xE8s anticip\xE9 aux drops", "Histoires de la maison"]
    }
  },
  {
    id: "press-strip",
    role: "press",
    name: "Bandeau Presse",
    tagline: "Logos m\xE9dias en bande d\xE9filante",
    description: "Bande horizontale pr\xE9sentant les logos presse en monochrome. Anime au scroll pour un rendu vivant.",
    variants: ["scrolling", "static-grid", "centered"],
    previewKey: "press-strip",
    defaultContent: {
      eyebrow: "Vu dans",
      logos: [
        { name: "Vogue", url: null },
        { name: "ELLE", url: null },
        { name: "Le Monde", url: null },
        { name: "Forbes", url: null },
        { name: "Madame Figaro", url: null }
      ]
    }
  },
  {
    id: "comparison-table",
    role: "comparison",
    name: "Tableau Comparatif",
    tagline: "Pourquoi nous choisir vs. la concurrence",
    description: "Comparaison ligne par ligne pour lever les objections. Tr\xE8s efficace en bas de page produit.",
    variants: ["check-cross", "stars", "minimal"],
    previewKey: "comparison-table",
    defaultContent: {
      title: "Pourquoi nous choisir",
      brand_name: "Notre maison",
      competitor_name: "La concurrence",
      rows: [
        { label: "Mati\xE8res premium", us: true, them: false },
        { label: "Garantie 2 ans", us: true, them: false },
        { label: "Livraison neutre carbone", us: true, them: false },
        { label: "Service client humain", us: true, them: false }
      ]
    }
  },
  {
    id: "founder-letter",
    role: "founder",
    name: "Lettre du Fondateur",
    tagline: "Adresse personnelle sign\xE9e \xE0 la main",
    description: "Format lettre intime \u2014 texte centr\xE9, signature manuscrite, photo ronde. Cr\xE9e un attachement \xE9motionnel fort.",
    variants: ["letter", "portrait-left", "portrait-right"],
    previewKey: "founder-letter",
    defaultContent: {
      eyebrow: "Notre histoire",
      title: "Un mot du fondateur",
      body: "Quand j'ai imagin\xE9 cette maison, j'avais en t\xEAte une seule id\xE9e : faire mieux, sans compromis. Chaque pi\xE8ce qui sort de notre atelier porte cette obsession.",
      signature: "Antoine, fondateur",
      portraitUrl: null
    }
  },
  {
    id: "manifesto-typographic",
    role: "manifesto",
    name: "Manifeste Typographique",
    tagline: "Statement plein \xE9cran, ton manifeste",
    description: "Typographie monumentale qui affirme la mission. Aucune image, juste la force du verbe.",
    variants: ["xl", "stacked", "marquee"],
    previewKey: "manifesto-typographic",
    defaultContent: {
      lines: ["Faire moins.", "Faire mieux.", "Faire pour durer."],
      footnote: "Notre manifeste, depuis le premier jour."
    }
  },
  {
    id: "marquee-strip",
    role: "marquee",
    name: "Bande d\xE9filante",
    tagline: "Texte qui d\xE9file en boucle, personnalisable",
    description: "Bandeau horizontal anim\xE9 : \xE9cris ce que tu veux (slogan, promo, valeurs) avec ta police, ta couleur et ta vitesse.",
    variants: ["dark", "light", "accent", "outline"],
    previewKey: "marquee-strip",
    defaultContent: {
      text: "Livraison offerte d\xE8s 50\u20AC \xB7 Retours gratuits \xB7 Garantie 2 ans",
      separator: "\xB7",
      speed: 30,
      fontFamily: "",
      fontSize: 18,
      uppercase: true,
      direction: "left"
    }
  },
  {
    id: "gallery-mosaic",
    role: "gallery",
    name: "Galerie Mosa\xEFque",
    tagline: "Grille libre de visuels (jusqu'\xE0 12)",
    description: "Grille mosa\xEFque \xE9ditoriale : ajoute jusqu'\xE0 12 visuels, ratios mixtes, hover zoom.",
    variants: ["mosaic", "uniform", "masonry"],
    previewKey: "gallery-mosaic",
    defaultContent: {
      title: "Notre univers",
      subtitle: "",
      images: []
    }
  },
  {
    id: "stats-counter",
    role: "stats",
    name: "Chiffres cl\xE9s",
    tagline: "3-4 chiffres cl\xE9s mis en avant",
    description: "Bloc de chiffres cl\xE9s avec valeurs grand format, id\xE9al pour pr\xE9senter des indicateurs et renforcer la confiance.",
    variants: [
      "centered",
      "split",
      "minimal"
    ],
    previewKey: "stats-counter",
    defaultContent: {
      title: "Quelques chiffres",
      stats: [
        {
          value: "10K+",
          label: "Clients satisfaits"
        },
        {
          value: "98%",
          label: "Avis 5 \xE9toiles"
        },
        {
          value: "48h",
          label: "Livraison moyenne"
        },
        {
          value: "2 ans",
          label: "Garantie"
        }
      ]
    }
  },
  {
    id: "video-fullscreen",
    role: "video",
    name: "Vid\xE9o immersive",
    tagline: "Vid\xE9o plein \xE9cran avec overlay et CTA",
    description: "Section vid\xE9o plein \xE9cran (autoplay muet) avec titre, sous-titre et appel \xE0 l'action.",
    variants: ["fullscreen", "boxed", "split"],
    previewKey: "video-fullscreen",
    defaultContent: {
      videoUrl: "",
      poster: null,
      title: "D\xE9couvrez notre savoir-faire",
      subtitle: "Une vid\xE9o vaut mille mots.",
      ctaLabel: "Explorer",
      overlayOpacity: 0.4
    }
  },
  {
    id: "banner-promo",
    role: "banner",
    name: "Bandeau promo",
    tagline: "Bande haute pour annonces, codes promo",
    description: "Petit bandeau sup\xE9rieur (annonce, code promo, livraison gratuite). Couleur et texte au choix.",
    variants: ["solid", "gradient", "outline"],
    previewKey: "banner-promo",
    defaultContent: {
      text: "\u{1F381} -10% sur la premi\xE8re commande avec le code BIENVENUE",
      ctaLabel: "Profiter",
      ctaUrl: "#shop",
      bgColor: "primary"
    }
  },
  {
    id: "products-grid",
    role: "products",
    name: "Grille produits",
    tagline: "Tous tes produits affich\xE9s en grille",
    description: "Affiche tous les produits actifs de la boutique en grille (filtrable par cat\xE9gorie).",
    variants: ["3-up", "4-up", "compact"],
    previewKey: "products-grid",
    defaultContent: {
      title: "Nos produits",
      subtitle: "L'int\xE9gralit\xE9 de la collection.",
      layout: "3-up",
      cardShape: "rounded"
    }
  },
  {
    id: "product-spotlight",
    role: "products",
    name: "Produit phare",
    tagline: "Met un produit \xE0 l'honneur",
    description: "Met en sc\xE8ne un produit unique avec image grand format, descriptif et CTA achat.",
    variants: ["image-left", "image-right", "centered"],
    previewKey: "product-spotlight",
    defaultContent: {
      productId: null,
      title: "Notre coup de c\u0153ur",
      subtitle: "Pourquoi vous allez l'adorer.",
      ctaLabel: "Voir le produit",
      backgroundImage: null
    }
  },
  {
    id: "blog-list",
    role: "blog",
    name: "Articles de blog",
    tagline: "Liste \xE9ditoriale d'articles",
    description: "Cartes d'articles (titre + image + extrait + lien).",
    variants: ["grid", "list", "featured"],
    previewKey: "blog-list",
    defaultContent: {
      title: "Le journal",
      subtitle: "",
      articles: [
        { title: "Notre engagement \xE9co-responsable", excerpt: "D\xE9couvrez nos coulisses\u2026", image: null, url: "#" },
        { title: "Comment choisir sa pi\xE8ce signature", excerpt: "Guide en 3 \xE9tapes.", image: null, url: "#" }
      ]
    }
  },
  {
    id: "cart-summary",
    role: "cart",
    name: "R\xE9cap panier",
    tagline: "Bloc panier stylis\xE9",
    description: "Affiche le panier de l'utilisateur (utile pour une page panier d\xE9di\xE9e).",
    variants: ["full", "compact"],
    previewKey: "cart-summary",
    defaultContent: {
      title: "Votre panier",
      ctaLabel: "Passer commande",
      emptyText: "Votre panier est vide pour le moment."
    }
  },
  {
    id: "contact-form",
    role: "contact",
    name: "Formulaire de contact",
    tagline: "Nom, email et message",
    description: "Formulaire de contact g\xE9n\xE9rique (envoy\xE9 en ticket support).",
    variants: ["centered", "split"],
    previewKey: "contact-form",
    defaultContent: {
      title: "Contactez-nous",
      subtitle: "Une question ? Notre \xE9quipe vous r\xE9pond sous 24h.",
      ctaLabel: "Envoyer",
      contactEmail: "",
      contactPhone: "",
      contactAddress: ""
    }
  },
  {
    id: "team-grid",
    role: "team",
    name: "L'\xE9quipe",
    tagline: "Cartes membres avec photo et r\xF4le",
    description: "Pr\xE9sente les membres de l'\xE9quipe ou les artisans.",
    variants: ["3-up", "4-up", "circle"],
    previewKey: "team-grid",
    defaultContent: {
      title: "L'\xE9quipe",
      subtitle: "Les visages derri\xE8re la maison.",
      members: [
        { name: "Camille", role: "Fondatrice", photo: null, bio: "" },
        { name: "Hugo", role: "Direction artistique", photo: null, bio: "" },
        { name: "L\xE9a", role: "Production", photo: null, bio: "" }
      ]
    }
  },
  {
    id: "pricing-table",
    role: "pricing",
    name: "Tarifs / formules",
    tagline: "Cartes de tarification",
    description: "Pr\xE9sente 2 \xE0 4 formules tarifaires avec mise en avant possible.",
    variants: ["2-cols", "3-cols", "4-cols"],
    previewKey: "pricing-table",
    defaultContent: {
      title: "Nos formules",
      subtitle: "",
      plans: [
        { name: "Starter", price: "29\u20AC", period: "/mois", features: ["1 boutique", "Support email"], cta: "Choisir", featured: false },
        { name: "Pro", price: "79\u20AC", period: "/mois", features: ["5 boutiques", "Support prioritaire", "Analytics avanc\xE9"], cta: "Choisir", featured: true },
        { name: "Scale", price: "199\u20AC", period: "/mois", features: ["Illimit\xE9", "Account manager"], cta: "Contact", featured: false }
      ]
    }
  },
  {
    id: "image-text-split",
    role: "split",
    name: "Image + Texte 50/50",
    tagline: "Bloc moiti\xE9 image, moiti\xE9 texte",
    description: "Section divis\xE9e : image d'un c\xF4t\xE9, texte + CTA de l'autre. Inversable.",
    variants: ["image-left", "image-right", "image-top"],
    previewKey: "image-text-split",
    defaultContent: {
      title: "Notre histoire en image",
      subtitle: "Un petit aper\xE7u de ce qui nous passionne au quotidien.",
      ctaLabel: "En savoir plus",
      ctaUrl: "#",
      image: null
    }
  },
  {
    id: "timeline",
    role: "timeline",
    name: "Frise chronologique",
    tagline: "\xC9tapes / dates cl\xE9s",
    description: "Frise verticale avec dates et descriptifs (id\xE9al page \xC0 propos).",
    variants: ["vertical", "horizontal"],
    previewKey: "timeline",
    defaultContent: {
      title: "Notre parcours",
      events: [
        { year: "2022", title: "La premi\xE8re id\xE9e", body: "Tout commence dans un petit atelier." },
        { year: "2023", title: "Premier produit", body: "Lancement de la collection signature." },
        { year: "2024", title: "100 clients", body: "Une communaut\xE9 qui grandit." }
      ]
    }
  },
  {
    id: "map-location",
    role: "map",
    name: "Adresse + carte",
    tagline: "Localise ta boutique sur une carte",
    description: "Affiche une carte int\xE9gr\xE9e et tes infos de contact.",
    variants: ["split", "centered"],
    previewKey: "map-location",
    defaultContent: {
      title: "Nous trouver",
      address: "12 rue de l'Atelier, 75001 Paris",
      mapEmbedUrl: "",
      hours: "Du lundi au samedi \xB7 10h\u201319h"
    }
  },
  {
    id: "product-hero",
    role: "product",
    name: "Produit \u2014 Hero",
    tagline: "Galerie + prix + CTA panier",
    description: "Bloc principal d'une page produit : grande image (ou galerie), nom, prix, CTA d'achat.",
    variants: ["image-left", "image-right", "split-tall"],
    previewKey: "product-hero",
    defaultContent: {
      ctaLabel: "Ajouter au panier",
      showSku: true,
      showCategory: true
    }
  },
  {
    id: "product-description",
    role: "product",
    name: "Produit \u2014 Description",
    tagline: "Texte long et histoire du produit",
    description: "Section \xE9ditoriale d\xE9taillant le produit (mati\xE8res, fabrication, usages).",
    variants: ["centered", "two-column"],
    previewKey: "product-description",
    defaultContent: {
      title: "\xC0 propos de ce produit",
      fallbackBody: "D\xE9crivez ici l'histoire, la fabrication et les b\xE9n\xE9fices de ce produit. Ce texte est utilis\xE9 si la fiche produit n'a pas de description."
    }
  },
  {
    id: "product-specs",
    role: "product",
    name: "Produit \u2014 Caract\xE9ristiques",
    tagline: "Liste de sp\xE9cifications",
    description: "Tableau de sp\xE9cifications (mati\xE8re, dimensions, garantie, etc.).",
    variants: ["table", "list"],
    previewKey: "product-specs",
    defaultContent: {
      title: "Caract\xE9ristiques",
      rows: [
        { label: "Mati\xE8re", value: "Premium" },
        { label: "Garantie", value: "2 ans" },
        { label: "Livraison", value: "Incluse" }
      ]
    }
  },
  {
    id: "product-related",
    role: "product",
    name: "Produit \u2014 Recommand\xE9s",
    tagline: "Autres produits de la boutique",
    description: "Sugg\xE8re 3 \xE0 4 autres produits pour augmenter le panier moyen.",
    variants: ["3-up", "4-up", "carousel"],
    previewKey: "product-related",
    defaultContent: {
      title: "Vous aimerez aussi",
      limit: 4
    }
  }
];
function findSceneDefinition(sceneType) {
  return STUDIO_SCENES.find((s) => s.id === sceneType);
}
const STUDIO_BUNDLES = [
  {
    key: "narrative",
    name: "Narratif \xE9ditorial",
    scenes: [
      { id: "hero-cinema", variant: "fullscreen" },
      { id: "story-scrolly", variant: "alternating" },
      { id: "showcase-magazine", variant: "3-up" },
      { id: "founder-letter", variant: "letter" },
      { id: "trust-wall", variant: "reviews-first" },
      { id: "cta-sticky", variant: "centered" }
    ]
  },
  {
    key: "product-first",
    name: "Produit-first",
    scenes: [
      { id: "hero-cinema", variant: "split" },
      { id: "showcase-magazine", variant: "4-up" },
      { id: "lookbook-parallax", variant: "asymmetric" },
      { id: "trust-wall", variant: "badges-row" },
      { id: "faq-accordion", variant: "accordion" },
      { id: "cta-sticky", variant: "split-newsletter" }
    ]
  },
  {
    key: "minimal",
    name: "Minimal manifeste",
    scenes: [
      { id: "hero-cinema", variant: "type-only" },
      { id: "manifesto-typographic", variant: "stacked" },
      { id: "showcase-magazine", variant: "3-up" },
      { id: "newsletter-editorial", variant: "centered" },
      { id: "cta-sticky", variant: "centered" }
    ]
  },
  {
    key: "magazine",
    name: "Magazine \xE9ditorial",
    scenes: [
      { id: "hero-cinema", variant: "split" },
      { id: "marquee-strip", variant: "accent" },
      { id: "lookbook-parallax", variant: "zigzag" },
      { id: "press-strip", variant: "scrolling" },
      { id: "showcase-magazine", variant: "carousel" },
      { id: "stats-counter", variant: "split" },
      { id: "newsletter-editorial", variant: "split-image" }
    ]
  },
  {
    key: "showroom",
    name: "Showroom signature",
    scenes: [
      { id: "hero-cinema", variant: "fullscreen" },
      { id: "product-spotlight", variant: "image-right" },
      { id: "gallery-mosaic", variant: "mosaic" },
      { id: "image-text-split", variant: "image-left" },
      { id: "trust-wall", variant: "press-first" },
      { id: "cta-sticky", variant: "sticky-only" }
    ]
  },
  {
    key: "community",
    name: "Communaut\xE9 & valeurs",
    scenes: [
      { id: "hero-cinema", variant: "type-only" },
      { id: "manifesto-typographic", variant: "xl" },
      { id: "founder-letter", variant: "portrait-left" },
      { id: "timeline", variant: "vertical" },
      { id: "showcase-magazine", variant: "3-up" },
      { id: "newsletter-editorial", variant: "minimal" },
      { id: "cta-sticky", variant: "centered" }
    ]
  }
];
function hashSeed(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = h * 31 + seed.charCodeAt(i) >>> 0;
  return h;
}
function pickStudioBundle(seed) {
  if (!seed) return STUDIO_BUNDLES[Math.floor(Math.random() * STUDIO_BUNDLES.length)];
  return STUDIO_BUNDLES[hashSeed(seed) % STUDIO_BUNDLES.length];
}
function defaultStudioBundle(seed) {
  const bundle = pickStudioBundle(seed);
  const seedNum = hashSeed(seed ?? Math.random().toString(36).slice(2));
  let s = seedNum;
  const rand = () => {
    s |= 0;
    s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const scenes = bundle.scenes.map((sc) => {
    const def = findSceneDefinition(sc.id);
    const variant = rand() < 0.35 ? def.variants[Math.floor(rand() * def.variants.length)] : sc.variant ?? def.variants[0];
    return { def, variant };
  });
  if (scenes.length > 3) {
    for (let i = scenes.length - 2; i > 1; i--) {
      const j = 1 + Math.floor(rand() * (i - 1));
      [scenes[i], scenes[j]] = [scenes[j], scenes[i]];
    }
  }
  return scenes.map(({ def, variant }, index) => {
    return {
      role: def.role,
      scene_type: def.id,
      variant,
      content: def.defaultContent,
      position: index,
      is_visible: true
    };
  });
}
export {
  STUDIO_BUNDLES,
  STUDIO_SCENES,
  defaultStudioBundle,
  findSceneDefinition,
  pickStudioBundle
};
