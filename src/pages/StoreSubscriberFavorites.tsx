import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  Loader2,
  Store,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const favoritesDb = supabase as any;

type ActiveTab =
  | "products"
  | "boutiques";

interface FavoriteProduct {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  boutique_name: string;
  boutique_slug: string;
}

interface FavoriteBoutique {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  description: string | null;
}

interface ProductFavoriteRow {
  product_id: string;
  products:
    | {
        id: string;
        public_price: number | null;
        supplier_products:
          | {
              name: string | null;
              image_url: string | null;
            }
          | null;
        boutiques:
          | {
              name: string | null;
              slug: string | null;
            }
          | null;
      }
    | null;
}

interface BoutiqueFavoriteRow {
  boutique_id: string;
  boutiques:
    | {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        logo_url: string | null;
        cover_image_url: string | null;
      }
    | null;
}

function formatPrice(
  price: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(price);
}

export default function StoreSubscriberFavorites() {
  const { user } = useAuth();

  const [
    activeTab,
    setActiveTab,
  ] = useState<ActiveTab>("products");

  const [
    products,
    setProducts,
  ] = useState<FavoriteProduct[]>([]);

  const [
    boutiques,
    setBoutiques,
  ] = useState<FavoriteBoutique[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    removingId,
    setRemovingId,
  ] = useState<string | null>(null);

  /**
   * Charge les deux catégories de favoris
   * appartenant au compte authentifié.
   */
  const loadFavorites = useCallback(
    async () => {
      if (!user?.id) {
        setProducts([]);
        setBoutiques([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [
          productFavoritesResult,
          boutiqueFavoritesResult,
        ] = await Promise.all([
          favoritesDb
            .from(
              "customer_product_favorites",
            )
            .select(`
              product_id,
              products (
                id,
                public_price,
                supplier_products (
                  name,
                  image_url
                ),
                boutiques (
                  name,
                  slug
                )
              )
            `)
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),

          favoritesDb
            .from(
              "customer_boutique_favorites",
            )
            .select(`
              boutique_id,
              boutiques (
                id,
                name,
                slug,
                description,
                logo_url,
                cover_image_url
              )
            `)
            .eq("user_id", user.id)
            .order("created_at", {
              ascending: false,
            }),
        ]);

        if (
          productFavoritesResult.error
        ) {
          throw productFavoritesResult.error;
        }

        if (
          boutiqueFavoritesResult.error
        ) {
          throw boutiqueFavoritesResult.error;
        }

        const productRows =
          (productFavoritesResult.data ??
            []) as ProductFavoriteRow[];

        const boutiqueRows =
          (boutiqueFavoritesResult.data ??
            []) as BoutiqueFavoriteRow[];

        const normalizedProducts =
          productRows
            .map((row) => {
              const product =
                row.products;

              if (
                !product ||
                !product.id
              ) {
                return null;
              }

              const supplierProduct =
                product.supplier_products;

              const boutique =
                product.boutiques;

              if (
                !boutique?.slug
              ) {
                return null;
              }

              return {
                id: product.id,

                name:
                  supplierProduct?.name?.trim() ||
                  "Produit",

                image_url:
                  supplierProduct?.image_url ??
                  null,

                price: Number(
                  product.public_price ?? 0,
                ),

                boutique_name:
                  boutique.name?.trim() ||
                  "Boutique",

                boutique_slug:
                  boutique.slug,
              };
            })
            .filter(
              (
                product,
              ): product is FavoriteProduct =>
                product !== null,
            );

        const normalizedBoutiques =
          boutiqueRows
            .map((row) => {
              const boutique =
                row.boutiques;

              if (
                !boutique ||
                !boutique.id ||
                !boutique.slug
              ) {
                return null;
              }

              return {
                id: boutique.id,

                name:
                  boutique.name?.trim() ||
                  "Boutique",

                slug: boutique.slug,

                logo_url:
                  boutique.logo_url ??
                  null,

                cover_image_url:
                  boutique.cover_image_url ??
                  null,

                description:
                  boutique.description ??
                  null,
              };
            })
            .filter(
              (
                boutique,
              ): boutique is FavoriteBoutique =>
                boutique !== null,
            );

        setProducts(
          normalizedProducts,
        );

        setBoutiques(
          normalizedBoutiques,
        );
      } catch (loadError) {
        console.error(
          "Impossible de charger les favoris BIB Store.",
          loadError,
        );

        setError(
          "Impossible de charger vos favoris pour le moment.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    void loadFavorites();
  }, [loadFavorites]);

  /**
   * Retire un produit des favoris.
   */
  const removeProduct =
    useCallback(
      async (productId: string) => {
        if (!user?.id) {
          return;
        }

        setRemovingId(productId);
        setError(null);

        try {
          const {
            error: deleteError,
          } = await favoritesDb
            .from(
              "customer_product_favorites",
            )
            .delete()
            .eq(
              "user_id",
              user.id,
            )
            .eq(
              "product_id",
              productId,
            );

          if (deleteError) {
            throw deleteError;
          }

          setProducts(
            (current) =>
              current.filter(
                (product) =>
                  product.id !==
                  productId,
              ),
          );
        } catch (removeError) {
          console.error(
            "Impossible de retirer le produit des favoris.",
            removeError,
          );

          setError(
            "Impossible de retirer ce produit des favoris.",
          );
        } finally {
          setRemovingId(null);
        }
      },
      [user?.id],
    );

  /**
   * Retire une boutique des favoris.
   */
  const removeBoutique =
    useCallback(
      async (boutiqueId: string) => {
        if (!user?.id) {
          return;
        }

        setRemovingId(boutiqueId);
        setError(null);

        try {
          const {
            error: deleteError,
          } = await favoritesDb
            .from(
              "customer_boutique_favorites",
            )
            .delete()
            .eq(
              "user_id",
              user.id,
            )
            .eq(
              "boutique_id",
              boutiqueId,
            );

          if (deleteError) {
            throw deleteError;
          }

          setBoutiques(
            (current) =>
              current.filter(
                (boutique) =>
                  boutique.id !==
                  boutiqueId,
              ),
          );
        } catch (removeError) {
          console.error(
            "Impossible de retirer la boutique des favoris.",
            removeError,
          );

          setError(
            "Impossible de retirer cette boutique des favoris.",
          );
        } finally {
          setRemovingId(null);
        }
      },
      [user?.id],
    );

  const totalFavorites =
    products.length +
    boutiques.length;

  const activeCount = useMemo(
    () =>
      activeTab === "products"
        ? products.length
        : boutiques.length,
    [
      activeTab,
      products.length,
      boutiques.length,
    ],
  );

  if (!user) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Heart className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            Mes favoris
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Connectez-vous à votre compte BIB
            pour retrouver vos produits et
            boutiques favoris.
          </p>

          <Link
            to="/store/login?next=%2Fstore%2Ffavorites"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Se connecter
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* =========================================================
            HEADER
           ========================================================= */}

        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            BIB Store
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Mes favoris
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Retrouvez les produits et boutiques
            que vous souhaitez garder dans votre
            espace BIB.
          </p>
        </div>

        {/* =========================================================
            SUMMARY
           ========================================================= */}

        <section className="mb-8 rounded-2xl border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Vos favoris
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {totalFavorites}{" "}
                {totalFavorites > 1
                  ? "éléments enregistrés"
                  : "élément enregistré"}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                {products.length} produit
                {products.length > 1
                  ? "s"
                  : ""}
              </span>

              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />

              <span className="text-muted-foreground">
                {boutiques.length} boutique
                {boutiques.length > 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            ERROR
           ========================================================= */}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {/* =========================================================
            TABS
           ========================================================= */}

        <div className="mb-6 flex gap-2 border-b">
          <button
            type="button"
            onClick={() =>
              setActiveTab("products")
            }
            className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
              activeTab === "products"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Produits

            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
              {products.length}
            </span>

            {activeTab === "products" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("boutiques")
            }
            className={`relative px-4 pb-3 text-sm font-medium transition-colors ${
              activeTab === "boutiques"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Boutiques

            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
              {boutiques.length}
            </span>

            {activeTab === "boutiques" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

        {/* =========================================================
            LOADING
           ========================================================= */}

        {isLoading ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-2xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />

              <span>
                Chargement de vos favoris…
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* =====================================================
                PRODUCTS
               ===================================================== */}

            {activeTab ===
              "products" && (
              <>
                {products.length ===
                0 ? (
                  <EmptyState
                    icon={
                      <Heart className="h-8 w-8" />
                    }
                    title="Aucun produit favori"
                    description="Les produits que vous ajoutez à vos favoris apparaîtront ici."
                    actionLabel="Découvrir les produits"
                    actionHref="/store/products"
                  />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map(
                      (product) => {
                        const isRemoving =
                          removingId ===
                          product.id;

                        return (
                          <article
                            key={
                              product.id
                            }
                            className="group overflow-hidden rounded-2xl border bg-card"
                          >
                            {/* IMAGE */}

                            <div className="relative aspect-square overflow-hidden bg-muted">
                              {product.image_url ? (
                                <img
                                  src={
                                    product.image_url
                                  }
                                  alt={
                                    product.name
                                  }
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Heart className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  void removeProduct(
                                    product.id,
                                  )
                                }
                                disabled={
                                  isRemoving
                                }
                                aria-label={`Retirer ${product.name} des favoris`}
                                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isRemoving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>

                            {/* CONTENT */}

                            <div className="p-4">
                              <h2 className="line-clamp-2 text-sm font-semibold">
                                {
                                  product.name
                                }
                              </h2>

                              <Link
                                to={`/store/boutique/${product.boutique_slug}`}
                                className="mt-1 block text-xs text-muted-foreground transition-colors hover:text-foreground"
                              >
                                {
                                  product.boutique_name
                                }
                              </Link>

                              <p className="mt-3 font-semibold">
                                {formatPrice(
                                  product.price,
                                )}
                              </p>

                              <Link
                                to={`/store/product/${product.id}`}
                                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                              >
                                Voir le produit

                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                )}
              </>
            )}

            {/* =====================================================
                BOUTIQUES
               ===================================================== */}

            {activeTab ===
              "boutiques" && (
              <>
                {boutiques.length ===
                0 ? (
                  <EmptyState
                    icon={
                      <Store className="h-8 w-8" />
                    }
                    title="Aucune boutique favorite"
                    description="Les boutiques que vous souhaitez retrouver rapidement apparaîtront ici."
                    actionLabel="Découvrir les boutiques"
                    actionHref="/store"
                  />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {boutiques.map(
                      (boutique) => {
                        const isRemoving =
                          removingId ===
                          boutique.id;

                        return (
                          <article
                            key={
                              boutique.id
                            }
                            className="overflow-hidden rounded-2xl border bg-card"
                          >
                            {/* COVER */}

                            <div className="aspect-[16/8] overflow-hidden bg-muted">
                              {boutique.cover_image_url ? (
                                <img
                                  src={
                                    boutique.cover_image_url
                                  }
                                  alt={
                                    boutique.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Store className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* CONTENT */}

                            <div className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                                    {boutique.logo_url ? (
                                      <img
                                        src={
                                          boutique.logo_url
                                        }
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <Store className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>

                                  <h2 className="truncate font-semibold">
                                    {
                                      boutique.name
                                    }
                                  </h2>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void removeBoutique(
                                      boutique.id,
                                    )
                                  }
                                  disabled={
                                    isRemoving
                                  }
                                  aria-label={`Retirer ${boutique.name} des favoris`}
                                  className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isRemoving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>

                              {boutique.description && (
                                <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                  {
                                    boutique.description
                                  }
                                </p>
                              )}

                              <Link
                                to={`/store/boutique/${boutique.slug}`}
                                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                              >
                                Découvrir la boutique

                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* =========================================================
            ACTIVE TAB SUMMARY
           ========================================================= */}

        {!isLoading &&
          activeCount > 0 && (
            <p className="mt-8 text-center text-xs text-muted-foreground">
              {activeCount}{" "}
              {activeTab === "products"
                ? activeCount > 1
                  ? "produits favoris"
                  : "produit favori"
                : activeCount > 1
                  ? "boutiques favorites"
                  : "boutique favorite"}
            </p>
          )}
      </div>
    </main>
  );
}

function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border bg-card px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>

      <h2 className="mt-5 text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <Link
        to={actionHref}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        {actionLabel}

        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
