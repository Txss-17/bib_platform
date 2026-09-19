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

type SubscriberAccount = {
  firstName: string;
  lastName: string;
  email: string;
  memberSince: string;
  subscriptionStatus: "active" | "inactive";
  subscriptionPrice: number;
  nextBillingDate?: string;
};

const subscriber: SubscriberAccount = {
  firstName: "Votre",
  lastName: "Compte",
  email: "—",
  memberSince: "—",
  subscriptionStatus: "active",
  subscriptionPrice: 4.99,
};

const storage = {
  used: 37,
  limit: 100,
};

export default function StoreSubscriberAccount() {
  const storagePercentage = Math.min(
    100,
    Math.round((storage.used / storage.limit) * 100)
  );

  const fullName =
    subscriber.firstName === "Votre"
      ? "Votre compte"
      : `${subscriber.firstName} ${subscriber.lastName}`;

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
            Gérez votre espace abonné, votre abonnement et les données
            enregistrées dans BIB Store.
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
                  value={subscriber.email}
                />

                <InfoField
                  label="Membre depuis"
                  value={subscriber.memberSince}
                />

                <InfoField
                  label="Statut"
                  value="Compte abonné"
                  status
                />
              </div>

              <div className="border-t px-5 py-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Modifier mes informations
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          BIB Abonné
                        </h3>

                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          <Check className="h-3 w-3" />
                          Actif
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Accès aux fonctionnalités de l'espace abonné BIB
                        Store.
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xl font-semibold">
                        {subscriber.subscriptionPrice
                          .toFixed(2)
                          .replace(".", ",")}{" "}
                        €
                      </p>

                      <p className="text-xs text-muted-foreground">
                        / mois
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <FeatureItem label="Panier BIB Store" />
                    <FeatureItem label="Favoris" />
                    <FeatureItem label="Historique des commandes" />
                    <FeatureItem label="Espace personnel" />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Gérer l'abonnement
                  </button>

                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Historique de facturation
                  </button>
                </div>
              </div>
            </section>

            {/* Storage */}
            <section className="rounded-2xl border bg-card">
              <div className="flex items-center justify-between border-b px-5 py-5">
                <div>
                  <h2 className="font-semibold">
                    Stockage BIB Store
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Gestion des données enregistrées dans votre espace.
                  </p>
                </div>

                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold">
                      {storage.used}
                      <span className="text-base font-normal text-muted-foreground">
                        {" "}
                        / {storage.limit}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      éléments enregistrés
                    </p>
                  </div>

                  <p className="text-sm font-medium">
                    {storagePercentage} %
                  </p>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${storagePercentage}%`,
                    }}
                  />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <StorageItem
                    label="Favoris"
                    value="37"
                    icon={<Heart className="h-4 w-4" />}
                  />

                  <StorageItem
                    label="Panier"
                    value="0"
                    icon={<ShoppingBag className="h-4 w-4" />}
                  />

                  <StorageItem
                    label="Autres"
                    value="0"
                    icon={<Package className="h-4 w-4" />}
                  />
                </div>

                <Link
                  to="/store/favorites"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Gérer mes données enregistrées
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>

            {/* Quick access */}
            <section className="rounded-2xl border bg-card">
              <div className="border-b px-5 py-5">
                <h2 className="font-semibold">
                  Mon espace Store
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Accès rapide aux fonctionnalités de votre compte.
                </p>
              </div>

              <div className="divide-y">
                <AccountLink
                  to="/store/cart"
                  icon={<ShoppingBag className="h-5 w-5" />}
                  title="Mon panier"
                  description="Produits enregistrés avant de poursuivre chez les boutiques."
                />

                <AccountLink
                  to="/store/favorites"
                  icon={<Heart className="h-5 w-5" />}
                  title="Mes favoris"
                  description="Produits et boutiques que vous avez enregistrés."
                />

                <AccountLink
                  to="/store/orders"
                  icon={<Package className="h-5 w-5" />}
                  title="Mes commandes"
                  description="Historique des commandes associées à votre compte."
                />

                <AccountLink
                  to="/store/account"
                  icon={<Settings className="h-5 w-5" />}
                  title="Paramètres"
                  description="Préférences et gestion de votre espace BIB."
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
                  Retrouvez vos produits, boutiques et commandes au même
                  endroit.
                </p>
              </div>

              <div className="space-y-3 p-5">
                <SidebarStat
                  label="Favoris"
                  value={String(storage.used)}
                  to="/store/favorites"
                />

                <SidebarStat
                  label="Commandes"
                  value="0"
                  to="/store/orders"
                />

                <SidebarStat
                  label="Stockage"
                  value={`${storagePercentage}%`}
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

function FeatureItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
        <Check className="h-3 w-3 text-primary" />
      </div>

      <span>{label}</span>
    </div>
  );
}

function StorageItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}

        <span className="text-xs font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-semibold">
        {value}
      </p>
    </div>
  );
}

function AccountLink({
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
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

function SidebarStat({
  label,
  value,
  to,
}: {
  label: string;
  value: string;
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

      <span className="inline-flex items-center gap-1 text-sm font-semibold">
        {value}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </span>
    </Link>
  );
}
