import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";
import { useCurrentPlan } from "@/hooks/usePlans";
function usePlanLimits() {
  const { plan, isLoading } = useCurrentPlan();
  const { data: boutiques } = useBoutiques();
  const { data: products } = useProducts();
  const boutiqueCount = boutiques?.length || 0;
  const productCount = products?.length || 0;
  const maxBoutiques = plan?.max_boutiques ?? 1;
  const maxProducts = plan?.max_products ?? null;
  return {
    isLoading,
    plan,
    boutiqueCount,
    productCount,
    maxBoutiques,
    maxProducts,
    canCreateBoutique: boutiqueCount < maxBoutiques,
    canCreateProduct: maxProducts === null || productCount < maxProducts,
    boutiqueLimitReached: boutiqueCount >= maxBoutiques,
    productLimitReached: maxProducts !== null && productCount >= maxProducts
  };
}
export {
  usePlanLimits
};
