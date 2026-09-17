import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Loader2,
  Package,
  ShieldCheck,
  ShoppingBag,
  Store as StoreIcon,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

import { useSEO } from "@/hooks/useSEO";
import { BoutiqueCard } from "@/components/store/BoutiqueCard";

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
  user_id: string | null;
  theme_settings: unknown;
}

interface ProductRow {
  id: string;
  public_price: number | null;
  status: string;
  cumulative_sales: number | null;
  supplier_products:
    | {
        name: string;
        image_url: string | null;
        category: string | null;
      }
    | null;
}

interface ProductMediaRow {
  product_id: string;
  url: string;
  position: number | null;
}

interface StoreBoutiqueProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  isPopular: boolean;
}

export default function StoreBoutique() {
  const { slug } = useParams<{ slug: string }>();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["store-boutique", slug],

    queryFn: async () => {
      if (!slug) {
        throw new Error("Boutique introuvable");
      }

      /*
       * -------------------------------------------------------------
       * Boutique
       * -------------------------------------------------------------
       */

      const { data: boutiqueData, error: boutiqueError } =
        await supabase
          .from("boutiques")
          .select(`
            id,
            name,
            slug,
            status,
            category,
            description,
            tagline,
            logo_url,
            cover_image_url,
            user_id,
            theme_settings
          `)
          .eq("slug", slug)
          .eq("status", "published")
          .single();

      if (boutiqueError) {
        throw boutiqueError;
      }

      const boutique =
        boutiqueData as BoutiqueRow;

      /*
       * -------------------------------------------------------------
       * Products
       *
       * BIB Store only presents the commercial selection.
       * Payment remains on /boutique/:slug.
       * -------------------------------------------------------------
       */

      const { data: productData, error: productError } =
        await supabase
          .from("products")
          .select(`
            id,
            public_price,
            status,
            cumulative_sales,
            supplier_products (
              name,
              image_url,
              category
            )
          `)
          .eq("boutique_id", boutique.id)
          .eq("status", "active")
          .order("cumulative_sales", {
            ascending: false,
          })
          .limit(12);

      if (productError) {
        throw productError;
      }

      const rows =
        (productData as ProductRow[] | null) ?? [];

      /*
       * -------------------------------------------------------------
       * Product media
       * -------------------------------------------------------------
       */

      const productIds = rows.map(
        (product) => product.id,
      );

      const mediaByProduct: Record<
        string,
        string[]
      > = {};

      if (productIds.length > 0) {
        const { data: mediaData } = await supabase
          .from("product_media" as any)
          .select(
            "product_id,url,position",
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

        const media =
          (mediaData as ProductMediaRow[] | null) ??
          [];

        media.forEach((item) => {
          if (
            !item.product_id ||
            !item.url
          ) {
            return;
          }

          if (!mediaByProduct[item.product_id]) {
            mediaByProduct[item.product_id] = [];
          }

          mediaByProduct[item.product_id].push(
            item.url,
          );
        });
      }

      const products: StoreBoutiqueProduct[] =
        rows.map((product, index) => {
          const gallery =
            mediaByProduct[product.id] ?? [];

          const fallback =
            product.supplier_products?.image_url ??
            null;

          const images =
            gallery.length > 0
              ? gallery
              : fallback
                ? [fallback]
                : [];

          return {
            id: product.id,
            name:
              product.supplier_products?.name ??
              "Produit",
            price: Number(
              product.public_price ?? 0,
            ),
            image_url:
              images[0] ?? fallback,
            category:
              product.supplier_products?.category ??
              null,
            isPopular: index < 3,
          };
        });

      return {
        boutique,
        products,
      };
    },

    enabled: Boolean(slug),
  });

  /*
   * -------------------------------------------------------------
   * SEO
   * -------------------------------------------------------------
   */

  useSEO({
    title: data?.boutique?.name
      ? `${data.boutique.name} — BIB Store`
      : "Boutique — BIB Store",

    description:
      data?.boutique?.description ??
      data?.boutique?.tagline ??
      "Découvrez cette boutique vérifiée sur BIB Store.",

    image:
      data?.boutique?.cover_image_url ??
      data?.boutique?.logo_url ??
      undefined,

    type: "website",

    keywords: [
      data?.boutique?.name,
      data?.boutique?.category,
      "BIB",
      "Brand-In-A-Box",
      "boutique",
      "produits",
    ].filter(Boolean) as string[],
  });

  const category = useMemo(() => {
    return data?.boutique?.category?.trim() || null;
  }, [data?.boutique?.category]);

  /*
   * -------------------------------------------------------------
   * Loading
   * -------------------------------------------------------------
   */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2
            className="h-8 w-8 animate-spin text-muted-foreground"
            aria-hidden="true"
          />

          <p className="text-sm text-muted-foreground">
            Chargement de la boutique...
          </p>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------------
   * Error / not found
   * -------------------------------------------------------------
   */

  if (error || !data?.boutique) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border bg-background">
            <StoreIcon className="h-6 w-6 text-muted-foreground" />
          </div>

          <h1 className="text-2xl font-semibold">
            Boutique introuvable
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Cette boutique n&apos;existe pas ou n&apos;est
            pas actuellement disponible sur BIB.
          </p>

          <Link
            to="/store"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Store
          </Link>
        </div>
      </div>
    );
  }

  const { boutique, products } = data;

  /*
   * -------------------------------------------------------------
   * Main presentation
   * -------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---------------------------------------------------------
       * Header
       * --------------------------------------------------------- */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              Retour au Store
            </span>
            <span className="sm:hidden">
              Store
            </span>
          </Link>

          <Link
            to={`/boutique/${encodeURIComponent(
              boutique.slug,
            )}`}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">
              Voir la boutique
            </span>
            <span className="sm:hidden">
              Boutique
            </span>
          </Link>
        </div>
      </header>

      <main>
        {/* -------------------------------------------------------
         * Hero
         * ------------------------------------------------------- */}

        <section className="border-b">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div className="overflow-hidden rounded-3xl border bg-muted">
              <div className="relative aspect-[16/9] min-h-[320px] sm:min-h-[420px]">
                {boutique.cover_image_url ? (
                  <img
                    src={boutique.cover_image_url}
                    alt={boutique.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    {boutique.logo_url ? (
                      <img
                        src={boutique.logo_url}
                        alt={boutique.name}
                        className="max-h-32 max-w-[50%] object-contain"
                      />
                    ) : (
                      <StoreIcon className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-foreground">
                      <Check className="h-3.5 w-3.5" />
                      Verified by BIB
                    </span>

                    {category && (
                      <span className="rounded-full border border-white/30 bg-black/20 px-3 py-1.5 text-xs font-medium backdrop-blur">
                        {category}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                    {boutique.name}
                  </h1>

                  {boutique.tagline && (
                    <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">
                      {boutique.tagline}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------
         * Boutique information
         * ------------------------------------------------------- */}

        <section>
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8 lg:py-16">
            <div>
              <div className="flex items-start gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
                  {boutique.logo_url ? (
                    <img
                      src={boutique.logo_url}
                      alt={boutique.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <StoreIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold">
                      {boutique.name}
                    </h2>

                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Vérifiée par BIB
                    </span>
                  </div>

                  {category && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {category}
                    </p>
                  )}
                </div>
              </div>

              {boutique.description && (
                <div className="mt-8 max-w-3xl">
                  <h3 className="text-lg font-semibold">
                    À propos de cette boutique
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                    {boutique.description}
                  </p>
                </div>
              )}
            </div>

            {/* Trust card */}
            <aside className="h-fit rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="font-semibold">
                    Vérifiée par BIB
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Sélection BIB
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4 border-t pt-5">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                  <p className="text-sm text-muted-foreground">
                    Boutique intégrée au réseau BIB.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                  <p className="text-sm text-muted-foreground">
                    Produits présentés à partir de la
                    sélection active de la boutique.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <ShoppingBag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                  <p className="text-sm text-muted-foreground">
                    Les achats sont réalisés directement
                    dans la boutique.
                  </p>
                </div>
              </div>

              <Link
                to={`/boutique/${encodeURIComponent(
                  boutique.slug,
                )}`}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Découvrir la boutique
                <ArrowRight className="h-4 w-4" />
              </Link>
            </aside>
          </div>
        </section>

        {/* -------------------------------------------------------
         * Products
         * ------------------------------------------------------- */}

        {products.length > 0 && (
          <section className="border-t bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sélection
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
                    Découvrez les produits
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Une sélection des produits actuellement
                    proposés par cette boutique.
                  </p>
                </div>

                <Link
                  to={`/boutique/${encodeURIComponent(
                    boutique.slug,
                  )}/products`}
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                >
                  Voir tous les produits
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/store/product/${encodeURIComponent(
                      product.id,
                    )}`}
                    className="group overflow-hidden rounded-2xl border bg-background transition-shadow hover:shadow-md"
                  >
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}

                      {product.isPopular && (
                        <span className="absolute left-3 top-3 rounded-full bg-background/95 px-2.5 py-1 text-[11px] font-semibold">
                          Populaire
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <p className="line-clamp-2 text-sm font-medium">
                        {product.name}
                      </p>

                      {product.category && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {product.category}
                        </p>
                      )}

                      <p className="mt-3 text-sm font-semibold">
                        {product.price.toFixed(2)} €
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Link
                  to={`/boutique/${encodeURIComponent(
                    boutique.slug,
                  )}/products`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border px-6 text-sm font-semibold transition-colors hover:bg-background"
                >
                  Explorer tous les produits
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* -------------------------------------------------------
         * Final CTA
         * ------------------------------------------------------- */}

        <section>
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="rounded-3xl border bg-card px-6 py-10 text-center sm:px-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>

              <h2 className="mt-5 text-2xl font-semibold">
                Prêt à découvrir {boutique.name} ?
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Retrouvez l&apos;ensemble de la sélection et
                effectuez vos achats directement sur la boutique.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  to={`/boutique/${encodeURIComponent(
                    boutique.slug,
                  )}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
                >
                  Visiter la boutique
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/store"
                  className="inline-flex h-11 items-center justify-center rounded-full border px-6 text-sm font-medium hover:bg-muted"
                >
                  Continuer mes découvertes
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------------------------------------------------
       * Footer
       * --------------------------------------------------------- */}

      <footer className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} BIB
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/centre-aide"
              className="hover:text-foreground"
            >
              Centre d&apos;aide
            </Link>

            <Link
              to="/pack-legal"
              className="hover:text-foreground"
            >
              Informations légales
            </Link>

            <Link
              to="/a-propos"
              className="hover:text-foreground"
            >
              À propos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
