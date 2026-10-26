import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

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
  ok: "border-success/20 bg-success/10 text-success",
  warning: "border-bib-gold/30 bg-bib-gold/10 text-bib-gold",
  critical: "border-destructive/20 bg-destructive/10 text-destructive",
} as const;

export function HealthScoreCard() {
  useLanguage();
  const { score, level, signals, loading } = useBoutiqueHealth();

  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  const ringColor =
    level === "poor"
      ? "hsl(var(--destructive))"
      : level === "fair"
        ? "hsl(var(--bib-gold))"
        : "hsl(var(--primary))";

  return (
    <SectionCard
      icon={<Heart className="h-4 w-4" />}
      title={translateUi("Santé de la boutique")}
      description={translateUi(
        "Les signaux essentiels pour garder votre activité sur la bonne voie.",
      )}
    >
      <div className="grid grid-cols-1 items-center gap-6 pt-3 md:grid-cols-[160px_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-muted/20 px-4 py-5">
          <div className="relative h-32 w-32">
            <svg
              className="h-full w-full -rotate-90"
              viewBox="0 0 100 100"
              role="img"
              aria-label={
                loading
                  ? translateUi("Chargement du score de santé")
                  : translateUi("Score de santé : {v0} sur 100", {
                      v0: safeScore,
                    })
              }
            >
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={ringColor}
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={loading ? circumference : offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold tracking-tight text-foreground">
                {loading ? "—" : safeScore}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {translateUi("sur 100")}
              </span>
            </div>
          </div>

          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                loading
                  ? "bg-muted-foreground"
                  : level === "poor"
                    ? "bg-destructive"
                    : level === "fair"
                      ? "bg-bib-gold"
                      : "bg-primary",
              )}
            />
            {loading
              ? translateUi("Analyse en cours")
              : (LEVEL_LABEL[level] ?? translateUi("État à confirmer"))}
          </span>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">
              {translateUi("Points de vigilance")}
            </h3>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {loading
                ? translateUi("Actualisation")
                : `${signals.length} signal${signals.length > 1 ? "s" : ""}`}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[76px] animate-pulse rounded-xl border border-border/60 bg-muted/40"
                />
              ))}
            </div>
          ) : signals.length === 0 ? (
            <div className="rounded-xl border border-success/20 bg-success/5 p-4">
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-sm font-semibold">
                  {translateUi("Aucun signal à afficher")}
                </p>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {translateUi(
                  "Les prochains indicateurs apparaîtront ici lorsque des données seront disponibles.",
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {signals.map((signal) => {
                const Icon = STATUS_ICON[signal.status];

                return (
                  <div
                    key={signal.key}
                    className="flex min-w-0 items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5 transition-colors hover:bg-muted/30"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                        STATUS_TONE[signal.status],
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-5 text-foreground">
                        {signal.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {signal.hint}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
