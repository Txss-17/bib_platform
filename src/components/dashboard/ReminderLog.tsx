import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SectionCard, EmptyState } from "@/components/dashboard/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Mail, Download, ChevronRight } from "lucide-react";

interface LogRow {
  id: string;
  step_key: string;
  step_label: string | null;
  status: string;
  source: string;
  attempt_no: number;
  sent_at: string;
  detail: string | null;
  role: string | null;
  next_attempt_at: string | null;
}

function statusMeta(s: string) {
  if (s === "sent") return { label: "Envoyé", cls: "bg-success/10 text-success border-success/20", reason: "E-mail délivré au queue d'envoi." };
  if (s === "max_reached") return { label: "Max atteint", cls: "bg-warning/10 text-warning border-warning/20", reason: "Nombre maximum de rappels atteint pour cette étape." };
  if (s === "failed") return { label: "Échec", cls: "bg-destructive/10 text-destructive border-destructive/20", reason: "L'envoi a échoué côté infrastructure e-mail." };
  if (s === "skipped:disabled") return { label: "Désactivé", cls: "bg-muted text-muted-foreground border-border", reason: "Les relances onboarding sont désactivées globalement." };
  if (s === "skipped:role") return { label: "Filtré (rôle)", cls: "bg-muted text-muted-foreground border-border", reason: "Votre rôle a été exclu des relances dans les réglages." };
  if (s === "skipped:persona") return { label: "Filtré (persona)", cls: "bg-muted text-muted-foreground border-border", reason: "Votre persona a été exclu des relances dans les réglages." };
  if (s === "skipped:throttle") return { label: "Trop tôt", cls: "bg-info/10 text-info border-info/20", reason: "Le délai minimum entre deux rappels n'est pas écoulé." };
  if (s === "skipped:step_disabled") return { label: "Étape désactivée", cls: "bg-muted text-muted-foreground border-border", reason: "Les rappels sont désactivés pour cette étape spécifique." };
  return { label: "Ignoré", cls: "bg-muted text-muted-foreground border-border", reason: "Relance ignorée." };
}

const PERIODS = [
  { v: "24h", label: "24 dernières heures", ms: 24 * 3600_000 },
  { v: "7d", label: "7 derniers jours", ms: 7 * 24 * 3600_000 },
  { v: "30d", label: "30 derniers jours", ms: 30 * 24 * 3600_000 },
  { v: "all", label: "Toute la période", ms: null as number | null },
];

export function ReminderLog({ limit = 100, showExport = true }: { limit?: number; showExport?: boolean }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const [role, setRole] = useState("all");
  const [persona, setPersona] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("onboarding_reminders_log")
        .select("id, step_key, step_label, status, source, attempt_no, sent_at, detail, role, next_attempt_at")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(limit);
      if (!cancelled) { setRows(data ?? []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user, limit]);

  const filtered = useMemo(() => {
    const p = PERIODS.find((x) => x.v === period);
    const cutoff = p?.ms ? Date.now() - p.ms : null;
    return rows.filter((r) => {
      if (cutoff && new Date(r.sent_at).getTime() < cutoff) return false;
      if (role !== "all" && (r.role ?? "") !== role) return false;
      if (persona !== "all" && (r.role ?? "") !== persona) return false;
      return true;
    });
  }, [rows, period, role, persona]);

  const exportCsv = () => {
    const headers = ["sent_at", "step_key", "step_label", "status", "source", "attempt_no", "role", "next_attempt_at", "detail"];
    const esc = (v: any) => {
      const s = v == null ? "" : String(v);
      return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(",")];
    for (const r of filtered) {
      lines.push(headers.map((h) => esc((r as any)[h])).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relances-onboarding-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <SectionCard
      icon={<History className="w-4 h-4" />}
      title="Journal des relances"
      description="Historique des e-mails de rappel onboarding"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => <SelectItem key={p.v} value={p.v}>{p.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Rôle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="seller">Vendeur</SelectItem>
            <SelectItem value="team">Membre d'équipe</SelectItem>
          </SelectContent>
        </Select>
        <Select value={persona} onValueChange={setPersona}>
          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Persona" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les personas</SelectItem>
            <SelectItem value="seller">Vendeur</SelectItem>
            <SelectItem value="team">Équipe</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {showExport && (
        <div className="flex justify-end mb-2">
          <Button type="button" size="sm" variant="outline" className="h-7 gap-1 text-xs"
            onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="w-3.5 h-3.5" /> Exporter CSV
          </Button>
        </div>
      )}
      {loading ? (
        <p className="text-xs text-muted-foreground py-4">Chargement…</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Mail className="w-6 h-6" />} title="Aucune relance" description="Les rappels envoyés s'afficheront ici." />
      ) : (
        <ul className="divide-y divide-border/40 -mx-1">
          {filtered.map((r) => {
            const meta = statusMeta(r.status);
            const isOpen = expanded === r.id;
            return (
              <li key={r.id} className="px-1 py-2">
                <button type="button" onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="flex items-start gap-3 w-full text-left">
                  <ChevronRight className={`w-3.5 h-3.5 mt-1 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{r.step_label || r.step_key}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(r.sent_at).toLocaleString("fr-FR")} · {r.source}
                      {r.attempt_no > 0 && <> · tentative {r.attempt_no}</>}
                      {r.role && <> · {r.role === "team" ? "équipe" : "vendeur"}</>}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${meta.cls}`}>{meta.label}</Badge>
                </button>
                {isOpen && (
                  <div className="ml-6 mt-2 rounded-lg bg-muted/30 p-2.5 space-y-1">
                    <p className="text-[11px] text-foreground"><span className="font-medium">Raison :</span> {meta.reason}</p>
                    {r.detail && <p className="text-[11px] text-muted-foreground">{r.detail}</p>}
                    {r.next_attempt_at && (
                      <p className="text-[11px] text-info">
                        Prochaine tentative prévue : {new Date(r.next_attempt_at).toLocaleString("fr-FR")}
                      </p>
                    )}
                    {!r.next_attempt_at && r.status === "max_reached" && (
                      <p className="text-[11px] text-warning">Plus aucune relance ne sera envoyée pour cette étape.</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
