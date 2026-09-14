import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Menu,
  Search,
  Heart,
  ShoppingBag,
  User,
  Check,
  ChevronRight,
  Loader2,
  X,
  Store,
  Sparkles,
  Package,
  Gift,
  Recycle,
  Star,
  Settings,
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] =
    useState<CustomerPanelTab>("favorites");

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
    setMenuOpen(false);
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
    title: "Store BIB",
    description:
      "Découvrez les boutiques et produits sélectionnés sur BIB.",
  });

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return boutiques;

    return boutiques.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.tagline ?? "").toLowerCase().includes(q) ||
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* =========================================================
          NAVIGATION
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto max-w-7xl px-3 sm:px-4">
          <div className="flex h-16 items-center gap-2 sm:gap-4">

            {/* MENU */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-muted active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* LOGO BIB — EXISTANT, NON MODIFIÉ */}
            <Link
              to="/store"
              aria-label="Store BIB"
              className="shrink-0"
            >
              <Logo
                iconSize={30}
                asLink={false}
              />
            </Link>

            {/* SEARCH */}
            <form
              onSubmit={(e) => {
                e.preventDefault();

                const value = search.trim();

                if (value) {
                  navigate(
                    `/store?q=${encodeURIComponent(value)}`,
                  );
                }
              }}
              className="relative mx-auto hidden max-w-2xl flex-1 md:block"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Rechercher..."
                className="h-10 rounded-full border-border bg-muted/50 pl-10 pr-4 text-sm focus-visible:ring-primary/40"
              />
            </form>

            {/* ACTIONS */}
            <div className="ml-auto flex shrink-0 items-center gap-1">

              {/* FAVORIS */}
              <NavIconButton
                label="Favoris"
                onClick={() => openPanel("favorites")}
              >
                <Heart className="h-[19px] w-[19px]" />
              </NavIconButton>

              {/* PANIER */}
              <NavIconButton
                label="Panier"
                onClick={() => openPanel("cart")}
                badge={0}
              >
                <ShoppingBag className="h-[19px] w-[19px]" />
              </NavIconButton>

              {/* PROFIL */}
              <button
                type="button"
                onClick={() => openPanel("profile")}
                aria-label="Mon espace"
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-muted/70 active:scale-95"
              >
                {user ? (
                  <span className="font-display text-sm font-semibold">
                    {initial}
                  </span>
                ) : (
                  <User className="h-[19px] w-[19px]" />
                )}

                {user && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                )}
              </button>
            </div>
          </div>

          {/* MOBILE SEARCH */}
          <div className="pb-3 md:hidden">
            <form
              onSubmit={(e) => {
                e.preventDefault();

                const value = search.trim();

                if (value) {
                  navigate(
                    `/store?q=${encodeURIComponent(value)}`,
                  );
                }
              }}
              className="relative"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Rechercher..."
                className="h-10 rounded-full border-border bg-muted/50 pl-10 pr-10 text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label="Effacer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>
        </div>
      </header>

      {/* =========================================================
          SIDE MENU
      ========================================================= */}

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />

          <aside className="relative flex h-full w-[min(88vw,360px)] flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo
                iconSize={28}
                asLink={false}
              />

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">

              <MenuSection title="Découvrir">
                <MenuItem
                  icon={<Store />}
                  label="Boutiques"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/store");
                  }}
                />

                <MenuItem
                  icon={<Sparkles />}
                  label="Tendances"
                  onClick={() => {
                    setMenuOpen(false);
                    document
                      .getElementById("tendances")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                />

                <MenuItem
                  icon={<Package />}
                  label="Nouveautés"
                  onClick={() => {
                    setMenuOpen(false);
                    document
                      .getElementById("nouveautes")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                />
              </MenuSection>

              <MenuSection title="Mon espace">
                <MenuItem
                  icon={<Heart />}
                  label="Mes favoris"
                  onClick={() => openPanel("favorites")}
                />

                <MenuItem
                  icon={<ShoppingBag />}
                  label="Mon panier"
                  onClick={() => openPanel("cart")}
                />

                <MenuItem
                  icon={<Package />}
                  label="Mes commandes"
                  onClick={() => openPanel("orders")}
                />

                <MenuItem
                  icon={<User />}
                  label="Mon profil"
                  onClick={() => openPanel("profile")}
                />
              </MenuSection>

              <MenuSection title="Programme Abonné">
                <MenuItem
                  icon={<Gift />}
                  label="Cartes cadeaux"
                  onClick={() => openPanel("giftCards")}
                />

                <MenuItem
                  icon={<Star />}
                  label="Mes points"
                  onClick={() => openPanel("points")}
                />

                <MenuItem
                  icon={<Recycle />}
                  label="Recyclage"
                  onClick={() => openPanel("recycling")}
                />
              </MenuSection>

              <MenuSection title="Compte">
                <MenuItem
                  icon={<Settings />}
                  label="Paramètres"
                  onClick={() => openPanel("profile")}
                />
              </MenuSection>
            </nav>

            <div className="border-t border-border p-4">
              <p className="text-[11px] text-muted-foreground">
                Store BIB
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <main className="container mx-auto max-w-7xl px-4 pb-20">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">
              Chargement...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-muted/30 py-16 text-center">
            <p className="text-lg font-semibold">
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
                title={`Résultats pour « ${search.trim()} »`}
                subtitle={`${filtered.length} boutique${
                  filtered.length > 1 ? "s" : ""
                }`}
                items={filtered}
              />
            ) : (
              <>
                <div id="tendances">
                  <Rail
                    title="Tendances"
                    items={trending}
                    accent
                  />
                </div>

                <div id="nouveautes">
                  <Rail
                    title="Nouveautés"
                    items={newest}
                  />
                </div>

                {byCategory.map(([category, items]) => (
                  <Rail
                    key={category}
                    title={category}
                    items={items}
                  />
                ))}
              </>
            )}
          </>
        )}
      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <Logo
            iconSize={20}
            asLink={false}
          />

          <p>
            © {new Date().getFullYear()} BIB
          </p>

          <Link
            to="/"
            className="transition hover:text-foreground"
          >
            BIB
          </Link>
        </div>
      </footer>

      {/* =========================================================
          CUSTOMER SPACE
      ========================================================= */}

      <CustomerPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        initialTab={panelTab}
      />
    </div>
  );
}

