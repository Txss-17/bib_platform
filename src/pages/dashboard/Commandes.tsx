import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

import { useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Filter,
  Package,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OrderDetailDialog } from "@/components/dashboard/OrderDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useOrderPulse } from "@/hooks/useOrderPulse";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { playCashRegisterSound } from "@/lib/notificationSound";
import type { Database } from "@/integrations/supabase/types";
import type { OrderWithProduct } from "@/hooks/useOrders";

type LogisticsStatus = Database["public"]["Enums"]["logistics_status"];

const ESCALATION_HOURS = 48;

const statusConfig: Record<
  LogisticsStatus,
  {
    label: string;
    icon: typeof Clock3;
    className: string;
    dot: string;
  }
> = {
  pending: {
    get label() {
      return translateUi("À valider");
    },
    icon: Clock3,
    className: "border-warning/30 bg-warning/10 text-warning-ink",
    dot: "bg-warning",
  },
  processing: {
    get label() {
      return translateUi("En préparation");
    },
    icon: Package,
    className: "border-info/30 bg-info/10 text-info-ink",
    dot: "bg-primary",
  },
  shipped: {
    get label() {
      return translateUi("Expédiée");
    },
    icon: Truck,
    className: "border-info/30 bg-info/10 text-info-ink",
    dot: "bg-primary",
  },
  delivered: {
    get label() {
      return translateUi("Livrée");
    },
    icon: CheckCircle2,
    className: "border-success/30 bg-success/10 text-success-ink",
    dot: "bg-success",
  },
  returned: {
    get label() {
      return translateUi("Retournée");
    },
    icon: RotateCcw,
    className: "border-destructive/30 bg-destructive/10 text-destructive-ink",
    dot: "bg-destructive",
  },
};

const statusFlow: LogisticsStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

const exportColumns = [
  {
    get header() {
      return translateUi("Commande");
    },
    accessor: (o: any) => o.order_number,
  },
  {
    get header() {
      return translateUi("Client");
    },
    accessor: (o: any) => o.customer_name,
  },
  { header: "Email", accessor: (o: any) => o.customer_email },
  {
    get header() {
      return translateUi("Produit");
    },
    accessor: (o: any) => o.products?.supplier_products?.name || "",
  },
  {
    get header() {
      return translateUi("Montant");
    },
    accessor: (o: any) => `${Number(o.amount).toFixed(2)} €`,
  },
  {
    get header() {
      return translateUi("Statut");
    },
    accessor: (o: any) =>
      statusConfig[o.logistics_status as LogisticsStatus]?.label ||
      o.logistics_status,
  },
  {
    get header() {
      return translateUi("Marché");
    },
    accessor: (o: any) => o.market,
  },
  {
    header: "Date",
    accessor: (o: any) =>
      new Date(o.created_at).toLocaleDateString(getUiLocale()),
  },
];

