// Template configurations for each boutique category

export type SectionEffect =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "zoom"
  | "tilt"
  | "parallax"
  | "glow"
  | "flip"
  | "rotate"
  | "blur-in"
  | "bounce"
  | "shine"
  | "float"
  | "pulse"
  | "wave";

export interface SectionConfig {
  id: string;
  type:
    | "hero"
    | "features"
    | "products"
    | "about"
    | "testimonials"
    | "newsletter"
    | "video"
    | "faq"
    | "announcement"
    | "countdown"
    | "comparison"
    | "bundle"
    | "lookbook"
    | "sticky-cta";
  enabled: boolean;
  title?: string;
  subtitle?: string;
  effect?: SectionEffect;
  effectIntensity?: "low" | "medium" | "high";
  /** Largeur du conteneur de la section */
  width?: "contained" | "wide" | "full";
  /** Espacement vertical (padding haut/bas) */
  spacing?: "compact" | "normal" | "large";
  /** Alignement horizontal du contenu */
  align?: "left" | "center" | "right";
  /** Free-form per-section data (announcement message, countdown end date, etc.) */
  data?: Record<string, any>;
}

export const sectionEffects: { value: SectionEffect; label: string; description: string }[] = [
  { value: "none", label: "Aucun", description: "Apparition instantanée" },
  { value: "fade", label: "Fondu", description: "Apparition douce en opacité" },
  { value: "slide-up", label: "Glisse haut", description: "Monte depuis le bas" },
  { value: "slide-left", label: "Glisse gauche", description: "Entre depuis la gauche" },
  { value: "slide-right", label: "Glisse droite", description: "Entre depuis la droite" },
  { value: "zoom", label: "Zoom", description: "Apparition avec mise à l'échelle" },
  { value: "tilt", label: "Tilt 3D", description: "Inclinaison avec perspective" },
  { value: "parallax", label: "Parallaxe", description: "Mouvement décalé au scroll" },
  { value: "glow", label: "Lueur", description: "Effet brillance lumineuse" },
  { value: "flip", label: "Flip 3D", description: "Retournement sur l'axe horizontal" },
  { value: "rotate", label: "Rotation", description: "Apparition avec légère rotation" },
  { value: "blur-in", label: "Flou", description: "Apparition depuis un effet flouté" },
  { value: "bounce", label: "Rebond", description: "Apparition avec rebond élastique" },
  { value: "shine", label: "Brillance", description: "Reflet lumineux qui traverse" },
  { value: "float", label: "Flottement", description: "Mouvement vertical permanent" },
  { value: "pulse", label: "Pulsation", description: "Battement rythmique permanent" },
  { value: "wave", label: "Vague", description: "Ondulation continue subtile" },
];

export interface TemplateConfig {
  category: string;
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  features: { icon: string; label: string }[];
  aboutTitle: string;
  aboutDescription: string;
  productsSectionTitle: string;
  fonts: {
    heading: string;
    body: string;
  };
  sections: SectionConfig[];
}

export const availableSections: { type: SectionConfig["type"]; label: string; description: string }[] = [
  { type: "hero", label: "Hero", description: "Bannière principale avec titre et CTA" },
  { type: "announcement", label: "Bandeau annonce", description: "Bandeau supérieur (livraison gratuite, promo...)" },
  { type: "features", label: "Avantages", description: "Icônes de livraison, qualité, etc." },
  { type: "countdown", label: "Compte à rebours", description: "Urgence : offre limitée dans le temps" },
  { type: "comparison", label: "Comparatif", description: "Avant / Après ou Nous vs Concurrents" },
  { type: "bundle", label: "Bundle / Offre groupée", description: "Pack de plusieurs produits avec remise" },
  { type: "lookbook", label: "Lookbook", description: "Galerie immersive façon magazine" },
  { type: "products", label: "Produits", description: "Grille de produits" },
  { type: "about", label: "À propos", description: "Présentation de la boutique" },
  { type: "testimonials", label: "Avis clients", description: "Témoignages et étoiles" },
  { type: "video", label: "Vidéo", description: "Vidéo YouTube / Vimeo intégrée" },
  { type: "faq", label: "FAQ", description: "Questions fréquentes en accordéon" },
  { type: "newsletter", label: "Newsletter", description: "Formulaire d'inscription email" },
  { type: "sticky-cta", label: "CTA flottant", description: "Bouton d'achat fixé en bas d'écran" },
];

