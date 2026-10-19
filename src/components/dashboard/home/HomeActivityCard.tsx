
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Wifi,
} from "lucide-react";

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
  shipped: "Expédiée",
  delivered: "Livrée",
  returned: "Retournée",
};

function timeAgo(iso: string) {
  const timestamp = new Date(iso).getTime();

  if (!Number.isFinite(timestamp)) {
    return "Date indisponible";
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (diffSeconds < 60) {
    return diffSeconds < 5 ? "À l’instant" : `Il y a ${diffSeconds} s`;
  }

  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `Il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Il y a ${days} j`;

  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function HomeActivityCard() {
  const { feed, status, windowMinutes } = useOrderPulse("all");
  const visible = feed.slice(0, 6);

  return (
    <SectionCard
      icon={<Activity className="h-4 w-4" />}
      title="Activité en direct"
      description={`Commandes et changements de statut · ${windowMinutes} dernières minutes`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <RealtimeStatusPill status={status} />
          <Link to="/dashboard/commandes">
            <Button variant="ghost" size="sm" className="gap-1.5">
              Tout voir
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      }
    >
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/25 px-3 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wifi className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground">
            Flux de commandes
          </p>
          <p className="text-[11px] leading-4 text-muted-foreground">
            Les événements disponibles apparaissent dans cette liste.
          </p>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Pas d’activité récente"
          description="Les nouvelles commandes et les changements de statut apparaîtront ici dès qu’ils seront disponibles."
        />
      ) : (
        <ul className="divide-y divide-border/70">
          {visible.map((event) => {
            const isNewOrder = event.kind === "new";
            const statusLabel =
              STATUS_LABELS[event.logistics_status] ??
              event.logistics_status ??
              "Statut actualisé";

            return (
              <li
                key={event.id}
                className="group flex min-w-0 items-start gap-3 py-4 first:pt-1 last:pb-1"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    isNewOrder
                      ? "border-primary/15 bg-primary/10 text-primary"
                      : "border-secondary/25 bg-secondary/10 text-secondary-foreground"
                  }`}
                >
                  {isNewOrder ? (
                    <ShoppingBag className="h-4 w-4" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isNewOrder
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isNewOrder ? "Nouvelle commande" : "Mise à jour"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {timeAgo(event.created_at)}
                    </span>
                  </div>

                  <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
                    {event.customer_name || "Client"}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <Link
                      to="/dashboard/commandes"
                      className="font-mono transition-colors hover:text-primary"
                    >
                      {event.order_number}
                    </Link>
                    <span aria-hidden="true">·</span>
                    <span>{isNewOrder ? "Commande reçue" : statusLabel}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {formatAmount(event.amount)}
                  </p>
                  <Link
                    to="/dashboard/commandes"
                    aria-label={`Consulter la commande ${event.order_number}`}
                    className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-primary opacity-80 transition-opacity hover:opacity-100"
                  >
                    Détails
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
