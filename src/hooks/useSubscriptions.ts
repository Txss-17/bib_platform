import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Subscription {
  id: string;
  price_id: string;
  product_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_subscription_id: string;
  environment: string;
  kind: string;
}

/** Returns all subscriptions for the current user (plans + add-ons). */
export function useUserSubscriptions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscriptions", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Subscription[]> => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Subscription[];
    },
  });
}

/** Opens the Stripe customer portal so the user can manage their subscriptions. */
export function useOpenBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: { returnUrl: `${window.location.origin}/dashboard/parametres` },
      });
      if (error || !data?.url) {
        throw new Error(error?.message || "Impossible d'ouvrir le portail de facturation");
      }
      window.location.href = data.url;
    },
  });
}

export function useInvalidateSubscriptions() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["subscriptions"] });
}