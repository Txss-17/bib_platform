import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX, Radio, ShoppingBag } from "lucide-react";
import { useLiveDashboard, useActiveSessions } from "@/hooks/useLiveDashboard";

function formatRelative(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 5) return "à l'instant";
  if (s < 60) return `il y a ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  return `il y a ${h}h`;
}

export function LiveOrdersFeed() {
  const [soundOn, setSoundOn] = useState(true);
  const { feed, isLive, lastEventAt } = useLiveDashboard({ sound: soundOn });
  const sessions = useActiveSessions();
  // Force re-render every 15s so relative timestamps stay fresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((x) => x + 1), 15000);
    return () => window.clearInterval(t);
  }, []);

  const pulse = lastEventAt && Date.now() - lastEventAt < 4000;

  return (
    <Card className="bg-card border-border/50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {isLive && (
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${pulse ? "animate-ping" : ""}`} style={{ background: "hsl(var(--primary))" }} />
              )}
              <span
                className="relative inline-flex h-2.5 w-2.5 rounded-full"
                style={{ background: isLive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
              />
            </span>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Flux temps réel
            </h3>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              {isLive ? "Live" : "Hors ligne"}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{sessions}</span> session{sessions > 1 ? "s" : ""} active{sessions > 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1.5">
              <Switch id="sound-toggle" checked={soundOn} onCheckedChange={setSoundOn} />
              <Label htmlFor="sound-toggle" className="cursor-pointer">
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
              </Label>
            </div>
          </div>
        </div>

        {feed.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingBag className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">En attente de nouvelles commandes…</p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              Les commandes entrantes apparaîtront ici instantanément.
            </p>
          </div>
        ) : (
          <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {feed.map((evt) => (
              <li
                key={evt.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/40 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      Nouvelle commande {evt.order_number ? `#${evt.order_number}` : ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatRelative(evt.created_at)}
                      {evt.market ? ` • ${evt.market}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">€{evt.amount.toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
