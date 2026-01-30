import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Euro, Clock, CheckCircle, TrendingUp } from "lucide-react";

const payoutHistory = [
  { id: "1", period: "1-15 Jan 2026", amount: 1250.00, status: "completed", date: "2026-01-20", boutique: "Maison Déco" },
  { id: "2", period: "16-31 Déc 2025", amount: 2100.00, status: "completed", date: "2026-01-05", boutique: "Maison Déco" },
  { id: "3", period: "1-15 Déc 2025", amount: 980.00, status: "completed", date: "2025-12-20", boutique: "Maison Déco" },
  { id: "4", period: "16-30 Nov 2025", amount: 1450.00, status: "completed", date: "2025-12-05", boutique: "Beauty Corner" },
];

const boutiqueBreakdown = [
  { name: "Maison Déco", revenue: 4330.00, pending: 850.00, products: 12 },
  { name: "Beauty Corner", revenue: 2150.00, pending: 320.00, products: 8 },
  { name: "Tech Store", revenue: 1200.00, pending: 0, products: 5 },
];

function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: { 
  title: string; 
  value: string; 
  subtitle?: string; 
  icon: React.ElementType; 
  variant?: "default" | "pending" | "success" 
}) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    pending: "bg-yellow-500/10 text-yellow-500",
    success: "bg-green-500/10 text-green-500",
  };

  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${variantStyles[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Paiements() {
  const totalRevenue = boutiqueBreakdown.reduce((sum, b) => sum + b.revenue, 0);
  const totalPending = boutiqueBreakdown.reduce((sum, b) => sum + b.pending, 0);

  return (
    <DashboardLayout title="Paiements" subtitle="Suivez vos revenus et versements">
      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20 mb-8">
        <CardContent className="p-4">
          <p className="text-sm text-foreground">
            💡 <span className="font-medium">Les frais logistiques sont déjà intégrés dans vos prix.</span> Aucun ajustement à prévoir. 
            Vos versements sont effectués tous les 15 jours.
          </p>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Revenus cumulés" 
          value={`${totalRevenue.toLocaleString('fr-FR')} €`}
          subtitle="Depuis le début"
          icon={Euro}
          variant="success"
        />
        <StatCard 
          title="En attente de versement" 
          value={`${totalPending.toLocaleString('fr-FR')} €`}
          subtitle="Prochain versement: 15 Fév"
          icon={Clock}
          variant="pending"
        />
        <StatCard 
          title="Croissance mensuelle" 
          value="+18.5%"
          subtitle="vs mois précédent"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payout History */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Historique des versements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutHistory.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payout.period}</p>
                        <p className="text-xs text-muted-foreground">{new Date(payout.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </TableCell>
                    <TableCell>{payout.boutique}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Versé
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      +{payout.amount.toFixed(2)} €
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Boutique Breakdown */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Détail par boutique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {boutiqueBreakdown.map((boutique) => (
              <div key={boutique.name} className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground">{boutique.name}</h4>
                  <Badge variant="secondary">{boutique.products} produits</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus cumulés</p>
                    <p className="text-lg font-bold text-foreground">{boutique.revenue.toLocaleString('fr-FR')} €</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-lg font-bold text-yellow-500">{boutique.pending.toLocaleString('fr-FR')} €</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
