import { useEffect, useMemo, useState } from "react";
import { Globe2, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { SectionCard } from "@/components/dashboard/shared";

type PaidOrder = {
  id: string;
  boutique_id: string;
  market: string | null;
  amount: number;
  payment_status: string;
  stripe_environment: string | null;
  created_at: string;
};

const isConfirmed = (order: PaidOrder) =>
  order.payment_status === "paid" && order.stripe_environment !== "sandbox";

function marketName(value: string | null) {
  if (!value) return translateUi("Zone non précisée");
  const code = value.toUpperCase();
  return code === "EU" ? translateUi("Union européenne") : code;
}

/**
 * Commercial market activity. Orders contain a market, not the buyer's
 * coordinates; the globe is illustrative and deliberately has no location pins.
 */
export function LiveSalesGlobe({ boutiqueId = "all" }: { boutiqueId?: string }) {
  useLanguage();
  const { user } = useAuth();
  const { data: boutiques = [] } = useBoutiques();
  const allowedIds = useMemo(
    () => boutiques
      .filter((boutique) => boutiqueId === "all" || boutique.id === boutiqueId)
      .map((boutique) => boutique.id),
    [boutiques, boutiqueId],
  );
  const [orders, setOrders] = useState<PaidOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const idKey = allowedIds.join(",");

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    const ids = idKey ? idKey.split(",") : [];
    setOrders([]);
    setConnected(false);
    setLoading(true);
    if (!user || ids.length === 0) {
      setLoading(false);
      return () => { active = false; };
    }

    const load = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,boutique_id,market,amount,payment_status,stripe_environment,created_at")
        .in("boutique_id", ids)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false })
        .limit(40);
      if (!active) return;
      if (!error) setOrders(((data ?? []) as PaidOrder[]).filter(isConfirmed).slice(0, 12));
      setLoading(false);
    };

    void load();
    channel = supabase
      .channel(`market-sales-${user.id}-${boutiqueId}-${Date.now()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as Partial<PaidOrder> | undefined;
          if (!row?.boutique_id || !ids.includes(row.boutique_id)) return;
          // Refresh from authorized rows: transitions to paid count exactly once.
          void load();
        },
      )
      .subscribe((status) => {
        if (active) setConnected(status === "SUBSCRIBED");
      });

    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [user?.id, boutiqueId, idKey]);

  const markets = useMemo(() => {
    const result = new Map<string, { orders: number; amount: number }>();
    for (const order of orders) {
      const label = marketName(order.market);
      const existing = result.get(label) ?? { orders: 0, amount: 0 };
      existing.orders += 1;
      existing.amount += Number(order.amount || 0);
      result.set(label, existing);
    }
    return [...result.entries()].sort((a, b) => b[1].amount - a[1].amount);
  }, [orders]);

  const money = (n: number) => new Intl.NumberFormat(getUiLocale(), {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(n);

  return (
    <SectionCard
      title={translateUi("Le monde de vos ventes")}
      description={translateUi("Suivez les commandes confirmées à mesure qu’elles arrivent.")}
      icon={<Globe2 className="h-4 w-4" />}
      actions={
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Radio className={`h-3.5 w-3.5 ${connected ? "text-success-ink" : ""}`} />
          {connected ? translateUi("En direct") : translateUi("Actualisation")}
        </span>
      }
    >
      <div className="grid min-w-0 items-center gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="relative mx-auto flex aspect-square w-full max-w-[370px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <svg viewBox="0 0 300 300" role="img" aria-label={translateUi("Globe animé illustrant l’activité commerciale mondiale")} className="h-full w-full max-w-[340px] text-primary">
            <defs>
              <radialGradient id="marketGlobeFill" cx="32%" cy="28%" r="78%">
                <stop offset="0%" stopColor="currentColor" stopOpacity=".19" />
                <stop offset="100%" stopColor="currentColor" stopOpacity=".04" />
              </radialGradient>
              <clipPath id="marketSphere"><circle cx="150" cy="150" r="112" /></clipPath>
            </defs>
            <circle cx="150" cy="150" r="112" fill="url(#marketGlobeFill)" stroke="currentColor" strokeOpacity=".28" strokeWidth="1.5" />
            <g clipPath="url(#marketSphere)" stroke="currentColor" strokeOpacity=".25" fill="none" strokeWidth="1">
              <circle cx="150" cy="150" r="112"/>
              <ellipse cx="150" cy="150" rx="112" ry="34"/>
              <ellipse cx="150" cy="150" rx="112" ry="75"/>
              <ellipse cx="150" cy="150" rx="34" ry="112"/>
              <ellipse cx="150" cy="150" rx="75" ry="112"/>
              <path d="M38 150h224M150 38v224"/>
              <g className="origin-center motion-safe:animate-[spin_28s_linear_infinite]" style={{ transformOrigin: "150px 150px" }}>
                <ellipse cx="150" cy="150" rx="108" ry="56" transform="rotate(32 150 150)"/>
                <ellipse cx="150" cy="150" rx="108" ry="56" transform="rotate(-32 150 150)"/>
              </g>
            </g>
            <circle cx="150" cy="150" r="119" fill="none" stroke="currentColor" strokeOpacity=".13" strokeDasharray="3 8" />
            <circle cx="236" cy="78" r="5" fill="hsl(var(--secondary))" className="motion-safe:animate-pulse" />
          </svg>
          <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/70 bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
            {loading ? translateUi("Chargement…") : `${orders.length} ${translateUi("commandes récentes")}`}
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {translateUi("Activité commerciale récente")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {translateUi("Dernières commandes, regroupées par marché")}
            </p>
          </div>
          {loading ? (
            <div className="h-32 animate-pulse rounded-xl bg-muted/40" />
          ) : markets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              {translateUi("Vos nouvelles ventes apparaîtront ici.")}
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {markets.map(([market, value]) => (
                <div key={market} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" title={market}>{market}</p>
                    <p className="text-xs text-muted-foreground">{value.orders} {translateUi("commandes")}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{money(value.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {translateUi("Les zones indiquées correspondent aux marchés commerciaux des commandes.")}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
