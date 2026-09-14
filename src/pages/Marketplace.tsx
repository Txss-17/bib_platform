import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  ClipboardList,
  House,
  MoreHorizontal,
  Search,
  ShoppingCart,
  User,
  X,
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

type MainView = "home" | "products";

type FilterType =
  | "all"
  | "boutiques"
  | "products"
  | "verified"
  | "new";

export default function Marketplace() {
  const { data: boutiques = [], isLoading } =
    useMarketplaceBoutiques();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { data: customer } = useCustomerProfile();

  const [search, setSearch] = useState(
    searchParams.get("q") ?? "",
  );

  const [view, setView] = useState<MainView>(
    searchParams.get("view") === "products"
      ? "products"
      : "home",
  );

  const [filter, setFilter] = useState<FilterType>(
    (searchParams.get("filter") as FilterType) || "all",
  );

  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] =
    useState<CustomerPanelTab>("favorites");

  const [moreOpen, setMoreOpen] = useState(false);

  const initial =
    (customer?.full_name || user?.email || "?")
      .trim()
      .charAt(0)
      .toUpperCase();

  useSEO({
    title: "Store BIB — Brand-In-A-Box",
    description:
      "Découvrez les boutiques et produits disponibles sur BIB.",
  });

  /* --------------------------------
     URL SYNCHRONISATION
  -------------------------------- */

  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (search.trim()) {
      params.set("q", search.trim());
    } else {
      params.delete("q");
    }

    if (view === "products") {
      params.set("view", "products");
    } else {
      params.delete("view");
    }

    if (filter !== "all") {
      params.set("filter", filter);
    } else {
      params.delete("filter");
    }

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, view, filter]);

  /* --------------------------------
     PANELS
  -------------------------------- */

  const openPanel = (
    tab: CustomerPanelTab = "favorites",
  ) => {
    setPanelTab(tab);
    setPanelOpen(true);
    setMoreOpen(false);
  };

  /* --------------------------------
     RECHERCHE
  -------------------------------- */

  const q = search.trim().toLowerCase();

  const filteredBoutiques = useMemo(() => {
    let result = boutiques;

    if (q) {
      result = result.filter((boutique) => {
        const boutiqueMatch =
          boutique.name.toLowerCase().includes(q) ||
          (boutique.category ?? "")
            .toLowerCase()
            .includes(q) ||
          (boutique.tagline ?? "")
            .toLowerCase()
            .includes(q) ||
          (boutique.description ?? "")
            .toLowerCase()
            .includes(q);

        const productMatch =
          boutique.product_previews?.some((product) =>
            product.name.toLowerCase().includes(q),
          ) ?? false;

        return boutiqueMatch || productMatch;
      });
    }

    if (filter === "verified") {
      result = result.filter(
        (boutique) => boutique.has_protection,
      );
    }

    if (filter === "new") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );
    }

    return result;
  }, [boutiques, q, filter]);

  /* --------------------------------
     TENDANCES / NOUVEAUTÉS
  -------------------------------- */

  const trending = useMemo(
    () =>
      [...filteredBoutiques]
        .sort((a, b) => b.total_sales - a.total_sales)
        .slice(0, 12),
    [filteredBoutiques],
  );

  const newest = useMemo(
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

  const byCategory = useMemo(() => {
    const map = new Map<string, MarketplaceBoutique[]>();

    for (const boutique of filteredBoutiques) {
      const category = boutique.category || "Autres";

      if (!map.has(category)) {
        map.set(category, []);
      }

      map.get(category)!.push(boutique);
    }

    return Array.from(map.entries());
  }, [filteredBoutiques]);

  /* --------------------------------
     NAVIGATION PRINCIPALE
  -------------------------------- */

  const goHome = () => {
    setView("home");
    setFilter("all");
    setMoreOpen(false);
  };

  const goProducts = () => {
    setView("products");
    setMoreOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* =====================================
          HEADER
      ===================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-border/60
          bg-background/95
          backdrop-blur
          pt-[env(safe-area-inset-top)]
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            gap-3
            px-4
            py-3
          "
        >
          {/* LOGO */}
          <Link
            to="/store"
            onClick={goHome}
            className="shrink-0"
            aria-label="BIB Store"
          >
            <Logo iconSize={30} asLink={false} />
          </Link>

          {/* NAVIGATION DESKTOP */}
          <nav className="hidden items-center gap-1 lg:flex">
            <DesktopNavButton
              active={view === "home"}
              onClick={goHome}
              icon={<House className="h-4 w-4" />}
              label="Accueil"
            />

            <DesktopNavButton
              active={view === "products"}
              onClick={goProducts}
              icon={<Search className="h-4 w-4" />}
              label="Produits"
            />

            <DesktopNavButton
              onClick={() => openPanel("favorites")}
              icon={<ClipboardList className="h-4 w-4" />}
              label="Commandes"
            />

            <div className="relative">
              <DesktopNavButton
                onClick={() =>
                  setMoreOpen((current) => !current)
                }
                icon={
                  <MoreHorizontal className="h-4 w-4" />
                }
                label="Plus"
              />

              {moreOpen && (
                <MoreMenu
                  onFavorites={() => openPanel("favorites")}
                  onClose={() => setMoreOpen(false)}
                />
              )}
            </div>
          </nav>

          {/* RECHERCHE */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setView("products");
            }}
            className="relative ml-auto flex-1 lg:max-w-xl"
          >
            <Search
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher une boutique ou un produit"
              className="
                h-10
                rounded-full
                border-border
                bg-muted/40
                pl-10
                pr-10
                text-sm
                focus-visible:ring-primary/30
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Effacer la recherche"
                className="
                  absolute
                  right-3
                  top-1/2
                  flex
                  -translate-y-1/2
                  items-center
                  justify-center
                  text-muted-foreground
                  hover:text-foreground
                "
              >
                <X className="h-4 w-4" />
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
              className="
                hidden
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-foreground
                transition
                hover:bg-muted
                sm:flex
              "
            >
              ♡
            </button>

            {/* PANIER */}
            <button
              type="button"
              aria-label="Panier"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-foreground
                transition
                hover:bg-muted
              "
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </button>

            {/* PROFIL */}
            <button
              type="button"
              onClick={() => openPanel("favorites")}
              aria-label="Mon profil"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-muted
                text-foreground
                transition
                hover:bg-muted/70
              "
            >
              {user ? (
                <span className="text-xs font-semibold">
                  {initial}
                </span>
              ) : (
                <User className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* FILTRES */}
        <div
          className="
            mx-auto
            max-w-7xl
            overflow-x-auto
            px-4
            pb-3
            scrollbar-none
          "
        >
          <div className="flex min-w-max gap-2">
            <FilterButton
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="Tout"
            />

            <FilterButton
              active={filter === "boutiques"}
              onClick={() => {
                setFilter("boutiques");
                setView("home");
              }}
              label="Boutiques"
            />

            <FilterButton
              active={filter === "products"}
              onClick={() => {
                setFilter("products");
                setView("products");
              }}
              label="Produits"
            />

            <FilterButton
              active={filter === "verified"}
              onClick={() => setFilter("verified")}
              label="Vérifiées"
            />

            <FilterButton
              active={filter === "new"}
              onClick={() => setFilter("new")}
              label="Nouveautés"
            />
          </div>
        </div>
      </header>

      {/* =====================================
          CONTENU
      ===================================== */}

      <main
        className="
          mx-auto
          max-w-7xl
          px-4
          pb-28
          lg:pb-16
        "
      >
        {isLoading ? (
          <LoadingState />
        ) : view === "products" ? (
          <ProductsView
            boutiques={filteredBoutiques}
            search={search}
          />
        ) : filteredBoutiques.length === 0 ? (
          <EmptyState search={search} />
        ) : q ? (
          <Rail
            title={`Résultats pour "${search.trim()}"`}
            subtitle={`${filteredBoutiques.length} boutique${
              filteredBoutiques.length > 1 ? "s" : ""
            }`}
            items={filteredBoutiques}
          />
        ) : (
          <>
            <Rail
              title="Tendances"
              items={trending}
              accent
            />

            <Rail
              title="Nouveautés"
              items={newest}
            />

            {byCategory.map(([category, items]) => (
              <Rail
                key={category}
                title={category}
                items={items}
              />
            ))}
          </>
        )}
      </main>

      {/* =====================================
          FOOTER DESKTOP
      ===================================== */}

      <footer className="hidden border-t border-border bg-muted/20 lg:block">
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-4
            py-6
            text-xs
            text-muted-foreground
          "
        >
          <Logo iconSize={20} asLink={false} />

          <span>
            © {new Date().getFullYear()} Brand-In-A-Box
          </span>
        </div>
      </footer>

      {/* =====================================
          NAVIGATION MOBILE
      ===================================== */}

      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          border-t
          border-border/70
          bg-background/95
          backdrop-blur
          pb-[env(safe-area-inset-bottom)]
          lg:hidden
        "
      >
        <div className="mx-auto grid max-w-lg grid-cols-4">
          <MobileNavButton
            active={view === "home"}
            onClick={goHome}
            icon={<House />}
            label="Accueil"
          />

          <MobileNavButton
            active={view === "products"}
            onClick={goProducts}
            icon={<Search />}
            label="Produits"
          />

          <MobileNavButton
            onClick={() => openPanel("favorites")}
            icon={<ClipboardList />}
            label="Commandes"
          />

          <MobileNavButton
            onClick={() => setMoreOpen((current) => !current)}
            active={moreOpen}
            icon={<MoreHorizontal />}
            label="Plus"
          />
        </div>

        {moreOpen && (
          <div className="border-t border-border bg-background px-4 py-3">
            <MoreMenu
              onFavorites={() => openPanel("favorites")}
              onClose={() => setMoreOpen(false)}
              mobile
            />
          </div>
        )}
      </nav>

      {/* CUSTOMER PANEL */}
      <CustomerPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        initialTab={panelTab}
      />
    </div>
  );
}

