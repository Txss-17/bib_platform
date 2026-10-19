import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Uses only columns confirmed in the live schema, not optional SEO migrations. */
export async function fetchBoutiquePublicationData(boutiqueId: string) {
  const [boutiqueResult, productsResult] = await Promise.all([
    supabase.from("boutiques")
      .select("id, studio_completed_at, seo_title, seo_description")
      .eq("id", boutiqueId).single(),
    supabase.from("products")
      .select("id, supplier_products!inner(id)", { count: "exact", head: true })
      .eq("boutique_id", boutiqueId)
      .eq("status", "active")
      .eq("supplier_products.is_active", true),
  ]);
  if (boutiqueResult.error) throw boutiqueResult.error;
  if (productsResult.error) throw productsResult.error;
  if (!boutiqueResult.data || productsResult.count === null) throw new Error("Données de publication incomplètes.");
  return { boutique: boutiqueResult.data, eligibleProductCount: productsResult.count };
}

export function useBoutiquePublication(boutiqueId: string) {
  return useQuery({
    queryKey: ["boutique-publication", boutiqueId],
    queryFn: () => fetchBoutiquePublicationData(boutiqueId),
    enabled: Boolean(boutiqueId),
  });
}