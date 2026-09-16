import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Heart,
  Loader2,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  User,
} from "lucide-react";

import {
  useStoreBoutiques,
  type StoreBoutique,
} from "@/hooks/useStore";
import { useStoreCart } from "@/contexts/StoreCartContext";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerProfile } from "@/hooks/useCustomerProfile";

/* =========================================================
   TYPES
   ========================================================= */

type StoreProductPreview =
  StoreBoutique["product_previews"][number];

interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  boutiqueId: string;
  boutiqueName: string;
  boutiqueSlug: string;
  boutiqueUrl?: string;
  category: string;
}

/* =========================================================
   HELPERS
   ========================================================= */

function getProductId(
  product: StoreProductPreview,
): string {
  return String(
    (product as any).id ??
      (product as any).product_id ??
      "",
  );
}

function getProductPrice(
  product: StoreProductPreview,
): number {
  const raw =
    (product as any).price ??
    (product as any).public_price ??
    (product as any).sale_price ??
    0;

  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : 0;
}

function getProductImage(
  product: StoreProductPreview,
): string {
  const image =
    (product as any).image_url ??
    (product as any).image ??
    (product as any).thumbnail_url;

  return typeof image === "string" &&
    image.trim().length > 0
    ? image
    : "/placeholder.svg";
}

function getProductDescription(
  product: StoreProductPreview,
): string {
  const description =
    (product as any).description ??
    (product as any).short_description;

  return typeof description === "string" &&
    description.trim().length > 0
    ? description
    : "Produit sélectionné dans le réseau BIB.";
}

function getBoutiqueUrl(
  boutique: StoreBoutique,
): string | undefined {
  const value =
    (boutique as any).website_url ??
    (boutique as any).store_url ??
    (boutique as any).url;

  return typeof value === "string" &&
    value.trim().length > 0
    ? value
    : undefined;
}

function getProductCategory(
  product: StoreProductPreview,
  boutique: StoreBoutique,
): string {
  const productCategory =
    (product as any).category ??
    (product as any).category_name;

  if (
    typeof productCategory === "string" &&
    productCategory.trim().length > 0
  ) {
    return productCategory.trim();
  }

  return boutique.category || "Autres";
}

/* =========================================================
   PAGE
   ========================================================= */

