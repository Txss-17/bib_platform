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
import { useFavorites } from "@/hooks/useFavorites";
import { useMarketplaceBoutiques } from "@/hooks/useMarketplace";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Heart,
  Gift,
  Package,
  Settings as SettingsIcon,
  Loader2,
  LogIn,
  LogOut,
  Sparkles,
  ImageOff,
} from "lucide-react";

export type CustomerPanelTab = "favorites" | "giftcards" | "orders" | "settings";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialTab?: CustomerPanelTab;
}

const formatEUR = (cents: number) => (cents / 100).toFixed(2) + " €";
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
const STATUS_LABELS: Record<string, string> = {
  pending: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

/**
 * Slide-over customer panel — keeps the user on the search page.
 * Same dark theme as Marketplace. Handles auth, profile activation, and the
 * four shortcuts (favoris, cartes cadeaux, commandes, paramètres).
 */
export function CustomerPanel({ open, onOpenChange, initialTab = "favorites" }: Props) {
  const { user, loading, signOut } = useAuth();
  const { data: customer, isLoading: profileLoading } = useCustomerProfile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-md border-l border-white/10 bg-[hsl(220_25%_7%)] text-white p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-white/10">
          <SheetTitle className="text-white font-display text-xl">Mon espace</SheetTitle>
          <SheetDescription className="text-white/55 text-xs">
            {user
              ? customer
                ? `Connecté · ${customer.email}`
                : "Activez votre compte client"
              : "Connectez-vous pour retrouver vos commandes."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <Centered><Loader2 className="h-5 w-5 animate-spin text-white/60" /></Centered>
          ) : !user ? (
            <NotLoggedInPanel onClose={() => onOpenChange(false)} />
          ) : profileLoading ? (
            <Centered><Loader2 className="h-5 w-5 animate-spin text-white/60" /></Centered>
          ) : !customer ? (
            <ActivateProfilePanel email={user.email ?? ""} defaultName={(user.user_metadata as any)?.full_name ?? ""} />
          ) : (
            <PanelTabs initialTab={initialTab} onSignOut={async () => { await signOut(); onOpenChange(false); }} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-center py-16">{children}</div>;
}

function NotLoggedInPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-6 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm text-white/70">
          Connectez-vous pour accéder à vos favoris, vos cartes cadeaux, vos commandes et vos paramètres.
        </p>
      </div>
      <Button asChild className="w-full" onClick={onClose}>
        <Link to="/login?next=/store">Se connecter</Link>
      </Button>
      <Button asChild variant="outline" className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={onClose}>
        <Link to="/signup?next=/store">Créer un compte</Link>
      </Button>
    </div>
  );
}

function ActivateProfilePanel({ email, defaultName }: { email: string; defaultName?: string }) {
  const [fullName, setFullName] = useState(defaultName ?? "");
  const [optIn, setOptIn] = useState(false);
  const create = useCreateCustomerProfile();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { claimedCount } = await create.mutateAsync({
        email,
        fullName: fullName.trim() || undefined,
        marketingOptIn: optIn,
      });
      if (claimedCount > 0) {
        toast.success(`${claimedCount} commande${claimedCount > 1 ? "s" : ""} rattachée${claimedCount > 1 ? "s" : ""} 🎉`);
      } else {
        toast.success("Compte activé !");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    }
  };

  return (
    <form onSubmit={submit} className="p-6 space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm text-white/70">Activez votre espace pour suivre vos commandes et cumuler des cartes cadeaux.</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-white/70">Email</Label>
        <Input value={email} disabled className="bg-white/5 border-white/10 text-white/60" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="cp-name" className="text-white/70">Votre nom (optionnel)</Label>
        <Input id="cp-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jean Dupont" className="bg-white/5 border-white/10 text-white placeholder:text-white/40" />
      </div>
      <label className="flex items-start gap-2 cursor-pointer text-sm text-white/70">
        <Checkbox checked={optIn} onCheckedChange={(v) => setOptIn(v === true)} className="mt-0.5 border-white/30" />
        <span>Je souhaite recevoir les bons plans des boutiques BIB.</span>
      </label>
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activer mon compte"}
      </Button>
    </form>
  );
}

function PanelTabs({ initialTab, onSignOut }: { initialTab: CustomerPanelTab; onSignOut: () => void }) {
  return (
    <Tabs defaultValue={initialTab} className="flex flex-col h-full">
      <TabsList className="m-3 grid w-[calc(100%-1.5rem)] grid-cols-4 bg-white/5 border border-white/10">
        <TabsTrigger value="favorites" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">
          <Heart className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="giftcards" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">
          <Gift className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="orders" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">
          <Package className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60">
          <SettingsIcon className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <TabsContent value="favorites" className="mt-2"><FavoritesTab /></TabsContent>
        <TabsContent value="giftcards" className="mt-2"><GiftCardsTab /></TabsContent>
        <TabsContent value="orders" className="mt-2"><OrdersTab /></TabsContent>
        <TabsContent value="settings" className="mt-2"><SettingsTab onSignOut={onSignOut} /></TabsContent>
      </div>
    </Tabs>
  );
}

