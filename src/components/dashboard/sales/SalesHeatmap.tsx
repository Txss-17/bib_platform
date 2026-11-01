import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMemo } from "react";
import { Globe2 } from "lucide-react";

interface RegionData {
  location: string;
  revenue: number;
  orders: number;
}
interface SalesHeatmapProps {
  data: RegionData[];
  title?: string;
}

// The underlying sales feed provides commercial markets, not buyer coordinates.
// Never interpret market identifiers as countries, cities or map coordinates.
const PALETTE = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(203 67% 49%)",
  "hsl(154 53% 41%)",
  "hsl(267 55% 56%)",
  "hsl(24 83% 54%)",
  "hsl(338 61% 52%)",
  "hsl(178 53% 40%)",
];

export function SalesHeatmap({ data, title }: SalesHeatmapProps) {
  useLanguage();
  const sorted = useMemo(
    () => [...data]
      .filter((region) => region.orders > 0 && Number.isFinite(region.revenue) && region.revenue >= 0)
      .sort((a, b) => b.revenue - a.revenue),
    [data],
  );
  const total = sorted.reduce((sum, item) => sum + item.revenue, 0);
  const orders = sorted.reduce((sum, item) => sum + item.orders, 0);
  const displayed = sorted.slice(0, 7);
  const remainder = sorted.slice(7);
  const regions = remainder.length
    ? [...displayed, {
        location: translateUi("Autres marchés"),
        revenue: remainder.reduce((sum, item) => sum + item.revenue, 0),
        orders: remainder.reduce((sum, item) => sum + item.orders, 0),
      }]
    : displayed;
  const money = (value: number) => new Intl.NumberFormat(getUiLocale(), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
  const number = (value: number) => value.toLocaleString(getUiLocale());
  const percent = (value: number) =>
    total > 0 ? value / total * 100 : 0;

  let offset = 0;
  const segments = regions.map((region, index) => {
    const start = offset;
    offset += percent(region.revenue);
    return {
      ...region,
      color: PALETTE[index % PALETTE.length],
      start,
      end: offset,
    };
  });
  const gradient = total > 0
    ? `conic-gradient(${segments.map((segment) =>
        `${segment.color} ${segment.start}% ${segment.end}%`
      ).join(", ")})`
    : "conic-gradient(hsl(var(--muted)) 0% 100%)";

  if (!sorted.length) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 text-center">
        <span className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
          <Globe2 className="h-6 w-6" />
        </span>
        <p className="font-semibold text-foreground">
          {translateUi("Vos marchés apparaîtront ici")}
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {translateUi("Découvrez les zones qui contribuent le plus à votre chiffre d’affaires dès vos premières ventes.")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      <div className="grid items-center gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-4">
          <div
            role="img"
            aria-label={translateUi("Répartition du chiffre d’affaires par marché commercial")}
            className="relative aspect-square w-full max-w-[270px] rounded-full p-[17%] shadow-sm"
            style={{ background: gradient }}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-card text-center shadow-inner">
              <span className="text-[11px] font-medium text-muted-foreground">
                {translateUi("Chiffre d’affaires")}
              </span>
              <span className="mt-1 px-2 text-xl font-bold tracking-tight text-foreground tabular-nums sm:text-2xl">
                {money(total)}
              </span>
              <span className="mt-1 text-xs text-muted-foreground tabular-nums">
                {number(orders)} {translateUi("commandes")}
              </span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {number(sorted.length)} {translateUi("marchés commerciaux")}
          </p>
        </div>
        <div className="min-w-0 space-y-2.5">
          {segments.map((region) => (
            <div key={region.location} className="rounded-xl border border-border/70 bg-card px-3 py-3">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: region.color }} />
                  <span className="truncate text-sm font-medium text-foreground" title={region.location}>
                    {region.location}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                  {percent(region.revenue).toLocaleString(getUiLocale(), { maximumFractionDigits: 1 })} %
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full" style={{
                  width: `${percent(region.revenue)}%`,
                  backgroundColor: region.color,
                }} />
              </div>
              <div className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
                <span className="tabular-nums">{money(region.revenue)}</span>
                <span className="tabular-nums">{number(region.orders)} {translateUi("commandes")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
        {translateUi("Analyse par zone commerciale associée aux commandes.")}
      </p>
    </div>
  );
}
