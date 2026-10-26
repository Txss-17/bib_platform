import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { CustomizationConfig } from "@/lib/productCustomization";

export interface ProductCustomizationDossier {
  id: string;
  product_id: string;
  merchant_config: CustomizationConfig;
  version: number;
  supplier_status:
    | "not_requested"
    | "submitted"
    | "in_review"
    | "approved"
    | "changes_requested"
    | "rejected";
  supplier_comment: string | null;
  updated_at: string;
}
// New RPCs and fields correspond to migration 0022; generated types must follow deployment.
const db = supabase as any;
const key = (userId: string | undefined, productId: string) => [
  "product-customization",
  userId,
  productId,
];
export function useProductCustomization(productId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: key(user?.id, productId),
    enabled: !!user && !!productId,
    queryFn: async (): Promise<ProductCustomizationDossier | null> => {
      const { data, error } = await db
        .from("product_customization_dossiers")
        .select(
          "id,product_id,merchant_config,version,supplier_status,supplier_comment,updated_at",
        )
        .eq("product_id", productId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
export function useCustomizationActions() {
  const { user } = useAuth();
  const cache = useQueryClient();
  const save = useMutation({
    mutationFn: async (input: {
      productId: string;
      config: CustomizationConfig;
      version: number;
    }) => {
      if (!user) throw new Error("authentication_required");
      const { data, error } = await db.rpc("save_product_customization_draft", {
        p_product_id: input.productId,
        p_config: input.config,
        p_expected_version: input.version,
      });
      if (error) throw error;
      return data as ProductCustomizationDossier;
    },
    onMutate: () => ({ userId: user?.id }),
    onSuccess: (data, input, context) => {
      if (context?.userId)
        cache.setQueryData(key(context.userId, input.productId), data);
    },
  });
  const submit = useMutation({
    mutationFn: async (input: { productId: string; version: number }) => {
      if (!user) throw new Error("authentication_required");
      const { data, error } = await db.rpc("submit_product_customization", {
        p_product_id: input.productId,
        p_expected_version: input.version,
      });
      if (error) throw error;
      return data as ProductCustomizationDossier;
    },
    onMutate: () => ({ userId: user?.id }),
    onSuccess: (data, input, context) => {
      if (context?.userId)
        cache.setQueryData(key(context.userId, input.productId), data);
    },
  });
  return { save, submit };
}
