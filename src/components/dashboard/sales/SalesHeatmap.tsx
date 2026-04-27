import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface RegionData {
  location: string;
  revenue: number;
  orders: number;
}

interface SalesHeatmapProps {
  data: RegionData[];
  title?: string;
}

/**
 * Lightweight 2D heatmap (no 3D / no globe).
 * Renders the top N regions as gold-graded tiles, ordered by revenue.
 * Premium, lisible en <5s — remplace l'ancienne carte 3D globale.
 */
export function SalesHeatmap({ data, title }: SalesHeatmapProps) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.revenue - a.revenue).slice(0, 12),
    [data],
  );
  const max = sorted[0]?.revenue || 1;

  if (sorted.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        Aucune vente géographique pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium">
          {title}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {sorted.map((r) => {
          const intensity = r.revenue / max;
          const opacity = Math.max(0.18, intensity);
          return (
            <div
              key={r.location}
              className={cn(
                "rounded-xl border border-secondary/30 p-3 transition-all hover:scale-[1.02] hover:shadow-md",
              )}
              style={{
                background: `linear-gradient(135deg, hsl(var(--bib-gold) / ${opacity}) 0%, hsl(var(--bib-gold) / ${opacity * 0.5}) 100%)`,
              }}
            >
              <p className="text-xs font-medium text-foreground/80 truncate">
                {r.location}
              </p>
              <p className="font-display text-lg font-bold text-foreground mt-0.5">
                {r.revenue.toLocaleString("fr-FR")} €
              </p>
              <p className="text-[11px] text-foreground/70 mt-0.5">
                {r.orders} commande{r.orders > 1 ? "s" : ""}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}