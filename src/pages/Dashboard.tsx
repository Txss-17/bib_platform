import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, ArrowRight, ShoppingCart, TrendingUp, Package, Store,
  CheckCircle, ExternalLink, Settings, Eye, BarChart3, Truck
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBoutiques, useBoutiqueStats } from "@/hooks/useBoutiques";
import { useProductStats, useProducts } from "@/hooks/useProducts";
import { useOrderStats, useOrders } from "@/hooks/useOrders";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { OrdersChart } from "@/components/dashboard/OrdersChart";

export default function Dashboard() {
  const { data: boutiqueStats, isLoading: boutiquesLoading } = useBoutiqueStats();
  const { data: boutiques } = useBoutiques();
  const { data: productStats, isLoading: productsLoading } = useProductStats();
  const { data: orderStats, isLoading: ordersLoading } = useOrderStats();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: supplierProducts } = useSupplierProducts();

  const isLoading = boutiquesLoading || productsLoading || ordersLoading;
  const hasBoutiques = (boutiqueStats?.total || 0) > 0;
  const recentOrders = orders?.slice(0, 4) || [];

  // Recommended supplier products (top rotation)
  const recommendedProducts = supplierProducts
    ?.filter(p => p.rotation_indicator === "green")
    ?.slice(0, 3) || [];

  return (
    <DashboardLayout title="Tableau de Bord" subtitle="Concentrez-vous sur vos commandes et votre croissance">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Santé de la Boutique */}
          <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Santé de la Boutique</h2>
                <Link to="/dashboard/ventes">
                  <Button variant="outline" size="sm" className="gap-1">
                    Voir statistiques <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-background/60">
                      <p className="text-2xl md:text-3xl font-bold text-foreground">
                        €{(orderStats?.revenue || 0).toLocaleString('fr-FR')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">CA du mois</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/60">
                      <p className="text-2xl md:text-3xl font-bold text-foreground">
                        {orderStats?.total || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Commandes</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/60">
                      <p className="text-2xl md:text-3xl font-bold text-foreground">
                        {productStats?.active || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Produits actifs</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-background/60">
                      <p className="text-2xl md:text-3xl font-bold text-foreground">
                        {boutiqueStats?.published || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Boutiques publiées</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">Abonnement actif – Aucun impayé</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Mes Boutiques */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Mes Boutiques</h2>
              <Link to="/dashboard/boutiques">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            {!hasBoutiques ? (
              <Card className="border-dashed border-border/50">
                <CardContent className="p-8 text-center">
                  <Store className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Créez votre première boutique</p>
                  <Link to="/dashboard/boutiques/create">
                    <Button className="gap-2"><Plus className="w-4 h-4" /> Créer</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {boutiques?.slice(0, 4).map(boutique => (
                  <Card key={boutique.id} className="bg-card border-border/50 overflow-hidden group hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="h-24 bg-gradient-to-br from-primary/20 to-accent/20 relative">
                        {boutique.logo_url && (
                          <img src={boutique.logo_url} alt="" className="w-full h-full object-cover" />
                        )}
                        <Badge
                          variant={boutique.status === "published" ? "default" : "secondary"}
                          className="absolute top-2 right-2"
                        >
                          {boutique.status === "published" ? "Publiée" : "Brouillon"}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground">{boutique.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{boutique.category}</p>
                        <div className="flex gap-2 mt-3">
                          <Link to={`/dashboard/boutiques/edit/${boutique.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full gap-1">
                              <Settings className="w-3 h-3" /> Gérer
                            </Button>
                          </Link>
                          {boutique.status === "published" && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/boutique/${boutique.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Mes Produits + Commandes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mes Produits */}
            <Card className="bg-card border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Mes Produits</h3>
                  <Link to="/dashboard/produits">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Voir tout <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {products?.slice(0, 4).map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                        {product.supplier_products?.image_url ? (
                          <img src={product.supplier_products.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {product.supplier_products?.name || "Produit"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.supplier_products?.category} – {product.applied_margin}% marge
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">
                          €{Number(product.public_price).toFixed(2)}
                        </p>
                        <Badge variant={product.status === "active" ? "default" : "secondary"} className="text-[10px]">
                          {product.status === "active" ? "Actif" : "Pause"}
                        </Badge>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun produit</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Commandes & Livraisons */}
            <Card className="bg-card border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Commandes & Livraisons</h3>
                  <Link to="/dashboard/commandes">
                    <Button variant="ghost" size="sm" className="gap-1">
                      Voir tout <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                    <p className="text-lg font-bold text-foreground">{orderStats?.pending || 0}</p>
                    <p className="text-xs text-muted-foreground">En attente</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                    <p className="text-lg font-bold text-foreground">{orderStats?.shipped || 0}</p>
                    <p className="text-xs text-muted-foreground">Expédiées</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {recentOrders.map(order => (
                    <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                            {order.products?.supplier_products?.name || "Produit"}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-mono">{order.order_number}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {order.logistics_status === "delivered" ? "Livré" :
                         order.logistics_status === "shipped" ? "Expédié" :
                         order.logistics_status === "processing" ? "En cours" : "En attente"}
                      </Badge>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">Aucune commande</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stock Alerts */}
          <StockAlerts />

          {/* Orders Charts */}
          <OrdersChart />

          {/* Stock & Engagement */}
          <Card className="bg-card border-border/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Stock & Engagement</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xl font-bold text-foreground">{productStats?.total || 0}</p>
                  <p className="text-xs text-muted-foreground">Total produits</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xl font-bold text-foreground">{productStats?.active || 0}</p>
                  <p className="text-xs text-muted-foreground">Actifs</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xl font-bold text-foreground">{productStats?.paused || 0}</p>
                  <p className="text-xs text-muted-foreground">En pause</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xl font-bold text-foreground">{orderStats?.delivered || 0}</p>
                  <p className="text-xs text-muted-foreground">Livrés</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Produits Recommandés */}
          <Card className="bg-card border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Produits Recommandés</h3>
                <Link to="/dashboard/produits-fournisseurs">
                  <Button variant="link" size="sm" className="text-primary p-0 h-auto">Voir tout</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recommendedProducts.map(product => (
                  <div key={product.id} className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-primary font-semibold">
                        €{product.base_price.toFixed(2)}{" "}
                        <span className="text-muted-foreground font-normal">{product.max_margin_percent}% marge</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>
                ))}
                {recommendedProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucun produit recommandé</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 p-2 bg-muted/30 rounded">
                <strong>Pourquoi ces produits ?</strong> Produits très utilisés par des boutiques comme la vôtre. Taux de retour faible.
              </p>
            </CardContent>
          </Card>

          {/* Finance */}
          <Card className="bg-card border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Finance</h3>
                <Link to="/dashboard/paiements">
                  <Button variant="link" size="sm" className="text-primary p-0 h-auto">Voir tout</Button>
                </Link>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">Revenus du mois</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    €{(orderStats?.revenue || 0).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-foreground">Commandes</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{orderStats?.total || 0}</span>
                </div>
              </div>
              <Link to="/dashboard/commandes" className="block mt-3">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  Voir toutes les commandes <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="bg-card border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Support & Accompagnement</h3>
                <Link to="/dashboard/aide">
                  <Button variant="ghost" size="sm"><ArrowRight className="w-3 h-3" /></Button>
                </Link>
              </div>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-medium text-foreground">Besoin d'aide ?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Notre équipe est disponible pour vous accompagner dans la gestion de vos boutiques.
                  </p>
                </div>
              </div>
              <Link to="/dashboard/aide">
                <Button variant="outline" size="sm" className="w-full mt-3 gap-1">
                  Centre d'aide <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
