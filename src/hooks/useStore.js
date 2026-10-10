import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function normalizeText(value, fallback) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || fallback;
}
function normalizeStories(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (story) => {
      if (!story || typeof story !== "object") {
        return false;
      }
      const item = story;
      return typeof item.id === "string" && item.id.length > 0 && (item.kind === "image" || item.kind === "video") && typeof item.url === "string" && item.url.length > 0;
    }
  );
}
function normalizeStoreProduct(product) {
  const supplierProduct = product.supplier_products;
  const boutique = product.boutiques;
  return {
    id: product.id,
    name: normalizeText(
      supplierProduct?.name,
      "Produit"
    ),
    description: supplierProduct?.description ?? null,
    image_url: supplierProduct?.image_url ?? null,
    price: Number(
      product.public_price ?? 0
    ),
    boutique_id: boutique?.id ?? "",
    boutique_name: normalizeText(
      boutique?.name,
      "Boutique"
    ),
    boutique_slug: boutique?.slug ?? "",
    boutique_category: normalizeText(
      boutique?.category,
      "Autres"
    ),
    created_at: product.created_at
  };
}
function useStoreBoutiques() {
  return useQuery({
    queryKey: ["store-boutiques"],
    queryFn: async () => {
      const { data, error } = await supabase.from("boutiques").select(`
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
          `).eq("status", "published").eq(
        "products.status",
        "active"
      ).order("created_at", {
        ascending: false
      });
      if (error) {
        throw error;
      }
      const rows = data ?? [];
      return rows.map(
        (boutique) => {
          const products = boutique.products ?? [];
          const productPreviews = products.slice(0, 8).map(
            (product) => ({
              id: product.id,
              name: normalizeText(
                product.supplier_products?.name,
                "Produit"
              ),
              image_url: product.supplier_products?.image_url ?? null,
              price: Number(
                product.public_price ?? 0
              )
            })
          );
          const totalSales = products.reduce(
            (total, product) => total + Number(
              product.cumulative_sales ?? 0
            ),
            0
          );
          const orders = boutique.orders ?? [];
          const market = orders.find(
            (order) => typeof order.market === "string" && order.market.trim().length > 0
          )?.market ?? "EU";
          const recyclingPoints = (boutique.recycling_scans ?? []).reduce(
            (total, scan) => total + Number(
              scan.points ?? 0
            ),
            0
          );
          return {
            id: boutique.id,
            name: normalizeText(
              boutique.name,
              "Boutique"
            ),
            slug: boutique.slug,
            category: normalizeText(
              boutique.category,
              "Autres"
            ),
            description: boutique.description ?? null,
            tagline: boutique.tagline ?? null,
            logo_url: boutique.logo_url ?? null,
            cover_image_url: boutique.cover_image_url ?? null,
            has_protection: boutique.has_protection ?? false,
            product_count: products.length,
            product_previews: productPreviews,
            stories: normalizeStories(
              boutique.highlight_media
            ),
            market,
            created_at: boutique.created_at,
            total_sales: totalSales,
            recycling_points: recyclingPoints
          };
        }
      );
    }
  });
}
function useStoreProducts() {
  return useQuery({
    queryKey: ["store-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select(`
            id,
            public_price,
            status,
            created_at,
            supplier_products (
              name,
              description,
              image_url
            ),
            boutiques!inner (
              id,
              name,
              slug,
              category,
              status
            )
          `).eq("status", "active").eq(
        "boutiques.status",
        "published"
      ).order("created_at", {
        ascending: false
      });
      if (error) {
        throw error;
      }
      const rows = data ?? [];
      return rows.filter(
        (product) => Boolean(
          product.boutiques?.id
        ) && Boolean(
          product.boutiques?.slug
        )
      ).map(normalizeStoreProduct);
    }
  });
}
function useStoreProduct(productId) {
  return useQuery({
    queryKey: [
      "store-product",
      productId
    ],
    enabled: Boolean(productId),
    queryFn: async () => {
      if (!productId) {
        throw new Error(
          "productId is required"
        );
      }
      const { data, error } = await supabase.from("products").select(`
              id,
              public_price,
              status,
              created_at,
              supplier_products (
                name,
                description,
                image_url
              ),
              boutiques!inner (
                id,
                name,
                slug,
                category,
                status
              )
            `).eq("id", productId).eq("status", "active").eq(
        "boutiques.status",
        "published"
      ).single();
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error(
          "Produit introuvable"
        );
      }
      const product = data;
      if (!product.boutiques?.id || !product.boutiques?.slug) {
        throw new Error(
          "Boutique du produit introuvable"
        );
      }
      return normalizeStoreProduct(
        product
      );
    }
  });
}
export {
  useStoreBoutiques,
  useStoreProduct,
  useStoreProducts
};
