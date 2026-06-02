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
import { fetchLabelData, fetchLabelsData, printLabels } from "@/lib/shippingLabel";
import { PlatformTour, PlatformTourLauncher } from "@/components/tour/PlatformTour";
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
  ScanLine,
  Printer,
  AlertTriangle,
  Inbox,
  Wrench,
  ClipboardList,
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
  const incidents = events.filter((e) => e.kind === "packaging_alert" && (e.payload as Record<string, unknown> | null)?.["incident"] === true);

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

  function escapeHtml(s: string) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  }

  function openPrintWindow(title: string, body: string) {
    const w = window.open("", "_blank", "width=820,height=900");
    if (!w) {
      toast({ title: "Pop-up bloqué", description: "Autorisez les pop-ups pour imprimer.", variant: "destructive" });
      return;
    }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title>
      <style>
        body{font-family:Inter,system-ui,sans-serif;color:#0f172a;padding:24px}
        .label{border:1px solid #0f172a;border-radius:8px;padding:16px;margin-bottom:12px;page-break-inside:avoid}
        .label h2{margin:0 0 8px;font-size:16px}
        .label p{margin:2px 0;font-size:12px}
        .meta{color:#64748b;font-size:11px;margin-top:8px}
        @media print{ button{display:none} }
      </style></head><body>
      <button onclick="window.print()" style="margin-bottom:16px;padding:8px 14px;border-radius:6px;border:1px solid #0f172a;background:#0f172a;color:#fff;cursor:pointer">Imprimer</button>
      ${body}
      </body></html>`);
    w.document.close();
  }

  const [labelFormat, setLabelFormat] = useState<"a6" | "a4-sheet">("a6");

  async function printShippingLabel(order: BasicOrder) {
    const data = await fetchLabelData(order.id);
    if (!data) {
      toast({ title: "Impossible de charger les données d'étiquette", variant: "destructive" });
      return;
    }
    const res = await printLabels([data], labelFormat);
    if (!res.ok) toast({ title: res.error ?? "Erreur d'impression", variant: "destructive" });
  }

  async function printAllShippingLabels() {
    if (orders.length === 0) {
      toast({ title: "Aucune commande à imprimer" });
      return;
    }
    const items = await fetchLabelsData(orders.map((o) => o.id));
    const res = await printLabels(items, labelFormat);
    if (!res.ok) toast({ title: res.error ?? "Erreur d'impression", variant: "destructive" });
  }

  function printStatusUpdates() {
    if (deliveryUpdates.length === 0) {
      toast({ title: "Aucun changement de statut à imprimer" });
      return;
    }
    const body = deliveryUpdates.map((e) => {
      const p = (e.payload ?? {}) as Record<string, unknown>;
      return `<div class="label">
        <h2>${escapeHtml(e.title)}</h2>
        <p><b>Commande :</b> ${escapeHtml(String(p.order_number ?? "—"))}</p>
        <p><b>Statut :</b> ${escapeHtml(String(p.status ?? "—"))}</p>
        <p><b>Note :</b> ${escapeHtml(String(p.note ?? "—"))}</p>
        <p class="meta">${new Date(e.created_at).toLocaleString("fr-FR")}</p>
      </div>`;
    }).join("");
    openPrintWindow("Changements de statut", body);
  }

  // Scan colis
  const [scanCode, setScanCode] = useState("");
  const [scanResult, setScanResult] = useState<BasicOrder | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  async function handleScan(code?: string) {
    const value = (code ?? scanCode).trim().toUpperCase();
    if (!value) return;
    setScanError(null);
    const { data: rows, error: err } = await supabase
      .from("orders")
      .select("id, order_number, customer_name, amount, logistics_status, created_at")
      .eq("order_number", value)
      .limit(1);
    if (err || !rows || rows.length === 0) {
      setScanResult(null);
      setScanError("Aucune commande trouvée pour ce code.");
      return;
    }
    setScanResult(rows[0] as BasicOrder);
  }

  // Réception marchandises
  const [recvRef, setRecvRef] = useState("");
  const [recvQty, setRecvQty] = useState("");
  const [recvNote, setRecvNote] = useState("");
  async function submitReception() {
    if (!recvRef.trim()) {
      toast({ title: "Référence requise" });
      return;
    }
    setBusy(true);
    try {
      await callAction({
        action: "create_event",
        kind: "delivery_update",
        title: `Réception · ${recvRef.trim()} (${recvQty || "?"})`,
        payload: { reception: true, reference: recvRef.trim(), quantity: recvQty ? Number(recvQty) : null, note: recvNote },
      });
      setRecvRef(""); setRecvQty(""); setRecvNote("");
      toast({ title: "Réception enregistrée" });
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  // Restock cartons
  const [restockItem, setRestockItem] = useState("Carton M (40x30x20)");
  const [restockQty, setRestockQty] = useState("");
  async function submitRestock() {
    if (!restockItem.trim() || !restockQty.trim()) {
      toast({ title: "Article et quantité requis" });
      return;
    }
    setBusy(true);
    try {
      await callAction({
        action: "create_event",
        kind: "packaging_alert",
        title: `Restock · ${restockItem} (+${restockQty})`,
        payload: { restock: true, item: restockItem, quantity: Number(restockQty) },
      });
      setRestockQty("");
      toast({ title: "Restock enregistré" });
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  // Incidents
  const [incTitle, setIncTitle] = useState("");
  const [incDetail, setIncDetail] = useState("");
  const [incOrder, setIncOrder] = useState("");
  async function submitIncident() {
    if (!incTitle.trim()) {
      toast({ title: "Titre requis" });
      return;
    }
    setBusy(true);
    try {
      await callAction({
        action: "create_event",
        kind: "packaging_alert",
        title: `Incident · ${incTitle.trim()}`,
        payload: { incident: true, order_number: incOrder.trim().toUpperCase() || null, detail: incDetail },
      });
      setIncTitle(""); setIncDetail(""); setIncOrder("");
      toast({ title: "Incident signalé", description: "L'équipe Ops BIB est notifiée." });
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
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {submission.company ?? submission.contact_email}
            </h1>
            <PlatformTourLauncher label="Guide partenaire" availablePersonas={["ops", "supplier"]} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Dashboard stock, commandes des boutiques, livraisons, packaging, retours.
          </p>
          <PlatformTour autoOpen availablePersonas={["ops", "supplier"]} />
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
            <TabsTrigger value="operations">Opérations</TabsTrigger>
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
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={printAllShippingLabels} disabled={orders.length === 0}>
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Imprimer étiquettes
                  </Button>
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
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => printShippingLabel(o)} title="Imprimer étiquette">
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setDeliveryOrder(o.order_number);
                          const tab = document.querySelector<HTMLButtonElement>('[data-state][value="delivery"], [role="tab"][value="delivery"]');
                          tab?.click();
                        }}>Statut</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* OPÉRATIONS */}
          <TabsContent value="operations" className="space-y-4 mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Commandes à traiter */}
              <Card className="p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-accent" /> Commandes à traiter
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{stockSummary.pending + stockSummary.preparing} commande(s) en attente · {stockSummary.inTransit} en transit.</p>
                <Button size="sm" variant="outline" onClick={() => {
                  const tab = document.querySelector<HTMLButtonElement>('[role="tab"][value="orders"]');
                  tab?.click();
                }}>Ouvrir la liste</Button>
              </Card>

              {/* Scan colis */}
              <Card className="p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <ScanLine className="w-4 h-4 text-accent" /> Scan colis
                </h3>
                <div className="flex gap-2">
                  <Input
                    value={scanCode}
                    onChange={(e) => setScanCode(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleScan(); }}
                    placeholder="BIB26-XXXXXX ou code-barres"
                    className="font-mono"
                  />
                  <Button size="sm" onClick={() => handleScan()}>Scanner</Button>
                </div>
                {scanError && <p className="text-xs text-destructive mt-2">{scanError}</p>}
                {scanResult && (
                  <div className="mt-3 p-3 rounded-md bg-muted/40 text-xs space-y-1">
                    <p className="font-mono">{scanResult.order_number}</p>
                    <p>{scanResult.customer_name} · {Number(scanResult.amount).toFixed(2)} €</p>
                    <p>Statut : <Badge variant="outline">{scanResult.logistics_status}</Badge></p>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => printShippingLabel(scanResult)}>
                        <Printer className="w-3.5 h-3.5 mr-1.5" /> Étiquette
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setDeliveryOrder(scanResult.order_number);
                        const tab = document.querySelector<HTMLButtonElement>('[role="tab"][value="delivery"]');
                        tab?.click();
                      }}>Mettre à jour statut</Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Réception marchandises */}
              <Card className="p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Inbox className="w-4 h-4 text-accent" /> Réception marchandises
                </h3>
                <div className="grid sm:grid-cols-2 gap-2 mb-2">
                  <div><Label>Référence / SKU *</Label><Input value={recvRef} onChange={(e) => setRecvRef(e.target.value)} placeholder="REF-MC-DEC-1250" /></div>
                  <div><Label>Quantité</Label><Input type="number" value={recvQty} onChange={(e) => setRecvQty(e.target.value)} /></div>
                </div>
                <Label>Note</Label>
                <Textarea rows={2} value={recvNote} onChange={(e) => setRecvNote(e.target.value)} placeholder="État, écart, fournisseur…" />
                <Button onClick={submitReception} disabled={busy} className="mt-3" size="sm">
                  {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Inbox className="w-4 h-4 mr-2" />}
                  Enregistrer la réception
                </Button>
              </Card>

              {/* Gestion expédition / impressions */}
              <Card className="p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-accent" /> Gestion expédition
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Imprimer les étiquettes des commandes à expédier et l'historique des changements de statut.
                </p>
                <div className="flex items-center gap-2 mb-3 text-xs">
                  <span className="text-muted-foreground">Format :</span>
                  <div className="inline-flex rounded-md border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setLabelFormat("a6")}
                      className={`px-2.5 py-1 ${labelFormat === "a6" ? "bg-foreground text-background" : "bg-background text-foreground"}`}
                    >
                      A6 thermique (10×15)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabelFormat("a4-sheet")}
                      className={`px-2.5 py-1 ${labelFormat === "a4-sheet" ? "bg-foreground text-background" : "bg-background text-foreground"}`}
                    >
                      A4 × 4
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={printAllShippingLabels}>
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Étiquettes ({orders.length})
                  </Button>
                  <Button size="sm" variant="outline" onClick={printStatusUpdates}>
                    <Printer className="w-3.5 h-3.5 mr-1.5" /> Changements de statut
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const tab = document.querySelector<HTMLButtonElement>('[role="tab"][value="delivery"]');
                    tab?.click();
                  }}>Mettre à jour un statut →</Button>
                </div>
              </Card>

              {/* Gestion retours + restock */}
              <Card className="p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <PackageX className="w-4 h-4 text-accent" /> Gestion retours & restock cartons
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{returns.length} retour(s) en cours.</p>
                <div className="grid sm:grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label>Type de carton</Label>
                    <Select value={restockItem} onValueChange={setRestockItem}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Carton XS (20x15x10)">Carton XS (20x15x10)</SelectItem>
                        <SelectItem value="Carton S (30x20x15)">Carton S (30x20x15)</SelectItem>
                        <SelectItem value="Carton M (40x30x20)">Carton M (40x30x20)</SelectItem>
                        <SelectItem value="Carton L (50x40x30)">Carton L (50x40x30)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Quantité reçue *</Label><Input type="number" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} /></div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button size="sm" onClick={submitRestock} disabled={busy} variant="outline">
                    <Package2 className="w-3.5 h-3.5 mr-1.5" /> Enregistrer restock
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => {
                    const tab = document.querySelector<HTMLButtonElement>('[role="tab"][value="returns"]');
                    tab?.click();
                  }}>Ouvrir les retours →</Button>
                </div>
              </Card>

              {/* Incidents */}
              <Card className="p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-warning" /> Gestion incidents
                </h3>
                <div className="grid sm:grid-cols-2 gap-2 mb-2">
                  <div><Label>Titre *</Label><Input value={incTitle} onChange={(e) => setIncTitle(e.target.value)} placeholder="ex: colis endommagé" /></div>
                  <div><Label>N° commande</Label><Input value={incOrder} onChange={(e) => setIncOrder(e.target.value)} placeholder="BIB26-XXXXXX" className="font-mono" /></div>
                </div>
                <Label>Détail</Label>
                <Textarea rows={2} value={incDetail} onChange={(e) => setIncDetail(e.target.value)} placeholder="Description, zone, photos transmises séparément…" />
                <Button onClick={submitIncident} disabled={busy} className="mt-3" size="sm" variant="outline">
                  {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
                  Signaler l'incident
                </Button>
                {incidents.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Incidents récents</p>
                    <EventList events={incidents.slice(0, 5)} emptyLabel="Aucun incident." />
                  </div>
                )}
              </Card>
            </div>
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
                <div><Label>N° de commande *</Label><Input value={deliveryOrder} onChange={(e) => setDeliveryOrder(e.target.value)} placeholder="BIB26-XXXXXX" className="font-mono" /></div>
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
                <div><Label>N° commande *</Label><Input value={returnOrder} onChange={(e) => setReturnOrder(e.target.value)} placeholder="BIB26-XXXXXX" className="font-mono" /></div>
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