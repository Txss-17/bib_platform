const sectionEffects = [
  { value: "none", label: "Aucun", description: "Apparition instantan\xE9e" },
  { value: "fade", label: "Fondu", description: "Apparition douce en opacit\xE9" },
  { value: "slide-up", label: "Glisse haut", description: "Monte depuis le bas" },
  { value: "slide-left", label: "Glisse gauche", description: "Entre depuis la gauche" },
  { value: "slide-right", label: "Glisse droite", description: "Entre depuis la droite" },
  { value: "zoom", label: "Zoom", description: "Apparition avec mise \xE0 l'\xE9chelle" },
  { value: "tilt", label: "Tilt 3D", description: "Inclinaison avec perspective" },
  { value: "parallax", label: "Parallaxe", description: "Mouvement d\xE9cal\xE9 au scroll" },
  { value: "glow", label: "Lueur", description: "Effet brillance lumineuse" },
  { value: "flip", label: "Flip 3D", description: "Retournement sur l'axe horizontal" },
  { value: "rotate", label: "Rotation", description: "Apparition avec l\xE9g\xE8re rotation" },
  { value: "blur-in", label: "Flou", description: "Apparition depuis un effet flout\xE9" },
  { value: "bounce", label: "Rebond", description: "Apparition avec rebond \xE9lastique" },
  { value: "shine", label: "Brillance", description: "Reflet lumineux qui traverse" },
  { value: "float", label: "Flottement", description: "Mouvement vertical permanent" },
  { value: "pulse", label: "Pulsation", description: "Battement rythmique permanent" },
  { value: "wave", label: "Vague", description: "Ondulation continue subtile" }
];
const availableSections = [
  { type: "hero", label: "Hero", description: "Banni\xE8re principale avec titre et CTA" },
  { type: "announcement", label: "Bandeau annonce", description: "Bandeau sup\xE9rieur (livraison gratuite, promo...)" },
  { type: "features", label: "Avantages", description: "Ic\xF4nes de livraison, qualit\xE9, etc." },
  { type: "countdown", label: "Compte \xE0 rebours", description: "Urgence : offre limit\xE9e dans le temps" },
  { type: "comparison", label: "Comparatif", description: "Avant / Apr\xE8s ou Nous vs Concurrents" },
  { type: "bundle", label: "Bundle / Offre group\xE9e", description: "Pack de plusieurs produits avec remise" },
  { type: "lookbook", label: "Lookbook", description: "Galerie immersive fa\xE7on magazine" },
  { type: "banner-cta", label: "Bande CTA", description: "Bande de couleur avec texte \xE0 gauche et bouton \xE0 droite" },
  { type: "image-gallery", label: "Galerie images", description: "1 \xE0 5 images, 1-4 colonnes, effets de d\xE9filement" },
  { type: "video-gallery", label: "Galerie vid\xE9os", description: "1 \xE0 5 vid\xE9os, 1-4 colonnes, autoplay au scroll" },
  { type: "products", label: "Produits", description: "Grille de produits" },
  { type: "about", label: "\xC0 propos", description: "Pr\xE9sentation de la boutique" },
  { type: "testimonials", label: "Avis clients", description: "T\xE9moignages et \xE9toiles" },
  { type: "video", label: "Vid\xE9o", description: "Vid\xE9o YouTube / Vimeo int\xE9gr\xE9e" },
  { type: "faq", label: "FAQ", description: "Questions fr\xE9quentes en accord\xE9on" },
  { type: "newsletter", label: "Newsletter", description: "Formulaire d'inscription email" },
  { type: "sticky-cta", label: "CTA flottant", description: "Bouton d'achat fix\xE9 en bas d'\xE9cran" }
];
const siteTypes = [
  { value: "classic", label: "Classique", description: "Design \xE9pur\xE9 et professionnel, chargement rapide" },
  { value: "3d", label: "3D & Effets", description: "Parallaxe, profondeur, effets visuels immersifs" }
];
const animationLevels = [
  { value: "none", label: "Aucune", description: "Pas d'animation, chargement instantan\xE9" },
  { value: "subtle", label: "Subtiles", description: "Fade-in doux sur les sections" },
  { value: "dynamic", label: "Dynamiques", description: "Apparitions 3D avec mouvement et profondeur" }
];
const heroLayouts = [
  { value: "text-left", label: "Texte \xE0 gauche", description: "Titre et CTA align\xE9s \xE0 gauche" },
  { value: "text-center", label: "Texte centr\xE9", description: "Titre et CTA au centre" },
  { value: "image-left", label: "Image \xE0 gauche", description: "Image \xE0 gauche, texte \xE0 droite" },
  { value: "image-right", label: "Image \xE0 droite", description: "Texte \xE0 gauche, image \xE0 droite" },
  { value: "image-bg", label: "Image en fond", description: "Image plein fond avec texte superpos\xE9" }
];
const categoryTemplates = {
  Mode: {
    category: "Mode",
    heroTitle: "Des essentiels bien pens\xE9s, livr\xE9s sans surprise.",
    heroSubtitle: "Livraison toujours incluse. Aucun frais cach\xE9.",
    heroTagline: "D\xE9couvrir la collection",
    features: [
      { icon: "truck", label: "Livraison Incluse" },
      { icon: "refresh", label: "Retours Faciles" },
      { icon: "leaf", label: "Production Responsable" }
    ],
    aboutTitle: "\xC0 Propos de Nous",
    aboutDescription: "Nous vous proposons des v\xEAtements essentiels, sans tracas. Logistique et recyclage g\xE9r\xE9s par Brand-In-A-Box. Simple, responsable, sans surprise.",
    productsSectionTitle: "S\xE9lection Populaire",
    fonts: { heading: "Playfair Display", body: "Lato" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true, title: "S\xE9lection Populaire" },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false }
    ]
  },
  Maison: {
    category: "Maison",
    heroTitle: "Cr\xE9ez un int\xE9rieur chaleureux et \xE9l\xE9gant",
    heroSubtitle: "Livraison incluse \u2022 Produits v\xE9rifi\xE9s \u2022 Paiement s\xE9curis\xE9",
    heroTagline: "D\xE9couvrir les produits",
    features: [
      { icon: "home", label: "Livraison Incluse" },
      { icon: "shield", label: "Qualit\xE9 V\xE9rifi\xE9e" },
      { icon: "lock", label: "Paiement S\xE9curis\xE9" }
    ],
    aboutTitle: "Notre Philosophie",
    aboutDescription: "Nous s\xE9lectionnons pour vous les plus belles pi\xE8ces pour votre int\xE9rieur. Chaque produit est v\xE9rifi\xE9 et livr\xE9 avec soin par Brand-In-A-Box.",
    productsSectionTitle: "Nos S\xE9lections pour la Maison",
    fonts: { heading: "DM Serif Display", body: "DM Sans" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false }
    ]
  },
  Tech: {
    category: "Tech",
    heroTitle: "La technologie qui simplifie votre quotidien",
    heroSubtitle: "Produits s\xE9lectionn\xE9s \u2022 Garantie incluse \u2022 Support r\xE9actif",
    heroTagline: "Explorer les produits",
    features: [
      { icon: "zap", label: "Livraison Express" },
      { icon: "shield", label: "Garantie 2 ans" },
      { icon: "headphones", label: "Support 24/7" }
    ],
    aboutTitle: "Notre Expertise",
    aboutDescription: "Nous testons et s\xE9lectionnons chaque produit pour vous garantir qualit\xE9 et fiabilit\xE9. Brand-In-A-Box s'occupe de tout le reste.",
    productsSectionTitle: "Nos Meilleures Ventes",
    fonts: { heading: "Sora", body: "Inter" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false }
    ]
  },
  Beaut\u00E9: {
    category: "Beaut\xE9",
    heroTitle: "R\xE9v\xE9lez votre beaut\xE9 naturelle",
    heroSubtitle: "Formules clean \u2022 Test\xE9es dermatologiquement \u2022 Livraison incluse",
    heroTagline: "D\xE9couvrir les soins",
    features: [
      { icon: "sparkles", label: "Formules Clean" },
      { icon: "heart", label: "Cruelty Free" },
      { icon: "truck", label: "Livraison Offerte" }
    ],
    aboutTitle: "Notre Engagement",
    aboutDescription: "Des produits de beaut\xE9 s\xE9lectionn\xE9s avec soin, respectueux de votre peau et de la plan\xE8te. Brand-In-A-Box vous garantit une exp\xE9rience sans stress.",
    productsSectionTitle: "Coups de C\u0153ur",
    fonts: { heading: "Cormorant Garamond", body: "Nunito Sans" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false }
    ]
  },
  Sport: {
    category: "Sport",
    heroTitle: "\xC9quipez-vous pour performer",
    heroSubtitle: "Mat\xE9riel pro \u2022 Livraison rapide \u2022 Conseils d'experts",
    heroTagline: "Voir les \xE9quipements",
    features: [
      { icon: "trophy", label: "Qualit\xE9 Pro" },
      { icon: "truck", label: "Livraison Express" },
      { icon: "users", label: "Conseils d'Experts" }
    ],
    aboutTitle: "Notre Mission",
    aboutDescription: "Du mat\xE9riel sportif test\xE9 par des athl\xE8tes, accessible \xE0 tous. Brand-In-A-Box vous accompagne dans votre performance.",
    productsSectionTitle: "\xC9quipements Populaires",
    fonts: { heading: "Montserrat", body: "Hind" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false }
    ]
  },
  Alimentation: {
    category: "Alimentation",
    heroTitle: "Des saveurs authentiques, livr\xE9es chez vous",
    heroSubtitle: "Produits frais \u2022 Origine tra\xE7able \u2022 Livraison soign\xE9e",
    heroTagline: "D\xE9couvrir les produits",
    features: [
      { icon: "leaf", label: "Produits Naturels" },
      { icon: "map-pin", label: "Origine Tra\xE7able" },
      { icon: "package", label: "Emballage \xC9co" }
    ],
    aboutTitle: "Notre Philosophie",
    aboutDescription: "Des produits alimentaires s\xE9lectionn\xE9s aupr\xE8s de producteurs de confiance. Brand-In-A-Box garantit fra\xEEcheur et qualit\xE9.",
    productsSectionTitle: "Nos S\xE9lections Gourmandes",
    fonts: { heading: "Fraunces", body: "Commissioner" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false }
    ]
  },
  Jardin: {
    category: "Jardin",
    heroTitle: "Cultivez votre paradis vert",
    heroSubtitle: "Plantes robustes \u2022 Conseils jardinage \u2022 Livraison prot\xE9g\xE9e",
    heroTagline: "Explorer le catalogue",
    features: [
      { icon: "flower", label: "Plantes Saines" },
      { icon: "book", label: "Conseils Inclus" },
      { icon: "package", label: "Emballage Protecteur" }
    ],
    aboutTitle: "Notre Passion",
    aboutDescription: "Des plantes et \xE9quipements de jardinage s\xE9lectionn\xE9s avec amour. Brand-In-A-Box s'occupe de la logistique pour que vous puissiez jardiner en paix.",
    productsSectionTitle: "Nos Incontournables",
    fonts: { heading: "Lora", body: "Source Sans 3" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false }
    ]
  },
  Enfants: {
    category: "Enfants",
    heroTitle: "Le meilleur pour vos petits tr\xE9sors",
    heroSubtitle: "Produits s\xE9curis\xE9s \u2022 Normes CE \u2022 Livraison soign\xE9e",
    heroTagline: "Voir les produits",
    features: [
      { icon: "shield", label: "100% S\xE9curis\xE9" },
      { icon: "award", label: "Normes CE" },
      { icon: "heart", label: "Fait avec Amour" }
    ],
    aboutTitle: "Notre Promesse",
    aboutDescription: "Des produits pour enfants rigoureusement s\xE9lectionn\xE9s pour leur s\xE9curit\xE9 et leur qualit\xE9. Brand-In-A-Box vous garantit tranquillit\xE9 d'esprit.",
    productsSectionTitle: "S\xE9lection Enfants",
    fonts: { heading: "Prata", body: "Work Sans" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false }
    ]
  }
};
function getTemplateForCategory(category) {
  return categoryTemplates[category] || categoryTemplates.Mode;
}
const conversionTemplates = [
  {
    id: "fashion",
    label: "Fashion \u2014 Drop \xE9ditorial",
    description: "Lookbook immersif, t\xE9moignages, urgence sur la collection capsule.",
    category: "Mode",
    primaryColor: "#0F172A",
    secondaryColor: "#C9A14A",
    fonts: { heading: "Playfair Display", body: "Inter" },
    heroTitle: "Notre collection capsule. Maintenant.",
    heroSubtitle: "Pi\xE8ces en \xE9dition limit\xE9e. Livraison incluse.",
    heroLayout: "image-bg",
    sections: [
      {
        id: "announcement",
        type: "announcement",
        enabled: true,
        data: { message: "Livraison offerte d\xE8s 80\u20AC \u2014 \xE9dition limit\xE9e", emoji: "\u2728" }
      },
      { id: "hero", type: "hero", enabled: true, effect: "fade" },
      {
        id: "countdown",
        type: "countdown",
        enabled: true,
        effect: "slide-up",
        data: { title: "Drop se termine dans", endsInHours: 48 }
      },
      { id: "lookbook", type: "lookbook", enabled: true, effect: "slide-up", data: { title: "Le lookbook" } },
      { id: "products", type: "products", enabled: true, effect: "fade" },
      { id: "testimonials", type: "testimonials", enabled: true, effect: "slide-right" },
      { id: "newsletter", type: "newsletter", enabled: true },
      { id: "sticky-cta", type: "sticky-cta", enabled: true, data: { label: "Acheter la collection", anchor: "products" } }
    ]
  },
  {
    id: "tech",
    label: "Tech \u2014 Lancement produit",
    description: "Comparatif vs concurrents, bundle d'accessoires, FAQ technique.",
    category: "Tech",
    primaryColor: "#0F172A",
    secondaryColor: "#C9A14A",
    fonts: { heading: "Sora", body: "Inter" },
    heroTitle: "La nouvelle r\xE9f\xE9rence tech.",
    heroSubtitle: "Garantie 2 ans. Support 24/7. Livr\xE9 sous 48h.",
    heroLayout: "image-right",
    sections: [
      {
        id: "announcement",
        type: "announcement",
        enabled: true,
        data: { message: "Pr\xE9commande ouverte \u2014 livraison sous 48h", emoji: "\u26A1" }
      },
      { id: "hero", type: "hero", enabled: true, effect: "fade" },
      { id: "features", type: "features", enabled: true, effect: "fade" },
      {
        id: "comparison",
        type: "comparison",
        enabled: true,
        effect: "slide-up",
        data: {
          title: "Pourquoi nous choisir",
          us: "Notre offre",
          them: "La concurrence",
          rows: [
            { label: "Garantie 2 ans incluse", us: true, them: false },
            { label: "Support 24/7 en fran\xE7ais", us: true, them: false },
            { label: "Livraison express offerte", us: true, them: false },
            { label: "Retour gratuit 30 jours", us: true, them: true }
          ]
        }
      },
      { id: "products", type: "products", enabled: true, effect: "fade" },
      {
        id: "bundle",
        type: "bundle",
        enabled: true,
        effect: "slide-up",
        data: {
          title: "Pack complet \u2014 \xE9conomisez 25%",
          subtitle: "Tout pour d\xE9marrer en un seul achat",
          items: ["Produit principal", "Accessoire premium", "\xC9tui de protection"],
          originalPrice: 399,
          bundlePrice: 299
        }
      },
      { id: "faq", type: "faq", enabled: true },
      { id: "newsletter", type: "newsletter", enabled: true },
      { id: "sticky-cta", type: "sticky-cta", enabled: true, data: { label: "Pr\xE9commander maintenant", anchor: "products" } }
    ]
  },
  {
    id: "one-product",
    label: "One-product \u2014 Page hero",
    description: "Focus sur un seul produit avec urgence, comparatif, social proof, FAQ.",
    category: "Mode",
    primaryColor: "#0F172A",
    secondaryColor: "#C9A14A",
    fonts: { heading: "Playfair Display", body: "Inter" },
    heroTitle: "Le produit qui change tout.",
    heroSubtitle: "Plus de 1 200 clients conquis. Livr\xE9 en 48h.",
    heroLayout: "image-right",
    sections: [
      {
        id: "announcement",
        type: "announcement",
        enabled: true,
        data: { message: "Stock limit\xE9 \u2014 plus que 47 unit\xE9s", emoji: "\u{1F525}" }
      },
      { id: "hero", type: "hero", enabled: true },
      {
        id: "countdown",
        type: "countdown",
        enabled: true,
        data: { title: "Offre de lancement se termine dans", endsInHours: 12 }
      },
      { id: "features", type: "features", enabled: true },
      { id: "video", type: "video", enabled: true, effect: "zoom" },
      { id: "testimonials", type: "testimonials", enabled: true, effect: "slide-up" },
      {
        id: "comparison",
        type: "comparison",
        enabled: true,
        data: {
          title: "Avant / Apr\xE8s",
          us: "Avec le produit",
          them: "Sans le produit",
          rows: [
            { label: "Gain de temps quotidien", us: true, them: false },
            { label: "R\xE9sultat visible", us: true, them: false },
            { label: "Tranquillit\xE9 d'esprit", us: true, them: false }
          ]
        }
      },
      { id: "faq", type: "faq", enabled: true },
      { id: "newsletter", type: "newsletter", enabled: true },
      { id: "sticky-cta", type: "sticky-cta", enabled: true, data: { label: "Je le veux", anchor: "products" } }
    ]
  },
  {
    id: "fitness",
    label: "Fitness \u2014 Programme intense",
    description: "Bundle \xE9quipement, t\xE9moignages avant/apr\xE8s, urgence promo.",
    category: "Sport",
    primaryColor: "#0F172A",
    secondaryColor: "#C9A14A",
    fonts: { heading: "Montserrat", body: "Inter" },
    heroTitle: "Transformez votre quotidien.",
    heroSubtitle: "\xC9quipement pro. R\xE9sultats prouv\xE9s. Communaut\xE9 d\xE9di\xE9e.",
    heroLayout: "image-bg",
    sections: [
      {
        id: "announcement",
        type: "announcement",
        enabled: true,
        data: { message: "\u221230% sur tous les packs ce week-end", emoji: "\u{1F4AA}" }
      },
      { id: "hero", type: "hero", enabled: true },
      {
        id: "countdown",
        type: "countdown",
        enabled: true,
        data: { title: "Promo se termine dans", endsInHours: 36 }
      },
      { id: "features", type: "features", enabled: true },
      {
        id: "bundle",
        type: "bundle",
        enabled: true,
        data: {
          title: "Pack D\xE9marrage Complet",
          subtitle: "Tout pour commencer d\xE8s demain matin",
          items: ["\xC9quipement principal", "Programme 30 jours", "Acc\xE8s communaut\xE9 priv\xE9e"],
          originalPrice: 249,
          bundlePrice: 179
        }
      },
      { id: "products", type: "products", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: true, effect: "slide-up" },
      { id: "faq", type: "faq", enabled: true },
      { id: "sticky-cta", type: "sticky-cta", enabled: true, data: { label: "D\xE9marrer mon programme", anchor: "products" } }
    ]
  }
];
function getConversionTemplate(id) {
  return conversionTemplates.find((t) => t.id === id);
}
export {
  animationLevels,
  availableSections,
  categoryTemplates,
  conversionTemplates,
  getConversionTemplate,
  getTemplateForCategory,
  heroLayouts,
  sectionEffects,
  siteTypes
};
