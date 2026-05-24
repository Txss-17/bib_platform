import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, TrendingUp, Sparkles, Zap, RefreshCw, BarChart3, Store, ArrowRight, Eye,
  AlertTriangle, ImageOff, Copy, FileWarning, Wand2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { subDays, format } from "date-fns";
import { Link } from "react-router-dom";
import { PageHeader, SectionCard, KpiTile, EmptyState, KpiGrid } from "@/components/dashboard/shared";
import { DuplicateTitlesDialog } from "@/components/dashboard/seo/DuplicateTitlesDialog";

function computeSEOScore(name: string, description: string | null) {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 100;
  if (!name || name.length < 10) { score -= 15; issues.push("Titre trop court"); }
  else strengths.push("Titre bien dimensionné");
  if (name && name.length > 60) { score -= 10; issues.push("Titre trop long"); }
  if (!description) { score -= 25; issues.push("Pas de méta-description"); }
  else {
    if (description.length < 50) { score -= 15; issues.push("Description trop courte"); }
    else if (description.length <= 160) strengths.push("Méta-description optimale");
    if (description.length > 160) { score -= 10; issues.push("Description trop longue"); }
  }
  return { score: Math.max(0, score), issues, strengths };
}

type SeoAlertSeverity = "high" | "medium" | "low";
type SeoAlert = {
  severity: SeoAlertSeverity;
  category: "duplicate" | "meta" | "og" | "title";
  title: string;
  detail: string;
  pages: string[];
};

const SEVERITY_STYLES: Record<SeoAlertSeverity, string> = {
  high: "border-destructive/30 bg-destructive/5 text-destructive",
  medium: "border-secondary/30 bg-secondary/5 text-secondary",
  low: "border-border bg-muted/30 text-muted-foreground",
};
const SEVERITY_LABEL: Record<SeoAlertSeverity, string> = {
  high: "Critique",
  medium: "À traiter",
  low: "Conseil",
};
const ALERT_ICON = {
  duplicate: Copy,
  meta: FileWarning,
  og: ImageOff,
  title: AlertTriangle,
};

function scoreColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-secondary";
  return "text-destructive";
}

