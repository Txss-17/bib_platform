import { Eye, Package, ShoppingCart, CreditCard, Radio } from "lucide-react";
import { SectionCard, EmptyState } from "@/components/dashboard/shared";
import { useStorefrontPulse } from "@/hooks/useStorefrontPulse";
import { cn } from "@/lib/utils";

interface Props {
  boutiqueId?: string;
}

const items: Array<{
  key: keyof ReturnType<typeof useStorefrontPulse>["counters"];
  label: string;
  icon: React.ElementType;
  feedLabel: string;
}> = [
  { key: "boutique_view", label: "Vues boutique", icon: Eye, feedLabel: "Boutique vue" },
  { key: "product_view", label: "Vues produit", icon: Package, feedLabel: "Produit consulté" },
  { key: "add_to_cart", label: "Ajouts panier", icon: ShoppingCart, feedLabel: "Ajout au panier" },
  { key: "checkout_start", label: "Checkout", icon: CreditCard, feedLabel: "Checkout démarré" },
];

/**
 * Realtime pulse: rolling 30-min counters for boutique views, product views,
 * add-to-cart and checkout starts, plus a live event feed. Uses the unified
 * design system tokens (marine + gold + ivory).
 */
export function RealtimePulseCard({ boutiqueId = "all" }: Props) {
  const { counters, feed, loading, isLive, windowMinutes } =
    useStorefrontPulse(boutiqueId);

  const labelFor = (t: string) =>
    items.find((i) => i.key === (t as never))?.feedLabel ?? t;

  return (
    <SectionCard
      title="Pulse temps réel"
      description={`Activité boutique sur les ${windowMinutes} dernières minutes`}
      icon={<Radio className="w-4 h-4" />}
      actions={
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
            isLive
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-muted text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              isLive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/50",
            )}
          />
          {isLive ? "Live" : "Connexion…"}
        </span>
      }
    >
      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {items.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="rounded-xl border border-border/60 bg-muted/30 p-3 transition-all hover:border-secondary/50"
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
          </div>
        ))}
      </div>

      {/* Live feed */}
      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium mb-2">
          Flux en direct
        </p>
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : feed.length === 0 ? (
          <EmptyState
            icon={<Radio className="w-6 h-6" />}
            title="Aucune activité pour l'instant"
            description="Dès qu'un visiteur ouvre votre boutique, ajoute un produit au panier ou démarre un checkout, l'événement apparaîtra ici en temps réel."
          />
        ) : (
          <ul className="divide-y divide-border/60">
            {feed.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between py-2.5 gap-3 animate-fade-in"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                  <span className="text-sm text-foreground truncate">
                    {labelFor(e.event_type)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(e.created_at).toLocaleTimeString("fr-FR", {
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