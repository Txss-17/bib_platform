import { ReactNode } from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiTileProps {
  label: string;
  value: ReactNode;
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  hint?: string;
  /** Visual emphasis variant */
  tone?: "default" | "primary" | "gold";
}

/**
 * Compact KPI tile — readable in <5s, on-brand marine + gold.
 * Used everywhere we surface a numeric headline.
 */
export function KpiTile({ label, value, trend, trendLabel, icon, hint, tone = "default" }: KpiTileProps) {
  const isUp = typeof trend === "number" && trend > 0;
  const isDown = typeof trend === "number" && trend < 0;
  const isFlat = typeof trend === "number" && trend === 0;

  const toneClasses = {
    default: "bg-card",
    primary: "bg-primary text-primary-foreground border-primary/20",
    gold: "bg-secondary/10 border-secondary/30",
  } as const;

  const iconBgClasses = {
    default: "bg-secondary/15 text-secondary",
    primary: "bg-primary-foreground/10 text-primary-foreground",
    gold: "bg-secondary text-secondary-foreground",
  } as const;

  return (
    <Card
      className={cn(
        "border-border/60 shadow-sm rounded-2xl transition-all hover:shadow-md",
        toneClasses[tone],
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                "text-xs sm:text-sm font-medium",
                tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                "font-display text-2xl sm:text-3xl font-bold mt-1 leading-none truncate",
                tone === "primary" ? "text-primary-foreground" : "text-foreground",
              )}
            >
              {value}
            </p>
            {(typeof trend === "number" || hint) && (
              <div className="flex items-center gap-2 mt-3">
                {typeof trend === "number" && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5",
                      isUp && "bg-emerald-500/10 text-emerald-600",
                      isDown && "bg-destructive/10 text-destructive",
                      isFlat && "bg-muted text-muted-foreground",
                    )}
                  >
                    {isUp && <TrendingUp className="w-3 h-3" />}
                    {isDown && <TrendingDown className="w-3 h-3" />}
                    {isFlat && <Minus className="w-3 h-3" />}
                    {isUp ? "+" : ""}
                    {trend}%
                  </span>
                )}
                {(trendLabel || hint) && (
                  <span
                    className={cn(
                      "text-xs",
                      tone === "primary" ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {trendLabel || hint}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                iconBgClasses[tone],
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton placeholder matching KpiTile dimensions for consistent loading states.
 */
export function KpiTileSkeleton({ tone = "default" as KpiTileProps["tone"] } = {}) {
  const toneClasses =
    tone === "primary"
      ? "bg-primary/90"
      : tone === "gold"
        ? "bg-secondary/10 border-secondary/30"
        : "bg-card";
  return (
    <Card className={cn("border-border/60 shadow-sm rounded-2xl", toneClasses)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-muted/60 animate-pulse" />
            <div className="h-8 w-32 rounded bg-muted/70 animate-pulse" />
            <div className="h-4 w-20 rounded-full bg-muted/50 animate-pulse" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-muted/50 animate-pulse shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}