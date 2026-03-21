import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <DashboardLayout title="Analyse Boutiques" subtitle="Performances détaillées de chaque boutique">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boutiqueAnalytics.map(boutique => (
          <Card key={boutique.id} className="bg-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{boutique.name}</h3>
                  <Badge variant={boutique.status === "published" ? "default" : "secondary"} className="text-[10px]">
                    {boutique.status === "published" ? "Publiée" : "Brouillon"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">€{boutique.revenue.toLocaleString('fr-FR')}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" /> CA
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">{boutique.orderCount}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <ShoppingCart className="w-3 h-3" /> Commandes
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">{boutique.productCount}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                    <Package className="w-3 h-3" /> Produits
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-lg font-bold text-foreground">{boutique.conversionRate}%</p>
                  <p className="text-[10px] text-muted-foreground">Taux livraison</p>
                </div>
              </div>
              <Link to={`/dashboard/boutiques/edit/${boutique.id}`}>
                <Button variant="outline" size="sm" className="w-full gap-1">
                  Gérer la boutique <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {boutiqueAnalytics.length === 0 && (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucune boutique créée</p>
              <Link to="/dashboard/boutiques/create">
                <Button className="mt-4 gap-2"><Store className="w-4 h-4" /> Créer une boutique</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
