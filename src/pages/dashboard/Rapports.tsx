import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, TrendingUp, ShoppingCart, Package, Loader2 } from "lucide-react";
import { useOrderStats, useOrders } from "@/hooks/useOrders";
import { useProductStats, useProducts } from "@/hooks/useProducts";
import { useBoutiqueStats, useBoutiques } from "@/hooks/useBoutiques";
import { useState } from "react";
import { toast } from "sonner";

function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Rapports() {
  const { data: orderStats } = useOrderStats();
  const { data: productStats } = useProductStats();
  const { data: boutiqueStats } = useBoutiqueStats();
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: boutiques } = useBoutiques();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (type: string) => {
    setDownloading(type);
    try {
      switch (type) {
        case "sales": {
          if (!orders?.length) { toast.error("Aucune donnée de vente"); break; }
          downloadCSV("rapport-ventes",
            ["N° Commande", "Produit", "Client", "Email", "Montant (€)", "Statut", "Marché", "Date"],
            orders.map(o => [
              o.order_number, o.products?.supplier_products?.name || "", o.customer_name,
              o.customer_email, Number(o.amount).toFixed(2), o.logistics_status, o.market,
              new Date(o.created_at).toLocaleDateString("fr-FR"),
            ])
          );
          toast.success("Rapport de ventes téléchargé");
          break;
        }
        case "orders": {
          if (!orders?.length) { toast.error("Aucune commande"); break; }
          const statusLabels: Record<string, string> = {
            pending: "En attente", processing: "En préparation", shipped: "Expédié",
            delivered: "Livré", returned: "Retourné",
          };
          downloadCSV("rapport-commandes",
            ["N° Commande", "Client", "Email", "Produit", "Montant (€)", "Statut", "Marché", "Date"],
            orders.map(o => [
              o.order_number, o.customer_name, o.customer_email,
              o.products?.supplier_products?.name || "", Number(o.amount).toFixed(2),
              statusLabels[o.logistics_status] || o.logistics_status, o.market,
              new Date(o.created_at).toLocaleDateString("fr-FR"),
            ])
          );
          toast.success("Rapport des commandes téléchargé");
          break;
        }
        case "products": {
          if (!products?.length) { toast.error("Aucun produit"); break; }
          downloadCSV("rapport-produits",
            ["Produit", "Catégorie", "Prix Public (€)", "Marge (%)", "Statut", "Ventes Cumulées"],
            products.map(p => [
              p.supplier_products?.name || "", p.supplier_products?.category || "",
              Number(p.public_price).toFixed(2), String(p.applied_margin),
              p.status === "active" ? "Actif" : "En pause", String(p.cumulative_sales),
            ])
          );
          toast.success("Rapport produits téléchargé");
          break;
        }
        case "boutiques": {
          if (!boutiques?.length) { toast.error("Aucune boutique"); break; }
          downloadCSV("rapport-boutiques",
            ["Nom", "Slug", "Catégorie", "Statut", "Date de création"],
            boutiques.map(b => [
              b.name, b.slug, b.category,
              b.status === "published" ? "Publiée" : "Brouillon",
              new Date(b.created_at).toLocaleDateString("fr-FR"),
            ])
          );
          toast.success("Rapport boutiques téléchargé");
          break;
        }
      }
    } catch {
      toast.error("Erreur lors de la génération du rapport");
    }
    setDownloading(null);
  };

  const reports = [
    {
      id: "sales",
      title: "Rapport de ventes mensuel",
      description: "Synthèse complète de vos ventes, revenus et tendances du mois en cours.",
      icon: TrendingUp,
      stats: `€${(orderStats?.revenue || 0).toLocaleString('fr-FR')} de CA`,
    },
    {
      id: "orders",
      title: "Rapport des commandes",
      description: "Détail de toutes les commandes, statuts logistiques et délais de livraison.",
      icon: ShoppingCart,
      stats: `${orderStats?.total || 0} commandes`,
    },
    {
      id: "products",
      title: "Rapport produits",
      description: "Performance de vos produits, marges appliquées et taux de rotation.",
      icon: Package,
      stats: `${productStats?.active || 0} produits actifs`,
    },
    {
      id: "boutiques",
      title: "Rapport boutiques",
      description: "Analyse comparative de vos boutiques et recommandations d'optimisation.",
      icon: BarChart3,
      stats: `${boutiqueStats?.published || 0} boutiques publiées`,
    },
  ];

  return (
    <DashboardLayout title="Rapports & Recommandations" subtitle="Téléchargez vos rapports et suivez vos performances">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="bg-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <report.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                  <p className="text-xs text-primary font-medium mt-2">{report.stats}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 mt-3"
                    onClick={() => handleDownload(report.id)}
                    disabled={downloading === report.id}
                  >
                    {downloading === report.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    Télécharger CSV
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
