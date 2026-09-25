import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { fetchLabelsData, printLabels } from "@/lib/shippingLabel";
import { Inbox, Package2, Printer, Truck, Loader2, User, MapPin, CheckCircle2 } from "lucide-react";

export interface ShipOrder {
  id: string;
  order_number: string;
  customer_name: string;
  logistics_status: string;
  created_at: string;
}

interface Shipment {
  order_id: string;
  driver_name: string | null;
  driver_phone: string | null;
  carrier: string | null;
  tracking_number: string | null;
  carton_size: string | null;
  received_at: string | null;
  carton_printed_at: string | null;
  label_printed_at: string | null;
  eta: string | null;
  last_location: string | null;
}

type CallAction = (body: Record<string, unknown>) => Promise<unknown>;

const CARTONS = ["S (20×15×10)", "M (30×20×15)", "L (40×30×20)", "XL (60×40×30)"];

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

export function OpsShipmentsBoard({ orders, callAction }: { orders: ShipOrder[]; callAction: CallAction }) {
  const [shipments, setShipments] = useState<Record<string, Shipment>>({});
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cartonFor, setCartonFor] = useState<Record<string, string>>({});
  const [driverDraft, setDriverDraft] = useState<Record<string, { name: string; phone: string; location: string; eta: string }>>({});
  const [format, setFormat] = useState<"a6" | "a4-sheet">("a6");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await callAction({ action: "list_shipments" })) as { shipments?: Shipment[] } | null;
      const map: Record<string, Shipment> = {};
      (res?.shipments ?? []).forEach((s) => { map[s.order_id] = s; });
      setShipments(map);
    } catch { /* ignore */ }
    setLoading(false);
  }, [callAction]);

  useEffect(() => { load(); }, [load]);

  async function update(o: ShipOrder, body: Record<string, unknown>, okMsg: string) {
    setBusyId(o.id);
    try {
      await callAction({ action: "shipment_update", order_number: o.order_number, ...body });
      toast({ title: okMsg, description: o.order_number });
      await load();
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  const s = (o: ShipOrder) => shipments[o.id];
  const active = orders.filter((o) => ["pending", "processing", "shipped"].includes(o.logistics_status));
  const received = active.filter((o) => !s(o)?.received_at);
  const cartons = active.filter((o) => s(o)?.received_at && !s(o)?.carton_printed_at);
  const labels = active.filter((o) => s(o)?.carton_printed_at && !s(o)?.label_printed_at);
  const inDelivery = active.filter((o) => s(o)?.label_printed_at);

  const byDriver = useMemo(() => {
    const g: Record<string, ShipOrder[]> = {};
    inDelivery.forEach((o) => {
      const k = s(o)?.driver_name || "Non assigné";
      (g[k] ??= []).push(o);
    });
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inDelivery.map((o) => o.id).join(), shipments]);

  function printCartons(list: ShipOrder[]) {
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) { toast({ title: "Pop-up bloqué", variant: "destructive" }); return false; }
    const body = list.map((o) => {
      const size = cartonFor[o.id] ?? s(o)?.carton_size ?? CARTONS[1];
      return `<div class="slip"><h2>BRAND-IN-A-BOX · Fiche carton</h2>
        <p class="num">${escapeHtml(o.order_number)}</p>
        <p>Carton : <strong>${escapeHtml(size)}</strong></p>
        <p>Client : ${escapeHtml(o.customer_name ?? "—")}</p>
        <p>Date : ${new Date().toLocaleDateString("fr-FR")}</p>
        <p class="check">☐ Produit contrôlé &nbsp; ☐ Calage &nbsp; ☐ Scellé</p></div>`;
    }).join("");
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Cartons</title><style>
      body{font-family:Inter,system-ui,sans-serif;margin:16px}.slip{border:1px solid #0a0f1e;border-radius:6px;padding:14px;margin-bottom:12px;page-break-inside:avoid}
      h2{margin:0 0 6px;font-size:12px;letter-spacing:.08em}.num{font-family:monospace;font-size:20px;font-weight:700;margin:4px 0}p{margin:3px 0;font-size:13px}.check{margin-top:8px}
    </style></head><body>${body}<script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
    return true;
  }

  async function handlePrintCartons(list: ShipOrder[]) {
    if (!list.length || !printCartons(list)) return;
    for (const o of list) {
      await callAction({
        action: "shipment_update", order_number: o.order_number, mark: "carton_printed",
        carton_size: cartonFor[o.id] ?? s(o)?.carton_size ?? CARTONS[1],
        status: "processing", event_label: "Colis en préparation",
      });
    }
    toast({ title: `${list.length} carton(s) imprimé(s)` });
    load();
  }

  async function handlePrintLabels(list: ShipOrder[]) {
    if (!list.length) return;
    const data = await fetchLabelsData(list.map((o) => o.id));
    const res = await printLabels(data, format);
    if (!res.ok) { toast({ title: "Impression impossible", description: res.error, variant: "destructive" }); return; }
    for (const o of list) {
      await callAction({ action: "shipment_update", order_number: o.order_number, mark: "label_printed", event_label: "Étiquette BIB éditée" });
    }
    toast({ title: `${list.length} étiquette(s) A6 éditée(s)` });
    load();
  }

  const Row = ({ o, children }: { o: ShipOrder; children: React.ReactNode }) => (
    <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="font-mono text-xs">{o.order_number}</p>
        <p className="text-xs text-muted-foreground truncate">{o.customer_name}</p>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );

  const busy = (o: ShipOrder) => busyId === o.id;
  const empty = (t: string) => <p className="text-sm text-muted-foreground">{t}</p>;

  return (
    <div className="space-y-4">
      {loading && <p className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Synchronisation…</p>}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* 1. Ordres reçus */}
        <Card className="p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Inbox className="w-4 h-4 text-accent" /> Ordres reçus <Badge variant="secondary">{received.length}</Badge></h3>
          {received.length === 0 ? empty("Aucun nouvel ordre.") : received.map((o) => (
            <Row key={o.id} o={o}>
              <Button size="sm" disabled={busy(o)} onClick={() => update(o, { mark: "received", event_label: "Commande prise en charge par l'entrepôt" }, "Ordre accepté")}>
                Accepter
              </Button>
            </Row>
          ))}
        </Card>

        {/* 2. Cartons à imprimer */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2"><Package2 className="w-4 h-4 text-accent" /> Cartons à imprimer <Badge variant="secondary">{cartons.length}</Badge></h3>
            <Button size="sm" variant="outline" disabled={!cartons.length} onClick={() => handlePrintCartons(cartons)}>
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Tout imprimer
            </Button>
          </div>
          {cartons.length === 0 ? empty("Aucun carton en attente.") : cartons.map((o) => (
            <Row key={o.id} o={o}>
              <Select value={cartonFor[o.id] ?? CARTONS[1]} onValueChange={(v) => setCartonFor((p) => ({ ...p, [o.id]: v }))}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{CARTONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" variant="ghost" onClick={() => handlePrintCartons([o])}><Printer className="w-3.5 h-3.5" /></Button>
            </Row>
          ))}
        </Card>

        {/* 3. Étiquettes A6 */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="font-semibold flex items-center gap-2"><Printer className="w-4 h-4 text-accent" /> Étiquettes A6 BIB <Badge variant="secondary">{labels.length}</Badge></h3>
            <div className="flex items-center gap-2">
              <Select value={format} onValueChange={(v) => setFormat(v as "a6" | "a4-sheet")}>
                <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="a6">A6 thermique</SelectItem>
                  <SelectItem value="a4-sheet">Feuille A4 (×4)</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" disabled={!labels.length} onClick={() => handlePrintLabels(labels)}>Tout éditer</Button>
            </div>
          </div>
          {labels.length === 0 ? empty("Aucune étiquette à éditer.") : labels.map((o) => (
            <Row key={o.id} o={o}>
              <span className="text-xs text-muted-foreground">{s(o)?.carton_size}</span>
              <Button size="sm" variant="ghost" onClick={() => handlePrintLabels([o])}><Printer className="w-3.5 h-3.5" /></Button>
            </Row>
          ))}
        </Card>
      </div>

      {/* 4. Suivi par livreur */}
      <Card className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-accent" /> Suivi par livreur</h3>
        {inDelivery.length === 0 ? empty("Aucun colis en livraison.") : (
          <div className="space-y-5">
            {Object.entries(byDriver).map(([driver, list]) => (
              <div key={driver}>
                <p className="text-sm font-medium flex items-center gap-2 mb-2"><User className="w-3.5 h-3.5" /> {driver} <Badge variant="outline">{list.length} colis</Badge></p>
                <div className="space-y-3">
                  {list.map((o) => {
                    const sh = s(o);
                    const d = driverDraft[o.id] ?? { name: sh?.driver_name ?? "", phone: sh?.driver_phone ?? "", location: sh?.last_location ?? "", eta: sh?.eta ?? "" };
                    const set = (k: keyof typeof d, v: string) => setDriverDraft((p) => ({ ...p, [o.id]: { ...d, [k]: v } }));
                    return (
                      <div key={o.id} className="rounded-md border border-border/60 p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-mono text-xs">{o.order_number} · <span className="text-muted-foreground">{o.customer_name}</span></p>
                          <Badge variant={o.logistics_status === "shipped" ? "default" : "secondary"}>{o.logistics_status === "shipped" ? "En route" : "Prêt"}</Badge>
                        </div>
                        <div className="grid sm:grid-cols-4 gap-2">
                          <div><Label className="text-xs">Livreur</Label><Input className="h-8" value={d.name} onChange={(e) => set("name", e.target.value)} /></div>
                          <div><Label className="text-xs">Téléphone</Label><Input className="h-8" value={d.phone} onChange={(e) => set("phone", e.target.value)} /></div>
                          <div><Label className="text-xs">Position</Label><Input className="h-8" value={d.location} onChange={(e) => set("location", e.target.value)} placeholder="ex: Lyon hub" /></div>
                          <div><Label className="text-xs">Livraison prévue</Label><Input className="h-8" type="date" value={d.eta} onChange={(e) => set("eta", e.target.value)} /></div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Button size="sm" variant="outline" disabled={busy(o)} onClick={() => update(o, { driver_name: d.name, driver_phone: d.phone, last_location: d.location, eta: d.eta, event_label: d.name ? `Confié au livreur ${d.name}` : "Informations de livraison mises à jour" }, "Livreur mis à jour")}>
                            <User className="w-3.5 h-3.5 mr-1.5" /> Enregistrer
                          </Button>
                          <Button size="sm" variant="outline" disabled={busy(o)} onClick={() => update(o, { driver_name: d.name, last_location: d.location, eta: d.eta, status: "shipped", event_label: d.location ? `En cours de livraison — ${d.location}` : "En cours de livraison" }, "Colis en route")}>
                            <MapPin className="w-3.5 h-3.5 mr-1.5" /> En route
                          </Button>
                          <Button size="sm" disabled={busy(o)} onClick={() => update(o, { status: "delivered", event_label: "Colis livré" }, "Livraison confirmée")}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Livré
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
