import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useCustomerProfile,
  useCreateCustomerProfile,
  useCustomerOrders,
  useCustomerGiftCards,
  useRecyclingHistory,
} from "@/hooks/useCustomerProfile";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { toast } from "sonner";
import {
  Loader2, Package, Gift, Recycle, LogOut, ShoppingBag, ArrowRight, Sparkles,
} from "lucide-react";

const formatEUR = (cents: number) => (cents / 100).toFixed(2) + " €";
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const STATUS_LABELS: Record<string, string> = {
  pending: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function MonCompte() {
  const { user, loading, signOut } = useAuth();
  const { data: customer, isLoading: profileLoading } = useCustomerProfile();
  const navigate = useNavigate();

  useSEO({
    title: "Mon compte — Brand-In-A-Box",
    description: "Vos commandes, vos cartes cadeaux par boutique et vos points de recyclage.",
  });

  if (loading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <NotLoggedIn />;
  if (!customer)
    return (
      <CompleteProfileScreen
        email={user.email ?? ""}
        defaultName={(user.user_metadata as any)?.full_name ?? ""}
      />
    );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/marketplace"><Logo iconSize={28} asLink={false} /></Link>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/marketplace"); }}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">
            Bonjour, {customer.full_name?.split(" ")[0] || "à vous"} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">{customer.email}</p>
        </div>

        <SummaryCards />

        <Tabs defaultValue="orders" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders"><Package className="h-4 w-4 mr-2" />Commandes</TabsTrigger>
            <TabsTrigger value="giftcards"><Gift className="h-4 w-4 mr-2" />Cartes cadeaux</TabsTrigger>
            <TabsTrigger value="recycling"><Recycle className="h-4 w-4 mr-2" />Recyclage</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
          <TabsContent value="giftcards" className="mt-6"><GiftCardsTab /></TabsContent>
          <TabsContent value="recycling" className="mt-6"><RecyclingTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function NotLoggedIn() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Mon compte Brand-In-A-Box</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Connectez-vous pour retrouver vos commandes, vos cartes cadeaux et vos points recyclage.
          </p>
          <Button asChild className="w-full"><Link to="/login?next=/mon-compte">Se connecter</Link></Button>
          <Button asChild variant="outline" className="w-full"><Link to="/signup?next=/mon-compte">Créer un compte</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}

