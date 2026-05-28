import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { usePartnerPortal, type PortalEvent } from "@/hooks/usePartnerPortal";
import {
  ArrowLeft,
  Boxes,
  Loader2,
  Package2,
  PackageCheck,
  PackageX,
  RefreshCcw,
  Truck,
  XCircle,
} from "lucide-react";

const DELIVERY_STATUSES = [
  { value: "processing", label: "Préparation" },
  { value: "shipped", label: "Expédié" },
  { value: "delivered", label: "Livré" },
  { value: "returned", label: "Retour" },
];

interface BasicOrder {
  id: string;
  order_number: string;
  customer_name: string;
  amount: number;
  logistics_status: string;
  created_at: string;
}

export default function OpsPortal() {
  const { token = "" } = useParams<{ token: string }>();
  const { data, loading, error, callAction } = usePartnerPortal(token);
  const [busy, setBusy] = useState(false);

  const [orders, setOrders] = useState<BasicOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Packaging alert form
  const [pkgItem, setPkgItem] = useState("Carton standard");
  const [pkgStock, setPkgStock] = useState("");

  // Return logged form
  const [returnOrder, setReturnOrder] = useState("");
  const [returnReason, setReturnReason] = useState("");

  // Delivery update form
  const [deliveryOrder, setDeliveryOrder] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("shipped");
  const [deliveryNote, setDeliveryNote] = useState("");

  useSEO({
    title: data
      ? `Portail Ops · ${data.submission.company ?? data.submission.contact_email} — Brand-In-A-Box`
      : "Portail Ops — Brand-In-A-Box",
    description: "Espace opérationnel logistique : stock, commandes, livraisons, retours.",
  });

  // Pull recent orders awaiting logistics (read-only view of the network)
  useEffect(() => {
    if (!data) return;
    setOrdersLoading(true);
    supabase
      .from("orders")
      .select("id, order_number, customer_name, amount, logistics_status, created_at")
      .in("logistics_status", ["pending", "processing", "shipped"])
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data: rows }) => {
        setOrders((rows ?? []) as BasicOrder[]);
        setOrdersLoading(false);
      });
  }, [data]);

  const events = data?.events ?? [];
  const deliveryUpdates = events.filter((e) => e.kind === "delivery_update");
  const packagingAlerts = events.filter((e) => e.kind === "packaging_alert");
  const returns = events.filter((e) => e.kind === "return_logged");

  const stockSummary = useMemo(() => {
    const pending = orders.filter((o) => o.logistics_status === "pending").length;
    const preparing = orders.filter((o) => o.logistics_status === "processing").length;
    const inTransit = orders.filter((o) =>
      ["shipped"].includes(o.logistics_status),
    ).length;
    return { pending, preparing, inTransit, returns: returns.length };
  }, [orders, returns]);

  if (loading) {
    return (
      <StandaloneLayout portal="Logistics" accent="accent">
        <section className="container mx-auto px-4 py-20 max-w-xl text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">Chargement du portail…</p>
        </section>
      </StandaloneLayout>
    );
  }

  if (error || !data) {
    return (
      <StandaloneLayout portal="Logistics" accent="accent">
        <section className="container mx-auto px-4 py-16 max-w-xl">
          <Card className="p-6 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h2 className="font-semibold">Accès impossible</h2>
                <p className="text-sm text-muted-foreground mt-1">{error ?? "Dossier introuvable."}</p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link to="/ops/onboarding/resume?portal=ops">Récupérer l'accès à mon dossier</Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </StandaloneLayout>
    );
  }

  const { submission } = data;

  async function submitDeliveryUpdate() {
    if (!deliveryOrder.trim()) {
      toast({ title: "N° commande requis" });
      return;
    }
    setBusy(true);
    try {
      // Update logistics_status directly on the order (Ops portal partners are trusted)
      const { error: upErr } = await supabase
        .from("orders")
        // deno-lint-ignore no-explicit-any
        .update({ logistics_status: deliveryStatus as any })
        .eq("order_number", deliveryOrder.trim().toUpperCase());
      if (upErr) throw upErr;

      await callAction({
        action: "create_event",
        kind: "delivery_update",
        title: `${deliveryOrder.trim().toUpperCase()} → ${DELIVERY_STATUSES.find(s => s.value === deliveryStatus)?.label}`,
        payload: { order_number: deliveryOrder.trim().toUpperCase(), status: deliveryStatus, note: deliveryNote },
      });
      setDeliveryOrder(""); setDeliveryNote("");
      toast({ title: "Statut de livraison mis à jour", description: "Le client final et la boutique sont notifiés." });
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function submitPackagingAlert() {
    if (!pkgItem.trim()) return;
    setBusy(true);
    try {
      await callAction({
        action: "create_event",
        kind: "packaging_alert",
        title: `${pkgItem} — stock ${pkgStock || "?"}`,
        payload: { item: pkgItem, remaining: pkgStock ? Number(pkgStock) : null },
      });
      setPkgStock("");
      toast({ title: "Alerte packaging envoyée" });
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function submitReturn() {
    if (!returnOrder.trim() || !returnReason.trim()) {
      toast({ title: "N° commande et motif requis" });
      return;
    }
    setBusy(true);
    try {
      await callAction({
        action: "create_event",
        kind: "return_logged",
        title: `Retour ${returnOrder.trim().toUpperCase()}`,
        payload: { order_number: returnOrder.trim().toUpperCase(), reason: returnReason },
      });
      setReturnOrder(""); setReturnReason("");
      toast({ title: "Retour enregistré" });
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <StandaloneLayout
      portal="Logistics"
      accent="accent"
      menuItems={[
        { label: "Présentation", href: "/ops", icon: "truck" },
        { label: "Mon dossier", href: `/portal/onboarding/${token}`, icon: "file" },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-5xl space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link to={`/portal/onboarding/${token}`}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Suivi onboarding
            </Link>
          </Button>
          <Badge variant="secondary" className="mb-2">Portail opérationnel · Logistics</Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {submission.company ?? submission.contact_email}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Dashboard stock, commandes des boutiques, livraisons, packaging, retours.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Boxes className="w-4 h-4" />} label="Commandes à préparer" value={stockSummary.pending + stockSummary.preparing} />
          <StatCard icon={<Truck className="w-4 h-4" />} label="En transit" value={stockSummary.inTransit} />
          <StatCard icon={<Package2 className="w-4 h-4" />} label="Alertes packaging" value={packagingAlerts.filter(e => e.status === "open").length} />
          <StatCard icon={<PackageX className="w-4 h-4" />} label="Retours en cours" value={stockSummary.returns} />
        </div>

        <Tabs defaultValue="orders">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="delivery">Mise à jour livraison</TabsTrigger>
            <TabsTrigger value="packaging">Packaging</TabsTrigger>
            <TabsTrigger value="returns">Retours</TabsTrigger>
          </TabsList>

          {/* ORDERS */}
          <TabsContent value="orders" className="space-y-4 mt-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-accent" /> Commandes des boutiques à expédier
                </h3>
                <Button size="sm" variant="ghost" disabled={ordersLoading} onClick={() => {
                  setOrdersLoading(true);
                  supabase.from("orders")
                    .select("id, order_number, customer_name, amount, logistics_status, created_at")
                    .in("logistics_status", ["pending", "processing", "shipped"])
                    .order("created_at", { ascending: false }).limit(50)
                    .then(({ data: rows }) => {
                      setOrders((rows ?? []) as BasicOrder[]);
                      setOrdersLoading(false);
                    });
                }}>
                  <RefreshCcw className={`w-3.5 h-3.5 mr-1.5 ${ordersLoading ? "animate-spin" : ""}`} /> Rafraîchir
                </Button>
              </div>
              {ordersLoading ? (
                <p className="text-sm text-muted-foreground">Chargement…</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune commande en attente.</p>
              ) : (
                <div className="divide-y divide-border/50 text-sm">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-3 py-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs">{o.order_number}</p>
                        <p className="truncate text-muted-foreground text-xs">{o.customer_name} · {Number(o.amount).toFixed(2)} €</p>
                      </div>
                      <Badge variant="outline">{o.logistics_status}</Badge>
                      <Button size="sm" variant="ghost" onClick={() => {
                        setDeliveryOrder(o.order_number);
                        const tab = document.querySelector<HTMLButtonElement>('[data-state][value="delivery"], [role="tab"][value="delivery"]');
                        tab?.click();
                      }}>Mettre à jour</Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* DELIVERY UPDATES */}
          <TabsContent value="delivery" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-accent" /> Mettre à jour le statut de livraison
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Le client final ET la boutique seront notifiés sur leur compte respectif.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>N° de commande *</Label><Input value={deliveryOrder} onChange={(e) => setDeliveryOrder(e.target.value)} placeholder="LKS26-XXXXXX" className="font-mono" /></div>
                <div>
                  <Label>Nouveau statut</Label>
                  <Select value={deliveryStatus} onValueChange={setDeliveryStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DELIVERY_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2"><Label>Note interne (optionnel)</Label><Textarea rows={2} value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} /></div>
              </div>
              <Button onClick={submitDeliveryUpdate} disabled={busy} className="mt-4">
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Mettre à jour
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3">Historique des mises à jour</h3>
              <EventList events={deliveryUpdates} emptyLabel="Aucune mise à jour récente." />
            </Card>
          </TabsContent>

          {/* PACKAGING */}
          <TabsContent value="packaging" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package2 className="w-4 h-4 text-accent" /> Signaler le stock packaging
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Article</Label><Input value={pkgItem} onChange={(e) => setPkgItem(e.target.value)} /></div>
                <div><Label>Stock restant (unités)</Label><Input type="number" value={pkgStock} onChange={(e) => setPkgStock(e.target.value)} /></div>
              </div>
              <Button onClick={submitPackagingAlert} disabled={busy} className="mt-4">
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Envoyer l'alerte
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3">Alertes packaging</h3>
              <EventList events={packagingAlerts} emptyLabel="Aucune alerte." />
            </Card>
          </TabsContent>

          {/* RETURNS */}
          <TabsContent value="returns" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <PackageX className="w-4 h-4 text-accent" /> Enregistrer un retour
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>N° commande *</Label><Input value={returnOrder} onChange={(e) => setReturnOrder(e.target.value)} placeholder="LKS26-XXXXXX" className="font-mono" /></div>
                <div><Label>Motif *</Label><Input value={returnReason} onChange={(e) => setReturnReason(e.target.value)} placeholder="ex: produit endommagé" /></div>
              </div>
              <Button onClick={submitReturn} disabled={busy} className="mt-4">
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Enregistrer
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3">Retours en cours</h3>
              <EventList events={returns} emptyLabel="Aucun retour enregistré." />
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </StandaloneLayout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">{icon} {label}</div>
      <p className="text-2xl font-display font-semibold mt-2">{value}</p>
    </Card>
  );
}

function EventList({ events, emptyLabel }: { events: PortalEvent[]; emptyLabel: string }) {
  if (events.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  return (
    <ul className="space-y-3 text-sm">
      {events.map((e) => (
        <li key={e.id} className="flex items-start justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
          <div className="min-w-0">
            <p className="font-medium">{e.title}</p>
            <p className="text-[11px] text-muted-foreground">{new Date(e.created_at).toLocaleString("fr-FR")}</p>
          </div>
          <Badge variant={e.status === "resolved" ? "default" : e.status === "rejected" ? "destructive" : "secondary"}>
            {e.status === "resolved" ? "Résolu" : e.status === "rejected" ? "Refusé" : e.status === "in_progress" ? "En cours" : "Ouvert"}
          </Badge>
        </li>
      ))}
    </ul>
  );
}