/* ==========================================
   DESKTOP NAV
========================================== */

function DesktopNavButton({
  icon,
  label,
  active,
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
      className={`
        flex
        items-center
        gap-2
        rounded-full
        px-3
        py-2
        text-sm
        transition
        ${
          active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/* ==========================================
   MOBILE NAV
========================================== */

function MobileNavButton({
  icon,
  label,
  active,
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
      className={`
        relative
        flex
        min-h-[58px]
        flex-col
        items-center
        justify-center
        gap-1
        text-[10px]
        transition
        ${
          active
            ? "text-foreground"
            : "text-muted-foreground"
        }
      `}
    >
      <span
        className={`
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          transition
          ${active ? "bg-muted" : ""}
        `}
      >
        {icon}
      </span>

      <span>{label}</span>

      {active && (
        <span
          className="
            absolute
            bottom-1
            h-0.5
            w-5
            rounded-full
            bg-foreground
          "
        />
      )}
    </button>
  );
}

/* ==========================================
   FILTRES
========================================== */

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        whitespace-nowrap
        rounded-full
        border
        px-3.5
        py-1.5
        text-xs
        font-medium
        transition
        ${
          active
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
        }
      `}
    >
      {label}
    </button>
  );
}

/* ==========================================
   PLUS
========================================== */

