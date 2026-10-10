import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
function useSampleValidation(productId) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sample-validation", productId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("sample_validations").select("*").eq("product_id", productId).eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data || { status: "none" };
    },
    enabled: !!user && !!productId
  });
}
function useSampleValidations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sample-validations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("sample_validations").select("*").eq("user_id", user.id);
      if (error) throw error;
      const result = {};
      for (const row of data) {
        result[row.product_id] = {
          status: row.status,
          photo_url: row.photo_url || void 0,
          comment: row.comment || void 0,
          ordered_at: row.ordered_at || void 0,
          validated_at: row.validated_at || void 0
        };
      }
      return result;
    },
    enabled: !!user
  });
}
function useOrderSample() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (productId) => {
      const { error } = await supabase.from("sample_validations").upsert({
        product_id: productId,
        user_id: user.id,
        status: "ordered",
        ordered_at: (/* @__PURE__ */ new Date()).toISOString()
      }, { onConflict: "product_id,user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
    }
  });
}
function useReceiveSample() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (productId) => {
      const { error } = await supabase.from("sample_validations").update({ status: "received" }).eq("product_id", productId).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
    }
  });
}
function useValidateSample() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ productId, comment, photoUrl }) => {
      const { error: valError } = await supabase.from("sample_validations").update({
        status: "validated",
        comment,
        photo_url: photoUrl,
        validated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("product_id", productId).eq("user_id", user.id);
      if (valError) throw valError;
      const { error } = await supabase.from("products").update({ status: "active" }).eq("id", productId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
    }
  });
}
function useReviewSample() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({
      productId,
      status,
      comment
    }) => {
      const { error } = await supabase.from("sample_validations").upsert(
        {
          product_id: productId,
          user_id: user.id,
          status,
          comment: comment ?? null,
          validated_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        { onConflict: "product_id,user_id" }
      );
      if (error) throw error;
      if (status === "rejected") {
        await supabase.from("products").update({ status: "paused" }).eq("id", productId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });
}
function getSampleStatusLabel(status) {
  switch (status) {
    case "none":
      return "\xC9chantillon requis";
    case "ordered":
      return "\xC9chantillon command\xE9";
    case "received":
      return "\xC9chantillon re\xE7u";
    case "validated":
      return "Valid\xE9 \u2713";
    case "to_validate":
      return "\xC0 valider";
    case "rejected":
      return "Rejet\xE9";
  }
}
function getSampleStatusColor(status) {
  switch (status) {
    case "none":
      return "text-orange-600 bg-orange-100 border-orange-200";
    case "ordered":
      return "text-blue-600 bg-blue-100 border-blue-200";
    case "received":
      return "text-yellow-600 bg-yellow-100 border-yellow-200";
    case "validated":
      return "text-green-600 bg-green-100 border-green-200";
    case "to_validate":
      return "text-amber-700 bg-amber-100 border-amber-200";
    case "rejected":
      return "text-red-700 bg-red-100 border-red-200";
  }
}
export {
  getSampleStatusColor,
  getSampleStatusLabel,
  useOrderSample,
  useReceiveSample,
  useReviewSample,
  useSampleValidation,
  useSampleValidations,
  useValidateSample
};
