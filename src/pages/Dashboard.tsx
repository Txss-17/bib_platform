import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  LifeBuoy,
  Package,
  Plus,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Truck,
  Wallet,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useBoutiques, useBoutiqueStats } from "@/hooks/useBoutiques";
import { useProductStats, useProducts } from "@/hooks/useProducts";
import { useOrderStats, useOrders } from "@/hooks/useOrders";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";

import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { BoutiqueAlertsCard } from "@/components/dashboard/BoutiqueAlertsCard";
import { OrdersChart } from "@/components/dashboard/OrdersChart";
import { HealthScoreCard } from "@/components/dashboard/home/HealthScoreCard";
import { HomeActivityCard } from "@/components/dashboard/home/HomeActivityCard";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import {
  PlatformTour,
  PlatformTourLauncher,
} from "@/components/tour/PlatformTour";
import { ReminderLog } from "@/components/dashboard/ReminderLog";

const euro = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);

const compactEuro = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_18px_rgba(15,23,42,0.035)] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = "blue",
  loading = false,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  tone?: "blue" | "gold" | "slate" | "green";
  loading?: boolean;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    gold: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_3px_18px_rgba(15,23,42,0.025)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="mt-4 h-8 w-28 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">
          {value}
        </p>
      )}
      <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: boutiqueStats, isLoading: boutiquesLoading } =
    useBoutiqueStats();
  const { data: boutiques } = useBoutiques();

  const { data: productStats, isLoading: productsLoading } =
    useProductStats();
  const { data: products } = useProducts();

  const { data: orderStats, isLoading: ordersLoading } =
    useOrderStats("month");
  const { data: orders } = useOrders();

  const { data: supplierProducts } = useSupplierProducts();

  const isLoading = boutiquesLoading || productsLoading || ordersLoading;
  const hasBoutiques = (boutiqueStats?.total ?? 0) > 0;

  const recentOrders = orders?.slice(0, 4) ?? [];
  const recentBoutiques = boutiques?.slice(0, 3) ?? [];

  const recommendedProducts =
    supplierProducts
      ?.filter((product) => product.rotation_indicator === "green")
      .slice(0, 3) ?? [];

  const revenue = orderStats?.revenue ?? 0;
  const totalOrders = orderStats?.total ?? 0;
  const pending = orderStats?.pending ?? 0;
  const delivered = orderStats?.delivered ?? 0;
  const averageBasket = totalOrders > 0 ? revenue / totalOrders : 0;

  const publishedBoutiques = boutiqueStats?.published ?? 0;
  const totalBoutiques = boutiqueStats?.total ?? 0;
  const activeProducts = productStats?.active ?? 0;

  return (
    <DashboardLayout>
      <OnboardingWizard />
      <PlatformTour autoOpen availablePersonas={["seller"]} />

      <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-10">
        {/* Header */}
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-7 bg-amber-500" />
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-700">
                BIB Platform · Espace marchand
              </p>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Votre activité,
              <span className="text-blue-700"> en un regard.</span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Retrouvez vos boutiques, suivez vos commandes et identifiez
              la prochaine action utile pour développer votre activité.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PlatformTourLauncher
              label="Guide de la plateforme"
              availablePersonas={["seller"]}
            />
            <Link to="/dashboard/produits-fournisseurs">
              <Button
                variant="outline"
                className="gap-2 border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
              >
                <Sparkles className="h-4 w-4 text-blue-700" />
                Catalogue
              </Button>
            </Link>
            <Link to="/dashboard/boutiques/create">
              <Button className="gap-2 bg-blue-700 text-white shadow-sm hover:bg-blue-800">
                <Plus className="h-4 w-4" />
                Créer une boutique
              </Button>
            </Link>
          </div>
        </header>

        <OnboardingChecklist />

        {/* Primary action banner */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-[#102B55] p-5 text-white shadow-[0_12px_35px_rgba(16,43,85,0.14)] sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-1 -top-16 h-48 w-48 rounded-full border border-amber-300/20" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-blue-100">
                  Votre prochaine étape
                </span>
              </div>

              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {hasBoutiques
                  ? pending > 0
                    ? "Vos commandes nécessitent votre attention."
                    : publishedBoutiques === 0
                      ? "Préparez votre première boutique à la publication."
                      : "Gardez le cap sur votre activité." 
                  : "Construisez votre première boutique BIB."}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/80">
                {hasBoutiques
                  ? pending > 0
                    ? `${pending} commande${pending > 1 ? "s sont" : " est"} à suivre. Consultez leur état et traitez les prochaines étapes.`
                    : publishedBoutiques === 0
                      ? "Complétez votre vitrine, vérifiez votre catalogue et avancez vers la publication."
                      : "Suivez vos ventes, surveillez les alertes et améliorez progressivement vos performances."
                  : "Commencez par créer votre vitrine. Vous pourrez ensuite structurer votre identité de marque et sélectionner des produits du catalogue BIB."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {pending > 0 ? (
                <Link to="/dashboard/commandes">
                  <Button className="gap-2 bg-white text-blue-900 hover:bg-blue-50">
                    Traiter les commandes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : hasBoutiques ? (
                <Link
                  to={
                    publishedBoutiques > 0
                      ? "/dashboard/boutiques"
                      : `/dashboard/boutiques/edit/${recentBoutiques[0]?.id ?? ""}`
                  }
                >
                  <Button className="gap-2 bg-white text-blue-900 hover:bg-blue-50">
                    {publishedBoutiques > 0
                      ? "Gérer mes boutiques"
                      : "Continuer ma boutique"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard/boutiques/create">
                  <Button className="gap-2 bg-white text-blue-900 hover:bg-blue-50">
                    Créer ma boutique
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              <Link to="/dashboard/aide">
                <Button
                  variant="outline"
                  className="gap-2 border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <LifeBuoy className="h-4 w-4" />
                  Aide
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Key metrics */}
        <section className="space-y-3">
          <SectionHeading
            eyebrow="Vue d'ensemble"
            title="Les chiffres essentiels"
            description="Indicateurs de votre activité sur la période suivie."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Chiffre d'affaires"
              value={compactEuro(revenue)}
              hint={`${totalOrders} commande${totalOrders > 1 ? "s" : ""} sur la période`}
              icon={<Wallet className="h-5 w-5" />}
              tone="blue"
              loading={isLoading}
            />
            <MetricCard
              label="À suivre"
              value={pending}
              hint={pending > 0 ? "Des commandes restent à traiter" : "Aucune commande en attente"}
              icon={<ShoppingCart className="h-5 w-5" />}
              tone={pending > 0 ? "gold" : "green"}
              loading={isLoading}
            />
            <MetricCard
              label="Panier moyen"
              value={euro(averageBasket)}
              hint={delivered > 0 ? `${delivered} commande${delivered > 1 ? "s" : ""} livrée${delivered > 1 ? "s" : ""}` : "En attente des premières livraisons"}
              icon={<ShoppingBag className="h-5 w-5" />}
              tone="slate"
              loading={isLoading}
            />
            <MetricCard
              label="Boutiques publiées"
              value={`${publishedBoutiques}/${totalBoutiques}`}
              hint={`${activeProducts} produit${activeProducts > 1 ? "s" : ""} actif${activeProducts > 1 ? "s" : ""}`}
              icon={<Store className="h-5 w-5" />}
              tone="gold"
              loading={isLoading}
            />
          </div>
        </section>

        {/* Main dashboard */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            {/* Stores */}
            <Panel>
              <SectionHeading
                eyebrow="Votre espace"
                title="Mes boutiques"
                description="Accédez directement à la gestion de vos vitrines."
                action={
                  <Link to="/dashboard/boutiques">
                    <Button variant="outline" size="sm" className="gap-2">
                      Toutes les boutiques
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                }
              />

              {!hasBoutiques ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-9 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <Store className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">
                    Votre première boutique commence ici
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Créez votre vitrine, définissez votre univers de marque
                    et préparez votre catalogue dans l'écosystème BIB.
                  </p>
                  <Link to="/dashboard/boutiques/create" className="mt-5 inline-flex">
                    <Button className="gap-2 bg-blue-700 hover:bg-blue-800">
                      <Plus className="h-4 w-4" />
                      Créer ma boutique
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {recentBoutiques.map((boutique) => (
                    <article
                      key={boutique.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-blue-100 via-slate-50 to-amber-50">
                        {boutique.logo_url ? (
                          <img
                            src={boutique.logo_url}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Store className="h-9 w-9 text-blue-800/35" />
                          </div>
                        )}
                        <Badge
                          variant={boutique.status === "published" ? "default" : "secondary"}
                          className="absolute right-3 top-3 shadow-sm"
                        >
                          {boutique.status === "published" ? "Publiée" : "Brouillon"}
                        </Badge>
                      </div>

                      <div className="p-4">
                        <h3 className="truncate font-semibold text-slate-900">
                          {boutique.name}
                        </h3>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {boutique.category || "Catégorie à définir"}
                        </p>

                        <div className="mt-4 flex gap-2">
                          <Link
                            to={`/dashboard/boutiques/edit/${boutique.id}`}
                            className="min-w-0 flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-1.5"
                            >
                              <Settings2 className="h-3.5 w-3.5" />
                              Gérer
                            </Button>
                          </Link>

                          {boutique.status === "published" && (
                            <a
                              href={`/boutique/${boutique.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Ouvrir la boutique ${boutique.name}`}
                            >
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Panel>

            {/* Health and activity */}
            <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
              <HealthScoreCard />
              <HomeActivityCard />
            </div>

            {/* Orders */}
            <Panel>
              <SectionHeading
                eyebrow="Opérations"
                title="Dernières commandes"
                description="Un aperçu des commandes les plus récentes."
                action={
                  <Link to="/dashboard/commandes">
                    <Button variant="outline" size="sm" className="gap-2">
                      Voir les commandes
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                }
              />

              {recentOrders.length === 0 ? (
                <div className="mt-5 flex flex-col items-center rounded-xl bg-slate-50 px-4 py-8 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                    <Truck className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Pas encore de commande
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Vos ventes apparaîtront ici dès les premières commandes.
                  </p>
                </div>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                        <th className="pb-3 pr-4">Commande</th>
                        <th className="pb-3 pr-4">Produit</th>
                        <th className="pb-3 pr-4">Statut</th>
                        <th className="pb-3 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="group">
                          <td className="py-3.5 pr-4">
                            <Link
                              to="/dashboard/commandes"
                              className="font-mono text-xs font-semibold text-blue-800 hover:underline"
                            >
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="max-w-[220px] truncate py-3.5 pr-4 text-sm text-slate-700">
                            {order.products?.supplier_products?.name || "Produit"}
                          </td>
                          <td className="py-3.5 pr-4">
                            <Badge
                              variant="outline"
                              className={
                                order.logistics_status === "delivered"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : order.logistics_status === "shipped"
                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                    : "border-amber-200 bg-amber-50 text-amber-800"
                              }
                            >
                              {order.logistics_status === "delivered"
                                ? "Livrée"
                                : order.logistics_status === "shipped"
                                  ? "Expédiée"
                                  : order.logistics_status === "processing"
                                    ? "En cours"
                                    : "À suivre"}
                            </Badge>
                          </td>
                          <td className="py-3.5 text-right text-sm font-semibold tabular-nums text-slate-900">
                            {order.total_amount != null
                              ? euro(Number(order.total_amount))
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            {/* Products */}
            <Panel>
              <SectionHeading
                eyebrow="Catalogue"
                title="Mes produits"
                description="Suivez les produits intégrés à votre boutique."
                action={
                  <Link to="/dashboard/produits">
                    <Button variant="outline" size="sm" className="gap-2">
                      Gérer les produits
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                }
              />

              {!products?.length ? (
                <div className="mt-5 flex flex-col items-center rounded-xl bg-slate-50 px-4 py-8 text-center">
                  <Package className="h-7 w-7 text-slate-400" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Aucun produit intégré
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Parcourez le catalogue fournisseur pour découvrir les produits disponibles.
                  </p>
                  <Link to="/dashboard/produits-fournisseurs" className="mt-4">
                    <Button size="sm" className="gap-2 bg-blue-700 hover:bg-blue-800">
                      <Sparkles className="h-4 w-4" />
                      Explorer le catalogue
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-5 divide-y divide-slate-100">
                  {products.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {product.supplier_products?.image_url ? (
                          <img
                            src={product.supplier_products.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {product.supplier_products?.name || "Produit"}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {product.supplier_products?.category || "Catégorie non renseignée"}
                          {" · "}
                          Marge {product.applied_margin}%
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums text-slate-900">
                          {euro(Number(product.public_price))}
                        </p>
                        <span
                          className={`mt-1 inline-block text-[10px] font-semibold ${
                            product.status === "active"
                              ? "text-emerald-700"
                              : "text-slate-400"
                          }`}
                        >
                          {product.status === "active" ? "Actif" : "En pause"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            {/* Performance */}
            <Panel>
              <SectionHeading
                eyebrow="Pilotage"
                title="Performance opérationnelle"
                description="Visualisez l'activité et la répartition des commandes."
              />
              <div className="mt-5 min-w-0">
                <OrdersChart />
              </div>
            </Panel>

            <StockAlerts />
            <BoutiqueAlertsCard />
          </div>

          {/* Right rail */}
          <aside className="min-w-0 space-y-5">
            <Panel>
              <SectionHeading
                eyebrow="Sélection BIB"
                title="Produits recommandés"
                description="Produits signalés pour leur potentiel de rotation."
                action={
                  <Link
                    to="/dashboard/produits-fournisseurs"
                    aria-label="Parcourir le catalogue fournisseur"
                  >
                    <ArrowRight className="h-4 w-4 text-blue-700" />
                  </Link>
                }
              />

              {recommendedProducts.length === 0 ? (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Sélection en préparation
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Consultez le catalogue pour explorer les produits disponibles.
                  </p>
                  <Link to="/dashboard/produits-fournisseurs" className="mt-3 inline-flex">
                    <Button variant="outline" size="sm" className="gap-2">
                      Voir le catalogue
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {recommendedProducts.map((product) => (
                    <article
                      key={product.id}
                      className="flex gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-100 hover:bg-blue-50/30"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-blue-800">
                          {euro(Number(product.base_price))}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          Marge maximale : {product.max_margin_percent}%
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </Panel>

            {/* Finance */}
            <Panel>
              <SectionHeading
                eyebrow="Suivi financier"
                title="Finance"
                description="Repères rapides sur votre activité."
              />

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-blue-50/70 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      CA de la période
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {compactEuro(revenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      Commandes
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-slate-900">
                    {totalOrders}
                  </span>
                </div>

                <Link to="/dashboard/paiements" className="block pt-1">
                  <Button variant="outline" className="w-full gap-2">
                    Accéder aux paiements
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Panel>

            {/* Quick links */}
            <Panel>
              <SectionHeading
                eyebrow="Accès rapides"
                title="Continuer le travail"
                description="Les espaces utiles pour la prochaine étape."
              />

              <div className="mt-4 space-y-2">
                <Link
                  to="/dashboard/boutiques"
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Mes boutiques
                    </p>
                    <p className="text-xs text-slate-500">
                      Vitrines et publication
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  to="/dashboard/commandes"
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Commandes
                    </p>
                    <p className="text-xs text-slate-500">
                      Traitement et suivi
                    </p>
                  </div>
                  {pending > 0 && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      {pending}
                    </Badge>
                  )}
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>

                <Link
                  to="/dashboard/produits-fournisseurs"
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                      Catalogue BIB
                    </p>
                    <p className="text-xs text-slate-500">
                      Découvrir les produits
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </Panel>

            {/* Support */}
            <Panel>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-slate-900">
                    Besoin d'accompagnement ?
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Retrouvez les ressources utiles pour avancer sur la plateforme.
                  </p>
                </div>
              </div>
              <Link to="/dashboard/aide" className="mt-4 block">
                <Button variant="outline" className="w-full gap-2">
                  Ouvrir le centre d'aide
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Panel>

            <ReminderLog limit={8} />
          </aside>
        </div>

        {/* Footer note */}
        <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            BIB Platform · Un espace pour piloter votre activité marchande.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Les indicateurs reflètent les données disponibles.</span>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}

