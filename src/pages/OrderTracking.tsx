import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Package,
  Loader2,
  Truck,
  CheckCircle,
  Clock,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { Logo } from "@/components/Logo";

const STATUS_MAP: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ElementType;
    message: string;
  }
> = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    message:
      "Votre commande a bien été enregistrée et est en attente de préparation.",
  },
  processing: {
    label: "En préparation",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
    message:
      "La boutique prépare actuellement votre commande.",
  },
  shipped: {
    label: "Expédiée",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
    message:
      "Votre commande a été expédiée et est actuellement en cours d’acheminement.",
  },
  delivered: {
    label: "Livrée",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    message:
      "Votre commande a été livrée.",
  },
  returned: {
    label: "Retournée",
    color: "bg-red-100 text-red-800",
    icon: RotateCcw,
    message:
      "Le retour de votre commande est actuellement en cours de traitement.",
  },
};

interface OrderResult {
  id?: string;
  order_number: string;
  customer_name: string;
  amount: number;
  logistics_status: string;
  created_at: string;
  product_name: string | null;
}

export default function OrderTracking() {
  const { slug } = useParams<{ slug: string }>();

  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: "Suivi de commande",
    description:
      "Suivez l'état de votre commande en temps réel.",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "track_order",
        {
          _order_number: orderNumber.trim(),
          _customer_email: email.trim(),
        },
      );

      if (rpcError) {
        throw rpcError;
      }

      if (data && data.length > 0) {
        const row = data[0];

        const { data: orderRow } = await supabase
          .from("orders")
          .select("id")
          .eq("order_number", row.order_number)
          .eq(
            "customer_email",
            email.trim().toLowerCase(),
          )
          .maybeSingle();

        setOrder({
          id: orderRow?.id,
          order_number: row.order_number,
          customer_name: row.customer_name,
          amount: Number(row.amount),
          logistics_status: row.logistics_status,
          created_at: row.created_at,
          product_name: row.product_name,
        });
      }
    } catch (err) {
      console.error("Order tracking error:", err);
      setError(
        "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  const status = order
    ? STATUS_MAP[order.logistics_status] ||
      STATUS_MAP.pending
    : null;

  const StatusIcon = status?.icon || Clock;

  const progressWidth =
    order?.logistics_status === "pending"
      ? "10%"
      : order?.logistics_status === "processing"
        ? "35%"
        : order?.logistics_status === "shipped"
          ? "70%"
          : order?.logistics_status === "delivered"
            ? "100%"
            : "10%";

  const isDelivered =
    order?.logistics_status === "delivered";

  const isReturned =
    order?.logistics_status === "returned";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <div className="max-w-lg mx-auto w-full px-4 py-8 md:py-16">
          {slug && (
            <Link
              to={`/boutique/${slug}`}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la boutique
            </Link>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-white shadow-sm mx-auto flex items-center justify-center mb-4">
              <Package className="w-7 h-7 text-gray-700" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Suivi de commande
            </h1>

            <p className="text-gray-500 mt-1">
              Entrez votre numéro de commande et votre
              email pour suivre votre colis.
            </p>
          </div>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
          >
            <div>
              <Label htmlFor="order-number">
                Numéro de commande
              </Label>

              <Input
                id="order-number"
                value={orderNumber}
                onChange={(e) =>
                  setOrderNumber(e.target.value)
                }
                placeholder="BIB26-XXXXXX"
                required
                className="mt-1 font-mono"
              />
            </div>

            <div>
              <Label htmlFor="tracking-email">
                Email utilisé lors de la commande
              </Label>

              <Input
                id="tracking-email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="jean@exemple.com"
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}

              Rechercher
            </Button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* No result */}
          {searched &&
            !loading &&
            !order &&
            !error && (
              <div className="mt-6 text-center text-gray-500">
                <p>
                  Aucune commande trouvée avec ces
                  informations.
                </p>

                <p className="text-sm mt-1">
                  Vérifiez votre numéro de commande et
                  votre email.
                </p>
              </div>
            )}

          {/* Order result */}
          {order && status && (
            <div className="mt-6 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
                {/* Status header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      Commande
                    </p>

                    <p className="font-mono font-semibold text-gray-900">
                      {order.order_number}
                    </p>
                  </div>

                  <Badge className={status.color}>
                    <StatusIcon className="w-3.5 h-3.5 mr-1" />
                    {status.label}
                  </Badge>
                </div>

                {/* Status message */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm leading-relaxed text-gray-700">
                    {status.message}
                  </p>
                </div>

                {/* Order details */}
                <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Client
                    </span>

                    <span className="font-medium text-gray-900 text-right">
                      {order.customer_name}
                    </span>
                  </div>

                  {order.product_name && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">
                        Produit
                      </span>

                      <span className="font-medium text-gray-900 text-right">
                        {order.product_name}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Montant
                    </span>

                    <span className="font-medium text-gray-900">
                      {order.amount.toFixed(2)} €
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Date
                    </span>

                    <span className="font-medium text-gray-900 text-right">
                      {new Date(
                        order.created_at,
                      ).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Commande reçue</span>
                    <span>Livrée</span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{
                        width: progressWidth,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Customer service */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-sm font-semibold text-gray-900">
                  Une question concernant votre commande ?
                </p>

                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Pour toute question concernant votre
                  commande, sa préparation, sa livraison ou
                  un retour, contactez directement la
                  boutique auprès de laquelle vous avez
                  effectué votre achat.
                </p>

                {slug ? (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 w-full gap-2"
                  >
                    <Link to={`/boutique/${slug}`}>
                      Rendez-vous sur la boutique
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                ) : (
                  <p className="mt-4 text-xs leading-relaxed text-gray-400">
                    Vous pouvez retrouver les coordonnées
                    ou le site utilisé pour votre commande
                    dans votre confirmation de commande.
                  </p>
                )}
              </div>

              {/* Post-order conversion */}
              {!isReturned && (
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  {isDelivered ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900">
                        Votre commande est arrivée.
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-gray-500">
                        Découvrez d'autres boutiques
                        sélectionnées et vérifiées par BIB.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-900">
                        Découvrez l'univers BIB
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-gray-500">
                        Explorez d'autres boutiques et
                        découvrez des produits sélectionnés
                        selon les exigences BIB.
                      </p>
                    </>
                  )}

                  <Button
                    asChild
                    className="mt-4 w-full gap-2"
                  >
                    <Link to="/store">
                      Découvrir les boutiques
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              )}

              {/* Subscription conversion */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-900">
                  Retrouvez vos boutiques préférées
                </p>

                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Activez votre espace BIB pour suivre vos
                  boutiques favorites, retrouver vos
                  commandes et profiter des fonctionnalités
                  BIB Abonné.
                </p>

                <p className="mt-3 text-sm font-semibold text-gray-900">
                  BIB Abonné · 4,99 €/mois
                </p>

                <Button
                  asChild
                  variant="outline"
                  className="mt-4 w-full gap-2"
                >
                  <Link to="/signup">
                    Activer mon compte
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Marketplace footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link
              to="/store"
              className="inline-flex items-center"
              aria-label="Retour au marketplace BIB"
            >
              <Logo className="h-7 w-auto" />
            </Link>

            <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground sm:items-end sm:text-right">
              <span>© 2026 Brand-In-A-Box</span>

              <Link
                to="/"
                className="transition-colors hover:text-foreground"
              >
                Brand-In-A-Box
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
