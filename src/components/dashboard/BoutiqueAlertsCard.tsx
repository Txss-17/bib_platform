import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Check,
  CircleCheck,
  Loader2,
  PlayCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import { useBoutiques } from "@/hooks/useBoutiques";
import {
  useAlertSettings,
  useAlertLog,
  useResolveAlert,
} from "@/hooks/useBoutiqueAlerts";
import { runBoutiqueAlertCheck } from "@/lib/boutiqueAlertChecker";

import { SectionCard } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AlertSeverity = "critical" | "warning" | "info" | string;

const severityConfig: Record<
  string,
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  critical: {
    get label() {
      return translateUi("Critique");
    },
    className: "border-destructive/25 bg-destructive/10 text-destructive",
    icon: AlertTriangle,
  },
  warning: {
    get label() {
      return translateUi("À surveiller");
    },
    className: "border-secondary/40 bg-secondary/15 text-secondary-foreground",
    icon: AlertTriangle,
  },
  info: {
    label: "Information",
    className: "border-primary/20 bg-primary/10 text-primary",
    icon: Bell,
  },
};

function getSeverity(severity: AlertSeverity) {
  return (
    severityConfig[severity] ?? {
      label: "Notification",
      className: "border-border bg-muted text-muted-foreground",
      icon: Bell,
    }
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return translateUi("Date indisponible");
  }

  return new Intl.DateTimeFormat(getUiLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function BoutiqueAlertsCard() {
  useLanguage();
  const { data: boutiques = [] } = useBoutiques();

  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState("");
  const [running, setRunning] = useState(false);

  const activeId = selectedBoutiqueId || boutiques[0]?.id || "";

  const { data: settings } = useAlertSettings(activeId);
  const { data: log = [], refetch } = useAlertLog(activeId, 8);
  const resolve = useResolveAlert();

  const openCount = useMemo(
    () => log.filter((alert) => !alert.resolved_at).length,
    [log],
  );

  const criticalCount = useMemo(
    () =>
      log.filter((alert) => !alert.resolved_at && alert.severity === "critical")
        .length,
    [log],
  );

  if (boutiques.length === 0) {
    return null;
  }

  const runNow = async () => {
    if (!settings || running) return;

    setRunning(true);

    try {
      const result = await runBoutiqueAlertCheck(settings);
      await refetch();

      if (result.created === 0) {
        toast.success(
          translateUi("Diagnostic terminé : aucune nouvelle alerte."),
        );
      } else {
        toast.success(
          translateUi("Diagnostic terminé : {v0} nouvelle(s) alerte(s).", {
            v0: result.created,
          }),
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de lancer le diagnostic.";

      toast.error(message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <SectionCard
      icon={<Bell className="h-4 w-4" />}
      title={translateUi("Centre d’alertes")}
      description={translateUi(
        "Surveillez les événements qui nécessitent votre attention.",
      )}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {boutiques.length > 1 && (
            <Select value={activeId} onValueChange={setSelectedBoutiqueId}>
              <SelectTrigger
                className="h-9 w-[150px] text-xs"
                aria-label={translateUi("Choisir une boutique")}
              >
                <SelectValue placeholder="Boutique" />
              </SelectTrigger>

              <SelectContent>
                {boutiques.map((boutique) => (
                  <SelectItem key={boutique.id} value={boutique.id}>
                    {boutique.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={runNow}
            disabled={running || !settings}
            className="gap-2"
          >
            {running ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5" />
            )}
            {running ? translateUi("Analyse…") : translateUi("Vérifier")}
          </Button>

          <Button
            asChild
            size="icon"
            variant="ghost"
            className="h-9 w-9"
            aria-label={translateUi("Configurer les alertes")}
          >
            <Link to="/dashboard/parametres?tab=alerts">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">
            {translateUi("Alertes ouvertes")}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {openCount}
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            criticalCount > 0
              ? "border-destructive/25 bg-destructive/5"
              : "border-border/70 bg-muted/20"
          }`}
        >
          <p className="text-xs text-muted-foreground">
            {translateUi("Alertes critiques")}
          </p>
          <p
            className={`mt-1 text-2xl font-semibold tracking-tight ${
              criticalCount > 0 ? "text-destructive" : "text-foreground"
            }`}
          >
            {criticalCount}
          </p>
        </div>
      </div>

      {log.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-5 py-8 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CircleCheck className="h-5 w-5" />
          </span>

          <p className="mt-3 text-sm font-semibold text-foreground">
            {translateUi("Aucune alerte enregistrée")}
          </p>

          <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
            {translateUi(
              "Lancez un diagnostic pour vérifier les points surveillés selon les paramètres de cette boutique.",
            )}
          </p>

          <Button
            size="sm"
            variant="outline"
            onClick={runNow}
            disabled={running || !settings}
            className="mt-4 gap-2"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {translateUi("Lancer le diagnostic")}
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border/70">
          {log.map((alert) => {
            const config = getSeverity(alert.severity);
            const SeverityIcon = config.icon;
            const resolved = Boolean(alert.resolved_at);

            return (
              <li
                key={alert.id}
                className="flex min-w-0 items-start gap-3 py-4 first:pt-1 last:pb-1"
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${config.className}`}
                >
                  <SeverityIcon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        resolved
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {alert.title}
                    </p>

                    <Badge
                      variant="outline"
                      className={`text-[10px] ${config.className}`}
                    >
                      {config.label}
                    </Badge>

                    {alert.email_status === "sent" && (
                      <Badge variant="outline" className="text-[10px]">
                        {translateUi("Email envoyé")}
                      </Badge>
                    )}

                    {resolved && (
                      <Badge variant="secondary" className="text-[10px]">
                        {translateUi("Résolue")}
                      </Badge>
                    )}
                  </div>

                  {alert.message && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {alert.message}
                    </p>
                  )}

                  <p className="mt-2 text-[11px] text-muted-foreground/80">
                    {formatDate(alert.created_at)}
                  </p>
                </div>

                {!resolved && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 shrink-0 gap-1.5 px-2 text-xs"
                    disabled={resolve.isPending}
                    aria-label={translateUi(
                      "Marquer l’alerte « {v0} » comme résolue",
                      { v0: alert.title },
                    )}
                    onClick={() => resolve.mutate(alert.id)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {translateUi("Résoudre")}
                    </span>
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
