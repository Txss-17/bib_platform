import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";

interface RegionData {
  location: string;
  revenue: number;
  orders: number;
}
interface SalesHeatmapProps {
  data: RegionData[];
  title?: string;
}

/** Ranked and proportional paid-sales breakdown by declared selling market.
 * No fake map, city or geographical precision is inferred from the market code.
 */
export function SalesHeatmap({ data, title }: SalesHeatmapProps) {
  useLanguage();
  const sorted = useMemo(() => [...data].filter(r => r.orders > 0)
    .sort((a, b) => b.revenue - a.revenue).slice(0, 12), [data]);
  const max = Math.max(1, ...sorted.map(r => r.revenue));
  const total = sorted.reduce((sum, r) => sum + r.revenue, 0);
  const money = (value: number) => new Intl.NumberFormat(getUiLocale(), {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(value);

  if (!sorted.length) return <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
    <p className="text-sm font-medium text-foreground">{translateUi("Aucune vente payée localisée par marché")}</p>
    <p className="mt-2 text-xs text-muted-foreground">{translateUi("Cette répartition sera alimentée par les commandes réellement payées. Les commandes de test sont exclues.")}</p>
  </div>;

  return <div className="space-y-4">
    {title && <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      {sorted.map((item, index) => (
        <div key={item.location} className="min-w-0 rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{translateUi("Marché")} {String(index + 1).padStart(2,"0")}</p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground" title={item.location}>{item.location}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-semibold tabular-nums text-foreground">{money(item.revenue)}</p>
              <p className="mt-1 text-xs tabular-nums text-muted-foreground">{item.orders} {translateUi("commandes")}</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" role="meter" aria-label={item.location} aria-valuemin={0} aria-valuemax={100} aria-valuenow={total ? Math.round(item.revenue / total * 100) : 0}>
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(3, item.revenue / max * 100)}%` }} />
          </div>
          <p className="mt-2 text-right text-xs text-muted-foreground tabular-nums">
            {total ? (item.revenue / total * 100).toLocaleString(getUiLocale(), { maximumFractionDigits: 1 }) : "0"} % {translateUi("du chiffre d'affaires analysé")}
          </p>
        </div>
      ))}
    </div>
  </div>;
}