/* ===============================================================
   NAV ICON
=============================================================== */

interface NavIconButtonProps {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
}

function NavIconButton({
  children,
  label,
  onClick,
  badge,
}: NavIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted active:scale-95"
    >
      {children}

      {typeof badge === "number" && badge > 0 && (
        <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground ring-2 ring-background">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </button>
  );
}

/* ===============================================================
   MENU
=============================================================== */

function MenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>

      <div className="space-y-1">
        {children}
      </div>
    </section>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-muted active:scale-[0.99]"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
        {React.cloneElement(
          icon as React.ReactElement,
          {
            className: "h-4 w-4",
          },
        )}
      </span>

      <span className="flex-1 text-left">
        {label}
      </span>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

/* ===============================================================
   HORIZONTAL RAIL
=============================================================== */

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
      left:
        direction *
        element.clientWidth *
        0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-8 sm:mt-10">
      <div className="mb-3 flex items-end justify-between gap-3 sm:mb-4">
        <div>
          <h2
            className={`font-display text-xl font-semibold leading-tight sm:text-2xl ${
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

        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label={`Voir plus : ${title}`}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted transition hover:bg-muted/70 sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 scrollbar-none"
        >
          {items.map((boutique) => (
            <div
              key={boutique.id}
              className="
                w-[78%]
                shrink-0
                snap-start
                sm:w-[44%]
                md:w-[31%]
                lg:w-[23.5%]
                xl:w-[22%]
              "
            >
              <BoutiqueCard
                boutique={boutique}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
