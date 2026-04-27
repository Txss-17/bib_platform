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
import { useBoutiques } from "@/hooks/useBoutiques";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import {
  PageHeader,
  SectionCard,
  KpiTile,
  KpiTileSkeleton,
  EmptyState,
} from "@/components/dashboard/shared";
import { SalesHeatmap } from "@/components/dashboard/sales/SalesHeatmap";
import { LiveActivity } from "@/components/dashboard/sales/LiveActivity";
import { RealtimePulseCard } from "@/components/dashboard/sales/RealtimePulseCard";
import { useSalesKpis } from "@/hooks/useSalesKpis";

const monthlyData = [
  { month: "Jan", revenue: 4200 },
  { month: "Fév", revenue: 5100 },
  { month: "Mar", revenue: 4800 },
  { month: "Avr", revenue: 6200 },
  { month: "Mai", revenue: 7500 },
  { month: "Juin", revenue: 8100 },
];

const topProducts = [
  { name: "Lampe LED Design", sales: 45, revenue: 2250 },
  { name: "Coussin Velours", sales: 38, revenue: 1140 },
  { name: "Vase Céramique", sales: 32, revenue: 1280 },
  { name: "Cadre Photo Bois", sales: 28, revenue: 840 },
];

const lowRotationProducts = [
  { name: "Tapis Berbère XL", daysSinceLastSale: 45, stock: 12 },
  { name: "Étagère Murale", daysSinceLastSale: 38, stock: 8 },
  { name: "Miroir Vintage", daysSinceLastSale: 32, stock: 5 },
];

export default function Ventes() {
  const { data: salesGeo } = useSalesGeography();
  const { data: boutiques = [] } = useBoutiques();
  const [selectedBoutique, setSelectedBoutique] = useState<string>("all");
  const { data: kpis, isLoading: kpisLoading } = useSalesKpis(selectedBoutique);

  const fmtEUR = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  const fmtBasket = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
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
      { header: "Mois", accessor: (r: any) => r.month },
      { header: "Revenu (€)", accessor: (r: any) => String(r.revenue) },
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
    <DashboardLayout title="">
      <PageHeader
        eyebrow="Sales Cockpit"
        title="Pilotez vos ventes en temps réel"
        subtitle="KPIs, géographie, activité live et alertes — tout ce dont vous avez besoin pour décider en moins de 5 secondes."
        actions={
          <>
            <Select value={selectedBoutique} onValueChange={setSelectedBoutique}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Toutes les boutiques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les boutiques</SelectItem>
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
            >
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => handleExport("pdf")}
            >
              <FileText className="w-4 h-4" /> PDF
            </Button>
          </>
        }
      />

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
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
              label="Chiffre d'affaires"
              value={fmtEUR(kpis.revenue)}
              trend={kpis.revenueTrend ?? undefined}
              trendLabel="vs mois dernier"
              icon={<Euro className="w-5 h-5" />}
              tone="primary"
              sparkline={kpis.sparklines.revenue}
            />
            <KpiTile
              label="Commandes"
              value={kpis.orders}
              trend={kpis.ordersTrend ?? undefined}
              trendLabel="vs mois dernier"
              icon={<ShoppingCart className="w-5 h-5" />}
              sparkline={kpis.sparklines.orders}
            />
            <KpiTile
              label="Panier moyen"
              value={fmtBasket(kpis.averageBasket)}
              trend={kpis.averageBasketTrend ?? undefined}
              trendLabel="vs mois dernier"
              icon={<Receipt className="w-5 h-5" />}
              sparkline={kpis.sparklines.averageBasket}
            />
            <KpiTile
              label="Conversion"
              value={`${kpis.conversionRate.toLocaleString("fr-FR")} %`}
              trend={kpis.conversionTrend ?? undefined}
              trendLabel="vs mois dernier"
              icon={<Target className="w-5 h-5" />}
              tone="gold"
              hint={kpis.conversionRate === 0 ? "Aucune donnée" : undefined}
              sparkline={kpis.sparklines.conversionRate}
            />
          </>
        )}
      </div>

      {/* Trend + Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <SectionCard
          className="lg:col-span-2"
          title="Évolution du chiffre d'affaires"
          description="6 derniers mois"
          icon={<TrendingUp className="w-4 h-4" />}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Activité en direct"
          description="Dernières commandes"
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
          className="lg:col-span-2"
          title="Répartition géographique"
          description="Top régions par chiffre d'affaires"
          icon={<Globe2 className="w-4 h-4" />}
        >
          <SalesHeatmap data={salesGeo?.byCountry || []} />
        </SectionCard>

        <SectionCard
          title="Produits performants"
          description="Top ventes du mois"
          icon={<Sparkles className="w-4 h-4" />}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="sales" fill="hsl(var(--secondary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Low rotation alerts */}
      <SectionCard
        title="Produits à faible rotation"
        description="Pensez à les promouvoir ou à ajuster votre stock"
        icon={<AlertTriangle className="w-4 h-4" />}
      >
        {lowRotationProducts.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Aucune alerte"
            description="Tous vos produits tournent bien."
          />
        ) : (
          <div className="space-y-2">
            {lowRotationProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-muted/40 border border-border/40"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Dernière vente il y a {product.daysSinceLastSale} jours · Stock {product.stock}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 shrink-0">
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
