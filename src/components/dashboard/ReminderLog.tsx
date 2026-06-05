import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SectionCard, EmptyState } from "@/components/dashboard/shared";
import { Badge } from "@/components/ui/badge";
import { History, Mail } from "lucide-react";

interface LogRow {
  id: string;
  step_key: string;
  step_label: string | null;
  status: string;
  source: string;
  attempt_no: number;
  sent_at: string;
  detail: string | null;
}

function statusTone(s: string) {
  if (s === "sent") return { label: "Envoyé", cls: "bg-success/10 text-success border-success/20" };
  if (s === "max_reached") return { label: "Max atteint", cls: "bg-warning/10 text-warning border-warning/20" };
  if (s === "failed") return { label: "Échec", cls: "bg-destructive/10 text-destructive border-destructive/20" };
  return { label: "Ignoré", cls: "bg-muted text-muted-foreground border-border" };
}

export function ReminderLog({ limit = 25 }: { limit?: number }) {
  const { user } = useAuth();
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("onboarding_reminders_log")
        .select("id, step_key, step_label, status, source, attempt_no, sent_at, detail")
        .eq("user_id", user.id)
        .order("sent_at", { ascending: false })
        .limit(limit);
      if (!cancelled) { setRows(data ?? []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user, limit]);

  return (
    <SectionCard
      icon={<History className="w-4 h-4" />}
      title="Journal des relances"
      description="Historique des e-mails de rappel onboarding"
    >
      {loading ? (
        <p className="text-xs text-muted-foreground py-4">Chargement…</p>
      ) : rows.length === 0 ? (
        <EmptyState icon={<Mail className="w-6 h-6" />} title="Aucune relance" description="Les rappels envoyés s'afficheront ici." />
      ) : (
        <ul className="divide-y divide-border/40 -mx-1">
          {rows.map((r) => {
            const tone = statusTone(r.status);
            return (
              <li key={r.id} className="flex items-start gap-3 px-1 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {r.step_label || r.step_key}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(r.sent_at).toLocaleString("fr-FR")} · source : {r.source}
                    {r.attempt_no > 0 && <> · tentative {r.attempt_no}</>}
                  </p>
                  {r.detail && (
                    <p className="text-[11px] text-muted-foreground truncate">{r.detail}</p>
                  )}
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${tone.cls}`}>{tone.label}</Badge>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
