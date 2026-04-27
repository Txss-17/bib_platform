import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Settings2,
  Euro,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  Users,
  Activity,
} from "lucide-react";
import { useOrderStats, type StatsPeriod } from "@/hooks/useOrders";
import { useProducts, useProductStats } from "@/hooks/useProducts";
import { useActiveSessions } from "@/hooks/useLiveDashboard";

type KpiKey = "revenue" | "orders" | "stock" | "alerts";

interface KPIConfig {
  visible: Record<KpiKey, boolean>;
  period: StatsPeriod;
}

const STORAGE_KEY = "bib.dashboard.kpi-config.v1";

const DEFAULT_CONFIG: KPIConfig = {
  visible: { revenue: true, orders: true, stock: true, alerts: true },
  period: "month",
};

function loadConfig(): KPIConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      visible: { ...DEFAULT_CONFIG.visible, ...(parsed.visible || {}) },
      period: parsed.period || DEFAULT_CONFIG.period,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

const PERIOD_LABEL: Record<StatsPeriod, string> = {
  day: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois",
  all: "Tout",
};

const KPI_META: Record<
  KpiKey,
  { label: string; icon: React.ComponentType<{ className?: string }>; tone: "primary" | "gold" | "muted" }
> = {
  revenue: { label: "Chiffre d'affaires", icon: Euro, tone: "gold" },
  orders: { label: "Commandes", icon: ShoppingCart, tone: "primary" },
  stock: { label: "Stock", icon: Boxes, tone: "muted" },
  alerts: { label: "Alertes", icon: AlertTriangle, tone: "muted" },
};

/* -------------------------------------------------------------------------- */
/* Mini sparkline (SVG, no extra deps)                                        */
/* -------------------------------------------------------------------------- */

function Sparkline({
  values,
  width = 120,
  height = 32,
  stroke = "hsl(var(--primary))",
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
}) {
  if (values.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={stroke}
          strokeOpacity={0.25}
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
      </svg>
    );
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = values[values.length - 1];
  const lx = (values.length - 1) * step;
  const ly = height - ((last - min) / range) * (height - 4) - 2;
  return (
    <svg width={width} height={height} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lx} cy={ly} r={2.5} fill={stroke} />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Active sessions tile                                                       */
/* -------------------------------------------------------------------------- */

function ActiveSessionsTile() {
  const { count, history } = useActiveSessions();
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-border/40">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}
        >
          <Users className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sessions actives</p>
          <p className="text-xl font-bold text-foreground leading-none mt-0.5">
            {count}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Sparkline values={history} />
        <Badge variant="outline" className="gap-1 text-[10px]">
          <Activity className="w-3 h-3" /> Live
        </Badge>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main panel                                                                 */
/* -------------------------------------------------------------------------- */

export function KPIConfigPanel() {
  const [config, setConfig] = useState<KPIConfig>(() => loadConfig());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* ignore */
    }
  }, [config]);

  const { data: orderStats } = useOrderStats(config.period);
  const { data: productStats } = useProductStats();
  const { data: products } = useProducts();

  // Derive stock + alerts from products joined to supplier_products
  const stockSummary = useMemo(() => {
    const items = (products || [])
      .map((p: any) => {
        const sp = p.supplier_products;
        if (!sp) return null;
        const stock = sp.stock ?? 0;
        const moq = sp.moq ?? 1;
        const ratio = stock / Math.max(moq, 1);
        return { stock, ratio };
      })
      .filter(Boolean) as { stock: number; ratio: number }[];
    const totalUnits = items.reduce((s, i) => s + i.stock, 0);
    const critical = items.filter((i) => i.ratio <= 0.1).length;
    const low = items.filter((i) => i.ratio > 0.1 && i.ratio <= 0.3).length;
    return { totalUnits, critical, low, alerts: critical + low };
  }, [products]);

  const visibleKeys = (Object.keys(config.visible) as KpiKey[]).filter(
    (k) => config.visible[k]
  );

  const valueFor = (k: KpiKey): { value: string; sub?: string } => {
    switch (k) {
      case "revenue":
        return {
          value: `€${(orderStats?.revenue || 0).toLocaleString("fr-FR")}`,
          sub: PERIOD_LABEL[config.period],
        };
      case "orders":
        return {
          value: String(orderStats?.total || 0),
          sub: `${orderStats?.pending || 0} en attente`,
        };
      case "stock":
        return {
          value: String(stockSummary.totalUnits),
          sub: `${productStats?.active || 0} produits actifs`,
        };
      case "alerts":
        return {
          value: String(stockSummary.alerts),
          sub: `${stockSummary.critical} critique(s)`,
        };
    }
  };

  return (
    <Card className="bg-card border-border/50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-foreground">Mes indicateurs</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personnalisez les KPI affichés et la période.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              size="sm"
              value={config.period}
              onValueChange={(v) =>
                v && setConfig((c) => ({ ...c, period: v as StatsPeriod }))
              }
              className="hidden sm:flex"
            >
              <ToggleGroupItem value="day" className="text-xs px-2.5">Jour</ToggleGroupItem>
              <ToggleGroupItem value="week" className="text-xs px-2.5">Semaine</ToggleGroupItem>
              <ToggleGroupItem value="month" className="text-xs px-2.5">Mois</ToggleGroupItem>
            </ToggleGroup>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Settings2 className="w-3.5 h-3.5" />
                  Configurer
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Période
                    </p>
                    <ToggleGroup
                      type="single"
                      size="sm"
                      value={config.period}
                      onValueChange={(v) =>
                        v && setConfig((c) => ({ ...c, period: v as StatsPeriod }))
                      }
                      className="w-full grid grid-cols-3"
                    >
                      <ToggleGroupItem value="day">Jour</ToggleGroupItem>
                      <ToggleGroupItem value="week">Semaine</ToggleGroupItem>
                      <ToggleGroupItem value="month">Mois</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      KPI affichés
                    </p>
                    <div className="space-y-2">
                      {(Object.keys(KPI_META) as KpiKey[]).map((k) => {
                        const Icon = KPI_META[k].icon;
                        return (
                          <div
                            key={k}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                          >
                            <Label
                              htmlFor={`kpi-${k}`}
                              className="flex items-center gap-2 cursor-pointer text-sm"
                            >
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              {KPI_META[k].label}
                            </Label>
                            <Switch
                              id={`kpi-${k}`}
                              checked={config.visible[k]}
                              onCheckedChange={(checked) =>
                                setConfig((c) => ({
                                  ...c,
                                  visible: { ...c.visible, [k]: checked },
                                }))
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setConfig(DEFAULT_CONFIG)}
                  >
                    Réinitialiser
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* KPI tiles */}
        {visibleKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucun KPI sélectionné. Ouvrez « Configurer » pour en activer.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {visibleKeys.map((k) => {
              const { value, sub } = valueFor(k);
              const Icon = KPI_META[k].icon;
              const tone = KPI_META[k].tone;
              const iconColor =
                tone === "gold"
                  ? "hsl(var(--secondary))"
                  : tone === "primary"
                  ? "hsl(var(--primary))"
                  : "hsl(var(--muted-foreground))";
              return (
                <div
                  key={k}
                  className="p-3 rounded-lg bg-background/60 border border-border/40"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {KPI_META[k].label}
                    </span>
                    <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
                  </div>
                  <p className="text-2xl font-bold text-foreground leading-tight">
                    {value}
                  </p>
                  {sub && (
                    <p className="text-[10px] text-muted-foreground mt-1 truncate">
                      {sub}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Active sessions */}
        <ActiveSessionsTile />
      </CardContent>
    </Card>
  );
}