export default function StoreCatalog() {
  const {
    data: boutiques = [],
    isLoading,
  } = useStoreBoutiques();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const navigate = useNavigate();
  const location = useLocation();

  const { user, accountType } = useAuth();

  const { data: customer } =
    useCustomerProfile();

  const { totalItems } = useStoreCart();

  const initialQuery =
    searchParams.get("q") ?? "";

  const [search, setSearch] =
    useState(initialQuery);

  const [category, setCategory] =
    useState(
      searchParams.get("category") ?? "all",
    );

  const [sort, setSort] =
    useState(
      searchParams.get("sort") ?? "relevance",
    );

  const [showFilters, setShowFilters] =
    useState(false);

  const isStoreAccount =
    !!user && accountType === "store";

  const initial = (
    customer?.full_name ||
    user?.email ||
    "?"
  )
    .trim()
    .charAt(0)
    .toUpperCase();

  /* =======================================================
     SEO
     ======================================================= */

  useSEO({
    title:
      "Produits — Store BIB",
    description:
      "Découvrez les produits sélectionnés par Brand-In-A-Box auprès des boutiques référencées dans son réseau.",
  });

  /* =======================================================
     SYNCHRONISATION URL
     ======================================================= */

  useEffect(() => {
    const next =
      new URLSearchParams(searchParams);

    const query = search.trim();

    if (query) {
      next.set("q", query);
    } else {
      next.delete("q");
    }

    if (category !== "all") {
      next.set("category", category);
    } else {
      next.delete("category");
    }

    if (sort !== "relevance") {
      next.set("sort", sort);
    } else {
      next.delete("sort");
    }

    if (
      next.toString() !==
      searchParams.toString()
    ) {
      setSearchParams(next, {
        replace: true,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  /* =======================================================
     CATALOGUE PRODUITS
     ======================================================= */

  const products = useMemo<
    CatalogProduct[]
  >(() => {
    const result: CatalogProduct[] = [];

    for (const boutique of boutiques) {
      for (const product of boutique.product_previews) {
        const id = getProductId(product);

        if (!id) {
          continue;
        }

        result.push({
          id,
          name:
            product.name ||
            "Produit",
          price:
            getProductPrice(product),
          image:
            getProductImage(product),
          description:
            getProductDescription(
              product,
            ),
          boutiqueId:
            boutique.id,
          boutiqueName:
            boutique.name,
          boutiqueSlug:
            boutique.slug,
          boutiqueUrl:
            getBoutiqueUrl(boutique),
          category:
            getProductCategory(
              product,
              boutique,
            ),
        });
      }
    }

    return result;
  }, [boutiques]);

  /* =======================================================
     CATÉGORIES
     ======================================================= */

  const categories = useMemo(() => {
    const values = new Set<string>();

    for (const product of products) {
      if (product.category) {
        values.add(product.category);
      }
    }

    return Array.from(values).sort(
      (a, b) =>
        a.localeCompare(b, "fr"),
    );
  }, [products]);

  /* =======================================================
     FILTRAGE + RECHERCHE
     ======================================================= */

  const filteredProducts =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      let result =
        products.filter((product) => {
          if (
            category !== "all" &&
            product.category !== category
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const content = [
            product.name,
            product.description,
            product.boutiqueName,
            product.category,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return content.includes(query);
        });

      switch (sort) {
        case "price-asc":
          result = [...result].sort(
            (a, b) =>
              a.price - b.price,
          );
          break;

        case "price-desc":
          result = [...result].sort(
            (a, b) =>
              b.price - a.price,
          );
          break;

        case "name":
          result = [...result].sort(
            (a, b) =>
              a.name.localeCompare(
                b.name,
                "fr",
              ),
          );
          break;

        default:
          break;
      }

      return result;
    }, [
      products,
      search,
      category,
      sort,
    ]);

  /* =======================================================
     NAVIGATION
     ======================================================= */

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

  const goToCart = () => {
    navigate("/store/cart");
  };

  const goToAccount = () => {
    if (!user || accountType !== "store") {
      navigate("/store/login");
      return;
    }

    navigate("/store/account");
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("relevance");
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ===================================================
          HEADER
         =================================================== */}

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto flex min-h-[68px] max-w-7xl items-center gap-3 px-4 py-3">

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

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              to="/store"
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              Accueil
            </Link>

            <Link
              to="/store/products"
              className="rounded-full bg-muted px-3 py-2 text-sm font-medium text-foreground"
            >
              Produits
            </Link>
          </nav>

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
              placeholder="Rechercher un produit, une boutique…"
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

          <div className="flex shrink-0 items-center gap-1">

            <button
              type="button"
              onClick={goToAccount}
              aria-label="Compte"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground transition hover:bg-muted/70 active:scale-95 sm:flex"
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
          </div>
        </div>
      </header>

      {/* ===================================================
          CONTENU
         =================================================== */}

      <main className="container mx-auto max-w-7xl px-4 pb-16">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 py-5 text-xs text-muted-foreground">
          <Link
            to="/store"
            className="transition hover:text-foreground"
          >
            Store
          </Link>

          <ChevronRight className="h-3.5 w-3.5" />

          <span className="text-foreground">
            Produits
          </span>
        </div>

        {/* EN-TÊTE */}

        <section className="mb-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Store BIB
              </p>

              <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Tous les produits
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Découvrez les produits proposés
                par les boutiques référencées
                dans le réseau BIB.
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredProducts.length}{" "}
              produit
              {filteredProducts.length > 1
                ? "s"
                : ""}
            </div>
          </div>
        </section>

        {/* FILTRES */}

        <section className="mb-7 rounded-2xl border border-border bg-muted/25 p-3 sm:p-4">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (current) =>
                    !current,
                )
              }
              className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
            </button>

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    submitSearch();
                  }
                }}
                placeholder="Rechercher dans les produits…"
                className="h-10 rounded-full bg-background pl-10"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value,
                  )
                }
                className="h-10 appearance-none rounded-full border border-border bg-background py-2 pl-4 pr-10 text-sm font-medium outline-none transition focus:ring-2 focus:ring-primary/30"
                aria-label="Trier les produits"
              >
                <option value="relevance">
                  Pertinence
                </option>
                <option value="price-asc">
                  Prix croissant
                </option>
                <option value="price-desc">
                  Prix décroissant
                </option>
                <option value="name">
                  Nom
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 border-t border-border pt-4">

              <div className="flex flex-wrap gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setCategory("all")
                  }
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    category === "all"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  Tous
                </button>

                {categories.map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setCategory(
                          item,
                        )
                      }
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        category === item
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

                {(category !==
                  "all" ||
                  search ||
                  sort !==
                    "relevance") && (
                  <button
                    type="button"
                    onClick={
                      resetFilters
                    }
                    className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* CHARGEMENT */}

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Chargement des produits…
            </div>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-muted/30 px-5 py-20 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Aucun produit trouvé
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              Aucun produit ne correspond
              aux critères sélectionnés.
              Essayez une autre recherche
              ou réinitialisez les filtres.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Réinitialiser
            </button>
          </div>
        ) : (
          /* =================================================
             GRILLE PRODUITS
             ================================================= */

          <section
            className="
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-3
              sm:gap-4
              lg:grid-cols-4
              xl:grid-cols-5
            "
          >
            {filteredProducts.map(
              (product) => (
                <CatalogProductCard
                  key={`${product.boutiqueId}-${product.id}`}
                  product={product}
                />
              ),
            )}
          </section>
        )}
      </main>

      {/* ===================================================
          FOOTER
         =================================================== */}

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
   PRODUCT CARD
   ========================================================= */