export type AnimationLevel = "none" | "subtle" | "dynamic";
export type HeroLayout = "text-left" | "text-center" | "image-left" | "image-right" | "image-bg";
export type SiteType = "classic" | "3d";

export const siteTypes: { value: SiteType; label: string; description: string }[] = [
  { value: "classic", label: "Classique", description: "Design épuré et professionnel, chargement rapide" },
  { value: "3d", label: "3D & Effets", description: "Parallaxe, profondeur, effets visuels immersifs" },
];

export const animationLevels: { value: AnimationLevel; label: string; description: string }[] = [
  { value: "none", label: "Aucune", description: "Pas d'animation, chargement instantané" },
  { value: "subtle", label: "Subtiles", description: "Fade-in doux sur les sections" },
  { value: "dynamic", label: "Dynamiques", description: "Apparitions 3D avec mouvement et profondeur" },
];

export const heroLayouts: { value: HeroLayout; label: string; description: string }[] = [
  { value: "text-left", label: "Texte à gauche", description: "Titre et CTA alignés à gauche" },
  { value: "text-center", label: "Texte centré", description: "Titre et CTA au centre" },
  { value: "image-left", label: "Image à gauche", description: "Image à gauche, texte à droite" },
  { value: "image-right", label: "Image à droite", description: "Texte à gauche, image à droite" },
  { value: "image-bg", label: "Image en fond", description: "Image plein fond avec texte superposé" },
];

