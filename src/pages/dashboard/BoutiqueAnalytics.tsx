import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Eye, MousePointerClick, ShoppingBag, Clock, ChevronsDown, Loader2 } from "lucide-react";
import { useSceneAnalyticsSummary } from "@/hooks/useSceneAnalyticsSummary";
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

  const { data: rows = [], isLoading } = useSceneAnalyticsSummary(id, days);

  const totals = rows.reduce(
    (acc, r) => ({
      impressions: acc.impressions + Number(r.impressions || 0),
      clicks: acc.clicks + Number(r.cta_clicks || 0),
      conversions: acc.conversions + Number(r.conversions || 0),
    }),
    { impressions: 0, clicks: 0, conversions: 0 },
  );
  const globalCtr = totals.impressions
    ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
    : "0.00";
  const globalCvr = totals.impressions
    ? ((totals.conversions / totals.impressions) * 100).toFixed(2)
    : "0.00";

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Boutiques · Studio"
        title={boutique ? `Analytics : ${boutique.name}` : "Analytics Studio"}
        subtitle="Vues, CTR, temps passé et conversions par scène — pour optimiser ce qui vend."
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
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi icon={Eye} label="Impressions" value={totals.impressions.toLocaleString("fr-FR")} />
        <Kpi icon={MousePointerClick} label="Clics CTA" value={totals.clicks.toLocaleString("fr-FR")} />
        <Kpi icon={BarChart3} label="CTR global" value={`${globalCtr}%`} />
        <Kpi icon={ShoppingBag} label="Conversion" value={`${globalCvr}%`} />
      </div>

      <SectionCard
        title="Performance par scène"
        description="Triées par impressions. Cliquez sur une ligne pour copier l'identifiant de scène."
      >
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin opacity-50" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Aucune donnée pour cette période. Publiez votre boutique pour collecter des vues.
          </div>
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
                {rows.map((r) => {
                  const def = findSceneDefinition(r.scene_type);
                  return (
                    <tr
                      key={r.scene_id}
                      className="border-b border-border/40 hover:bg-muted/30 cursor-pointer"
                      onClick={() => navigator.clipboard?.writeText(r.scene_id)}
                      title="Cliquer pour copier l'ID"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-medium">{def?.name ?? r.scene_type}</div>
                        <div className="text-[11px] text-muted-foreground">{r.scene_type}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{Number(r.impressions).toLocaleString("fr-FR")}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{Number(r.cta_clicks).toLocaleString("fr-FR")}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        <CtrBadge value={Number(r.ctr)} />
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {Number(r.avg_dwell_ms) > 0 ? `${(Number(r.avg_dwell_ms) / 1000).toFixed(1)}s` : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {Number(r.avg_scroll_pct) > 0 ? `${Number(r.avg_scroll_pct).toFixed(0)}%` : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {Number(r.conversion_rate).toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </DashboardLayout>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
    </Card>
  );
}

function CtrBadge({ value }: { value: number }) {
  const tone =
    value >= 5 ? "bg-success/15 text-success" :
    value >= 2 ? "bg-warning/15 text-warning" :
    "bg-muted text-muted-foreground";
  return <Badge variant="outline" className={`${tone} border-transparent`}>{value.toFixed(2)}%</Badge>;
}