interface CatalogProductCardProps {
  product: CatalogProduct;
}

function CatalogProductCard({
  product,
}: CatalogProductCardProps) {
  const [favorite, setFavorite] =
    useState(false);

  return (
    <article className="group min-w-0">

      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">

        <Link
          to={`/store/product/${encodeURIComponent(
            product.id,
          )}`}
          className="block aspect-square"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>

        {/* FAVORI */}

        <button
          type="button"
          onClick={() =>
            setFavorite(
              (current) =>
                !current,
            )
          }
          aria-label={
            favorite
              ? `Retirer ${product.name} des favoris`
              : `Ajouter ${product.name} aux favoris`
          }
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/95 text-foreground shadow-sm backdrop-blur transition hover:bg-background active:scale-95"
        >
          <Heart
            className="h-4 w-4"
            fill={
              favorite
                ? "currentColor"
                : "none"
            }
            strokeWidth={1.8}
          />
        </button>

        {/* BIB */}

        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full border border-border/60 bg-background/95 px-2.5 py-1.5 text-[10px] font-semibold shadow-sm backdrop-blur">
          <Check className="h-3 w-3 text-primary" />
          Vérifié
        </div>
      </div>

      <div className="px-1 pt-3">

        <Link
          to={`/store/product/${encodeURIComponent(
            product.id,
          )}`}
          className="block"
        >
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug transition group-hover:text-primary">
            {product.name}
          </h2>
        </Link>

        <Link
          to={`/store/boutique/${product.boutiqueSlug}`}
          className="mt-1 block truncate text-xs text-muted-foreground transition hover:text-foreground"
        >
          {product.boutiqueName}
        </Link>

        <div className="mt-2 flex items-center justify-between gap-2">

          <span className="font-mono text-sm font-semibold tabular-nums">
            {product.price.toFixed(2)} €
          </span>

          <Link
            to={`/store/product/${encodeURIComponent(
              product.id,
            )}`}
            aria-label={`Voir ${product.name}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-primary hover:text-primary-foreground active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
