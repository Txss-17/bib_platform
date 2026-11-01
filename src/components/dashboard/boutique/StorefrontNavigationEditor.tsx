import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, LayoutTemplate, Menu, Save, Store } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ThemeSettings, StorefrontNavigationSettings } from "@/lib/boutiqueTemplates";
import type { BoutiquePage } from "@/hooks/useBoutiquePages";

interface Props {
  boutiqueId: string;
  boutiqueName: string;
  pages: BoutiquePage[];
}

const DEFAULTS: StorefrontNavigationSettings = {
  layout: "classic",
  logoPosition: "left",
  menuAlignment: "center",
  showStoreName: true,
  showHomeLink: true,
  showTracking: true,
  pageOrder: [],
};

export function StorefrontNavigationEditor({ boutiqueId, boutiqueName, pages }: Props) {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => english ? en : fr;
  const queryClient = useQueryClient();
  const { data: boutique, isLoading } = useQuery({
    queryKey: ["boutique-navigation-settings", boutiqueId],
    queryFn: async () => {
      const { data, error } = await supabase.from("boutiques")
        .select("id, name, logo_url, theme_settings").eq("id", boutiqueId).single();
      if (error) throw error;
      return data;
    },
  });
  const theme = (boutique?.theme_settings && typeof boutique.theme_settings === "object" && !Array.isArray(boutique.theme_settings)
    ? boutique.theme_settings : {}) as unknown as Partial<ThemeSettings>;
  const [draft, setDraft] = useState<StorefrontNavigationSettings>(DEFAULTS);
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (boutique) {
      setDraft({ ...DEFAULTS, ...(theme.navigation ?? {}) });
      setDirty(false);
    }
  }, [boutique?.id, boutique?.theme_settings]);

  const change = (patch: Partial<StorefrontNavigationSettings>) => {
    setDraft(previous => ({ ...previous, ...patch }));
    setDirty(true);
  };
  const visible = pages.filter(page => page.is_visible && page.show_in_nav && page.slug !== "__product__");
  const order = draft.pageOrder ?? [];
  const ordered = [...visible].sort((a, b) => {
    const ia = order.indexOf(a.id);
    const ib = order.indexOf(b.id);
    return (ia < 0 ? order.length + a.position : ia) - (ib < 0 ? order.length + b.position : ib);
  });

  const movePage = (id: string, shift: -1 | 1) => {
    const ids = ordered.map(page => page.id);
    const from = ids.indexOf(id);
    const to = from + shift;
    if (to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    change({ pageOrder: ids });
  };

  const save = useMutation({
    mutationFn: async () => {
      // Read latest settings before patching; unrelated theme fields must survive.
      const { data: latest, error: readError } = await supabase.from("boutiques")
        .select("theme_settings").eq("id", boutiqueId).single();
      if (readError) throw readError;
      const settings = (latest.theme_settings && typeof latest.theme_settings === "object" && !Array.isArray(latest.theme_settings)
        ? latest.theme_settings : {}) as Record<string, unknown>;
      const { data, error } = await supabase.from("boutiques")
        .update({ theme_settings: { ...settings, navigation: draft } as any })
        .eq("id", boutiqueId).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      setDirty(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["boutique-navigation-settings", boutiqueId] }),
        queryClient.invalidateQueries({ queryKey: ["public-boutique"] }),
        queryClient.invalidateQueries({ queryKey: ["boutique-edit", boutiqueId] }),
      ]);
      toast.success(tx("Navigation de la boutique enregistrée", "Store navigation saved"));
    },
    onError: () => toast.error(tx("Enregistrement impossible", "Unable to save navigation")),
  });

  if (isLoading) return <p role="status" className="text-sm text-muted-foreground">{tx("Chargement de l'en-tête…", "Loading header…")}</p>;
  return (
    <div className="space-y-5">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold"><LayoutTemplate className="h-4 w-4" />{tx("Structure de l'en-tête", "Header structure")}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{tx("Personnalisez la navigation publique sans modifier le contenu des pages.", "Customize public navigation without changing page content.")}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{tx("Présentation du menu", "Header layout")}</Label>
          <Select value={draft.layout ?? "classic"} onValueChange={value => change({ layout: value as StorefrontNavigationSettings["layout"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="classic">{tx("Classique — une ligne", "Classic — single row")}</SelectItem>
              <SelectItem value="centered">{tx("Logo centré", "Centered logo")}</SelectItem>
              <SelectItem value="stacked">{tx("Menu sous le logo", "Menu below logo")}</SelectItem>
              <SelectItem value="minimal">{tx("Minimaliste", "Minimal")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{tx("Position du logo", "Logo position")}</Label>
          <Select value={draft.logoPosition ?? "left"} onValueChange={value => change({ logoPosition: value as StorefrontNavigationSettings["logoPosition"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">{tx("Gauche", "Left")}</SelectItem>
              <SelectItem value="center">{tx("Centre", "Center")}</SelectItem>
              <SelectItem value="right">{tx("Droite", "Right")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{tx("Alignement des liens", "Menu alignment")}</Label>
          <Select value={draft.menuAlignment ?? "center"} onValueChange={value => change({ menuAlignment: value as StorefrontNavigationSettings["menuAlignment"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">{tx("Gauche", "Left")}</SelectItem>
              <SelectItem value="center">{tx("Centre", "Center")}</SelectItem>
              <SelectItem value="right">{tx("Droite", "Right")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-3 rounded-xl border border-border/70 p-3">
        {([
          ["showStoreName", tx("Afficher le nom de boutique", "Show store name")],
          ["showHomeLink", tx("Afficher Accueil", "Show Home link")],
          ["showTracking", tx("Afficher Suivi de commande", "Show order tracking")],
        ] as const).map(([key, label]) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <Label className="text-xs">{label}</Label>
            <Switch checked={draft[key] !== false} onCheckedChange={value => change({ [key]: value })} />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-semibold"><Menu className="h-4 w-4" />{tx("Ordre des pages dans le menu", "Navigation page order")}</p>
        {ordered.length === 0 ? <p className="text-xs text-muted-foreground">{tx("Créez et affichez des pages dans le menu pour les réorganiser ici.", "Create visible menu pages to reorder them here.")}</p> :
          ordered.map((page, index) => (
            <div key={page.id} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-border/60 p-2">
              <span className="min-w-0 truncate text-xs font-medium">{page.title}</span>
              <div className="flex gap-1">
                <Button type="button" size="icon" variant="outline" className="h-7 w-7" disabled={index === 0} aria-label={tx(`Monter ${page.title}`, `Move ${page.title} up`)} onClick={() => movePage(page.id, -1)}><ArrowUp className="h-3.5 w-3.5" /></Button>
                <Button type="button" size="icon" variant="outline" className="h-7 w-7" disabled={index === ordered.length - 1} aria-label={tx(`Descendre ${page.title}`, `Move ${page.title} down`)} onClick={() => movePage(page.id, 1)}><ArrowDown className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}
      </div>
      <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
        <p className="mb-2 text-xs font-medium">{tx("Aperçu de l'en-tête", "Header preview")}</p>
        <div className={`flex min-h-20 min-w-0 flex-col gap-3 rounded-lg bg-background p-3 ${draft.layout === "stacked" ? "items-center" : ""}`}>
          <div className={`flex w-full min-w-0 flex-wrap items-center gap-3 ${draft.layout === "stacked" ? "justify-center" : "justify-between"}`}>
            <div className={`flex min-w-0 items-center gap-2 ${draft.logoPosition === "center" || draft.layout === "centered" ? "mx-auto" : draft.logoPosition === "right" ? "ml-auto order-last" : ""}`}>
              {boutique?.logo_url ? <img src={boutique.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-md object-contain" /> : <Store className="h-7 w-7 shrink-0 text-muted-foreground" />}
              {(draft.showStoreName !== false || !boutique?.logo_url) && <span className="truncate text-sm font-semibold">{boutiqueName}</span>}
            </div>
            {draft.layout !== "stacked" && draft.layout !== "minimal" && draft.logoPosition !== "center" && draft.layout !== "centered" && (
              <div className={`flex flex-1 flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground ${draft.menuAlignment === "left" ? "justify-start" : draft.menuAlignment === "right" ? "justify-end" : "justify-center"}`}>
                {draft.showHomeLink !== false && <span>{tx("Accueil", "Home")}</span>}
                {ordered.slice(0, 4).map(page => <span key={page.id}>{page.title}</span>)}
              </div>
            )}
            <span className="shrink-0 text-xs text-muted-foreground">{draft.layout === "minimal" ? "☰" : "▣"}</span>
          </div>
          {(draft.layout === "stacked" || draft.logoPosition === "center" || draft.layout === "centered") && (
            <div className={`flex w-full flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground ${draft.menuAlignment === "left" ? "justify-start" : draft.menuAlignment === "right" ? "justify-end" : "justify-center"}`}>
              {draft.showHomeLink !== false && <span>{tx("Accueil", "Home")}</span>}
              {ordered.slice(0, 5).map(page => <span key={page.id}>{page.title}</span>)}
              {draft.showTracking !== false && <span>{tx("Suivi", "Tracking")}</span>}
            </div>
          )}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{tx("Aperçu simplifié. Le menu mobile reste accessible via le bouton de navigation.", "Simplified preview. Mobile navigation remains accessible through its menu button.")}</p>
      </div>
      <Button type="button" size="sm" className="w-full gap-2" disabled={!dirty || save.isPending} onClick={() => save.mutate()}>
        <Save className="h-4 w-4" />{save.isPending ? tx("Enregistrement…", "Saving…") : tx("Enregistrer l'en-tête et le menu", "Save header and menu")}
      </Button>
    </div>
  );
}
