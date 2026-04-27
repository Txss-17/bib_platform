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
  /** Optional rolling micro-trend (e.g. last 30 min) drawn as a sparkline. */
  sparkline?: number[];
}

/**
 * Tiny inline SVG sparkline. No deps, scales to any container width.
 * Returns null when there is not enough data to draw a meaningful trend.
 */
function Sparkline({
  values,
  tone = "default",
}: {
  values: number[];
  tone: KpiTileProps["tone"];
}) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const step = w / (values.length - 1);
  const pts = values
    .map((v, i) => `${(i * step).toFixed(2)},${(h - ((v - min) / range) * h).toFixed(2)}`)
    .join(" ");

  // Marine on light tones, ivory on primary background, gold on gold tone.
  const stroke =
    tone === "primary"
      ? "hsl(var(--primary-foreground))"
      : tone === "gold"
        ? "hsl(var(--secondary))"
        : "hsl(var(--secondary))";
  const fillStop =
    tone === "primary"
      ? "hsl(var(--primary-foreground))"
      : "hsl(var(--secondary))";
  const gradId = `spark-grad-${tone}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="w-full h-7 mt-2 opacity-90"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillStop} stopOpacity={0.35} />
          <stop offset="100%" stopColor={fillStop} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#${gradId})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Compact KPI tile — readable in <5s, on-brand marine + gold.
 * Used everywhere we surface a numeric headline.
 */
export function KpiTile({
  label,
  value,
  trend,
  trendLabel,
  icon,
  hint,
  tone = "default",
  sparkline,
}: KpiTileProps) {
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
        {sparkline && sparkline.some((v) => v > 0) && (
          <Sparkline values={sparkline} tone={tone} />
        )}
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