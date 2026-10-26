import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  PageHeader,
  SectionCard,
  KpiTile,
  KpiGrid,
} from "@/components/dashboard/shared";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useProducts } from "@/hooks/useProducts";
import { Package, TrendingUp, BarChart3 } from "lucide-react";

export default function AnalyseFournisseurs() {
  useLanguage();
  const { data: supplierProducts } = useSupplierProducts();
  const { data: userProducts } = useProducts();

  // Group supplier products by category
  const categoryStats =
    supplierProducts?.reduce(
      (acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = {
            count: 0,
            avgPrice: 0,
            avgMargin: 0,
            totalPrice: 0,
            totalMargin: 0,
          };
        }
        acc[product.category].count++;
        acc[product.category].totalPrice += product.base_price;
        acc[product.category].totalMargin += product.max_margin_percent;
        acc[product.category].avgPrice =
          acc[product.category].totalPrice / acc[product.category].count;
        acc[product.category].avgMargin =
          acc[product.category].totalMargin / acc[product.category].count;
        return acc;
      },
      {} as Record<
        string,
        {
          count: number;
          avgPrice: number;
          avgMargin: number;
          totalPrice: number;
          totalMargin: number;
        }
      >,
    ) || {};

  const usedProductIds = new Set(
    userProducts?.map((p) => p.supplier_product_id) || [],
  );
  const usedCount =
    supplierProducts?.filter((p) => usedProductIds.has(p.id)).length || 0;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Analytics")}
        title={translateUi("Analyse fournisseurs")}
        subtitle={translateUi(
          "Performance et disponibilité du catalogue fournisseur.",
        )}
        breadcrumbs={[
          { label: translateUi("Dashboard"), href: "/dashboard" },
          { label: translateUi("Analyse fournisseurs") },
        ]}
      />

      {/* Overview */}
      <KpiGrid cols={3}>
        <KpiTile
          label={translateUi("Produits disponibles")}
          value={supplierProducts?.length || 0}
          icon={<Package className="w-5 h-5" />}
        />
        <KpiTile
          label={translateUi("Produits utilisés par vous")}
          value={usedCount}
          icon={<TrendingUp className="w-5 h-5" />}
          tone="gold"
        />
        <KpiTile
          label={translateUi("Catégories")}
          value={Object.keys(categoryStats).length}
          icon={<BarChart3 className="w-5 h-5" />}
        />
      </KpiGrid>

      {/* Category breakdown */}
      <SectionCard
        title={translateUi("Par catégorie")}
        description={translateUi(
          "Prix et marges moyens par catégorie de produit.",
        )}
        icon={<BarChart3 className="w-4 h-4" />}
        className="mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryStats).map(([category, stats]) => (
            <div
              key={category}
              className="rounded-xl border border-border/60 bg-muted/30 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-foreground">{category}</h4>
                <Badge>{stats.count}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-bold text-foreground">
                    €{stats.avgPrice.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {translateUi("Prix moyen")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {Math.round(stats.avgMargin)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {translateUi("Marge moy.")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Top products */}
      <SectionCard
        title={translateUi("Produits les plus performants")}
        description={translateUi("Top 5 du catalogue à forte demande.")}
        icon={<TrendingUp className="w-4 h-4" />}
      >
        <div className="space-y-3">
          {supplierProducts
            ?.filter((p) => p.rotation_indicator === "green")
            .slice(0, 5)
            .map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-3"
              >
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.category} – MOQ: {product.moq}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-foreground">
                    €{product.base_price.toFixed(2)}
                  </p>
                  <Badge
                    variant="outline"
                    className="bg-success/15 text-success-ink text-[10px]"
                  >
                    {translateUi("Demande élevée")}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}
