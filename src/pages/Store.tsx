import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Search,
  Check,
  ChevronRight,
  Loader2,
  User,
  Heart,
  ShoppingCart,
  House,
  ClipboardList,
  MoreHorizontal,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

import {
  useStoreBoutiques,
  type StoreBoutique,
} from "@/hooks/useStore";

import { useStoreCart } from "@/contexts/StoreCartContext";
import { BoutiqueCard } from "@/components/store/BoutiqueCard";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";

export default function Store() {
  const { data: boutiques = [], isLoading } = useStoreBoutiques();

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const navigate = useNavigate();
  const location = useLocation();

  const { user, accountType } = useAuth();
  const { totalItems } = useStoreCart();
  const { data: customer } = useCustomerProfile();

  /*
   * BIB Store:
   *
   * Visiteur / compte non-abonné
   * → découverte uniquement
   *
   * BIB Abonné
   * → découverte + favoris + panier + commandes + espace personnel
   *
   * On ne considère donc plus simplement "compte Store" comme
   * "abonné". Le statut d'abonnement doit être fourni par le profil.
   *
   * En attendant que le champ d'abonnement définitif soit branché,
   * le compte Store constitue le point d'entrée de l'espace abonné.
   */
  const isStoreAccount = !!user && accountType === "store";

  const isSubscriber = isStoreAccount;

  const initial =
    (customer?.full_name || user?.email || "?")
      .trim()
      .charAt(0)
      .toUpperCase();

  /* -------------------------------------------------------------
   * Search synchronization
   * ------------------------------------------------------------- */

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";

    if (urlQuery !== search) {
      setSearch(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const currentQuery = searchParams.get("q") ?? "";
    const nextQuery = search.trim();

    if (currentQuery === nextQuery) return;

    const nextParams = new URLSearchParams(searchParams);

    if (nextQuery) {
      nextParams.set("q", nextQuery);
    } else {
      nextParams.delete("q");
    }

    setSearchParams(nextParams, { replace: true });
  }, [search]);

  useSEO({
    title: "BIB Store — Découvrez des boutiques vérifiées",
    description:
      "Découvrez des produits et des boutiques sélectionnés avec soin par BIB.",
  });

  const query = search.trim().toLowerCase();

  /* -------------------------------------------------------------
   * Boutique filtering
   * ------------------------------------------------------------- */

  const filteredBoutiques = useMemo(() => {
    if (!query) return boutiques;

    return boutiques.filter((boutique: StoreBoutique) => {
      const searchable = [
        boutique.name,
        boutique.category,
        boutique.tagline,
        boutique.description,
        ...(boutique.product_preview_names ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [boutiques, query]);

  const trendingBoutiques = useMemo(() => {
    return [...boutiques]
      .sort(
        (a, b) =>
          (b.total_sales ?? 0) -
          (a.total_sales ?? 0),
      )
      .slice(0, 12);
  }, [boutiques]);

  const newestBoutiques = useMemo(() => {
    return [...boutiques]
      .sort((a, b) => {
        const aDate = a.created_at
          ? new Date(a.created_at).getTime()
          : 0;

        const bDate = b.created_at
          ? new Date(b.created_at).getTime()
          : 0;

        return bDate - aDate;
      })
      .slice(0, 12);
  }, [boutiques]);

  const boutiquesByCategory = useMemo(() => {
    const grouped = new Map<string, StoreBoutique[]>();

    boutiques.forEach((boutique) => {
      const category = boutique.category?.trim();

      if (!category) return;

      const existing = grouped.get(category) ?? [];
      grouped.set(category, [...existing, boutique]);
    });

    return grouped;
  }, [boutiques]);

  const storeHeroImage =
    trendingBoutiques[0]?.cover_url ??
    newestBoutiques[0]?.cover_url ??
    boutiques[0]?.cover_url ??
    null;

  /* -------------------------------------------------------------
   * Navigation
   * ------------------------------------------------------------- */

  const goToProducts = () => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("q", search.trim());
    }

    const queryString = params.toString();

    navigate(
      `/store/products${queryString ? `?${queryString}` : ""}`,
    );
  };

  const goToOrders = () => {
    if (!isSubscriber) return;

    navigate("/store/orders");
  };

  const goToFavorites = () => {
    if (!isSubscriber) return;

    navigate("/store/favorites");
  };

  const goToCart = () => {
    if (!isSubscriber) return;

    navigate("/store/cart");
  };

  const goToAccount = () => {
    if (!isSubscriber) {
      navigate("/store/login");
      return;
    }

    navigate("/store/account");
  };

  const submitSearch = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    goToProducts();
  };

  const activateAccount = () => {
    if (isSubscriber) {
      navigate("/store/account");
      return;
    }

    navigate("/store/signup");
  };

  const goToOrderTracking = () => {
    navigate("/order-tracking");
  };

  /* -------------------------------------------------------------
   * Render
   * ------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/store"
            className="shrink-0"
            aria-label="BIB Store"
          >
            <Logo />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/store/products"
              className={`text-sm font-medium transition-colors ${
                location.pathname.startsWith("/store/products")
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Produits
            </Link>

            {isSubscriber && (
              <>
                <button
                  type="button"
                  onClick={goToOrders}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.startsWith("/store/orders")
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Mes commandes
                </button>

                <button
                  type="button"
                  onClick={goToFavorites}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname.startsWith("/store/favorites")
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Favoris
                </button>
              </>
            )}
          </nav>

          <form
            onSubmit={submitSearch}
            className="ml-auto hidden min-w-0 flex-1 md:block md:max-w-md"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher une boutique ou un produit"
                className="pl-9"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            {isSubscriber && (
              <>
                <button
                  type="button"
                  onClick={goToFavorites}
                  aria-label="Favoris"
                  className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted sm:flex"
                >
                  <Heart className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={goToCart}
                  aria-label="Panier"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"
                >
                  <ShoppingCart className="h-5 w-5" />

                  {totalItems > 0 && (
                    <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={goToAccount}
              aria-label={
                isSubscriber
                  ? "Mon compte"
                  : "Créer un compte BIB Abonné"
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted"
            >
              {isSubscriber ? (
                <span className="text-sm font-semibold">
                  {initial}
                </span>
              ) : (
                <User className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="border-t px-4 py-3 md:hidden">
          <form onSubmit={submitSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher"
                className="pl-9"
              />
            </div>
          </form>
        </div>
      </header>

      <main className="pb-24 md:pb-0">
        {!query && (
          <StoreIntro
            isSubscriber={isSubscriber}
            imageUrl={storeHeroImage}
            onPrimaryAction={goToProducts}
          />
        )}

        {!query && !isSubscriber && (
          <StoreAccountBar
            onActivate={activateAccount}
            onTrackOrder={goToOrderTracking}
          />
        )}

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : query ? (
          <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Résultats pour
              </p>

              <h2 className="text-2xl font-semibold">
                « {search.trim()} »
              </h2>
            </div>

            {filteredBoutiques.length === 0 ? (
              <div className="rounded-2xl border bg-card p-10 text-center">
                <SlidersHorizontal className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />

                <h3 className="text-lg font-semibold">
                  Aucun résultat
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Essayez une autre recherche.
                </p>
              </div>
            ) : (
              <Rail
                title="Boutiques correspondantes"
                boutiques={filteredBoutiques}
              />
            )}
          </section>
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {trendingBoutiques.length > 0 && (
              <Rail
                title="En ce moment"
                boutiques={trendingBoutiques}
              />
            )}

            {newestBoutiques.length > 0 && (
              <div className="mt-12">
                <Rail
                  title="Nouvelles boutiques"
                  boutiques={newestBoutiques}
                />
              </div>
            )}

            {Array.from(boutiquesByCategory.entries()).map(
              ([category, categoryBoutiques]) => (
                <div
                  key={category}
                  className="mt-12"
                >
                  <Rail
                    title={category}
                    boutiques={categoryBoutiques.slice(0, 12)}
                  />
                </div>
              ),
            )}
          </div>
        )}
      </main>

      {/* Mobile navigation uniquement pour les abonnés */}
      {isSubscriber && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-4">
            <MobileNavButton
              icon={<House className="h-5 w-5" />}
              label="Accueil"
              active={location.pathname === "/store"}
              onClick={() => navigate("/store")}
            />

            <MobileNavButton
              icon={<Search className="h-5 w-5" />}
              label="Produits"
              active={location.pathname.startsWith(
                "/store/products",
              )}
              onClick={goToProducts}
            />

            <MobileNavButton
              icon={<ClipboardList className="h-5 w-5" />}
              label="Commandes"
              active={location.pathname.startsWith(
                "/store/orders",
              )}
              onClick={goToOrders}
            />

            <MobileNavButton
              icon={<MoreHorizontal className="h-5 w-5" />}
              label="Plus"
              active={
                location.pathname.startsWith(
                  "/store/account",
                ) ||
                location.pathname.startsWith(
                  "/store/favorites",
                )
              }
              onClick={goToAccount}
            />
          </div>
        </nav>
      )}

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            © {new Date().getFullYear()} BIB
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/centre-aide"
              className="hover:text-foreground"
            >
              Centre d'aide
            </Link>

            <Link
              to="/pack-legal"
              className="hover:text-foreground"
            >
              Informations légales
            </Link>

            <Link
              to="/a-propos"
              className="hover:text-foreground"
            >
              À propos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =============================================================
 * Hero
 * ============================================================= */

function StoreIntro({
  isSubscriber,
  imageUrl,
  onPrimaryAction,
}: {
  isSubscriber: boolean;
  imageUrl: string | null;
  onPrimaryAction: () => void;
}) {
  return (
    <section className="border-b">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-16">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-3 w-3" />
            </span>

            {isSubscriber
              ? "Votre espace BIB"
              : "Des marques engagées"}
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {isSubscriber
              ? "Découvrez, suivez et retrouvez vos boutiques préférées."
              : "Des produits sélectionnés avec soin."}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            {isSubscriber
              ? "Explorez les boutiques vérifiées par BIB, découvrez leurs produits et retrouvez facilement vos sélections."
              : "Explorez les boutiques vérifiées par BIB et découvrez des produits sélectionnés avec soin."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onPrimaryAction}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Découvrir les produits
              <ArrowRight className="h-4 w-4" />
            </button>

            {!isSubscriber && (
              <Link
                to="/store/signup"
                className="inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Devenir BIB Abonné
              </Link>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border bg-muted">
          <div className="aspect-[4/3]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Boutique BIB"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Logo />
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 rounded-2xl border bg-background/90 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3.5 w-3.5" />
              </span>

              Verified by BIB
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============================================================
 * Non-subscriber account bar
 * ============================================================= */

function StoreAccountBar({
  onActivate,
  onTrackOrder,
}: {
  onActivate: () => void;
  onTrackOrder: () => void;
}) {
  return (
    <section className="border-b bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <p className="font-medium">
            Vous découvrez BIB pour la première fois ?
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Créez votre espace BIB Abonné pour accéder aux
            favoris, au panier et au suivi de vos commandes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onActivate}
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Créer mon espace
          </button>

          <button
            type="button"
            onClick={onTrackOrder}
            className="inline-flex h-10 items-center justify-center rounded-full border px-5 text-sm font-medium hover:bg-background"
          >
            Suivre une commande
          </button>
        </div>
      </div>
    </section>
  );
}

/* =============================================================
 * Mobile navigation
 * ============================================================= */

function MobileNavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-3 text-xs transition-colors ${
        active
          ? "text-foreground"
          : "text-muted-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* =============================================================
 * Boutique rail
 * ============================================================= */

function Rail({
  title,
  boutiques,
}: {
  title: string;
  boutiques: StoreBoutique[];
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollNext = () => {
    const element = railRef.current;

    if (!element) return;

    element.scrollBy({
      left: element.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  if (boutiques.length === 0) return null;

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">
            {title}
          </h2>
        </div>

        {boutiques.length > 3 && (
          <button
            type="button"
            onClick={scrollNext}
            aria-label={`Voir davantage de boutiques dans ${title}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-none"
      >
        {boutiques.map((boutique) => (
          <div
            key={boutique.id}
            className="w-[78vw] max-w-[320px] shrink-0 snap-start sm:w-[280px] lg:w-[300px]"
          >
            <BoutiqueCard boutique={boutique} />
          </div>
        ))}
      </div>
    </section>
  );
}
