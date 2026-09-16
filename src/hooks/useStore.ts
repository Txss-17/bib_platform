import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreProductPreview {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
}

export interface StoreStory {
  id: string;
  kind: "image" | "video";
  url: string;
  label?: string;
  cta_url?: string;
  enabled?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface StoreBoutique {
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
  product_previews: StoreProductPreview[];

  /**
   * Stories publiées depuis le StudioEditor / HighlightsManager.
   *
   * Source DB :
   * boutiques.highlight_media
   */
  stories: StoreStory[];

  market: string;
  created_at: string;

  total_sales: number;
  recycling_points: number;
}

function normalizeStories(value: unknown): StoreStory[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((story): story is StoreStory => {
    if (!story || typeof story !== "object") {
      return false;
    }

    const item = story as Partial<StoreStory>;

    return (
      typeof item.id === "string" &&
      (item.kind === "image" || item.kind === "video") &&
      typeof item.url === "string" &&
      item.url.length > 0
    );
  });
}

export function useStoreBoutiques() {
  return useQuery({
    queryKey: ["store-boutiques"],

    queryFn: async (): Promise<StoreBoutique[]> => {
      const { data: boutiques, error } = await supabase
        .from("boutiques")
        .select(`
          id,
          name,
          slug,
          category,
          description,
          tagline,
          logo_url,
          cover_image_url,
          has_protection,
          highlight_media,
          created_at,
          products!inner (
            id,
            public_price,
            status,
            cumulative_sales,
            supplier_products (
              name,
              image_url
            )
          ),
          orders (
            id,
            market
          ),
          recycling_scans (
            points
          )
        `)
        .eq("status", "published")
        .eq("products.status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (boutiques ?? []).map((boutique: any): StoreBoutique => {
        const products = boutique.products ?? [];

        const productPreviews: StoreProductPreview[] = products
          .slice(0, 8)
          .map((product: any) => ({
            id: product.id,
            name:
              product.supplier_products?.name ??
              "Produit",
            image_url:
              product.supplier_products?.image_url ??
              null,
            price: Number(product.public_price ?? 0),
          }));

        const totalSales = products.reduce(
          (total: number, product: any) =>
            total +
            Number(product.cumulative_sales ?? 0),
          0,
        );

        const orders = boutique.orders ?? [];

        const market =
          orders[0]?.market ??
          "EU";

        const recyclingPoints = (
          boutique.recycling_scans ?? []
        ).reduce(
          (total: number, scan: any) =>
            total +
            Number(scan.points ?? 0),
          0,
        );

        const stories = normalizeStories(
          boutique.highlight_media,
        );

        return {
          id: boutique.id,
          name: boutique.name,
          slug: boutique.slug,
          category: boutique.category,
          description: boutique.description,
          tagline: boutique.tagline,
          logo_url: boutique.logo_url,
          cover_image_url: boutique.cover_image_url,

          has_protection:
            boutique.has_protection ?? false,

          product_count: products.length,
          product_previews: productPreviews,

          stories,

          market,
          created_at: boutique.created_at,

          total_sales: totalSales,
          recycling_points: recyclingPoints,
        };
      });
    },
  });
}
