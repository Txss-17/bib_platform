import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";
import { useCurrentPlan } from "@/hooks/usePlans";
import { useUserSubscriptions, isActiveSubscription } from "@/hooks/useSubscriptions";
import { getStripeEnvironment } from "@/lib/stripe";

/**
 * Computes the plan-driven limits used to gate creation flows
 * (new boutique / new product) and to display upgrade nudges.
 * Soft-affichage : ne bloque pas la requête mais expose les flags
 * que les composants UI utilisent pour désactiver les CTA.
 */
export function usePlanLimits() {
  const { plan, tier, isLoading } = useCurrentPlan();
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useUserSubscriptions();
  const { data: boutiques } = useBoutiques();
  const { data: products } = useProducts();

  const boutiqueCount = boutiques?.length || 0;
  const productCount = products?.length || 0;
  const extra = tier === "pro" ? subscriptions.filter((s) => s.kind === "boutique_extra" && isActiveSubscription(s) && s.environment === "live") : [];
  const hasPaidPro = tier === "pro" && subscriptions.some((s) => /^plan_pro_(monthly|yearly)$/.test(s.price_id) && isActiveSubscription(s) && s.environment === "live");
  const extraShops = hasPaidPro ? extra.some((s) => s.price_id === "boutique_extra_two_monthly") ? 2 : extra.some((s) => s.price_id === "boutique_extra_one_monthly") ? 1 : 0 : 0;
  const maxBoutiques = Math.min(3, (plan?.max_boutiques ?? 1) + extraShops);
  const maxProducts = plan?.max_products ?? null;

  return {
    isLoading: isLoading || subscriptionsLoading,
    plan,
    boutiqueCount,
    productCount,
    maxBoutiques,
    maxProducts,
    canCreateBoutique: boutiqueCount < maxBoutiques,
    canCreateProduct: maxProducts === null || productCount < maxProducts,
    boutiqueLimitReached: boutiqueCount >= maxBoutiques,
    productLimitReached: maxProducts !== null && productCount >= maxProducts,
  };
}