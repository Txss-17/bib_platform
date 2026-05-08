/**
 * Studio Scenes — bibliothèque de scènes premium éditables.
 * Remplace l'ancien système de "sections Lego" drag-and-drop.
 * Chaque scène a un rôle (hero, story, lookbook…), un type visuel, des variantes
 * et un schéma de contenu typé.
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
  | "banner";

export interface SceneDefinition {
  id: string; // ex: hero-cinema
  role: SceneRole;
  name: string;
  tagline: string;
  description: string;
  variants: string[];
  /** Contenu par défaut sérialisé dans boutique_scenes.content */
  defaultContent: Record<string, unknown>;
  /** Aperçu wireframe (svg path / classes) — utilisé dans le picker */
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
  | "banner-promo";
}

export const STUDIO_SCENES: SceneDefinition[] = [
  {
    id: "hero-cinema",
    role: "hero",
    name: "Hero Cinéma",
    tagline: "Plein écran immersif avec vidéo ou visuel signature",
    description:
      "Une ouverture cinématographique : visuel ou vidéo plein écran, titre éditorial, sous-titre étiré, CTA discret. Parfait pour les marques narratives.",
    variants: ["fullscreen", "split", "type-only"],
    previewKey: "hero-cinema",
    defaultContent: {
      title: "Une nouvelle façon de porter l'élégance",
      subtitle: "Pièces conçues pour durer, racontées avec exigence.",
      ctaLabel: "Découvrir la collection",
      backgroundImage: null,
      videoUrl: null,
      overlayOpacity: 0.45,
      fullPageBackground: false,
      textAlign: "center",
    },
  },
  {
    id: "story-scrolly",
    role: "story",
    name: "Story Scrollytelling",
    tagline: "Narration verticale chapitre par chapitre",
    description:
      "Trois à cinq chapitres qui se révèlent au scroll, alternant texte et visuel. Idéal pour raconter l'origine, le savoir-faire, la mission.",
    variants: ["alternating", "centered", "side-pinned"],
    previewKey: "story-scrolly",
    defaultContent: {
      chapters: [
        {
          eyebrow: "Origine",
          title: "Tout commence par une obsession",
          body: "Sourcer la matière la plus juste, sans compromis.",
          image: null,
        },
        {
          eyebrow: "Savoir-faire",
          title: "Façonné à la main, pensé pour durer",
          body: "Chaque pièce passe par 14 étapes de contrôle.",
          image: null,
        },
        {
          eyebrow: "Promesse",
          title: "Une garantie qui parle pour nous",
          body: "Réparation à vie, sur simple demande.",
          image: null,
        },
      ],
    },
  },
  {
    id: "lookbook-parallax",
    role: "lookbook",
    name: "Lookbook Parallaxe",
    tagline: "Galerie éditoriale haute couture",
    description:
      "Grille asymétrique avec parallaxe et légendes flottantes. Met en avant 4 à 6 visuels icôniques de la saison.",
    variants: ["asymmetric", "tiled", "zigzag"],
    previewKey: "lookbook-parallax",
    defaultContent: {
      title: "La nouvelle saison",
      subtitle: "Six pièces, six histoires.",
      images: [],
    },
  },
  {
    id: "showcase-magazine",
    role: "showcase",
    name: "Vitrine Magazine",
    tagline: "Produits mis en scène comme une éditoriale presse",
    description:
      "Trois à six produits présentés en vignettes 'magazine' — visuel large, eyebrow, prix discret, CTA inline.",
    variants: ["3-up", "4-up", "carousel"],
    previewKey: "showcase-magazine",
    defaultContent: {
      title: "Sélection signature",
      subtitle: "Les indispensables à porter dès maintenant.",
      productIds: [],
      layout: "3-up",
      cardShape: "rounded",
      cardStyle: "minimal",
    },
  },
  {
    id: "trust-wall",
    role: "trust",
    name: "Mur de Confiance",
    tagline: "Avis, presse et garanties à fort impact",
    description:
      "Composition mêlant logos presse, citations clients, badges qualité. Optimise la conversion à l'étape consideration.",
    variants: ["press-first", "reviews-first", "badges-row"],
    previewKey: "trust-wall",
    defaultContent: {
      title: "Ils nous font confiance",
      pressLogos: [],
      reviews: [
        { author: "Camille L.", quote: "La meilleure pièce de mon dressing.", rating: 5 },
        { author: "Hugo R.", quote: "Service irréprochable, finition sublime.", rating: 5 },
      ],
      badges: ["Verified by Linksy", "Garantie 2 ans", "Livraison neutre carbone"],
    },
  },
  {
    id: "cta-sticky",
    role: "cta",
    name: "Conversion CTA",
    tagline: "Appel à l'action final + barre fixe sur mobile",
    description:
      "Bloc final hauteur réduite + barre sticky bas-écran sur mobile. Idéal pour pousser l'achat ou l'abonnement newsletter.",
    variants: ["centered", "split-newsletter", "sticky-only"],
    previewKey: "cta-sticky",
    defaultContent: {
      title: "Prêt à passer à l'action ?",
      subtitle: "Rejoignez les 10 000 clients qui nous font déjà confiance.",
      ctaLabel: "Commander maintenant",
      ctaSecondaryLabel: "Recevoir la newsletter",
      stickyEnabled: true,
    },
  },
  {
    id: "faq-accordion",
    role: "faq",
    name: "FAQ Éditoriale",
    tagline: "Questions/réponses dépliables, pensées SEO",
    description:
      "Accordéon élégant qui répond aux objections d'achat. Le JSON-LD FAQPage est généré automatiquement à partir du contenu.",
    variants: ["accordion", "two-column", "list"],
    previewKey: "faq-accordion",
    defaultContent: {
      title: "Vos questions, nos réponses",
      items: [
        { q: "Quels sont vos délais de livraison ?", a: "48 à 72h en France métropolitaine, 5 à 7 jours en Europe." },
        { q: "Quelle est votre politique de retour ?", a: "Retours gratuits sous 30 jours, sans condition." },
        { q: "Vos produits sont-ils garantis ?", a: "Oui, garantie 2 ans incluse sur toute la collection." },
      ],
    },
  },
  {
    id: "newsletter-editorial",
    role: "newsletter",
    name: "Newsletter Éditoriale",
    tagline: "Capture d'email premium au ton magazine",
    description:
      "Bloc newsletter avec promesse éditoriale forte, champ email épuré et bénéfices listés. Conçu pour la conversion.",
    variants: ["centered", "split-image", "minimal"],
    previewKey: "newsletter-editorial",
    defaultContent: {
      eyebrow: "Le journal",
      title: "Recevez nos exclusivités avant tout le monde",
      subtitle: "Une lettre éditoriale par mois. Pas de spam, jamais.",
      placeholder: "Votre email",
      ctaLabel: "S'abonner",
      benefits: ["-10% sur la première commande", "Accès anticipé aux drops", "Histoires de la maison"],
    },
  },
  {
    id: "press-strip",
    role: "press",
    name: "Bandeau Presse",
    tagline: "Logos médias en bande défilante",
    description:
      "Bande horizontale présentant les logos presse en monochrome. Anime au scroll pour un rendu vivant.",
    variants: ["scrolling", "static-grid", "centered"],
    previewKey: "press-strip",
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
  {
    id: "comparison-table",
    role: "comparison",
    name: "Tableau Comparatif",
    tagline: "Pourquoi nous choisir vs. la concurrence",
    description:
      "Comparaison ligne par ligne pour lever les objections. Très efficace en bas de page produit.",
    variants: ["check-cross", "stars", "minimal"],
    previewKey: "comparison-table",
    defaultContent: {
      title: "Pourquoi nous choisir",
      brand_name: "Notre maison",
      competitor_name: "La concurrence",
      rows: [
        { label: "Matières premium", us: true, them: false },
        { label: "Garantie 2 ans", us: true, them: false },
        { label: "Livraison neutre carbone", us: true, them: false },
        { label: "Service client humain", us: true, them: false },
      ],
    },
  },
  {
    id: "founder-letter",
    role: "founder",
    name: "Lettre du Fondateur",
    tagline: "Adresse personnelle signée à la main",
    description:
      "Format lettre intime — texte centré, signature manuscrite, photo ronde. Crée un attachement émotionnel fort.",
    variants: ["letter", "portrait-left", "portrait-right"],
    previewKey: "founder-letter",
    defaultContent: {
      eyebrow: "Notre histoire",
      title: "Un mot du fondateur",
      body: "Quand j'ai imaginé cette maison, j'avais en tête une seule idée : faire mieux, sans compromis. Chaque pièce qui sort de notre atelier porte cette obsession.",
      signature: "Antoine, fondateur",
      portraitUrl: null,
    },
  },
  {
    id: "manifesto-typographic",
    role: "manifesto",
    name: "Manifeste Typographique",
    tagline: "Statement plein écran, ton manifeste",
    description:
      "Typographie monumentale qui affirme la mission. Aucune image, juste la force du verbe.",
    variants: ["xl", "stacked", "marquee"],
    previewKey: "manifesto-typographic",
    defaultContent: {
      lines: ["Faire moins.", "Faire mieux.", "Faire pour durer."],
      footnote: "Notre manifeste, depuis le premier jour.",
    },
  },
  {
    id: "marquee-strip",
    role: "marquee",
    name: "Bande défilante",
    tagline: "Texte qui défile en boucle, personnalisable",
    description:
      "Bandeau horizontal animé : écris ce que tu veux (slogan, promo, valeurs) avec ta police, ta couleur et ta vitesse.",
    variants: ["dark", "light", "accent", "outline"],
    previewKey: "marquee-strip",
    defaultContent: {
      text: "Livraison offerte dès 50€ · Retours gratuits · Garantie 2 ans",
      separator: "·",
      speed: 30,
      fontFamily: "",
      fontSize: 18,
      uppercase: true,
      direction: "left",
    },
  },
  {
    id: "gallery-mosaic",
    role: "gallery",
    name: "Galerie Mosaïque",
    tagline: "Grille libre de visuels (jusqu'à 12)",
    description:
      "Grille mosaïque éditoriale : ajoute jusqu'à 12 visuels, ratios mixtes, hover zoom.",
    variants: ["mosaic", "uniform", "masonry"],
    previewKey: "gallery-mosaic",
    defaultContent: {
      title: "Notre univers",
      subtitle: "",
      images: [],
    },
  },
  {
    id: "stats-counter",
    role: "stats",
    name: "Chiffres clés",
    tagline: "3-4 KPIs animés (clients, années, pays…)",
    description:
      "Bloc compteurs avec chiffres en gros, idéal pour rassurer.",
    variants: ["centered", "split", "minimal"],
    previewKey: "stats-counter",
    defaultContent: {
      title: "Quelques chiffres",
      stats: [
        { value: "10K+", label: "Clients satisfaits" },
        { value: "98%", label: "Avis 5 étoiles" },
        { value: "48h", label: "Livraison moyenne" },
        { value: "2 ans", label: "Garantie" },
      ],
    },
  },
  {
    id: "video-fullscreen",
    role: "video",
    name: "Vidéo immersive",
    tagline: "Vidéo plein écran avec overlay et CTA",
    description:
      "Section vidéo plein écran (autoplay muet) avec titre, sous-titre et appel à l'action.",
    variants: ["fullscreen", "boxed", "split"],
    previewKey: "video-fullscreen",
    defaultContent: {
      videoUrl: "",
      poster: null,
      title: "Découvrez notre savoir-faire",
      subtitle: "Une vidéo vaut mille mots.",
      ctaLabel: "Explorer",
      overlayOpacity: 0.4,
    },
  },
  {
    id: "banner-promo",
    role: "banner",
    name: "Bandeau promo",
    tagline: "Bande haute pour annonces, codes promo",
    description:
      "Petit bandeau supérieur (annonce, code promo, livraison gratuite). Couleur et texte au choix.",
    variants: ["solid", "gradient", "outline"],
    previewKey: "banner-promo",
    defaultContent: {
      text: "🎁 -10% sur la première commande avec le code BIENVENUE",
      ctaLabel: "Profiter",
      ctaUrl: "#shop",
      bgColor: "primary",
    },
  },
];

/** Configuration de scène persistée dans la table boutique_scenes. */
export interface SceneRecord {
  id: string;
  boutique_id: string;
  role: SceneRole;
  scene_type: string; // matches SceneDefinition.id
  variant: string;
  content: Record<string, unknown>;
  position: number;
  is_visible: boolean;
}

export function findSceneDefinition(sceneType: string): SceneDefinition | undefined {
  return STUDIO_SCENES.find((s) => s.id === sceneType);
}

/**
 * Trois templates de structure différents — permet à chaque boutique d'avoir
 * une page d'accueil non-identique. Le seed (string) sélectionne un template
 * de manière déterministe pour garantir cohérence si on régénère.
 */
export const STUDIO_BUNDLES: Array<{ key: string; name: string; scenes: Array<{ id: string; variant?: string }> }> = [
  {
    key: "narrative",
    name: "Narratif éditorial",
    scenes: [
      { id: "hero-cinema", variant: "fullscreen" },
      { id: "story-scrolly", variant: "alternating" },
      { id: "showcase-magazine", variant: "3-up" },
      { id: "founder-letter", variant: "letter" },
      { id: "trust-wall", variant: "reviews-first" },
      { id: "cta-sticky", variant: "centered" },
    ],
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
      { id: "cta-sticky", variant: "split-newsletter" },
    ],
  },
  {
    key: "minimal",
    name: "Minimal manifeste",
    scenes: [
      { id: "hero-cinema", variant: "type-only" },
      { id: "manifesto-typographic", variant: "stacked" },
      { id: "showcase-magazine", variant: "3-up" },
      { id: "newsletter-editorial", variant: "centered" },
      { id: "cta-sticky", variant: "centered" },
    ],
  },
];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function pickStudioBundle(seed?: string) {
  if (!seed) return STUDIO_BUNDLES[Math.floor(Math.random() * STUDIO_BUNDLES.length)];
  return STUDIO_BUNDLES[hashSeed(seed) % STUDIO_BUNDLES.length];
}

/** Bundle initial — varié selon le seed pour ne PAS produire deux sites identiques. */
export function defaultStudioBundle(seed?: string): Array<
  Pick<SceneRecord, "role" | "scene_type" | "variant" | "content" | "position" | "is_visible">
> {
  const bundle = pickStudioBundle(seed);
  return bundle.scenes.map((s, index) => {
    const def = findSceneDefinition(s.id)!;
    return {
      role: def.role,
      scene_type: def.id,
      variant: s.variant ?? def.variants[0],
      content: def.defaultContent,
      position: index,
      is_visible: true,
    };
  });
}