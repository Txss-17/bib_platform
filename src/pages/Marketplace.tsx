import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  ArrowRight,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

import {
  useMarketplaceBoutiques,
  type MarketplaceBoutique,
} from "@/hooks/useMarketplace";

import { BoutiqueCard } from "@/components/marketplace/BoutiqueCard";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/hooks/useCart";

export default function Marketplace() {
  useSEO({
    title: "Marketplace | Brand-In-A-Box",
    description:
      "Découvrez les boutiques et les marques vérifiées du réseau Brand-In-A-Box.",
  });

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") ?? "";

  const [searchValue, setSearchValue] = useState(query);

  const { user } = useAuth();
  const { favoritesCount, openPanel } = useFavorites();
  const { itemCount } = useCart();

  const {
    boutiques,
    trendingBoutiques,
    newestBoutiques,
    categories,
    isLoading,
  } = useMarketplaceBoutiques(query);

  /*
   * TEMPORAIRE :
   * Pour l'instant, un utilisateur connecté est considéré
   * comme ayant activé son compte.
   *
   * À remplacer ensuite par la vraie vérification
   * du statut BIB Abonné.
   */
  const isSubscriber = Boolean(user);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  const handleSearch = (value: string) => {
    setSearchValue(value);

    const nextParams = new URLSearchParams(searchParams);

    if (value.trim()) {
      nextParams.set("q", value.trim());
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams);
  };

  const activateAccount = () => {
    if (user) {
      openPanel("favorites");
      return;
    }

    navigate("/signup");
  };

  const goToOrderTracking = () => {
    navigate("/order-tracking");
  };

  const openFilters = () => {
    window.dispatchEvent(new CustomEvent("bib:open-marketplace-filters"));
  };

  const heroBoutique = useMemo(() => {
    return (
      trendingBoutiques?.[0] ??
      newestBoutiques?.[0] ??
      boutiques?.[0] ??
      null
    );
  }, [trendingBoutiques, newestBoutiques, boutiques]);

  const handleBoutiqueClick = (boutique: MarketplaceBoutique) => {
    if (!boutique.slug) return;

    navigate(`/boutique/${boutique.slug}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Link
            to="/store"
            className="shrink-0 transition-opacity hover:opacity-80"
          >
            <Logo iconSize={30} />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/store"
              className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
            >
              Accueil
            </Link>

            <Link
              to="/store"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Produits
            </Link>

            {isSubscriber && (
              <>
                <Link
                  to="/orders"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Mes commandes
                </Link>

                <Link
                  to="/account"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Plus
                </Link>
              </>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden w-56 lg:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={searchValue}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Rechercher une boutique"
                className="h-9 rounded-full border-border bg-muted/40 pl-9 pr-3 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => openPanel("favorites")}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
              aria-label="Favoris"
            >
              <Heart className="h-4 w-4" />

              {favoritesCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-semibold text-background">
                  {favoritesCount}
                </span>
              )}
            </button>

            <Link
              to="/cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
              aria-label="Panier"
            >
              <ShoppingBag className="h-4 w-4" />

              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-semibold text-background">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link
              to={user ? "/account" : "/login"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
              aria-label={user ? "Mon compte" : "Se connecter"}
            >
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="container mx-auto max-w-7xl px-4 pt-8 sm:pt-10">
          <div className="relative overflow-hidden rounded-3xl bg-muted">
            {heroBoutique?.cover_image_url ? (
              <img
                src={heroBoutique.cover_image_url}
                alt={heroBoutique.name}
                className="h-[280px] w-full object-cover sm:h-[360px] lg:h-[420px]"
              />
            ) : (
              <div className="h-[280px] w-full sm:h-[360px] lg:h-[420px]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                Marketplace BIB
              </p>

              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Découvrez les boutiques du réseau BIB
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                Des boutiques sélectionnées et vérifiées, réunies dans un
                même espace.
              </p>

              {heroBoutique && (
                <button
                  type="button"
                  onClick={() => handleBoutiqueClick(heroBoutique)}
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Découvrir la boutique
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* COMPTE / SUIVI DE COMMANDE */}
        {!query && !isSubscriber && (
          <section className="container mx-auto max-w-7xl px-4 pt-7">
            <MarketplaceAccountBar
              onActivateAccount={activateAccount}
              onTrackOrder={goToOrderTracking}
            />
          </section>
        )}

        {/* SEARCH / FILTERS */}
        <section className="container mx-auto max-w-7xl px-4 pt-7">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {query ? "Résultats" : "Boutiques à découvrir"}
              </h2>

              {query && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Résultats pour « {query} »
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={openFilters}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-semibold transition hover:bg-muted"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtrer
            </button>
          </div>
        </section>

        {/* SEARCH RESULTS */}
        {query ? (
          <section className="container mx-auto max-w-7xl px-4 py-7">
            {isLoading ? (
              <MarketplaceSkeleton />
            ) : boutiques.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {boutiques.map((boutique) => (
                  <BoutiqueCard
                    key={boutique.id}
                    boutique={boutique}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                <p className="text-sm font-medium">
                  Aucune boutique trouvée
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Essayez avec un autre terme de recherche.
                </p>
              </div>
            )}
          </section>
        ) : (
          <>
            {/* TENDANCES */}
            <BoutiqueRail
              title="Tendances"
              boutiques={trendingBoutiques}
              onViewAll={() => navigate("/store?section=trending")}
            />

            {/* NOUVEAUTÉS */}
            <BoutiqueRail
              title="Nouveautés"
              boutiques={newestBoutiques}
              onViewAll={() => navigate("/store?section=new")}
            />

            {/* CATÉGORIES */}
            {categories.length > 0 && (
              <section className="container mx-auto max-w-7xl px-4 pb-8">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Explorer par univers
                  </h2>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        const nextParams = new URLSearchParams(searchParams);
                        nextParams.set("category", category);
                        setSearchParams(nextParams);
                      }}
                      className="shrink-0 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* TOUTES LES BOUTIQUES */}
            <section className="container mx-auto max-w-7xl px-4 pb-14">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    Toutes les boutiques
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Les boutiques disponibles sur le marketplace sont déjà
                    vérifiées par BIB.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <MarketplaceSkeleton />
              ) : boutiques.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {boutiques.map((boutique) => (
                    <BoutiqueCard
                      key={boutique.id}
                      boutique={boutique}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
                  <p className="text-sm font-medium">
                    Aucune boutique disponible.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <Logo iconSize={20} asLink={false} />

          <p>
            © {new Date().getFullYear()} Brand-In-A-Box · Marketplace officiel
          </p>

          <Link
            to="/"
            className="transition hover:text-foreground"
          >
            Brand-In-A-Box
          </Link>
        </div>
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ACCOUNT BAR                                                                */
/* -------------------------------------------------------------------------- */

interface MarketplaceAccountBarProps {
  onActivateAccount: () => void;
  onTrackOrder: () => void;
}

function MarketplaceAccountBar({
  onActivateAccount,
  onTrackOrder,
}: MarketplaceAccountBarProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-muted/35">
      <div className="grid gap-0 sm:grid-cols-[1.25fr_1fr]">
        <div className="flex min-w-0 flex-col justify-between gap-4 px-4 py-4 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Activez votre compte BIB
            </p>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Suivez vos boutiques favorites, retrouvez vos commandes et
              profitez de votre espace BIB.
            </p>

            <p className="mt-2 text-sm font-semibold text-foreground">
              BIB Abonné · 4,99 €/mois
            </p>
          </div>

          <button
            type="button"
            onClick={onActivateAccount}
            className="inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-semibold text-background transition hover:opacity-85 active:scale-[0.98]"
          >
            Activer mon compte
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-3 border-t border-border/70 px-4 py-4 sm:border-l sm:border-t-0 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Vous avez déjà commandé ?
            </p>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Suivez l’avancement de votre commande, même sans compte abonné.
            </p>
          </div>

          <button
            type="button"
            onClick={onTrackOrder}
            className="inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-semibold text-foreground transition hover:bg-muted active:scale-[0.98]"
          >
            Suivre ma commande
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* BOUTIQUE RAIL                                                              */
/* -------------------------------------------------------------------------- */

interface BoutiqueRailProps {
  title: string;
  boutiques: MarketplaceBoutique[];
  onViewAll: () => void;
}

function BoutiqueRail({
  title,
  boutiques,
  onViewAll,
}: BoutiqueRailProps) {
  if (!boutiques?.length) return null;

  return (
    <section className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {title}
        </h2>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          Voir tout
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {boutiques.slice(0, 4).map((boutique) => (
          <BoutiqueCard
            key={boutique.id}
            boutique={boutique}
          />
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SKELETON                                                                    */
/* -------------------------------------------------------------------------- */

function MarketplaceSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-border"
        >
          <div className="aspect-[4/3] animate-pulse bg-muted" />

          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
