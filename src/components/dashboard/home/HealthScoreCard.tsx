import { CheckCircle2, AlertTriangle, AlertCircle, Heart } from "lucide-react";
import { SectionCard } from "@/components/dashboard/shared";
import { useBoutiqueHealth } from "@/hooks/useBoutiqueHealth";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<string, string> = {
  excellent: "Excellente santé",
  good: "Bonne santé",
  fair: "À surveiller",
  poor: "Action requise",
};

const STATUS_ICON = {
  ok: CheckCircle2,
  warning: AlertTriangle,
  critical: AlertCircle,
} as const;

const STATUS_TONE = {
  ok: "text-emerald-600 bg-emerald-500/10",
  warning: "text-secondary bg-secondary/15",
  critical: "text-destructive bg-destructive/10",
} as const;

/**
 * Premium "Boutique health" card — replaces the legacy KPI grid header.
 * Shows a 0-100 score, a qualitative level and a list of actionable signals.
 */
export function HealthScoreCard() {
  const { score, level, signals, loading } = useBoutiqueHealth();

  // Circular progress geometry
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const ringColor =
    level === "excellent" || level === "good"
      ? "hsl(var(--secondary))"
      : level === "fair"
        ? "hsl(var(--secondary))"
        : "hsl(var(--destructive))";

  return (
    <SectionCard
      icon={<Heart className="w-4 h-4" />}
      title="Santé de la boutique"
      description="Vue d'ensemble en temps réel de votre activité"
    >
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-center pt-2">
        {/* Score ring */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-[120px] h-[120px]">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={ringColor}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={loading ? circumference : offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-bold text-foreground leading-none">
                {loading ? "—" : score}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                /100
              </span>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">
            {loading ? "Analyse…" : LEVEL_LABEL[level]}
          </p>
        </div>

        {/* Signals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {signals.map((s) => {
            const Icon = STATUS_ICON[s.status];
            return (
              <div
                key={s.key}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    STATUS_TONE[s.status],
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.hint}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}