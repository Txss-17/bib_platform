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

// Build Google Fonts URL from font pair
function buildGoogleFontsUrl(heading: string, body: string): string {
  const families = [heading, body]
    .filter((f, i, a) => a.indexOf(f) === i) // dedupe
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
  const sections = themeSettings?.sections || template.sections;
  
  // Animation level: backwards-compat with old boolean
  const animationLevel: AnimationLevel = themeSettings?.animationLevel 
    || (themeSettings?.animations === false ? "none" : "subtle");

  const heroTitle = themeSettings?.customHeroTitle || template.heroTitle;
  const heroSubtitle = themeSettings?.customHeroSubtitle || template.heroSubtitle;
  const aboutText = themeSettings?.customAboutText || template.aboutDescription;
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

  return (
    <CartProvider>
    <div 
      className={`bg-white min-h-screen ${isPreview ? 'pointer-events-none' : ''}`}
      style={{ fontFamily: `'${fonts.body}', sans-serif` }}
    >
      <StorefrontHeader 
        boutiqueName={boutiqueName} 
        primaryColor={primaryColor} 
      />

      {isSectionEnabled("hero") && (
        <div className={heroAnim} style={noAnim ? {} : { animationDuration: "0.5s" }}>
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
      )}

      {isSectionEnabled("features") && (
        <div className={animClass} style={noAnim ? {} : { animationDelay: `${delayBase}ms`, animationFillMode: "forwards", opacity: 0 }}>
          <StorefrontFeatures 
            features={template.features} 
            primaryColor={primaryColor} 
          />
        </div>
      )}

      {isSectionEnabled("products") && (
        <div className={animClass} style={noAnim ? {} : { animationDelay: `${delayBase * 2}ms`, animationFillMode: "forwards", opacity: 0 }}>
          <StorefrontProducts
            title={template.productsSectionTitle}
            products={displayProducts}
            primaryColor={primaryColor}
            boutiqueSlug={boutiqueSlug}
          />
        </div>
      )}

      {isSectionEnabled("about") && (
        <div className={animClass} style={noAnim ? {} : { animationDelay: `${delayBase * 3}ms`, animationFillMode: "forwards", opacity: 0 }}>
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
