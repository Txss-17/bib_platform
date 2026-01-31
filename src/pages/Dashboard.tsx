import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, ShoppingCart, TrendingUp, Package, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useBoutiqueStats } from "@/hooks/useBoutiques";
import { useProductStats } from "@/hooks/useProducts";
import { useOrderStats, useOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: boutiqueStats, isLoading: boutiquesLoading } = useBoutiqueStats();
  const { data: productStats, isLoading: productsLoading } = useProductStats();
  const { data: orderStats, isLoading: ordersLoading } = useOrderStats();
  const { data: orders } = useOrders();

  const isLoading = boutiquesLoading || productsLoading || ordersLoading;
  const hasBoutiques = (boutiqueStats?.total || 0) > 0;

  const recentOrders = orders?.slice(0, 3) || [];

  const kpis = [
    {
      title: "Commandes",
      value: orderStats?.total || 0,
      icon: ShoppingCart,
      trend: 12,
    },
    {
      title: "Produits actifs",
      value: productStats?.active || 0,
      icon: Package,
      trend: 8,
    },
    {
      title: "Revenus",
      value: `${(orderStats?.revenue || 0).toLocaleString('fr-FR')} €`,
      icon: TrendingUp,
      trend: 18,
    },
    {
      title: "Boutiques actives",
      value: boutiqueStats?.published || 0,
      icon: Store,
      trend: 0,
    },
  ];

  return (
    <DashboardLayout 
      title="Bienvenue 👋" 
      subtitle="Voici un aperçu de votre activité aujourd'hui"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          kpis.map((kpi, index) => (
            <Card key={index} className="bg-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{kpi.title}</span>
                  <kpi.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
                  {kpi.trend > 0 && (
                    <span className="text-xs font-medium text-green-500">+{kpi.trend}%</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucune commande pour le moment
                </p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {order.products?.supplier_products?.name || "Produit"}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{order.order_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {Number(order.amount).toFixed(2)} €
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {order.logistics_status === "delivered" ? "Livré" :
                         order.logistics_status === "shipped" ? "Expédié" :
                         order.logistics_status === "processing" ? "En préparation" :
                         order.logistics_status === "pending" ? "En attente" : order.logistics_status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
