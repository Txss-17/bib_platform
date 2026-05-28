import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useAlertSettings, useAlertLog, useResolveAlert } from "@/hooks/useBoutiqueAlerts";
import { runBoutiqueAlertCheck } from "@/lib/boutiqueAlertChecker";
import { SectionCard } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, PlayCircle, Loader2, Check, Settings, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/** Compact alerts panel — list latest alerts, run check, link to settings. */
export function BoutiqueAlertsCard() {
  const { data: boutiques = [] } = useBoutiques();
  const [boutiqueId, setBoutiqueId] = useState("");
  const activeId = boutiqueId || boutiques[0]?.id || "";
  const { data: settings } = useAlertSettings(activeId);
  const { data: log = [], refetch } = useAlertLog(activeId, 8);
  const resolve = useResolveAlert();
  const [running, setRunning] = useState(false);

  const open = useMemo(() => log.filter((a) => !a.resolved_at), [log]);

  if (boutiques.length === 0) return null;

  const runNow = async () => {
    if (!settings) return;
    setRunning(true);
    try {
      const res = await runBoutiqueAlertCheck(settings);
      await refetch();
      if (res.created === 0) toast.success("RAS — pas de nouvelle alerte");
      else toast.success(`${res.created} alerte(s) détectée(s)`);
    } catch (e: any) { toast.error(e.message || "Erreur"); }
    finally { setRunning(false); }
  };

  return (
    <SectionCard
      icon={<Bell className="w-4 h-4" />}
      title="Alertes automatiques"
      description={open.length > 0 ? `${open.length} alerte(s) en cours` : "Surveillance en temps réel"}
      actions={
        <div className="flex items-center gap-2">
          {boutiques.length > 1 && (
            <Select value={activeId} onValueChange={setBoutiqueId}>
              <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {boutiques.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button size="sm" variant="outline" onClick={runNow} disabled={running} className="gap-1">
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <PlayCircle className="w-3 h-3" />}
            Vérifier
          </Button>
          <Link to="/dashboard/parametres?tab=alerts">
            <Button size="sm" variant="ghost" className="gap-1"><Settings className="w-3 h-3" /></Button>
          </Link>
        </div>
      }
    >
      {log.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Aucune alerte. Cliquez sur « Vérifier » pour lancer un diagnostic.
        </div>
      ) : (
        <ul className="divide-y divide-border/40">
          {log.map((a) => (
            <li key={a.id} className="py-2.5 flex items-start gap-3">
              <SeverityDot s={a.severity} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${a.resolved_at ? "line-through text-muted-foreground" : ""}`}>
                    {a.title}
                  </p>
                  {a.email_status === "sent" && <Badge variant="outline" className="text-[10px]">Email envoyé</Badge>}
                </div>
                {a.message && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.message}</p>}
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {new Date(a.created_at).toLocaleString("fr-FR")}
                </p>
              </div>
              {!a.resolved_at && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 gap-1"
                  onClick={() => resolve.mutate(a.id)}
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function SeverityDot({ s }: { s: string }) {
  const tone =
    s === "critical" ? "bg-destructive" :
    s === "warning" ? "bg-warning" :
    "bg-info";
  return (
    <div className={`w-2 h-2 rounded-full ${tone} mt-1.5 shrink-0`} aria-label={s}>
      <AlertTriangle className="w-0 h-0" />
    </div>
  );
}