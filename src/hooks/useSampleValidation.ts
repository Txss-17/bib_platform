import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SampleStatus =
  | "none"
  | "ordered"
  | "received"
  | "validated"
  | "to_validate"
  | "rejected";

export interface SampleValidation {
  id: string;
  product_id: string;
  user_id: string;
  status: SampleStatus;
  photo_url: string | null;
  comment: string | null;
  ordered_at: string | null;
  validated_at: string | null;
  created_at: string;
}

export function useSampleValidation(productId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sample-validation", productId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sample_validations" as any)
        .select("*")
        .eq("product_id", productId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return (data as any as SampleValidation | null) || { status: "none" as SampleStatus };
    },
    enabled: !!user && !!productId,
  });
}

export function useSampleValidations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sample-validations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sample_validations" as any)
        .select("*")
        .eq("user_id", user!.id);

      if (error) throw error;
      const result: Record<string, { status: SampleStatus; photo_url?: string; comment?: string; ordered_at?: string; validated_at?: string }> = {};
      for (const row of (data as any as SampleValidation[])) {
        result[row.product_id] = {
          status: row.status,
          photo_url: row.photo_url || undefined,
          comment: row.comment || undefined,
          ordered_at: row.ordered_at || undefined,
          validated_at: row.validated_at || undefined,
        };
      }
      return result;
    },
    enabled: !!user,
  });
}

export function useOrderSample() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("sample_validations" as any)
        .upsert({
          product_id: productId,
          user_id: user!.id,
          status: "ordered",
          ordered_at: new Date().toISOString(),
        } as any, { onConflict: "product_id,user_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
    },
  });
}

export function useReceiveSample() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("sample_validations" as any)
        .update({ status: "received" } as any)
        .eq("product_id", productId)
        .eq("user_id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
    },
  });
}

export function useValidateSample() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ productId, comment, photoUrl }: { productId: string; comment?: string; photoUrl?: string }) => {
      const { error: valError } = await supabase
        .from("sample_validations" as any)
        .update({
          status: "validated",
          comment,
          photo_url: photoUrl,
          validated_at: new Date().toISOString(),
        } as any)
        .eq("product_id", productId)
        .eq("user_id", user!.id);

      if (valError) throw valError;

      // Activate the product
      const { error } = await supabase
        .from("products")
        .update({ status: "active" })
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
    },
  });
}

/**
 * Mark a product sample as "À valider" or "Rejeté" with an optional
 * comment. Stores the moderation timestamp in `validated_at` so the UI
 * can show exactly when the decision was taken.
 */
export function useReviewSample() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      status,
      comment,
    }: {
      productId: string;
      status: "to_validate" | "rejected";
      comment?: string;
    }) => {
      const { error } = await supabase
        .from("sample_validations" as any)
        .upsert(
          {
            product_id: productId,
            user_id: user!.id,
            status,
            comment: comment ?? null,
            validated_at: new Date().toISOString(),
          } as any,
          { onConflict: "product_id,user_id" },
        );
      if (error) throw error;

      // Rejected products must not stay published.
      if (status === "rejected") {
        await supabase
          .from("products")
          .update({ status: "paused" })
          .eq("id", productId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function getSampleStatusLabel(status: SampleStatus): string {
  switch (status) {
    case "none": return "Échantillon requis";
    case "ordered": return "Échantillon commandé";
    case "received": return "Échantillon reçu";
    case "validated": return "Validé ✓";
    case "to_validate": return "À valider";
    case "rejected": return "Rejeté";
  }
}

export function getSampleStatusColor(status: SampleStatus): string {
  switch (status) {
    case "none": return "text-orange-600 bg-orange-100 border-orange-200";
    case "ordered": return "text-blue-600 bg-blue-100 border-blue-200";
    case "received": return "text-yellow-600 bg-yellow-100 border-yellow-200";
    case "validated": return "text-green-600 bg-green-100 border-green-200";
    case "to_validate": return "text-amber-700 bg-amber-100 border-amber-200";
    case "rejected": return "text-red-700 bg-red-100 border-red-200";
  }
}
