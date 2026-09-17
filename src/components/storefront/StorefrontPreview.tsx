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
import { StorefrontProvider } from "@/contexts/StorefrontContext";

import {
  getTemplateForCategory,
  type ThemeSettings,
  type SectionConfig,
  type AnimationLevel,
  type SiteType,
  type SectionEffect,
} from "@/lib/boutiqueTemplates";

import { ParallaxSection, ScrollReveal, TiltCard } from "./Storefront3DEffects";

import {
  StorefrontAnnouncement,
  StorefrontCountdown,
  StorefrontComparison,
  StorefrontBundle,
  StorefrontLookbook,
  StorefrontStickyCTA,
} from "./StorefrontConversionSections";

import {
  StorefrontBannerCTA,
  StorefrontImageGallery,
  StorefrontVideoGallery,
} from "./StorefrontMediaSections";

import "./storefront3d.css";

/*
 * --------------------------------------------------------------------------
 * Product model
 * --------------------------------------------------------------------------
 *
 * This is the customer-facing product model used by the storefront.
 *
 * The storefront does not expose:
 * - supplier price
 * - supplier identity
 * - applied margin
 * - MOQ
 * - supplier commercial data
 *
 * Only the public product information is passed to storefront components.
 * --------------------------------------------------------------------------
 */

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  images?: string[];
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

/*
 * --------------------------------------------------------------------------
 * Section effects
 * --------------------------------------------------------------------------
 */

function effectToReveal(
  effect?: SectionEffect,
): "up" | "left" | "right" | "scale" | null {
  switch (effect) {
    case "slide-up":
      return "up";

    case "slide-left":
      return "left";

    case "slide-right":
      return "right";

    case "zoom":
      return "scale";

    case "fade":
      return "up";

    default:
      return null;
  }
}

/*
 * --------------------------------------------------------------------------
 * Section layout
 * --------------------------------------------------------------------------
 */

function widthClass(
  width?: SectionConfig["width"],
): string {
  switch (width) {
    case "full":
      return "sf-w-full";

    case "wide":
      return "sf-w-wide";

    case "contained":
    default:
      return "sf-w-contained";
  }
}

function spacingClass(
  spacing?: SectionConfig["spacing"],
): string {
  switch (spacing) {
    case "compact":
      return "sf-sp-compact";

    case "large":
      return "sf-sp-large";

    case "normal":
    default:
      return "sf-sp-normal";
  }
}

function alignClass(
  align?: SectionConfig["align"],
): string {
  switch (align) {
    case "left":
      return "text-left";

    case "right":
      return "text-right";

    case "center":
    default:
      return "";
  }
}

/*
 * --------------------------------------------------------------------------
 * Explicit visual effects
 * --------------------------------------------------------------------------
 */

const effectClassMap: Partial<
  Record<SectionEffect, string>
> = {
  flip: "sf-effect-flip",
  rotate: "sf-effect-rotate",
  "blur-in": "sf-effect-blur-in",
  bounce: "sf-effect-bounce",
  shine: "sf-effect-shine",
  float: "sf-effect-float",
  pulse: "sf-effect-pulse",
  wave: "sf-effect-wave",
  glow: "sf-effect-glow",
};

/*
 * --------------------------------------------------------------------------
 * Google Fonts
 * --------------------------------------------------------------------------
 */