function CompleteProfileScreen({ email, defaultName }: { email: string; defaultName?: string }) {
  const [fullName, setFullName] = useState(defaultName ?? "");
  const [optIn, setOptIn] = useState(false);
  const create = useCreateCustomerProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { claimedCount } = await create.mutateAsync({
        email, fullName: fullName.trim() || undefined, marketingOptIn: optIn,
      });
      if (claimedCount > 0) {
        toast.success(`${claimedCount} commande${claimedCount > 1 ? "s" : ""} rattachée${claimedCount > 1 ? "s" : ""} à votre compte 🎉`);
      } else {
        toast.success("Compte créé !");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erreur lors de la création du compte");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Activez votre espace client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><Label>Email</Label><Input value={email} disabled /></div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Votre nom (optionnel)</Label>
              <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jean Dupont" />
            </div>
            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <Checkbox checked={optIn} onCheckedChange={(v) => setOptIn(v === true)} className="mt-0.5" />
              <span className="text-muted-foreground">Je souhaite recevoir les bons plans des boutiques BIB.</span>
            </label>
            <Button type="submit" className="w-full" disabled={create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activer mon compte"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Vos commandes passées en invité avec cet email seront automatiquement rattachées.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCards() {
  const { data: customer } = useCustomerProfile();
  const { data: orders = [] } = useCustomerOrders();
  const { data: giftCards = [] } = useCustomerGiftCards();
  const totalGift = giftCards.reduce((s, g) => s + g.balance_cents, 0);
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Commandes</p><p className="mt-1 font-display text-2xl font-bold">{orders.length}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Cartes cadeaux</p><p className="mt-1 font-display text-2xl font-bold text-primary">{formatEUR(totalGift)}</p></CardContent></Card>
      <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Points recyclage</p><p className="mt-1 font-display text-2xl font-bold text-emerald-600">{customer?.total_recycling_points ?? 0}</p></CardContent></Card>
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [], isLoading } = useCustomerOrders();
  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin mx-auto" />;
  if (orders.length === 0) return <EmptyState icon={Package} text="Aucune commande pour le moment." cta="Découvrir les boutiques" to="/marketplace" />;
  return (
    <div className="space-y-3">
      {orders.map((o: any) => (
        <Card key={o.id} className="overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            {o.boutiques?.logo_url ? (
              <img src={o.boutiques.logo_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold">{o.boutiques?.name?.[0] ?? "?"}</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium truncate">{o.boutiques?.name ?? "Boutique"}</p>
                <Badge variant="outline" className="text-xs">{STATUS_LABELS[o.logistics_status] ?? o.logistics_status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">{o.products?.supplier_products?.name ?? "Produit"} · {o.order_number} · {formatDate(o.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{Number(o.amount).toFixed(2)} €</p>
              {o.boutiques?.slug && <Link to={`/boutique/${o.boutiques.slug}/order-tracking`} className="text-xs text-primary hover:underline">Suivre →</Link>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GiftCardsTab() {
  const { data: cards = [], isLoading } = useCustomerGiftCards();
  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin mx-auto" />;
  if (cards.length === 0) return <EmptyState icon={Gift} text="Recyclez vos cartons pour gagner des cartes cadeaux ! 1 point = 0,10 €" />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((c: any) => (
        <Card key={c.id} className="overflow-hidden border-primary/20">
          <div className="h-24 bg-gradient-to-br from-primary to-primary/70 relative" style={c.boutiques?.cover_image_url ? { backgroundImage: `url(${c.boutiques.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-transparent" />
            <Gift className="absolute right-3 top-3 h-5 w-5 text-white/90" />
          </div>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Carte cadeau</p>
            <p className="font-display text-lg font-semibold truncate">{c.boutiques?.name}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-2xl font-bold text-primary">{formatEUR(c.balance_cents)}</span>
              {c.boutiques?.slug && <Link to={`/boutique/${c.boutiques.slug}`} className="text-xs text-primary hover:underline inline-flex items-center gap-1">Utiliser <ArrowRight className="h-3 w-3" /></Link>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecyclingTab() {
  const { data: scans = [], isLoading } = useRecyclingHistory();
  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin mx-auto" />;
  return (
    <div className="space-y-4">
      <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15"><Recycle className="h-5 w-5 text-emerald-600" /></div>
          <div className="flex-1">
            <p className="font-medium">Comment ça marche ?</p>
            <p className="text-sm text-muted-foreground">Scannez le QR code sur le carton de votre commande. Chaque point cumulé devient <strong className="text-foreground">0,10 € de carte cadeau</strong> sur la boutique d'origine.</p>
          </div>
        </CardContent>
      </Card>
      {scans.length === 0 ? (
        <EmptyState icon={Recycle} text="Aucun scan pour l'instant." />
      ) : (
        <div className="space-y-2">
          {scans.map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3">
              {s.boutiques?.logo_url ? <img src={s.boutiques.logo_url} alt="" className="h-9 w-9 rounded-full object-cover" /> : <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs">{s.boutiques?.name?.[0] ?? "?"}</div>}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{s.boutiques?.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(s.created_at)} · {s.source}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-600">+{s.points} pts</p>
                <p className="text-xs text-muted-foreground">{formatEUR(s.points * 10)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text, cta, to }: { icon: any; text: string; cta?: string; to?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-10 text-center">
      <Icon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{text}</p>
      {cta && to && <Button asChild variant="outline" size="sm" className="mt-4"><Link to={to}>{cta}</Link></Button>}
    </div>
  );
}
