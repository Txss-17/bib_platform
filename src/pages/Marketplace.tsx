import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
} from "lucide-react";

import {
  useMarketplaceBoutiques,
  type MarketplaceBoutique,
} from "@/hooks/useMarketplace";
import { BoutiqueCard } from "@/components/marketplace/BoutiqueCard";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import {
  CustomerPanel,
  type CustomerPanelTab,
} from "@/components/marketplace/CustomerPanel";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";

export default function Marketplace() {
  const { data: boutiques = [], isLoading } = useMarketplaceBoutiques();

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: customer } = useCustomerProfile();

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] =
    useState<CustomerPanelTab>("favorites");

  /*
   * IMPORTANT
   *
   * Ici on considère l'utilisateur connecté comme pouvant accéder
   * à l'expérience abonné.
   *
   * Lorsque le champ réel du statut d'abonnement sera disponible
   * dans useCustomerProfile(), remplacer cette ligne par le champ
   * correspondant, par exemple :
   *
   * const isSubscriber = customer?.subscription_status === "active";
   */
  const isSubscriber = Boolean(user);

  const initial = (
    customer?.full_name ||
    user?.email ||
    "?"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  const openPanel = (tab: CustomerPanelTab = "favorites") => {
    setPanelTab(tab);
    setPanelOpen(true);
  };

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    if (search.trim()) {
      next.set("q", search.trim());
    } else {
      next.delete("q");
    }

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useSEO({
    title: "Store BIB — Recherche boutiques Brand-In-A-Box",
    description:
      "Découvrez les boutiques et produits sélectionnés par Brand-In-A-Box.",
  });

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return boutiques;

    return boutiques.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.tagline ?? "").toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q) ||
        b.product_previews.some((p) =>
          p.name.toLowerCase().includes(q),
        ),
    );
  }, [boutiques, q]);

  const byCategory = useMemo(() => {
    const map = new Map<string, MarketplaceBoutique[]>();

    for (const boutique of filtered) {
      const category = boutique.category || "Autres";

      if (!map.has(category)) {
        map.set(category, []);
      }

      map.get(category)!.push(boutique);
    }

    return Array.from(map.entries());
  }, [filtered]);

  const trending = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 12),
    [filtered],
  );

  const newest = useMemo(
    () =>
      [...filtered]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )
        .slice(0, 12),
    [filtered],
  );

  const goToProducts = () => {
    navigate(
      search.trim()
        ? `/store/products?q=${encodeURIComponent(search.trim())}`
        : "/store/products",
    );
  };

  const goToOrders = () => {
    navigate("/store/orders");
  };

  const goToMore = () => {
    openPanel("favorites");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* =========================================================
          HEADER
         ========================================================= */}

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto flex h-[64px] max-w-6xl items-center gap-3 px-4">
          {/* LOGO */}

          <Link
            to="/store"
            className="shrink-0"
            aria-label="Accueil BIB"
          >
            <Logo iconSize={30} asLink={false} />
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              to="/store"
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Accueil
            </Link>

            <button
              type="button"
              onClick={goToProducts}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Produits
            </button>

            {isSubscriber && (
              <button
                type="button"
                onClick={goToOrders}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Mes commandes
              </button>
            )}

            {isSubscriber && (
              <button
                type="button"
                onClick={goToMore}
                className="rounded-full px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Plus
              </button>
            )}
          </nav>

          {/* SEARCH */}

          <form
            onSubmit={(event) => {
              event.preventDefault();

              if (search.trim()) {
                navigate(
                  `/store?q=${encodeURIComponent(search.trim())}`,
                );
              }
            }}
            className="relative mx-auto flex min-w-0 flex-1 lg:max-w-xl"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une boutique, un produit…"
              className="h-10 rounded-full border-border bg-muted/50 pl-10 pr-10 text-sm focus-visible:ring-primary/40"
            />

            {search && (
              <button
                type="submit"
                aria-label="Rechercher"
                className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* ACTIONS */}

          <div className="flex shrink-0 items-center gap-1">
            {/* FAVORIS */}

            <button
              type="button"
              onClick={() => openPanel("favorites")}
              aria-label="Favoris"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-95"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* PANIER */}

            <button
              type="button"
              onClick={() => navigate("/store/cart")}
              aria-label="Panier"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>

            {/* PROFIL */}

            <button
              type="button"
              onClick={() => openPanel("favorites")}
              aria-label="Mon profil"
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

      {/* =========================================================
          CONTENT
         ========================================================= */}

      <main className="container mx-auto max-w-6xl px-4 pb-28 lg:pb-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">
              Chargement des boutiques…
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-muted/30 py-16 text-center">
            <p className="text-lg font-semibold text-foreground">
              Aucun résultat
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Essayez un autre mot-clé.
            </p>
          </div>
        ) : (
          <>
            {q ? (
              <Rail
                title={`Résultats pour "${search.trim()}"`}
                subtitle={`${filtered.length} boutique${
                  filtered.length > 1 ? "s" : ""
                }`}
                items={filtered}
                showFilter
              />
            ) : (
              <>
                {/* TENDANCES */}

                <Rail
                  title="Tendances"
                  subtitle="Les boutiques les plus populaires"
                  items={trending}
                  accent
                  showFilter
                />

                {/* NOUVEAUTÉS */}

                <Rail
                  title="Nouveautés"
                  subtitle="Les dernières boutiques"
                  items={newest}
                  showFilter
                />

                {/* CATÉGORIES */}

                {byCategory.map(([category, items]) => (
                  <Rail
                    key={category}
                    title={category}
                    subtitle={`${items.length} boutique${
                      items.length > 1 ? "s" : ""
                    }`}
                    items={items}
                    showFilter
                  />
                ))}
              </>
            )}
          </>
        )}
      </main>

      {/* =========================================================
          MOBILE BOTTOM NAVIGATION
          UNIQUEMENT POUR LES ABONNÉS
         ========================================================= */}

      {isSubscriber && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] lg:hidden">
          <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-3">
            {/* ACCUEIL */}

            <MobileNavButton
              label="Accueil"
              active={location.pathname === "/store"}
              onClick={() => navigate("/store")}
            >
              <House className="h-5 w-5" />
            </MobileNavButton>

            {/* PRODUITS */}

            <MobileNavButton
              label="Produits"
              active={location.pathname.startsWith("/store/products")}
              onClick={goToProducts}
            >
              <Search className="h-5 w-5" />
            </MobileNavButton>

            {/* COMMANDES */}

            <MobileNavButton
              label="Commandes"
              active={location.pathname.startsWith("/store/orders")}
              onClick={goToOrders}
            >
              <ClipboardList className="h-5 w-5" />
            </MobileNavButton>

            {/* PLUS */}

            <MobileNavButton
              label="Plus"
              active={false}
              onClick={goToMore}
            >
              <MoreHorizontal className="h-5 w-5" />
            </MobileNavButton>
          </div>
        </nav>
      )}

      {/* =========================================================
          CUSTOMER PANEL
         ========================================================= */}

      <CustomerPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        initialTab={panelTab}
      />

      {/* =========================================================
          FOOTER
         ========================================================= */}

      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <Logo iconSize={20} asLink={false} />

          <p>
            © {new Date().getFullYear()} Brand-In-A-Box ·
            Marketplace officiel
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

