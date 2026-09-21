import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Heart,
  Loader2,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useStoreProduct,
} from "@/hooks/useStore";
import {
  useFavorites,
} from "@/hooks/useFavorites";
import {
  useSEO,
} from "@/hooks/useSEO";

function formatPrice(
  value: number,
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(value);
}

export default function StoreProduct() {
  const {
    productId,
  } = useParams<{
    productId: string;
  }>();

  const {
    data: product,
    isLoading,
    isError,
    refetch,
  } = useStoreProduct(
    productId,
  );

  const {
    isFavorite,
    toggleFavorite,
    isLoading:
      favoritesLoading,
  } = useFavorites();

  const favorite = useMemo(
    () =>
      product
        ? isFavorite(product.id)
        : false,
    [
      product,
      isFavorite,
    ],
  );

  useSEO({
    title: product
      ? `${product.name} — ${product.boutique_name} | BIB`
      : "Produit | BIB Store",

    description:
      product?.description ||
      (product
        ? `Découvrez ${product.name} proposé par ${product.boutique_name}, boutique vérifiée par BIB.`
        : "Découvrez les produits des boutiques vérifiées par BIB."),

    image:
      product?.image_url ||
      undefined,

    type: "store",

    keywords: [
      product?.name,
      product?.boutique_name,
      product?.boutique_category,
      "BIB",
      "Brand-in-a-box",
    ].filter(Boolean) as string[],
  });

  /*
   * ============================================================
   * ÉTAT DE CHARGEMENT
   * ============================================================
   */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              Chargement du produit…
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PRODUIT INTROUVABLE
   * ============================================================
   */

  if (
    isError ||
    !product
  ) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-6">
          <div className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-5 h-10 w-10 text-muted-foreground" />

            <h1 className="text-2xl font-semibold tracking-tight">
              Produit introuvable
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Ce produit n'est pas
              disponible dans le Store BIB
              ou n'est plus publié.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/store/products"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ArrowLeft className="h-4 w-4" />

                Voir les produits
              </Link>

              <button
                type="button"
                onClick={() =>
                  void refetch()
                }
                className="inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ROUTES
   * ============================================================
   */

  const boutiqueStoreUrl =
    `/store/boutique/${encodeURIComponent(
      product.boutique_slug,
    )}`;

  const merchantProductUrl =
    `/boutique/${encodeURIComponent(
      product.boutique_slug,
    )}/product/${product.id}`;

  const merchantProductsUrl =
    `/boutique/${encodeURIComponent(
      product.boutique_slug,
    )}/products`;

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ========================================================
          HEADER
         ======================================================== */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/store/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">
              Retour aux produits
            </span>

            <span className="sm:hidden">
              Retour
            </span>
          </Link>

          <Link
            to={boutiqueStoreUrl}
            className="flex min-w-0 items-center gap-2 text-sm font-medium"
          >
            <Store className="h-4 w-4 shrink-0 text-muted-foreground" />

            <span className="max-w-[180px] truncate sm:max-w-none">
              {product.boutique_name}
            </span>
          </Link>
        </div>
      </header>

      <main>
        {/* ======================================================
            PRODUCT
           ====================================================== */}

        <section>
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:items-start lg:gap-14">
              {/* =================================================
                  IMAGE
                 ================================================= */}

              <div className="relative overflow-hidden rounded-2xl border bg-muted">
                <div className="aspect-square">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                <div className="absolute left-4 top-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />

                    Vérifié par BIB
                  </span>
                </div>
              </div>

              {/* =================================================
                  DETAILS
                 ================================================= */}

              <div className="lg:pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      to={boutiqueStoreUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Store className="h-3.5 w-3.5" />

                      {product.boutique_name}
                    </Link>

                    <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                      {product.name}
                    </h1>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void toggleFavorite(
                        product.id,
                      )
                    }
                    disabled={
                      favoritesLoading
                    }
                    aria-label={
                      favorite
                        ? `Retirer ${product.name} des favoris`
                        : `Ajouter ${product.name} aux favoris`
                    }
                    aria-pressed={
                      favorite
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {favoritesLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Heart
                        className="h-5 w-5"
                        fill={
                          favorite
                            ? "currentColor"
                            : "none"
                        }
                        strokeWidth={
                          1.8
                        }
                      />
                    )}
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <span className="text-2xl font-semibold">
                    {formatPrice(
                      product.price,
                    )}
                  </span>

                  {product.boutique_category && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      {
                        product.boutique_category
                      }
                    </span>
                  )}
                </div>

                {product.description && (
                  <div className="mt-7 border-t pt-6">
                    <h2 className="text-sm font-semibold">
                      À propos du produit
                    </h2>

                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                      {
                        product.description
                      }
                    </p>
                  </div>
                )}

                {/* =================================================
                    TRUST BLOCK
                   ================================================= */}

                <div className="mt-7 rounded-2xl border bg-card p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-semibold">
                        Produit référencé par BIB
                      </h2>

                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                        BIB présente ce produit
                        dans son réseau de
                        boutiques vérifiées.
                        Les informations
                        commerciales et l'achat
                        sont gérés directement
                        par la boutique.
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    COMMERCIAL CTA
                   ================================================= */}

                <div className="mt-7 space-y-3">
                  <Link
                    to={merchantProductUrl}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Voir dans la boutique

                    <ExternalLink className="h-4 w-4" />
                  </Link>

                  <Link
                    to={merchantProductsUrl}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border bg-background px-6 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Voir les autres produits

                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
                  L'achat et le paiement sont
                  effectués directement sur la
                  boutique marchande.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            BOUTIQUE LINK
           ====================================================== */}

        <section className="border-y bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Store className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Boutique
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    {product.boutique_name}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Découvrez l'ensemble de
                    sa sélection sur BIB.
                  </p>
                </div>
              </div>

              <Link
                to={boutiqueStoreUrl}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Découvrir la boutique

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ======================================================
            DISCOVERY EXPLANATION
           ====================================================== */}

        <section>
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 sm:py-16">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border bg-muted">
              <ShoppingBag className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              BIB facilite la découverte
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Le Store BIB permet de découvrir
              des produits et des boutiques
              vérifiées. Lorsque vous souhaitez
              acheter, vous êtes redirigé vers
              la boutique concernée pour
              poursuivre votre parcours
              commercial.
            </p>
          </div>
        </section>
      </main>

      {/* ========================================================
          FOOTER
         ======================================================== */}

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} BIB —
            Brand-in-a-box
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/store"
              className="transition-colors hover:text-foreground"
            >
              BIB Store
            </Link>

            <Link
              to={boutiqueStoreUrl}
              className="transition-colors hover:text-foreground"
            >
              {product.boutique_name}
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
