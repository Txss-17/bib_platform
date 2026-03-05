import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontHero } from "./StorefrontHero";
import { StorefrontFeatures } from "./StorefrontFeatures";
import { StorefrontProducts } from "./StorefrontProducts";
import { StorefrontAbout } from "./StorefrontAbout";
import { StorefrontTestimonials } from "./StorefrontTestimonials";
import { StorefrontVideo } from "./StorefrontVideo";
import { StorefrontFAQ } from "./StorefrontFAQ";
import { StorefrontNewsletter } from "./StorefrontNewsletter";
import { StorefrontFooter } from "./StorefrontFooter";
import { CartDrawer } from "./CartDrawer";
import { CartProvider } from "@/contexts/CartContext";
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
  boutiqueId?: string;
  boutiqueSlug?: string;
  category: string;
  themeSettings: ThemeSettings | null;
  products?: Product[];
  isPreview?: boolean;
}

export function StorefrontPreview({
  boutiqueName,
  boutiqueId,
  boutiqueSlug,
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
  const enableAnimations = themeSettings?.animations !== false;

  const heroTitle = themeSettings?.customHeroTitle || template.heroTitle;
  const heroSubtitle = themeSettings?.customHeroSubtitle || template.heroSubtitle;
  const aboutText = themeSettings?.customAboutText || template.aboutDescription;

  const isSectionEnabled = (type: SectionConfig["type"]) => {
    const section = sections.find(s => s.type === type);
    return section?.enabled !== false;
  };

  const displayProducts = products.length > 0 ? products : [
    { id: "1", name: "Produit Exemple 1", price: 29.90, image_url: null, isPopular: true },
    { id: "2", name: "Produit Exemple 2", price: 34.50, image_url: null },
    { id: "3", name: "Produit Exemple 3", price: 44.90, image_url: null },
    { id: "4", name: "Produit Exemple 4", price: 22.00, image_url: null },
  ];

  const animClass = enableAnimations ? "animate-fade-up" : "";

  return (
    <CartProvider>
    <div 
      className={`bg-white min-h-screen ${isPreview ? 'pointer-events-none' : ''}`}
      style={{ fontFamily: fonts.body }}
    >
      <StorefrontHeader 
        boutiqueName={boutiqueName} 
        primaryColor={primaryColor} 
      />

      {isSectionEnabled("hero") && (
        <div className={enableAnimations ? "animate-fade-in" : ""}>
          <StorefrontHero
            title={heroTitle}
            subtitle={heroSubtitle}
            tagline={template.heroTagline}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            headingFont={fonts.heading}
          />
        </div>
      )}

      {isSectionEnabled("features") && (
        <div className={animClass} style={{ animationDelay: "100ms", animationFillMode: "forwards", opacity: enableAnimations ? 0 : 1 }}>
          <StorefrontFeatures 
            features={template.features} 
            primaryColor={primaryColor} 
          />
        </div>
      )}

      {isSectionEnabled("products") && (
        <div className={animClass} style={{ animationDelay: "200ms", animationFillMode: "forwards", opacity: enableAnimations ? 0 : 1 }}>
          <StorefrontProducts
            title={template.productsSectionTitle}
            products={displayProducts}
            primaryColor={primaryColor}
            boutiqueSlug={boutiqueSlug}
          />
        </div>
      )}

      {isSectionEnabled("about") && (
        <div className={animClass} style={{ animationDelay: "300ms", animationFillMode: "forwards", opacity: enableAnimations ? 0 : 1 }}>
          <StorefrontAbout
            title={template.aboutTitle}
            description={aboutText}
            boutiqueName={boutiqueName}
            primaryColor={primaryColor}
          />
        </div>
      )}

      {isSectionEnabled("testimonials") && (
        <StorefrontTestimonials primaryColor={primaryColor} />
      )}

      {isSectionEnabled("video") && (
        <StorefrontVideo 
          primaryColor={primaryColor} 
          videoUrl={themeSettings?.videoUrl}
          title="Découvrez notre univers"
        />
      )}

      {isSectionEnabled("faq") && (
        <StorefrontFAQ primaryColor={primaryColor} />
      )}

      {isSectionEnabled("newsletter") && (
        <StorefrontNewsletter primaryColor={primaryColor} boutiqueName={boutiqueName} />
      )}

      {boutiqueId && <CartDrawer primaryColor={primaryColor} boutiqueId={boutiqueId} boutiqueName={boutiqueName} />}
      <StorefrontFooter primaryColor={primaryColor} />
    </div>
    </CartProvider>
  );
}
