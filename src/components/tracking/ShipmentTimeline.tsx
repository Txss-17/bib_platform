import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Truck, MapPin, CalendarClock } from "lucide-react";

interface Info {
  driver_name: string | null;
  carrier: string | null;
  tracking_number: string | null;
  eta: string | null;
  last_location: string | null;
  events: { status: string; label: string; location: string | null; created_at: string }[];
}

export function ShipmentTimeline({ orderNumber, email }: { orderNumber: string; email: string }) {
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    const client = supabase as unknown as {
      rpc: (fn: string, p: Record<string, unknown>) => Promise<{ data: unknown }>;
    };
    client.rpc("track_shipment", { _order_number: orderNumber, _customer_email: email })
      .then(({ data }) => setInfo((data as Info) ?? null));
  }, [orderNumber, email]);

  if (!info) return null;
  const hasDetails = info.driver_name || info.eta || info.last_location;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="flex items-center gap-2 font-semibold text-foreground">
        <Truck className="h-4 w-4 text-accent" /> Suivi de livraison
      </h3>
      {hasDetails && (
        <div className="grid gap-2 text-sm sm:grid-cols-3">
          {info.driver_name && <p><span className="text-muted-foreground">Livreur : </span>{info.driver_name}</p>}
          {info.last_location && <p className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{info.last_location}</p>}
          {info.eta && <p className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />Prévue le {new Date(info.eta).toLocaleDateString("fr-FR")}</p>}
        </div>
      )}
      {info.events.length === 0 ? (
        <p className="text-sm text-muted-foreground">Votre commande attend sa prise en charge par l'entrepôt.</p>
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-5">
          {info.events.map((e, i) => (
            <li key={i} className="relative">
              <span className={`absolute -left-[26px] top-1 h-3 w-3 rounded-full ${i === 0 ? "bg-accent" : "bg-muted-foreground/40"}`} />
              <p className="text-sm font-medium text-foreground">{e.label}</p>
              <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString("fr-FR")}{e.location ? ` · ${e.location}` : ""}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
