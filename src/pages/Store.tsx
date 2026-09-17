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
  const {
    data: boutiques = [],
    isLoading,
  } = useStoreBoutiques();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("q") ?? "",
  );

  const navigate = useNavigate();
  const location = useLocation();

  const { user, accountType } = useAuth();

  const { totalItems } = useStoreCart();

  const { data: customer } =
    useCustomerProfile();

  /*
   * Le compte Store correspond au compte
   * client BIB.
   */
  const isStoreAccount =
    !!user && accountType === "store";

  /*
   * TEMPORAIRE :
   *
   * Tant que le statut réel BIB Abonné n'est pas
   * exposé par le profil client, un compte Store
   * authentifié dispose de l'espace client.
   *
   * Cette variable devra ensuite être remplacée
   * par le véritable statut d'abonnement.
   */
  const isSubscriber = isStoreAccount;

  const initial = (
    customer?.full_name ||
    user?.email ||
    "?"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  /* =========================================================
     SYNCHRONISATION DE LA RECHERCHE AVEC L'URL
     ========================================================= */

  useEffect(() => {
    const next = new URLSearchParams(
      searchParams,
    );

    const value = search.trim();

    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
    }

    if (
      next.toString() !==
      searchParams.toString()
    ) {
      setSearchParams(
        next,
        { replace: true },
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  /* =========================================================
     SEO
     ========================================================= */

  useSEO({
    title:
      "Store BIB — Boutiques et produits sélectionnés",
    description:
      "Découvrez les boutiques et produits sélectionnés par Brand-In-A-Box.",
  });

  const query =
    search.trim().toLowerCase();

  /* =========================================================
     RECHERCHE
     ========================================================= */

  const filteredBoutiques =
    useMemo(() => {
      if (!query) {
        return boutiques;
      }

      return boutiques.filter(
        (boutique) => {
          const content = [
            boutique.name,
            boutique.category,
            boutique.tagline,
            boutique.description,
            ...boutique.product_previews.map(
              (product) =>
                product.name,
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return content.includes(query);
        },
      );
    }, [boutiques, query]);

  /* =========================================================
     TENDANCES
     ========================================================= */

  const trendingBoutiques =
    useMemo(
      () =>
        [...filteredBoutiques]
          .sort(
            (a, b) =>
              b.total_sales -
              a.total_sales,
          )
          .slice(0, 12),
      [filteredBoutiques],
    );

  /* =========================================================
     NOUVEAUTÉS
     ========================================================= */

  const newestBoutiques =
    useMemo(
      () =>
        [...filteredBoutiques]
          .sort(
            (a, b) =>
              new Date(
                b.created_at,
              ).getTime() -
              new Date(
                a.created_at,
              ).getTime(),
          )
          .slice(0, 12),
      [filteredBoutiques],
    );

  /* =========================================================
     CATÉGORIES
     ========================================================= */

  const boutiquesByCategory =
    useMemo(() => {
      const categories =
        new Map<
          string,
          StoreBoutique[]
        >();

      for (const boutique of filteredBoutiques) {
        const category =
          boutique.category ||
          "Autres";

        if (
          !categories.has(category)
        ) {
          categories.set(
            category,
            [],
          );
        }

        categories
          .get(category)!
          .push(boutique);
      }

      return Array.from(
        categories.entries(),
      );
    }, [filteredBoutiques]);

  /* =========================================================
     IMAGE HERO
     ========================================================= */

  const storeHeroImage =
    useMemo(
      () =>
        trendingBoutiques[0]
          ?.cover_image_url ||
        newestBoutiques[0]
          ?.cover_image_url ||
        boutiques[0]
          ?.cover_image_url ||
        "",
      [
        trendingBoutiques,
        newestBoutiques,
        boutiques,
      ],
    );

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const goToProducts = () => {
    const value = search.trim();

    navigate(
      value
        ? `/store/products?q=${encodeURIComponent(
            value,
          )}`
        : "/store/products",
    );
  };

  const goToOrders = () => {
    navigate("/store/orders");
  };

  const goToFavorites = () => {
    navigate("/store/favorites");
  };

  const goToCart = () => {
    navigate("/store/cart");
  };

  const goToAccount = () => {
    if (!user) {
      navigate("/store/login");
      return;
    }

    if (accountType !== "store") {
      navigate("/store/login");
      return;
    }

    navigate("/store/account");
  };

  const submitSearch = () => {
    const value = search.trim();

    navigate(
      value
        ? `/store/products?q=${encodeURIComponent(
            value,
          )}`
        : "/store/products",
    );
  };

  const activateAccount = () => {
    if (!user) {
      navigate("/store/signup");
      return;
    }

    if (accountType !== "store") {
      navigate("/store/signup");
      return;
    }

    navigate("/store/account");
  };

  const goToOrderTracking = () => {
    navigate("/order-tracking");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* =====================================================
          HEADER
         ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto flex min-h-[68px] max-w-7xl items-center gap-3 px-4 py-3">

          {/* LOGO */}

          <Link
            to="/store"
            aria-label="Accueil du Store BIB"
            className="shrink-0"
          >
            <Logo
              iconSize={30}
              asLink={false}
            />
          </Link>

          {/* NAVIGATION DESKTOP */}

          <nav className="hidden items-center gap-1 lg:flex">

            <button
              type="button"
              onClick={goToProducts}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                location.pathname.startsWith(
                  "/store/products",
                )
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Produits
            </button>

            {isSubscriber && (
              <button
                type="button"
                onClick={goToOrders}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  location.pathname.startsWith(
                    "/store/orders",
                  )
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Mes commandes
              </button>
            )}

            {isSubscriber && (
              <button
                type="button"
                onClick={goToFavorites}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  location.pathname.startsWith(
                    "/store/favorites",
                  )
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Favoris
              </button>
            )}
          </nav>

          {/* RECHERCHE */}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="relative mx-auto flex min-w-0 flex-1 lg:max-w-xl"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Rechercher une boutique, un produit…"
              className="h-10 rounded-full border-border bg-muted/50 pl-10 pr-11 text-sm focus-visible:ring-primary/40"
            />

            {search.trim() && (
              <button
                type="submit"
                aria-label="Valider la recherche"
                className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 active:scale-95"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* ACTIONS */}

          <div className="flex shrink-0 items-center gap-1">

            <button
              type="button"
              onClick={goToFavorites}
              aria-label="Favoris"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-95"
            >
              <Heart
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </button>

            {/* PANIER STORE */}

            <button
              type="button"
              onClick={goToCart}
              aria-label={`Panier${
                totalItems > 0
                  ? `, ${totalItems} article${
                      totalItems > 1
                        ? "s"
                        : ""
                    }`
                  : ""
              }`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-95"
            >
              <ShoppingCart
                className="h-5 w-5"
                strokeWidth={1.8}
              />

              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background">
                  {totalItems > 99
                    ? "99+"
                    : totalItems}
                </span>
              )}
            </button>

            {/* COMPTE */}

            <button
              type="button"
              onClick={goToAccount}
              aria-label="Compte"
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground transition hover:bg-muted/70 active:scale-95"
            >
              {user ? (
                <span>{initial}</span>
              ) : (
                <User className="h-5 w-5" />
              )}

              {user && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENU
         ===================================================== */}

      <main className="container mx-auto max-w-7xl px-4 pb-28 lg:pb-12">

        {/* HERO */}

        {!query && (
          <StoreIntro
            isSubscriber={isSubscriber}
            imageUrl={storeHeroImage}
            onPrimaryAction={goToProducts}
          />
        )}

        {/* COMPTE / SUIVI */}

        {!query && !isSubscriber && (
          <StoreAccountBar
            onActivateAccount={activateAccount}
            onTrackOrder={goToOrderTracking}
          />
        )}

        {/* CHARGEMENT */}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />

            <p className="text-sm">
              Chargement des boutiques…
            </p>
          </div>
        ) : filteredBoutiques.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-muted/30 px-5 py-16 text-center">
            <p className="text-lg font-semibold">
              Aucun résultat
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Essayez un autre mot-clé.
            </p>

            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : query ? (
          <Rail
            title={`Résultats pour "${search.trim()}"`}
            subtitle={`${filteredBoutiques.length} boutique${
              filteredBoutiques.length > 1
                ? "s"
                : ""
            }`}
            items={filteredBoutiques}
            showFilter
          />
        ) : (
          <>
            <Rail
              title="Tendances"
              subtitle="Les boutiques les plus populaires"
              items={trendingBoutiques}
              accent
              showFilter
            />

            <Rail
              title="Nouveautés"
              subtitle="Les dernières boutiques"
              items={newestBoutiques}
              showFilter
            />

            {boutiquesByCategory.map(
              ([category, categoryBoutiques]) => (
                <Rail
                  key={category}
                  title={category}
                  subtitle={`${categoryBoutiques.length} boutique${
                    categoryBoutiques.length > 1
                      ? "s"
                      : ""
                  }`}
                  items={categoryBoutiques}
                  showFilter
                />
              ),
            )}
          </>
        )}
      </main>

      {/* =====================================================
          NAVIGATION MOBILE
         ===================================================== */}

      {isSubscriber && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-3 pb-[env(safe-area-inset-bottom)]">

            <MobileNavButton
              label="Accueil"
              active={
                location.pathname === "/store"
              }
              onClick={() =>
                navigate("/store")
              }
            >
              <House
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </MobileNavButton>

            <MobileNavButton
              label="Produits"
              active={location.pathname.startsWith(
                "/store/products",
              )}
              onClick={goToProducts}
            >
              <Search
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </MobileNavButton>

            <MobileNavButton
              label="Commandes"
              active={location.pathname.startsWith(
                "/store/orders",
              )}
              onClick={goToOrders}
            >
              <ClipboardList
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </MobileNavButton>

            <MobileNavButton
              label="Plus"
              active={false}
              onClick={goToAccount}
            >
              <MoreHorizontal
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </MobileNavButton>
          </div>
        </nav>
      )}

      {/* =====================================================
          FOOTER
         ===================================================== */}

      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">

          <Logo
            iconSize={20}
            asLink={false}
          />

          <p>
            © {new Date().getFullYear()}{" "}
            Brand-In-A-Box · Store officiel
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

/* =========================================================
   HERO STORE
   ========================================================= */

interface StoreIntroProps {
  isSubscriber: boolean;
  imageUrl?: string;
  onPrimaryAction: () => void;
}

function StoreIntro({
  isSubscriber,
  imageUrl,
  onPrimaryAction,
}: StoreIntroProps) {
  return (
    <section className="mb-5 mt-6 overflow-hidden rounded-[28px] border border-border bg-[#f7f5f0] sm:mt-8">
      <div className="grid items-stretch lg:grid-cols-[1fr_0.9fr]">

        <div className="flex flex-col justify-center px-6 py-9 sm:px-8 sm:py-11 lg:px-10 lg:py-12">

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {isSubscriber
              ? "Votre espace BIB"
              : "Des marques engagées"}
          </p>

          <h1 className="max-w-xl font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-[42px]">
            {isSubscriber
              ? "Découvrez, suivez et retrouvez vos boutiques préférées."
              : "Des produits sélectionnés avec soin."}
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            {isSubscriber
              ? "Explorez de nouvelles boutiques, retrouvez vos favoris et gardez vos commandes au même endroit."
              : "Découvrez des boutiques indépendantes et des produits sélectionnés selon les exigences BIB."}
          </p>

          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-6 inline-flex h-11 w-fit items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
          >
            Découvrir les produits
          </button>
        </div>

        <div className="relative min-h-[230px] overflow-hidden bg-muted sm:min-h-[280px] lg:min-h-[340px]">

          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <span className="font-display text-5xl font-semibold text-foreground/10">
                BIB
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />

          <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm sm:right-6 sm:top-6">

            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-[9px] font-bold text-white">
              BIB
            </span>

            <span>
              Vérifié par BIB
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   COMPTE / SUIVI
   ========================================================= */

interface StoreAccountBarProps {
  onActivateAccount: () => void;
  onTrackOrder: () => void;
}

function StoreAccountBar({
  onActivateAccount,
  onTrackOrder,
}: StoreAccountBarProps) {
  return (
    <section className="mb-7 overflow-hidden rounded-2xl border border-border bg-muted/35">
      <div className="grid gap-0 sm:grid-cols-[1.25fr_1fr]">

        <div className="flex min-w-0 flex-col justify-between gap-4 px-4 py-4 sm:px-5 sm:py-4">

          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Activez votre compte BIB
            </p>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Suivez vos boutiques favorites, retrouvez vos commandes et profitez de votre espace BIB.
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

/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

interface MobileNavButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function MobileNavButton({
  label,
  active,
  onClick,
  children,
}: MobileNavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[11px] transition ${
        active
          ? "font-semibold text-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}

      <span>
        {label}
      </span>
    </button>
  );
}

/* =========================================================
   RAIL
   ========================================================= */

interface RailProps {
  title: string;
  subtitle?: string;
  items: StoreBoutique[];
  accent?: boolean;
  showFilter?: boolean;
}

function Rail({
  title,
  subtitle,
  items,
  accent,
  showFilter,
}: RailProps) {
  const railRef =
    useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return null;
  }

  const scroll = (
    direction: 1 | -1,
  ) => {
    const element =
      railRef.current;

    if (!element) {
      return;
    }

    element.scrollBy({
      left:
        direction *
        element.clientWidth *
        0.85,
      behavior: "smooth",
    });
  };

  const handleFilterClick = () => {
    window.dispatchEvent(
      new CustomEvent(
        "bib:open-store-filters",
        {
          detail: {
            section: title,
          },
        },
      ),
    );
  };

  return (
    <section className="mt-8 sm:mt-10">

      <div className="mb-3 flex items-center justify-between gap-3">

        <div className="min-w-0">

          <h2
            className={`font-display text-lg font-semibold leading-tight sm:text-xl ${
              accent
                ? "text-primary"
                : "text-foreground"
            }`}
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">

          {showFilter && (
            <button
              type="button"
              onClick={handleFilterClick}
              aria-label={`Filtrer ${title}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-muted active:scale-95"
            >
              <SlidersHorizontal
                className="h-4 w-4"
                strokeWidth={1.8}
              />
            </button>
          )}

          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={`Voir plus dans ${title}`}
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/70 active:scale-95 sm:flex"
          >
            <ChevronRight
              className="h-4 w-4"
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 scrollbar-none sm:gap-4"
      >
        {items.map((boutique) => (
          <div
            key={boutique.id}
            className="
              w-[210px]
              shrink-0
              snap-start
              sm:w-[220px]
              md:w-[230px]
              lg:w-[240px]
              xl:w-[250px]
            "
          >
            <BoutiqueCard
              boutique={boutique}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
