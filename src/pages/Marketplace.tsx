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
  const { data: boutiques = [], isLoading } =
    useMarketplaceBoutiques();

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(
    searchParams.get("q") ?? "",
  );

  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const { data: customer } = useCustomerProfile();

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] =
    useState<CustomerPanelTab>("favorites");

  /*
   * TEMPORAIRE :
   * Tout utilisateur connecté est considéré comme abonné.
   *
   * À remplacer par le vrai champ d'abonnement lorsque celui-ci
   * sera disponible dans useCustomerProfile().
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

  const openPanel = (
    tab: CustomerPanelTab = "favorites",
  ) => {
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
    title: "Store BIB — Boutiques et produits sélectionnés",
    description:
      "Découvrez les boutiques et produits sélectionnés par Brand-In-A-Box.",
  });

  const query = search.trim().toLowerCase();

  const filteredBoutiques = useMemo(() => {
    if (!query) {
      return boutiques;
    }

    return boutiques.filter((boutique) => {
      const searchableContent = [
        boutique.name,
        boutique.category,
        boutique.tagline,
        boutique.description,
        ...boutique.product_previews.map(
          (product) => product.name,
        ),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(query);
    });
  }, [boutiques, query]);

  const trendingBoutiques = useMemo(
    () =>
      [...filteredBoutiques]
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 12),
    [filteredBoutiques],
  );

  const newestBoutiques = useMemo(
    () =>
      [...filteredBoutiques]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        )
        .slice(0, 12),
    [filteredBoutiques],
  );

  const boutiquesByCategory = useMemo(() => {
    const categories = new Map<
      string,
      MarketplaceBoutique[]
    >();

    for (const boutique of filteredBoutiques) {
      const category = boutique.category || "Autres";

      if (!categories.has(category)) {
        categories.set(category, []);
      }

      categories.get(category)!.push(boutique);
    }

    return Array.from(categories.entries());
  }, [filteredBoutiques]);

  const goToProducts = () => {
    navigate(
      search.trim()
        ? `/store/products?q=${encodeURIComponent(
            search.trim(),
          )}`
        : "/store/products",
    );
  };

  const goToOrders = () => {
    navigate("/store/orders");
  };

  const goToMore = () => {
    openPanel("favorites");
  };

  const goToSearch = () => {
    if (!search.trim()) {
      goToProducts();
      return;
    }

    navigate(
      `/store?q=${encodeURIComponent(search.trim())}`,
    );
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
            aria-label="Accueil BIB"
            className="shrink-0"
          >
            <Logo iconSize={30} asLink={false} />
          </Link>

          {/* NAVIGATION DESKTOP */}

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              to="/store"
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                location.pathname === "/store"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Accueil
            </Link>

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
                onClick={goToMore}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Plus
              </button>
            )}
          </nav>

          {/* RECHERCHE */}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              goToSearch();
            }}
            className="relative mx-auto flex min-w-0 flex-1 lg:max-w-xl"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
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
              onClick={() => openPanel("favorites")}
              aria-label="Favoris"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-95"
            >
              <Heart className="h-5 w-5" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/store/cart")}
              aria-label="Panier"
              className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-95"
            >
              <ShoppingCart
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </button>

            <button
              type="button"
              onClick={() => openPanel("favorites")}
              aria-label="Profil"
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
          CONTENU PRINCIPAL
         ===================================================== */}

      <main className="container mx-auto max-w-7xl px-4 pb-28 lg:pb-12">
        {/* INTRODUCTION ADAPTÉE */}

        {!query && (
          <MarketplaceIntro
            isSubscriber={isSubscriber}
            onPrimaryAction={goToProducts}
          />
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />

            <p className="text-sm">
              Chargement des boutiques…
            </p>
          </div>
        ) : filteredBoutiques.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-muted/30 px-5 py-16 text-center">
            <p className="text-lg font-semibold text-foreground">
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
              filteredBoutiques.length > 1 ? "s" : ""
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
          BARRE BASSE :
          ABONNÉ UNIQUEMENT + FORMAT TÉLÉPHONE UNIQUEMENT
         ===================================================== */}

      {isSubscriber && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-3 pb-[env(safe-area-inset-bottom)]">
            <MobileNavButton
              label="Accueil"
              active={location.pathname === "/store"}
              onClick={() => navigate("/store")}
            >
              <House className="h-5 w-5" strokeWidth={1.8} />
            </MobileNavButton>

            <MobileNavButton
              label="Produits"
              active={location.pathname.startsWith(
                "/store/products",
              )}
              onClick={goToProducts}
            >
              <Search className="h-5 w-5" strokeWidth={1.8} />
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
              onClick={goToMore}
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
          PANEL CLIENT
         ===================================================== */}

      <CustomerPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        initialTab={panelTab}
      />

      {/* =====================================================
          FOOTER
         ===================================================== */}

      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
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

/* =========================================================
   INTRODUCTION MARKETPLACE
   ========================================================= */

interface MarketplaceIntroProps {
  isSubscriber: boolean;
  onPrimaryAction: () => void;
}

function MarketplaceIntro({
  isSubscriber,
  onPrimaryAction,
}: MarketplaceIntroProps) {
  return (
    <section className="mb-10 mt-6 overflow-hidden rounded-[28px] border border-border bg-muted/30 sm:mt-8">
      <div className="grid items-center gap-6 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-12">
        <div className="max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {isSubscriber
              ? "Votre espace BIB"
              : "Des marques engagées"}
          </p>

          <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-[42px]">
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
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
          >
            {isSubscriber
              ? "Explorer les produits"
              : "Découvrir les boutiques"}
          </button>
        </div>

        <div className="hidden min-h-[220px] items-center justify-center rounded-3xl bg-background/80 lg:flex">
          <div className="text-center">
            <p className="font-display text-6xl font-semibold tracking-tight text-foreground">
              BIB
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Des boutiques sélectionnées avec soin
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MOBILE NAVIGATION BUTTON
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
      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   RAIL DE BOUTIQUES
   ========================================================= */

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
  const railRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) {
    return null;
  }

  const scroll = (direction: 1 | -1) => {
    const element = railRef.current;

    if (!element) {
      return;
    }

    element.scrollBy({
      left: direction * element.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  const handleFilterClick = () => {
    /*
     * Le bouton est volontairement contextuel.
     *
     * Le panneau de filtres réel pourra ensuite être branché
     * selon la section :
     * - Tendances : popularité, vérifiées, catégorie
     * - Nouveautés : date, catégorie, vérifiées
     * - Produits : prix croissant, prix décroissant, etc.
     *
     * Pour le moment, on dirige vers la page Produits afin
     * d'éviter un bouton visuellement présent mais sans action.
     */
    if (title === "Tendances" || title === "Nouveautés") {
      window.dispatchEvent(
        new CustomEvent("bib:open-marketplace-filters", {
          detail: {
            section: title,
          },
        }),
      );
    }
  };

  return (
    <section className="mt-8 sm:mt-10">
      {/* TITRE DE SECTION */}

      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            className={`font-display text-lg font-semibold leading-tight sm:text-xl ${
              accent ? "text-primary" : "text-foreground"
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

      {/* CARTES */}

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
            <BoutiqueCard boutique={boutique} />
          </div>
        ))}
      </div>
    </section>
  );
}
