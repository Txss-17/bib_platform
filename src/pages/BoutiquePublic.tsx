import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StorefrontPreview } from "@/components/storefront/StorefrontPreview";
import { StudioSceneRenderer } from "@/components/storefront/StudioSceneRenderer";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { CartProvider } from "@/contexts/CartContext";
import { StorefrontProvider } from "@/contexts/StorefrontContext";
import { useBoutiqueScenes, useBrandDNA } from "@/hooks/useBrandStudio";
import { useSEO, buildLocaleAlternates } from "@/hooks/useSEO";
import { Loader2 } from "lucide-react";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";
import { PageSeoInspector } from "@/components/storefront/PageSeoInspector";
import { useAuth } from "@/contexts/AuthContext";

export default function BoutiquePublic() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const { data: boutique, isLoading: boutiqueLoading, error } = useQuery({
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
    enabled: !!slug,
  });

  const { data: scenes = [] } = useBoutiqueScenes(boutique?.id);
  const { data: brandDna = null } = useBrandDNA(boutique?.id);

  const { data: products = [], isLoading: productsLoading } = useQuery({
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
      return data.map((p, index) => ({
        id: p.id,
        name: p.supplier_products?.name || "Produit",
        price: Number(p.public_price),
        image_url: p.supplier_products?.image_url,
        isPopular: index < 2,
      }));
    },
    enabled: !!boutique?.id,
  });

  // SEO — store-level metadata + JSON-LD
  useSEO({
    title: boutique?.name || "Boutique",
    description:
      boutique?.description ||
      `Découvrez ${boutique?.name || "notre boutique"} sur Brand-In-A-Box. Livraison incluse sur tous les produits.`,
    image: boutique?.cover_image_url || boutique?.logo_url || undefined,
    type: "store",
    keywords: [
      boutique?.name,
      boutique?.category,
      "boutique en ligne",
      "Brand-In-A-Box",
    ].filter(Boolean) as string[],
    alternates: buildLocaleAlternates(),
    jsonLd: boutique
      ? {
          "@context": "https://schema.org",
          "@type": "Store",
          name: boutique.name,
          description: boutique.description || undefined,
          image: boutique.cover_image_url || boutique.logo_url || undefined,
          logo: boutique.logo_url || undefined,
          slogan: boutique.tagline || undefined,
          url:
            typeof window !== "undefined"
              ? `${window.location.origin}${window.location.pathname}`
              : undefined,
          makesOffer: products?.slice(0, 12).map((p) => ({
            "@type": "Offer",
            name: p.name,
            price: p.price,
            priceCurrency: "EUR",
            image: p.image_url || undefined,
          })),
        }
      : undefined,
  });

  // Realtime analytics: log a boutique view as soon as the published page loads.
  useEffect(() => {
    if (boutique?.id) {
      trackStorefrontEvent(boutique.id, "boutique_view");
    }
  }, [boutique?.id]);

  if (boutiqueLoading || productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="text-gray-600">Chargement de la boutique...</p>
        </div>
      </div>
    );
  }

  if (error || !boutique) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Boutique introuvable</h1>
          <p className="text-gray-600">Cette boutique n'existe pas ou n'est pas encore publiée.</p>
        </div>
      </div>
    );
  }

  const themeSettings = (boutique.theme_settings as unknown) as ThemeSettings | null;

  const useStudio = !!boutique.studio_completed_at && scenes.length > 0;

  // Inject studio JSON-LD if SEO Copilot was run
  // (handled separately via useSEO above for store-level data)

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
            primaryColor={
              brandDna?.generated_palette?.primary
                ? `hsl(${brandDna.generated_palette.primary})`
                : undefined
            }
          />
          <StudioSceneRenderer
            scenes={scenes}
            brandDna={brandDna}
            boutiqueName={boutique.name}
            products={products}
          />
          <StorefrontFooter
            primaryColor={
              brandDna?.generated_palette?.primary
                ? `hsl(${brandDna.generated_palette.primary})`
                : undefined
            }
          />
          <CartDrawer
            boutiqueId={boutique.id}
            boutiqueName={boutique.name}
            primaryColor={
              brandDna?.generated_palette?.primary
                ? `hsl(${brandDna.generated_palette.primary})`
                : undefined
            }
          />
          <PageSeoInspector
            visible={!!user && user.id === boutique.user_id}
            kind="boutique"
            title={boutique.name}
            description={
              boutique.description ||
              `Découvrez ${boutique.name} sur Brand-In-A-Box.`
            }
            ogImage={boutique.cover_image_url || boutique.logo_url}
          />
        </StorefrontProvider>
      </CartProvider>
    );
  }

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
    <PageSeoInspector
      visible={!!user && user.id === boutique.user_id}
      kind="boutique"
      title={boutique.name}
      description={
        boutique.description ||
        `Découvrez ${boutique.name} sur Brand-In-A-Box. Livraison incluse sur tous les produits.`
      }
      ogImage={boutique.cover_image_url || boutique.logo_url}
    />
    </>
  );
}