function MoreMenu({
  onFavorites,
  onClose,
  mobile = false,
}: {
  onFavorites: () => void;
  onClose: () => void;
  mobile?: boolean;
}) {
  return (
    <div
      className={
        mobile
          ? "grid grid-cols-2 gap-2"
          : `
            absolute
            right-0
            top-full
            z-50
            mt-2
            w-56
            rounded-2xl
            border
            border-border
            bg-background
            p-2
            shadow-xl
          `
      }
    >
      <MoreMenuButton
        label="Cartes cadeaux"
        onClick={() => {
          onClose();
        }}
      />

      <MoreMenuButton
        label="Favoris"
        onClick={onFavorites}
      />

      <MoreMenuButton
        label="Programme recyclage"
        onClick={onClose}
      />

      <MoreMenuButton
        label="Mes points"
        onClick={onClose}
      />
    </div>
  );
}

function MoreMenuButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        rounded-xl
        px-3
        py-2.5
        text-left
        text-sm
        text-foreground
        transition
        hover:bg-muted
      "
    >
      {label}
    </button>
  );
}

/* ==========================================
   RAIL
========================================== */

interface RailProps {
  title: string;
  subtitle?: string;
  items: MarketplaceBoutique[];
  accent?: boolean;
}

function Rail({
  title,
  subtitle,
  items,
  accent,
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
    <section className="mt-8 lg:mt-10">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2
            className={`
              font-display
              text-xl
              font-semibold
              leading-tight
              ${
                accent
                  ? "text-foreground"
                  : "text-foreground"
              }
            `}
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Voir la suite"
          className="
            hidden
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-border
            text-foreground
            transition
            hover:bg-muted
            sm:flex
          "
        >
          →
        </button>
      </div>

      <div
        ref={ref}
        className="
          -mx-4
          flex
          snap-x
          snap-mandatory
          gap-4
          overflow-x-auto
          px-4
          pb-2
          scrollbar-none
        "
      >
        {items.map((boutique) => (
          <div
            key={boutique.id}
            className="
              w-[260px]
              shrink-0
              snap-start
              sm:w-[280px]
              lg:w-[300px]
              xl:w-[310px]
            "
          >
            <BoutiqueCard boutique={boutique} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ==========================================
   PRODUITS
========================================== */

function ProductsView({
  boutiques,
  search,
}: {
  boutiques: MarketplaceBoutique[];
  search: string;
}) {
  const products = useMemo(() => {
    const result: Array<{
      id: string;
      name: string;
      image_url?: string | null;
      price: number;
      boutiqueName: string;
      boutiqueSlug: string;
      productId: string;
    }> = [];

    for (const boutique of boutiques) {
      for (const product of boutique.product_previews ?? []) {
        if (
          !search.trim() ||
          product.name
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        ) {
          result.push({
            id: `${boutique.id}-${product.id}`,
            name: product.name,
            image_url: product.image_url,
            price: product.price,
            boutiqueName: boutique.name,
            boutiqueSlug: boutique.slug,
            productId: product.id,
          });
        }
      }
    }

    return result;
  }, [boutiques, search]);

  return (
    <section className="pt-8">
      <div className="mb-5">
        <h1 className="font-display text-2xl font-semibold">
          Produits
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {search
            ? `Résultats pour « ${search} »`
            : "Découvrez les produits disponibles."}
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState search={search} />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/boutique/${product.boutiqueSlug}/product/${product.productId}`}
              className="
                overflow-hidden
                rounded-2xl
                border
                border-border/60
                bg-card
                transition
                hover:-translate-y-0.5
                hover:shadow-md
              "
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Image indisponible
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="truncate text-sm font-medium">
                  {product.name}
                </p>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {product.boutiqueName}
                </p>

                <p className="mt-2 text-sm font-semibold">
                  {product.price.toFixed(2)} €
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/* ==========================================
   ÉTATS
========================================== */

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-sm text-muted-foreground">
        Chargement…
      </div>
    </div>
  );
}

function EmptyState({
  search,
}: {
  search: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-lg font-semibold">
        Aucun résultat
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        {search
          ? "Essayez une autre recherche."
          : "Aucun contenu disponible pour le moment."}
      </p>
    </div>
  );
}
