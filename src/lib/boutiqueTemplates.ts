// Template configurations for each boutique category

export interface SectionConfig {
  id: string;
  type: "hero" | "features" | "products" | "about" | "testimonials" | "newsletter" | "video" | "faq";
  enabled: boolean;
  title?: string;
  subtitle?: string;
}

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

// All available section types for the editor
export const availableSections: { type: SectionConfig["type"]; label: string; description: string }[] = [
  { type: "hero", label: "Hero", description: "Bannière principale avec titre et CTA" },
  { type: "features", label: "Avantages", description: "Icônes de livraison, qualité, etc." },
  { type: "products", label: "Produits", description: "Grille de produits" },
  { type: "about", label: "À propos", description: "Présentation de la boutique" },
  { type: "testimonials", label: "Avis clients", description: "Témoignages et étoiles" },
  { type: "video", label: "Vidéo", description: "Vidéo YouTube / Vimeo intégrée" },
  { type: "faq", label: "FAQ", description: "Questions fréquentes en accordéon" },
  { type: "newsletter", label: "Newsletter", description: "Formulaire d'inscription email" },
];

export type AnimationLevel = "none" | "subtle" | "dynamic";
export type HeroLayout = "text-left" | "text-center" | "image-left" | "image-right" | "image-bg";

export const animationLevels: { value: AnimationLevel; label: string; description: string }[] = [
  { value: "none", label: "Aucune", description: "Pas d'animation, chargement instantané" },
  { value: "subtle", label: "Subtiles", description: "Fade-in doux sur les sections" },
  { value: "dynamic", label: "Dynamiques", description: "Apparitions avec mouvement et profondeur" },
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
    aboutDescription: "Nous vous proposons des vêtements essentiels, sans tracas. Logistique et recyclage gérés par LINKSY. Simple, responsable, sans surprise.",
    productsSectionTitle: "Sélection Populaire",
    fonts: { heading: "Playfair Display", body: "Inter" },
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
    aboutDescription: "Nous sélectionnons pour vous les plus belles pièces pour votre intérieur. Chaque produit est vérifié et livré avec soin par LINKSY.",
    productsSectionTitle: "Nos Sélections pour la Maison",
    fonts: { heading: "Cormorant Garamond", body: "Lato" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true, title: "Nos Sélections pour la Maison" },
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
    aboutDescription: "Nous testons et sélectionnons chaque produit pour vous garantir qualité et fiabilité. LINKSY s'occupe de tout le reste.",
    productsSectionTitle: "Nos Meilleures Ventes",
    fonts: { heading: "Space Grotesk", body: "Inter" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true, title: "Nos Meilleures Ventes" },
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
    aboutDescription: "Des produits de beauté sélectionnés avec soin, respectueux de votre peau et de la planète. LINKSY vous garantit une expérience sans stress.",
    productsSectionTitle: "Coups de Cœur",
    fonts: { heading: "Cormorant Garamond", body: "Nunito Sans" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true, title: "Coups de Cœur" },
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
    aboutDescription: "Du matériel sportif testé par des athlètes, accessible à tous. LINKSY vous accompagne dans votre performance.",
    productsSectionTitle: "Équipements Populaires",
    fonts: { heading: "Montserrat", body: "Open Sans" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true, title: "Équipements Populaires" },
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
    aboutDescription: "Des produits alimentaires sélectionnés auprès de producteurs de confiance. LINKSY garantit fraîcheur et qualité.",
    productsSectionTitle: "Nos Sélections Gourmandes",
    fonts: { heading: "Playfair Display", body: "Source Sans Pro" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true, title: "Nos Sélections Gourmandes" },
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
    aboutDescription: "Des plantes et équipements de jardinage sélectionnés avec amour. LINKSY s'occupe de la logistique pour que vous puissiez jardiner en paix.",
    productsSectionTitle: "Nos Incontournables",
    fonts: { heading: "Libre Baskerville", body: "Lato" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true, title: "Nos Incontournables" },
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
    aboutDescription: "Des produits pour enfants rigoureusement sélectionnés pour leur sécurité et leur qualité. LINKSY vous garantit tranquillité d'esprit.",
    productsSectionTitle: "Sélection Enfants",
    fonts: { heading: "Fredoka One", body: "Nunito" },
    sections: [
      { id: "hero", type: "hero", enabled: true },
      { id: "features", type: "features", enabled: true },
      { id: "products", type: "products", enabled: true, title: "Sélection Enfants" },
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

export interface ThemeSettings {
  colorScheme: string;
  primaryColor: string;
  secondaryColor: string;
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
}
