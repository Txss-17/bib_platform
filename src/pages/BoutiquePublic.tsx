import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { StorefrontPreview } from "@/components/storefront/StorefrontPreview";
import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { StorefrontAmbientAudio } from "@/components/storefront/StorefrontAmbientAudio";
import { PageSeoInspector } from "@/components/storefront/PageSeoInspector";

import { CartProvider } from "@/contexts/CartContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { useAuth } from "@/contexts/AuthContext";

import { useBoutiqueScenes, useBrandDNA } from "@/hooks/useBrandStudio";
import {
  buildLocaleAlternates,
  resolvePublicOrigin,
  useSEO,
} from "@/hooks/useSEO";

import { trackStorefrontEvent } from "@/lib/storefrontTracking";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";

import { Loader2 } from "lucide-react";

interface PublicBoutiqueProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  images: string[];
  isPopular: boolean;
}

interface PublicProductRow {
  id: string;
  public_price: number | null;
  status: string;
  cumulative_sales: number | null;
  supplier_products: {
    name: string;
    image_url: string | null;
  } | null;
}

export default function BoutiquePublic() {
  useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  /*
   * --------------------------------------------------------------------------
   * Boutique
   *
   * This is the actual public storefront.
   *
   * BIB Store only discovers and presents products/boutiques.
   * The commerce experience starts here.
   * --------------------------------------------------------------------------
   */

  const {
    data: boutique,
    isLoading: boutiqueLoading,
    error: boutiqueError,
  } = useQuery({
    queryKey: ["public-boutique", slug],

    queryFn: async () => {
      if (!slug) {
        return null;
      }

      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    enabled: Boolean(slug),
  });

  /*
   * --------------------------------------------------------------------------
   * Boutique Studio
   * --------------------------------------------------------------------------
   */

  const { data: scenes = [] } = useBoutiqueScenes(boutique?.id);

  const { data: brandDna = null } = useBrandDNA(boutique?.id);

  /*
   * --------------------------------------------------------------------------
   * Products
   *
   * These are products actually commercialized by this boutique.
   *
   * Important:
   * - public_price is the customer-facing price
   * - supplier information is not exposed to the customer
   * - checkout remains inside this boutique storefront
   * - BIB Store does not perform the payment
   * --------------------------------------------------------------------------
   */

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery<PublicBoutiqueProduct[]>({
    queryKey: ["public-boutique-products", boutique?.id],

    queryFn: async () => {
      if (!boutique?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          public_price,
          status,
          cumulative_sales,
          supplier_products (
            name,
            image_url
          )
        `,
        )
        .eq("boutique_id", boutique.id)
        .eq("status", "active")
        .order("cumulative_sales", {
          ascending: false,
        })
        .limit(8);

      if (error) {
        throw error;
      }

      const rows = (data as PublicProductRow[] | null) ?? [];

      const productIds = rows.map((product) => product.id);

      /*
       * Product media
       *
       * Selected media takes priority over the supplier
       * fallback image.
       */

      const mediaByProduct: Record<string, string[]> = {};

      if (productIds.length > 0) {
        const { data: media } = await supabase
          .from("product_media" as any)
          .select("product_id,url,position")
          .in("product_id", productIds)
          .eq("is_selected", true)
          .order("position", {
            ascending: true,
          });

        for (const item of (media as any[] | null) ?? []) {
          if (!item?.product_id || !item?.url) {
            continue;
          }

          (mediaByProduct[item.product_id] ||= []).push(item.url);
        }
      }

      return rows.map((product, index) => {
        const gallery = mediaByProduct[product.id] ?? [];

        const fallback = product.supplier_products?.image_url ?? null;

        const images =
          gallery.length > 0 ? gallery : fallback ? [fallback] : [];

        return {
          id: product.id,

          name: product.supplier_products?.name ?? "Produit",

          price: Number(product.public_price ?? 0),

          image_url: images[0] ?? fallback,

          images,

          isPopular: index < 2,
        };
      });
    },

    enabled: Boolean(boutique?.id),
  });

  /*
   * --------------------------------------------------------------------------
   * SEO — configuration internationale propre à chaque boutique
   * --------------------------------------------------------------------------
   */

  const seoOrigin = resolvePublicOrigin(boutique?.seo_public_origin);

  const seoPath =
    typeof window !== "undefined"
      ? window.location.pathname
      : `/boutique/${boutique?.slug ?? ""}`;

  const seoCanonical =
    seoOrigin && seoPath ? `${seoOrigin}${seoPath}` : undefined;

  useSEO({
    title: boutique?.seo_title || boutique?.name || "Boutique",

    description:
      boutique?.seo_description ||
      boutique?.description ||
      `Découvrez ${boutique?.name || "cette boutique"} sur Brand-In-A-Box.`,

    image:
      boutique?.seo_og_image_url ||
      boutique?.cover_image_url ||
      boutique?.logo_url ||
      undefined,

    type: "store",

    canonical: seoCanonical,
    url: seoCanonical,

    keywords: [
      boutique?.name,
      boutique?.category,
      "boutique en ligne",
      "Brand-In-A-Box",
      "BIB",
    ].filter(Boolean) as string[],

    alternates: buildLocaleAlternates(
      seoPath,
      boutique?.seo_active_locales,
      boutique?.seo_default_locale,
      boutique?.seo_public_origin,
    ),

    jsonLd: boutique
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Store",
            name: boutique.name,
            description:
              boutique.seo_description || boutique.description || undefined,
            image:
              boutique.seo_og_image_url ||
              boutique.cover_image_url ||
              boutique.logo_url ||
              undefined,
            logo: boutique.logo_url || undefined,
            slogan: boutique.tagline || undefined,
            url: seoCanonical,
            makesOffer: products.slice(0, 12).map((product) => ({
              "@type": "Offer",
              name: product.name,
              price: product.price,
              priceCurrency: "EUR",
              image: product.image_url || undefined,
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: boutique.name,
            url: seoCanonical,
            logo: boutique.logo_url || undefined,
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: boutique.name,
            url: seoCanonical,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "BIB",
                item: seoOrigin || undefined,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Boutique",
                item: seoOrigin
                  ? `${seoOrigin}/boutique/${boutique.slug}`
                  : undefined,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: boutique.name,
                item: seoCanonical,
              },
            ],
          },
        ]
      : undefined,
  });

  /*
   * --------------------------------------------------------------------------
   * Analytics
   * --------------------------------------------------------------------------
   */

  useEffect(() => {
    if (!boutique?.id) {
      return;
    }

    trackStorefrontEvent(boutique.id, "boutique_view");
  }, [boutique?.id]);

  /*
   * --------------------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------------------
   */

  if (boutiqueLoading || productsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-8 w-8 animate-spin text-muted-foreground"
            aria-hidden="true"
          />

          <p className="text-muted-foreground">
            {translateUi("Chargement de la boutique...")}
          </p>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Error / Not found
   * --------------------------------------------------------------------------
   */

  if (boutiqueError || productsError || !boutique) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <div className="max-w-md text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {translateUi("Boutique introuvable")}
          </h1>

          <p className="text-muted-foreground">
            {translateUi(
              "Cette boutique n&apos;existe pas ou n&apos;est pas encore publiée.",
            )}
          </p>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Theme / Studio
   * --------------------------------------------------------------------------
   */

  const themeSettings =
    boutique.theme_settings as unknown as ThemeSettings | null;

  const ambientAudioUrl = themeSettings?.backgroundAudioUrl;

  const ambientVolume = themeSettings?.backgroundAudioVolume ?? 0.4;

  const useStudio = Boolean(boutique.studio_completed_at) && scenes.length > 0;

  const primaryColor = brandDna?.generated_palette?.primary
    ? `hsl(${brandDna.generated_palette.primary})`
    : undefined;

  const seoDescription =
    boutique.description || `Découvrez ${boutique.name} sur Brand-In-A-Box.`;

  const seoImage = boutique.cover_image_url || boutique.logo_url || null;

  /*
   * --------------------------------------------------------------------------
   * Studio storefront
   *
   * Full commercial storefront:
   * - header
   * - Studio experience
   * - product discovery
   * - cart
   * - footer
   * - ambient audio
   * --------------------------------------------------------------------------
   */

  if (useStudio) {
    return (
      <CartProvider>
        <StorefrontProvider
          boutiqueId={boutique.id}
          boutiqueName={boutique.name}
          boutiqueSlug={boutique.slug}
        >
          <StorefrontHeader
            boutiqueName={boutique.name}
            boutiqueSlug={boutique.slug}
            primaryColor={primaryColor}
          />

          <StudioSceneRenderer
            scenes={scenes}
            brandDna={brandDna}
            boutiqueName={boutique.name}
            products={products}
            boutiqueId={boutique.id}
            boutiqueSlug={boutique.slug}
          />

          <StorefrontFooter primaryColor={primaryColor} />

          <CartDrawer
            boutiqueId={boutique.id}
            boutiqueName={boutique.name}
            primaryColor={primaryColor}
          />

          <PageSeoInspector
            visible={Boolean(user) && user.id === boutique.user_id}
            canonical={seoCanonical}
            activeLocales={boutique?.seo_active_locales}
            defaultLocale={boutique?.seo_default_locale}
            kind="boutique"
            title={boutique.name}
            description={seoDescription}
            ogImage={seoImage}
          />

          <StorefrontAmbientAudio
            src={ambientAudioUrl}
            volume={ambientVolume}
          />
        </StorefrontProvider>
      </CartProvider>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Default storefront
   *
   * The boutique may not have a completed Studio yet.
   * It remains a real storefront and must therefore retain
   * its commercial/cart behaviour through StorefrontPreview.
   * --------------------------------------------------------------------------
   */

  return (
    <>
      <StorefrontPreview
        boutiqueName={boutique.name}
        boutiqueId={boutique.id}
        boutiqueSlug={boutique.slug}
        category={boutique.category}
        themeSettings={themeSettings}
        products={products}
      />

      <StorefrontAmbientAudio src={ambientAudioUrl} volume={ambientVolume} />

      <PageSeoInspector
        visible={Boolean(user) && user.id === boutique.user_id}
        canonical={seoCanonical}
        activeLocales={boutique?.seo_active_locales}
        defaultLocale={boutique?.seo_default_locale}
        kind="boutique"
        title={boutique.name}
        description={seoDescription}
        ogImage={seoImage}
      />
    </>
  );
}
