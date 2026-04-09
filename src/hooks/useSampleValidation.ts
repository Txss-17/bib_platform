import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SampleStatus = "none" | "ordered" | "received" | "validated";

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

// For now, since we can't add a table yet, we store sample validation state
// in the product's status field and localStorage as a temporary bridge.
// The real implementation will use a sample_validations table.

const STORAGE_KEY = "linksy_sample_validations";

function getLocalValidations(): Record<string, { status: SampleStatus; photo_url?: string; comment?: string; ordered_at?: string; validated_at?: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setLocalValidation(productId: string, data: { status: SampleStatus; photo_url?: string; comment?: string; ordered_at?: string; validated_at?: string }) {
  const all = getLocalValidations();
  all[productId] = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function useSampleValidation(productId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sample-validation", productId, user?.id],
    queryFn: () => {
      const all = getLocalValidations();
      return all[productId] || { status: "none" as SampleStatus };
    },
    enabled: !!user && !!productId,
  });
}

export function useSampleValidations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sample-validations", user?.id],
    queryFn: () => {
      return getLocalValidations();
    },
    enabled: !!user,
  });
}

export function useOrderSample() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (productId: string) => {
      setLocalValidation(productId, {
        status: "ordered",
        ordered_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
    },
  });
}

export function useReceiveSample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const current = getLocalValidations()[productId] || {};
      setLocalValidation(productId, {
        ...current,
        status: "received",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sample-validation"] });
      queryClient.invalidateQueries({ queryKey: ["sample-validations"] });
    },
  });
}

export function useValidateSample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, comment, photoUrl }: { productId: string; comment?: string; photoUrl?: string }) => {
      const current = getLocalValidations()[productId] || {};
      setLocalValidation(productId, {
        ...current,
        status: "validated",
        comment,
        photo_url: photoUrl,
        validated_at: new Date().toISOString(),
      });

      // Also activate the product in the database
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

export function getSampleStatusLabel(status: SampleStatus): string {
  switch (status) {
    case "none": return "Échantillon requis";
    case "ordered": return "Échantillon commandé";
    case "received": return "Échantillon reçu";
    case "validated": return "Validé ✓";
  }
}

export function getSampleStatusColor(status: SampleStatus): string {
  switch (status) {
    case "none": return "text-orange-600 bg-orange-100 border-orange-200";
    case "ordered": return "text-blue-600 bg-blue-100 border-blue-200";
    case "received": return "text-yellow-600 bg-yellow-100 border-yellow-200";
    case "validated": return "text-green-600 bg-green-100 border-green-200";
  }
}
