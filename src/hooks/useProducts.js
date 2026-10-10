import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
function getProductCommercialState(product, now = /* @__PURE__ */ new Date()) {
  const publicPrice = Number(product.public_price ?? 0);
  const salePrice = product.sale_price !== null && product.sale_price !== void 0 ? Number(product.sale_price) : null;
  const promotionStartsAt = product.promotion_starts_at ?? null;
  const promotionEndsAt = product.promotion_ends_at ?? null;
  const startsAt = promotionStartsAt ? new Date(promotionStartsAt) : null;
  const endsAt = promotionEndsAt ? new Date(promotionEndsAt) : null;
  const promotionActive = salePrice !== null && salePrice >= 0 && salePrice < publicPrice && (!startsAt || now >= startsAt) && (!endsAt || now <= endsAt);
  const currentPrice = promotionActive ? salePrice : publicPrice;
  const discountPercent = promotionActive && publicPrice > 0 ? Math.round(
    (publicPrice - currentPrice) / publicPrice * 100
  ) : 0;
  const stockQuantity = Number(product.stock_quantity ?? 0);
  const lowStockThreshold = Number(
    product.low_stock_threshold ?? 0
  );
  return {
    publicPrice,
    salePrice,
    currentPrice,
    discountPercent,
    promotionActive,
    promotionLabel: product.promotion_label ?? null,
    promotionStartsAt,
    promotionEndsAt,
    isOutOfStock: stockQuantity <= 0,
    isLowStock: stockQuantity > 0 && lowStockThreshold > 0 && stockQuantity <= lowStockThreshold
  };
}
function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        return [];
      }
      const { data: boutiques, error: boutiquesError } = await supabase.from("boutiques").select("id").eq("user_id", user.id);
      if (boutiquesError) {
        throw boutiquesError;
      }
      const boutiqueIds = (boutiques ?? []).map(
        (boutique) => boutique.id
      );
      if (boutiqueIds.length === 0) {
        return [];
      }
      const { data, error } = await supabase.from("products").select(`
          *,
          supplier_products (*)
        `).in("boutique_id", boutiqueIds).order("created_at", {
        ascending: false
      });
      if (error) {
        throw error;
      }
      return data ?? [];
    }
  });
}
function useProductStats() {
  const { data: products = [], ...query } = useProducts();
  const activeProducts = products.filter(
    (product) => product.status === "active"
  );
  const pausedProducts = products.filter(
    (product) => product.status === "paused"
  );
  const outOfStockProducts = products.filter(
    (product) => Number(product.stock_quantity ?? 0) <= 0
  );
  const productsOnSale = products.filter(
    (product) => getProductCommercialState(product).promotionActive
  );
  return {
    ...query,
    data: {
      total: products.length,
      active: activeProducts.length,
      paused: pausedProducts.length,
      outOfStock: outOfStockProducts.length,
      onSale: productsOnSale.length
    }
  };
}
function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates
    }) => {
      const { data, error } = await supabase.from("products").update(updates).eq("id", id).select(`
          *,
          supplier_products (*)
        `).single();
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"]
      });
      queryClient.invalidateQueries({
        queryKey: ["product-stats"]
      });
    }
  });
}
function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId) => {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) {
        throw error;
      }
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"]
      });
      queryClient.invalidateQueries({
        queryKey: ["product-stats"]
      });
    }
  });
}
function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product) => {
      const { data, error } = await supabase.from("products").insert(product).select(`
          *,
          supplier_products (*)
        `).single();
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"]
      });
      queryClient.invalidateQueries({
        queryKey: ["product-stats"]
      });
    }
  });
}
export {
  getProductCommercialState,
  useCreateProduct,
  useDeleteProduct,
  useProductStats,
  useProducts,
  useUpdateProduct
};