function buildGoogleFontsUrl(
  heading: string,
  body: string,
): string {
  const families = [heading, body]
    .filter(
      (font, index, array) =>
        array.indexOf(font) === index,
    )
    .map(
      (font) =>
        `${font.replace(/ /g, "+")}:wght@400;500;600;700`,
    )
    .join("&family=");

  return `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
}

/*
 * --------------------------------------------------------------------------
 * Animation configuration
 * --------------------------------------------------------------------------
 */

function getAnimClasses(
  level: AnimationLevel,
): {
  section: string;
  hero: string;
  delayBase: number;
} {
  switch (level) {
    case "none":
      return {
        section: "",
        hero: "",
        delayBase: 0,
      };

    case "subtle":
      return {
        section: "animate-fade-in",
        hero: "animate-fade-in",
        delayBase: 80,
      };

    case "dynamic":
      return {
        section: "animate-fade-up",
        hero: "animate-scale-in",
        delayBase: 120,
      };

    default:
      return {
        section: "animate-fade-in",
        hero: "animate-fade-in",
        delayBase: 80,
      };
  }
}

/*
 * --------------------------------------------------------------------------
 * Storefront Preview
 * --------------------------------------------------------------------------
 *
 * This component represents the default storefront experience.
 *
 * It is NOT the BIB Store.
 *
 * BIB Store:
 *   /store
 *   /store/products
 *   /store/product/:productId
 *   /store/boutique/:slug
 *
 * Actual boutique:
 *   /boutique/:slug
 *   /boutique/:slug/product/:productId
 *
 * Cart and checkout belong to the actual boutique storefront.
 * --------------------------------------------------------------------------
 */

export function StorefrontPreview({
  boutiqueName,
  boutiqueId,
  boutiqueSlug,
  category,
  themeSettings,
  products = [],
  isPreview = false,
}: StorefrontPreviewProps) {
  /*
   * ------------------------------------------------------------------------
   * Template
   * ------------------------------------------------------------------------
   */

  const template =
    getTemplateForCategory(category);

  /*
   * ------------------------------------------------------------------------
   * Theme
   * ------------------------------------------------------------------------
   */

  const primaryColor =
    themeSettings?.primaryColor ||
    "#3b82f6";

  const secondaryColor =
    themeSettings?.secondaryColor ||
    "#1e40af";

  const fonts =
    themeSettings?.fonts ||
    template.fonts;

  const siteType: SiteType =
    themeSettings?.siteType ||
    "classic";

  const is3D =
    siteType === "3d";

  /*
   * Keep the configured drag-and-drop order.
   */

  const sections =
    themeSettings?.sections ||
    template.sections;

  const animationLevel: AnimationLevel =
    themeSettings?.animationLevel ||
    (
      themeSettings?.animations === false
        ? "none"
        : "subtle"
    );

  /*
   * ------------------------------------------------------------------------
   * Content
   * ------------------------------------------------------------------------
   */

  const heroTitle =
    themeSettings?.customHeroTitle ||
    template.heroTitle;

  const heroSubtitle =
    themeSettings?.customHeroSubtitle ||
    template.heroSubtitle;

  const aboutText =
    themeSettings?.customAboutText ||
    template.aboutDescription;

  const aboutImageUrl =
    themeSettings?.aboutImageUrl;

  const faqItems =
    themeSettings?.faqItems;

  const heroLayout =
    themeSettings?.heroLayout ||
    "text-left";

  const heroImageUrl =
    themeSettings?.heroImageUrl;

  /*
   * ------------------------------------------------------------------------
   * Google Fonts
   * ------------------------------------------------------------------------
   */

  useEffect(() => {
    const url = buildGoogleFontsUrl(
      fonts.heading,
      fonts.body,
    );

    const linkId =
      "storefront-google-fonts";

    let link =
      document.getElementById(
        linkId,
      ) as HTMLLinkElement | null;

    if (link) {
      link.href = url;
      return;
    }

    link =
      document.createElement(
        "link",
      );

    link.id = linkId;
    link.rel = "stylesheet";
    link.href = url;

    document.head.appendChild(link);
  }, [
    fonts.heading,
    fonts.body,
  ]);

  /*
   * ------------------------------------------------------------------------
   * Section helpers
   * ------------------------------------------------------------------------
   */

  const isSectionEnabled = (
    type: SectionConfig["type"],
  ) => {
    const section =
      sections.find(
        (item) =>
          item.type === type,
      );

    return (
      section?.enabled !== false
    );
  };

  /*
   * ------------------------------------------------------------------------
   * Products
   * ------------------------------------------------------------------------
   *
   * In a real public boutique, products are supplied by BoutiquePublic.
   *
   * The examples are retained for preview/template mode so the storefront
   * remains visually usable before products exist.
   * ------------------------------------------------------------------------
   */

  const displayProducts: Product[] =
    products.length > 0
      ? products
      : [
          {
            id: "1",
            name: "Produit Exemple 1",
            price: 29.9,
            image_url: null,
            isPopular: true,
          },
          {
            id: "2",
            name: "Produit Exemple 2",
            price: 34.5,
            image_url: null,
          },
          {
            id: "3",
            name: "Produit Exemple 3",
            price: 44.9,
            image_url: null,
          },
          {
            id: "4",
            name: "Produit Exemple 4",
            price: 22,
            image_url: null,
          },
        ];

  /*
   * ------------------------------------------------------------------------
   * Animation configuration
   * ------------------------------------------------------------------------
   */

  const {
    section: animClass,
    hero: heroAnim,
    delayBase,
  } = getAnimClasses(
    animationLevel,
  );

  const noAnim =
    animationLevel === "none";

  /*
   * ------------------------------------------------------------------------
   * Section renderer
   * ------------------------------------------------------------------------
   */

  const renderSection = (
    section: SectionConfig,
    index: number,
  ) => {
    if (!section.enabled) {
      return null;
    }

    const delay =
      delayBase * (index + 1);

    const animStyle = noAnim
      ? {}
      : {
          animationDelay: `${delay}ms`,
          animationFillMode:
            "forwards" as const,
          opacity: 0,
        };

    let inner: React.ReactNode =
      null;

    let defaultDir:
      | "up"
      | "left"
      | "right"
      | "scale" =
      "up";

    /*
     * ----------------------------------------------------------------------
     * Hero
     * ----------------------------------------------------------------------
     */

    switch (section.type) {
      case "hero":
        inner = (
          <div
            key="hero"
            className={`${heroAnim} ${
              is3D
                ? "storefront-3d-hero"
                : ""
            }`}
            style={
              noAnim
                ? {}
                : {
                    animationDuration:
                      "0.5s",
                  }
            }
          >
            <StorefrontHero
              title={heroTitle}
              subtitle={heroSubtitle}
              tagline={
                template.heroTagline
              }
              primaryColor={
                primaryColor
              }
              secondaryColor={
                secondaryColor
              }
              headingFont={
                fonts.heading
              }
              heroLayout={
                heroLayout
              }
              heroImageUrl={
                heroImageUrl
              }
            />
          </div>
        );

        /*
         * Hero already controls its own visual presentation.
         */

        return inner;

      /*
       * --------------------------------------------------------------------
       * Features
       * --------------------------------------------------------------------
       */

      case "features":
        defaultDir = "scale";

        inner = (
          <div
            key="features"
            className={animClass}
            style={animStyle}
          >
            <StorefrontFeatures
              features={
                template.features
              }
              primaryColor={
                primaryColor
              }
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Products
       * --------------------------------------------------------------------
       */

      case "products":
        defaultDir = "up";

        inner = (
          <div
            key="products"
            id="products"
            className={animClass}
            style={animStyle}
          >
            <StorefrontProducts
              title={
                template.productsSectionTitle
              }
              products={
                displayProducts
              }
              primaryColor={
                primaryColor
              }
              boutiqueSlug={
                boutiqueSlug
              }
              boutiqueId={
                boutiqueId
              }
              is3D={is3D}
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * About
       * --------------------------------------------------------------------
       */

      case "about":
        defaultDir = "left";

        inner = (
          <div
            key="about"
            className={animClass}
            style={animStyle}
          >
            <StorefrontAbout
              title={
                template.aboutTitle
              }
              description={
                aboutText
              }
              boutiqueName={
                boutiqueName
              }
              primaryColor={
                primaryColor
              }
              aboutImageUrl={
                aboutImageUrl
              }
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Testimonials
       * --------------------------------------------------------------------
       */

      case "testimonials":
        defaultDir = "right";

        inner = (
          <StorefrontTestimonials
            key="testimonials"
            primaryColor={
              primaryColor
            }
          />
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Video
       * --------------------------------------------------------------------
       */

      case "video":
        defaultDir = "scale";

        inner = (
          <StorefrontVideo
            key="video"
            primaryColor={
              primaryColor
            }
            videoUrl={
              themeSettings?.videoUrl
            }
            title="Découvrez notre univers"
          />
        );

        break;

      /*
       * --------------------------------------------------------------------
       * FAQ
       * --------------------------------------------------------------------
       */

      case "faq":
        inner = (
          <StorefrontFAQ
            key="faq"
            primaryColor={
              primaryColor
            }
            items={faqItems}
          />
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Newsletter
       * --------------------------------------------------------------------
       */

      case "newsletter":
        inner = (
          <StorefrontNewsletter
            key="newsletter"
            primaryColor={
              primaryColor
            }
            boutiqueName={
              boutiqueName
            }
          />
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Announcement
       *
       * Rendered separately at the top.
       * --------------------------------------------------------------------
       */

      case "announcement":
        return null;

      /*
       * --------------------------------------------------------------------
       * Countdown
       * --------------------------------------------------------------------
       */

      case "countdown":
        defaultDir = "up";

        inner = (
          <div
            key="countdown"
            className={animClass}
            style={animStyle}
          >
            <StorefrontCountdown
              title={
                section.data?.title
              }
              endsInHours={
                section.data
                  ?.endsInHours
              }
              primaryColor={
                primaryColor
              }
              secondaryColor={
                secondaryColor
              }
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Comparison
       * --------------------------------------------------------------------
       */

      case "comparison":
        defaultDir = "up";

        inner = (
          <div
            key="comparison"
            className={animClass}
            style={animStyle}
          >
            <StorefrontComparison
              title={
                section.data?.title
              }
              us={
                section.data?.us
              }
              them={
                section.data?.them
              }
              rows={
                section.data?.rows
              }
              primaryColor={
                primaryColor
              }
              secondaryColor={
                secondaryColor
              }
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Bundle
       * --------------------------------------------------------------------
       */

      case "bundle":
        defaultDir = "scale";

        inner = (
          <div
            key="bundle"
            className={animClass}
            style={animStyle}
          >
            <StorefrontBundle
              title={
                section.data?.title
              }
              subtitle={
                section.data?.subtitle
              }
              items={
                section.data?.items
              }
              originalPrice={
                section.data
                  ?.originalPrice
              }
              bundlePrice={
                section.data
                  ?.bundlePrice
              }
              primaryColor={
                primaryColor
              }
              secondaryColor={
                secondaryColor
              }
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Lookbook
       * --------------------------------------------------------------------
       */

      case "lookbook":
        defaultDir = "up";

        inner = (
          <div
            key="lookbook"
            className={animClass}
            style={animStyle}
          >
            <StorefrontLookbook
              title={
                section.data?.title
              }
              images={
                section.data?.images
              }
              primaryColor={
                primaryColor
              }
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Banner CTA
       * --------------------------------------------------------------------
       */

      case "banner-cta":
        defaultDir = "up";

        inner = (
          <div
            key="banner-cta"
            className={animClass}
            style={animStyle}
          >
            <StorefrontBannerCTA
              title={
                section.data?.title
              }
              subtitle={
                section.data?.subtitle
              }
              ctaLabel={
                section.data?.ctaLabel
              }
              ctaHref={
                section.data?.ctaHref
              }
              align={
                section.data?.align
              }
              primaryColor={
                primaryColor
              }
              secondaryColor={
                secondaryColor
              }
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Image gallery
       * --------------------------------------------------------------------
       */

      case "image-gallery":
        defaultDir = "up";

        inner = (
          <div
            key="image-gallery"
            className={animClass}
            style={animStyle}
          >
            <StorefrontImageGallery
              images={
                section.data?.images
              }
              columns={
                section.data?.columns
              }
              effect={
                section.data?.effect
              }
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Video gallery
       * --------------------------------------------------------------------
       */

      case "video-gallery":
        defaultDir = "up";

        inner = (
          <div
            key="video-gallery"
            className={animClass}
            style={animStyle}
          >
            <StorefrontVideoGallery
              videos={
                section.data?.videos
              }
              columns={
                section.data?.columns
              }
              effect={
                section.data?.effect
              }
            />
          </div>
        );

        break;

      /*
       * --------------------------------------------------------------------
       * Sticky CTA
       *
       * Rendered globally at the bottom.
       * --------------------------------------------------------------------
       */

      case "sticky-cta":
        return null;

      default:
        return null;
    }

    /*
     * ----------------------------------------------------------------------
     * Per-section effects
     * ----------------------------------------------------------------------
     */

    const effect =
      section.effect;

    const intensity =
      section.effectIntensity ||
      "medium";

    const speedMap = {
      low: 0.08,
      medium: 0.18,
      high: 0.35,
    };

    const tiltMap = {
      low: 4,
      medium: 8,
      high: 14,
    };

    let result: React.ReactNode =
      inner;

    if (
      effect &&
      effect !== "none"
    ) {
      const reveal =
        effectToReveal(
          effect,
        );

      let wrapped: React.ReactNode =
        inner;

      if (
        effect === "tilt"
      ) {
        wrapped = (
          <TiltCard
            key={`tilt-${section.type}`}
            intensity={
              tiltMap[intensity]
            }
          >
            {inner}
          </TiltCard>
        );
      } else if (
        effect === "parallax"
      ) {
        wrapped = (
          <ParallaxSection
            key={`px-${section.type}`}
            speed={
              speedMap[intensity]
            }
          >
            {inner}
          </ParallaxSection>
        );
      } else if (
        effectClassMap[effect]
      ) {
        wrapped = (
          <div
            key={`fx-${section.type}`}
            className={
              effectClassMap[
                effect
              ]
            }
          >
            {inner}
          </div>
        );
      }

      if (reveal) {
        result = (
          <ScrollReveal
            key={`r-${section.type}`}
            direction={reveal}
          >
            {wrapped}
          </ScrollReveal>
        );
      } else {
        result = wrapped;
      }
    } else if (is3D) {
      /*
       * Legacy 3D behaviour when the storefront is configured as 3D
       * without an explicit section effect.
       */

      result = (
        <ScrollReveal
          key={`r-${section.type}`}
          direction={defaultDir}
        >
          <ParallaxSection speed={0.15}>
            {inner}
          </ParallaxSection>
        </ScrollReveal>
      );
    }

    /*
     * ----------------------------------------------------------------------
     * Per-section layout
     * ----------------------------------------------------------------------
     */

    const layoutCls = [
      widthClass(
        section.width,
      ),
      spacingClass(
        section.spacing,
      ),
      alignClass(
        section.align,
      ),
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        key={`layout-${section.type}`}
        className={layoutCls}
      >
        {result}
      </div>
    );
  };

  /*
   * --------------------------------------------------------------------------
   * Storefront
   * --------------------------------------------------------------------------
   *
   * CartProvider and StorefrontProvider remain here for the classic
   * storefront because BoutiquePublic does not wrap StorefrontPreview
   * with those providers.
   *
   * In Studio mode, BoutiquePublic supplies the providers itself because
   * StudioSceneRenderer is rendered directly instead of through this
   * component.
   * --------------------------------------------------------------------------
   */

  return (
    <StorefrontProvider
      boutiqueId={
        boutiqueId ?? ""
      }
      boutiqueName={
        boutiqueName
      }
      boutiqueSlug={
        boutiqueSlug
      }
    >
      <CartProvider>
        <div
          className={`min-h-screen bg-white ${
            isPreview
              ? "pointer-events-none"
              : ""
          }`}
          style={{
            fontFamily: `'${fonts.body}', sans-serif`,
          }}
        >
          {/*
           * ----------------------------------------------------------------
           * Announcement
           *
           * Always rendered first, independently from its position in
           * the configurable section list.
           * ----------------------------------------------------------------
           */}

          {(() => {
            const announcement =
              sections.find(
                (section) =>
                  section.type ===
                    "announcement" &&
                  section.enabled,
              );

            if (!announcement) {
              return null;
            }

            return (
              <StorefrontAnnouncement
                message={
                  announcement.data
                    ?.message
                }
                emoji={
                  announcement.data
                    ?.emoji
                }
                primaryColor={
                  primaryColor
                }
              />
            );
          })()}

          {/*
           * ----------------------------------------------------------------
           * Header
           * ----------------------------------------------------------------
           */}

          <StorefrontHeader
            boutiqueName={
              boutiqueName
            }
            primaryColor={
              primaryColor
            }
            boutiqueSlug={
              boutiqueSlug
            }
          />

          {/*
           * ----------------------------------------------------------------
           * Configured sections
           * ----------------------------------------------------------------
           *
           * Drag-and-drop order from the boutique Studio is preserved.
           * ----------------------------------------------------------------
           */}

          {sections.map(
            (
              section,
              index,
            ) =>
              renderSection(
                section,
                index,
              ),
          )}

          {/*
           * ----------------------------------------------------------------
           * Cart
           * ----------------------------------------------------------------
           *
           * This exists only on the actual boutique storefront.
           * It is never part of the BIB Store discovery pages.
           * ----------------------------------------------------------------
           */}

          {boutiqueId && (
            <CartDrawer
              primaryColor={
                primaryColor
              }
              boutiqueId={
                boutiqueId
              }
              boutiqueName={
                boutiqueName
              }
            />
          )}

          {/*
           * ----------------------------------------------------------------
           * Footer
           * ----------------------------------------------------------------
           */}

          <StorefrontFooter
            primaryColor={
              primaryColor
            }
          />

          {/*
           * ----------------------------------------------------------------
           * Sticky CTA
           *
           * Fixed CTA is rendered last and is not part of the normal
           * section ordering.
           * ----------------------------------------------------------------
           */}

          {(() => {
            const cta =
              sections.find(
                (section) =>
                  section.type ===
                    "sticky-cta" &&
                  section.enabled,
              );

            if (
              !cta ||
              isPreview
            ) {
              return null;
            }

            return (
              <StorefrontStickyCTA
                label={
                  cta.data?.label
                }
                anchor={
                  cta.data?.anchor ||
                  "products"
                }
                primaryColor={
                  primaryColor
                }
                secondaryColor={
                  secondaryColor
                }
              />
            );
          })()}
        </div>
      </CartProvider>
    </StorefrontProvider>
  );
}
