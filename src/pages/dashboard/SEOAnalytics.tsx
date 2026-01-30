import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Search, Eye, TrendingUp, AlertTriangle, Sparkles, RefreshCw, ExternalLink } from "lucide-react";

const seoScores = [
  { page: "Accueil - Maison Déco", score: 85, issues: 2, url: "/maison-deco" },
  { page: "Lampe LED Design", score: 92, issues: 0, url: "/maison-deco/lampe-led" },
  { page: "Coussin Velours", score: 78, issues: 3, url: "/maison-deco/coussin-velours" },
  { page: "Accueil - Beauty Corner", score: 65, issues: 5, url: "/beauty-corner" },
];

const aiSuggestions = [
  {
    page: "Coussin Velours",
    original: { title: "Coussin", description: "Un coussin en velours" },
    suggested: { 
      title: "Coussin Velours Premium - Confort & Élégance | Maison Déco", 
      description: "Découvrez notre coussin velours premium, hypoallergénique et ultra-doux. Livraison gratuite. Parfait pour sublimer votre intérieur."
    }
  },
  {
    page: "Beauty Corner",
    original: { title: "Beauty Corner", description: "Boutique beauté" },
    suggested: { 
      title: "Beauty Corner - Cosmétiques Bio & Soins Naturels | LINKSY", 
      description: "Explorez notre sélection de cosmétiques bio et soins naturels. Formules clean, testées dermatologiquement. Livraison offerte dès 30€."
    }
  },
];

function ScoreCard({ title, value, subtitle, icon: Icon, color }: { 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ElementType; 
  color: string;
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
  const avgScore = Math.round(seoScores.reduce((sum, p) => sum + p.score, 0) / seoScores.length);
  const totalIssues = seoScores.reduce((sum, p) => sum + p.issues, 0);

  return (
    <DashboardLayout title="SEO & Analytics" subtitle="Optimisez votre visibilité en ligne">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <ScoreCard 
          title="Score SEO moyen" 
          value={`${avgScore}%`}
          subtitle={getScoreLabel(avgScore)}
          icon={Search}
          color="bg-primary/10 text-primary"
        />
        <ScoreCard 
          title="Visibilité Google" 
          value="12,450"
          subtitle="Impressions ce mois"
          icon={Eye}
          color="bg-green-500/10 text-green-500"
        />
        <ScoreCard 
          title="Croissance trafic" 
          value="+24%"
          subtitle="vs mois précédent"
          icon={TrendingUp}
          color="bg-blue-500/10 text-blue-500"
        />
        <ScoreCard 
          title="Problèmes détectés" 
          value={totalIssues}
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
            <Button variant="outline" size="sm" className="gap-1">
              <RefreshCw className="w-3 h-3" />
              Analyser
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {seoScores.map((page, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{page.page}</span>
                    {page.issues > 0 && (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                        {page.issues} problèmes
                      </Badge>
                    )}
                  </div>
                  <span className={`font-bold ${getScoreColor(page.score)}`}>{page.score}%</span>
                </div>
                <Progress value={page.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Suggestions IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{suggestion.page}</span>
                  <Button size="sm" className="gap-1">
                    Appliquer
                  </Button>
                </div>
                
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Titre actuel</p>
                  <p className="text-sm text-foreground line-through opacity-60">{suggestion.original.title}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Titre suggéré</p>
                  <p className="text-sm text-foreground font-medium">{suggestion.suggested.title}</p>
                </div>

                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Description suggérée</p>
                  <p className="text-sm text-foreground">{suggestion.suggested.description}</p>
                </div>

                {index < aiSuggestions.length - 1 && <hr className="border-border" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
