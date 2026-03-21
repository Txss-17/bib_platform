import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, TrendingUp, ShoppingCart, Package } from "lucide-react";
import { useOrderStats } from "@/hooks/useOrders";
import { useProductStats } from "@/hooks/useProducts";
import { useBoutiqueStats } from "@/hooks/useBoutiques";

export default function Rapports() {
  const { data: orderStats } = useOrderStats();
  const { data: productStats } = useProductStats();
  const { data: boutiqueStats } = useBoutiqueStats();

  const reports = [
    {
      title: "Rapport de ventes mensuel",
      description: "Synthèse complète de vos ventes, revenus et tendances du mois en cours.",
      icon: TrendingUp,
      stats: `€${(orderStats?.revenue || 0).toLocaleString('fr-FR')} de CA`,
    },
    {
      title: "Rapport des commandes",
      description: "Détail de toutes les commandes, statuts logistiques et délais de livraison.",
      icon: ShoppingCart,
      stats: `${orderStats?.total || 0} commandes`,
    },
    {
      title: "Rapport produits",
      description: "Performance de vos produits, marges appliquées et taux de rotation.",
      icon: Package,
      stats: `${productStats?.active || 0} produits actifs`,
    },
    {
      title: "Rapport boutiques",
      description: "Analyse comparative de vos boutiques et recommandations d'optimisation.",
      icon: BarChart3,
      stats: `${boutiqueStats?.published || 0} boutiques publiées`,
    },
  ];

  return (
    <DashboardLayout title="Rapports & Recommandations" subtitle="Téléchargez vos rapports et suivez vos performances">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, i) => (
          <Card key={i} className="bg-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <report.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  <p className="text-xs text-primary font-medium mt-2">{report.stats}</p>
                  <Button variant="outline" size="sm" className="gap-1 mt-3">
                    <Download className="w-3 h-3" /> Télécharger
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
