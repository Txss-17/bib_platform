import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MarketplaceProductPreview {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
}

export interface MarketplaceBoutique {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  tagline: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  has_protection: boolean;
  product_count: number;
  product_previews: MarketplaceProductPreview[];
}

/**
 * Fetches all published boutiques with up to 8 active products
 * for the marketplace home (cards + story strip).
 */
export function useMarketplaceBoutiques() {
  return useQuery({
    queryKey: ["marketplace-boutiques"],
    queryFn: async (): Promise<MarketplaceBoutique[]> => {
      const { data: boutiques, error } = await supabase
        .from("boutiques")
        .select(`
          id, name, slug, category, description, tagline,
          logo_url, cover_image_url, has_protection,
          products!inner (
            id,
            public_price,
            status,
            supplier_products ( name, image_url )
          )
        `)
        .eq("status", "published")
        .eq("products.status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (boutiques ?? []).map((b: any) => {
        const previews: MarketplaceProductPreview[] = (b.products ?? [])
          .slice(0, 8)
          .map((p: any) => ({
            id: p.id,
            name: p.supplier_products?.name ?? "Produit",
            image_url: p.supplier_products?.image_url ?? null,
            price: Number(p.public_price),
          }));

        return {
          id: b.id,
          name: b.name,
          slug: b.slug,
          category: b.category,
          description: b.description,
          tagline: b.tagline,
          logo_url: b.logo_url,
          cover_image_url: b.cover_image_url,
          has_protection: b.has_protection,
          product_count: (b.products ?? []).length,
          product_previews: previews,
        };
      });
    },
  });
}