export const categoryTemplates: Record<string, TemplateConfig> = {
  Mode: {
    category: "Mode",
    heroTitle: "Des essentiels bien pensés, livrés sans surprise.",
    heroSubtitle: "Livraison toujours incluse. Aucun frais caché.",
    heroTagline: "Découvrir la collection",
    features: [
      { icon: "truck", label: "Livraison Incluse" },
      { icon: "refresh", label: "Retours Faciles" },
      { icon: "leaf", label: "Production Responsable" },
    ],
    aboutTitle: "À Propos de Nous",
    aboutDescription: "Nous vous proposons des vêtements essentiels, sans tracas. Logistique et recyclage gérés par Brand-In-A-Box. Simple, responsable, sans surprise.",
    productsSectionTitle: "Sélection Populaire",
    fonts: { heading: "Playfair Display", body: "Lato" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true, title: "Sélection Populaire" },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false },
    ],
  },
  Maison: {
    category: "Maison",
    heroTitle: "Créez un intérieur chaleureux et élégant",
    heroSubtitle: "Livraison incluse • Produits vérifiés • Paiement sécurisé",
    heroTagline: "Découvrir les produits",
    features: [
      { icon: "home", label: "Livraison Incluse" },
      { icon: "shield", label: "Qualité Vérifiée" },
      { icon: "lock", label: "Paiement Sécurisé" },
    ],
    aboutTitle: "Notre Philosophie",
    aboutDescription: "Nous sélectionnons pour vous les plus belles pièces pour votre intérieur. Chaque produit est vérifié et livré avec soin par Brand-In-A-Box.",
    productsSectionTitle: "Nos Sélections pour la Maison",
    fonts: { heading: "DM Serif Display", body: "DM Sans" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false },
    ],
  },
  Tech: {
    category: "Tech",
    heroTitle: "La technologie qui simplifie votre quotidien",
    heroSubtitle: "Produits sélectionnés • Garantie incluse • Support réactif",
    heroTagline: "Explorer les produits",
    features: [
      { icon: "zap", label: "Livraison Express" },
      { icon: "shield", label: "Garantie 2 ans" },
      { icon: "headphones", label: "Support 24/7" },
    ],
    aboutTitle: "Notre Expertise",
    aboutDescription: "Nous testons et sélectionnons chaque produit pour vous garantir qualité et fiabilité. Brand-In-A-Box s'occupe de tout le reste.",
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
      { id: "newsletter", type: "newsletter", enabled: false },
    ],
  },
  Beauté: {
    category: "Beauté",
    heroTitle: "Révélez votre beauté naturelle",
    heroSubtitle: "Formules clean • Testées dermatologiquement • Livraison incluse",
    heroTagline: "Découvrir les soins",
    features: [
      { icon: "sparkles", label: "Formules Clean" },
      { icon: "heart", label: "Cruelty Free" },
      { icon: "truck", label: "Livraison Offerte" },
    ],
    aboutTitle: "Notre Engagement",
    aboutDescription: "Des produits de beauté sélectionnés avec soin, respectueux de votre peau et de la planète. Brand-In-A-Box vous garantit une expérience sans stress.",
    productsSectionTitle: "Coups de Cœur",
    fonts: { heading: "Cormorant Garamond", body: "Nunito Sans" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false },
    ],
  },
  Sport: {
    category: "Sport",
    heroTitle: "Équipez-vous pour performer",
    heroSubtitle: "Matériel pro • Livraison rapide • Conseils d'experts",
    heroTagline: "Voir les équipements",
    features: [
      { icon: "trophy", label: "Qualité Pro" },
      { icon: "truck", label: "Livraison Express" },
      { icon: "users", label: "Conseils d'Experts" },
    ],
    aboutTitle: "Notre Mission",
    aboutDescription: "Du matériel sportif testé par des athlètes, accessible à tous. Brand-In-A-Box vous accompagne dans votre performance.",
    productsSectionTitle: "Équipements Populaires",
    fonts: { heading: "Montserrat", body: "Hind" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false },
    ],
  },
  Alimentation: {
    category: "Alimentation",
    heroTitle: "Des saveurs authentiques, livrées chez vous",
    heroSubtitle: "Produits frais • Origine traçable • Livraison soignée",
    heroTagline: "Découvrir les produits",
    features: [
      { icon: "leaf", label: "Produits Naturels" },
      { icon: "map-pin", label: "Origine Traçable" },
      { icon: "package", label: "Emballage Éco" },
    ],
    aboutTitle: "Notre Philosophie",
    aboutDescription: "Des produits alimentaires sélectionnés auprès de producteurs de confiance. Brand-In-A-Box garantit fraîcheur et qualité.",
    productsSectionTitle: "Nos Sélections Gourmandes",
    fonts: { heading: "Fraunces", body: "Commissioner" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false },
    ],
  },
  Jardin: {
    category: "Jardin",
    heroTitle: "Cultivez votre paradis vert",
    heroSubtitle: "Plantes robustes • Conseils jardinage • Livraison protégée",
    heroTagline: "Explorer le catalogue",
    features: [
      { icon: "flower", label: "Plantes Saines" },
      { icon: "book", label: "Conseils Inclus" },
      { icon: "package", label: "Emballage Protecteur" },
    ],
    aboutTitle: "Notre Passion",
    aboutDescription: "Des plantes et équipements de jardinage sélectionnés avec amour. Brand-In-A-Box s'occupe de la logistique pour que vous puissiez jardiner en paix.",
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
      { id: "newsletter", type: "newsletter", enabled: false },
    ],
  },
  Enfants: {
    category: "Enfants",
    heroTitle: "Le meilleur pour vos petits trésors",
    heroSubtitle: "Produits sécurisés • Normes CE • Livraison soignée",
    heroTagline: "Voir les produits",
    features: [
      { icon: "shield", label: "100% Sécurisé" },
      { icon: "award", label: "Normes CE" },
      { icon: "heart", label: "Fait avec Amour" },
    ],
    aboutTitle: "Notre Promesse",
    aboutDescription: "Des produits pour enfants rigoureusement sélectionnés pour leur sécurité et leur qualité. Brand-In-A-Box vous garantit tranquillité d'esprit.",
    productsSectionTitle: "Sélection Enfants",
    fonts: { heading: "Prata", body: "Work Sans" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true },
      { id: "about", type: "about", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: false },
      { id: "video", type: "video", enabled: false },
      { id: "faq", type: "faq", enabled: false },
      { id: "newsletter", type: "newsletter", enabled: false },
    ],
  },
};

