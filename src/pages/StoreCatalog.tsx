import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownUp,
  ChevronDown,
  Heart,
  Loader2,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  X,
} from "lucide-react";

import { useStoreProducts, type StoreProduct } from "@/hooks/useStore";
import { useFavorites } from "@/hooks/useFavorites";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* =========================================================
   TYPES
   ========================================================= */

type SortOption =
  | "recent"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc";

/* =========================================================
   HELPERS
   ========================================================= */

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
}: {
  product: StoreProduct;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-2xl bg-muted/40">
        <Link
          to={`/store/product/${product.id}`}
          className="block aspect-square overflow-hidden"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </Link>

        <button
          type="button"
          aria-label={
            isFavorite
              ? `Retirer ${product.name} des favoris`
              : `Ajouter ${product.name} aux favoris`
          }
          aria-pressed={isFavorite}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:bg-background"
        >
          <Heart
            className={`h-[18px] w-[18px] transition ${
              isFavorite
                ? "fill-current text-foreground"
                : "text-foreground"
            }`}
          />
        </button>
      </div>

      <div className="pt-3">
        <div className="mb-1 flex items-start justify-between gap-3">
          <Link
            to={`/store/product/${product.id}`}
            className="min-w-0 flex-1"
          >
            <h3 className="line-clamp-2 text-sm font-medium leading-5 transition-colors hover:text-primary">
              {product.name}
            </h3>
          </Link>

          <span className="shrink-0 text-sm font-semibold">
            {formatPrice(product.price)}
          </span>
        </div>

        <Link
          to={`/store/boutique/${product.boutique_slug}`}
          className="inline-flex max-w-full items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Store className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{product.boutique_name}</span>
        </Link>

        {product.boutique_category && (
          <div className="mt-2">
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
            >
              {product.boutique_category}
            </Badge>
          </div>
        )}
      </div>
    </article>
  );
}

/* =========================================================
   LOADING
   ========================================================= */

function CatalogLoading() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin" />
        <span className="text-sm">Chargement des produits…</span>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR
   ========================================================= */

