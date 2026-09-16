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
import { useSEO, buildLocaleAlternates } from "@/hooks/useSEO";

import { trackStorefrontEvent } from "@/lib/storefrontTracking";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";

import { Loader2 } from "lucide-react";

export default function BoutiquePublic() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  /*
   * --------------------------------------------------------------------------
   * Boutique
   * --------------------------------------------------------------------------
   */

  const {
    data: boutique,
    isLoading: boutiqueLoading,
    error,
  } = useQuery({
    queryKey: ["public-boutique", slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;

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
   * These products belong to the boutique storefront itself.
   * BIB Store only exposes/discovers them; checkout happens here.
   * --------------------------------------------------------------------------
   */

  const {
    data: products = [],
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ["public-boutique-products", boutique?.id],

    queryFn: async () => {
      if (!boutique?.id) return [];

      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          public_price,
          status,
          cumulative_sales,
          supplier_products (
            name,
            image_url
          )
        `)
        .eq("boutique_id", boutique.id)
        .eq("status", "active")
        .order("cumulative_sales", { ascending: false })
        .limit(8);

      if (error) throw error;

      const productIds = data.map((product) => product.id);

      let mediaByProduct: Record<string, string[]> = {};

      if (productIds.length > 0) {
        const { data: media } = await supabase
          .from("product_media" as any)
          .select("product_id,url,position")
          .in("product_id", productIds)
          .eq("is_selected", true)
          .order("position", { ascending: true });

        for (const item of (media as any[] | null) ?? []) {
          (mediaByProduct[item.product_id] ||= []).push(item.url);
        }
      }

      return data.map((product, index) => {
        const gallery = mediaByProduct[product.id] ?? [];

        const fallback =
          product.supplier_products?.image_url ?? null;

        const images =
          gallery.length > 0
            ? gallery
            : fallback
              ? [fallback]
              : [];

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
   * SEO
   * --------------------------------------------------------------------------
   */

  useSEO({
    title: boutique?.name || "Boutique",

    description:
      boutique?.description ||
      `Découvrez ${boutique?.name || "cette boutique"} sur Brand-In-A-Box.`,

    image:
      boutique?.cover_image_url ||
      boutique?.logo_url ||
      undefined,

    type: "store",

    keywords: [
      boutique?.name,
      boutique?.category,
      "boutique en ligne",
      "Brand-In-A-Box",
      "BIB",
    ].filter(Boolean) as string[],

    alternates: buildLocaleAlternates(),

    jsonLd: boutique
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Store",

            name: boutique.name,

            description:
              boutique.description || undefined,

            image:
              boutique.cover_image_url ||
              boutique.logo_url ||
              undefined,

            logo:
              boutique.logo_url ||
              undefined,

            slogan:
              boutique.tagline ||
              undefined,

            url:
              typeof window !== "undefined"
                ? window.location.href
                : undefined,

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

            url:
              typeof window !== "undefined"
                ? window.location.href
                : undefined,

            logo:
              boutique.logo_url ||
              undefined,
          },

          {
            "@context": "https://schema.org",
            "@type": "WebSite",

            name: boutique.name,

            url:
              typeof window !== "undefined"
                ? window.location.href
                : undefined,
          },

          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",

            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "BIB",
                item:
                  typeof window !== "undefined"
                    ? window.location.origin
                    : undefined,
              },

              {
                "@type": "ListItem",
                position: 2,
                name: "Store",
                item:
                  typeof window !== "undefined"
                    ? `${window.location.origin}/store`
                    : undefined,
              },

              {
                "@type": "ListItem",
                position: 3,
                name: boutique.name,
                item:
                  typeof window !== "undefined"
                    ? window.location.href
                    : undefined,
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
    if (!boutique?.id) return;

    trackStorefrontEvent(
      boutique.id,
      "boutique_view",
    );
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
            Chargement de la boutique...
          </p>
        </div>
      </div>
    );
  }

  /*
   * --------------------------------------------------------------------------
   * Not found
   * --------------------------------------------------------------------------
   */

  if (error || !boutique) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <div className="max-w-md text-center">
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Boutique introuvable
          </h1>

          <p className="text-muted-foreground">
            Cette boutique n&apos;existe pas ou n&apos;est pas encore
            publiée.
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
    (boutique.theme_settings as unknown) as ThemeSettings | null;

  const ambientAudioUrl =
    themeSettings?.backgroundAudioUrl;

  const ambientVolume =
    themeSettings?.backgroundAudioVolume ?? 0.4;

  const useStudio =
    Boolean(boutique.studio_completed_at) &&
    scenes.length > 0;

  const primaryColor =
    brandDna?.generated_palette?.primary
      ? `hsl(${brandDna.generated_palette.primary})`
      : undefined;

  /*
   * --------------------------------------------------------------------------
   * Studio storefront
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

          <StorefrontFooter
            primaryColor={primaryColor}
          />

          <CartDrawer
            boutiqueId={boutique.id}
            boutiqueName={boutique.name}
            primaryColor={primaryColor}
          />

          <PageSeoInspector
            visible={
              Boolean(user) &&
              user.id === boutique.user_id
            }
            kind="boutique"
            title={boutique.name}
            description={
              boutique.description ||
              `Découvrez ${boutique.name} sur Brand-In-A-Box.`
            }
            ogImage={
              boutique.cover_image_url ||
              boutique.logo_url
            }
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
   * Default storefront preview
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

      <StorefrontAmbientAudio
        src={ambientAudioUrl}
        volume={ambientVolume}
      />

      <PageSeoInspector
        visible={
          Boolean(user) &&
          user.id === boutique.user_id
        }
        kind="boutique"
        title={boutique.name}
        description={
          boutique.description ||
          `Découvrez ${boutique.name} sur Brand-In-A-Box.`
        }
        ogImage={
          boutique.cover_image_url ||
          boutique.logo_url
        }
      />
    </>
  );
}
