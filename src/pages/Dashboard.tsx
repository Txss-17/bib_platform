import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus, ArrowRight, ShoppingCart, TrendingUp, Package, Store,
  ExternalLink, Settings, Wallet, Sparkles, LifeBuoy, ShoppingBag,
  Truck, BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useBoutiques, useBoutiqueStats } from "@/hooks/useBoutiques";
import { useProductStats, useProducts } from "@/hooks/useProducts";
import { useOrderStats, useOrders } from "@/hooks/useOrders";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { BoutiqueAlertsCard } from "@/components/dashboard/BoutiqueAlertsCard";
import { OrdersChart } from "@/components/dashboard/OrdersChart";
import {
  PageHeader,
  SectionCard,
  KpiTile,
  KpiTileSkeleton,
  KpiGrid,
  EmptyState,
} from "@/components/dashboard/shared";
import { HealthScoreCard } from "@/components/dashboard/home/HealthScoreCard";
import { HomeActivityCard } from "@/components/dashboard/home/HomeActivityCard";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { PlatformTour, PlatformTourLauncher } from "@/components/tour/PlatformTour";

export default function Dashboard() {
  const { data: boutiqueStats, isLoading: boutiquesLoading } = useBoutiqueStats();
  const { data: boutiques } = useBoutiques();
  const { data: productStats, isLoading: productsLoading } = useProductStats();
  const { data: orderStats, isLoading: ordersLoading } = useOrderStats("month");
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: supplierProducts } = useSupplierProducts();

  const isLoading = boutiquesLoading || productsLoading || ordersLoading;
  const hasBoutiques = (boutiqueStats?.total || 0) > 0;
  const recentOrders = orders?.slice(0, 4) || [];

  // Recommended supplier products (top rotation)
  const recommendedProducts = supplierProducts
    ?.filter((p) => p.rotation_indicator === "green")
    ?.slice(0, 3) || [];

  const revenue = orderStats?.revenue || 0;
  const totalOrders = orderStats?.total || 0;
  const pending = orderStats?.pending || 0;
  const delivered = orderStats?.delivered || 0;
  const avgBasket = totalOrders > 0 ? revenue / totalOrders : 0;

  return (
    <DashboardLayout>
      {/* First-5-minutes onboarding — wizard auto-opens if profile incomplete */}
      <OnboardingWizard />
      {/* Guided tour — auto-opens on first visit, relaunchable from header / Aide */}
      <PlatformTour autoOpen />

      <PageHeader
        eyebrow="Accueil"
        title="Bonjour 👋"
        subtitle="Votre cockpit unifié — santé de la boutique, commandes et opportunités en un coup d'œil."
        actions={
          <>
            <PlatformTourLauncher label="Guide" />
            <Link to="/dashboard/produits-fournisseurs">
              <Button variant="outline" size="sm" className="gap-1">
                <Sparkles className="w-4 h-4" /> Catalogue
              </Button>
            </Link>
            <Link to="/dashboard/boutiques/create">
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" /> Nouvelle boutique
              </Button>
            </Link>
          </>
        }
      />

      {/* Pinned checklist — disappears at 100% or on dismiss */}
      <OnboardingChecklist />

      {/* KPI grid — readable in <5s */}
      <KpiGrid cols={4}>
        {isLoading ? (
          <>
            <KpiTileSkeleton tone="primary" />
            <KpiTileSkeleton />
            <KpiTileSkeleton />
            <KpiTileSkeleton tone="gold" />
          </>
        ) : (
          <>
            <KpiTile
              tone="primary"
              label="CA du mois"
              value={`€${revenue.toLocaleString("fr-FR", { maximumFractionDigits: 0 })}`}
              icon={<TrendingUp className="w-5 h-5" />}
              hint={`${totalOrders} commande${totalOrders > 1 ? "s" : ""}`}
            />
            <KpiTile
              label="À traiter"
              value={pending}
              icon={<ShoppingCart className="w-5 h-5" />}
              hint={pending > 0 ? "Validation requise" : "Tout est à jour"}
            />
            <KpiTile
              label="Panier moyen"
              value={`€${avgBasket.toFixed(2)}`}
              icon={<ShoppingBag className="w-5 h-5" />}
              hint={delivered > 0 ? `${delivered} livrée${delivered > 1 ? "s" : ""}` : "—"}
            />
            <KpiTile
              tone="gold"
              label="Boutiques publiées"
              value={`${boutiqueStats?.published || 0}/${boutiqueStats?.total || 0}`}
              icon={<Store className="w-5 h-5" />}
              hint={`${productStats?.active || 0} produits actifs`}
            />
          </>
        )}
      </KpiGrid>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        {/* Main column */}
        <div className="space-y-6">
          <HealthScoreCard />

          <HomeActivityCard />

          {/* My boutiques */}
          <SectionCard
            icon={<Store className="w-4 h-4" />}
            title="Mes boutiques"
            description="Gérez et publiez vos vitrines"
            actions={
              <Link to="/dashboard/boutiques">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            }
          >
            {!hasBoutiques ? (
              <EmptyState
                icon={<Store className="w-6 h-6" />}
                title="Aucune boutique pour le moment"
                description="Créez votre première vitrine pour commencer à vendre."
                action={
                  <Link to="/dashboard/boutiques/create">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" /> Créer une boutique
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {boutiques?.slice(0, 4).map((boutique) => (
                  <div
                    key={boutique.id}
                    className="rounded-2xl border border-border/60 bg-muted/20 overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div className="h-20 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                      {boutique.logo_url && (
                        <img
                          src={boutique.logo_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Badge
                        variant={boutique.status === "published" ? "default" : "secondary"}
                        className="absolute top-2 right-2 text-[10px]"
                      >
                        {boutique.status === "published" ? "Publiée" : "Brouillon"}
                      </Badge>
                    </div>
                    <div className="p-3">
                      <h3 className="font-display font-semibold text-foreground truncate">
                        {boutique.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {boutique.category}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Link
                          to={`/dashboard/boutiques/edit/${boutique.id}`}
                          className="flex-1"
                        >
                          <Button variant="outline" size="sm" className="w-full gap-1">
                            <Settings className="w-3 h-3" /> Gérer
                          </Button>
                        </Link>
                        {boutique.status === "published" && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`/boutique/${boutique.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Products + recent orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard
              icon={<Package className="w-4 h-4" />}
              title="Mes produits"
              actions={
                <Link to="/dashboard/produits">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Voir tout <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            >
              {!products?.length ? (
                <EmptyState
                  icon={<Package className="w-6 h-6" />}
                  title="Aucun produit"
                  description="Importez vos premiers produits depuis le catalogue fournisseur."
                  action={
                    <Link to="/dashboard/produits-fournisseurs">
                      <Button size="sm" className="gap-1">
                        <Sparkles className="w-4 h-4" /> Catalogue
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <ul className="divide-y divide-border/50">
                  {products.slice(0, 4).map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center gap-3 py-2.5 first:pt-1 last:pb-1"
                    >
                      <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden shrink-0">
                        {product.supplier_products?.image_url ? (
                          <img
                            src={product.supplier_products.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
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
                          {product.supplier_products?.category} · {product.applied_margin}% marge
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground tabular-nums">
                          €{Number(product.public_price).toFixed(2)}
                        </p>
                        <Badge
                          variant={product.status === "active" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {product.status === "active" ? "Actif" : "Pause"}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard
              icon={<Truck className="w-4 h-4" />}
              title="Dernières commandes"
              actions={
                <Link to="/dashboard/commandes">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Voir tout <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              }
            >
              {recentOrders.length === 0 ? (
                <EmptyState
                  icon={<ShoppingCart className="w-6 h-6" />}
                  title="Aucune commande"
                  description="Vos dernières ventes apparaîtront ici."
                />
              ) : (
                <ul className="divide-y divide-border/50">
                  {recentOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {order.products?.supplier_products?.name || "Produit"}
                          </p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {order.order_number}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {order.logistics_status === "delivered"
                          ? "Livré"
                          : order.logistics_status === "shipped"
                            ? "Expédié"
                            : order.logistics_status === "processing"
                              ? "En cours"
                              : "En attente"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          {/* Stock alerts */}
          <StockAlerts />

          {/* Auto alerts (views drop, CTR, audits) */}
          <BoutiqueAlertsCard />

          {/* Orders charts */}
          <SectionCard
            icon={<BarChart3 className="w-4 h-4" />}
            title="Performance opérationnelle"
            description="Répartition des statuts et activité 7 jours"
          >
            <OrdersChart />
          </SectionCard>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          {/* Recommended products */}
          <SectionCard
            icon={<Sparkles className="w-4 h-4" />}
            title="Produits recommandés"
            description="Top rotation cette semaine"
            actions={
              <Link to="/dashboard/produits-fournisseurs">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            }
          >
            {recommendedProducts.length === 0 ? (
              <EmptyState
                icon={<Sparkles className="w-6 h-6" />}
                title="Bientôt disponible"
                description="Les recommandations s'affineront avec votre historique."
              />
            ) : (
              <ul className="space-y-3 pt-2">
                {recommendedProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden shrink-0">
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
                      <p className="text-sm font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-secondary font-semibold">
                        €{product.base_price.toFixed(2)}{" "}
                        <span className="text-muted-foreground font-normal">
                          · {product.max_margin_percent}% marge
                        </span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          {/* Finance snapshot */}
          <SectionCard
            icon={<Wallet className="w-4 h-4" />}
            title="Finance"
            actions={
              <Link to="/dashboard/paiements">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            }
          >
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">Revenus du mois</span>
                </div>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  €{revenue.toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-foreground">Commandes</span>
                </div>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {totalOrders}
                </span>
              </div>
              <Link to="/dashboard/commandes" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  Voir les commandes <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </SectionCard>

          {/* Support */}
          <SectionCard
            icon={<LifeBuoy className="w-4 h-4" />}
            title="Support & accompagnement"
          >
            <div className="pt-1 space-y-3">
              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                <p className="text-sm font-medium text-foreground">Besoin d'aide ?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Notre équipe vous accompagne dans la gestion quotidienne de vos boutiques.
                </p>
              </div>
              <Link to="/dashboard/aide">
                <Button variant="outline" size="sm" className="w-full gap-1">
                  Centre d'aide <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
