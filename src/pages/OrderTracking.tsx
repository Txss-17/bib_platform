import { translateUi } from "@/lib/uiTranslation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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

import { useSEO } from "@/hooks/useSEO.ts";
import { Logo } from "@/components/Logo";
import { OrderIssueForm } from "@/components/storefront/OrderIssueForm";

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
    get label() {
      return translateUi("En attente");
    },
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    message: translateUi(
      "Votre commande a bien été enregistrée et est en attente de préparation.",
    ),
    progress: 10,
  },

  processing: {
    get label() {
      return translateUi("En préparation");
    },
    color: "bg-info/10 text-info-ink",
    icon: Package,
    message: translateUi("La boutique prépare actuellement votre commande."),
    progress: 35,
  },

  shipped: {
    get label() {
      return translateUi("Expédiée");
    },
    color: "bg-info/10 text-info-ink",
    icon: Truck,
    message: translateUi(
      "Votre commande a été expédiée et est actuellement en cours d’acheminement.",
    ),
    progress: 70,
  },

  delivered: {
    get label() {
      return translateUi("Livrée");
    },
    color: "bg-success/10 text-success-ink",
    icon: CheckCircle,
    message: translateUi("Votre commande a été livrée."),
    progress: 100,
  },

  returned: {
    get label() {
      return translateUi("Retournée");
    },
    color: "bg-destructive/10 text-destructive-ink",
    icon: RotateCcw,
    message: translateUi(
      "Le retour de votre commande est actuellement en cours de traitement.",
    ),
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
  refund_status?: string | null;
  refunded_amount_cents?: number;
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

function formatAmount(amount: number, lang: "fr" | "en") {
  return new Intl.NumberFormat(lang === "en" ? "en-IE" : "fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatOrderDate(date: string, lang: "fr" | "en") {
  return new Intl.DateTimeFormat(lang === "en" ? "en-IE" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

import { ShipmentTimeline } from "@/components/tracking/ShipmentTimeline";
export default function OrderTracking() {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);
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
    title: english ? "Order tracking" : "Suivi de commande",
    description: translateUi(
      "Suivez l'état de votre commande passée auprès d'une boutique BIB.",
    ),
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

  const isDelivered = order?.logistics_status === "delivered";

  const isReturned = order?.logistics_status === "returned";

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedOrderNumber = normalizeOrderNumber(orderNumber);

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedOrderNumber || !normalizedEmail) {
      setError(
        tx(
          translateUi(
            "Veuillez renseigner votre numéro de commande et votre adresse email.",
          ),
          translateUi("Please enter your order number and email address."),
        ),
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
      const { data, error: rpcError } = await supabase.rpc("track_order", {
        _order_number: normalizedOrderNumber,
        _customer_email: normalizedEmail,
      });

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
      const { data: refundData, error: refundStatusError } = await supabase.rpc(
        "track_order_refund_status",
        {
          _order_number: normalizedOrderNumber,
          _customer_email: normalizedEmail,
        },
      );
      const refundSummary = refundStatusError ? null : refundData?.[0];

      setOrder({
        refund_status: refundSummary?.refund_status ?? null,
        refunded_amount_cents: refundSummary?.refunded_amount_cents ?? 0,
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
        tx(
          translateUi(
            "Une erreur est survenue lors de la recherche de votre commande. Veuillez réessayer.",
          ),
          translateUi(
            "An error occurred while looking up your order. Please try again.",
          ),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const boutiqueLink = slug
    ? `/boutique/${encodeURIComponent(slug)}`
    : "/store";

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <main className="flex-1">
        <div className="mx-auto w-full max-w-lg px-4 py-8 md:py-16">
          {/* Back */}
          <Link
            to={boutiqueLink}
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {slug
              ? translateUi("Retour à la boutique")
              : translateUi("Retour à BIB Store")}
          </Link>

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-sm">
              <Package className="h-7 w-7 text-foreground" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              {english ? "Order tracking" : "Suivi de commande"}
            </h1>

            <p className="mt-1 text-muted-foreground">
              {translateUi(
                "Entrez votre numéro de commande et l'adresse email utilisée lors de votre achat.",
              )}
            </p>
          </div>

          {/* Stripe return information */}
          {sessionId && (
            <div className="mb-4 rounded-xl border border-success/30 bg-success/10 p-4">
              <div className="flex gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-success-ink" />

                <div>
                  <p className="text-sm font-semibold text-success-ink">
                    {english ? "Payment processed" : "Paiement traité"}
                  </p>

                  <p className="mt-1 text-sm leading-relaxed text-success-ink">
                    {translateUi(
                      "Votre paiement a été transmis. Utilisez votre numéro de commande pour afficher son état.",
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div>
              <Label htmlFor="order-number">
                {english ? "Order number" : "Numéro de commande"}
              </Label>

              <Input
                id="order-number"
                value={orderNumber}
                onChange={(event) => setOrderNumber(event.target.value)}
                placeholder="BIB26-XXXXXX"
                autoComplete="off"
                required
                className="mt-1 font-mono uppercase"
              />
            </div>

            <div>
              <Label htmlFor="tracking-email">
                {english
                  ? "Email used for the order"
                  : "Email utilisé lors de la commande"}
              </Label>

              <Input
                id="tracking-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={translateUi("jean@exemple.com")}
                autoComplete="email"
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}

              {english ? "Find my order" : "Rechercher ma commande"}
            </Button>
          </form>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive-ink"
            >
              {error}
            </div>
          )}

          {/* No result */}
          {searched && !loading && !order && !error && (
            <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center">
              <Package className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm font-medium text-foreground">
                {english ? "No order found." : "Aucune commande trouvée."}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {translateUi(
                  "Vérifiez votre numéro de commande et l'adresse email utilisée lors du paiement.",
                )}
              </p>
            </div>
          )}

          {/* Order result */}
          {order && status && (
            <div className="mt-6 space-y-4">
              <ShipmentTimeline
                orderNumber={order.order_number}
                email={normalizeEmail(email)}
              />
              {/* Main order card */}
              <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
                {/* Status header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {translateUi("Commande")}
                    </p>

                    <p className="font-mono font-semibold text-foreground">
                      {order.order_number}
                    </p>
                  </div>

                  <Badge className={status.color}>
                    <StatusIcon className="mr-1 h-3.5 w-3.5" />
                    {tx(
                      status.label,
                      (
                        {
                          pending: translateUi("Pending"),
                          processing: translateUi("Preparing"),
                          shipped: translateUi("Shipped"),
                          delivered: translateUi("Delivered"),
                          returned: translateUi("Returned"),
                        } as Record<string, string>
                      )[order.logistics_status] ?? status.label,
                    )}
                  </Badge>
                </div>

                {order.refund_status && order.refund_status !== "none" && (
                  <div
                    className="rounded-lg border border-warning/30 bg-warning/10 p-4"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-sm font-medium text-warning-ink">
                      {order.refund_status === "pending"
                        ? tx("Remboursement en cours", "Refund pending")
                        : order.refund_status === "refunded"
                          ? tx("Commande remboursée", "Order refunded")
                          : tx(
                              "Remboursement partiel effectué",
                              "Partial refund issued",
                            )}
                    </p>
                    {(order.refunded_amount_cents ?? 0) > 0 && (
                      <p className="mt-1 text-sm text-warning-ink">
                        {tx("Montant confirmé :", "Confirmed amount:")}{" "}
                        {formatAmount(
                          (order.refunded_amount_cents ?? 0) / 100,
                          lang,
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Status message */}
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm leading-relaxed text-foreground">
                    {tx(
                      status.message,
                      (
                        {
                          pending: translateUi(
                            "Your order has been received and is awaiting preparation.",
                          ),
                          processing: translateUi(
                            "The boutique is currently preparing your order.",
                          ),
                          shipped: translateUi(
                            "Your order has shipped and is on its way.",
                          ),
                          delivered: translateUi(
                            "Your order has been delivered.",
                          ),
                          returned: translateUi(
                            "Your order return is being processed.",
                          ),
                        } as Record<string, string>
                      )[order.logistics_status] ?? status.message,
                    )}
                  </p>
                </div>

                {/* Order details */}
                <div className="space-y-3 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {translateUi("Client")}
                    </span>

                    <span className="text-right font-medium text-foreground">
                      {order.customer_name}
                    </span>
                  </div>

                  {order.product_name && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        {translateUi("Produit")}
                      </span>

                      <span className="text-right font-medium text-foreground">
                        {order.product_name}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {translateUi("Montant")}
                    </span>

                    <span className="font-medium text-foreground">
                      {formatAmount(order.amount, lang)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Date</span>

                    <span className="text-right font-medium text-foreground">
                      {formatOrderDate(order.created_at, lang)}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="pt-2">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{translateUi("Commande reçue")}</span>
                    <span>{translateUi("Livrée")}</span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isReturned ? "bg-destructive" : "bg-success"
                      }`}
                      style={{
                        width: `${status.progress}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="mb-4 text-sm font-semibold text-foreground">
                  {english
                    ? "Report an issue with this order"
                    : "Signaler un problème avec cette commande"}
                </h2>
                <OrderIssueForm
                  orderNumber={order.order_number}
                  customerEmail={normalizeEmail(email)}
                />
              </div>

              {/* Customer service */}
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-sm font-semibold text-foreground">
                  {translateUi("Une question concernant votre commande ?")}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {translateUi(
                    "Pour toute question concernant votre commande, sa préparation, sa livraison ou un retour, contactez directement la boutique auprès de laquelle vous avez effectué votre achat.",
                  )}
                </p>

                {slug ? (
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 w-full gap-2"
                  >
                    <Link to={boutiqueLink}>
                      {translateUi("Rendez-vous sur la boutique")}
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    {translateUi(
                      "Retrouvez les coordonnées de la boutique dans votre confirmation de commande.",
                    )}
                  </p>
                )}
              </div>

              {/* BIB discovery */}
              {!isReturned && (
                <div className="rounded-xl border border-border bg-card p-5">
                  {isDelivered ? (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        {translateUi("Votre commande est arrivée.")}
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {translateUi(
                          "Découvrez d'autres boutiques sélectionnées et vérifiées par BIB.",
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        {translateUi("Découvrez l'univers BIB")}
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {translateUi(
                          "Explorez d'autres boutiques et découvrez des produits sélectionnés selon les exigences BIB.",
                        )}
                      </p>
                    </>
                  )}

                  <Button asChild className="mt-4 w-full gap-2">
                    <Link to="/store">
                      {english
                        ? "Explore boutiques"
                        : "Découvrir les boutiques"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}

              {/* BIB customer account */}
              <div className="rounded-xl border border-border bg-muted p-5">
                <p className="text-sm font-semibold text-foreground">
                  {translateUi("Retrouvez vos boutiques préférées")}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {translateUi(
                    "Activez votre espace BIB pour retrouver vos commandes, suivre vos boutiques favorites et accéder aux fonctionnalités BIB Abonné.",
                  )}
                </p>

                <p className="mt-3 text-sm font-semibold text-foreground">
                  {translateUi("BIB Abonné · 4,99 €/mois")}
                </p>

                <Button asChild variant="outline" className="mt-4 w-full gap-2">
                  <Link to="/store/signup">
                    {english ? "Activate my account" : "Activer mon compte"}
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
              aria-label={translateUi("Retour au BIB Store")}
            >
              <Logo className="h-7 w-auto" />
            </Link>

            <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground sm:items-end sm:text-right">
              <span>© {new Date().getFullYear()} Brand-In-A-Box</span>

              <Link to="/" className="transition-colors hover:text-foreground">
                Brand-In-A-Box
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
