import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KPICards } from "@/components/dashboard/KPICards";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, ShoppingCart, TrendingUp, Package } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - will be replaced with real data from Supabase
const mockStats = {
  ordersCount: 143,
  ordersTrend: 12,
  activeProducts: 25,
  productsTrend: 8,
  revenue: 8100,
  revenueTrend: 18,
  activeBoutiques: 2,
  boutiquesTrend: 0,
};

const recentOrders = [
  { orderNumber: "LKS26-A3F2B1", product: "Lampe LED Design", amount: 49.99, status: "Livré" },
  { orderNumber: "LKS26-B7C4D9", product: "Coussin Velours", amount: 29.99, status: "Expédié" },
  { orderNumber: "LKS26-E2F8G3", product: "Vase Céramique", amount: 39.99, status: "En préparation" },
];

export default function Dashboard() {
  const hasBoutiques = mockStats.activeBoutiques > 0;

  return (
    <DashboardLayout 
      title="Bienvenue 👋" 
      subtitle="Voici un aperçu de votre activité aujourd'hui"
    >
      {/* KPI Cards */}
      <KPICards
        ordersCount={mockStats.ordersCount}
        ordersTrend={mockStats.ordersTrend}
        activeProducts={mockStats.activeProducts}
        productsTrend={mockStats.productsTrend}
        revenue={mockStats.revenue}
        revenueTrend={mockStats.revenueTrend}
        activeBoutiques={mockStats.activeBoutiques}
        boutiquesTrend={mockStats.boutiquesTrend}
      />

      {/* Primary CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 mt-8">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {hasBoutiques ? "Gérez vos boutiques" : "Créez votre première boutique"}
            </h3>
            <p className="text-muted-foreground mt-1">
              {hasBoutiques 
                ? "Ajoutez des produits, personnalisez vos boutiques et développez vos ventes."
                : "Lancez-vous en quelques minutes et commencez à vendre avec LINKSY."
              }
            </p>
          </div>
          <Link to={hasBoutiques ? "/dashboard/boutiques" : "/dashboard/boutiques/create"}>
            <Button size="lg" className="gap-2">
              {hasBoutiques ? (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Gérer mes boutiques
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Créer ma boutique
                </>
              )}
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Quick Actions */}
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/dashboard/produits-fournisseurs">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <Package className="w-4 h-4" />
                  <span className="text-left">
                    <span className="block text-sm font-medium">Catalogue</span>
                    <span className="block text-xs text-muted-foreground">Explorer les produits</span>
                  </span>
                </Button>
              </Link>
              <Link to="/dashboard/ventes">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-left">
                    <span className="block text-sm font-medium">Ventes</span>
                    <span className="block text-xs text-muted-foreground">Voir les analytics</span>
                  </span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Dernières commandes</h3>
              <Link to="/dashboard/commandes">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.orderNumber} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{order.product}</p>
                      <p className="text-xs text-muted-foreground font-mono">{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{order.amount.toFixed(2)} €</p>
                    <p className="text-xs text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
