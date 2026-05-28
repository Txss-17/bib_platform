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
import { useState } from "react";
import { EDITOR_ROUTES } from "@/lib/editorRoutes";

const RANGES: { label: string; days: number }[] = [
  { label: "7 j", days: 7 },
  { label: "30 j", days: 30 },
  { label: "90 j", days: 90 },
];

export default function BoutiqueAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState(30);
  const [pageFilter, setPageFilter] = useState<string | "all">("all");

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

  const cur = kpis?.current;
  const prev = kpis?.previous;
  const delta = (a?: number, b?: number) => {
    if (a == null || b == null || !b) return null;
    return ((a - b) / b) * 100;
  };
  const bounceCur = cur && cur.views ? Math.max(0, 1 - cur.unique_visitors / cur.views) * 0 + (cur.views > cur.unique_visitors ? ((cur.views - (cur.product_views + cur.add_to_cart)) / cur.views) * 100 : 0) : 0;
  // Simpler bounce: % of views with no product_view/add_to_cart (approx)
  const bounce = cur && cur.views > 0
    ? Math.max(0, Math.min(100, ((cur.views - cur.product_views) / cur.views) * 100))
    : 0;
  const bouncePrev = prev && prev.views > 0
    ? Math.max(0, Math.min(100, ((prev.views - prev.product_views) / prev.views) * 100))
    : 0;

  const pageMap = new Map(pages.map((p) => [p.id, p]));
  const productMap = new Map(products.map((p: any) => [p.id, p]));

  const filteredScenes = pageFilter === "all"
    ? scenes
    : scenes.filter((s: any) => {
        // scenes summary doesn't directly carry page_id; surface all when boutique-wide
        // (Per-page scene drill-down requires scene rows enriched with page_id, V2.)
        return true;
      });

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
          <SectionCard title="Performance par page" description="Vues et visiteurs uniques de chaque page de votre boutique.">
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
                            <div className="text-[11px] text-muted-foreground">{r.scene_type}</div>
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