import { useEffect, useState } from "react";
import {
  ArrowDownToLine, ArrowUpRight, AlertTriangle, Activity, RefreshCw, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState, SectionCard, RealtimeStatusPill } from "@/components/dashboard/shared";
import type { RealtimeStatus } from "@/components/dashboard/shared/RealtimeStatusPill";
import type {
  PaymentActivityEvent,
  PaymentActivityKind,
} from "@/hooks/usePaymentsRealtime";
import { cn } from "@/lib/utils";

interface Props {
  feed: PaymentActivityEvent[];
  status: RealtimeStatus;
  onClear?: () => void;
  boutiqueLookup?: Record<string, string>;
  className?: string;
}

const VARIANTS: Record<
  PaymentActivityKind,
  { icon: typeof Activity; bg: string; fg: string; sign: "+" | "-" | "" }
> = {
  sale: { icon: ShoppingBag, bg: "bg-emerald-500/10", fg: "text-emerald-600", sign: "+" },
  payout_scheduled: { icon: ArrowDownToLine, bg: "bg-secondary/15", fg: "text-secondary", sign: "" },
  payout_updated: { icon: RefreshCw, bg: "bg-muted", fg: "text-muted-foreground", sign: "" },
  payout_completed: { icon: ArrowUpRight, bg: "bg-primary/10", fg: "text-primary", sign: "-" },
  payout_failed: { icon: AlertTriangle, bg: "bg-destructive/10", fg: "text-destructive", sign: "" },
};

function relativeTime(iso: string, now: number) {
  const t = new Date(iso).getTime();
  const diff = Math.max(0, now - t);
  const s = Math.floor(diff / 1000);
  if (s < 5) return "à l'instant";
  if (s < 60) return `il y a ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

export function PaymentsActivityFeed({
  feed,
  status,
  onClear,
  boutiqueLookup,
  className,
}: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <SectionCard
      className={className}
      title="Activité en direct"
      description="Ventes et versements diffusés en temps réel"
      icon={<Activity className="w-4 h-4" />}
      actions={
        <div className="flex items-center gap-2">
          <RealtimeStatusPill status={status} />
          {feed.length > 0 && onClear && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs">
              Vider
            </Button>
          )}
        </div>
      }
      flush
    >
      {feed.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-6 h-6" />}
          title={
            status === "live"
              ? "En écoute…"
              : status === "reconnecting"
                ? "Reconnexion…"
                : "Aucune activité"
          }
          description="Chaque vente ou versement apparaîtra ici instantanément."
        />
      ) : (
        <ScrollArea className="h-[420px]">
          <ul className="divide-y divide-border/60">
            {feed.map((e) => {
              const v = VARIANTS[e.kind];
              const Icon = v.icon;
              const boutiqueName = e.boutique_id ? boutiqueLookup?.[e.boutique_id] : undefined;
              return (
                <li
                  key={e.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      v.bg,
                      v.fg,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {e.label}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-display font-semibold tabular-nums shrink-0",
                          v.fg,
                        )}
                      >
                        {v.sign}
                        {e.amount.toFixed(2)} €
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">
                        {[e.description, boutiqueName].filter(Boolean).join(" · ") || "—"}
                      </p>
                      <p className="text-[11px] text-muted-foreground shrink-0">
                        {relativeTime(e.created_at, now)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}
    </SectionCard>
  );
}
