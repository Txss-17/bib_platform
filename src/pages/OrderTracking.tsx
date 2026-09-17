import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
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

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "returned";

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ElementType;
  message: string;
  progress: number;
}

const STATUS_MAP: Record<OrderStatus, StatusConfig> = {
  pending: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    message:
      "Votre commande a bien été enregistrée et est en attente de préparation.",
    progress: 10,
  },

  processing: {
    label: "En préparation",
    color: "bg-blue-100 text-blue-800",
    icon: Package,
    message:
      "La boutique prépare actuellement votre commande.",
    progress: 35,
  },

  shipped: {
    label: "Expédiée",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
    message:
      "Votre commande a été expédiée et est actuellement en cours d’acheminement.",
    progress: 70,
  },

  delivered: {
    label: "Livrée",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    message:
      "Votre commande a été livrée.",
    progress: 100,
  },

  returned: {
    label: "Retournée",
    color: "bg-red-100 text-red-800",
    icon: RotateCcw,
    message:
      "Le retour de votre commande est actuellement en cours de traitement.",
    progress: 100,
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

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOrderNumber(value: string) {
  return value.trim().toUpperCase();
}

function getStatusConfig(status: string): StatusConfig {
  if (status in STATUS_MAP) {
    return STATUS_MAP[status as OrderStatus];
  }

  return STATUS_MAP.pending;
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatOrderDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function OrderTracking() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");
  const emailFromUrl = searchParams.get("email");

  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState(emailFromUrl || "");

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: "Suivi de commande",
    description:
      "Suivez l'état de votre commande passée auprès d'une boutique BIB.",
  });

  /**
   * Le paiement Stripe redirige vers cette page avec :
   *
   * ?session_id={CHECKOUT_SESSION_ID}&email=...
   *
   * L'email est prérempli automatiquement.
   *
   * Le session_id est conservé pour permettre au backend
   * de relier ultérieurement directement la session Stripe
   * à la commande, sans exposer cette logique au frontend.
   */
  useEffect(() => {
    if (emailFromUrl) {
      setEmail(normalizeEmail(emailFromUrl));
    }
  }, [emailFromUrl]);

  const status = useMemo(() => {
    if (!order) return null;
    return getStatusConfig(order.logistics_status);
  }, [order]);

  const StatusIcon = status?.icon || Clock;

  const isDelivered =
    order?.logistics_status === "delivered";

  const isReturned =
    order?.logistics_status === "returned";

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedOrderNumber =
      normalizeOrderNumber(orderNumber);

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedOrderNumber || !normalizedEmail) {
      setError(
        "Veuillez renseigner votre numéro de commande et votre adresse email.",
      );
      setOrder(null);
      setSearched(true);
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);
    setSearched(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "track_order",
        {
          _order_number: normalizedOrderNumber,
          _customer_email: normalizedEmail,
        },
      );

      if (rpcError) {
        throw rpcError;
      }

      if (!data || data.length === 0) {
        return;
      }

      const row = data[0];

      /**
       * Le RPC reste la source de vérité pour le suivi.
       *
       * On ne récupère pas directement une commande par son ID
       * depuis le navigateur afin de ne pas contourner la logique
       * d'autorisation du RPC.
       */
      setOrder({
        order_number: row.order_number,
        customer_name: row.customer_name,
        amount: Number(row.amount ?? 0),
        logistics_status: row.logistics_status,
        created_at: row.created_at,
        product_name: row.product_name ?? null,
      });
    } catch (err) {
      console.error("Order tracking error:", err);

      setError(
        "Une erreur est survenue lors de la recherche de votre commande. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  };

  const boutiqueLink = slug
    ? `/boutique/${encodeURIComponent(slug)}`
    : "/store";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1">
        <div className="mx-auto w-full max-w-lg px-4 py-8 md:py-16">
          {/* Back */}
          <Link
            to={boutiqueLink}
            className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {slug
              ? "Retour à la boutique"
              : "Retour à BIB Store"}
          </Link>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Package className="h-7 w-7 text-gray-700" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Suivi de commande
            </h1>

            <p className="mt-1 text-gray-500">
              Entrez votre numéro de commande et l'adresse
              email utilisée lors de votre achat.
            </p>
          </div>

          {/* Stripe return information */}
          {sessionId && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Paiement traité
                  </p>

                  <p className="mt-1 text-sm leading-relaxed text-green-800">
                    Votre paiement a été transmis. Utilisez
                    votre numéro de commande pour afficher
                    son état.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div>
              <Label htmlFor="order-number">
                Numéro de commande
              </Label>

              <Input
                id="order-number"
                value={orderNumber}
                onChange={(event) =>
                  setOrderNumber(event.target.value)
                }
                placeholder="BIB26-XXXXXX"
                autoComplete="off"
                required
                className="mt-1 font-mono uppercase"
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
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="jean@exemple.com"
                autoComplete="email"
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}

              Rechercher ma commande
            </Button>
          </form>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* No result */}
          {searched &&
            !loading &&
            !order &&
            !error && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-center">
                <Package className="mx-auto h-8 w-8 text-gray-300" />

                <p className="mt-3 text-sm font-medium text-gray-700">
                  Aucune commande trouvée.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Vérifiez votre numéro de commande et
                  l'adresse email utilisée lors du paiement.
                </p>
              </div>
            )}

          {/* Order result */}
          {order && status && (
            <div className="mt-6 space-y-4">
              {/* Main order card */}
              <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
                    <StatusIcon className="mr-1 h-3.5 w-3.5" />
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
                <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Client
                    </span>

                    <span className="text-right font-medium text-gray-900">
                      {order.customer_name}
                    </span>
                  </div>

                  {order.product_name && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">
                        Produit
                      </span>

                      <span className="text-right font-medium text-gray-900">
                        {order.product_name}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Montant
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatAmount(order.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Date
                    </span>

                    <span className="text-right font-medium text-gray-900">
                      {formatOrderDate(order.created_at)}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="pt-2">
                  <div className="mb-1 flex justify-between text-xs text-gray-400">
                    <span>Commande reçue</span>
                    <span>Livrée</span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isReturned
                          ? "bg-red-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${status.progress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Customer service */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
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
                    <Link to={boutiqueLink}>
                      Rendez-vous sur la boutique
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <p className="mt-4 text-xs leading-relaxed text-gray-400">
                    Retrouvez les coordonnées de la boutique
                    dans votre confirmation de commande.
                  </p>
                )}
              </div>

              {/* BIB discovery */}
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
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}

              {/* BIB customer account */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="text-sm font-semibold text-gray-900">
                  Retrouvez vos boutiques préférées
                </p>

                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Activez votre espace BIB pour retrouver
                  vos commandes, suivre vos boutiques
                  favorites et accéder aux fonctionnalités
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
                  <Link to="/store/signup">
                    Activer mon compte
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* BIB Store footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link
              to="/store"
              className="inline-flex items-center"
              aria-label="Retour au BIB Store"
            >
              <Logo className="h-7 w-auto" />
            </Link>

            <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground sm:items-end sm:text-right">
              <span>
                © {new Date().getFullYear()} Brand-In-A-Box
              </span>

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
}}
