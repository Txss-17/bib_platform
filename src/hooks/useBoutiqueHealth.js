import { useMemo } from "react";
import { useBoutiqueStats } from "./useBoutiques";
import { useProductStats, useProducts } from "./useProducts";
import { useOrderStats } from "./useOrders";
import { useSupplierProducts } from "./useSupplierProducts";
function useBoutiqueHealth() {
  const { data: boutiqueStats, isLoading: bL } = useBoutiqueStats();
  const { data: productStats, isLoading: pL } = useProductStats();
  const { data: orderStats, isLoading: oL } = useOrderStats("month");
  const { data: products, isLoading: prL } = useProducts();
  const { data: supplierProducts, isLoading: spL } = useSupplierProducts();
  const loading = bL || pL || oL || prL || spL;
  return useMemo(() => {
    const signals = [];
    const published = boutiqueStats?.published || 0;
    const totalB = boutiqueStats?.total || 0;
    const publishRatio = totalB > 0 ? published / totalB : 0;
    signals.push({
      key: "publish",
      label: "Boutiques publi\xE9es",
      status: published === 0 ? "critical" : publishRatio < 0.5 ? "warning" : "ok",
      hint: published === 0 ? "Publiez au moins une boutique pour vendre" : `${published}/${totalB} en ligne`
    });
    const active = productStats?.active || 0;
    const totalP = productStats?.total || 0;
    signals.push({
      key: "products",
      label: "Produits actifs",
      status: active === 0 ? "critical" : active < 3 ? "warning" : "ok",
      hint: active === 0 ? "Importez des produits depuis le catalogue" : `${active} actifs sur ${totalP}`
    });
    const totalO = orderStats?.total || 0;
    const delivered = orderStats?.delivered || 0;
    const pending = orderStats?.pending || 0;
    const fulfillment = totalO > 0 ? delivered / totalO : 1;
    signals.push({
      key: "fulfillment",
      label: "Taux de livraison",
      status: totalO === 0 ? "warning" : fulfillment >= 0.7 ? "ok" : fulfillment >= 0.4 ? "warning" : "critical",
      hint: totalO === 0 ? "Aucune commande ce mois-ci" : `${Math.round(fulfillment * 100)}% livr\xE9es \xB7 ${pending} \xE0 traiter`
    });
    const spById = new Map(
      (supplierProducts || []).map((sp) => [sp.id, sp])
    );
    let critical = 0;
    let low = 0;
    let monitored = 0;
    (products || []).forEach((p) => {
      const sp = p.supplier_products || spById.get(p.supplier_product_id);
      if (!sp) return;
      const stock = sp.stock ?? 0;
      const moq = Math.max(sp.moq || 1, 1);
      const ratio = stock / moq;
      monitored += 1;
      if (ratio <= 0.1) critical += 1;
      else if (ratio <= 0.3) low += 1;
    });
    signals.push({
      key: "stock",
      label: "Stock fournisseur",
      status: critical > 0 ? "critical" : low > 0 ? "warning" : "ok",
      hint: monitored === 0 ? "Aucun stock suivi" : critical > 0 ? `${critical} produit(s) en rupture imminente` : low > 0 ? `${low} produit(s) en stock faible` : "Stock sain"
    });
    const score = Math.min(
      100,
      Math.round(
        signals.reduce(
          (acc, s) => acc + (s.status === "ok" ? 25 : s.status === "warning" ? 12 : 0),
          0
        )
      )
    );
    const level = score >= 85 ? "excellent" : score >= 65 ? "good" : score >= 40 ? "fair" : "poor";
    return { score, level, signals, loading };
  }, [boutiqueStats, productStats, orderStats, products, supplierProducts, loading]);
}
export {
  useBoutiqueHealth
};
