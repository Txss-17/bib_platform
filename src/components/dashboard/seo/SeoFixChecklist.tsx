import { useMemo, useState } from "react";
import {
  ListChecks,
  AlertTriangle,
  Image as ImageIcon,
  FileText,
  Copy as CopyIcon,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/dashboard/shared";
import type { Tables } from "@/integrations/supabase/types";
import type { ProductWithSupplier } from "@/hooks/useProducts";

type Boutique = Tables<"boutiques">;

type Severity = "high" | "medium" | "low";
type Category = "duplicate-title" | "missing-meta" | "missing-og" | "short-title";

interface SeoIssue {
  id: string;
  category: Category;
  severity: Severity;
  label: string;
  detail: string;
  fixHref: string;
  fixLabel: string;
}

const CATEGORY_META: Record<
  Category,
  { title: string; icon: typeof FileText; tone: "warn" | "error" }
> = {
  "duplicate-title": {
    title: "Titres dupliqués",
    icon: CopyIcon,
    tone: "error",
  },
  "missing-meta": {
    title: "Meta description manquante",
    icon: FileText,
    tone: "warn",
  },
  "missing-og": {
    title: "Image Open Graph absente",
    icon: ImageIcon,
    tone: "error",
  },
  "short-title": {
    title: "Titre trop court",
    icon: AlertTriangle,
    tone: "warn",
  },
};

const SEVERITY_BADGE: Record<Severity, string> = {
  high: "border-red-500/40 text-red-600 bg-red-500/10",
  medium: "border-amber-500/40 text-amber-600 bg-amber-500/10",
  low: "border-emerald-500/40 text-emerald-600 bg-emerald-500/10",
};

interface Props {
  boutiques: Boutique[];
  products: ProductWithSupplier[];
}

/**
 * Detect concrete SEO issues across the seller's published catalog
 * and group them by category with a direct "fix" link to the right page.
 */
function detectIssues(
  boutiques: Boutique[],
  products: ProductWithSupplier[],
): SeoIssue[] {
  const issues: SeoIssue[] = [];

  // ----- Boutique-level checks -----
  const titleCount = new Map<string, Boutique[]>();
  for (const b of boutiques) {
    const key = (b.name || "").trim().toLowerCase();
    if (!key) continue;
    titleCount.set(key, [...(titleCount.get(key) || []), b]);
  }

  for (const b of boutiques) {
    if (b.status !== "published") continue;

    const dupGroup = titleCount.get((b.name || "").trim().toLowerCase()) || [];
    if (dupGroup.length >= 2) {
      issues.push({
        id: `dup-${b.id}`,
        category: "duplicate-title",
        severity: "high",
        label: b.name,
        detail: `Partagé avec ${dupGroup.length - 1} autre(s) boutique(s) — Google ne saura pas laquelle indexer.`,
        fixHref: `/dashboard/boutique/${b.id}`,
        fixLabel: "Renommer la boutique",
      });
    }

    if (!b.description || b.description.trim().length < 50) {
      issues.push({
        id: `meta-${b.id}`,
        category: "missing-meta",
        severity: "medium",
        label: b.name,
        detail: !b.description
          ? "Aucune description renseignée."
          : `Description trop courte (${b.description.length}/50 min).`,
        fixHref: `/dashboard/boutique/${b.id}`,
        fixLabel: "Éditer la description",
      });
    }

    if (!b.cover_image_url && !b.logo_url) {
      issues.push({
        id: `og-${b.id}`,
        category: "missing-og",
        severity: "high",
        label: b.name,
        detail: "Aucune image de couverture ni logo — pas d'aperçu social (Facebook, WhatsApp, X).",
        fixHref: `/dashboard/boutique/${b.id}`,
        fixLabel: "Ajouter une image",
      });
    }

    if (b.name && b.name.length < 20) {
      issues.push({
        id: `short-${b.id}`,
        category: "short-title",
        severity: "low",
        label: b.name,
        detail: `Titre court (${b.name.length}/20 min recommandé pour le SEO).`,
        fixHref: `/dashboard/boutique/${b.id}`,
        fixLabel: "Renommer la boutique",
      });
    }
  }

  // ----- Product-level checks -----
  for (const p of products) {
    if (p.status !== "active") continue;
    const sp = p.supplier_products;
    if (!sp) continue;

    if (!sp.image_url) {
      issues.push({
        id: `og-prod-${p.id}`,
        category: "missing-og",
        severity: "high",
        label: sp.name || "Produit",
        detail: "Image produit manquante — bloque l'affichage social et l'aperçu Google Shopping.",
        fixHref: `/dashboard/catalogue`,
        fixLabel: "Ouvrir le catalogue",
      });
    }

    if (!sp.description || sp.description.trim().length < 50) {
      issues.push({
        id: `meta-prod-${p.id}`,
        category: "missing-meta",
        severity: "medium",
        label: sp.name || "Produit",
        detail: !sp.description
          ? "Pas de description produit."
          : `Description trop courte (${sp.description.length}/50 min).`,
        fixHref: `/dashboard/produits`,
        fixLabel: "Voir les produits",
      });
    }
  }

  return issues;
}

export function SeoFixChecklist({ boutiques, products }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  const issues = useMemo(
    () => detectIssues(boutiques, products),
    [boutiques, products],
  );

  const grouped = useMemo(() => {
    const map: Record<Category, SeoIssue[]> = {
      "duplicate-title": [],
      "missing-meta": [],
      "missing-og": [],
      "short-title": [],
    };
    for (const i of issues) map[i.category].push(i);
    return map;
  }, [issues]);

  const visible =
    activeCategory === "all" ? issues : grouped[activeCategory] || [];

  const totalFixed = issues.length === 0;

  return (
    <SectionCard
      className="mt-6"
      title="Checklist SEO — corriger les alertes"
      description="Pour chaque alerte, un lien direct vers la page à éditer."
      icon={<ListChecks className="w-4 h-4 text-secondary" />}
      actions={
        <Link to="/dashboard/seo-analytics">
          <Button variant="outline" size="sm" className="gap-1.5">
            Audit complet <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </Link>
      }
    >
      {totalFixed ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Tous vos contenus sont conformes 🎉
            </p>
            <p className="text-xs text-muted-foreground">
              Aucun titre dupliqué, ni meta ni image OG manquante détectés.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Category filter chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <button
              onClick={() => setActiveCategory("all")}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                activeCategory === "all"
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
            >
              Tout · {issues.length}
            </button>
            {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
              const count = grouped[cat].length;
              if (count === 0) return null;
              const Icon = CATEGORY_META[cat].icon;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition ${
                    activeCategory === cat
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {CATEGORY_META[cat].title} · {count}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {visible.map((issue) => {
              const meta = CATEGORY_META[issue.category];
              const Icon = meta.icon;
              return (
                <div
                  key={issue.id}
                  className="rounded-xl border border-border/60 bg-muted/20 p-3 flex items-start gap-3"
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${
                      meta.tone === "error"
                        ? "border-red-500/30 bg-red-500/10 text-red-600"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {issue.label}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[9px] py-0 h-4 ${SEVERITY_BADGE[issue.severity]}`}
                      >
                        {issue.severity === "high"
                          ? "Critique"
                          : issue.severity === "medium"
                          ? "Modéré"
                          : "Faible"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[9px] py-0 h-4 border-border text-muted-foreground"
                      >
                        {meta.title}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {issue.detail}
                    </p>
                  </div>
                  <Link to={issue.fixHref} className="shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 whitespace-nowrap"
                    >
                      {issue.fixLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}

            {visible.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                Aucune alerte dans cette catégorie.
              </p>
            )}
          </div>
        </>
      )}
    </SectionCard>
  );
}