function CatalogError({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-5 w-5 text-muted-foreground" />
        </div>

        <h2 className="text-lg font-semibold">
          Impossible de charger les produits
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur est survenue lors du chargement du Store.
          Réessayez dans quelques instants.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={onRetry}
        >
          Réessayer
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyCatalog({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>

        <h2 className="text-lg font-semibold">
          Aucun produit trouvé
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          {hasFilters
            ? "Aucun produit ne correspond aux critères sélectionnés."
            : "Aucun produit n'est actuellement disponible dans le Store."}
        </p>

        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={onReset}
          >
            Réinitialiser les filtres
          </Button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CATALOG
   ========================================================= */

export default function StoreCatalog() {
  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useStoreProducts();

  const {
    favorites,
    toggleFavorite,
    isFavorite,
  } = useFavorites();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* ---------------------------------------------------------
     CATEGORIES
     --------------------------------------------------------- */

  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();

    products.forEach((product) => {
      if (product.boutique_category) {
        uniqueCategories.add(product.boutique_category);
      }
    });

    return Array.from(uniqueCategories).sort((a, b) =>
      a.localeCompare(b, "fr"),
    );
  }, [products]);

  /* ---------------------------------------------------------
     FILTER + SEARCH + SORT
     --------------------------------------------------------- */

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeSearch(search);

    const result = products.filter((product) => {
      const searchableText = normalizeSearch(
        [
          product.name,
          product.description ?? "",
          product.boutique_name,
          product.boutique_category,
        ].join(" "),
      );

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesCategory =
        category === "all" ||
        product.boutique_category === category;

      const matchesFavorites =
        !favoritesOnly ||
        favorites.includes(product.id);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFavorites
      );
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;

        case "price-desc":
          return b.price - a.price;

        case "name-asc":
          return a.name.localeCompare(
            b.name,
            "fr",
            { sensitivity: "base" },
          );

        case "name-desc":
          return b.name.localeCompare(
            a.name,
            "fr",
            { sensitivity: "base" },
          );

        case "recent":
        default:
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );
      }
    });
  }, [
    products,
    search,
    category,
    sort,
    favoritesOnly,
    favorites,
  ]);

  /* ---------------------------------------------------------
     FILTER STATE
     --------------------------------------------------------- */

  const hasFilters =
    Boolean(search.trim()) ||
    category !== "all" ||
    sort !== "recent" ||
    favoritesOnly;

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (sort !== "recent" ? 1 : 0) +
    (favoritesOnly ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("recent");
    setFavoritesOnly(false);
  };

  /* ---------------------------------------------------------
     RENDER
     --------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-background">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand */}

          <Link
            to="/store"
            className="flex shrink-0 items-center gap-2"
            aria-label="BIB Store"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background">
              B
            </div>

            <div className="hidden sm:block">
              <div className="text-sm font-semibold leading-none">
                BIB
              </div>
              <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Store
              </div>
            </div>
          </Link>

          {/* Navigation */}

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to="/store"
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Accueil
            </Link>

            <Link
              to="/store/products"
              className="rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground"
            >
              Produits
            </Link>
          </nav>

          {/* Search */}

          <div className="relative ml-auto hidden max-w-md flex-1 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher un produit ou une boutique"
              className="h-10 rounded-xl border-muted bg-muted/50 pl-9 pr-9"
            />

            {search && (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Actions */}

          <div className="flex items-center gap-1">
            <Link
              to="/store/account"
              className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block"
            >
              Compte
            </Link>

            <Link
              to="/store/cart"
              aria-label="Panier"
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted"
            >
              <ShoppingBag className="h-[19px] w-[19px]" />
            </Link>
          </div>
        </div>

        {/* Mobile search */}

        <div className="border-t px-4 py-3 lg:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Rechercher"
              className="h-10 rounded-xl bg-muted/50 pl-9 pr-9"
            />

            {search && (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Intro */}

        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                BIB Store
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Produits
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Découvrez les produits proposés par les
                boutiques vérifiées du réseau BIB.
              </p>
            </div>

            {!isLoading && !isError && (
              <div className="text-sm text-muted-foreground">
                {filteredProducts.length}{" "}
                {filteredProducts.length > 1
                  ? "produits"
                  : "produit"}
              </div>
            )}
          </div>
        </section>

        {/* Mobile filter toggle */}

        <div className="mb-5 flex gap-2 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() =>
              setFiltersOpen((current) => !current)
            }
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] text-background">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {favoritesOnly && (
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              onClick={() => setFavoritesOnly(false)}
            >
              <Heart className="mr-2 h-4 w-4 fill-current" />
              Favoris
            </Button>
          )}
        </div>

        {/* ===================================================
            FILTER BAR
            =================================================== */}

        <div
          className={`mb-8 ${
            filtersOpen ? "block" : "hidden"
          } lg:block`}
        >
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Category */}

                <Select
                  value={category}
                  onValueChange={setCategory}
                >
                  <SelectTrigger className="w-full rounded-xl sm:w-[210px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">
                      Toutes les catégories
                    </SelectItem>

                    {categories.map((item) => (
                      <SelectItem
                        key={item}
                        value={item}
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}

                <Select
                  value={sort}
                  onValueChange={(value) =>
                    setSort(value as SortOption)
                  }
                >
                  <SelectTrigger className="w-full rounded-xl sm:w-[210px]">
                    <ArrowDownUp className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="recent">
                      Plus récents
                    </SelectItem>

                    <SelectItem value="price-asc">
                      Prix croissant
                    </SelectItem>

                    <SelectItem value="price-desc">
                      Prix décroissant
                    </SelectItem>

                    <SelectItem value="name-asc">
                      Nom A → Z
                    </SelectItem>

                    <SelectItem value="name-desc">
                      Nom Z → A
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Favorites */}

                <Button
                  type="button"
                  variant={
                    favoritesOnly
                      ? "default"
                      : "outline"
                  }
                  className="rounded-xl"
                  onClick={() =>
                    setFavoritesOnly(
                      (current) => !current,
                    )
                  }
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${
                      favoritesOnly
                        ? "fill-current"
                        : ""
                    }`}
                  />
                  Favoris
                </Button>
              </div>

              {/* Reset */}

              {hasFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-fit rounded-xl"
                  onClick={resetFilters}
                >
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ===================================================
            CONTENT
            =================================================== */}

        {isLoading ? (
          <CatalogLoading />
        ) : isError ? (
          <CatalogError
            onRetry={() => {
              void refetch();
            }}
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyCatalog
            hasFilters={hasFilters}
            onReset={resetFilters}
          />
        ) : (
          <section
            aria-label="Produits BIB Store"
            className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={isFavorite(product.id)}
                onToggleFavorite={() =>
                  toggleFavorite(product.id)
                }
              />
            ))}
          </section>
        )}

        {/* ===================================================
            FOOTER INFO
            =================================================== */}

        {!isLoading &&
          !isError &&
          filteredProducts.length > 0 && (
            <div className="mt-12">
              <Separator />

              <div className="flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Les produits présentés sont proposés par
                  les boutiques du réseau BIB.
                </p>

                <Link
                  to="/store"
                  className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
                >
                  Retour au Store
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                </Link>
              </div>
            </div>
          )}
      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-[10px] font-bold text-background">
              B
            </div>

            <span>
              BIB Store — découverte de boutiques vérifiées
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/store/account"
              className="transition-colors hover:text-foreground"
            >
              Compte
            </Link>

            <Link
              to="/store/cart"
              className="transition-colors hover:text-foreground"
            >
              Panier
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
