import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Loader2,
  RotateCcw,
  Shield,
  ShoppingCart,
  Truck,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useCart } from "@/contexts/CartContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { PageSeoInspector } from "@/components/storefront/PageSeoInspector";
import { StorefrontAmbientAudio } from "@/components/storefront/StorefrontAmbientAudio";
import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";

import { useAuth } from "@/contexts/AuthContext";
import { useSEO, buildLocaleAlternates } from "@/hooks/useSEO";
import { useBrandDNA } from "@/hooks/useBrandStudio";
import { usePublicProductMedia } from "@/hooks/useProductMedia";

import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import type { SceneRecord } from "@/lib/studioScenes";

import { PRODUCT_PAGE_SLUG } from "@/lib/pageTemplates";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";

// ============================================================
// PAGE
// ============================================================

export default function ProductPublic() {
  const {
    slug,
    productId,
  } = useParams<{
    slug: string;
    productId: string;
  }>();

  const { user } = useAuth();
  const { addItem } = useCart();

  // ==========================================================
  // BOUTIQUE
  // ==========================================================

  const {
    data: boutique,
  } = useQuery({
    queryKey: ["public-boutique", slug],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .select("*")
        .eq("slug", slug!)
        .eq("status", "published")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    enabled: Boolean(slug),
  });

  // ==========================================================
  // PRODUCT
  // ==========================================================

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["public-product", productId],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          public_price,
          status,
          cumulative_sales,
          supplier_products (
            name,
            image_url,
            description,
            category
          )
        `)
        .eq("id", productId!)
        .eq("status", "active")
        .single();

      if (error) {
        throw error;
      }

      return data;
    },

    enabled: Boolean(productId),
  });

  // ==========================================================
  // PRODUCT DATA
  // ==========================================================

  const themeSettings =
    (boutique?.theme_settings as unknown) as ThemeSettings | null;

  const primaryColor =
    themeSettings?.primaryColor || "#3b82f6";

  const productName =
    product?.supplier_products?.name || "Produit";

  const productDescription =
    product?.supplier_products?.description || "";

  const productPrice =
    Number(product?.public_price || 0);

  // ==========================================================
  // PRODUCT MEDIA
  // ==========================================================

  const {
    data: customMedia = [],
  } = usePublicProductMedia(product?.id);

  const productImage =
    customMedia[0]?.url ??
    product?.supplier_products?.image_url;

  const galleryImages =
    customMedia.length > 0
      ? customMedia.map((media) => media.url)
      : productImage
        ? [productImage]
        : [];

  // ==========================================================
  // BRAND STUDIO
  // ==========================================================

  const {
    data: brandDna,
  } = useBrandDNA(boutique?.id);

  const {
    data: productPageScenes = [],
  } = useQuery({
    queryKey: [
      "product-page-template",
      boutique?.id,
    ],

    enabled: Boolean(boutique?.id),

    queryFn: async () => {
      const { data: page } = await supabase
        .from("boutique_pages" as any)
        .select("id")
        .eq("boutique_id", boutique!.id)
        .eq("slug", PRODUCT_PAGE_SLUG)
        .maybeSingle();

      const pageId =
        (page as any)?.id as string | undefined;

      if (!pageId) {
        return [] as SceneRecord[];
      }

      const {
        data: scenes,
      } = await supabase
        .from("boutique_scenes")
        .select("*")
        .eq("boutique_id", boutique!.id)
        .eq("page_id", pageId)
        .eq("is_visible", true)
        .order("position", {
          ascending: true,
        });

      return (
        (scenes as unknown as SceneRecord[]) ?? []
      );
    },
  });

  // ==========================================================
  // SEO
  // ==========================================================

  useSEO({
    title: boutique
      ? `${productName} — ${boutique.name}`
      : productName,

    description:
      productDescription ||
      `Découvrez ${productName} sur ${
        boutique?.name || "Brand-In-A-Box"
      }.`,

    image:
      productImage || undefined,

    type: "product",

    keywords: [
      productName,
      boutique?.name,
      boutique?.category,
      "achat en ligne",
    ].filter(Boolean) as string[],

    alternates: buildLocaleAlternates(),

    jsonLd: product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",

          name: productName,

          description:
            productDescription || undefined,

          image:
            productImage || undefined,

          sku: product.id,

          brand: boutique
            ? {
                "@type": "Brand",
                name: boutique.name,
              }
            : undefined,

          offers: {
            "@type": "Offer",
            price: productPrice,
            priceCurrency: "EUR",
            availability:
              "https://schema.org/InStock",

            url:
              typeof window !== "undefined"
                ? `${window.location.origin}${window.location.pathname}`
                : undefined,

            seller: boutique
              ? {
                  "@type": "Organization",
                  name: boutique.name,
                }
              : undefined,
          },
        }
      : undefined,
  });

  // ==========================================================
  // ANALYTICS
  // ==========================================================

  useEffect(() => {
    if (!boutique?.id || !product?.id) {
      return;
    }

    trackStorefrontEvent(
      boutique.id,
      "product_view",
      {
        productId: product.id,
      },
    );
  }, [
    boutique?.id,
    product?.id,
  ]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Produit introuvable
          </h1>

          <p className="mb-4 text-gray-600">
            Ce produit n'existe pas ou n'est plus disponible.
          </p>

          {slug && (
            <Button
              asChild
              variant="outline"
            >
              <Link to={`/boutique/${slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la boutique
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================================
  // ADD TO BOUTIQUE CART
  // ==========================================================

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: productName,
      price: productPrice,
      image_url: productImage || null,
    });

    if (boutique?.id) {
      trackStorefrontEvent(
        boutique.id,
        "add_to_cart",
        {
          productId: product.id,
        },
      );
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <StorefrontProvider
      boutiqueId={boutique?.id ?? ""}
      boutiqueName={boutique?.name ?? ""}
      boutiqueSlug={boutique?.slug ?? slug}
    >
      <div className="flex min-h-screen flex-col bg-white">
        {/* ======================================================
            BOUTIQUE HEADER
        ====================================================== */}

        {boutique && (
          <>
            <StorefrontHeader
              boutiqueName={boutique.name}
              primaryColor={primaryColor}
            />

            <CartDrawer
              primaryColor={primaryColor}
              boutiqueId={boutique.id}
              boutiqueName={boutique.name}
            />
          </>
        )}

        {/* ======================================================
            MAIN
        ====================================================== */}

        <main className="flex-1">
          {productPageScenes.length > 0 ? (
            <StudioSceneRenderer
              scenes={productPageScenes}
              brandDna={brandDna ?? null}
              boutiqueName={boutique?.name ?? ""}
              products={[
                {
                  id: product.id,
                  name: productName,
                  price: productPrice,
                  image_url:
                    productImage ?? null,
                },
              ]}
              boutiqueId={boutique?.id}
            />
          ) : (
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-12 lg:px-8">
              {/* ==================================================
                  BREADCRUMB
              ================================================== */}

              {slug && (
                <Link
                  to={`/boutique/${slug}`}
                  className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la boutique
                </Link>
              )}

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
                {/* =================================================
                    IMAGE GALLERY
                ================================================= */}

                <ProductImageGallery
                  images={galleryImages}
                  alt={productName}
                />

                {/* =================================================
                    PRODUCT DETAILS
                ================================================= */}

                <div className="flex flex-col">
                  {product.supplier_products?.category && (
                    <Badge
                      variant="secondary"
                      className="mb-3 w-fit"
                    >
                      {product.supplier_products.category}
                    </Badge>
                  )}

                  <h1 className="mb-3 text-2xl font-bold text-gray-900 md:text-3xl">
                    {productName}
                  </h1>

                  <div className="mb-4 flex items-baseline gap-3">
                    <span
                      className="text-3xl font-bold"
                      style={{
                        color: primaryColor,
                      }}
                    >
                      {productPrice.toFixed(2)} €
                    </span>

                    <span className="text-sm text-gray-500">
                      Livraison incluse
                    </span>
                  </div>

                  {product.cumulative_sales > 0 && (
                    <p className="mb-4 text-sm text-gray-500">
                      <Check
                        className="mr-1 inline h-4 w-4"
                        style={{
                          color: primaryColor,
                        }}
                      />

                      {product.cumulative_sales} vendu
                      {product.cumulative_sales > 1
                        ? "s"
                        : ""}
                    </p>
                  )}

                  {productDescription && (
                    <p className="mb-6 leading-relaxed text-gray-600">
                      {productDescription}
                    </p>
                  )}

                  {/* =================================================
                      BOUTIQUE CART ACTION
                  ================================================= */}

                  <Button
                    size="lg"
                    className="mb-6 w-full gap-2 text-white md:w-auto"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Ajouter au panier
                  </Button>

                  {/* =================================================
                      TRUST INFORMATION
                  ================================================= */}

                  <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <TrustItem
                      icon={
                        <Truck className="h-5 w-5 text-gray-600" />
                      }
                      title="Livraison incluse"
                      description="Offerte sur ce produit"
                    />

                    <TrustItem
                      icon={
                        <Shield className="h-5 w-5 text-gray-600" />
                      }
                      title="Paiement sécurisé"
                      description="Transaction protégée"
                    />

                    <TrustItem
                      icon={
                        <RotateCcw className="h-5 w-5 text-gray-600" />
                      }
                      title="Retours faciles"
                      description="14 jours pour changer d'avis"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ======================================================
            FOOTER / AMBIENT / SEO
        ====================================================== */}

        <StorefrontFooter
          primaryColor={primaryColor}
        />

        <StorefrontAmbientAudio
          src={themeSettings?.backgroundAudioUrl}
          volume={
            themeSettings?.backgroundAudioVolume ?? 0.4
          }
        />

        <PageSeoInspector
          visible={
            !!user &&
            !!boutique &&
            user.id === boutique.user_id
          }
          kind="product"
          title={
            boutique
              ? `${productName} — ${boutique.name}`
              : productName
          }
          description={
            productDescription ||
            `Découvrez ${productName} sur ${
              boutique?.name || "Brand-In-A-Box"
            }.`
          }
          ogImage={productImage}
        />
      </div>
    </StorefrontProvider>
  );
}

// ============================================================
// TRUST ITEM
// ============================================================

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
      {icon}

      <div>
        <p className="text-xs font-medium text-gray-900">
          {title}
        </p>

        <p className="text-xs text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// PRODUCT IMAGE GALLERY
// ============================================================

function ProductImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  const safeIndex = Math.min(
    active,
    Math.max(images.length - 1, 0),
  );

  const heroImage = images[safeIndex];

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-2xl bg-gray-50">
        {heroImage ? (
          <img
            src={heroImage}
            alt={alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <span className="text-lg">
              Image du produit
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Visuel ${index + 1}`}
              className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                index === safeIndex
                  ? "border-gray-900"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