export default function SEOAnalytics() {
  const { user } = useAuth();
  const { data: boutiques = [], isLoading: boutiquesLoading } = useBoutiques();
  const { data: allOrders } = useOrders();
  const { data: allProducts } = useProducts();
  const [selectedBoutique, setSelectedBoutique] = useState<string>("all");
  const [dupDialogOpen, setDupDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const filteredBoutiques =
    selectedBoutique === "all" ? boutiques : boutiques.filter((b) => b.id === selectedBoutique);

  const { data: seoProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ["seo-products", user?.id, selectedBoutique],
    queryFn: async () => {
      if (!user || filteredBoutiques.length === 0) return [];
      const ids = filteredBoutiques.map((b) => b.id);
      const { data, error } = await supabase
        .from("products")
        .select("id, boutique_id, supplier_products(name, description, image_url)")
        .in("boutique_id", ids)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!user && filteredBoutiques.length > 0,
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["seo-orders", user?.id, selectedBoutique],
    queryFn: async () => {
      if (!user || filteredBoutiques.length === 0) return [];
      const ids = filteredBoutiques.map((b) => b.id);
      const { data, error } = await supabase
        .from("orders")
        .select("id, amount, created_at")
        .in("boutique_id", ids)
        .gte("created_at", subDays(new Date(), 30).toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && filteredBoutiques.length > 0,
  });

  const revenueChartData = useMemo(() => {
    const days: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const key = format(d, "yyyy-MM-dd");
      const rev = recentOrders
        .filter((o) => o.created_at.startsWith(key))
        .reduce((s, o) => s + Number(o.amount), 0);
      days.push({ date: format(d, "dd/MM"), revenue: rev });
    }
    return days;
  }, [recentOrders]);

  const seoPages = [
    ...filteredBoutiques.map((b) => {
      const r = computeSEOScore(b.name, b.description);
      return { page: `Accueil — ${b.name}`, ...r };
    }),
    ...seoProducts.slice(0, 10).map((p: any) => {
      const name = p.supplier_products?.name || "";
      const desc = p.supplier_products?.description || null;
      const r = computeSEOScore(name, desc);
      return { page: name || "Produit sans nom", ...r };
    }),
  ];

  // ---- Concrete SEO alerts (duplicates, missing meta, missing OG image) ----
  const seoAlerts: SeoAlert[] = useMemo(() => {
    const alerts: SeoAlert[] = [];

    // 1. Boutiques without OG image (logo + cover both missing)
    const boutiquesNoOG = filteredBoutiques.filter(
      (b) => !b.cover_image_url && !b.logo_url,
    );
    if (boutiquesNoOG.length > 0) {
      alerts.push({
        severity: "high",
        category: "og",
        title: "Image Open Graph manquante",
        detail:
          "Sans cover ni logo, vos boutiques s'affichent sans aperçu sur Google, WhatsApp et les réseaux sociaux.",
        pages: boutiquesNoOG.map((b) => `Boutique · ${b.name}`),
      });
    }

    // 2. Boutiques without description
    const boutiquesNoDesc = filteredBoutiques.filter(
      (b) => !b.description || b.description.trim().length === 0,
    );
    if (boutiquesNoDesc.length > 0) {
      alerts.push({
        severity: "high",
        category: "meta",
        title: "Méta-description boutique manquante",
        detail:
          "Ajoutez une description (50–160 caractères) pour expliciter votre offre dans les résultats Google.",
        pages: boutiquesNoDesc.map((b) => `Boutique · ${b.name}`),
      });
    }

    // 3. Products without description
    const productsNoDesc = seoProducts.filter(
      (p: any) =>
        !p.supplier_products?.description ||
        p.supplier_products.description.trim().length === 0,
    );
    if (productsNoDesc.length > 0) {
      alerts.push({
        severity: "medium",
        category: "meta",
        title: "Description produit manquante",
        detail: `${productsNoDesc.length} produit(s) actif(s) n'ont pas de description.`,
        pages: productsNoDesc
          .slice(0, 5)
          .map((p: any) => p.supplier_products?.name || "Produit"),
      });
    }

    // 4. Products without image (=> no OG image either)
    const productsNoImage = seoProducts.filter(
      (p: any) => !p.supplier_products?.image_url,
    );
    if (productsNoImage.length > 0) {
      alerts.push({
        severity: "high",
        category: "og",
        title: "Image produit absente",
        detail:
          "Sans visuel, ces fiches produits sont pénalisées dans Google Shopping et n'ont pas d'image OG.",
        pages: productsNoImage
          .slice(0, 5)
          .map((p: any) => p.supplier_products?.name || "Produit"),
      });
    }

    // 5. Duplicate titles across boutiques + products
    const titleMap = new Map<string, string[]>();
    for (const b of filteredBoutiques) {
      const key = (b.name || "").trim().toLowerCase();
      if (!key) continue;
      titleMap.set(key, [...(titleMap.get(key) ?? []), `Boutique · ${b.name}`]);
    }
    for (const p of seoProducts as any[]) {
      const name = (p.supplier_products?.name || "").trim().toLowerCase();
      if (!name) continue;
      titleMap.set(name, [
        ...(titleMap.get(name) ?? []),
        `Produit · ${p.supplier_products?.name}`,
      ]);
    }
    const duplicates = [...titleMap.values()].filter((arr) => arr.length > 1).flat();
    if (duplicates.length > 0) {
      alerts.push({
        severity: "medium",
        category: "duplicate",
        title: "Titres dupliqués détectés",
        detail:
          "Plusieurs pages partagent le même titre — Google peut n'en indexer qu'une seule.",
        pages: duplicates.slice(0, 6),
      });
    }

    // 6. Title length issues across all pages
    const badTitles = seoPages.filter(
      (p) => p.issues.some((i) => i.toLowerCase().includes("titre")),
    );
    if (badTitles.length > 0) {
      alerts.push({
        severity: "low",
        category: "title",
        title: "Longueur de titre non optimale",
        detail: "Visez 30–60 caractères pour un affichage complet dans les SERP.",
        pages: badTitles.slice(0, 5).map((p) => p.page),
      });
    }

    return alerts;
  }, [filteredBoutiques, seoProducts, seoPages]);

  const criticalAlertCount = seoAlerts.filter((a) => a.severity === "high").length;

  const avgScore = seoPages.length
    ? Math.round(seoPages.reduce((s, p) => s + p.score, 0) / seoPages.length)
    : 0;
  const totalIssues = seoAlerts.reduce((s, a) => s + a.pages.length, 0);
  const totalRevenue = recentOrders.reduce((s, o) => s + Number(o.amount), 0);

  const boutiqueAnalytics = filteredBoutiques.map((boutique) => {
    const bOrders = allOrders?.filter((o) => o.boutique_id === boutique.id) || [];
    const bProducts = allProducts?.filter((p) => p.boutique_id === boutique.id) || [];
    const revenue = bOrders.reduce((s, o) => s + Number(o.amount), 0);
    const delivered = bOrders.filter((o) => o.logistics_status === "delivered").length;
    return {
      ...boutique,
      orderCount: bOrders.length,
      productCount: bProducts.length,
      revenue,
      conversionRate: bOrders.length ? Math.round((delivered / bOrders.length) * 100) : 0,
    };
  });

  const recommendations: { title: string; desc: string; priority: "haute" | "moyenne" }[] = [];
  if (recentOrders.length === 0)
    recommendations.push({
      title: "Optimiser le tunnel de conversion",
      desc: "Simplifiez le processus d'achat",
      priority: "haute",
    });
  if (avgScore < 70)
    recommendations.push({
      title: "Améliorer les méta-données",
      desc: "Optimisez titres et descriptions",
      priority: "haute",
    });
  if (seoProducts.length < 4)
    recommendations.push({
      title: "Enrichir le catalogue",
      desc: "Ajoutez plus de produits",
      priority: "moyenne",
    });

  const isLoading = boutiquesLoading || productsLoading;

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Analytics & SEO"
        title="Performance & découvrabilité"
        subtitle="Vos KPIs revenus, vos scores SEO par page et les optimisations recommandées."
        actions={
          <Select value={selectedBoutique} onValueChange={setSelectedBoutique}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Toutes les boutiques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les boutiques</SelectItem>
              {boutiques.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* KPI strip — essentiels uniquement */}
      <KpiGrid cols={2}>
        <KpiTile
          tone="primary"
          label="Score SEO moyen"
          value={`${avgScore}/100`}
          icon={<Search className="w-5 h-5" />}
          hint={avgScore >= 80 ? "Excellent" : avgScore >= 60 ? "À améliorer" : "Critique"}
        />
        <KpiTile
          label="Alertes SEO"
          value={totalIssues}
          icon={<AlertTriangle className="w-5 h-5" />}
          hint={
            criticalAlertCount > 0
              ? `${criticalAlertCount} critique(s)`
              : totalIssues === 0
              ? "Aucune à corriger"
              : "À traiter"
          }
        />
      </KpiGrid>

      {/* Concrete SEO alerts */}
      <SectionCard
        className="mb-6"
        title="Alertes SEO à corriger"
        description="Titres dupliqués, méta manquants, images Open Graph absentes — détectés automatiquement."
        icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setDupDialogOpen(true)}
          >
            <Wand2 className="w-3.5 h-3.5" /> Corriger les doublons
          </Button>
        }
      >
        {seoAlerts.length === 0 ? (
          <EmptyState
            title="Aucune alerte"
            description="Vos boutiques et produits respectent les bonnes pratiques SEO essentielles."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {seoAlerts.map((alert, i) => {
              const Icon = ALERT_ICON[alert.category];
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3 ${SEVERITY_STYLES[alert.severity]}`}
                >
                  <div className="flex items-start gap-2.5 mb-2">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {alert.title}
                        </p>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {SEVERITY_LABEL[alert.severity]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {alert.detail}
                      </p>
                    </div>
                  </div>
                  <ul className="text-[11px] text-muted-foreground space-y-0.5 pl-1">
                    {alert.pages.slice(0, 4).map((p, j) => (
                      <li key={j} className="truncate">• {p}</li>
                    ))}
                    {alert.pages.length > 4 && (
                      <li className="text-foreground/70">
                        + {alert.pages.length - 4} autre(s)
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <DuplicateTitlesDialog
        open={dupDialogOpen}
        onOpenChange={setDupDialogOpen}
        boutiques={filteredBoutiques.map((b) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          tagline: b.tagline,
        }))}
        products={(seoProducts as any[]).map((p) => ({
          id: p.id,
          boutique_id: p.boutique_id,
          name: p.supplier_products?.name || "",
          category: null,
        }))}
      />

      {/* Revenue chart + AI panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <SectionCard
          className="lg:col-span-3"
          title="Revenus (7 derniers jours)"
          description="Évolution quotidienne, toutes boutiques sélectionnées"
          icon={<TrendingUp className="w-4 h-4" />}
        >
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} €`, "Revenus"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "hsl(var(--secondary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          className="lg:col-span-2"
          title="Recommandations IA"
          description="Actions prioritaires pour booster votre découvrabilité"
          icon={<Sparkles className="w-4 h-4 text-secondary" />}
          actions={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Rafraîchir"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["seo-products"] });
                queryClient.invalidateQueries({ queryKey: ["seo-orders"] });
              }}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">Score SEO global</span>
                <span className={`text-xl font-display font-bold ${scoreColor(avgScore)}`}>
                  {avgScore}/100
                </span>
              </div>
              <Progress value={avgScore} className="h-2" />
            </div>
            {recommendations.length === 0 ? (
              <EmptyState
                title="Tout est optimal"
                description="Aucune recommandation à appliquer pour l'instant."
              />
            ) : (
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-secondary/5 border border-secondary/20"
                  >
                    <p className="font-medium text-xs text-foreground">{rec.title}</p>
                    <p className="text-[11px] text-muted-foreground">{rec.desc}</p>
                    <Badge
                      variant="outline"
                      className={`mt-1.5 text-[10px] ${
                        rec.priority === "haute"
                          ? "text-destructive border-destructive/30"
                          : "text-secondary border-secondary/40"
                      }`}
                    >
                      Priorité {rec.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Boutique performance grid */}
      <SectionCard
        className="mb-6"
        title="Performance par boutique"
        description="Comparez vos boutiques d'un coup d'œil"
        icon={<BarChart3 className="w-4 h-4" />}
      >
        {boutiqueAnalytics.length === 0 ? (
          <EmptyState
            icon={<Store className="w-6 h-6" />}
            title="Aucune boutique créée"
            description="Créez votre première boutique pour voir ses performances ici."
            action={
              <Link to="/dashboard/boutiques/create">
                <Button size="sm" className="gap-2">
                  <Store className="w-4 h-4" /> Créer une boutique
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boutiqueAnalytics.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-border/60 bg-card p-4 hover:border-secondary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-semibold text-sm text-foreground truncate">
                      {b.name}
                    </h4>
                    <Badge
                      variant={b.status === "published" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {b.status === "published" ? "Publiée" : "Brouillon"}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-muted/40 text-center">
                    <p className="text-sm font-display font-bold text-foreground tabular-nums">
                      {b.revenue.toLocaleString("fr-FR")} €
                    </p>
                    <p className="text-[10px] text-muted-foreground">CA</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 text-center">
                    <p className="text-sm font-display font-bold text-foreground tabular-nums">
                      {b.orderCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Cmd</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40 text-center">
                    <p className="text-sm font-display font-bold text-foreground tabular-nums">
                      {b.productCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Produits</p>
                  </div>
                </div>
                <Link to={`/dashboard/boutiques/edit/${b.id}`}>
                  <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                    Gérer <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* SEO per page */}
      <SectionCard
        title="Score SEO par page"
        description="Détail des points à optimiser pour chaque page indexée"
        icon={<Search className="w-4 h-4" />}
      >
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : seoPages.length === 0 ? (
          <EmptyState
            title="Aucune page à analyser"
            description="Publiez une boutique ou ajoutez des produits pour démarrer l'analyse SEO."
          />
        ) : (
          <div className="space-y-3">
            {seoPages.map((page, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-muted/30 border border-border/40">
                <div className="flex items-center justify-between mb-1.5 gap-3">
                  <span className="font-medium text-foreground text-sm truncate">
                    {page.page}
                  </span>
                  <span className={`font-display font-bold text-sm shrink-0 ${scoreColor(page.score)}`}>
                    {page.score}%
                  </span>
                </div>
                <Progress value={page.score} className="h-1.5 mb-2" />
                {page.issues.length > 0 && (
                  <ul className="text-[11px] text-muted-foreground space-y-0.5">
                    {page.issues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </DashboardLayout>
  );
}
