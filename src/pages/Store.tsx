import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Heart,
  Home,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import {
  useCustomerProfile,
} from "@/hooks/useCustomerProfile";
import { useStoreBoutiques } from "@/hooks/useStore";
import { useStoreCart } from "@/hooks/useStoreCart";

import StoreIntro from "@/components/store/StoreIntro";
import StoreAccountBar from "@/components/store/StoreAccountBar";
import BoutiqueCard from "@/components/store/BoutiqueCard";

const storeHeroImage =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85";

export default function Store() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { data: customerProfile } = useCustomerProfile();
  const { data: boutiques = [], isLoading } = useStoreBoutiques();
  const { items: cartItems = [] } = useStoreCart();

  const [search, setSearch] = useState("");
  const boutiquesRailRef = useRef<HTMLDivElement>(null);

  const isSubscriber = Boolean(customerProfile);

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total: number, item: any) =>
          total + Number(item.quantity ?? 1),
        0,
      ),
    [cartItems],
  );

  /**
   * ---------------------------------------------------------
   * Navigation
   * ---------------------------------------------------------
   */

  const goToProducts = () => {
    const value = search.trim();

    navigate(
      value
        ? `/store/products?q=${encodeURIComponent(value)}`
        : "/store/products",
    );
  };

  const submitSearch = () => {
    const value = search.trim();

    navigate(
      value
        ? `/store/products?q=${encodeURIComponent(value)}`
        : "/store/products",
    );
  };

  const goToOrders = () => {
    navigate("/store/orders");
  };

  const goToFavorites = () => {
    navigate("/store/favorites");
  };

  const goToAccount = () => {
    if (!user) {
      navigate("/store/login");
      return;
    }

    navigate("/store/account");
  };

  const scrollBoutiques = (direction: "left" | "right") => {
    const container = boutiquesRailRef.current;

    if (!container) return;

    const amount = Math.min(
      container.clientWidth * 0.8,
      720,
    );

    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  /**
   * ---------------------------------------------------------
   * Derived data
   * ---------------------------------------------------------
   */

  const featuredBoutiques = useMemo(() => {
    return boutiques.filter(Boolean);
  }, [boutiques]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/store"
            className="flex shrink-0 items-center gap-2"
            aria-label="BIB Store"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background">
              B
            </div>

            <span className="hidden text-sm font-semibold tracking-tight sm:block">
              BIB Store
            </span>
          </Link>

          {/* Search */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="mx-auto flex w-full max-w-xl items-center"
          >
            <div className="relative w-full">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un produit, une boutique..."
                aria-label="Rechercher dans BIB Store"
                className="h-10 w-full rounded-full border bg-muted/40 pl-10 pr-4 text-sm outline-none transition focus:border-foreground/30 focus:bg-background focus:ring-2 focus:ring-foreground/10"
              />
            </div>
          </form>

          {/* Desktop actions */}
          <nav
            aria-label="Navigation BIB Store"
            className="hidden items-center gap-1 lg:flex"
          >
            <button
              type="button"
              onClick={goToFavorites}
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition hover:bg-muted"
            >
              <Heart className="h-4 w-4" />
              <span>Favoris</span>
            </button>

            <button
              type="button"
              onClick={goToOrders}
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition hover:bg-muted"
            >
              <ClipboardList className="h-4 w-4" />
              <span>Commandes</span>
            </button>

            <button
              type="button"
              onClick={goToAccount}
              className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium transition hover:bg-muted"
            >
              <User className="h-4 w-4" />
              <span>Compte</span>
            </button>

            <Link
              to="/store/cart"
              className="relative ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted"
              aria-label={`Panier${cartCount > 0 ? `, ${cartCount} article${cartCount > 1 ? "s" : ""}` : ""}`}
            >
              <ShoppingBag className="h-5 w-5" />

              {cartCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="pb-24 lg:pb-10">
        {/* Hero */}
        <section className="mx-auto max-w-[1600px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
          <StoreIntro
            isSubscriber={isSubscriber}
            imageUrl={storeHeroImage}
            onPrimaryAction={goToProducts}
          />
        </section>

        {/* Account / subscription contextual bar */}
        <section className="mx-auto max-w-[1600px] px-4 pt-5 sm:px-6 lg:px-8">
          <StoreAccountBar
            isSubscriber={isSubscriber}
            user={user}
            onAccount={goToAccount}
          />
        </section>

        {/* ===================================================
            BOUTIQUES
            =================================================== */}

        <section
          aria-labelledby="boutiques-heading"
          className="mx-auto max-w-[1600px] px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14"
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                BIB Store
              </p>

              <h2
                id="boutiques-heading"
                className="text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                Découvrez les boutiques
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Explorez les boutiques sélectionnées et vérifiées par BIB,
                puis découvrez leurs produits.
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollBoutiques("left")}
                className="flex h-10 w-10 items-center justify-center rounded-full border bg-background transition hover:bg-muted"
                aria-label="Boutiques précédentes"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollBoutiques("right")}
                className="flex h-10 w-10 items-center justify-center rounded-full border bg-background transition hover:bg-muted"
                aria-label="Boutiques suivantes"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <div
              className="flex gap-4 overflow-hidden"
              aria-label="Chargement des boutiques"
            >
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="min-w-[260px] flex-1 animate-pulse overflow-hidden rounded-2xl border bg-muted/40 sm:min-w-[300px]"
                >
                  <div className="aspect-[4/3] bg-muted" />

                  <div className="space-y-3 p-4">
                    <div className="h-5 w-2/3 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredBoutiques.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-base font-semibold">
                Les boutiques arrivent bientôt
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Le catalogue BIB est en cours de préparation.
              </p>

              <button
                type="button"
                onClick={goToProducts}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Découvrir les produits
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              ref={boutiquesRailRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {featuredBoutiques.map((boutique) => (
                <div
                  key={boutique.id}
                  className="w-[82vw] max-w-[380px] shrink-0 snap-start sm:w-[360px] lg:w-[calc((100%-48px)/4)]"
                >
                  <BoutiqueCard boutique={boutique} />
                </div>
              ))}
            </div>
          )}

          {/* All boutiques */}
          {!isLoading && featuredBoutiques.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Link
                to="/store/boutiques"
                className="inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition hover:bg-muted"
              >
                Voir toutes les boutiques
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        {/* ===================================================
            PRODUCT DISCOVERY CTA
            =================================================== */}

        <section className="mx-auto max-w-[1600px] px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <div className="overflow-hidden rounded-3xl border bg-muted/30">
            <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Catalogue BIB
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Trouvez directement les produits qui vous intéressent.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Parcourez le catalogue global BIB, filtrez les produits et
                  consultez leur fiche avant de poursuivre votre parcours
                  auprès de la boutique concernée.
                </p>
              </div>

              <button
                type="button"
                onClick={goToProducts}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Découvrir les produits
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================
          MOBILE NAVIGATION
          ===================================================== */}

      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
          <MobileNavButton
            icon={<Home className="h-5 w-5" />}
            label="Accueil"
            active
            onClick={() => navigate("/store")}
          />

          <MobileNavButton
            icon={<Search className="h-5 w-5" />}
            label="Produits"
            onClick={goToProducts}
          />

          <MobileNavButton
            icon={
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />

                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[9px] font-bold text-background">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
            }
            label="Panier"
            onClick={() => navigate("/store/cart")}
          />

          <MobileNavButton
            icon={<ClipboardList className="h-5 w-5" />}
            label="Commandes"
            onClick={goToOrders}
          />

          <MobileNavButton
            icon={<User className="h-5 w-5" />}
            label="Compte"
            onClick={goToAccount}
          />
        </div>
      </nav>
    </div>
  );
}

/* ===========================================================
   MOBILE NAV BUTTON
   =========================================================== */

function MobileNavButton({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col items-center justify-center gap-1 text-[10px] transition",
        active
          ? "font-semibold text-foreground"
          : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
