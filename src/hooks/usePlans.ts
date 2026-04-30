import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanTier = "starter" | "growth" | "pro";

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  monthly_price_eur: number;
  annual_monthly_price_eur: number;
  commission_percent: number;
  max_boutiques: number;
  max_products: number | null;
  insurance_addon_price_eur: number;
  insurance_per_dispute_cap_eur: number;
  insurance_max_disputes_per_month: number | null;
  features: string[];
  sort_order: number;
}

/** Référentiel public des 3 plans marchands. */
export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async (): Promise<Plan[]> => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return (data || []).map((p) => ({
        ...p,
        features: Array.isArray(p.features) ? (p.features as string[]) : [],
      })) as Plan[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

/** Plan courant du marchand connecté + commission applicable. */
export function useCurrentPlan() {
  const { profile } = useAuth();
  const { data: plans, isLoading } = usePlans();
  const tier = (profile?.plan_tier as PlanTier) || "starter";
  const plan = plans?.find((p) => p.tier === tier) || null;
  return {
    plan,
    tier,
    billingCycle: (profile?.plan_billing_cycle as "monthly" | "annual") || "monthly",
    greenAddonEnabled: !!profile?.green_addon_enabled,
    insuranceAddonEnabled: !!profile?.insurance_addon_enabled,
    isLoading,
  };
}

/** Calcule la commission appliquée à un montant TTC selon le plan courant. */
export function applyCommission(amount: number, plan: Plan | null): number {
  if (!plan) return 0;
  return Math.round((amount * plan.commission_percent) / 100 * 100) / 100;
}