import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BoutiqueCustomer {
  id: string;
  boutique_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  total_spent_cents: number;
  orders_count: number;
  first_order_at: string | null;
  last_order_at: string | null;
  marketing_opt_in: boolean;
  source: string;
  tags: string[];
  created_at: string;
}

export function useCustomers(boutiqueId?: string) {
  return useQuery({
    queryKey: ["boutique-customers", boutiqueId],
    queryFn: async () => {
      if (!boutiqueId) return [] as BoutiqueCustomer[];
      const { data, error } = await supabase
        .from("boutique_customers" as any)
        .select("*")
        .eq("boutique_id", boutiqueId)
        .order("last_order_at", { ascending: false, nullsFirst: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as unknown as BoutiqueCustomer[];
    },
    enabled: !!boutiqueId,
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<BoutiqueCustomer> }) => {
      const { data, error } = await supabase
        .from("boutique_customers" as any)
        .update(patch as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boutique-customers"] }),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("boutique_customers" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["boutique-customers"] }),
  });
}

/**
 * Public storefront newsletter signup — uses anon insert policy.
 */
export async function subscribeToNewsletter(
  boutiqueId: string,
  email: string,
  fullName?: string,
) {
  const { error } = await supabase.from("boutique_customers" as any).insert({
    boutique_id: boutiqueId,
    email: email.toLowerCase().trim(),
    full_name: fullName ?? null,
    source: "newsletter_signup",
    marketing_opt_in: true,
    opt_in_at: new Date().toISOString(),
  } as any);
  if (error && !error.message.includes("duplicate")) throw error;
}