import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Euro, Clock, CheckCircle, TrendingUp, Wallet, CalendarClock, Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PageHeader, SectionCard, KpiTile, KpiTileSkeleton, EmptyState,
  RealtimeStatusPill,
} from "@/components/dashboard/shared";
import { usePaymentsRealtime } from "@/hooks/usePaymentsRealtime";
import { PaymentsActivityFeed } from "@/components/dashboard/payments/PaymentsActivityFeed";

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function nextPayoutDate(): Date {
  // Versements tous les 15 jours: 1er et 15 du mois.
  const now = new Date();
  const day = now.getDate();
  const next = new Date(now.getFullYear(), now.getMonth(), day < 15 ? 15 : 1);
  if (day >= 15) next.setMonth(next.getMonth() + 1);
  return next;
}

export default function Paiements() {
  const { user } = useAuth();
  const { data: boutiques = [] } = useBoutiques();
  const boutiqueIds = boutiques.map((b) => b.id);
  const { status: rtStatus, feed, clearFeed } = usePaymentsRealtime(boutiqueIds);
  const boutiqueLookup = Object.fromEntries(boutiques.map((b) => [b.id, b.name]));

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

  const { data: orderRevenue = { total: 0, byBoutique: [] as any[] }, isLoading: revenueLoading } = useQuery({
    queryKey: ["order-revenue", user?.id],
    queryFn: async () => {
      if (!user || boutiqueIds.length === 0) return { total: 0, byBoutique: [] };
      const { data, error } = await supabase
        .from("orders")
        .select("amount, boutique_id")
        .in("boutique_id", boutiqueIds);
      if (error) throw error;
      const total = data.reduce((s, o) => s + Number(o.amount), 0);
      const byMap: Record<string, number> = {};
      data.forEach((o) => {
        byMap[o.boutique_id] = (byMap[o.boutique_id] || 0) + Number(o.amount);
      });
      const byBoutique = boutiques
        .map((b) => ({ id: b.id, name: b.name, revenue: byMap[b.id] || 0 }))
        .sort((a, b) => b.revenue - a.revenue);
      return { total, byBoutique };
    },
    enabled: !!user && boutiqueIds.length > 0,
  });

  const completed = payments.filter((p: any) => p.status === "completed");
  const pending = payments.filter((p: any) => p.status === "pending");
  const totalPaid = completed.reduce((s, p: any) => s + Number(p.amount), 0);
  const totalPending = pending.reduce((s, p: any) => s + Number(p.amount), 0);
  const isLoading = paymentsLoading || revenueLoading;

  const next = nextPayoutDate();
  const topBoutique = orderRevenue.byBoutique[0];
  const maxRev = Math.max(1, ...orderRevenue.byBoutique.map((b: any) => b.revenue));

  return (
    <DashboardLayout title="Paiements" subtitle="Suivez vos revenus et versements">
      <PageHeader
        eyebrow="Finance"
        title="Cockpit financier"
        subtitle="Revenus en temps réel, prochains virements et historique de versements."
        actions={<RealtimeStatusPill status={rtStatus} />}
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {isLoading ? (
          <>
            <KpiTileSkeleton tone="primary" />
            <KpiTileSkeleton />
            <KpiTileSkeleton tone="gold" />
            <KpiTileSkeleton />
          </>
        ) : (
          <>
            <KpiTile
              tone="primary"
              label="Revenus cumulés"
              value={`${fmt(orderRevenue.total)} €`}
              icon={<Euro className="w-5 h-5" />}
              hint="Toutes boutiques confondues"
            />
            <KpiTile
              label="En attente de versement"
              value={`${fmt(totalPending)} €`}
              icon={<Clock className="w-5 h-5" />}
              hint={pending.length > 0 ? `${pending.length} versement(s)` : "Aucun en attente"}
            />
            <KpiTile
              tone="gold"
              label="Prochain virement"
              value={next.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
              icon={<CalendarClock className="w-5 h-5" />}
              hint="Cycle de 15 jours"
            />
            <KpiTile
              label="Déjà versé"
              value={`${fmt(totalPaid)} €`}
              icon={<TrendingUp className="w-5 h-5" />}
              hint={`${completed.length} versement(s)`}
            />
          </>
        )}
      </div>

      {/* Info bar */}
      <SectionCard className="mb-6 bg-secondary/5 border-secondary/30">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            <span className="font-medium">Frais logistiques inclus dans vos prix.</span>{" "}
            Aucun ajustement à prévoir — vos versements sont déclenchés tous les 15 jours et apparaissent ci-dessous dès leur émission.
          </p>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout History */}
        <SectionCard
          className="lg:col-span-2"
          title="Historique des versements"
          description="Vos transferts émis et à venir"
          icon={<Wallet className="w-4 h-4" />}
          flush
        >
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : payments.length === 0 ? (
            <EmptyState
              icon={<Wallet className="w-6 h-6" />}
              title="Aucun versement pour le moment"
              description="Vos premiers versements apparaîtront ici dès qu'une commande sera comptabilisée et clôturée."
            />
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
                            <p className="font-medium text-sm">
                              {new Date(p.period_start).toLocaleDateString("fr-FR")} – {new Date(p.period_end).toLocaleDateString("fr-FR")}
                            </p>
                            {p.payout_date && (
                              <p className="text-xs text-muted-foreground">
                                Versé le {new Date(p.payout_date).toLocaleDateString("fr-FR")}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{p.boutiques?.name || "—"}</TableCell>
                        <TableCell>
                          {p.status === "completed" ? (
                            <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0">
                              <CheckCircle className="w-3 h-3" /> Versé
                            </Badge>
                          ) : p.status === "pending" ? (
                            <Badge variant="outline" className="gap-1 text-secondary border-secondary/40">
                              <Clock className="w-3 h-3" /> En attente
                            </Badge>
                          ) : (
                            <Badge variant="destructive">{p.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-display font-semibold">
                          {p.status === "completed" ? "+" : ""}
                          {Number(p.amount).toFixed(2)} €
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="sm:hidden p-3 space-y-3">
                {payments.map((p: any) => (
                  <div key={p.id} className="p-3 rounded-xl bg-muted/40 space-y-2 border border-border/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.period_start).toLocaleDateString("fr-FR")} → {new Date(p.period_end).toLocaleDateString("fr-FR")}
                      </span>
                      <span className="text-sm font-display font-bold text-foreground">
                        {p.status === "completed" ? "+" : ""}
                        {Number(p.amount).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{p.boutiques?.name || "—"}</span>
                      {p.status === "completed" ? (
                        <Badge className="gap-1 bg-emerald-500/10 text-emerald-600 border-0 text-[10px]">
                          <CheckCircle className="w-3 h-3" /> Versé
                        </Badge>
                      ) : p.status === "pending" ? (
                        <Badge variant="outline" className="gap-1 text-secondary border-secondary/40 text-[10px]">
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
        </SectionCard>

        {/* Live Activity Feed */}
        <PaymentsActivityFeed
          feed={feed}
          status={rtStatus}
          onClear={clearFeed}
          boutiqueLookup={boutiqueLookup}
        />
      </div>

      {/* Revenue by Boutique */}
      <div className="mt-6">
        <SectionCard
          title="Revenus par boutique"
          description={topBoutique ? `${topBoutique.name} en tête` : "Répartition portefeuille"}
          icon={<TrendingUp className="w-4 h-4" />}
        >
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : orderRevenue.byBoutique.length === 0 ? (
            <EmptyState
              title="Pas encore de revenus"
              description="Publiez votre boutique pour commencer à générer des ventes."
            />
          ) : (
            <div className="space-y-3">
              {orderRevenue.byBoutique.map((b: any) => {
                const pct = (b.revenue / maxRev) * 100;
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground truncate">{b.name}</span>
                      <span className="font-display font-semibold tabular-nums">
                        {fmt(b.revenue)} €
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                        style={{ width: `${Math.max(pct, b.revenue > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
