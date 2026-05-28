import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, BarChart3, Eye, MousePointerClick, ShoppingBag, Clock, ChevronsDown,
  Loader2, Users, FileText, Package, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { useSceneAnalyticsSummary } from "@/hooks/useSceneAnalyticsSummary";
import { usePageAnalytics, useProductFunnel, usePeriodKpis } from "@/hooks/usePageAnalytics";
import { useBoutiquePages } from "@/hooks/useBoutiquePages";
import { useProducts } from "@/hooks/useProducts";
import { findSceneDefinition } from "@/lib/studioScenes";
import { useMemo, useState } from "react";
import { EDITOR_ROUTES } from "@/lib/editorRoutes";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileSpreadsheet, FileText as FileTextIcon, ExternalLink } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RANGES: { label: string; days: number }[] = [
  { label: "7 j", days: 7 },
  { label: "30 j", days: 30 },
  { label: "90 j", days: 90 },
];

export default function BoutiqueAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState(30);

  const { data: boutique } = useQuery({
    queryKey: ["boutique-analytics-meta", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boutiques")
        .select("id,name,slug,status")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: scenes = [], isLoading: scenesLoading } = useSceneAnalyticsSummary(id, days);
  const { data: pages = [] } = useBoutiquePages(id);
  const { data: pageRows = [], isLoading: pagesLoading } = usePageAnalytics(id, days);
  const { data: funnel = [], isLoading: funnelLoading } = useProductFunnel(id, days);
  const { data: products = [] } = useProducts();
  const { data: kpis } = usePeriodKpis(id, days);

  // Map scene_id -> page_id (boutique_scenes carries page_id; analytics rows don't).
  const { data: sceneIndex = {} } = useQuery({
    queryKey: ["scene-index", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("boutique_scenes")
        .select("id, page_id")
        .eq("boutique_id", id!);
      const map: Record<string, string | null> = {};
      ((data as any[]) ?? []).forEach((s) => { map[s.id] = s.page_id ?? null; });
      return map;
    },
  });

  const pagesById = useMemo(() => {
    const m = new Map<string, { title: string; slug: string }>();
    pages.forEach((p) => m.set(p.id, { title: p.title, slug: p.slug }));
    return m;
  }, [pages]);

  const [scenePageFilter, setScenePageFilter] = useState<string>("all");

  const cur = kpis?.current;
  const prev = kpis?.previous;
  const delta = (a?: number, b?: number) => {
    if (a == null || b == null || !b) return null;
    return ((a - b) / b) * 100;
  };
  // Bounce approx: % of boutique_views with no subsequent product_view
  const bounce = cur && cur.views > 0
    ? Math.max(0, Math.min(100, ((cur.views - cur.product_views) / cur.views) * 100))
    : 0;
  const bouncePrev = prev && prev.views > 0
    ? Math.max(0, Math.min(100, ((prev.views - prev.product_views) / prev.views) * 100))
    : 0;

  const productMap = new Map(products.map((p: any) => [p.id, p]));
  // Augment scenes with page info + filter
  const scenesWithPage = useMemo(() => scenes.map((s: any) => {
    const pageId = sceneIndex[s.scene_id] ?? null;
    const page = pageId ? pagesById.get(pageId) : null;
    return { ...s, page_id: pageId, page_title: page?.title ?? null, page_slug: page?.slug ?? null };
  }), [scenes, sceneIndex, pagesById]);
  const filteredScenes = useMemo(() => {
    if (scenePageFilter === "all") return scenesWithPage;
    if (scenePageFilter === "home") return scenesWithPage.filter((s) => !s.page_id);
    return scenesWithPage.filter((s) => s.page_id === scenePageFilter);
  }, [scenesWithPage, scenePageFilter]);

  const boutiqueName = boutique?.name || "Boutique";
  const periodLabel = `${days}j vs période précédente`;

  // Export helpers ----------------------------------------------------------
  const exportPages = (fmt: "csv" | "pdf") => {
    const rows = pages.map((p) => {
      const r = pageRows.find((x) => x.page_id === p.id);
      const views = Number(r?.views ?? 0);
      const uniques = Number(r?.unique_visitors ?? 0);
      return {
        title: p.title,
        slug: `/${p.slug}`,
        views,
        uniques,
        engagement: views ? `${((uniques / views) * 100).toFixed(0)}%` : "—",
      };
    });
    const cols = [
      { header: "Page", accessor: (r: any) => r.title },
      { header: "Slug", accessor: (r: any) => r.slug },
      { header: "Vues", accessor: (r: any) => String(r.views) },
      { header: "Uniques", accessor: (r: any) => String(r.uniques) },
      { header: "Engagement", accessor: (r: any) => r.engagement },
    ];
    const title = `Analytics par page — ${periodLabel}`;
    const filename = `analytics-pages-${days}j`;
    if (fmt === "csv") exportToCSV(rows, cols, filename, { boutiqueName });
    else exportToPDF(rows, cols, title, filename, { boutiqueName });
  };

  const exportScenes = (fmt: "csv" | "pdf") => {
    const cols = [
      { header: "Scène", accessor: (r: any) => findSceneDefinition(r.scene_type)?.name ?? r.scene_type },
      { header: "Type", accessor: (r: any) => r.scene_type },
      { header: "Page", accessor: (r: any) => r.page_title ?? "Accueil" },
      { header: "ID scène", accessor: (r: any) => r.scene_id },
      { header: "Impressions", accessor: (r: any) => String(r.impressions) },
      { header: "Clics CTA", accessor: (r: any) => String(r.cta_clicks) },
      { header: "CTR %", accessor: (r: any) => Number(r.ctr).toFixed(2) },
      { header: "Dwell (s)", accessor: (r: any) => (Number(r.avg_dwell_ms) / 1000).toFixed(1) },
      { header: "Scroll %", accessor: (r: any) => Number(r.avg_scroll_pct).toFixed(0) },
      { header: "Conv. %", accessor: (r: any) => Number(r.conversion_rate).toFixed(2) },
    ];
    const title = `Analytics par scène — ${periodLabel}`;
    const filename = `analytics-scenes-${days}j`;
    if (fmt === "csv") exportToCSV(filteredScenes, cols, filename, { boutiqueName });
    else exportToPDF(filteredScenes, cols, title, filename, { boutiqueName });
  };

  const exportProducts = (fmt: "csv" | "pdf") => {
    const rows = funnel.map((r) => {
      const p: any = productMap.get(r.product_id);
      return {
        name: p?.supplier_products?.name || p?.name || "Produit",
        id: r.product_id,
        views: Number(r.views),
        cart: Number(r.add_to_cart),
        purchases: Number(r.purchases),
        conv: `${Number(r.conversion_rate).toFixed(2)}%`,
      };
    });
    const cols = [
      { header: "Produit", accessor: (r: any) => r.name },
      { header: "ID", accessor: (r: any) => r.id },
      { header: "Vues", accessor: (r: any) => String(r.views) },
      { header: "Panier", accessor: (r: any) => String(r.cart) },
      { header: "Achats", accessor: (r: any) => String(r.purchases) },
      { header: "Conv.", accessor: (r: any) => r.conv },
    ];
    const title = `Top produits — ${periodLabel}`;
    const filename = `analytics-produits-${days}j`;
    if (fmt === "csv") exportToCSV(rows, cols, filename, { boutiqueName });
    else exportToPDF(rows, cols, title, filename, { boutiqueName });
  };

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Boutiques · Studio"
        title={boutique ? `Analytics : ${boutique.name}` : "Analytics Studio"}
        subtitle="Performance par page, par scène et par produit — pour optimiser ce qui vend."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Boutiques", href: EDITOR_ROUTES.boutiquesList() },
          { label: boutique?.name ?? "…" },
        ]}
        actions={
          id && (
            <Link to={EDITOR_ROUTES.boutiqueEdit(id)}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Éditeur
              </Button>
            </Link>
          )
        }
      />

      {/* Range selector */}
      <div className="flex items-center gap-2 mb-4">
        {RANGES.map((r) => (
          <Button
            key={r.days}
            size="sm"
            variant={days === r.days ? "default" : "outline"}
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </Button>
        ))}
        <span className="text-xs text-muted-foreground ml-2">vs période précédente</span>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi icon={Eye}    label="Vues"            value={fmt(cur?.views)}            delta={delta(cur?.views, prev?.views)} />
        <Kpi icon={Users}  label="Visiteurs uniques" value={fmt(cur?.unique_visitors)} delta={delta(cur?.unique_visitors, prev?.unique_visitors)} />
        <Kpi icon={ShoppingBag} label="Commandes"   value={fmt(cur?.orders)}            delta={delta(cur?.orders, prev?.orders)} />
        <Kpi icon={ChevronsDown} label="Taux de rebond" value={`${bounce.toFixed(0)}%`} delta={delta(bounce, bouncePrev)} invertDelta />
      </div>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList>
          <TabsTrigger value="pages" className="gap-1.5"><FileText className="w-3.5 h-3.5" />Par page</TabsTrigger>
          <TabsTrigger value="scenes" className="gap-1.5"><BarChart3 className="w-3.5 h-3.5" />Par scène</TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5"><Package className="w-3.5 h-3.5" />Top produits</TabsTrigger>
        </TabsList>

        {/* PER PAGE */}
        <TabsContent value="pages" className="mt-4">
          <SectionCard
            title="Performance par page"
            description="Vues et visiteurs uniques de chaque page de votre boutique."
            actions={<ExportMenu onExport={exportPages} />}
          >
            {pagesLoading ? (
              <Spinner />
            ) : pages.length === 0 ? (
              <Empty label="Créez des pages dans l'éditeur pour voir leurs statistiques." />
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                      <th className="py-2 px-3">Page</th>
                      <th className="py-2 px-3 text-right">Vues</th>
                      <th className="py-2 px-3 text-right">Uniques</th>
                      <th className="py-2 px-3 text-right">Engagement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((p) => {
                      const r = pageRows.find((x) => x.page_id === p.id);
                      const views = Number(r?.views ?? 0);
                      const uniques = Number(r?.unique_visitors ?? 0);
                      const engagement = views ? (uniques / views) * 100 : 0;
                      return (
                        <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30">
                          <td className="py-2.5 px-3">
                            <div className="font-medium">{p.title}</div>
                            <div className="text-[11px] text-muted-foreground">/{p.slug}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">{views.toLocaleString("fr-FR")}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">{uniques.toLocaleString("fr-FR")}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            <Badge variant="outline" className={engagement >= 70 ? "bg-success/15 text-success border-transparent" : "bg-muted text-muted-foreground border-transparent"}>
                              {engagement.toFixed(0)}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* PER SCENE */}
        <TabsContent value="scenes" className="mt-4">
          <SectionCard
            title="Performance par scène"
            description="Impressions, CTR, temps passé et scroll de chaque scène publiée."
            actions={
              <div className="flex items-center gap-2">
                <Select value={scenePageFilter} onValueChange={setScenePageFilter}>
                  <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue placeholder="Toutes les pages" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les pages</SelectItem>
                    <SelectItem value="home">Accueil</SelectItem>
                    {pages.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <ExportMenu onExport={exportScenes} />
              </div>
            }
          >
            {scenesLoading ? (
              <Spinner />
            ) : filteredScenes.length === 0 ? (
              <Empty label="Aucune donnée pour cette période. Publiez votre boutique pour collecter des vues." />
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                      <th className="py-2 px-3">Scène</th>
                      <th className="py-2 px-3">Page</th>
                      <th className="py-2 px-3 text-right"><Eye className="inline w-3.5 h-3.5" /></th>
                      <th className="py-2 px-3 text-right"><MousePointerClick className="inline w-3.5 h-3.5" /></th>
                      <th className="py-2 px-3 text-right">CTR</th>
                      <th className="py-2 px-3 text-right"><Clock className="inline w-3.5 h-3.5" /></th>
                      <th className="py-2 px-3 text-right"><ChevronsDown className="inline w-3.5 h-3.5" /></th>
                      <th className="py-2 px-3 text-right">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScenes.map((r: any) => {
                      const def = findSceneDefinition(r.scene_type);
                      return (
                        <tr key={r.scene_id} className="border-b border-border/40 hover:bg-muted/30">
                          <td className="py-2.5 px-3">
                            <div className="font-medium">{def?.name ?? r.scene_type}</div>
                            <div className="text-[11px] text-muted-foreground font-mono">{String(r.scene_id).slice(0, 8)}…</div>
                          </td>
                          <td className="py-2.5 px-3">
                            {id && (
                              <Link
                                to={r.page_id
                                  ? `${EDITOR_ROUTES.boutiqueEdit(id)}?page=${r.page_id}#scene-${r.scene_id}`
                                  : `${EDITOR_ROUTES.boutiqueEdit(id)}#scene-${r.scene_id}`}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                {r.page_title ?? "Accueil"}
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">{Number(r.impressions).toLocaleString("fr-FR")}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">{Number(r.cta_clicks).toLocaleString("fr-FR")}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums"><CtrBadge value={Number(r.ctr)} /></td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            {Number(r.avg_dwell_ms) > 0 ? `${(Number(r.avg_dwell_ms) / 1000).toFixed(1)}s` : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            {Number(r.avg_scroll_pct) > 0 ? `${Number(r.avg_scroll_pct).toFixed(0)}%` : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">{Number(r.conversion_rate).toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        {/* PRODUCTS */}
        <TabsContent value="products" className="mt-4">
          <SectionCard
            title="Top produits"
            description="Vues, ajouts au panier et achats par produit sur la période."
            actions={<ExportMenu onExport={exportProducts} />}
          >
            {funnelLoading ? (
              <Spinner />
            ) : funnel.length === 0 ? (
              <Empty label="Aucune donnée produit pour cette période." />
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
                      <th className="py-2 px-3">Produit</th>
                      <th className="py-2 px-3 text-right">Vues</th>
                      <th className="py-2 px-3 text-right">Panier</th>
                      <th className="py-2 px-3 text-right">Achats</th>
                      <th className="py-2 px-3 text-right">Conv.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funnel.map((row) => {
                      const p: any = productMap.get(row.product_id);
                      return (
                        <tr key={row.product_id} className="border-b border-border/40 hover:bg-muted/30">
                          <td className="py-2.5 px-3">
                            <div className="font-medium truncate max-w-[200px]">{p?.name ?? "Produit"}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{row.product_id.slice(0, 8)}…</div>
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">{Number(row.views).toLocaleString("fr-FR")}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">{Number(row.add_to_cart).toLocaleString("fr-FR")}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">{Number(row.purchases).toLocaleString("fr-FR")}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums"><CtrBadge value={Number(row.conversion_rate)} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

function fmt(n?: number | null): string {
  return Number(n ?? 0).toLocaleString("fr-FR");
}

function Kpi({
  icon: Icon, label, value, delta, invertDelta,
}: {
  icon: React.ElementType; label: string; value: string; delta?: number | null; invertDelta?: boolean;
}) {
  const showDelta = delta != null && isFinite(delta);
  const positive = showDelta && (invertDelta ? delta < 0 : delta > 0);
  const negative = showDelta && (invertDelta ? delta > 0 : delta < 0);
  const DeltaIcon = !showDelta || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const tone = positive ? "text-success" : negative ? "text-destructive" : "text-muted-foreground";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {showDelta && (
          <div className={`flex items-center gap-0.5 text-xs font-medium tabular-nums ${tone}`}>
            <DeltaIcon className="w-3 h-3" />
            {Math.abs(delta).toFixed(0)}%
          </div>
        )}
      </div>
    </Card>
  );
}

function Spinner() {
  return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin opacity-50" /></div>;
}

function Empty({ label }: { label: string }) {
  return <div className="py-12 text-center text-sm text-muted-foreground">{label}</div>;
}

function CtrBadge({ value }: { value: number }) {
  const tone =
    value >= 5 ? "bg-success/15 text-success" :
    value >= 2 ? "bg-warning/15 text-warning" :
    "bg-muted text-muted-foreground";
  return <Badge variant="outline" className={`${tone} border-transparent`}>{value.toFixed(2)}%</Badge>;
}