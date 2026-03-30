import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Euro, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, subtitle, icon: Icon, variant = "default" }: { 
  title: string; value: string; subtitle?: string; icon: React.ElementType; 
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
  const { user } = useAuth();
  const { data: boutiques = [] } = useBoutiques();

  // Real payments from DB
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("payments")
        .select("*, boutiques(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Real revenue from orders
  const { data: orderRevenue = { total: 0, byBoutique: [] as any[] }, isLoading: revenueLoading } = useQuery({
    queryKey: ["order-revenue", user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, byBoutique: [] };
      const boutiqueIds = boutiques.map(b => b.id);
      if (boutiqueIds.length === 0) return { total: 0, byBoutique: [] };

      const { data, error } = await supabase
        .from("orders")
        .select("amount, boutique_id")
        .in("boutique_id", boutiqueIds);
      if (error) throw error;

      const total = data.reduce((s, o) => s + Number(o.amount), 0);
      const byBoutiqueMap: Record<string, number> = {};
      data.forEach(o => {
        byBoutiqueMap[o.boutique_id] = (byBoutiqueMap[o.boutique_id] || 0) + Number(o.amount);
      });

      const byBoutique = boutiques.map(b => ({
        name: b.name,
        revenue: byBoutiqueMap[b.id] || 0,
      }));

      return { total, byBoutique };
    },
    enabled: !!user && boutiques.length > 0,
  });

  const completedPayments = payments.filter(p => p.status === "completed");
  const totalPaid = completedPayments.reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayments = payments.filter(p => p.status === "pending");
  const totalPending = pendingPayments.reduce((s, p) => s + Number(p.amount), 0);

  const isLoading = paymentsLoading || revenueLoading;

  return (
    <DashboardLayout title="Paiements" subtitle="Suivez vos revenus et versements">
      <Card className="bg-primary/5 border-primary/20 mb-8">
        <CardContent className="p-4">
          <p className="text-sm text-foreground">
            💡 <span className="font-medium">Les frais logistiques sont déjà intégrés dans vos prix.</span> Aucun ajustement à prévoir. 
            Vos versements sont effectués tous les 15 jours.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Revenus cumulés (commandes)" 
          value={isLoading ? "..." : `${orderRevenue.total.toLocaleString('fr-FR')} €`}
          subtitle="Total des ventes"
          icon={Euro}
          variant="success"
        />
        <StatCard 
          title="En attente de versement" 
          value={isLoading ? "..." : `${totalPending.toLocaleString('fr-FR')} €`}
          subtitle={pendingPayments.length > 0 ? `${pendingPayments.length} versement(s)` : "Aucun en attente"}
          icon={Clock}
          variant="pending"
        />
        <StatCard 
          title="Déjà versé" 
          value={isLoading ? "..." : `${totalPaid.toLocaleString('fr-FR')} €`}
          subtitle={`${completedPayments.length} versement(s)`}
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
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : payments.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Aucun versement pour le moment.</p>
            ) : (
              <>
                <div className="hidden sm:block">
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
                      {payments.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{new Date(p.period_start).toLocaleDateString('fr-FR')} - {new Date(p.period_end).toLocaleDateString('fr-FR')}</p>
                              {p.payout_date && <p className="text-xs text-muted-foreground">Versé le {new Date(p.payout_date).toLocaleDateString('fr-FR')}</p>}
                            </div>
                          </TableCell>
                          <TableCell>{p.boutiques?.name || "—"}</TableCell>
                          <TableCell>
                            {p.status === "completed" ? (
                              <Badge variant="default" className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20">
                                <CheckCircle className="w-3 h-3" /> Versé
                              </Badge>
                            ) : p.status === "pending" ? (
                              <Badge variant="outline" className="gap-1 text-yellow-500 border-yellow-500/30">
                                <Clock className="w-3 h-3" /> En attente
                              </Badge>
                            ) : (
                              <Badge variant="destructive">{p.status}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {p.status === "completed" ? "+" : ""}{Number(p.amount).toFixed(2)} €
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="sm:hidden space-y-3">
                  {payments.map((p: any) => (
                    <div key={p.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(p.period_start).toLocaleDateString('fr-FR')} - {new Date(p.period_end).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {p.status === "completed" ? "+" : ""}{Number(p.amount).toFixed(2)} €
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{p.boutiques?.name || "—"}</span>
                        {p.status === "completed" ? (
                          <Badge variant="default" className="gap-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 text-[10px]">
                            <CheckCircle className="w-3 h-3" /> Versé
                          </Badge>
                        ) : p.status === "pending" ? (
                          <Badge variant="outline" className="gap-1 text-yellow-500 border-yellow-500/30 text-[10px]">
                            <Clock className="w-3 h-3" /> En attente
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">{p.status}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Boutique */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Revenus par boutique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : orderRevenue.byBoutique.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">Aucune boutique trouvée.</p>
            ) : (
              orderRevenue.byBoutique.map((b: any) => (
                <div key={b.name} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{b.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">Revenus cumulés</p>
                  <p className="text-lg font-bold text-foreground">{b.revenue.toLocaleString('fr-FR')} €</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
