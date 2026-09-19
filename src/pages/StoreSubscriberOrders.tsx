import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderItem = {
  id: string;
  name: string;
  image?: string | null;
  quantity: number;
};

type StoreOrder = {
  id: string;
  reference: string;
  boutiqueName: string;
  boutiqueSlug?: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-muted text-foreground",
  processing: "bg-muted text-foreground",
  shipped: "bg-muted text-foreground",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const FILTERS = [
  { value: "all", label: "Toutes" },
  { value: "active", label: "En cours" },
  { value: "delivered", label: "Livrées" },
  { value: "cancelled", label: "Annulées" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export default function StoreSubscriberOrders() {
  const [orders] = useState<StoreOrder[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.reference.toLowerCase().includes(normalizedSearch) ||
        order.boutiqueName.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" &&
          !["delivered", "cancelled"].includes(order.status)) ||
        (filter === "delivered" && order.status === "delivered") ||
        (filter === "cancelled" && order.status === "cancelled");

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            BIB Store
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Mes commandes
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Retrouvez l'historique des commandes associées à votre espace
            abonné BIB.
          </p>
        </div>

        {/* Filters */}
        <section className="mb-8 rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une commande..."
                className="h-11 w-full rounded-full border bg-background pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filter === item.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Orders */}
        {orders.length === 0 ? (
          <EmptyOrders />
        ) : filteredOrders.length === 0 ? (
          <NoResults />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function OrderCard({ order }: { order: StoreOrder }) {
  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(order.createdAt));

  const totalItems = order.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <article className="overflow-hidden rounded-2xl border bg-card">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">
              {order.reference}
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASSES[order.status]}`}
            >
              {STATUS_LABELS[order.status]}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formattedDate}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {totalItems}{" "}
              {totalItems > 1 ? "articles" : "article"}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-muted-foreground">
            Total
          </p>

          <p className="mt-1 text-lg font-semibold">
            {order.total.toFixed(2).replace(".", ",")} €
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="p-5">
        <div className="flex flex-wrap gap-3">
          {order.items.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2"
            >
              <div className="h-12 w-12 overflow-hidden rounded-lg bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="max-w-[180px]">
                <p className="truncate text-sm font-medium">
                  {item.name}
                </p>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Quantité : {item.quantity}
                </p>
              </div>
            </div>
          ))}

          {order.items.length > 4 && (
            <div className="flex items-center rounded-xl bg-muted/50 px-4 text-sm text-muted-foreground">
              +{order.items.length - 4} autres
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Boutique
          </p>

          <p className="mt-0.5 text-sm font-medium">
            {order.boutiqueName}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {order.boutiqueSlug && (
            <Link
              to={`/boutique/${order.boutiqueSlug}`}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Voir la boutique
            </Link>
          )}

          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Détails
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyOrders() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border bg-card px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        Aucune commande
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Vos commandes apparaîtront ici lorsqu'une commande sera associée à
        votre espace BIB.
      </p>

      <Link
        to="/store/products"
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Découvrir les produits
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function NoResults() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border bg-card px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        Aucune commande trouvée
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Aucune commande ne correspond à votre recherche ou au filtre
        sélectionné.
      </p>
    </div>
  );
}
