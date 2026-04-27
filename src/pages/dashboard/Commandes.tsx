import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ShoppingBag,
  MoreHorizontal,
  Download,
  RotateCcw,
  Search,
  FileText,
  AlarmClock,
  Radio,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useBoutiques } from "@/hooks/useBoutiques";
import { playCashRegisterSound } from "@/lib/notificationSound";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { OrderDetailDialog } from "@/components/dashboard/OrderDetailDialog";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { OrderWithProduct } from "@/hooks/useOrders";
import {
  PageHeader,
  SectionCard,
  KpiTile,
  KpiTileSkeleton,
  EmptyState,
  RealtimeStatusPill,
} from "@/components/dashboard/shared";
import { useOrderPulse } from "@/hooks/useOrderPulse";
import { cn } from "@/lib/utils";

type LogisticsStatus = Database["public"]["Enums"]["logistics_status"];

const statusConfig: Record<
  LogisticsStatus,
  { label: string; icon: React.ElementType; tone: string }
> = {
  pending: { label: "En attente", icon: Clock, tone: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  processing: { label: "En préparation", icon: Package, tone: "bg-sky-500/10 text-sky-600 border-sky-500/20" },
  shipped: { label: "Expédié", icon: Truck, tone: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  delivered: { label: "Livré", icon: CheckCircle, tone: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  returned: { label: "Retourné", icon: AlertCircle, tone: "bg-destructive/10 text-destructive border-destructive/20" },
};

const statusFlow: LogisticsStatus[] = ["pending", "processing", "shipped", "delivered"];

function StatusBadge({ status }: { status: LogisticsStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
        config.tone,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

const orderExportColumns = [
  { header: "N° Commande", accessor: (o: any) => o.order_number },
  { header: "Client", accessor: (o: any) => o.customer_name },
  { header: "Email", accessor: (o: any) => o.customer_email },
  { header: "Produit", accessor: (o: any) => o.products?.supplier_products?.name || "" },
  { header: "Montant", accessor: (o: any) => Number(o.amount).toFixed(2) + " €" },
  { header: "Statut", accessor: (o: any) => statusConfig[o.logistics_status as LogisticsStatus]?.label || o.logistics_status },
  { header: "Marché", accessor: (o: any) => o.market },
  { header: "Date", accessor: (o: any) => new Date(o.created_at).toLocaleDateString("fr-FR") },
];

const ESCALATION_HOURS = 48;

function relativeTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  return `il y a ${days} j`;
}

export default function Commandes() {
  const { data: orders, isLoading, error } = useOrders();
  const { data: boutiques = [] } = useBoutiques();
  const updateStatus = useUpdateOrderStatus();
  const [selectedBoutique, setSelectedBoutique] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProduct | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const { feed: pulseFeed, status: pulseStatus, windowMinutes } = useOrderPulse(selectedBoutique);

  // Realtime side-effects: cash register sound + toasts
  useEffect(() => {
    const channel = supabase
      .channel("orders-side-effects")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const orderNumber = (payload.new as any)?.order_number;
          playCashRegisterSound();
          toast({
            title: "💰 Nouvelle commande !",
            description: `Commande ${orderNumber || ""} reçue`,
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const oldStatus = (payload.old as any)?.logistics_status;
          const newStatus = (payload.new as any)?.logistics_status;
          const orderNumber = (payload.new as any)?.order_number;
          if (oldStatus !== newStatus && newStatus && orderNumber) {
            toast({
              title: "📦 Statut mis à jour",
              description: `Commande ${orderNumber} : ${statusConfig[newStatus as LogisticsStatus]?.label || newStatus}`,
            });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openOrderDetail = (order: OrderWithProduct) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const scoped = useMemo(
    () =>
      (orders || []).filter(
        (o) => selectedBoutique === "all" || o.boutique_id === selectedBoutique,
      ),
    [orders, selectedBoutique],
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const escalationMs = ESCALATION_HOURS * 3600_000;
    const isOverdue = (o: OrderWithProduct) =>
      o.logistics_status === "pending" &&
      now - new Date(o.created_at).getTime() > escalationMs;
    const isUrgent = (o: OrderWithProduct) =>
      o.logistics_status === "pending" &&
      now - new Date(o.created_at).getTime() > (escalationMs * 0.75);
    return {
      total: scoped.length,
      pending: scoped.filter((o) => o.logistics_status === "pending").length,
      processing: scoped.filter((o) => o.logistics_status === "processing").length,
      shipped: scoped.filter((o) => o.logistics_status === "shipped").length,
      delivered: scoped.filter((o) => o.logistics_status === "delivered").length,
      returned: scoped.filter((o) => o.logistics_status === "returned").length,
      overdue: scoped.filter(isOverdue).length,
      urgent: scoped.filter(isUrgent).length,
      revenue: scoped
        .filter((o) => o.logistics_status !== "returned")
        .reduce((s, o) => s + Number(o.amount), 0),
      isOverdue,
      isUrgent,
    };
  }, [scoped]);

  const tabs = [
    { value: "priority", label: "À traiter", icon: AlarmClock, count: stats.pending },
    { value: "all", label: "Toutes", icon: ShoppingBag, count: stats.total },
    { value: "processing", label: "En préparation", icon: Package, count: stats.processing },
    { value: "shipped", label: "En livraison", icon: Truck, count: stats.shipped },
    { value: "delivered", label: "Livrées", icon: CheckCircle, count: stats.delivered },
    { value: "returned", label: "Retournées", icon: RotateCcw, count: stats.returned },
  ];

  const filteredOrders = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return scoped.filter((order) => {
      if (activeTab === "priority") {
        if (order.logistics_status !== "pending") return false;
      } else if (activeTab !== "all" && order.logistics_status !== activeTab) {
        return false;
      }
      if (
        query &&
        !order.order_number.toLowerCase().includes(query) &&
        !order.customer_name.toLowerCase().includes(query) &&
        !order.customer_email.toLowerCase().includes(query)
      )
        return false;
      return true;
    });
  }, [scoped, activeTab, searchQuery]);

  // Priority-first sort: overdue, then urgent, then most recent
  const sortedOrders = useMemo(() => {
    if (activeTab !== "priority") return filteredOrders;
    return [...filteredOrders].sort((a, b) => {
      const aO = stats.isOverdue(a) ? 2 : stats.isUrgent(a) ? 1 : 0;
      const bO = stats.isOverdue(b) ? 2 : stats.isUrgent(b) ? 1 : 0;
      if (aO !== bO) return bO - aO;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filteredOrders, activeTab, stats]);

  const handleStatusChange = (orderId: string, newStatus: LogisticsStatus) => {
    updateStatus.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () =>
          toast({
            title: "Statut mis à jour",
            description: `Commande passée en "${statusConfig[newStatus].label}"`,
          }),
        onError: () =>
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour le statut",
            variant: "destructive",
          }),
      },
    );
  };

  const fmtEUR = (n: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  const exportNow = (kind: "csv" | "pdf") => {
    const bName =
      selectedBoutique !== "all"
        ? boutiques.find((b) => b.id === selectedBoutique)?.name
        : undefined;
    if (!sortedOrders?.length) return;
    if (kind === "csv") {
      exportToCSV(sortedOrders as any, orderExportColumns, "commandes", {
        boutiqueName: bName || "Brand-In-A-Box",
      });
    } else {
      exportToPDF(
        sortedOrders as any,
        orderExportColumns,
        "Rapport des Commandes",
        "commandes",
        { boutiqueName: bName || "Brand-In-A-Box" },
      );
    }
  };

  if (error) {
    return (
      <DashboardLayout title="">
        <PageHeader
          eyebrow="Operations"
          title="Cockpit Commandes"
          subtitle="Pilotez vos commandes en temps réel."
        />
        <SectionCard title="Erreur">
          <p className="text-destructive">
            Une erreur est survenue lors du chargement des commandes.
          </p>
        </SectionCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="">
      <PageHeader
        eyebrow="Operations"
        title="Cockpit Commandes"
        subtitle="Vendez. Brand-In-A-Box opère. Vous gardez la relation client. Escalation à 48 h."
        actions={
          <>
            <Select value={selectedBoutique} onValueChange={setSelectedBoutique}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Toutes les boutiques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les boutiques</SelectItem>
                {boutiques.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => exportNow("csv")}
              disabled={!sortedOrders?.length}
            >
              <Download className="w-4 h-4" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => exportNow("pdf")}
              disabled={!sortedOrders?.length}
            >
              <FileText className="w-4 h-4" /> PDF
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {isLoading ? (
          <>
            <KpiTileSkeleton tone="primary" />
            <KpiTileSkeleton />
            <KpiTileSkeleton />
            <KpiTileSkeleton tone="gold" />
          </>
        ) : (
          <>
            <KpiTile
              tone="primary"
              label="À traiter"
              value={stats.pending}
              icon={<AlarmClock className="w-5 h-5" />}
              hint={
                stats.overdue > 0
                  ? `${stats.overdue} en escalation`
                  : "Sous 48 h"
              }
            />
            <KpiTile
              label="En logistique"
              value={stats.processing + stats.shipped}
              icon={<Truck className="w-5 h-5" />}
              hint={`${stats.shipped} expédiées`}
            />
            <KpiTile
              label="Livrées"
              value={stats.delivered}
              icon={<CheckCircle className="w-5 h-5" />}
              hint={
                stats.returned > 0
                  ? `${stats.returned} retours`
                  : "Aucun retour"
              }
            />
            <KpiTile
              tone="gold"
              label="CA encaissé"
              value={fmtEUR(stats.revenue)}
              icon={<Sparkles className="w-5 h-5" />}
              hint="Total période visible"
            />
          </>
        )}
      </div>

      {/* Escalation alert + Realtime feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Escalation banner / context */}
        <SectionCard
          className="lg:col-span-2"
          title={
            stats.overdue > 0
              ? "Commandes en escalation"
              : "Aucune escalation en cours"
          }
          description={
            stats.overdue > 0
              ? `Ces commandes dépassent ${ESCALATION_HOURS} h sans validation : passez-les en préparation au plus vite.`
              : `Toutes vos commandes sont traitées sous le délai de ${ESCALATION_HOURS} h.`
          }
          icon={<AlarmClock className="w-4 h-4" />}
        >
          {stats.overdue === 0 ? (
            <EmptyState
              icon={<CheckCircle className="w-6 h-6" />}
              title="Tout est sous contrôle"
              description={`Aucune commande ne dépasse les ${ESCALATION_HOURS} h sans validation.`}
            />
          ) : (
            <ul className="divide-y divide-border/60">
              {scoped
                .filter(stats.isOverdue)
                .slice(0, 5)
                .map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-3 py-3 cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors"
                    onClick={() => openOrderDetail(o)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-mono text-muted-foreground">
                        {o.order_number}
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {o.customer_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-destructive font-medium">
                        {relativeTime(o.created_at)}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(o.id, "processing");
                        }}
                      >
                        Traiter
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Flux en direct"
          description={`Activité commandes sur les ${windowMinutes} dernières minutes`}
          icon={<Radio className="w-4 h-4" />}
          actions={<RealtimeStatusPill status={pulseStatus} />}
        >
          {pulseFeed.length === 0 ? (
            <EmptyState
              icon={<Radio className="w-6 h-6" />}
              title="Pas d'activité récente"
              description="Les nouvelles commandes et changements de statut apparaîtront ici en temps réel."
            />
          ) : (
            <ul className="divide-y divide-border/60 -mt-2">
              {pulseFeed.slice(0, 10).map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between py-2.5 gap-3 animate-fade-in"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        e.kind === "new" ? "bg-secondary" : "bg-sky-500",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {e.kind === "new" ? (
                          <>
                            Nouvelle commande{" "}
                            <span className="font-mono text-xs">
                              {e.order_number}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-mono text-xs">
                              {e.order_number}
                            </span>{" "}
                            →{" "}
                            <span className="font-medium">
                              {statusConfig[e.logistics_status as LogisticsStatus]?.label ||
                                e.logistics_status}
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {e.customer_name}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(e.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Filter chips + search */}
      <SectionCard
        title="Carnet de commandes"
        description="Filtrez par statut, recherchez par n° de commande, client ou email."
        icon={<ShoppingBag className="w-4 h-4" />}
        actions={
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="N° ou client…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.value;
            return (
              <Button
                key={t.value}
                type="button"
                variant={active ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "h-8 rounded-full text-xs gap-1.5",
                  t.value === "priority" && stats.overdue > 0 && !active && "border-destructive/40 text-destructive",
                )}
                onClick={() => setActiveTab(t.value)}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                <Badge
                  variant="secondary"
                  className="ml-0.5 h-5 min-w-[20px] px-1.5 text-[10px]"
                >
                  {t.count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-6 h-6" />}
            title={searchQuery ? "Aucun résultat" : "Aucune commande"}
            description={
              searchQuery
                ? "Essayez un autre n° de commande, client ou email."
                : "Vos commandes apparaîtront ici dès que vos clients passeront leurs premières commandes."
            }
            action={
              !searchQuery && stats.total === 0 ? (
                <Button asChild className="gap-1.5">
                  <a href="/dashboard/boutiques">
                    <PlusCircle className="w-4 h-4" />
                    Configurer ma boutique
                  </a>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Commande</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Marché</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order) => {
                    const overdue = stats.isOverdue(order);
                    const urgent = !overdue && stats.isUrgent(order);
                    return (
                      <TableRow
                        key={order.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/40 transition-colors",
                          overdue && "bg-destructive/5",
                          urgent && !overdue && "bg-amber-500/5",
                        )}
                        onClick={() => openOrderDetail(order)}
                      >
                        <TableCell className="font-mono text-sm font-medium">
                          <div className="flex items-center gap-1.5">
                            {overdue && (
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                            )}
                            {order.order_number}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {order.products?.supplier_products?.name || "Produit inconnu"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.logistics_status} />
                        </TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          <span className="px-2 py-0.5 rounded bg-muted text-xs font-medium">
                            {order.market}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {relativeTime(order.created_at)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(order.amount).toFixed(2)} €
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {statusFlow.map((s) => (
                                <DropdownMenuItem
                                  key={s}
                                  disabled={order.logistics_status === s}
                                  onClick={() => handleStatusChange(order.id, s)}
                                >
                                  {statusConfig[s].label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem
                                className="text-destructive"
                                disabled={order.logistics_status === "returned"}
                                onClick={() => handleStatusChange(order.id, "returned")}
                              >
                                Marquer retourné
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-2">
              {sortedOrders.map((order) => {
                const overdue = stats.isOverdue(order);
                return (
                  <div
                    key={order.id}
                    className={cn(
                      "rounded-xl border p-3 cursor-pointer transition-colors",
                      overdue
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border/60 bg-card hover:bg-muted/30",
                    )}
                    onClick={() => openOrderDetail(order)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
                          {overdue && (
                            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                          )}
                          {order.order_number}
                        </p>
                        <p className="text-sm font-medium text-foreground truncate">
                          {order.products?.supplier_products?.name || "Produit inconnu"}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {statusFlow.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              disabled={order.logistics_status === s}
                              onClick={() => handleStatusChange(order.id, s)}
                            >
                              {statusConfig[s].label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={order.logistics_status === "returned"}
                            onClick={() => handleStatusChange(order.id, "returned")}
                          >
                            Marquer retourné
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={order.logistics_status} />
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {order.customer_name}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-foreground">
                        {Number(order.amount).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium">
                        {order.market}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {relativeTime(order.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </SectionCard>

      <OrderDetailDialog
        order={selectedOrder}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </DashboardLayout>
  );
}
