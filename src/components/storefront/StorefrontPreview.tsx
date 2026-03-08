import { useEffect } from "react";
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
import { getTemplateForCategory, type ThemeSettings, type SectionConfig, type AnimationLevel } from "@/lib/boutiqueTemplates";
import type { FAQItem } from "./StorefrontFAQ";

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

function buildGoogleFontsUrl(heading: string, body: string): string {
  const families = [heading, body]
    .filter((f, i, a) => a.indexOf(f) === i)
    .map(f => f.replace(/ /g, "+") + ":wght@400;500;600;700")
    .join("&family=");
  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}

function getAnimClasses(level: AnimationLevel): { section: string; hero: string; delayBase: number } {
  switch (level) {
    case "none":
      return { section: "", hero: "", delayBase: 0 };
    case "subtle":
      return { section: "animate-fade-in", hero: "animate-fade-in", delayBase: 80 };
    case "dynamic":
      return { section: "animate-fade-up", hero: "animate-scale-in", delayBase: 120 };
    default:
      return { section: "animate-fade-in", hero: "animate-fade-in", delayBase: 80 };
  }
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
  // Use sections order from themeSettings (preserves drag-and-drop order)
  const sections = themeSettings?.sections || template.sections;
  
  const animationLevel: AnimationLevel = themeSettings?.animationLevel 
    || (themeSettings?.animations === false ? "none" : "subtle");

  const heroTitle = themeSettings?.customHeroTitle || template.heroTitle;
  const heroSubtitle = themeSettings?.customHeroSubtitle || template.heroSubtitle;
  const aboutText = themeSettings?.customAboutText || template.aboutDescription;
  const aboutImageUrl = themeSettings?.aboutImageUrl;
  const faqItems = themeSettings?.faqItems;
  const heroLayout = themeSettings?.heroLayout || "text-left";
  const heroImageUrl = themeSettings?.heroImageUrl;

  // Dynamically load Google Fonts
  useEffect(() => {
    const url = buildGoogleFontsUrl(fonts.heading, fonts.body);
    const linkId = "storefront-google-fonts";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (link) {
      link.href = url;
    } else {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
  }, [fonts.heading, fonts.body]);

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

  const { section: animClass, hero: heroAnim, delayBase } = getAnimClasses(animationLevel);
  const noAnim = animationLevel === "none";

  // Render sections in their configured order
  const renderSection = (section: SectionConfig, index: number) => {
    if (!section.enabled) return null;
    const delay = delayBase * (index + 1);
    const animStyle = noAnim ? {} : { animationDelay: `${delay}ms`, animationFillMode: "forwards" as const, opacity: 0 };

    switch (section.type) {
      case "hero":
        return (
          <div key="hero" className={heroAnim} style={noAnim ? {} : { animationDuration: "0.5s" }}>
            <StorefrontHero
              title={heroTitle}
              subtitle={heroSubtitle}
              tagline={template.heroTagline}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              headingFont={fonts.heading}
              heroLayout={heroLayout}
              heroImageUrl={heroImageUrl}
            />
          </div>
        );
      case "features":
        return (
          <div key="features" className={animClass} style={animStyle}>
            <StorefrontFeatures features={template.features} primaryColor={primaryColor} />
          </div>
        );
      case "products":
        return (
          <div key="products" className={animClass} style={animStyle}>
            <StorefrontProducts
              title={template.productsSectionTitle}
              products={displayProducts}
              primaryColor={primaryColor}
              boutiqueSlug={boutiqueSlug}
            />
          </div>
        );
      case "about":
        return (
          <div key="about" className={animClass} style={animStyle}>
            <StorefrontAbout
              title={template.aboutTitle}
              description={aboutText}
              boutiqueName={boutiqueName}
              primaryColor={primaryColor}
            />
          </div>
        );
      case "testimonials":
        return <StorefrontTestimonials key="testimonials" primaryColor={primaryColor} />;
      case "video":
        return (
          <StorefrontVideo
            key="video"
            primaryColor={primaryColor}
            videoUrl={themeSettings?.videoUrl}
            title="Découvrez notre univers"
          />
        );
      case "faq":
        return <StorefrontFAQ key="faq" primaryColor={primaryColor} />;
      case "newsletter":
        return <StorefrontNewsletter key="newsletter" primaryColor={primaryColor} boutiqueName={boutiqueName} />;
      default:
        return null;
    }
  };

  return (
    <CartProvider>
    <div 
      className={`bg-white min-h-screen ${isPreview ? 'pointer-events-none' : ''}`}
      style={{ fontFamily: `'${fonts.body}', sans-serif` }}
    >
      <StorefrontHeader 
        boutiqueName={boutiqueName} 
        primaryColor={primaryColor}
        boutiqueSlug={boutiqueSlug}
      />

      {/* Render sections in configured order */}
      {sections.map((section, index) => renderSection(section, index))}

      {boutiqueId && <CartDrawer primaryColor={primaryColor} boutiqueId={boutiqueId} boutiqueName={boutiqueName} />}
      <StorefrontFooter primaryColor={primaryColor} />
    </div>
    </CartProvider>
  );
}
