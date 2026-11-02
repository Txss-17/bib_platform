import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Check, ExternalLink, Image as ImageIcon, Megaphone, Save, ShieldAlert, Sparkles, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Channel = "meta" | "google";
type Objective = "traffic" | "sales" | "awareness";
type AdDraft = {
  id: string;
  boutique_id: string;
  user_id: string;
  product_id: string | null;
  platform: Channel;
  objective: Objective;
  name: string;
  headline: string;
  message: string;
  destination_url: string;
  daily_budget_eur: number;
  status: "draft";
  created_at: string;
};
type BoutiqueSummary = { id: string; name: string; slug: string; logo_url?: string | null; status?: string };

const PROVIDERS: Record<Channel, { name: string; url: string }> = {
  meta: { name: "Meta Ads Manager", url: "https://adsmanager.facebook.com/" },
  google: { name: "Google Ads", url: "https://ads.google.com/" },
};

function isHttpsUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !url.username && !url.password && raw.length <= 1000;
  } catch { return false; }
}

export function MerchantAdsWorkspace({ boutique }: { boutique?: BoutiqueSummary }) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const tx = (fr: string, english: string) => en ? english : fr;
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: allProducts = [] } = useProducts();
  const products = useMemo(
    () => allProducts.filter(product => product.boutique_id === boutique?.id && product.status === "active"),
    [allProducts, boutique?.id],
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Channel>("meta");
  const [objective, setObjective] = useState<Objective>("traffic");
  const [productId, setProductId] = useState("none");
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [dailyBudget, setDailyBudget] = useState("5");

  useEffect(() => {
    setEditingId(null);
    setName("");
    setHeadline("");
    setMessage("");
    setProductId("none");
    setDestinationUrl(boutique?.slug ? `${window.location.origin}/boutique/${encodeURIComponent(boutique.slug)}` : "");
  }, [boutique?.id, boutique?.slug]);

  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ["merchant-ad-drafts", user?.id, boutique?.id],
    enabled: !!user?.id && !!boutique?.id,
    queryFn: async (): Promise<AdDraft[]> => {
      const { data, error } = await supabase.from("merchant_ad_drafts" as any)
        .select("*").eq("boutique_id", boutique!.id)
        .eq("user_id", user!.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return (data ?? []) as unknown as AdDraft[];
    },
  });

  const selectedProduct = products.find(product => product.id === productId);
  const productName = selectedProduct?.supplier_products?.name ?? "";
  const productImage = selectedProduct?.supplier_products?.image_url ?? boutique?.logo_url ?? null;

  const proposeCopy = () => {
    if (!boutique) return;
    const storeName = boutique.name.trim().slice(0, 55);
    const featured = productName.trim().slice(0, 65);
    setName(tx("Découverte", "Discovery") + " — " + storeName);
    setHeadline(featured || tx(`Découvrez ${storeName}`, `Discover ${storeName}`));
    setMessage(featured
      ? tx(`Découvrez ${featured} chez ${storeName}. Consultez sa fiche et les conditions disponibles dans notre boutique.`,
        `Discover ${featured} at ${storeName}. See product details and terms in our store.`)
      : tx(`Découvrez la sélection de ${storeName} et explorez notre boutique.`,
        `Explore ${storeName}'s product selection and visit our store.`));
  };

  const save = useMutation({
    mutationFn: async () => {
      if (!user || !boutique) throw new Error(tx("Identifiez-vous et sélectionnez une boutique.", "Sign in and select a store."));
      const budget = Number(dailyBudget);
      if (!name.trim() || !headline.trim() || !message.trim() ||
          name.trim().length > 120 || headline.trim().length > 120 || message.trim().length > 1000 ||
          !Number.isFinite(budget) || budget < 1 || budget > 10000 || !isHttpsUrl(destinationUrl)) {
        throw new Error(tx("Vérifiez le texte, l'URL HTTPS et le budget indicatif (1 à 10 000 €).", "Check your copy, HTTPS URL and indicative daily budget (€1–€10,000)."));
      }
      if (productId !== "none" && !selectedProduct) throw new Error(tx("Ce produit n'est pas disponible dans la boutique.", "This product is not available for this store."));
      const payload = {
        user_id: user.id, boutique_id: boutique.id,
        product_id: productId === "none" ? null : productId,
        platform, objective, name: name.trim(), headline: headline.trim(),
        message: message.trim(), destination_url: destinationUrl.trim(),
        daily_budget_eur: budget, status: "draft" as const,
      };
      const query = editingId
        ? supabase.from("merchant_ad_drafts" as any).update(payload as any)
            .eq("id", editingId).eq("user_id", user.id).eq("boutique_id", boutique.id)
        : supabase.from("merchant_ad_drafts" as any).insert(payload as any);
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["merchant-ad-drafts", user?.id, boutique?.id] });
      toast({ title: tx("Brouillon publicitaire enregistré", "Advertising draft saved"), description: tx("Aucune publicité n'a été diffusée et aucun montant n'a été débité.", "No ad was published and no advertising charges were made.") });
      setEditingId(null);
    },
    onError: (error: Error) => toast({ title: tx("Enregistrement impossible", "Could not save draft"), description: error.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!boutique || !user) throw new Error("not_authenticated");
      const { error } = await supabase.from("merchant_ad_drafts" as any).delete()
        .eq("id", id).eq("boutique_id", boutique.id).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["merchant-ad-drafts", user?.id, boutique?.id] }),
  });

  const edit = (draft: AdDraft) => {
    setEditingId(draft.id);
    setPlatform(draft.platform);
    setObjective(draft.objective);
    setProductId(draft.product_id ?? "none");
    setName(draft.name);
    setHeadline(draft.headline);
    setMessage(draft.message);
    setDestinationUrl(draft.destination_url);
    setDailyBudget(String(draft.daily_budget_eur));
  };

  if (!boutique) return <Card><CardContent className="p-6 text-sm text-muted-foreground">{tx("Créez une boutique pour préparer votre première publicité.", "Create a store to prepare your first ad.")}</CardContent></Card>;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div className="min-w-0 space-y-5">
        <Card className="overflow-hidden rounded-2xl border-border/70">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /><CardTitle className="text-lg">{tx("Créer une publicité", "Create an ad")}</CardTitle></div>
            <p className="text-sm text-muted-foreground">{tx("Une proposition adaptée à votre boutique et à vos produits, que vous contrôlez entièrement avant toute diffusion.", "Create an ad using your store and products, and review it before publishing elsewhere.")}</p>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>{tx("Réseau publicitaire", "Ad network")}</Label>
                <Select value={platform} onValueChange={value => setPlatform(value as Channel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="meta">Meta (Facebook / Instagram)</SelectItem>
                    <SelectItem value="google">Google Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>{tx("Objectif", "Objective")}</Label>
                <Select value={objective} onValueChange={value => setObjective(value as Objective)}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                    <SelectItem value="traffic">{tx("Visites de la boutique", "Store traffic")}</SelectItem>
                    <SelectItem value="sales">{tx("Ventes", "Sales")}</SelectItem>
                    <SelectItem value="awareness">{tx("Notoriété", "Awareness")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>{tx("Produit à mettre en avant", "Featured product")}</Label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder={tx("Choisir un produit", "Choose a product")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{tx("La boutique entière", "The whole store")}</SelectItem>
                  {products.map(product => <SelectItem key={product.id} value={product.id}>{product.supplier_products?.name ?? product.id}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{tx("Seuls les produits actifs de cette boutique sont proposés.", "Only active products of this store can be featured.")}</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2" type="button" onClick={proposeCopy}><Sparkles className="h-4 w-4" />{tx("Proposer un texte depuis la boutique", "Suggest copy from store details")}</Button>
            <div className="space-y-1.5"><Label htmlFor="ad-name">{tx("Nom de la campagne", "Campaign name")}</Label><Input id="ad-name" maxLength={120} value={name} onChange={e => setName(e.target.value)} placeholder={tx("Lancement de collection", "Collection launch")} /></div>
            <div className="space-y-1.5"><Label htmlFor="ad-headline">{tx("Accroche", "Headline")}</Label><Input id="ad-headline" maxLength={120} value={headline} onChange={e => setHeadline(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="ad-message">{tx("Texte publicitaire", "Ad copy")}</Label><Textarea id="ad-message" maxLength={1000} rows={4} value={message} onChange={e => setMessage(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="ad-destination">{tx("Lien de destination HTTPS", "HTTPS destination")}</Label><Input id="ad-destination" type="url" value={destinationUrl} onChange={e => setDestinationUrl(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="ad-budget">{tx("Budget quotidien indicatif (€)", "Indicative daily budget (€)")}</Label><Input id="ad-budget" type="number" min={1} max={10000} step="0.5" value={dailyBudget} onChange={e => setDailyBudget(e.target.value)} /><p className="text-xs text-muted-foreground">{tx("Aucun prélèvement : ce montant sert seulement à préparer le brouillon.", "No charge: this is only a planning amount.")}</p></div>
            <Button className="w-full gap-2" disabled={save.isPending} onClick={() => save.mutate()}><Save className="h-4 w-4" />{editingId ? tx("Mettre à jour le brouillon", "Update draft") : tx("Enregistrer le brouillon", "Save draft")}</Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle className="text-base">{tx("Mes brouillons publicitaires", "My advertising drafts")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading && <p className="text-sm text-muted-foreground">{tx("Chargement…", "Loading…")}</p>}
            {!isLoading && drafts.length === 0 && <p className="text-sm text-muted-foreground">{tx("Aucun brouillon pour cette boutique.", "No drafts for this store.")}</p>}
            {drafts.map(draft => <div key={draft.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 p-3">
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{draft.name}</p><p className="text-xs text-muted-foreground">{PROVIDERS[draft.platform].name} · {tx("Brouillon", "Draft")}</p></div>
              <Button variant="outline" size="sm" onClick={() => edit(draft)}>{tx("Modifier", "Edit")}</Button>
              <Button variant="ghost" size="icon" aria-label={tx("Supprimer le brouillon", "Delete draft")} onClick={() => remove.mutate(draft.id)} disabled={remove.isPending}><Trash2 className="h-4 w-4" /></Button>
            </div>)}
          </CardContent>
        </Card>
      </div>
      <div className="min-w-0 space-y-5">
        <Card className="overflow-hidden rounded-2xl border-border/70">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ImageIcon className="h-4 w-4" />{tx("Aperçu de la publicité", "Ad preview")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-border/70">
              <div className="flex items-center gap-2 p-3">
                {boutique.logo_url ? <img src={boutique.logo_url} alt="" className="h-9 w-9 rounded-full object-contain" /> : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"><Megaphone className="h-4 w-4" /></span>}
                <div><p className="text-sm font-semibold">{boutique.name}</p><p className="text-[11px] text-muted-foreground">{tx("Maquette · non diffusée", "Mockup · not published")}</p></div>
              </div>
              <p className="whitespace-pre-wrap break-words px-3 pb-3 text-sm">{message || tx("Votre texte publicitaire apparaîtra ici.", "Your ad copy will appear here.")}</p>
              {productImage ? <img src={productImage} alt={productName || boutique.name} className="aspect-[5/4] w-full bg-muted/30 object-contain" /> : <div className="flex aspect-[5/4] items-center justify-center bg-muted/30"><ImageIcon className="h-10 w-10 text-muted-foreground" /></div>}
              <div className="flex items-center justify-between gap-2 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{headline || boutique.name}</p><p className="truncate text-xs text-muted-foreground">{destinationUrl || tx("Lien de la boutique", "Store link")}</p></div><span className="shrink-0 rounded-md bg-muted px-2 py-1.5 text-xs font-medium">{tx("Découvrir", "Explore")}</span></div>
            </div>
            <p className="text-xs text-muted-foreground">{tx("Aperçu indicatif : chaque réseau adapte le format, les placements et les règles de diffusion.", "Indicative preview: each network controls ad format, placements and review.")}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/70">
          <CardHeader><CardTitle className="text-base">{tx("Comptes publicitaires et résultats", "Ad accounts and results")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="outline" className="gap-1"><ShieldAlert className="h-3.5 w-3.5" />{tx("Intégration non connectée", "Integration not connected")}</Badge>
            <p className="text-sm leading-6 text-muted-foreground">{tx("La connexion sécurisée Meta / Google (OAuth), la publication et la synchronisation des statistiques nécessitent une intégration officielle. BIB ne dispose pas encore de cette connexion : aucun résultat ni dépense ne sont simulés.", "Secure Meta / Google OAuth, publishing and reporting require official integrations. These are not connected yet; BIB does not simulate spend or campaign results.")}</p>
            {(["meta","google"] as const).map(channel => <Button asChild key={channel} variant="outline" className="w-full justify-between gap-2"><a href={PROVIDERS[channel].url} target="_blank" rel="noopener noreferrer">{tx("Ouvrir", "Open")} {PROVIDERS[channel].name}<ExternalLink className="h-4 w-4" /></a></Button>)}
            <p className="flex items-start gap-2 text-xs text-muted-foreground"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />{tx("Votre compte publicitaire reste sous votre contrôle. Aucune publicité n'est publiée depuis BIB à ce stade.", "You retain control of your ad account. BIB cannot publish ads yet.")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
