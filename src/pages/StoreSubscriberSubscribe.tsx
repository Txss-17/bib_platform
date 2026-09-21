import {
  useEffect,
  useMemo,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Check,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  useBibSubscriberSubscription,
  useUserSubscriptions,
} from "@/hooks/useSubscriptions";

import { StripeEmbeddedCheckout } from "@/components/payments/StripeEmbeddedCheckout";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BIB_SUBSCRIBER_PRICE = "4,99 €";
const BIB_SUBSCRIBER_LOOKUP_KEY =
  "bib_subscriber_monthly";

export default function StoreSubscriberSubscribe() {
  const { user, accountType, loading: authLoading } =
    useAuth();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    subscription,
    isSubscriber,
    isLoading: subscriptionLoading,
    refetch,
  } = useBibSubscriberSubscription();

  const {
    isFetching: subscriptionsFetching,
  } = useUserSubscriptions();

  const success = searchParams.get("success") === "true";

  /**
   * Après retour Stripe, le webhook peut avoir quelques
   * secondes de retard.
   *
   * On vérifie donc régulièrement jusqu'à confirmation.
   */
  useEffect(() => {
    if (!success || isSubscriber) {
      return;
    }

    const interval = window.setInterval(() => {
      void refetch();
    }, 2500);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    success,
    isSubscriber,
    refetch,
  ]);

  /**
   * Un abonnement confirmé renvoie vers l'espace client.
   */
  useEffect(() => {
    if (isSubscriber) {
      navigate("/store/account", {
        replace: true,
      });
    }
  }, [
    isSubscriber,
    navigate,
  ]);

  const returnUrl = useMemo(() => {
    return (
      `${window.location.origin}` +
      `/store/subscribe?success=true`
    );
  }, []);

  if (authLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                BIB Abonné
              </CardTitle>

              <CardDescription>
                Connectez-vous ou créez votre compte
                pour continuer.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1">
                <Link
                  to="/store/login?next=%2Fstore%2Fsubscribe"
                >
                  Se connecter
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="flex-1"
              >
                <Link
                  to="/store/signup?next=%2Fstore%2Fsubscribe"
                >
                  Créer mon compte
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /**
   * Cette page appartient exclusivement au compte Store.
   */
  if (accountType !== "store") {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                Espace client BIB
              </CardTitle>

              <CardDescription>
                Cette souscription est réservée aux
                comptes clients BIB Store.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button asChild>
                <Link to="/store">
                  Retour au Store
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (subscriptionLoading || subscriptionsFetching) {
    return <LoadingScreen />;
  }

  /**
   * Si le webhook Stripe vient de confirmer
   * l'abonnement, on laisse l'effet ci-dessus
   * effectuer la redirection.
   */
  if (success && !isSubscriber) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-4">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>

              <CardTitle className="mt-4">
                Confirmation de votre abonnement
              </CardTitle>

              <CardDescription>
                Votre paiement a été transmis. Nous
                attendons la confirmation de Stripe.
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center text-sm text-muted-foreground">
              Cette page se met à jour automatiquement.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/store"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Retour au Store
          </Link>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-primary">
              BIB
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              BIB Abonné
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Activez votre espace client BIB et profitez
              des fonctionnalités réservées aux abonnés.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            {/* Plan */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>
                      BIB Abonné
                    </CardTitle>

                    <CardDescription className="mt-1">
                      Abonnement mensuel
                    </CardDescription>
                  </div>

                  <div className="rounded-full bg-primary/10 p-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="border-b pb-5">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-semibold">
                      {BIB_SUBSCRIBER_PRICE}
                    </span>

                    <span className="pb-1 text-sm text-muted-foreground">
                      / mois
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Sans engagement annuel.
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <Feature>
                    Découvrir les boutiques vérifiées par BIB
                  </Feature>

                  <Feature>
                    Enregistrer vos boutiques et produits favoris
                  </Feature>

                  <Feature>
                    Retrouver vos commandes et leur suivi
                  </Feature>

                  <Feature>
                    Participer au programme de recyclage
                  </Feature>

                  <Feature>
                    Cumuler et utiliser vos points
                  </Feature>

                  <Feature>
                    Accéder aux avantages et cartes cadeaux BIB
                  </Feature>
                </div>

                <div className="mt-6 rounded-xl border bg-muted/30 p-4">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                    <p className="text-xs leading-5 text-muted-foreground">
                      Le compte client et l'abonnement sont
                      deux éléments distincts. Votre accès
                      abonné devient actif uniquement après
                      confirmation du paiement par Stripe.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Checkout */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Finaliser votre activation
                </CardTitle>

                <CardDescription>
                  Paiement sécurisé de votre abonnement
                  BIB Abonné.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <StripeEmbeddedCheckout
                  priceId={BIB_SUBSCRIBER_LOOKUP_KEY}
                  customerEmail={user.email ?? undefined}
                  userId={user.id}
                  returnUrl={returnUrl}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Check className="h-3 w-3 text-primary" />
      </div>

      <span className="text-sm leading-5">
        {children}
      </span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
