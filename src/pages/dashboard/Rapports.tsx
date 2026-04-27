import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Download, BarChart3, TrendingUp, ShoppingCart, Package,
  ShieldCheck, Sparkles,
} from "lucide-react";
import { useOrderStats } from "@/hooks/useOrders";
import { useProductStats } from "@/hooks/useProducts";
import { useBoutiqueStats } from "@/hooks/useBoutiques";
import {
  PageHeader, SectionCard, KpiTile, EmptyState,
} from "@/components/dashboard/shared";

const fmt = (n: number) => n.toLocaleString("fr-FR");

export default function Rapports() {
  const { data: orderStats } = useOrderStats();
  const { data: productStats } = useProductStats();
  const { data: boutiqueStats } = useBoutiqueStats();

  const reports = [
    {
      title: "Rapport de ventes mensuel",
      description: "Synthèse de vos ventes, revenus et tendances du mois en cours.",
      icon: TrendingUp,
      stats: `${fmt(orderStats?.revenue || 0)} € de chiffre d'affaires`,
      tone: "primary" as const,
    },
    {
      title: "Rapport des commandes",
      description: "Détail des commandes, statuts logistiques et délais de livraison.",
      icon: ShoppingCart,
      stats: `${fmt(orderStats?.total || 0)} commande(s) tous statuts`,
    },
    {
      title: "Rapport produits",
      description: "Performance produits, marges appliquées et taux de rotation.",
      icon: Package,
      stats: `${fmt(productStats?.active || 0)} produit(s) actif(s)`,
    },
    {
      title: "Rapport boutiques",
      description: "Analyse comparative de vos boutiques et recommandations.",
      icon: BarChart3,
      stats: `${fmt(boutiqueStats?.published || 0)} boutique(s) publiée(s)`,
    },
  ];

  const hasData =
    (orderStats?.total || 0) +
      (productStats?.active || 0) +
      (boutiqueStats?.published || 0) >
    0;

  return (
    <DashboardLayout
      title="Rapports & Recommandations"
      subtitle="Téléchargez vos rapports et suivez vos performances"
    >
      <PageHeader
        eyebrow="Finance & analyse"
        title="Rapports"
        subtitle="Exports prêts à l'emploi, certifiés Verified by Linksy."
        actions={
          <Badge variant="outline" className="gap-1.5 border-secondary/40 text-secondary">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified by Linksy
          </Badge>
        }
      />

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KpiTile
          tone="primary"
          label="Chiffre d'affaires"
          value={`${fmt(orderStats?.revenue || 0)} €`}
          icon={<TrendingUp className="w-5 h-5" />}
          hint="Toutes périodes"
        />
        <KpiTile
          label="Commandes"
          value={fmt(orderStats?.total || 0)}
          icon={<ShoppingCart className="w-5 h-5" />}
          hint={`${orderStats?.delivered || 0} livrées`}
        />
        <KpiTile
          tone="gold"
          label="Produits actifs"
          value={fmt(productStats?.active || 0)}
          icon={<Package className="w-5 h-5" />}
        />
        <KpiTile
          label="Boutiques publiées"
          value={fmt(boutiqueStats?.published || 0)}
          icon={<BarChart3 className="w-5 h-5" />}
        />
      </div>

      {/* Reports grid */}
      <SectionCard
        title="Rapports disponibles"
        description="Format CSV ou PDF, exports horodatés et tamponnés"
        icon={<FileText className="w-4 h-4" />}
      >
        {!hasData ? (
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="Pas encore de rapport généré"
            description="Vos rapports seront disponibles dès vos premières ventes ou activités produits."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report, i) => {
              const Icon = report.icon;
              const accent = report.tone === "primary";
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-border/60 bg-card p-5 hover:border-secondary/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        accent
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/15 text-secondary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground">
                        {report.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {report.description}
                      </p>
                      <p className="text-xs text-secondary font-medium mt-2 tabular-nums">
                        {report.stats}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Download className="w-3.5 h-3.5" /> CSV
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Download className="w-3.5 h-3.5" /> PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Tip */}
      <SectionCard className="mt-6 bg-secondary/5 border-secondary/30">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Tous les exports incluent automatiquement le nom de votre boutique, son logo si disponible
            et la mention <span className="font-medium">Verified by Linksy</span> pour vos partenaires
            et institutions.
          </p>
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}