export function getTemplateForCategory(category: string): TemplateConfig {
  return categoryTemplates[category] || categoryTemplates.Mode;
}

/**
 * Conversion-first templates — applicable in 1 click from the editor.
 * Each template prescribes a complete section list, with default copy
 * stored in `section.data` so the storefront has content out of the box.
 */
export interface ConversionTemplate {
  id: "fashion" | "tech" | "one-product" | "fitness";
  label: string;
  description: string;
  category: string;
  primaryColor: string;
  secondaryColor: string;
  fonts: { heading: string; body: string };
  heroTitle: string;
  heroSubtitle: string;
  heroLayout: HeroLayout;
  sections: SectionConfig[];
}

export const conversionTemplates: ConversionTemplate[] = [
  {
    id: "fashion",
    label: "Fashion — Drop éditorial",
    description: "Lookbook immersif, témoignages, urgence sur la collection capsule.",
    category: "Mode",
    primaryColor: "#0F172A",
    secondaryColor: "#C9A14A",
    fonts: { heading: "Playfair Display", body: "Inter" },
    heroTitle: "Notre collection capsule. Maintenant.",
    heroSubtitle: "Pièces en édition limitée. Livraison incluse.",
    heroLayout: "image-bg",
    sections: [
      {
        id: "announcement", type: "announcement", enabled: true,
        data: { message: "Livraison offerte dès 80€ — édition limitée", emoji: "✨" },
      },
      { id: "hero", type: "hero", enabled: true, effect: "fade" },
      {
        id: "countdown", type: "countdown", enabled: true, effect: "slide-up",
        data: { title: "Drop se termine dans", endsInHours: 48 },
      },
      { id: "lookbook", type: "lookbook", enabled: true, effect: "slide-up", data: { title: "Le lookbook" } },
      { id: "products", type: "products", enabled: true, effect: "fade" },
      { id: "testimonials", type: "testimonials", enabled: true, effect: "slide-right" },
      { id: "newsletter", type: "newsletter", enabled: true },
      { id: "sticky-cta", type: "sticky-cta", enabled: true, data: { label: "Acheter la collection", anchor: "products" } },
    ],
  },
  {
    id: "tech",
    label: "Tech — Lancement produit",
    description: "Comparatif vs concurrents, bundle d'accessoires, FAQ technique.",
    category: "Tech",
    primaryColor: "#0F172A",
    secondaryColor: "#C9A14A",
    fonts: { heading: "Sora", body: "Inter" },
    heroTitle: "La nouvelle référence tech.",
    heroSubtitle: "Garantie 2 ans. Support 24/7. Livré sous 48h.",
    heroLayout: "image-right",
    sections: [
      {
        id: "announcement", type: "announcement", enabled: true,
        data: { message: "Précommande ouverte — livraison sous 48h", emoji: "⚡" },
      },
      { id: "hero", type: "hero", enabled: true, effect: "fade" },
      { id: "features", type: "features", enabled: true, effect: "fade" },
      {
        id: "comparison", type: "comparison", enabled: true, effect: "slide-up",
        data: {
          title: "Pourquoi nous choisir",
          us: "Notre offre",
          them: "La concurrence",
          rows: [
            { label: "Garantie 2 ans incluse", us: true, them: false },
            { label: "Support 24/7 en français", us: true, them: false },
            { label: "Livraison express offerte", us: true, them: false },
            { label: "Retour gratuit 30 jours", us: true, them: true },
          ],
        },
      },
      { id: "products", type: "products", enabled: true, effect: "fade" },
      {
        id: "bundle", type: "bundle", enabled: true, effect: "slide-up",
        data: {
          title: "Pack complet — économisez 25%",
          subtitle: "Tout pour démarrer en un seul achat",
          items: ["Produit principal", "Accessoire premium", "Étui de protection"],
          originalPrice: 399,
          bundlePrice: 299,
        },
      },
      { id: "faq", type: "faq", enabled: true },
      { id: "newsletter", type: "newsletter", enabled: true },
      { id: "sticky-cta", type: "sticky-cta", enabled: true, data: { label: "Précommander maintenant", anchor: "products" } },
    ],
  },
  {
    id: "one-product",
    label: "One-product — Page hero",
    description: "Focus sur un seul produit avec urgence, comparatif, social proof, FAQ.",
    category: "Mode",
    primaryColor: "#0F172A",
    secondaryColor: "#C9A14A",
    fonts: { heading: "Playfair Display", body: "Inter" },
    heroTitle: "Le produit qui change tout.",
    heroSubtitle: "Plus de 1 200 clients conquis. Livré en 48h.",
    heroLayout: "image-right",
    sections: [
      {
        id: "announcement", type: "announcement", enabled: true,
        data: { message: "Stock limité — plus que 47 unités", emoji: "🔥" },
      },
      { id: "hero", type: "hero", enabled: true },
      {
        id: "countdown", type: "countdown", enabled: true,
        data: { title: "Offre de lancement se termine dans", endsInHours: 12 },
      },
      { id: "features", type: "features", enabled: true },
      { id: "video", type: "video", enabled: true, effect: "zoom" },
      { id: "testimonials", type: "testimonials", enabled: true, effect: "slide-up" },
      {
        id: "comparison", type: "comparison", enabled: true,
        data: {
          title: "Avant / Après",
          us: "Avec le produit",
          them: "Sans le produit",
          rows: [
            { label: "Gain de temps quotidien", us: true, them: false },
            { label: "Résultat visible", us: true, them: false },
            { label: "Tranquillité d'esprit", us: true, them: false },
          ],
        },
      },
      { id: "faq", type: "faq", enabled: true },
      { id: "newsletter", type: "newsletter", enabled: true },
      { id: "sticky-cta", type: "sticky-cta", enabled: true, data: { label: "Je le veux", anchor: "products" } },
    ],
  },
  {
    id: "fitness",
    label: "Fitness — Programme intense",
    description: "Bundle équipement, témoignages avant/après, urgence promo.",
    category: "Sport",
    primaryColor: "#0F172A",
    secondaryColor: "#C9A14A",
    fonts: { heading: "Montserrat", body: "Inter" },
    heroTitle: "Transformez votre quotidien.",
    heroSubtitle: "Équipement pro. Résultats prouvés. Communauté dédiée.",
    heroLayout: "image-bg",
    sections: [
      {
        id: "announcement", type: "announcement", enabled: true,
        data: { message: "−30% sur tous les packs ce week-end", emoji: "💪" },
      },
      { id: "hero", type: "hero", enabled: true },
      {
        id: "countdown", type: "countdown", enabled: true,
        data: { title: "Promo se termine dans", endsInHours: 36 },
      },
      { id: "features", type: "features", enabled: true },
      {
        id: "bundle", type: "bundle", enabled: true,
        data: {
          title: "Pack Démarrage Complet",
          subtitle: "Tout pour commencer dès demain matin",
          items: ["Équipement principal", "Programme 30 jours", "Accès communauté privée"],
          originalPrice: 249,
          bundlePrice: 179,
        },
      },
      { id: "products", type: "products", enabled: true },
      { id: "testimonials", type: "testimonials", enabled: true, effect: "slide-up" },
      { id: "faq", type: "faq", enabled: true },
      { id: "sticky-cta", type: "sticky-cta", enabled: true, data: { label: "Démarrer mon programme", anchor: "products" } },
    ],
  },
];

export function getConversionTemplate(id: ConversionTemplate["id"]): ConversionTemplate | undefined {
  return conversionTemplates.find((t) => t.id === id);
}

export interface ThemeSettings {
  colorScheme: string;
  primaryColor: string;
  secondaryColor: string;
  siteType?: SiteType;
  fonts?: {
    heading: string;
    body: string;
  };
  sections?: SectionConfig[];
  customHeroTitle?: string;
  customHeroSubtitle?: string;
  customAboutText?: string;
  videoUrl?: string;
  animations?: boolean;
  animationLevel?: AnimationLevel;
  heroLayout?: HeroLayout;
  heroImageUrl?: string;
  boutiqueEmail?: string;
  aboutImageUrl?: string;
  faqItems?: { question: string; answer: string }[];
  cguText?: string;
  cgvText?: string;
  voiceTone?: string;
}
