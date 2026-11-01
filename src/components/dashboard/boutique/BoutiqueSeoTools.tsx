import { useState } from "react";
import { Search, ExternalLink, Copy, Check, Globe, Store, Package } from "lucide-react";
import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";
import { resolvePublicOrigin, useSeoSettings } from "@/lib/seoSettings";
import { SectionCard, EmptyStateInline } from "@/components/dashboard/shared";
import { SeoFixChecklist } from "@/components/dashboard/seo/SeoFixChecklist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

/** SEO tools scoped to the selected merchant boutique. */
export function BoutiqueSeoTools({ boutiqueId }: { boutiqueId: string }) {
  useLanguage();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [inspectTarget, setInspectTarget] = useState<string>("");
  const { data: allBoutiques = [] } = useBoutiques();
  const boutiques = allBoutiques.filter((boutique) => boutique.id === boutiqueId);
  const { data: allProducts = [] } = useProducts();
  const products = allProducts.filter((product) => product.boutique_id === boutiqueId);
  const { settings: seoSettings } = useSeoSettings();

  const sitemapUrl = `https://lfsiwtpctqxpzyskakey.supabase.co/functions/v1/sitemap-xml`;

  const publicOrigin = resolvePublicOrigin();

  /**
   * Build canonical URL for a page using the configured x-default locale.
   * The canonical mirrors what useSEO emits in the page <head>.
   */
  const buildCanonical = (pathname: string) => {
    const base = `${publicOrigin}${pathname}`;
    // x-default = defaultLocale → append ?lang= only if defaultLocale isn't 'fr'
    // (the app uses 'fr' implicitly when no lang param is present)
    if (seoSettings.defaultLocale && seoSettings.defaultLocale !== "fr") {
      return `${base}?lang=${seoSettings.defaultLocale}`;
    }
    return base;
  };

  // Build the list of inspectable URLs (published boutiques + their active products)
  const inspectOptions = (() => {
    const opts: {
      value: string;
      label: string;
      group: "Boutiques" | "Produits";
      kind: "boutique" | "product";
    }[] = [];
    for (const b of boutiques.filter((x) => x.status === "published")) {
      opts.push({
        value: buildCanonical(`/boutique/${b.slug}`),
        label: translateUi("Accueil — {v0}", { v0: b.name }),
        group: "Boutiques",
        kind: "boutique",
      });
    }
    for (const p of products.filter((p) => p.status === "active")) {
      const b = boutiques.find((x) => x.id === p.boutique_id);
      if (!b || b.status !== "published") continue;
      opts.push({
        value: buildCanonical(`/boutique/${b.slug}/product/${p.id}`),
        label: `${p.supplier_products?.name || "Produit"} — ${b.name}`,
        group: "Produits",
        kind: "product",
      });
    }
    return opts;
  })();

  const selectedOption = inspectOptions.find((o) => o.value === inspectTarget);

  const handleInspectUrl = () => {
    if (!inspectTarget) {
      toast.error(
        translateUi("Sélectionnez d'abord une boutique ou un produit"),
      );
      return;
    }
    const inspectionUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(
      publicOrigin + "/",
    )}&id=${encodeURIComponent(inspectTarget)}`;
    window.open(inspectionUrl, "_blank", "noopener,noreferrer");
    toast.success(
      translateUi("Inspection ouverte ({v0})", {
        v0: selectedOption?.kind === "product" ? "produit" : "boutique",
      }),
      {
        description: translateUi(
          "URL canonique transmise à Search Console. Vous pourrez ensuite demander son indexation dans Google.",
        ),
      },
    );
  };

  const copyToClipboard = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      toast.success(translateUi("Copié dans le presse-papiers"));
      setTimeout(() => setCopiedKey(null), 1500);
    });
  };

  const gscSteps: {
    title: string;
    description: string;
    action?: { label: string; value: string; key: string };
  }[] = [
    {
      title: translateUi("1. Créez un compte Google Search Console"),
      description: translateUi(
        "Rendez-vous sur search.google.com/search-console et connectez-vous avec votre compte Google professionnel.",
      ),
    },
    {
      title: translateUi("2. Ajoutez votre propriété"),
      description:
        "Choisissez « Préfixe d'URL » puis collez l'adresse publique de votre site (ex : https://votre-domaine.com). Pour une boutique Brand-In-A-Box, utilisez l'URL exacte de votre boutique publiée.",
    },
    {
      title: translateUi("3. Vérifiez la propriété"),
      description: translateUi(
        'Choisissez la méthode « Balise HTML » : Google vous donne une balise <meta name="google-site-verification" content="…" />. Suivez la procédure de validation de la propriété Google associée au domaine réellement utilisé.',
      ),
    },
    {
      title: translateUi("4. Soumettez votre sitemap"),
      description: translateUi(
        "Dans Search Console > Sitemaps, ajoutez l'URL ci-dessous. Brand-In-A-Box met automatiquement à jour ce fichier dès qu'une boutique ou un produit change.",
      ),
      action: {
        label: translateUi("URL du sitemap"),
        value: sitemapUrl,
        key: "sitemap",
      },
    },
    {
      title: translateUi("5. Vérifiez l'indexation"),
      description: translateUi(
        "Sous « Inspection de l'URL », collez l'URL d'une boutique ou d'un produit. Si la page est valide, cliquez « Demander une indexation ». Le résultat apparaît sous un délai variable dans Pages > Indexées.",
      ),
    },
    {
      title: translateUi("6. Activez les rapports clés"),
      description: translateUi(
        "Surveillez « Performances » (clics, impressions, CTR, position) et « Pages » (indexées vs exclues) au moins une fois par semaine. Corrigez les alertes via le tableau de bord Analytics.",
      ),
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      {/* Google Search Console step-by-step guide */}
      <SectionCard
        className="min-w-0"
        title={translateUi("Connecter Google Search Console")}
        description={translateUi(
          "Préparez l’indexation de cette boutique et de ses produits dans Google.",
        )}
        icon={<Search className="w-4 h-4 text-secondary" />}
        actions={
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              {translateUi("Ouvrir Search Console") + " "}
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </a>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {gscSteps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/60 bg-muted/20 p-3.5"
            >
              <div className="flex items-start gap-2 mb-1.5">
                <Badge
                  variant="outline"
                  className="text-[10px] shrink-0 mt-0.5 border-secondary/40 text-secondary"
                >
                  {translateUi("Étape") + " "}
                  {idx + 1}
                </Badge>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {step.title.replace(/^\d+\.\s*/, "")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                {step.description}
              </p>
              {step.action && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
                  <code className="text-[11px] text-foreground truncate flex-1">
                    {step.action.value}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() =>
                      copyToClipboard(step.action!.value, step.action!.key)
                    }
                    aria-label={translateUi("Copier")}
                  >
                    {copiedKey === step.action.key ? (
                      <Check className="w-3.5 h-3.5 text-success-ink" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-secondary/30 bg-secondary/5 p-3 text-xs text-foreground/80">
          <strong className="text-secondary">{translateUi("Astuce :")}</strong>{" "}
          {translateUi("Le sitemap inclut déjà les alternates") + " "}
          <code>hreflang</code>{" "}
          {translateUi(
            "FR/EN pour le ciblage international, et est régénéré automatiquement à chaque ajout/édition de boutique ou de produit. Pas besoin de le resoumettre.",
          )}
        </div>
      </SectionCard>

      {/* Quick URL Inspection launcher */}
      <SectionCard
        className="mt-6"
        title={translateUi("Inspection d'URL — accélérer l'indexation")}
        description={translateUi(
          "Ouvre Search Console pré-rempli avec l'URL choisie pour examiner sa présence dans Google.",
        )}
        icon={<Globe className="w-4 h-4 text-secondary" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {translateUi("Page à inspecter")}
            </label>
            <Select value={inspectTarget} onValueChange={setInspectTarget}>
              <SelectTrigger>
                <SelectValue
                  placeholder={translateUi(
                    "Choisir une boutique ou un produit publié…",
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {inspectOptions.length === 0 ? (
                  <EmptyStateInline
                    variant="no-content"
                    title={translateUi("Aucune page publiée pour l'instant.")}
                  />
                ) : (
                  inspectOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="inline-flex items-center gap-1.5">
                        {opt.kind === "boutique" ? (
                          <Store className="w-3 h-3 text-secondary" />
                        ) : (
                          <Package className="w-3 h-3 text-secondary" />
                        )}
                        <span className="text-[10px] font-semibold text-secondary">
                          {opt.group}
                        </span>
                        <span>{opt.label}</span>
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {inspectTarget && selectedOption && (
              <div className="space-y-0.5">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                  <Badge
                    variant="outline"
                    className="text-[9px] py-0 h-4 border-secondary/40 text-secondary gap-1"
                  >
                    {selectedOption.kind === "boutique" ? (
                      <Store className="w-2.5 h-2.5" />
                    ) : (
                      <Package className="w-2.5 h-2.5" />
                    )}
                    {selectedOption.kind === "boutique"
                      ? "Boutique"
                      : translateUi("Produit")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[9px] py-0 h-4 border-border text-muted-foreground"
                  >
                    {translateUi("canonique · x-default →") + " "}
                    {seoSettings.defaultLocale}
                  </Badge>
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  <code className="text-foreground">{inspectTarget}</code>
                </p>
              </div>
            )}
          </div>
          <Button
            onClick={handleInspectUrl}
            disabled={!inspectTarget}
            className="gap-2 whitespace-nowrap"
          >
            <Search className="w-4 h-4" />
            {selectedOption?.kind === "product"
              ? translateUi("Inspecter ce produit")
              : selectedOption?.kind === "boutique"
                ? translateUi("Inspecter cette boutique")
                : translateUi("Lancer l'inspection")}
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
          <strong className="text-foreground">
            {translateUi("Comment ça marche :")}
          </strong>{" "}
          {translateUi("Brand-In-A-Box transmet l'URL") + " "}
          <strong>canonique</strong> {translateUi("(locale x-default «") + " "}
          {seoSettings.defaultLocale}{" "}
          {translateUi(
            "») à Search Console pour éviter les doublons d'indexation entre versions linguistiques. Cliquez ensuite sur « Demander une indexation » dans Google (effet sous un délai variable).",
          )}
        </div>
      </SectionCard>

      {/* SEO fix-it checklist */}
      <SeoFixChecklist boutiques={boutiques} products={products} />
    </div>
  );
}
