import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, TrendingUp, Sparkles, Zap, RefreshCw, Target, BarChart3, Store, ShoppingCart, Package, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { subDays, format } from "date-fns";
import { Link } from "react-router-dom";

function ScoreCard({ title, value, icon: Icon, color }: { 
  title: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
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

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

export default function SEOAnalytics() {
  const { user } = useAuth();
  const { data: boutiques = [], isLoading: boutiquesLoading } = useBoutiques();
  const { data: allOrders } = useOrders();
  const { data: allProducts } = useProducts();
  const [selectedBoutique, setSelectedBoutique] = useState<string>("all");

  const filteredBoutiques = selectedBoutique === "all" ? boutiques : boutiques.filter(b => b.id === selectedBoutique);

  const { data: seoProducts = [], isLoading: productsLoading } = useQuery({
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

  const { data: recentOrders = [] } = useQuery({
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

  const revenueChartData = useMemo(() => {
    const days: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayRevenue = recentOrders
        .filter(o => o.created_at.startsWith(dateStr))
        .reduce((sum, o) => sum + Number(o.amount), 0);
      days.push({ date: format(d, "dd/MM"), revenue: dayRevenue });
    }
    return days;
  }, [recentOrders]);

  const seoPages = [
    ...filteredBoutiques.map(b => {
      const { score, issues, strengths } = computeSEOScore(b.name, b.description);
      return { page: `Accueil — ${b.name}`, score, issues, strengths };
    }),
    ...seoProducts.slice(0, 10).map((p: any) => {
      const name = p.supplier_products?.name || "";
      const desc = p.supplier_products?.description || null;
      const { score, issues, strengths } = computeSEOScore(name, desc);
      return { page: name || "Produit sans nom", score, issues, strengths };
    }),
  ];

  const avgScore = seoPages.length > 0 ? Math.round(seoPages.reduce((s, p) => s + p.score, 0) / seoPages.length) : 0;
  const totalIssues = seoPages.reduce((s, p) => s + p.issues.length, 0);
  const totalRevenue = recentOrders.reduce((s, o) => s + Number(o.amount), 0);

  // Boutique analytics
  const boutiqueAnalytics = filteredBoutiques.map(boutique => {
    const boutiqueOrders = allOrders?.filter(o => o.boutique_id === boutique.id) || [];
    const boutiqueProducts = allProducts?.filter(p => p.boutique_id === boutique.id) || [];
    const revenue = boutiqueOrders.reduce((sum, o) => sum + Number(o.amount), 0);
    const delivered = boutiqueOrders.filter(o => o.logistics_status === "delivered").length;
    return {
      ...boutique,
      orderCount: boutiqueOrders.length,
      productCount: boutiqueProducts.length,
      revenue,
      conversionRate: boutiqueOrders.length > 0 ? Math.round((delivered / boutiqueOrders.length) * 100) : 0,
    };
  });

  const recommendations = [];
  if (recentOrders.length === 0) recommendations.push({ title: "Optimiser le tunnel de conversion", desc: "Simplifiez le processus d'achat", priority: "haute" });
  if (avgScore < 70) recommendations.push({ title: "Améliorer les méta-données", desc: "Optimisez titres et descriptions", priority: "haute" });
  if (seoProducts.length < 4) recommendations.push({ title: "Enrichir le catalogue", desc: "Ajoutez plus de produits", priority: "moyenne" });

  const isLoading = boutiquesLoading || productsLoading;

  return (
    <DashboardLayout title="Analytics" subtitle="Performances et référencement de vos boutiques">
      <div className="flex items-center justify-between mb-6">
        <Select value={selectedBoutique} onValueChange={setSelectedBoutique}>
          <SelectTrigger className="w-full sm:w-[220px]">
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

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <ScoreCard title="Score SEO" value={`${avgScore}/100`} icon={Search} color="bg-primary/10 text-primary" />
        <ScoreCard title="Revenus (30j)" value={`${totalRevenue.toFixed(0)}€`} icon={TrendingUp} color="bg-green-500/10 text-green-500" />
        <ScoreCard title="Produits actifs" value={seoProducts.length} icon={Eye} color="bg-blue-500/10 text-blue-500" />
        <ScoreCard title="Problèmes SEO" value={totalIssues} icon={Zap} color={totalIssues > 0 ? "bg-orange-500/10 text-orange-500" : "bg-green-500/10 text-green-500"} />
      </div>

      {/* Revenue chart + SEO Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <Card className="lg:col-span-3 bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Revenus (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} formatter={(value: number) => [`${value.toFixed(2)}€`, "Revenus"]} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Analyses IA
            </CardTitle>
            <RefreshCw className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-foreground">Score SEO</span>
                <span className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}/100</span>
              </div>
              <Progress value={avgScore} className="h-2" />
            </div>

            {recommendations.length > 0 && (
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="font-medium text-xs text-foreground">{rec.title}</p>
                    <p className="text-[11px] text-muted-foreground">{rec.desc}</p>
                    <Badge variant="outline" className={`mt-1 text-[10px] ${rec.priority === "haute" ? "text-red-500 border-red-500/30" : "text-yellow-500 border-yellow-500/30"}`}>
                      Priorité {rec.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Boutique Analytics */}
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Performance par boutique
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {boutiqueAnalytics.map(boutique => (
          <Card key={boutique.id} className="bg-card border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Store className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-foreground truncate">{boutique.name}</h4>
                  <Badge variant={boutique.status === "published" ? "default" : "secondary"} className="text-[10px]">
                    {boutique.status === "published" ? "Publiée" : "Brouillon"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm font-bold text-foreground">€{boutique.revenue.toLocaleString('fr-FR')}</p>
                  <p className="text-[10px] text-muted-foreground">CA</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm font-bold text-foreground">{boutique.orderCount}</p>
                  <p className="text-[10px] text-muted-foreground">Cmd</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm font-bold text-foreground">{boutique.productCount}</p>
                  <p className="text-[10px] text-muted-foreground">Produits</p>
                </div>
              </div>
              <Link to={`/dashboard/boutiques/edit/${boutique.id}`}>
                <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                  Gérer <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        {boutiqueAnalytics.length === 0 && (
          <Card className="col-span-full border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-sm">Aucune boutique créée</p>
              <Link to="/dashboard/boutiques/create">
                <Button className="mt-3 gap-2" size="sm"><Store className="w-4 h-4" /> Créer une boutique</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* SEO Page Performance */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Performance SEO par page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : seoPages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune page à analyser.</p>
          ) : (
            seoPages.map((page, index) => (
              <div key={index} className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-foreground text-sm truncate mr-2">{page.page}</span>
                  <span className={`font-bold text-sm ${getScoreColor(page.score)}`}>{page.score}%</span>
                </div>
                <Progress value={page.score} className="h-1.5 mb-1.5" />
                {page.issues.length > 0 && (
                  <ul className="text-[11px] text-muted-foreground space-y-0.5">
                    {page.issues.map((issue, i) => <li key={i}>• {issue}</li>)}
                  </ul>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
