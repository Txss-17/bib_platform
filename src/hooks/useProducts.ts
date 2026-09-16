import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Product = Tables<"products">;
export type SupplierProduct = Tables<"supplier_products">;

export interface ProductWithSupplier extends Product {
  supplier_products: SupplierProduct;
}

export interface ProductCommercialState {
  publicPrice: number;
  salePrice: number | null;
  currentPrice: number;
  discountPercent: number;
  promotionActive: boolean;
  promotionLabel: string | null;
  promotionStartsAt: string | null;
  promotionEndsAt: string | null;
  isOutOfStock: boolean;
  isLowStock: boolean;
}

/* -------------------------------------------------------------------------- */
/* Commercial helpers                                                         */
/* -------------------------------------------------------------------------- */

export function getProductCommercialState(
  product: Product,
  now = new Date(),
): ProductCommercialState {
  const publicPrice = Number(product.public_price ?? 0);

  const salePrice =
    product.sale_price !== null && product.sale_price !== undefined
      ? Number(product.sale_price)
      : null;

  const promotionStartsAt = product.promotion_starts_at ?? null;
  const promotionEndsAt = product.promotion_ends_at ?? null;

  const startsAt = promotionStartsAt
    ? new Date(promotionStartsAt)
    : null;

  const endsAt = promotionEndsAt
    ? new Date(promotionEndsAt)
    : null;

  const promotionActive =
    salePrice !== null &&
    salePrice >= 0 &&
    salePrice < publicPrice &&
    (!startsAt || now >= startsAt) &&
    (!endsAt || now <= endsAt);

  const currentPrice = promotionActive
    ? salePrice
    : publicPrice;

  const discountPercent =
    promotionActive && publicPrice > 0
      ? Math.round(
          ((publicPrice - currentPrice) / publicPrice) * 100,
        )
      : 0;

  const stockQuantity = Number(product.stock_quantity ?? 0);
  const lowStockThreshold = Number(
    product.low_stock_threshold ?? 0,
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
    isLowStock:
      stockQuantity > 0 &&
      lowStockThreshold > 0 &&
      stockQuantity <= lowStockThreshold,
  };
}

/* -------------------------------------------------------------------------- */
/* Product query                                                              */
/* -------------------------------------------------------------------------- */

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<ProductWithSupplier[]> => {
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      /* -------------------------------------------------------------------- */
      /* 1. Retrieve the merchant's boutiques                               */
      /* -------------------------------------------------------------------- */

      const { data: boutiques, error: boutiquesError } =
        await supabase
          .from("boutiques")
          .select("id")
          .eq("user_id", user.id);

      if (boutiquesError) {
        throw boutiquesError;
      }

      const boutiqueIds = (boutiques ?? []).map(
        (boutique) => boutique.id,
      );

      if (boutiqueIds.length === 0) {
        return [];
      }

      /* -------------------------------------------------------------------- */
      /* 2. Retrieve the products                                             */
      /* -------------------------------------------------------------------- */

      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          supplier_products (*)
        `)
        .in("boutique_id", boutiqueIds)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return (data ?? []) as ProductWithSupplier[];
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Product statistics                                                         */
/* -------------------------------------------------------------------------- */

export function useProductStats() {
  const { data: products = [], ...query } = useProducts();

  const activeProducts = products.filter(
    (product) => product.status === "active",
  );

  const pausedProducts = products.filter(
    (product) => product.status === "paused",
  );

  const outOfStockProducts = products.filter(
    (product) =>
      Number(product.stock_quantity ?? 0) <= 0,
  );

  const productsOnSale = products.filter(
    (product) =>
      getProductCommercialState(product).promotionActive,
  );

  return {
    ...query,
    data: {
      total: products.length,
      active: activeProducts.length,
      paused: pausedProducts.length,
      outOfStock: outOfStockProducts.length,
      onSale: productsOnSale.length,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Update product                                                             */
/* -------------------------------------------------------------------------- */

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: TablesUpdate<"products">;
    }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          supplier_products (*)
        `)
        .single();

      if (error) {
        throw error;
      }

      return data as ProductWithSupplier;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["product-stats"],
      });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Delete product                                                             */
/* -------------------------------------------------------------------------- */

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        throw error;
      }

      return productId;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["product-stats"],
      });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Product insert                                                             */
/* -------------------------------------------------------------------------- */

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      product: TablesInsert<"products">,
    ) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select(`
          *,
          supplier_products (*)
        `)
        .single();

      if (error) {
        throw error;
      }

      return data as ProductWithSupplier;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["product-stats"],
      });
    },
  });
}