function EmptyDark({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
      <Icon className="mx-auto mb-3 h-8 w-8 text-white/30" />
      <p className="text-sm text-white/55">{text}</p>
    </div>
  );
}

function FavoritesTab() {
  const { favorites } = useFavorites();
  const { data: boutiques = [] } = useMarketplaceBoutiques();

  // Match favorites against product previews across boutiques
  const favoriteItems = boutiques.flatMap((b) =>
    b.product_previews
      .filter((p) => favorites.includes(p.id))
      .map((p) => ({ ...p, boutiqueName: b.name, boutiqueSlug: b.slug, boutiqueLogo: b.logo_url })),
  );

  if (favorites.length === 0 || favoriteItems.length === 0)
    return <EmptyDark icon={Heart} text="Aucun favori. Touchez le ❤️ d'un produit pour le retrouver ici." />;

  return (
    <div className="space-y-2">
      {favoriteItems.map((p) => (
        <Link
          key={p.id}
          to={`/boutique/${p.boutiqueSlug}/product/${p.id}`}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 hover:bg-white/[0.06] transition"
        >
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-white/5 flex items-center justify-center">
            {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-white/30" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{p.name}</p>
            <p className="text-xs text-white/55 truncate">{p.boutiqueName}</p>
          </div>
          <span className="text-sm font-semibold text-primary">{p.price.toFixed(2)} €</span>
        </Link>
      ))}
    </div>
  );
}

function GiftCardsTab() {
  const { data: cards = [], isLoading } = useCustomerGiftCards();
  if (isLoading) return <Centered><Loader2 className="h-5 w-5 animate-spin text-white/60" /></Centered>;
  if (cards.length === 0)
    return <EmptyDark icon={Gift} text="Recyclez vos cartons pour gagner des cartes cadeaux ! 1 point = 0,10 €" />;

  return (
    <div className="space-y-3">
      {cards.map((c: any) => (
        <div key={c.id} className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 to-white/[0.02]">
          <div className="p-4 flex items-center gap-3">
            {c.boutiques?.logo_url ? (
              <img src={c.boutiques.logo_url} alt="" className="h-10 w-10 rounded-full object-cover border border-white/20" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-sm">{c.boutiques?.name?.[0] ?? "?"}</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/55">Carte cadeau</p>
              <p className="text-sm font-semibold truncate">{c.boutiques?.name}</p>
            </div>
            <span className="font-display text-xl font-bold text-primary">{formatEUR(c.balance_cents)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [], isLoading } = useCustomerOrders();
  if (isLoading) return <Centered><Loader2 className="h-5 w-5 animate-spin text-white/60" /></Centered>;
  if (orders.length === 0) return <EmptyDark icon={Package} text="Aucune commande pour le moment." />;

  return (
    <div className="space-y-2">
      {orders.map((o: any) => (
        <div key={o.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center gap-3">
          {o.boutiques?.logo_url ? (
            <img src={o.boutiques.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-sm font-semibold">{o.boutiques?.name?.[0] ?? "?"}</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium truncate">{o.boutiques?.name ?? "Boutique"}</p>
              <Badge variant="outline" className="text-[10px] border-white/20 text-white/70">{STATUS_LABELS[o.logistics_status] ?? o.logistics_status}</Badge>
            </div>
            <p className="text-xs text-white/55 truncate">{o.order_number} · {formatDate(o.created_at)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{Number(o.amount).toFixed(2)} €</p>
            {o.boutiques?.slug && <Link to={`/boutique/${o.boutiques.slug}/order-tracking`} className="text-[11px] text-primary hover:underline">Suivre →</Link>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab({ onSignOut }: { onSignOut: () => void }) {
  const { data: customer } = useCustomerProfile();
  const { data: orders = [] } = useCustomerOrders();
  const { data: scans = [] } = useRecyclingHistory();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs text-white/55 mb-1">Email</p>
        <p className="text-sm font-medium truncate">{customer?.email}</p>
        <p className="text-xs text-white/55 mt-3 mb-1">Nom</p>
        <p className="text-sm font-medium truncate">{customer?.full_name || "—"}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Commandes" value={orders.length} />
        <Stat label="Scans" value={scans.length} />
        <Stat label="Points" value={customer?.total_recycling_points ?? 0} accent />
      </div>

      <Button
        variant="outline"
        className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10"
        onClick={() => navigate("/mon-compte")}
      >
        Vue détaillée du compte
      </Button>

      <Button variant="ghost" className="w-full text-white/70 hover:text-white hover:bg-white/10" onClick={onSignOut}>
        <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
      </Button>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-white/55">{label}</p>
      <p className={`mt-1 font-display text-lg font-bold ${accent ? "text-primary" : "text-white"}`}>{value}</p>
    </div>
  );
}