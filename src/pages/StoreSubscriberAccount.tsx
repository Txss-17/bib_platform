import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  Heart,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  useBibSubscriberSubscription,
  useOpenBillingPortal,
} from "@/hooks/useSubscriptions";

const BIB_SUBSCRIBER_PRICE = 4.99;

export default function StoreSubscriberAccount() {
  const { user, profile, loading: authLoading } = useAuth();

  const {
    subscription,
    isSubscriber,
    isLoading: subscriptionLoading,
  } = useBibSubscriberSubscription();

  const billingPortal = useOpenBillingPortal();

  const loading =
    authLoading || subscriptionLoading;

  const fullName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    "Votre compte";

  const email =
    user?.email || "—";

  const subscriptionStatus =
    subscription?.status === "trialing"
      ? "Essai"
      : subscription?.status === "active"
        ? "Actif"
        : "Inactif";

  const subscriptionPrice =
    BIB_SUBSCRIBER_PRICE.toFixed(2).replace(".", ",");

  const memberSince =
    subscription?.created_at
      ? formatDate(subscription.created_at)
      : "—";

  const nextBillingDate =
    subscription?.current_period_end
      ? formatDate(subscription.current_period_end)
      : null;

  const cancelAtPeriodEnd =
    subscription?.cancel_at_period_end === true;

  const handleBillingPortal = () => {
    billingPortal.mutate();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-4 w-96 max-w-full rounded bg-muted" />

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <div className="h-56 rounded-2xl bg-muted" />
                <div className="h-72 rounded-2xl bg-muted" />
              </div>

              <div className="h-64 rounded-2xl bg-muted" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 py-12 text-center">
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <UserRound className="h-6 w-6 text-muted-foreground" />
            </div>

            <h1 className="mt-5 text-2xl font-semibold">
              Connectez-vous à votre compte
            </h1>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Votre espace abonné est accessible uniquement
              après connexion.
            </p>

            <Link
              to="/store/login?next=%2Fstore%2Faccount"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Se connecter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!isSubscriber) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-6 text-center sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>

            <p className="mt-5 text-sm font-medium text-muted-foreground">
              BIB Store
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Activez BIB Abonné
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Votre compte Store existe, mais aucun abonnement
              BIB Abonné actif n'est actuellement associé à ce compte.
            </p>

            <div className="mt-6 rounded-2xl border bg-muted/30 p-5 text-left">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">
                    BIB Abonné
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Accédez aux fonctionnalités réservées aux abonnés.
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xl font-semibold">
                    {subscriptionPrice} €
                  </p>

                  <p className="text-xs text-muted-foreground">
                    / mois
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <FeatureItem label="Favoris" />
                <FeatureItem label="Commandes" />
                <FeatureItem label="Suivi des commandes" />
                <FeatureItem label="Programme de recyclage" />
                <FeatureItem label="Points et avantages" />
                <FeatureItem label="Cartes cadeaux" />
              </div>
            </div>

            <Link
              to="/store/subscribe"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Activer BIB Abonné
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            BIB Store
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Mon compte
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Gérez votre espace abonné, votre abonnement et
            vos fonctionnalités BIB Store.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Main */}
          <div className="space-y-6">
            {/* Identity */}
            <section className="rounded-2xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-5">
                <div>
                  <h2 className="font-semibold">
                    Informations personnelles
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Les informations associées à votre compte BIB.
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <InfoField
                  label="Nom"
                  value={fullName}
                />

                <InfoField
                  label="Adresse e-mail"
                  value={email}
                />

                <InfoField
                  label="Membre depuis"
                  value={memberSince}
                />

                <InfoField
                  label="Statut"
                  value="Compte abonné"
                  status
                />
              </div>

              <div className="border-t px-5 py-4">
                <p className="text-xs leading-5 text-muted-foreground">
                  La gestion des informations de compte est
                  effectuée depuis votre compte BIB.
                </p>
              </div>
            </section>

            {/* Subscription */}
            <section className="rounded-2xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-5">
                <div>
                  <h2 className="font-semibold">
                    Mon abonnement
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Votre accès aux fonctionnalités réservées aux abonnés.
                  </p>
                </div>

                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="p-5">
                <div className="rounded-2xl border bg-muted/30 p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">
                          BIB Abonné
                        </h3>

                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          <Check className="h-3 w-3" />
                          {subscriptionStatus}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Accès aux fonctionnalités de l'espace
                        abonné BIB Store.
                      </p>

                      {cancelAtPeriodEnd && nextBillingDate && (
                        <p className="mt-3 text-sm text-amber-600">
                          Votre abonnement prendra fin le{" "}
                          <strong>{nextBillingDate}</strong>.
                        </p>
                      )}

                      {!cancelAtPeriodEnd && nextBillingDate && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Prochaine échéance :{" "}
                          <strong>{nextBillingDate}</strong>
                        </p>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xl font-semibold">
                        {subscriptionPrice} €
                      </p>

                      <p className="text-xs text-muted-foreground">
                        / mois
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <FeatureItem label="Favoris" />
                    <FeatureItem label="Commandes" />
                    <FeatureItem label="Suivi des commandes" />
                    <FeatureItem label="Programme de recyclage" />
                    <FeatureItem label="Points et avantages" />
                    <FeatureItem label="Cartes cadeaux" />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleBillingPortal}
                    disabled={billingPortal.isPending}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CreditCard className="h-4 w-4" />

                    {billingPortal.isPending
                      ? "Ouverture..."
                      : "Gérer l'abonnement"}
                  </button>

                  <Link
                    to="/store/orders"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Mes commandes
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {billingPortal.isError && (
                  <p className="mt-3 text-sm text-destructive">
                    Impossible d'ouvrir le portail de facturation.
                    Veuillez réessayer.
                  </p>
                )}
              </div>
            </section>

            {/* Personal space */}
            <section className="rounded-2xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-5">
                <div>
                  <h2 className="font-semibold">
                    Mon espace BIB
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Retrouvez vos fonctionnalités réservées aux abonnés.
                  </p>
                </div>

                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <AccountCard
                  to="/store/favorites"
                  icon={<Heart className="h-5 w-5" />}
                  title="Mes favoris"
                  description="Retrouvez les produits et boutiques que vous avez enregistrés."
                />

                <AccountCard
                  to="/store/orders"
                  icon={<Package className="h-5 w-5" />}
                  title="Mes commandes"
                  description="Consultez vos commandes et leur suivi."
                />

                <AccountCard
                  to="/store/cart"
                  icon={<ShoppingBag className="h-5 w-5" />}
                  title="Mon panier"
                  description="Retrouvez les produits préparés avant de continuer chez les boutiques."
                />

                <AccountCard
                  to="/store/account"
                  icon={<Settings className="h-5 w-5" />}
                  title="Mon compte"
                  description="Gérez votre espace et votre abonnement BIB."
                />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border bg-card">
              <div className="border-b p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  BIB Abonné
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Votre espace personnel
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Retrouvez vos produits, boutiques et commandes
                  au même endroit.
                </p>
              </div>

              <div className="space-y-3 p-5">
                <SidebarLink
                  label="Mes favoris"
                  to="/store/favorites"
                />

                <SidebarLink
                  label="Mes commandes"
                  to="/store/orders"
                />

                <SidebarLink
                  label="Mon panier"
                  to="/store/cart"
                />

                <SidebarLink
                  label="Gérer mon abonnement"
                  to="/store/account"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(date);
}

function InfoField({
  label,
  value,
  status = false,
}: {
  label: string;
  value: string;
  status?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium">
        {status ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {value}
          </span>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function FeatureItem({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
        <Check className="h-3 w-3 text-primary" />
      </div>

      <span>{label}</span>
    </div>
  );
}

function AccountCard({
  to,
  icon,
  title,
  description,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">
              {title}
            </p>

            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </div>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

function SidebarLink({
  label,
  to,
}: {
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors hover:bg-muted/40"
    >
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
