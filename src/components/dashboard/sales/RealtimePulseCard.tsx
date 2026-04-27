import { useMemo, useState } from "react";
import {
  Eye,
  Package,
  ShoppingCart,
  CreditCard,
  Radio,
  RefreshCcw,
  WifiOff,
  Loader2,
} from "lucide-react";
import { SectionCard, EmptyState } from "@/components/dashboard/shared";
import {
  useStorefrontPulse,
  type PulseEvent,
  type PulseStatus,
} from "@/hooks/useStorefrontPulse";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props {
  boutiqueId?: string;
}

type EventKey =
  | "all"
  | "boutique_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_start";

const items: Array<{
  key: Exclude<EventKey, "all">;
  label: string;
  icon: React.ElementType;
  feedLabel: string;
}> = [
  { key: "boutique_view", label: "Vues boutique", icon: Eye, feedLabel: "Boutique vue" },
  { key: "product_view", label: "Vues produit", icon: Package, feedLabel: "Produit consulté" },
  { key: "add_to_cart", label: "Ajouts panier", icon: ShoppingCart, feedLabel: "Ajout au panier" },
  { key: "checkout_start", label: "Checkout", icon: CreditCard, feedLabel: "Checkout démarré" },
];

const filterChips: Array<{ key: EventKey; label: string }> = [
  { key: "all", label: "Tous" },
  { key: "boutique_view", label: "Vues" },
  { key: "product_view", label: "Produits" },
  { key: "add_to_cart", label: "Panier" },
  { key: "checkout_start", label: "Checkout" },
];

interface GroupedEvent {
  signature: string;
  event_type: PulseEvent["event_type"];
  product_id: string | null;
  count: number;
  firstAt: string;
  lastAt: string;
}

/**
 * Collapses consecutive events with the same (event_type, product_id)
 * signature into a single line with a count, so a burst of 12 product views
 * doesn't drown the feed.
 */
function groupConsecutive(events: PulseEvent[]): GroupedEvent[] {
  const out: GroupedEvent[] = [];
  for (const e of events) {
    const sig = `${e.event_type}::${e.product_id ?? "_"}`;
    const last = out[out.length - 1];
    if (last && last.signature === sig) {
      last.count += 1;
      last.firstAt = e.created_at; // older
    } else {
      out.push({
        signature: sig,
        event_type: e.event_type,
        product_id: e.product_id,
        count: 1,
        firstAt: e.created_at,
        lastAt: e.created_at,
      });
    }
  }
  return out;
}

function StatusPill({ status }: { status: PulseStatus }) {
  const map: Record<
    PulseStatus,
    { label: string; dotClass: string; pillClass: string; Icon?: React.ElementType }
  > = {
    loading: {
      label: "Chargement…",
      dotClass: "bg-muted-foreground/50",
      pillClass: "bg-muted text-muted-foreground",
      Icon: Loader2,
    },
    connecting: {
      label: "Connexion…",
      dotClass: "bg-amber-500 animate-pulse",
      pillClass: "bg-amber-500/10 text-amber-600",
      Icon: Loader2,
    },
    reconnecting: {
      label: "Reconnexion…",
      dotClass: "bg-amber-500 animate-pulse",
      pillClass: "bg-amber-500/10 text-amber-600",
      Icon: RefreshCcw,
    },
    live: {
      label: "Live",
      dotClass: "bg-emerald-500 animate-pulse",
      pillClass: "bg-emerald-500/10 text-emerald-600",
    },
    offline: {
      label: "Hors-ligne",
      dotClass: "bg-muted-foreground/50",
      pillClass: "bg-muted text-muted-foreground",
      Icon: WifiOff,
    },
  };
  const cfg = map[status];
  const Icon = cfg.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
        cfg.pillClass,
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            "w-3 h-3",
            (status === "loading" || status === "connecting" || status === "reconnecting") &&
              "animate-spin",
          )}
        />
      ) : (
        <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotClass)} />
      )}
      {cfg.label}
    </span>
  );
}

/**
 * Realtime pulse card with filterable + grouped live feed and a robust
 * connection lifecycle pill (loading / connecting / live / reconnecting /
 * offline).
 */
export function RealtimePulseCard({ boutiqueId = "all" }: Props) {
  const { counters, feed, status, loading, windowMinutes } =
    useStorefrontPulse(boutiqueId);
  const [filter, setFilter] = useState<EventKey>("all");

  const labelFor = (t: string) =>
    items.find((i) => i.key === (t as never))?.feedLabel ?? t;

  const filtered = useMemo(
    () => (filter === "all" ? feed : feed.filter((e) => e.event_type === filter)),
    [feed, filter],
  );
  const grouped = useMemo(() => groupConsecutive(filtered), [filtered]);

  return (
    <SectionCard
      title="Pulse temps réel"
      description={`Activité boutique sur les ${windowMinutes} dernières minutes`}
      icon={<Radio className="w-4 h-4" />}
      actions={<StatusPill status={status} />}
    >
      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter((f) => (f === key ? "all" : key))}
            className={cn(
              "text-left rounded-xl border bg-muted/30 p-3 transition-all hover:border-secondary/60",
              filter === key
                ? "border-secondary/70 bg-secondary/10"
                : "border-border/60",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                {label}
              </span>
              <Icon className="w-3.5 h-3.5 text-secondary shrink-0" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground mt-1 leading-none">
              {loading ? (
                <span className="inline-block w-10 h-7 rounded bg-muted/70 animate-pulse" />
              ) : (
                counters[key].toLocaleString("fr-FR")
              )}
            </p>
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {filterChips.map((chip) => (
          <Button
            key={chip.key}
            type="button"
            variant={filter === chip.key ? "secondary" : "outline"}
            size="sm"
            className="h-7 px-2.5 text-xs rounded-full"
            onClick={() => setFilter(chip.key)}
          >
            {chip.label}
          </Button>
        ))}
        {filter !== "all" && (
          <span className="text-xs text-muted-foreground ml-1">
            {filtered.length} événement{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Live feed */}
      <div className="mt-3">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
          Flux en direct
        </p>
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState
            icon={<Radio className="w-6 h-6" />}
            title={
              filter === "all"
                ? "Aucune activité pour l'instant"
                : "Aucun événement pour ce filtre"
            }
            description={
              filter === "all"
                ? "Dès qu'un visiteur ouvre votre boutique, ajoute un produit au panier ou démarre un checkout, l'événement apparaîtra ici en temps réel."
                : "Essayez un autre filtre ou attendez les prochains événements."
            }
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {grouped.map((g) => (
              <li
                key={`${g.signature}-${g.lastAt}`}
                className="flex items-center justify-between py-2.5 gap-3 animate-fade-in"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                  <span className="text-sm text-foreground truncate">
                    {labelFor(g.event_type)}
                  </span>
                  {g.count > 1 && (
                    <span className="ml-1 inline-flex items-center justify-center text-[10px] font-semibold px-1.5 h-4 rounded-full bg-secondary/15 text-secondary">
                      ×{g.count}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(g.lastAt).toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
