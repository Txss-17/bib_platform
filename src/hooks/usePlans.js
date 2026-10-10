import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("sort_order");
      if (error) throw error;
      return (data || []).map((p) => ({
        ...p,
        features: Array.isArray(p.features) ? p.features : []
      }));
    },
    staleTime: 1e3 * 60 * 10
  });
}
function useCurrentPlan() {
  const { profile } = useAuth();
  const { data: plans, isLoading } = usePlans();
  const tier = profile?.plan_tier || "starter";
  const plan = plans?.find((p) => p.tier === tier) || null;
  return {
    plan,
    tier,
    billingCycle: profile?.plan_billing_cycle || "monthly",
    greenAddonEnabled: !!profile?.green_addon_enabled,
    insuranceAddonEnabled: !!profile?.insurance_addon_enabled,
    isLoading
  };
}
function applyCommission(amount, plan) {
  if (!plan) return 0;
  return Math.round(amount * plan.commission_percent / 100 * 100) / 100;
}
export {
  applyCommission,
  useCurrentPlan,
  usePlans
};
