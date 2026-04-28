import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionCard, KpiTile, EmptyState } from "@/components/dashboard/shared";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Store, TrendingUp, ShoppingCart, Package, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AnalyseBoutiques() {
  const { data: boutiques } = useBoutiques();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();

  const boutiqueAnalytics = boutiques?.map(boutique => {
    const boutiqueOrders = orders?.filter(o => o.boutique_id === boutique.id) || [];
    const boutiqueProducts = products?.filter(p => p.boutique_id === boutique.id) || [];
    const revenue = boutiqueOrders.reduce((sum, o) => sum + Number(o.amount), 0);
    const delivered = boutiqueOrders.filter(o => o.logistics_status === "delivered").length;

    return {
      ...boutique,
      orderCount: boutiqueOrders.length,
      productCount: boutiqueProducts.length,
      revenue,
      delivered,
      conversionRate: boutiqueOrders.length > 0 ? Math.round((delivered / boutiqueOrders.length) * 100) : 0,
    };
  }) || [];

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Analytics"
        title="Analyse boutiques"
        subtitle="Performances détaillées de chacune de vos boutiques."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Analyse boutiques" },
        ]}
      />

      {boutiqueAnalytics.length === 0 ? (
        <SectionCard>
          <EmptyState
            icon={<Store className="w-6 h-6" />}
            title="Aucune boutique créée"
            description="Créez votre première boutique pour suivre ses performances ici."
            action={
              <Link to="/dashboard/boutiques/create">
                <Button className="gap-2">
                  <Store className="w-4 h-4" /> Créer une boutique
                </Button>
              </Link>
            }
          />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {boutiqueAnalytics.map((boutique) => (
            <SectionCard
              key={boutique.id}
              icon={<Store className="w-4 h-4" />}
              title={boutique.name}
              description={
                <Badge
                  variant={boutique.status === "published" ? "default" : "secondary"}
                  className="text-[10px] mt-1"
                >
                  {boutique.status === "published" ? "Publiée" : "Brouillon"}
                </Badge>
              }
            >
              <div className="grid grid-cols-2 gap-3 mb-4">
                <KpiTile
                  label="CA"
                  value={`€${boutique.revenue.toLocaleString("fr-FR")}`}
                  icon={<TrendingUp className="w-4 h-4" />}
                />
                <KpiTile
                  label="Commandes"
                  value={boutique.orderCount}
                  icon={<ShoppingCart className="w-4 h-4" />}
                />
                <KpiTile
                  label="Produits"
                  value={boutique.productCount}
                  icon={<Package className="w-4 h-4" />}
                />
                <KpiTile
                  label="Taux livraison"
                  value={`${boutique.conversionRate}%`}
                  tone="gold"
                />
              </div>
              <Link to={`/dashboard/boutiques/edit/${boutique.id}`}>
                <Button variant="outline" size="sm" className="w-full gap-1">
                  Gérer la boutique <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </SectionCard>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
