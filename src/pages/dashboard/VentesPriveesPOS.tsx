import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, SectionCard, EmptyState } from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";
import { getStripeEnvironment } from "@/lib/stripe";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, ShoppingCart, Smartphone, CheckCircle2, Loader2, Tag, RefreshCcw } from "lucide-react";

type CartLine = { productId: string; name: string; unitCents: number; qty: number; imageUrl?: string };

export default function VentesPriveesPOS() {
  const { id: saleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: boutiques = [] } = useBoutiques();
  const { data: products = [] } = useProducts();

  const [sale, setSale] = useState<any | null>(null);
  useEffect(() => {
    let mounted = true;
    if (!saleId) return;
    supabase.from("private_sales").select("*").eq("id", saleId).maybeSingle()
      .then(({ data }) => { if (mounted) setSale(data); });
    return () => { mounted = false; };
  }, [saleId]);

  const boutique = boutiques.find((b) => b.id === sale?.boutique_id);
  const boutiqueProducts = useMemo(
    () => products.filter((p) => p.boutique_id === sale?.boutique_id && p.status === "active" && p.stock_quantity > 0),
    [products, sale?.boutique_id],
  );

  const discountPct = sale?.discount_percent ?? 0;
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const addToCart = (p: any) => {
    const unit = Math.round(Number(p.public_price) * 100 * (1 - discountPct / 100));
    const img = (p as any).supplier_products?.image_url;
    setCart((c) => {
      const i = c.findIndex((l) => l.productId === p.id);
      if (i >= 0) {
        const next = [...c];
        next[i] = { ...next[i], qty: Math.min(next[i].qty + 1, p.stock_quantity) };
        return next;
      }
      return [...c, { productId: p.id, name: (p as any).supplier_products?.name || "Produit", unitCents: unit, qty: 1, imageUrl: img }];
    });
  };
  const inc = (id: string) => setCart((c) => c.map((l) => l.productId === id ? { ...l, qty: l.qty + 1 } : l));
  const dec = (id: string) => setCart((c) => c.flatMap((l) => l.productId === id ? (l.qty > 1 ? [{ ...l, qty: l.qty - 1 }] : []) : [l]));
  const totalCents = cart.reduce((s, l) => s + l.unitCents * l.qty, 0);

  const startCheckout = async () => {
    if (!sale || !boutique || cart.length === 0) return;
    setLoading(true); setPaid(false); setCheckoutUrl(null); setOrderIds([]);
    try {
      const { data, error } = await supabase.functions.invoke("create-pos-checkout", {
        body: {
          boutiqueId: boutique.id,
          boutiqueName: boutique.name,
          privateSaleId: sale.id,
          items: cart.map((l) => ({ productId: l.productId, name: l.name, amount: l.unitCents, quantity: l.qty, imageUrl: l.imageUrl })),
          returnUrl: window.location.href,
          environment: getStripeEnvironment(),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCheckoutUrl(data.url);
      setOrderIds(data.orderIds || []);
      setCheckoutOpen(true);
    } catch (e: any) {
      toast.error(e?.message || "Échec de création du paiement");
    } finally { setLoading(false); }
  };

  // Realtime: detect payment confirmation on the created orders
  useEffect(() => {
    if (!checkoutOpen || orderIds.length === 0) return;
    const channel = supabase
      .channel(`pos-orders-${orderIds[0]}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload: any) => {
        if (orderIds.includes(payload.new?.id) && payload.new?.payment_status === "paid") {
          setPaid(true);
        }
      })
      .subscribe();
    // Fallback polling every 4s
    const poll = setInterval(async () => {
      const { data } = await supabase.from("orders").select("id,payment_status").in("id", orderIds);
      if (data?.every((o: any) => o.payment_status === "paid")) setPaid(true);
    }, 4000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [checkoutOpen, orderIds]);

  useEffect(() => {
    if (paid) {
      toast.success("Paiement confirmé ✓");
      // sound: subtle
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880; g.gain.value = 0.08;
        o.start(); setTimeout(() => { o.stop(); ctx.close(); }, 220);
      } catch {}
    }
  }, [paid]);

  const resetSession = () => {
    setCart([]); setCheckoutOpen(false); setPaid(false); setCheckoutUrl(null); setOrderIds([]);
  };

  if (!sale) {
    return <DashboardLayout><div className="p-8 text-muted-foreground">Chargement de la session…</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="POS · Vente privée"
        title={sale.name}
        subtitle={`Boutique ${boutique?.name ?? "—"} · Remise -${discountPct}% appliquée automatiquement`}
        actions={
          <Button variant="ghost" onClick={() => navigate("/dashboard/ventes-privees")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Quitter la session
          </Button>
        }
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">
        <SectionCard>
          {boutiqueProducts.length === 0 ? (
            <EmptyState
              icon={<ShoppingCart className="h-8 w-8" />}
              title="Aucun produit en stock"
              description="Activez des produits avec du stock disponible pour pouvoir encaisser."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {boutiqueProducts.map((p: any) => {
                const base = Number(p.public_price);
                const final = base * (1 - discountPct / 100);
                const img = p.supplier_products?.image_url;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="group relative text-left rounded-xl border border-border bg-card hover:border-bib-gold/60 hover:shadow-md transition overflow-hidden"
                  >
                    {img ? (
                      <div className="aspect-square w-full overflow-hidden bg-muted">
                        <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </div>
                    ) : (
                      <div className="aspect-square w-full bg-muted" />
                    )}
                    <div className="p-2.5">
                      <div className="text-xs font-medium text-foreground line-clamp-2 min-h-[2.2em]">{p.supplier_products?.name}</div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <div>
                          {discountPct > 0 && (
                            <div className="text-[10px] text-muted-foreground line-through">{base.toFixed(2)}€</div>
                          )}
                          <div className="text-sm font-bold text-bib-marine">{final.toFixed(2)}€</div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">stock {p.stock_quantity}</Badge>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Cart panel */}
        <SectionCard>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Panier
            </h3>
            {discountPct > 0 && (
              <Badge variant="outline" className="bg-bib-gold/10 text-bib-gold border-bib-gold/30">
                <Tag className="h-3 w-3 mr-1" /> -{discountPct}%
              </Badge>
            )}
          </div>
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Touchez un produit pour l'ajouter</p>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {cart.map((l) => (
                <div key={l.productId} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{(l.unitCents / 100).toFixed(2)}€ × {l.qty}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => dec(l.productId)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-6 text-center text-sm font-medium">{l.qty}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => inc(l.productId)}><Plus className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total TTC</span>
              <span className="text-2xl font-bold text-bib-marine">{(totalCents / 100).toFixed(2)}€</span>
            </div>
            <Button
              className="w-full bg-bib-marine hover:bg-bib-marine/90 h-12 text-base"
              disabled={cart.length === 0 || loading}
              onClick={startCheckout}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Smartphone className="h-4 w-4 mr-2" />}
              Encaisser
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* QR modal */}
      <Dialog open={checkoutOpen} onOpenChange={(o) => { if (!o) resetSession(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {paid ? "Paiement reçu" : "Scannez pour payer"}
            </DialogTitle>
            <DialogDescription>
              {paid
                ? "La commande a été enregistrée. Le stock est mis à jour automatiquement."
                : "Le client scanne ce QR avec l'appareil photo de son téléphone et paie en 1 tap (Apple Pay, Google Pay, carte)."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {paid ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-20 w-20 rounded-full bg-success/15 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-success" />
                </div>
                <div className="text-3xl font-bold text-bib-marine">{(totalCents / 100).toFixed(2)}€</div>
                <p className="text-sm text-muted-foreground">Commande en préparation logistique</p>
              </div>
            ) : checkoutUrl ? (
              <>
                <div className="p-4 bg-white rounded-2xl border-4 border-bib-marine">
                  <QRCodeSVG value={checkoutUrl} size={240} level="M" />
                </div>
                <div className="mt-4 text-2xl font-bold text-bib-marine">{(totalCents / 100).toFixed(2)}€</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> En attente du paiement…
                </div>
              </>
            ) : (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={resetSession}>
              {paid ? <><RefreshCcw className="h-4 w-4 mr-1.5" /> Nouveau client</> : "Annuler"}
            </Button>
            {paid && (
              <Button className="flex-1 bg-bib-marine hover:bg-bib-marine/90" onClick={() => navigate("/dashboard/commandes")}>
                Voir la commande
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}