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
import { getTemplateForCategory, type ThemeSettings, type SectionConfig, type AnimationLevel, type SiteType, type SectionEffect } from "@/lib/boutiqueTemplates";
import type { FAQItem } from "./StorefrontFAQ";
import { ParallaxSection, ScrollReveal, TiltCard } from "./Storefront3DEffects";
import "./storefront3d.css";

function effectToReveal(effect?: SectionEffect): "up" | "left" | "right" | "scale" | null {
  switch (effect) {
    case "slide-up": return "up";
    case "slide-left": return "left";
    case "slide-right": return "right";
    case "zoom": return "scale";
    case "fade": return "up";
    default: return null;
  }
}

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
  const siteType: SiteType = themeSettings?.siteType || "classic";
  const is3D = siteType === "3d";
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

  // Wrap content with 3D effects when in 3D mode
  const wrap3D = (content: React.ReactNode, key: string, direction?: "up" | "left" | "right" | "scale") => {
    if (!is3D) return content;
    return (
      <ScrollReveal key={key} direction={direction || "up"}>
        <ParallaxSection speed={0.15}>
          {content}
        </ParallaxSection>
      </ScrollReveal>
    );
  };

  // Render sections in their configured order
  const renderSection = (section: SectionConfig, index: number) => {
    if (!section.enabled) return null;
    const delay = delayBase * (index + 1);
    const animStyle = noAnim ? {} : { animationDelay: `${delay}ms`, animationFillMode: "forwards" as const, opacity: 0 };

    let inner: React.ReactNode = null;
    let defaultDir: "up" | "left" | "right" | "scale" = "up";

    switch (section.type) {
      case "hero":
        inner = (
          <div key="hero" className={`${heroAnim} ${is3D ? "storefront-3d-hero" : ""}`} style={noAnim ? {} : { animationDuration: "0.5s" }}>
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
        // Hero handled separately, no wrap
        return inner;
      case "features":
        defaultDir = "scale";
        inner = (
          <div key="features" className={animClass} style={animStyle}>
            <StorefrontFeatures features={template.features} primaryColor={primaryColor} />
          </div>
        );
        break;
      case "products":
        defaultDir = "up";
        inner = (
          <div key="products" className={animClass} style={animStyle}>
            <StorefrontProducts
              title={template.productsSectionTitle}
              products={displayProducts}
              primaryColor={primaryColor}
              boutiqueSlug={boutiqueSlug}
              is3D={is3D}
            />
          </div>
        );
        break;
      case "about":
        defaultDir = "left";
        inner = (
          <div key="about" className={animClass} style={animStyle}>
            <StorefrontAbout
              title={template.aboutTitle}
              description={aboutText}
              boutiqueName={boutiqueName}
              primaryColor={primaryColor}
              aboutImageUrl={aboutImageUrl}
            />
          </div>
        );
        break;
      case "testimonials":
        defaultDir = "right";
        inner = <StorefrontTestimonials key="testimonials" primaryColor={primaryColor} />;
        break;
      case "video":
        defaultDir = "scale";
        inner = (
          <StorefrontVideo
            key="video"
            primaryColor={primaryColor}
            videoUrl={themeSettings?.videoUrl}
            title="Découvrez notre univers"
          />
        );
        break;
      case "faq":
        inner = <StorefrontFAQ key="faq" primaryColor={primaryColor} items={faqItems} />;
        break;
      case "newsletter":
        inner = <StorefrontNewsletter key="newsletter" primaryColor={primaryColor} boutiqueName={boutiqueName} />;
        break;
      default:
        return null;
    }

    // Per-section effect (overrides 3D defaults when explicitly set)
    const effect = section.effect;
    const intensity = section.effectIntensity || "medium";
    const speedMap = { low: 0.08, medium: 0.18, high: 0.35 };
    const tiltMap = { low: 4, medium: 8, high: 14 };

    if (effect && effect !== "none") {
      const reveal = effectToReveal(effect);
      let wrapped: React.ReactNode = inner;
      if (effect === "tilt") {
        wrapped = <TiltCard key={`tilt-${section.type}`} intensity={tiltMap[intensity]}>{inner}</TiltCard>;
      } else if (effect === "parallax") {
        wrapped = <ParallaxSection key={`px-${section.type}`} speed={speedMap[intensity]}>{inner}</ParallaxSection>;
      } else if (effect === "glow") {
        wrapped = <div key={`gl-${section.type}`} className="sf-effect-glow">{inner}</div>;
      }
      if (reveal) {
        return <ScrollReveal key={`r-${section.type}`} direction={reveal}>{wrapped}</ScrollReveal>;
      }
      return wrapped;
    }

    // Fallback: legacy 3D wrap when site type is 3D and no explicit effect
    if (is3D) {
      return (
        <ScrollReveal key={`r-${section.type}`} direction={defaultDir}>
          <ParallaxSection speed={0.15}>{inner}</ParallaxSection>
        </ScrollReveal>
      );
    }
    return inner;
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
