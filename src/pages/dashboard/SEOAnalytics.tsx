import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, Eye, TrendingUp, AlertTriangle, Sparkles, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { Skeleton } from "@/components/ui/skeleton";

function ScoreCard({ title, value, subtitle, icon: Icon, color }: { 
  title: string; value: string | number; subtitle?: string; icon: React.ElementType; color: string;
}) {
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function computeSEOScore(name: string, description: string | null): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  if (!name || name.length < 10) { score -= 15; issues.push("Titre trop court (< 10 car.)"); }
  if (name && name.length > 60) { score -= 10; issues.push("Titre trop long (> 60 car.)"); }
  if (!description) { score -= 25; issues.push("Pas de méta-description"); }
  else {
    if (description.length < 50) { score -= 15; issues.push("Description trop courte (< 50 car.)"); }
    if (description.length > 160) { score -= 10; issues.push("Description trop longue (> 160 car.)"); }
  }

  return { score: Math.max(0, score), issues };
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Bon";
  return "À améliorer";
}

export default function SEOAnalytics() {
  const { user } = useAuth();
  const { data: boutiques = [], isLoading: boutiquesLoading } = useBoutiques();

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["seo-products", user?.id],
    queryFn: async () => {
      if (!user || boutiques.length === 0) return [];
      const boutiqueIds = boutiques.map(b => b.id);
      const { data, error } = await supabase
        .from("products")
        .select("id, boutique_id, supplier_products(name, description)")
        .in("boutique_id", boutiqueIds)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!user && boutiques.length > 0,
  });

  const { data: orderStats } = useQuery({
    queryKey: ["seo-order-stats", user?.id],
    queryFn: async () => {
      if (!user || boutiques.length === 0) return { total: 0 };
      const boutiqueIds = boutiques.map(b => b.id);
      const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("boutique_id", boutiqueIds);
      if (error) throw error;
      return { total: count || 0 };
    },
    enabled: !!user && boutiques.length > 0,
  });

  // Compute SEO scores for boutiques and products
  const seoPages = [
    ...boutiques.map(b => {
      const { score, issues } = computeSEOScore(b.name, b.description);
      return { page: `Accueil — ${b.name}`, score, issues, type: "boutique" as const };
    }),
    ...products.slice(0, 10).map((p: any) => {
      const name = p.supplier_products?.name || "";
      const desc = p.supplier_products?.description || null;
      const { score, issues } = computeSEOScore(name, desc);
      return { page: name || "Produit sans nom", score, issues, type: "product" as const };
    }),
  ];

  const avgScore = seoPages.length > 0
    ? Math.round(seoPages.reduce((s, p) => s + p.score, 0) / seoPages.length)
    : 0;
  const totalIssues = seoPages.reduce((s, p) => s + p.issues.length, 0);
  const isLoading = boutiquesLoading || productsLoading;

  return (
    <DashboardLayout title="SEO & Analytics" subtitle="Optimisez votre visibilité en ligne">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <ScoreCard 
          title="Score SEO moyen" 
          value={isLoading ? "..." : `${avgScore}%`}
          subtitle={isLoading ? undefined : getScoreLabel(avgScore)}
          icon={Search}
          color="bg-primary/10 text-primary"
        />
        <ScoreCard 
          title="Pages analysées" 
          value={isLoading ? "..." : seoPages.length}
          subtitle={`${boutiques.length} boutique(s) + ${products.length} produit(s)`}
          icon={Eye}
          color="bg-green-500/10 text-green-500"
        />
        <ScoreCard 
          title="Commandes totales" 
          value={orderStats?.total ?? "..."}
          subtitle="Toutes boutiques"
          icon={TrendingUp}
          color="bg-blue-500/10 text-blue-500"
        />
        <ScoreCard 
          title="Problèmes détectés" 
          value={isLoading ? "..." : totalIssues}
          subtitle="À corriger"
          icon={AlertTriangle}
          color="bg-yellow-500/10 text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Performance */}
        <Card className="bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Performance par page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : seoPages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune page à analyser. Créez une boutique et ajoutez des produits.</p>
            ) : (
              seoPages.map((page, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground text-sm">{page.page}</span>
                      {page.issues.length > 0 && (
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 text-xs">
                          {page.issues.length} problème{page.issues.length > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <span className={`font-bold ${getScoreColor(page.score)}`}>{page.score}%</span>
                  </div>
                  <Progress value={page.score} className="h-2 mb-2" />
                  {page.issues.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {page.issues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Recommandations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : (
              <>
                {seoPages.filter(p => p.issues.length > 0).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-green-500 font-medium mb-1">🎉 Excellent !</p>
                    <p className="text-sm text-muted-foreground">Aucun problème SEO détecté sur vos pages.</p>
                  </div>
                ) : (
                  seoPages.filter(p => p.issues.length > 0).slice(0, 5).map((page, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-medium text-foreground text-sm">{page.page}</p>
                      {page.issues.map((issue, i) => (
                        <div key={i} className="p-2 rounded bg-yellow-500/5 border border-yellow-500/20">
                          <p className="text-xs text-foreground">⚠️ {issue}</p>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