/* =============================================================
   MOBILE NAV BUTTON
   ============================================================= */

interface MobileNavButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
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
      <span>{label}</span>
    </button>
  );
}

/* =============================================================
   BOUTIQUE RAIL
   ============================================================= */

interface RailProps {
  title: string;
  subtitle?: string;
  items: MarketplaceBoutique[];
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
  const ref = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scroll = (direction: 1 | -1) => {
    const element = ref.current;

    if (!element) return;

    element.scrollBy({
      left: direction * element.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-10">
      {/* SECTION HEADER */}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            className={`font-display text-xl font-semibold leading-tight ${
              accent
                ? "text-primary"
                : "text-foreground"
            }`}
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* FILTRE CONTEXTUEL */}

          {showFilter && (
            <button
              type="button"
              aria-label={`Filtrer ${title}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-muted active:scale-95"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          )}

          {/* SCROLL DESKTOP */}

          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Suivant"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-muted/70 sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CARDS */}

      <div className="relative">
        <div
          ref={ref}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 scrollbar-none"
        >
          {items.map((boutique) => (
            <div
              key={boutique.id}
              className="w-[260px] shrink-0 snap-start sm:w-[280px] lg:w-[300px] xl:w-[310px]"
            >
              <BoutiqueCard boutique={boutique} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
