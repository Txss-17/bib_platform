import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontHero } from "./StorefrontHero";
import { StorefrontFeatures } from "./StorefrontFeatures";
import { StorefrontProducts } from "./StorefrontProducts";
import { StorefrontAbout } from "./StorefrontAbout";
import { StorefrontFooter } from "./StorefrontFooter";
import { getTemplateForCategory, type ThemeSettings, type SectionConfig } from "@/lib/boutiqueTemplates";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  isPopular?: boolean;
}

interface StorefrontPreviewProps {
  boutiqueName: string;
  category: string;
  themeSettings: ThemeSettings | null;
  products?: Product[];
  isPreview?: boolean;
}

export function StorefrontPreview({
  boutiqueName,
  category,
  themeSettings,
  products = [],
  isPreview = false,
}: StorefrontPreviewProps) {
  const template = getTemplateForCategory(category);
  
  const primaryColor = themeSettings?.primaryColor || "#3b82f6";
  const secondaryColor = themeSettings?.secondaryColor || "#1e40af";
  const fonts = themeSettings?.fonts || template.fonts;
  const sections = themeSettings?.sections || template.sections;

  const heroTitle = themeSettings?.customHeroTitle || template.heroTitle;
  const heroSubtitle = themeSettings?.customHeroSubtitle || template.heroSubtitle;
  const aboutText = themeSettings?.customAboutText || template.aboutDescription;

  // Determine which sections are enabled
  const isSectionEnabled = (type: SectionConfig["type"]) => {
    const section = sections.find(s => s.type === type);
    return section?.enabled !== false;
  };

  // Mock products for preview if none provided
  const displayProducts = products.length > 0 ? products : [
    { id: "1", name: "Produit Exemple 1", price: 29.90, image_url: null, isPopular: true },
    { id: "2", name: "Produit Exemple 2", price: 34.50, image_url: null },
    { id: "3", name: "Produit Exemple 3", price: 44.90, image_url: null },
    { id: "4", name: "Produit Exemple 4", price: 22.00, image_url: null },
  ];

  return (
    <div 
      className={`bg-white min-h-screen ${isPreview ? 'pointer-events-none' : ''}`}
      style={{ fontFamily: fonts.body }}
    >
      <StorefrontHeader 
        boutiqueName={boutiqueName} 
        primaryColor={primaryColor} 
      />

      {isSectionEnabled("hero") && (
        <StorefrontHero
          title={heroTitle}
          subtitle={heroSubtitle}
          tagline={template.heroTagline}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          headingFont={fonts.heading}
        />
      )}

      {isSectionEnabled("features") && (
        <StorefrontFeatures 
          features={template.features} 
          primaryColor={primaryColor} 
        />
      )}

      {isSectionEnabled("products") && (
        <StorefrontProducts
          title={template.productsSectionTitle}
          products={displayProducts}
          primaryColor={primaryColor}
        />
      )}

      {isSectionEnabled("about") && (
        <StorefrontAbout
          title={template.aboutTitle}
          description={aboutText}
          boutiqueName={boutiqueName}
          primaryColor={primaryColor}
        />
      )}

      <StorefrontFooter primaryColor={primaryColor} />
    </div>
  );
}
