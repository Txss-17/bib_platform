import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useProducts } from "@/hooks/useProducts";
import { Package, TrendingUp, BarChart3 } from "lucide-react";

export default function AnalyseFournisseurs() {
  const { data: supplierProducts } = useSupplierProducts();
  const { data: userProducts } = useProducts();

  // Group supplier products by category
  const categoryStats = supplierProducts?.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = { count: 0, avgPrice: 0, avgMargin: 0, totalPrice: 0, totalMargin: 0 };
    }
    acc[product.category].count++;
    acc[product.category].totalPrice += product.base_price;
    acc[product.category].totalMargin += product.max_margin_percent;
    acc[product.category].avgPrice = acc[product.category].totalPrice / acc[product.category].count;
    acc[product.category].avgMargin = acc[product.category].totalMargin / acc[product.category].count;
    return acc;
  }, {} as Record<string, { count: number; avgPrice: number; avgMargin: number; totalPrice: number; totalMargin: number }>) || {};

  const usedProductIds = new Set(userProducts?.map(p => p.supplier_product_id) || []);
  const usedCount = supplierProducts?.filter(p => usedProductIds.has(p.id)).length || 0;

  return (
    <DashboardLayout title="Analyse Fournisseurs" subtitle="Performance et disponibilité du catalogue fournisseur">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border/50">
          <CardContent className="p-5 text-center">
            <Package className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{supplierProducts?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Produits disponibles</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-5 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{usedCount}</p>
            <p className="text-xs text-muted-foreground">Produits utilisés par vous</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-5 text-center">
            <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{Object.keys(categoryStats).length}</p>
            <p className="text-xs text-muted-foreground">Catégories</p>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      <h3 className="text-lg font-semibold text-foreground mb-4">Par catégorie</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(categoryStats).map(([category, stats]) => (
          <Card key={category} className="bg-card border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">{category}</h4>
                <Badge>{stats.count} produits</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-sm font-bold text-foreground">€{stats.avgPrice.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">Prix moyen</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-sm font-bold text-foreground">{Math.round(stats.avgMargin)}%</p>
                  <p className="text-[10px] text-muted-foreground">Marge moy.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top products */}
      <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">Produits les plus performants</h3>
      <div className="space-y-3">
        {supplierProducts
          ?.filter(p => p.rotation_indicator === "green")
          .slice(0, 5)
          .map(product => (
            <Card key={product.id} className="bg-card border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                  {product.image_url ? (
                    <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.category} – MOQ: {product.moq}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-foreground">€{product.base_price.toFixed(2)}</p>
                  <Badge variant="outline" className="bg-green-500/15 text-green-700 text-[10px]">
                    Demande élevée
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </DashboardLayout>
  );
}