function formatEUR(value: number) {
  return new Intl.NumberFormat(getUiLocale(), {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function relativeTime(value: string) {
  const difference = Math.max(0, Date.now() - new Date(value).getTime());
  const minutes = Math.floor(difference / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return translateUi("À l’instant");
  if (minutes < 60) return translateUi("Il y a {v0} min", { v0: minutes });
  if (hours < 24) return translateUi("Il y a {v0} h", { v0: hours });
  return translateUi("Il y a {v0} j", { v0: days });
}

function StatusBadge({ status }: { status: LogisticsStatus }) {
  useLanguage();
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof ShoppingBag;
  variant?: "default" | "blue" | "gold" | "alert";
}) {
  useLanguage();
  const variants = {
    default: {
      card: "border-border bg-card",
      icon: "bg-muted text-foreground",
      value: "text-foreground",
    },
    blue: {
      card: "border-info/30 bg-info/10",
      icon: "bg-primary text-primary-foreground",
      value: "text-foreground",
    },
    gold: {
      card: "border-warning/30 bg-warning/10",
      icon: "bg-warning/10 text-warning-ink",
      value: "text-foreground",
    },
    alert: {
      card: "border-destructive/30 bg-destructive/10",
      icon: "bg-destructive/10 text-destructive-ink",
      value: "text-destructive-ink",
    },
  };

  const style = variants[variant];

  return (
    <section
      className={`min-w-0 rounded-2xl border p-4 transition-shadow hover:shadow-md sm:p-5 ${style.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-5 text-muted-foreground">
          {label}
        </p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p
        className={`mt-4 break-words text-2xl font-bold tracking-tight sm:text-3xl ${style.value}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  useLanguage();
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-info-ink">
            {eyebrow}
          </p>
        )}
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function Commandes() {
  useLanguage();
  const { data: orders, isLoading, error } = useOrders();
  const {
    data: boutiques = [],
    isLoading: boutiquesLoading,
    error: boutiquesError,
  } = useBoutiques();
  const updateStatus = useUpdateOrderStatus();

  const [selectedBoutique, setSelectedBoutique] = useState("all");
  const [activeTab, setActiveTab] = useState("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProduct | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const {
    feed: pulseFeed,
    status: pulseStatus,
    windowMinutes,
  } = useOrderPulse(selectedBoutique);

  useEffect(() => {
    const channel = supabase
      .channel("bib-orders-dashboard-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const orderNumber = (payload.new as any)?.order_number;
          playCashRegisterSound();
          toast({
            title: translateUi("Nouvelle commande reçue"),
            description: orderNumber
              ? `Commande ${orderNumber}`
              : "Une nouvelle commande vient d’arriver.",
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
              title: translateUi("Statut actualisé"),
              description: translateUi("{v0} : {v1}", {
                v0: orderNumber,
                v1:
                  statusConfig[newStatus as LogisticsStatus]?.label ||
                  newStatus,
              }),
            });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const scopedOrders = useMemo(
    () =>
      (orders || []).filter(
        (order) =>
          selectedBoutique === "all" || order.boutique_id === selectedBoutique,
      ),
    [orders, selectedBoutique],
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const escalationMs = ESCALATION_HOURS * 60 * 60 * 1000;

    const isOverdue = (order: OrderWithProduct) =>
      order.logistics_status === "pending" &&
      now - new Date(order.created_at).getTime() > escalationMs;

    const isUrgent = (order: OrderWithProduct) =>
      order.logistics_status === "pending" &&
      now - new Date(order.created_at).getTime() > escalationMs * 0.75;

    const pending = scopedOrders.filter(
      (order) => order.logistics_status === "pending",
    ).length;
    const processing = scopedOrders.filter(
      (order) => order.logistics_status === "processing",
    ).length;
    const shipped = scopedOrders.filter(
      (order) => order.logistics_status === "shipped",
    ).length;
    const delivered = scopedOrders.filter(
      (order) => order.logistics_status === "delivered",
    ).length;
    const returned = scopedOrders.filter(
      (order) => order.logistics_status === "returned",
    ).length;
    const overdue = scopedOrders.filter(isOverdue).length;
    const urgent = scopedOrders.filter(isUrgent).length;
    const revenue = scopedOrders
      .filter((order) => order.logistics_status !== "returned")
      .reduce((total, order) => total + Number(order.amount || 0), 0);

    return {
      total: scopedOrders.length,
      pending,
      processing,
      shipped,
      delivered,
      returned,
      overdue,
      urgent,
      revenue,
      isOverdue,
      isUrgent,
    };
  }, [scopedOrders]);

  const tabs = [
    {
      value: "priority",
      label: translateUi("À traiter"),
      count: stats.pending,
    },
    { value: "all", label: translateUi("Toutes"), count: stats.total },
    {
      value: "processing",
      label: translateUi("Préparation"),
      count: stats.processing,
    },
    { value: "shipped", label: translateUi("Expédiées"), count: stats.shipped },
    {
      value: "delivered",
      label: translateUi("Livrées"),
      count: stats.delivered,
    },
    { value: "returned", label: translateUi("Retours"), count: stats.returned },
  ];

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("fr-FR");

    return scopedOrders.filter((order) => {
      if (activeTab === "priority") {
        if (order.logistics_status !== "pending") return false;
      } else if (activeTab !== "all" && order.logistics_status !== activeTab) {
        return false;
      }

      if (!query) return true;

      const searchable = [
        order.order_number,
        order.customer_name,
        order.customer_email,
        order.products?.supplier_products?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("fr-FR");

      return searchable.includes(query);
    });
  }, [scopedOrders, activeTab, searchQuery]);

  const sortedOrders = useMemo(() => {
    if (activeTab !== "priority") return filteredOrders;

    return [...filteredOrders].sort((a, b) => {
      const priorityA = stats.isOverdue(a) ? 2 : stats.isUrgent(a) ? 1 : 0;
      const priorityB = stats.isOverdue(b) ? 2 : stats.isUrgent(b) ? 1 : 0;

      if (priorityA !== priorityB) return priorityB - priorityA;

      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, [filteredOrders, activeTab, stats]);

  const openOrder = (order: OrderWithProduct) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleStatusChange = (orderId: string, status: LogisticsStatus) => {
    updateStatus.mutate(
      { orderId, status },
      {
        onSuccess: () => {
          toast({
            title: translateUi("Statut mis à jour"),
            description: translateUi("La commande est maintenant : {v0}.", {
              v0: statusConfig[status].label,
            }),
          });
        },
        onError: (mutationError) => {
          toast({
            title: translateUi("Action impossible"),
            description:
              mutationError instanceof Error
                ? mutationError.message
                : "La mise à jour du statut a échoué.",
            variant: "destructive",
          });
        },
      },
    );
  };

  const exportOrders = (kind: "csv" | "pdf") => {
    if (!sortedOrders.length) return;

    const boutiqueName =
      selectedBoutique === "all"
        ? "Brand-In-A-Box"
        : boutiques.find((boutique) => boutique.id === selectedBoutique)
            ?.name || "Brand-In-A-Box";

    if (kind === "csv") {
      exportToCSV(sortedOrders as any, exportColumns, "commandes", {
        boutiqueName,
      });
      return;
    }

    exportToPDF(
      sortedOrders as any,
      exportColumns,
      "Rapport des commandes",
      "commandes",
      { boutiqueName },
    );
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="rounded-3xl bg-primary p-6 text-primary-foreground sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-warning-ink">
              {translateUi("BIB · Opérations")}
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              {translateUi("Cockpit Commandes")}
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/80">
              {translateUi(
                "Centralisez le suivi et la validation de vos commandes.",
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive-ink">
            {translateUi(
              "Impossible de charger les commandes. Actualisez la page et vérifiez votre connexion avant de réessayer.",
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-[1500px] space-y-7 pb-10">
        {/* Hero */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg shadow-blue-950/10 sm:p-8 lg:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[36px] border-white/[0.04]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 right-1/4 -z-10 h-64 w-64 rounded-full bg-primary/10/10 blur-3xl"
          />

          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-primary-foreground/80">
                <span className="h-2 w-2 rounded-full bg-success/20" />
                {translateUi("Espace marchand · Opérations")}
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {translateUi("Cockpit Commandes")}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-primary-foreground/80 sm:text-base">
                {translateUi(
                  "Une vue claire de vos commandes, des validations à effectuer et de leur progression logistique.",
                )}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-primary-foreground/80">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-warning-ink" />
                  {translateUi("Validation par le marchand")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-warning-ink" />
                  {translateUi("Logistique opérée par les partenaires BIB")}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:min-w-[340px] lg:justify-end">
              <Select
                value={selectedBoutique}
                onValueChange={setSelectedBoutique}
              >
                <SelectTrigger className="h-11 w-full border-white/20 bg-white/10 text-primary-foreground sm:w-[220px]">
                  <SelectValue
                    placeholder={translateUi("Toutes les boutiques")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {translateUi("Toutes les boutiques")}
                  </SelectItem>
                  {boutiques.map((boutique) => (
                    <SelectItem key={boutique.id} value={boutique.id}>
                      {boutique.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="secondary"
                className="h-11 gap-2 bg-warning/20 font-semibold text-foreground hover:bg-warning/10"
                onClick={() => {
                  setActiveTab("priority");
                  setSearchQuery("");
                }}
              >
                <AlarmClock className="h-4 w-4" />
                {translateUi("Voir les priorités")}
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShoppingBag className="h-5 w-5 text-primary-foreground/80" />
              </span>
              <div>
                <p className="text-xs text-primary-foreground/75">
                  {translateUi("Commandes visibles")}
                </p>
                <p className="mt-0.5 text-xl font-bold">
                  {isLoading ? "—" : stats.total}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20">
                <Clock3 className="h-5 w-5 text-warning-ink" />
              </span>
              <div>
                <p className="text-xs text-primary-foreground/75">
                  {translateUi("À valider")}
                </p>
                <p className="mt-0.5 text-xl font-bold">
                  {isLoading ? "—" : stats.pending}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Radio className="h-5 w-5 text-success-ink" />
              </span>
              <div>
                <p className="text-xs text-primary-foreground/75">
                  {translateUi("Flux de commandes")}
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {pulseStatus === "live"
                    ? translateUi("Connecté en temps réel")
                    : translateUi("Connexion en cours")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI grid */}
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-info-ink">
                {translateUi("Vue d’ensemble")}
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
                {translateUi("L’essentiel de votre activité")}
              </h2>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">
              {translateUi("Selon la boutique sélectionnée")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-5 h-8 w-24" />
                  <Skeleton className="mt-3 h-3 w-32" />
                </div>
              ))
            ) : (
              <>
                <MetricCard
                  label={translateUi("À traiter")}
                  value={stats.pending}
                  detail={
                    stats.overdue > 0
                      ? translateUi("{v0} dépassent 48 heures", {
                          v0: stats.overdue,
                        })
                      : translateUi("Validation marchand requise")
                  }
                  icon={AlarmClock}
                  variant={stats.overdue > 0 ? "alert" : "blue"}
                />
                <MetricCard
                  label={translateUi("En cours de logistique")}
                  value={stats.processing + stats.shipped}
                  detail={translateUi("{v0} en préparation · {v1} expédiées", {
                    v0: stats.processing,
                    v1: stats.shipped,
                  })}
                  icon={Truck}
                />
                <MetricCard
                  label={translateUi("Commandes livrées")}
                  value={stats.delivered}
                  detail={translateUi("{v0} commande(s) retournée(s)", {
                    v0: stats.returned,
                  })}
                  icon={CheckCircle2}
                />
                <MetricCard
                  label={translateUi("Montant des commandes")}
                  value={formatEUR(stats.revenue)}
                  detail={translateUi("Hors commandes marquées retournées")}
                  icon={Sparkles}
                  variant="gold"
                />
              </>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {translateUi(
              "Le montant affiché est calculé sur les commandes visibles. Il ne constitue pas à lui seul un relevé des sommes encaissées ou des versements dus au marchand.",
            )}
          </p>
        </section>

        {/* Priority and realtime */}
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10 text-warning-ink">
                    <AlarmClock className="h-4 w-4" />
                  </span>
                  <h2 className="font-bold text-foreground">
                    {stats.overdue > 0
                      ? translateUi("Validations à escalader")
                      : translateUi("Suivi des validations")}
                  </h2>
                </div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  {translateUi(
                    "Les commandes en attente doivent faire l’objet d’une décision du marchand sous 48 heures.",
                  )}
                </p>
              </div>
              {stats.overdue > 0 && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive-ink">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {stats.overdue} {translateUi("en retard")}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : stats.overdue === 0 ? (
              <div className="p-6">
                <div className="flex gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-ink" />
                  <div>
                    <p className="text-sm font-semibold text-success-ink">
                      {translateUi("Aucune commande au-delà du délai")}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-success-ink">
                      {translateUi(
                        "Continuez à vérifier les commandes en attente afin qu’elles soient prises en charge dans les temps.",
                      )}
                    </p>
                  </div>
                </div>

                {stats.urgent > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("priority")}
                    className="mt-3 flex w-full items-center justify-between rounded-xl border border-warning/30 bg-warning/10 p-3 text-left transition-colors hover:bg-warning/10"
                  >
                    <span className="text-sm font-medium text-warning-ink">
                      {stats.urgent}{" "}
                      {translateUi("validation(s) approchent du délai de 48 h")}
                    </span>
                    <ArrowRight className="h-4 w-4 text-warning-ink" />
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {scopedOrders
                  .filter(stats.isOverdue)
                  .sort(
                    (a, b) =>
                      new Date(a.created_at).getTime() -
                      new Date(b.created_at).getTime(),
                  )
                  .slice(0, 5)
                  .map((order) => (
                    <button
                      type="button"
                      key={order.id}
                      onClick={() => openOrder(order)}
                      className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-destructive/10 sm:px-5"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-muted-foreground">
                          {order.order_number}
                        </p>
                        <p className="mt-1 truncate text-sm font-semibold text-foreground">
                          {order.customer_name}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {order.products?.supplier_products?.name ||
                            translateUi("Produit non renseigné")}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-destructive-ink">
                          {relativeTime(order.created_at)}
                        </p>
                        <span className="mt-1 inline-block text-xs text-info-ink">
                          {translateUi("Examiner →")}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            )}

            <div className="border-t border-border bg-muted/70 px-5 py-3">
              <p className="text-xs leading-5 text-muted-foreground">
                {translateUi(
                  "L’escalade signale un délai dépassé ; elle ne modifie pas automatiquement le statut ni la responsabilité de traitement.",
                )}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-border p-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-info/10 text-info-ink">
                    <Radio className="h-4 w-4" />
                  </span>
                  <h2 className="font-bold text-foreground">
                    {translateUi("Activité récente")}
                  </h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {translateUi("Événements des") + " "}
                  {windowMinutes} {translateUi("dernières minutes")}
                </p>
              </div>
              <span
                className={`mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
                  pulseStatus === "live"
                    ? "bg-success"
                    : "animate-pulse bg-warning/20"
                }`}
                title={
                  pulseStatus === "live"
                    ? translateUi("Connecté")
                    : translateUi("Connexion en cours")
                }
              />
            </div>

            {pulseFeed.length === 0 ? (
              <div className="p-6">
                <div className="flex flex-col items-center py-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Radio className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {translateUi("Pas d’activité récente")}
                  </p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                    {translateUi(
                      "Les nouveaux événements apparaîtront ici lorsque le flux recevra des mises à jour.",
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pulseFeed.slice(0, 7).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 px-5 py-3.5"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        event.kind === "new" ? "bg-warning" : "bg-primary"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-5 text-foreground">
                        {event.kind === "new"
                          ? translateUi("Nouvelle commande reçue")
                          : translateUi("Statut de commande actualisé")}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {event.order_number}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {event.customer_name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleTimeString(
                        getUiLocale(),
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border px-5 py-3">
              <p className="text-xs text-muted-foreground">
                {translateUi(
                  "Les événements dépendent de la connexion au flux temps réel.",
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Orders list */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5 sm:p-6">
            <SectionHeading
              eyebrow={translateUi("Gestion opérationnelle")}
              title={translateUi("Carnet de commandes")}
              description={translateUi(
                "Recherchez une commande, examinez son détail ou ouvrez son suivi.",
              )}
              action={
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowFilters((current) => !current)}
                  >
                    <Filter className="h-4 w-4" />
                    {translateUi("Filtres")}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={!sortedOrders.length}
                      >
                        <Download className="h-4 w-4" />
                        {translateUi("Exporter")}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => exportOrders("csv")}>
                        <Download className="mr-2 h-4 w-4" />
                        {translateUi("Exporter en CSV")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportOrders("pdf")}>
                        <FileText className="mr-2 h-4 w-4" />
                        {translateUi("Exporter en PDF")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
            />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={translateUi(
                  "Rechercher par numéro, client, email ou produit…",
                )}
                className="h-11 border-border pl-9 pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label={translateUi("Effacer la recherche")}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mt-3 flex flex-col gap-3 rounded-xl border border-border bg-muted p-3 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold text-muted-foreground">
                  {translateUi("Boutique sélectionnée")}
                </span>
                <Select
                  value={selectedBoutique}
                  onValueChange={setSelectedBoutique}
                  disabled={boutiquesLoading || Boolean(boutiquesError)}
                >
                  <SelectTrigger className="h-9 w-full bg-card sm:w-[260px]">
                    <SelectValue
                      placeholder={translateUi("Toutes les boutiques")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {translateUi("Toutes les boutiques")}
                    </SelectItem>
                    {boutiques.map((boutique) => (
                      <SelectItem key={boutique.id} value={boutique.id}>
                        {boutique.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {boutiquesError && (
                  <p role="alert" className="text-xs text-destructive-ink">
                    {translateUi(
                      "Impossible de charger la liste des boutiques.",
                    )}
                  </p>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedBoutique("all");
                    setSearchQuery("");
                    setActiveTab("priority");
                  }}
                >
                  {translateUi("Réinitialiser")}
                </Button>
              </div>
            )}

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => {
                const active = activeTab === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveTab(tab.value)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-info/30 hover:bg-info/10"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs ${
                        active
                          ? "bg-white/15 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton key={item} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-8">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-info/10 text-info-ink">
                <ShoppingBag className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-base font-bold text-foreground">
                {searchQuery
                  ? translateUi("Aucune commande correspondante")
                  : activeTab === "priority"
                    ? translateUi("Aucune commande à traiter")
                    : translateUi("Aucune commande dans cette catégorie")}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {searchQuery
                  ? translateUi(
                      "Modifiez les termes de recherche ou réinitialisez les filtres.",
                    )
                  : translateUi(
                      "Les commandes correspondant à ce filtre apparaîtront ici dès qu’elles seront disponibles.",
                    )}
              </p>
              {(searchQuery || activeTab !== "priority") && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("all");
                  }}
                >
                  {translateUi("Afficher toutes les commandes")}
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/80">
                      <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground">
                        {translateUi("Commande")}
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                        {translateUi("Client / Produit")}
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                        {translateUi("Statut")}
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                        {translateUi("Marché")}
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-muted-foreground">
                        Date
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted-foreground">
                        {translateUi("Montant")}
                      </th>
                      <th className="px-4 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedOrders.map((order) => {
                      const overdue = stats.isOverdue(order);
                      const urgent = !overdue && stats.isUrgent(order);

                      return (
                        <tr
                          key={order.id}
                          className={`cursor-pointer transition-colors hover:bg-info/10 ${
                            overdue
                              ? "bg-destructive/10"
                              : urgent
                                ? "bg-warning/10"
                                : ""
                          }`}
                          onClick={() => openOrder(order)}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {overdue ? (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
                              ) : urgent ? (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-warning" />
                              ) : (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-muted" />
                              )}
                              <div>
                                <p className="font-mono text-sm font-semibold text-foreground">
                                  {order.order_number}
                                </p>
                                {overdue && (
                                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-destructive-ink">
                                    {translateUi("Délai dépassé")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="max-w-[270px] px-4 py-4">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {order.customer_name}
                            </p>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {order.products?.supplier_products?.name ||
                                translateUi("Produit non renseigné")}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <StatusBadge status={order.logistics_status} />
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              {order.market || "—"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-sm text-foreground">
                              {relativeTime(order.created_at)}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString(
                                getUiLocale(),
                              )}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span className="whitespace-nowrap text-sm font-bold text-foreground">
                              {formatEUR(Number(order.amount || 0))}
                            </span>
                          </td>

                          <td
                            className="px-4 py-4 text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label={translateUi("Actions pour {v0}", {
                                    v0: order.order_number,
                                  })}
                                  className="h-8 w-8"
                                >
                                  <span className="text-lg leading-none">
                                    ···
                                  </span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openOrder(order)}
                                >
                                  {translateUi("Voir le détail")}
                                </DropdownMenuItem>
                                {statusFlow.map((status) => (
                                  <DropdownMenuItem
                                    key={status}
                                    disabled={
                                      order.logistics_status === status ||
                                      updateStatus.isPending
                                    }
                                    onClick={() =>
                                      handleStatusChange(order.id, status)
                                    }
                                  >
                                    {translateUi("Passer en «") + " "}
                                    {statusConfig[status].label} »
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem
                                  disabled={
                                    order.logistics_status === "returned" ||
                                    updateStatus.isPending
                                  }
                                  className="text-destructive-ink focus:text-destructive-ink"
                                  onClick={() =>
                                    handleStatusChange(order.id, "returned")
                                  }
                                >
                                  {translateUi("Marquer comme retournée")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-3 p-3 md:hidden sm:p-5">
                {sortedOrders.map((order) => {
                  const overdue = stats.isOverdue(order);
                  const urgent = !overdue && stats.isUrgent(order);

                  return (
                    <article
                      key={order.id}
                      className={`rounded-2xl border p-4 ${
                        overdue
                          ? "border-destructive/30 bg-destructive/10"
                          : urgent
                            ? "border-warning/30 bg-warning/10"
                            : "border-border bg-card"
                      }`}
                    >
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => openOrder(order)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-semibold text-muted-foreground">
                              {order.order_number}
                            </p>
                            <h3 className="mt-1 truncate text-sm font-bold text-foreground">
                              {order.customer_name}
                            </h3>
                            <p className="mt-1 truncate text-xs text-muted-foreground">
                              {order.products?.supplier_products?.name ||
                                translateUi("Produit non renseigné")}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-bold text-foreground">
                            {formatEUR(Number(order.amount || 0))}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <StatusBadge status={order.logistics_status} />
                          <span className="text-xs text-muted-foreground">
                            {relativeTime(order.created_at)}
                          </span>
                        </div>

                        {(overdue || urgent) && (
                          <p
                            className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${
                              overdue
                                ? "text-destructive-ink"
                                : "text-warning-ink"
                            }`}
                          >
                            <AlarmClock className="h-3.5 w-3.5" />
                            {overdue
                              ? translateUi("Validation au-delà de 48 h")
                              : translateUi("Le délai de validation approche")}
                          </p>
                        )}
                      </button>

                      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
                        <span className="text-xs text-muted-foreground">
                          {order.market || translateUi("Marché non renseigné")}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5"
                            >
                              Actions
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openOrder(order)}>
                              {translateUi("Voir le détail")}
                            </DropdownMenuItem>
                            {statusFlow.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                disabled={
                                  order.logistics_status === status ||
                                  updateStatus.isPending
                                }
                                onClick={() =>
                                  handleStatusChange(order.id, status)
                                }
                              >
                                {translateUi("Passer en «") + " "}
                                {statusConfig[status].label} »
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              disabled={
                                order.logistics_status === "returned" ||
                                updateStatus.isPending
                              }
                              className="text-destructive-ink focus:text-destructive-ink"
                              onClick={() =>
                                handleStatusChange(order.id, "returned")
                              }
                            >
                              {translateUi("Marquer comme retournée")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex flex-col justify-between gap-2 border-t border-border bg-muted/70 px-5 py-3 sm:flex-row sm:items-center">
            <p className="text-xs text-muted-foreground">
              {sortedOrders.length}{" "}
              {translateUi("commande(s) affichée(s) sur") + " "}
              {stats.total}
            </p>
            <p className="text-xs text-muted-foreground">
              {translateUi(
                "Les changements de statut sont soumis aux règles de validation.",
              )}
            </p>
          </div>
        </section>

        {/* Operating model reminder */}
        <section className="rounded-2xl border border-info/30 bg-info/10 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {translateUi("Le cadre opérationnel BIB")}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {translateUi(
                  "Le marchand reste le vendeur juridique et doit prendre les décisions qui lui incombent, notamment la validation de la commande. L’expédition est opérée dans le cadre logistique organisé par BIB et ses partenaires. Les statuts affichés servent au suivi opérationnel ; ils ne remplacent pas les obligations contractuelles ou légales des parties.",
                )}
              </p>
            </div>
          </div>
        </section>

        <OrderDetailDialog
          order={selectedOrder}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      </div>
    </DashboardLayout>
  );
}
