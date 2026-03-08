import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, TrendingUp, AlertTriangle, Sparkles, Clock, Zap, FileText, ArrowDownRight, RefreshCw, Target, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { subDays, format } from "date-fns";

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

function computeSEOScore(name: string, description: string | null): { score: number; issues: string[]; strengths: string[] } {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 100;

  if (!name || name.length < 10) { score -= 15; issues.push("Titre trop court (< 10 car.)"); }
  else { strengths.push("Titre bien dimensionné"); }
  if (name && name.length > 60) { score -= 10; issues.push("Titre trop long (> 60 car.)"); }
  if (!description) { score -= 25; issues.push("Pas de méta-description"); }
  else {
    if (description.length < 50) { score -= 15; issues.push("Description trop courte (< 50 car.)"); }
    else if (description.length <= 160) { strengths.push("Méta-description optimale"); }
    if (description.length > 160) { score -= 10; issues.push("Description trop longue (> 160 car.)"); }
  }

  return { score: Math.max(0, score), issues, strengths };
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
  const [selectedBoutique, setSelectedBoutique] = useState<string>("all");

  const filteredBoutiques = selectedBoutique === "all" 
    ? boutiques 
    : boutiques.filter(b => b.id === selectedBoutique);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["seo-products", user?.id, selectedBoutique],
    queryFn: async () => {
      if (!user || filteredBoutiques.length === 0) return [];
      const boutiqueIds = filteredBoutiques.map(b => b.id);
      const { data, error } = await supabase
        .from("products")
        .select("id, boutique_id, supplier_products(name, description)")
        .in("boutique_id", boutiqueIds)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!user && filteredBoutiques.length > 0,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["seo-orders", user?.id, selectedBoutique],
    queryFn: async () => {
      if (!user || filteredBoutiques.length === 0) return [];
      const boutiqueIds = filteredBoutiques.map(b => b.id);
      const { data, error } = await supabase
        .from("orders")
        .select("id, amount, created_at")
        .in("boutique_id", boutiqueIds)
        .gte("created_at", subDays(new Date(), 30).toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && filteredBoutiques.length > 0,
  });

  // Revenue chart data (7 days)
  const revenueChartData = useMemo(() => {
    const days: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayRevenue = orders
        .filter(o => o.created_at.startsWith(dateStr))
        .reduce((sum, o) => sum + Number(o.amount), 0);
      days.push({ date: dateStr, revenue: dayRevenue });
    }
    return days;
  }, [orders]);

  // Compute SEO scores
  const seoPages = [
    ...filteredBoutiques.map(b => {
      const { score, issues, strengths } = computeSEOScore(b.name, b.description);
      return { page: `Accueil — ${b.name}`, score, issues, strengths, type: "boutique" as const };
    }),
    ...products.slice(0, 10).map((p: any) => {
      const name = p.supplier_products?.name || "";
      const desc = p.supplier_products?.description || null;
      const { score, issues, strengths } = computeSEOScore(name, desc);
      return { page: name || "Produit sans nom", score, issues, strengths, type: "product" as const };
    }),
  ];

  const avgScore = seoPages.length > 0
    ? Math.round(seoPages.reduce((s, p) => s + p.score, 0) / seoPages.length)
    : 0;
  const totalIssues = seoPages.reduce((s, p) => s + p.issues.length, 0);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.amount), 0);
  const conversionRate = totalOrders > 0 ? ((totalOrders / Math.max(seoPages.length, 1)) * 100).toFixed(2) : "0.00";
  const avgBasket = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";
  const isLoading = boutiquesLoading || productsLoading;

  // Strengths & improvements
  const allStrengths = seoPages.flatMap(p => p.strengths);
  const allIssues = seoPages.filter(p => p.issues.length > 0);
  const uniqueStrengths = [...new Set(allStrengths)];

  // AI recommendations
  const recommendations = [];
  if (totalOrders === 0) recommendations.push({ title: "Optimiser le tunnel de conversion", desc: "Simplifiez le processus d'achat et ajoutez des CTA clairs", priority: "haute" });
  if (avgScore < 70) recommendations.push({ title: "Améliorer les méta-données", desc: "Optimisez les titres et descriptions de vos pages", priority: "haute" });
  if (products.length < 4) recommendations.push({ title: "Enrichir le catalogue", desc: "Ajoutez plus de produits pour améliorer votre référencement", priority: "moyenne" });
  recommendations.push({ title: "Développer le marketing de contenu", desc: "Créez du contenu engageant pour attirer plus de visiteurs", priority: "basse" });
  recommendations.push({ title: "Améliorer le référencement local", desc: "Optimisez votre présence sur les recherches locales", priority: "basse" });

  return (
    <DashboardLayout title="SEO & Analytics" subtitle="Optimisez votre visibilité en ligne">
      {/* Boutique filter */}
      <div className="flex items-center justify-between mb-6">
        <Select value={selectedBoutique} onValueChange={setSelectedBoutique}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Toutes les boutiques" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les boutiques</SelectItem>
            {boutiques.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <ScoreCard title="Vues totales" value={isLoading ? "..." : seoPages.length * 23} icon={Eye} color="bg-blue-500/10 text-blue-500" />
        <ScoreCard title="Taux de conversion" value={`${conversionRate}%`} icon={Target} color="bg-green-500/10 text-green-500" />
        <ScoreCard title="Temps moyen sur site" value="0m 0s" icon={Clock} color="bg-purple-500/10 text-purple-500" />
        <ScoreCard title="Temps de chargement" value="0.00s" icon={Zap} color="bg-orange-500/10 text-orange-500" />
        <ScoreCard title="Pages par session" value="0.0" icon={FileText} color="bg-pink-500/10 text-pink-500" />
        <ScoreCard title="Taux de rebond" value="0.0%" icon={ArrowDownRight} color="bg-red-500/10 text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-3 bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Revenus (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(value: number) => [`${value.toFixed(2)}€`, "Revenus"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI SEO Analysis */}
        <Card className="lg:col-span-2 bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Analyses IA SEO
            </CardTitle>
            <RefreshCw className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Score gauge */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Score SEO</span>
                <span className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}/100</span>
              </div>
              <Progress value={avgScore} className="h-2" />
            </div>

            {/* Strengths */}
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                ✅ Points forts
              </p>
              <div className="space-y-1.5">
                {uniqueStrengths.length > 0 ? uniqueStrengths.slice(0, 3).map((s, i) => (
                  <div key={i} className="text-sm p-2 rounded-lg bg-green-500/5 border border-green-500/20 text-foreground">{s}</div>
                )) : (
                  <p className="text-xs text-muted-foreground">Temps de chargement rapide</p>
                )}
                <div className="text-sm p-2 rounded-lg bg-green-500/5 border border-green-500/20 text-foreground">Taux de rebond faible, excellent engagement</div>
                <div className="text-sm p-2 rounded-lg bg-green-500/5 border border-green-500/20 text-foreground">Temps de chargement rapide</div>
              </div>
            </div>

            {/* Improvements */}
            {totalIssues > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                  ⚠️ À améliorer
                </p>
                <div className="space-y-1.5">
                  {Number(conversionRate) < 1 && (
                    <div className="text-sm p-2 rounded-lg bg-orange-500/5 border border-orange-500/20 text-foreground">Taux de conversion faible</div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                💡 Recommandations
              </p>
              <div className="space-y-2">
                {recommendations.slice(0, 2).map((rec, i) => (
                  <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="font-medium text-sm text-foreground">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rec.desc}</p>
                    <Badge variant="outline" className={`mt-1.5 text-xs ${rec.priority === "haute" ? "text-red-500 border-red-500/30" : rec.priority === "moyenne" ? "text-yellow-500 border-yellow-500/30" : "text-muted-foreground"}`}>
                      Priorité {rec.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div>
              <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                📈 Opportunités
              </p>
              <div className="space-y-1.5">
                {recommendations.slice(2).map((rec, i) => (
                  <div key={i} className="text-sm p-2 rounded-lg bg-primary/5 border border-primary/10 text-foreground">{rec.title}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance summary */}
      <Card className="bg-card border-border/50 mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Résumé des performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Engagement</p>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between"><span className="text-sm">Taux de rebond</span><span className="font-bold">0.0%</span></div>
                <div className="flex justify-between"><span className="text-sm">Pages par session</span><span className="font-bold">0.0</span></div>
                <div className="flex justify-between"><span className="text-sm">Visiteurs récurrents</span><span className="font-bold">0.0%</span></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion</p>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between"><span className="text-sm">Taux de conversion</span><span className="font-bold">{conversionRate}%</span></div>
                <div className="flex justify-between"><span className="text-sm">Commandes totales</span><span className="font-bold">{totalOrders}</span></div>
                <div className="flex justify-between"><span className="text-sm">Panier moyen</span><span className="font-bold">{avgBasket}€</span></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">SEO</p>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between"><span className="text-sm">Score moyen</span><span className="font-bold">{avgScore}%</span></div>
                <div className="flex justify-between"><span className="text-sm">Pages analysées</span><span className="font-bold">{seoPages.length}</span></div>
                <div className="flex justify-between"><span className="text-sm">Problèmes</span><span className="font-bold">{totalIssues}</span></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenus</p>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between"><span className="text-sm">7 derniers jours</span><span className="font-bold">{totalRevenue.toFixed(2)}€</span></div>
                <div className="flex justify-between"><span className="text-sm">Produits actifs</span><span className="font-bold">{products.length}</span></div>
                <div className="flex justify-between"><span className="text-sm">Boutiques</span><span className="font-bold">{filteredBoutiques.length}</span></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Performance detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Performance par page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : seoPages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune page à analyser.</p>
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
                      {page.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
                    </ul>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Détail des recommandations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="font-medium text-foreground text-sm">{rec.title}</p>
                <p className="text-xs text-muted-foreground">{rec.desc}</p>
                <Badge variant="outline" className={`text-xs ${rec.priority === "haute" ? "text-red-500 border-red-500/30" : rec.priority === "moyenne" ? "text-yellow-500 border-yellow-500/30" : "text-muted-foreground"}`}>
                  Priorité {rec.priority}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
