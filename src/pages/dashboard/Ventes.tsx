import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Euro,
  ShoppingCart,
  Receipt,
  Target,
  AlertTriangle,
  Download,
  FileText,
  Globe2,
  Activity,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useSalesGeography } from "@/hooks/useSalesGeography";
import { useSalesPerformance } from "@/hooks/useSalesPerformance";
import { useBoutiques } from "@/hooks/useBoutiques";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import {
  PageHeader,
  SectionCard,
  KpiTile,
  KpiTileSkeleton,
  EmptyState,
  KpiGrid,
} from "@/components/dashboard/shared";
import { SalesHeatmap } from "@/components/dashboard/sales/SalesHeatmap";
import { ProductPerformanceTable } from "@/components/dashboard/sales/ProductPerformanceTable";
import { LiveActivity } from "@/components/dashboard/sales/LiveActivity";
import { RealtimePulseCard } from "@/components/dashboard/sales/RealtimePulseCard";
import { useSalesKpis } from "@/hooks/useSalesKpis";
import { PlanCommissionBanner } from "@/components/dashboard/PlanCommissionBanner";

export default function Ventes() {
  useLanguage();
  const [selectedBoutique, setSelectedBoutique] = useState<string>("all");
  const { data: boutiques = [] } = useBoutiques();
  const { data: salesGeo, isLoading: geoLoading } = useSalesGeography(selectedBoutique);
  const { data: kpis, isLoading: kpisLoading } = useSalesKpis(selectedBoutique);
  const { data: performance, isLoading: performanceLoading, isError: performanceError } = useSalesPerformance(selectedBoutique);
  const monthlyData = performance?.monthly ?? [];
  const topProducts = performance?.top ?? [];
  const lowRotationProducts = performance?.lowRotation ?? [];

  const fmtEUR = (n: number) =>
    new Intl.NumberFormat(getUiLocale(), {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  const fmtBasket = (n: number) =>
    new Intl.NumberFormat(getUiLocale(), {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const handleExport = (kind: "csv" | "pdf") => {
    const bName =
      selectedBoutique !== "all"
        ? boutiques.find((b) => b.id === selectedBoutique)?.name
        : undefined;
    const cols = [
      { header: translateUi("Mois"), accessor: (r: any) => r.month },
      {
        header: translateUi("Revenu (€)"),
        accessor: (r: any) => String(r.revenue),
      },
    ];
    if (kind === "csv") {
      exportToCSV(monthlyData, cols, "ventes", {
        boutiqueName: bName || "Brand-In-A-Box",
      });
    } else {
      exportToPDF(monthlyData, cols, "Rapport des Ventes", "ventes", {
        boutiqueName: bName || "Brand-In-A-Box",
      });
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow={translateUi("Sales Cockpit")}
        title={translateUi("Pilotez vos ventes en temps réel")}
        subtitle={translateUi(
          "KPIs, géographie, activité live et alertes — tout ce dont vous avez besoin pour décider en moins de 5 secondes.",
        )}
        actions={
          <>
            <Select
              value={selectedBoutique}
              onValueChange={setSelectedBoutique}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue
                  placeholder={translateUi("Toutes les boutiques")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {translateUi("Toutes les boutiques")}
                </SelectItem>
                {boutiques.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => handleExport("csv")}
              disabled={performanceLoading || performanceError || !performance?.paidOrders}
            >
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => handleExport("pdf")}
              disabled={performanceLoading || performanceError || !performance?.paidOrders}
            >
              <FileText className="w-4 h-4" /> PDF
            </Button>
          </>
        }
      />

      <PlanCommissionBanner />

      {/* KPI Tiles */}
      <KpiGrid cols={4}>
        {kpisLoading || !kpis ? (
          <>
            <KpiTileSkeleton tone="primary" />
            <KpiTileSkeleton />
            <KpiTileSkeleton />
            <KpiTileSkeleton tone="gold" />
          </>
        ) : (
          <>
            <KpiTile
              label={translateUi("Chiffre d'affaires")}
              value={fmtEUR(kpis.revenue)}
              trend={kpis.revenueTrend ?? undefined}
              trendLabel="vs mois dernier"
              icon={<Euro className="w-5 h-5" />}
              tone="primary"
              sparkline={kpis.sparklines.revenue}
            />
            <KpiTile
              label={translateUi("Commandes")}
              value={kpis.orders}
              trend={kpis.ordersTrend ?? undefined}
              trendLabel="vs mois dernier"
              icon={<ShoppingCart className="w-5 h-5" />}
              sparkline={kpis.sparklines.orders}
            />
            <KpiTile
              label={translateUi("Panier moyen")}
              value={fmtBasket(kpis.averageBasket)}
              trend={kpis.averageBasketTrend ?? undefined}
              trendLabel="vs mois dernier"
              icon={<Receipt className="w-5 h-5" />}
              sparkline={kpis.sparklines.averageBasket}
            />
            <KpiTile
              label="Conversion"
              value={`${kpis.conversionRate.toLocaleString(getUiLocale())} %`}
              trend={kpis.conversionTrend ?? undefined}
              trendLabel="vs mois dernier"
              icon={<Target className="w-5 h-5" />}
              tone="gold"
              hint={
                kpis.conversionRate === 0
                  ? translateUi("Aucune donnée")
                  : undefined
              }
              sparkline={kpis.sparklines.conversionRate}
            />
          </>
        )}
      </KpiGrid>

      {/* Trend + Live Activity */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6">
        <SectionCard
          className="lg:col-span-2"
          title={translateUi("Évolution du chiffre d'affaires")}
          description={translateUi("Six derniers mois · commandes payées, hors environnement de test")}
          icon={<TrendingUp className="w-4 h-4" />}
        >
          <div className="h-72">
            {performanceLoading ? <p className="p-8 text-sm text-muted-foreground">{translateUi("Chargement des ventes…")}</p> : performanceError ? <p role="alert" className="p-8 text-sm text-destructive">{translateUi("Données de ventes indisponibles.")}</p> : <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--secondary))"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--secondary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>}
          </div>
        </SectionCard>

        <SectionCard
          title={translateUi("Activité en direct")}
          description={translateUi("Dernières commandes")}
          icon={<Activity className="w-4 h-4" />}
        >
          <LiveActivity />
        </SectionCard>
      </div>

      {/* Realtime storefront pulse */}
      <div className="mb-6">
        <RealtimePulseCard boutiqueId={selectedBoutique} />
      </div>

      {/* Geographic + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <SectionCard
          title={translateUi("Répartition géographique — zone commerciale")}
          description={translateUi("Ventes payées hors test, regroupées selon la zone commerciale enregistrée. Pays et villes indisponibles dans les commandes actuelles.")}
          icon={<Globe2 className="w-4 h-4" />}
        >
          {geoLoading ? <p className="py-8 text-sm text-muted-foreground">{translateUi("Chargement des marchés…")}</p> : <SalesHeatmap data={salesGeo?.byCountry || []} />}
        </SectionCard>

        <SectionCard
          title={translateUi("Produits performants")}
          description={translateUi("Produits classés par chiffre d’affaires payé sur les six derniers mois")}
          icon={<Sparkles className="w-4 h-4" />}
        >
          {performanceLoading ? <p className="py-8 text-sm text-muted-foreground">{translateUi("Chargement des performances…")}</p> : performanceError ? <p role="alert" className="py-8 text-sm text-destructive">{translateUi("Performances indisponibles.")}</p> : topProducts.length === 0 ? (
            <EmptyState icon={<ShoppingCart className="h-6 w-6" />} title={translateUi("Aucune vente payée")} description={translateUi("Les produits apparaîtront ici après une vente confirmée, hors commandes de test.")} />
          ) : (
            <ProductPerformanceTable products={topProducts} />
          )}
        </SectionCard>
      </div>

      {/* Low rotation alerts */}
      <SectionCard
        title={translateUi("Produits à faible rotation")}
        description={translateUi(
          "Produits en stock sans vente confirmée depuis plus de 30 jours ; les produits jamais vendus sont signalés séparément",
        )}
        icon={<AlertTriangle className="w-4 h-4" />}
      >
        {performanceLoading ? <p className="py-6 text-sm text-muted-foreground">{translateUi("Chargement des stocks et ventes…")}</p> : performanceError ? <p role="alert" className="py-6 text-sm text-destructive">{translateUi("Impossible de calculer les alertes de rotation.")}</p> : lowRotationProducts.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="w-6 h-6" />}
            title={translateUi("Aucune alerte")}
            description={translateUi("Aucun produit actif en stock ne répond aux critères de faible rotation sur les données disponibles.")}
          />
        ) : (
          <div className="space-y-2">
            {lowRotationProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/40 border border-border/40"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {product.name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {translateUi("Dernière vente il y a") + " "}
                    {product.daysSinceLastSale === null ? translateUi("Aucune vente payée enregistrée sur la période") : `${product.daysSinceLastSale} ${translateUi("jours depuis la dernière vente")}`} · {translateUi("Stock")} {product.stock}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning-ink shrink-0">
                  Attention
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardLayout>
  );
}
