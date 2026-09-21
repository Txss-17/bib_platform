import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Heart,
  Leaf,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { useSEO } from "@/hooks/useSEO";

interface BoutiqueRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  category: string | null;
  description: string | null;
  tagline: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  target_markets: string[] | null;
}

interface SupplierProductRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
}

interface ProductMediaRow {
  product_id: string;
  url: string | null;
  media_url?: string | null;
  position: number | null;
  is_selected?: boolean | null;
}

interface ProductRow {
  id: string;
  boutique_id: string;
  supplier_product_id: string;
  public_price: number | null;
  status: string;
  stock_quantity: number | null;
  cumulative_sales: number | null;
  supplier_products:
    | SupplierProductRow
    | SupplierProductRow[]
    | null;
}

interface StoreBoutiqueProduct {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  imageUrl: string | null;
  images: string[];
  stockQuantity: number;
  cumulativeSales: number;
}

function getSupplierProduct(
  value: ProductRow["supplier_products"],
): SupplierProductRow | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value)
    ? value[0] ?? null
    : value;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default function StoreBoutique() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const {
    boutiqueFavorites,
    toggleBoutiqueFavorite,
    isBoutiqueFavorite,
    isLoading: favoritesLoading,
  } = useFavorites();

  /*
   * ============================================================
   * BOUTIQUE
   * ============================================================
   *
   * Cette page appartient au Store BIB.
   *
   * Elle sert uniquement à découvrir :
   * - la boutique ;
   * - son identité ;
   * - ses produits ;
   * - son statut de boutique vérifiée.
   *
   * L'achat n'est jamais effectué dans cette page.
   * Le parcours commercial continue sur :
   *
   * /boutique/:slug
   */

  const boutiqueQuery = useQuery({
    queryKey: ["store-boutique", slug],

    enabled: Boolean(slug),

    queryFn: async () => {
      if (!slug) {
        throw new Error(
          "Boutique introuvable.",
        );
      }

      const {
        data,
        error,
      } = await supabase
        .from("boutiques")
        .select(
          `
            id,
            name,
            slug,
            status,
            category,
            description,
            tagline,
            logo_url,
            cover_image_url,
            target_markets
          `,
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data as BoutiqueRow | null;
    },
  });

  const boutique = boutiqueQuery.data;

  /*
   * ============================================================
   * FAVORI BOUTIQUE
   * ============================================================
   */

  const boutiqueIsFavorite = useMemo(() => {
    if (!boutique?.id) {
      return false;
    }

    return isBoutiqueFavorite(
      boutique.id,
    );
  }, [
    boutique?.id,
    isBoutiqueFavorite,
    boutiqueFavorites,
  ]);

  /*
   * ============================================================
   * PRODUITS
   * ============================================================
   */

  const productsQuery = useQuery({
    queryKey: [
      "store-boutique-products",
      boutique?.id,
    ],

    enabled: Boolean(boutique?.id),

    queryFn: async () => {
      if (!boutique?.id) {
        return [];
      }

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select(
          `
            id,
            boutique_id,
            supplier_product_id,
            public_price,
            status,
            stock_quantity,
            cumulative_sales,
            supplier_products (
              id,
              name,
              description,
              category,
              image_url
            )
          `,
        )
        .eq(
          "boutique_id",
          boutique.id,
        )
        .eq(
          "status",
          "active",
        )
        .order(
          "cumulative_sales",
          {
            ascending: false,
          },
        );

      if (error) {
        throw error;
      }

      return (
        data ?? []
      ) as ProductRow[];
    },
  });

  const productIds = useMemo(
    () =>
      (
        productsQuery.data ?? []
      ).map(
        (product) =>
          product.id,
      ),
    [productsQuery.data],
  );

  /*
   * ============================================================
   * PRODUCT MEDIA
   * ============================================================
   */

  const mediaQuery = useQuery({
    queryKey: [
      "store-boutique-product-media",
      productIds,
    ],

    enabled:
      productIds.length > 0,

    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase
        .from("product_media" as any)
        .select(
          `
            product_id,
            url,
            position,
            is_selected
          `,
        )
        .in(
          "product_id",
          productIds,
        )
        .eq(
          "is_selected",
          true,
        )
        .order(
          "position",
          {
            ascending: true,
          },
        );

      if (error) {
        throw error;
      }

      return (
        data ?? []
      ) as ProductMediaRow[];
    },
  });

  /*
   * ============================================================
   * NORMALISATION DES PRODUITS
   * ============================================================
   */

  const products =
    useMemo<StoreBoutiqueProduct[]>(
      () => {
        const mediaByProduct =
          new Map<
            string,
            string[]
          >();

        for (const media of
          mediaQuery.data ?? []) {
          const mediaUrl =
            media.url ??
            media.media_url ??
            null;

          if (!mediaUrl) {
            continue;
          }

          const current =
            mediaByProduct.get(
              media.product_id,
            ) ?? [];

          if (
            !current.includes(
              mediaUrl,
            )
          ) {
            current.push(
              mediaUrl,
            );
          }

          mediaByProduct.set(
            media.product_id,
            current,
          );
        }

        return (
          productsQuery.data ?? []
        )
          .map((product) => {
            const supplierProduct =
              getSupplierProduct(
                product.supplier_products,
              );

            if (!supplierProduct) {
              return null;
            }

            const images =
              mediaByProduct.get(
                product.id,
              ) ?? [];

            const fallbackImage =
              supplierProduct.image_url ??
              null;

            return {
              id: product.id,

              name:
                supplierProduct.name,

              description:
                supplierProduct.description,

              category:
                supplierProduct.category ??
                boutique?.category ??
                null,

              price: Number(
                product.public_price ??
                  0,
              ),

              imageUrl:
                images[0] ??
                fallbackImage,

              images,

              stockQuantity:
                Number(
                  product.stock_quantity ??
                    0,
                ),

              cumulativeSales:
                Number(
                  product.cumulative_sales ??
                    0,
                ),
            };
          })
          .filter(
            (
              product,
            ): product is StoreBoutiqueProduct =>
              product !== null,
          );
      },
      [
        productsQuery.data,
        mediaQuery.data,
        boutique?.category,
      ],
    );

  /*
   * ============================================================
   * SEO
   * ============================================================
   */

  useSEO({
    title:
      boutique?.name
        ? `${boutique.name} — Vérifiée par BIB`
        : "Boutique — BIB",

    description:
      boutique?.description ||
      (boutique?.name
        ? `Découvrez ${boutique.name} sur BIB et explorez sa sélection de produits vérifiés.`
        : "Découvrez les boutiques vérifiées par BIB."),

    image:
      boutique?.cover_image_url ||
      boutique?.logo_url ||
      undefined,

    type: "store",

    keywords: [
      boutique?.name,
      boutique?.category,
      "BIB",
      "Brand-In-A-Box",
      "boutique vérifiée",
    ].filter(Boolean) as string[],
  });

  /*
   * ============================================================
   * ROUTE COMMERCIALE
   * ============================================================
   */

  const merchantBoutiqueUrl = boutique
    ? `/boutique/${encodeURIComponent(
        boutique.slug,
      )}`
    : "/store";

  const merchantProductsUrl = boutique
    ? `/boutique/${encodeURIComponent(
        boutique.slug,
      )}/products`
    : "/store";

  /*
   * ============================================================
   * ACTION FAVORI
   * ============================================================
   */

  const handleToggleFavorite =
    async () => {
      if (!boutique?.id) {
        return;
      }

      await toggleBoutiqueFavorite(
        boutique.id,
      );
    };

  /*
   * ============================================================
   * ÉTATS
   * ============================================================
   */

  const isLoading =
    boutiqueQuery.isLoading ||
    (
      Boolean(boutique?.id) &&
      (
        productsQuery.isLoading ||
        mediaQuery.isLoading
      )
    );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              Chargement de la boutique…
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    boutiqueQuery.isError ||
    !boutique
  ) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
          <div className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
            <Store className="mx-auto mb-5 h-10 w-10 text-muted-foreground" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Boutique introuvable
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Cette boutique n’est pas
              disponible ou n’est plus
              publiée sur BIB.
            </p>

            <Link
              to="/store"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" />

              Retour au Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const displayedProducts =
    products.slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ========================================================
          HEADER
         ======================================================== */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/store"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Retour au Store
            </span>
          </Link>

          <div className="flex min-w-0 items-center gap-3">
            {boutique.logo_url ? (
              <img
                src={boutique.logo_url}
                alt=""
                className="h-9 w-9 rounded-full border object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted">
                <Store className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {boutique.name}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />

                Vérifiée par BIB
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              void handleToggleFavorite()
            }
            disabled={favoritesLoading}
            aria-label={
              boutiqueIsFavorite
                ? `Retirer ${boutique.name} des favoris`
                : `Ajouter ${boutique.name} aux favoris`
            }
            aria-pressed={boutiqueIsFavorite}
            title={
              boutiqueIsFavorite
                ? "Retirer des favoris"
                : "Ajouter aux favoris"
            }
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {favoritesLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className="h-5 w-5"
                fill={
                  boutiqueIsFavorite
                    ? "currentColor"
                    : "none"
                }
                strokeWidth={1.8}
              />
            )}
          </button>
        </div>
      </header>

      <main>
        {/* ======================================================
            HERO
           ====================================================== */}

        <section className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <div className="relative overflow-hidden rounded-2xl border bg-muted">
              <div className="relative aspect-[16/7] min-h-[280px] w-full">
                {boutique.cover_image_url ? (
                  <img
                    src={boutique.cover_image_url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                  <div className="max-w-3xl text-white">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                        <CheckCircle2 className="h-3.5 w-3.5" />

                        Verified by BIB
                      </span>

                      {boutique.category && (
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                          {boutique.category}
                        </span>
                      )}
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                      {boutique.name}
                    </h1>

                    {boutique.tagline && (
                      <p className="mt-3 text-base font-medium text-white/90 sm:text-lg">
                        {boutique.tagline}
                      </p>
                    )}

                    {boutique.description && (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                        {boutique.description}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          void handleToggleFavorite()
                        }
                        disabled={favoritesLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-black/20 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/30 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {favoritesLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Heart
                            className="h-4 w-4"
                            fill={
                              boutiqueIsFavorite
                                ? "currentColor"
                                : "none"
                            }
                          />
                        )}

                        {boutiqueIsFavorite
                          ? "Dans mes favoris"
                          : "Ajouter aux favoris"}
                      </button>

                      <Link
                        to={merchantBoutiqueUrl}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                      >
                        Visiter la boutique

                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            TRUST
           ====================================================== */}

        <section className="border-b">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h2 className="font-semibold">
                Boutique vérifiée
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                BIB référence des boutiques
                sélectionnées et vérifiées
                avant leur présence dans
                son réseau.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <ShoppingBag className="h-5 w-5" />
              </div>

              <h2 className="font-semibold">
                Découvrir avant d’acheter
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Le Store BIB sert à découvrir
                les produits et les boutiques.
                L’achat se poursuit ensuite
                directement sur la boutique.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Leaf className="h-5 w-5" />
              </div>

              <h2 className="font-semibold">
                Réseau BIB
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                BIB organise sa sélection
                autour de la confiance, de
                la traçabilité et de la
                visibilité des marchands.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================
            PRODUCTS
           ====================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sélection BIB
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Produits de{" "}
                {boutique.name}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Découvrez une sélection
                des produits proposés par
                cette boutique.
              </p>
            </div>

            {products.length > 0 && (
              <Link
                to={merchantProductsUrl}
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              >
                Voir tous les produits

                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          {productsQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
              Impossible de charger les
              produits de cette boutique.
            </div>
          ) : displayedProducts.length ===
            0 ? (
            <div className="rounded-xl border bg-card p-10 text-center">
              <ShoppingBag className="mx-auto mb-4 h-9 w-9 text-muted-foreground" />

              <h3 className="font-semibold">
                Aucun produit disponible
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Cette boutique ne possède
                actuellement aucun produit
                publié.
              </p>

              <Link
                to={merchantBoutiqueUrl}
                className="mt-5 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Visiter la boutique

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {displayedProducts.map(
                (product) => (
                  <Link
                    key={product.id}
                    to={`/store/product/${product.id}`}
                    className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      {product.cumulativeSales >
                        0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                          Populaire
                        </span>
                      )}

                      {product.stockQuantity > 0 &&
                        product.stockQuantity <= 5 && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                            Plus que{" "}
                            {product.stockQuantity}
                          </span>
                        )}
                    </div>

                    <div className="p-3.5 sm:p-4">
                      {product.category && (
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          {product.category}
                        </p>
                      )}

                      <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-5">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-sm font-semibold">
                        {formatPrice(product.price)}
                      </p>

                      <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                        Découvrir

                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}

          {products.length >
            displayedProducts.length && (
            <div className="mt-8 text-center">
              <Link
                to={merchantProductsUrl}
                className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                Découvrir tous les produits

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        {/* ======================================================
            FINAL CTA
           ====================================================== */}

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border bg-background">
              <Store className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Découvrir{" "}
              {boutique.name}
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Consultez le catalogue complet
              et poursuivez directement
              vers la boutique pour vos
              achats.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  void handleToggleFavorite()
                }
                disabled={favoritesLoading}
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {favoritesLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart
                    className="h-4 w-4"
                    fill={
                      boutiqueIsFavorite
                        ? "currentColor"
                        : "none"
                    }
                  />
                )}

                {boutiqueIsFavorite
                  ? "Dans mes favoris"
                  : "Ajouter aux favoris"}
              </button>

              <Link
                to={merchantBoutiqueUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Visiter{" "}
                {boutique.name}

                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================
          FOOTER
         ======================================================== */}

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} BIB —
            Brand-in-a-box
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/store"
              className="transition-colors hover:text-foreground"
            >
              BIB Store
            </Link>

            <Link
              to="/a-propos"
              className="transition-colors hover:text-foreground"
            >
              À propos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
