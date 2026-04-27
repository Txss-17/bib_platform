import { Link } from "react-router-dom";
import { Activity, ArrowRight, ShoppingBag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  RealtimeStatusPill,
  SectionCard,
} from "@/components/dashboard/shared";
import { useOrderPulse } from "@/hooks/useOrderPulse";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  processing: "En préparation",
  shipped: "Expédié",
  delivered: "Livré",
  returned: "Retourné",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.round(diff / 1000));
  if (s < 60) return `il y a ${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  return `il y a ${h} h`;
}

/**
 * Lightweight realtime activity card for the dashboard home.
 * Surfaces last new orders + status changes across all owned boutiques.
 */
export function HomeActivityCard() {
  const { feed, status, windowMinutes } = useOrderPulse("all");
  const visible = feed.slice(0, 6);

  return (
    <SectionCard
      icon={<Activity className="w-4 h-4" />}
      title="Activité en direct"
      description={`Commandes des ${windowMinutes} dernières minutes`}
      actions={
        <div className="flex items-center gap-2">
          <RealtimeStatusPill status={status} />
          <Link to="/dashboard/commandes">
            <Button variant="ghost" size="sm" className="gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      }
    >
      {visible.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-6 h-6" />}
          title="Pas d'activité récente"
          description="Les nouvelles commandes et changements de statut apparaîtront ici en temps réel."
        />
      ) : (
        <ul className="divide-y divide-border/50">
          {visible.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
            >
              <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                {ev.kind === "new" ? (
                  <ShoppingBag className="w-4 h-4" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {ev.kind === "new"
                    ? `Nouvelle commande · ${ev.customer_name}`
                    : `${ev.customer_name} · ${STATUS_LABELS[ev.logistics_status] || ev.logistics_status}`}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {ev.order_number} · {timeAgo(ev.created_at)}
                </p>
              </div>
              <span className="text-sm font-semibold text-foreground shrink-0 tabular-nums">
                €{ev.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}