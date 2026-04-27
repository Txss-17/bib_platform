import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StorefrontPreview } from "@/components/storefront/StorefrontPreview";
import { useSEO } from "@/hooks/useSEO";
import { Loader2 } from "lucide-react";
import type { ThemeSettings } from "@/lib/boutiqueTemplates";
import { trackStorefrontEvent } from "@/lib/storefrontTracking";

export default function BoutiquePublic() {
  const { slug } = useParams<{ slug: string }>();

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

  // SEO
  useSEO({
    title: boutique?.name || "Boutique",
    description: boutique?.description || `Découvrez ${boutique?.name || "notre boutique"} sur Brand-In-A-Box. Livraison incluse sur tous les produits.`,
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

  return (
    <StorefrontPreview
      boutiqueName={boutique.name}
      boutiqueId={boutique.id}
      boutiqueSlug={boutique.slug}
      category={boutique.category}
      themeSettings={themeSettings}
      products={products}
    />
  );
}
