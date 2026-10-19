
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
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
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bib-gold">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
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
      className={`min-w-0 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-colors sm:p-6 ${className}`}
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
  tone = "marine",
  loading = false,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: React.ReactNode;
  tone?: "marine" | "gold" | "neutral" | "green";
  loading?: boolean;
}) {
  const tones = {
    marine: "bg-primary/10 text-primary",
    gold: "bg-bib-gold/15 text-bib-gold",
    neutral: "bg-muted text-muted-foreground",
    green: "bg-success/10 text-success",
  };

  return (
    <article className="group min-w-0 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>

      {loading ? (
        <div className="mt-4 h-8 w-28 animate-pulse rounded-lg bg-muted" />
      ) : (
        <p className="mt-4 truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {value}
        </p>
      )}

      <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
      <div className="mt-4 h-0.5 w-8 rounded-full bg-bib-gold/70 transition-all duration-200 group-hover:w-14" />
    </article>
  );
}

function DataMessage({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : undefined}
      className={`mt-5 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-destructive/20 bg-destructive/5 text-destructive"
          : "border-border/60 bg-muted/50 text-muted-foreground"
      }`}
    >
      {error && <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />}
      <p>{children}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-9 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default function Dashboard() {
  const {
    data: boutiqueStats,
    isLoading: boutiqueStatsLoading,
    error: boutiqueStatsError,
  } = useBoutiqueStats();

  const {
    data: boutiques = [],
    isLoading: boutiquesLoading,
    error: boutiquesError,
  } = useBoutiques();

  const {
    data: productStats,
    isLoading: productStatsLoading,
    error: productStatsError,
  } = useProductStats();

  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();

  const {
    data: orderStats,
    isLoading: orderStatsLoading,
    error: orderStatsError,
  } = useOrderStats("month");

  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useOrders();

  const {
    data: supplierProducts = [],
    isLoading: supplierProductsLoading,
    error: supplierProductsError,
  } = useSupplierProducts();

  const boutiqueDataLoading = boutiqueStatsLoading || boutiquesLoading;
  const boutiqueDataError = boutiqueStatsError || boutiquesError;
  const hasBoutiques = (boutiqueStats?.total ?? 0) > 0;

  const recentOrders = orders.slice(0, 4);
  const recentBoutiques = boutiques.slice(0, 3);

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

  const heroTitle = boutiqueDataLoading
    ? "Chargement de votre espace marchand…"
    : boutiqueDataError
      ? "Votre activité est temporairement indisponible."
      : !hasBoutiques
        ? "Construisez votre première boutique BIB."
        : orderStatsLoading
          ? "Vos données d’activité se chargent."
          : orderStatsError
            ? "Retrouvez vos boutiques et vos opérations."
            : pending > 0
              ? "Vos commandes nécessitent votre attention."
              : publishedBoutiques === 0
                ? "Préparez votre première boutique à la publication."
                : "Pilotez votre activité avec clarté.";

  const heroDescription = boutiqueDataLoading
    ? "Nous récupérons les informations de vos boutiques."
    : boutiqueDataError
      ? "Les informations de vos boutiques sont indisponibles pour le moment."
      : !hasBoutiques
        ? "Créez votre vitrine, structurez votre identité de marque et sélectionnez des produits dans le catalogue BIB."
        : orderStatsLoading
          ? "Nous récupérons les indicateurs de vos commandes."
          : orderStatsError
            ? "Les indicateurs de commandes sont indisponibles pour le moment."
            : pending > 0
              ? `${pending} commande${pending > 1 ? "s sont" : " est"} à suivre. Consultez leur état et les prochaines étapes.`
              : publishedBoutiques === 0
                ? "Complétez votre vitrine, vérifiez votre catalogue et avancez vers la publication."
                : "Suivez vos ventes, surveillez les alertes et identifiez les prochaines actions utiles.";

  return (
    <DashboardLayout>
      <OnboardingWizard />
      <PlatformTour autoOpen availablePersonas={["seller"]} />

      <div className="mx-auto w-full max-w-[1600px] space-y-7 pb-10">
        {/* En-tête */}
        <header className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-5 sm:p-7 lg:p-9">
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 rounded-full border border-bib-gold/20 sm:h-64 sm:w-64" />
          <div className="pointer-events-none absolute right-12 top-8 h-28 w-28 rounded-full border border-primary/10 sm:right-24 sm:h-40 sm:w-40" />

          <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div className="min-w-0">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-px w-8 bg-bib-gold" />
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                  BIB Platform · Espace marchand
                </p>
              </div>

              <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                Votre activité,
                <span className="block text-bib-gold sm:inline sm:pl-2">
                  en un regard.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Vos boutiques, vos commandes et vos indicateurs essentiels,
                réunis dans un espace de pilotage conçu pour avancer étape par étape.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PlatformTourLauncher
                label="Guide de la plateforme"
                availablePersonas={["seller"]}
              />
              <Link to="/dashboard/produits-fournisseurs">
                <Button variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4 text-bib-gold" />
                  Catalogue BIB
                </Button>
              </Link>
              <Link to="/dashboard/boutiques/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer une boutique
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <OnboardingChecklist />

        {/* Prochaine étape */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg sm:p-7 lg:p-9">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-primary-foreground/10" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-44 w-44 rounded-full border border-bib-gold/30" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-px w-1/3 bg-bib-gold/60" />

          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-bib-gold" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-primary-foreground/80">
                  Votre prochaine étape
                </span>
              </div>

              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {heroTitle}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/75">
                {heroDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {boutiqueDataLoading || boutiqueDataError ? (
                <Link to="/dashboard/boutiques">
                  <Button variant="secondary" className="gap-2">
                    Consulter mes boutiques
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : hasBoutiques &&
                !orderStatsLoading &&
                !orderStatsError &&
                pending > 0 ? (
                <Link to="/dashboard/commandes">
                  <Button variant="secondary" className="gap-2">
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
                  <Button variant="secondary" className="gap-2">
                    {publishedBoutiques > 0
                      ? "Gérer mes boutiques"
                      : "Continuer ma boutique"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard/boutiques/create">
                  <Button variant="secondary" className="gap-2">
                    Créer ma boutique
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              <Link to="/dashboard/aide">
                <Button
                  variant="outline"
                  className="gap-2 border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <LifeBuoy className="h-4 w-4" />
                  Aide
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Indicateurs */}
        <section className="space-y-4">
          <SectionHeading
            eyebrow="Vue d'ensemble"
            title="Les chiffres essentiels"
            description="Les principaux repères de votre activité sur la période suivie."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Chiffre d'affaires"
              value={orderStatsError ? "—" : compactEuro(revenue)}
              hint={
                orderStatsError
                  ? "Indicateur temporairement indisponible"
                  : `${totalOrders} commande${totalOrders > 1 ? "s" : ""} sur la période`
              }
              icon={<Wallet className="h-5 w-5" />}
              tone="marine"
              loading={orderStatsLoading}
            />
            <MetricCard
              label="Commandes à suivre"
              value={orderStatsError ? "—" : pending}
              hint={
                orderStatsError
                  ? "Indicateur temporairement indisponible"
                  : pending > 0
                    ? "Des commandes restent à traiter"
                    : "Aucune commande en attente"
              }
              icon={<ShoppingCart className="h-5 w-5" />}
              tone={pending > 0 ? "gold" : "green"}
              loading={orderStatsLoading}
            />
            <MetricCard
              label="Panier moyen"
              value={orderStatsError ? "—" : euro(averageBasket)}
              hint={
                orderStatsError
                  ? "Indicateur temporairement indisponible"
                  : delivered > 0
                    ? `${delivered} commande${delivered > 1 ? "s" : ""} livrée${delivered > 1 ? "s" : ""}`
                    : "En attente des premières livraisons"
              }
              icon={<ShoppingBag className="h-5 w-5" />}
              tone="neutral"
              loading={orderStatsLoading}
            />
            <MetricCard
              label="Boutiques publiées"
              value={
                boutiqueStatsError
                  ? "—"
                  : `${publishedBoutiques}/${totalBoutiques}`
              }
              hint={
                boutiqueStatsError
                  ? "Indicateur temporairement indisponible"
                  : productStatsError
                    ? "Produits actifs temporairement indisponibles"
                    : `${activeProducts} produit${activeProducts > 1 ? "s" : ""} actif${activeProducts > 1 ? "s" : ""}`
              }
              icon={<Store className="h-5 w-5" />}
              tone="gold"
              loading={boutiqueStatsLoading || productStatsLoading}
            />
          </div>
        </section>

        {/* Contenu principal */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            {/* Boutiques */}
            <Panel>
              <SectionHeading
                eyebrow="Votre espace"
                title="Mes boutiques"
                description="Accédez à la gestion de vos vitrines et à leur état de publication."
                action={
                  <Link to="/dashboard/boutiques">
                    <Button variant="outline" size="sm" className="gap-2">
                      Toutes les boutiques
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                }
              />

              {boutiqueDataLoading ? (
                <DataMessage>Chargement de vos boutiques…</DataMessage>
              ) : boutiqueDataError ? (
                <DataMessage error>
                  Impossible de charger vos boutiques. Actualisez la page pour réessayer.
                </DataMessage>
              ) : !hasBoutiques ? (
                <EmptyState
                  icon={<Store className="h-6 w-6" />}
                  title="Votre première boutique commence ici"
                  description="Créez votre vitrine, définissez votre univers de marque et préparez votre catalogue dans l’écosystème BIB."
                  action={
                    <Link to="/dashboard/boutiques/create">
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Créer ma boutique
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                  {recentBoutiques.map((boutique) => (
                    <article
                      key={boutique.id}
                      className="group overflow-hidden rounded-2xl border border-border/80 bg-card transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative flex h-28 items-center justify-center overflow-hidden border-b border-border/60 bg-muted/40">
                        {boutique.logo_url ? (
                          <img
                            src={boutique.logo_url}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/5">
                            <Store className="h-9 w-9 text-primary/40" />
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
                        <h3 className="truncate font-semibold text-foreground">
                          {boutique.name}
                        </h3>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
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

            {/* Santé et activité */}
            <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-2">
              <HealthScoreCard />
              <HomeActivityCard />
            </div>

            {/* Commandes */}
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

              {ordersLoading ? (
                <DataMessage>Chargement des commandes…</DataMessage>
              ) : ordersError ? (
                <DataMessage error>
                  Impossible de charger les commandes récentes.
                </DataMessage>
              ) : recentOrders.length === 0 ? (
                <EmptyState
                  icon={<Truck className="h-5 w-5" />}
                  title="Pas encore de commande"
                  description="Vos ventes apparaîtront ici dès les premières commandes."
                />
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-border text-[10px] font-semibold uppercase tracking-[0.13em] text-muted-foreground">
                        <th className="pb-3 pr-4">Commande</th>
                        <th className="pb-3 pr-4">Produit</th>
                        <th className="pb-3 pr-4">Statut</th>
                        <th className="pb-3 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/70">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="transition-colors hover:bg-muted/30">
                          <td className="py-3.5 pr-4">
                            <Link
                              to="/dashboard/commandes"
                              className="font-mono text-xs font-semibold text-primary hover:underline"
                            >
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="max-w-[220px] truncate py-3.5 pr-4 text-sm text-foreground">
                            {order.products?.supplier_products?.name || "Produit"}
                          </td>
                          <td className="py-3.5 pr-4">
                            <Badge
                              variant="outline"
                              className={
                                order.logistics_status === "delivered"
                                  ? "border-success/30 bg-success/10 text-success"
                                  : order.logistics_status === "shipped"
                                    ? "border-primary/20 bg-primary/10 text-primary"
                                    : "border-bib-gold/30 bg-bib-gold/10 text-foreground"
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
                          <td className="py-3.5 text-right text-sm font-semibold tabular-nums text-foreground">
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

            {/* Produits */}
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

              {productsLoading ? (
                <DataMessage>Chargement de vos produits…</DataMessage>
              ) : productsError ? (
                <DataMessage error>Impossible de charger vos produits.</DataMessage>
              ) : products.length === 0 ? (
                <EmptyState
                  icon={<Package className="h-6 w-6" />}
                  title="Aucun produit intégré"
                  description="Parcourez le catalogue fournisseur pour découvrir les produits disponibles."
                  action={
                    <Link to="/dashboard/produits-fournisseurs">
                      <Button size="sm" className="gap-2">
                        <Sparkles className="h-4 w-4" />
                        Explorer le catalogue
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <div className="mt-5 divide-y divide-border/70">
                  {products.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className="flex min-w-0 items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {product.supplier_products?.image_url ? (
                          <img
                            src={product.supplier_products.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {product.supplier_products?.name || "Produit"}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {product.supplier_products?.category || "Catégorie non renseignée"}
                          {" · "}
                          Marge {product.applied_margin}%
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums text-foreground">
                          {euro(Number(product.public_price))}
                        </p>
                        <span
                          className={`mt-1 inline-block text-[10px] font-semibold ${
                            product.status === "active"
                              ? "text-success"
                              : "text-muted-foreground"
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
                description="Visualisez l’activité et la répartition des commandes."
              />
              <div className="mt-5 min-w-0">
                <OrdersChart />
              </div>
            </Panel>

            <StockAlerts />
            <BoutiqueAlertsCard />
          </div>

          {/* Colonne latérale */}
          <aside className="min-w-0 space-y-5">
            {/* Recommandations */}
            <Panel>
              <SectionHeading
                eyebrow="Sélection BIB"
                title="Produits recommandés"
                description="Produits signalés pour leur potentiel de rotation."
                action={
                  <Link
                    to="/dashboard/produits-fournisseurs"
                    aria-label="Parcourir le catalogue fournisseur"
                    className="text-primary transition-colors hover:text-bib-gold"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              />

              {supplierProductsLoading ? (
                <DataMessage>Chargement des recommandations…</DataMessage>
              ) : supplierProductsError ? (
                <DataMessage error>
                  Impossible de charger les recommandations du catalogue BIB.
                </DataMessage>
              ) : recommendedProducts.length === 0 ? (
                <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-4">
                  <Sparkles className="h-5 w-5 text-bib-gold" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Sélection en préparation
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
                      className="flex gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-foreground">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-primary">
                          {euro(Number(product.base_price))}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
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
                <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/10 bg-primary/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      CA de la période
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {compactEuro(revenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/30 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-sm">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Commandes
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-foreground">
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

            {/* Accès rapides */}
            <Panel>
              <SectionHeading
                eyebrow="Accès rapides"
                title="Continuer le travail"
                description="Les espaces utiles pour la prochaine étape."
              />

              <div className="mt-4 space-y-2">
                <Link
                  to="/dashboard/boutiques"
                  className="group flex items-center gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Mes boutiques</p>
                    <p className="text-xs text-muted-foreground">Vitrines et publication</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  to="/dashboard/commandes"
                  className="group flex items-center gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bib-gold/15 text-bib-gold">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Commandes</p>
                    <p className="text-xs text-muted-foreground">Traitement et suivi</p>
                  </div>
                  {pending > 0 && (
                    <Badge variant="secondary">{pending}</Badge>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link
                  to="/dashboard/produits-fournisseurs"
                  className="group flex items-center gap-3 rounded-xl border border-border/70 p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">Catalogue BIB</p>
                    <p className="text-xs text-muted-foreground">Découvrir les produits</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Panel>

            {/* Aide */}
            <Panel>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LifeBuoy className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground">
                    Besoin d’accompagnement ?
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Retrouvez les ressources utiles pour avancer sur la plateforme.
                  </p>
                </div>
              </div>
              <Link to="/dashboard/aide" className="mt-4 block">
                <Button variant="outline" className="w-full gap-2">
                  Ouvrir le centre d’aide
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Panel>

            <ReminderLog limit={8} />
          </aside>
        </div>

        <footer className="flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>BIB Platform · Un espace pour piloter votre activité marchande.</p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span>Les indicateurs reflètent les données disponibles.</span>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
