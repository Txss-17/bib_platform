import { useMemo } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  Loader2,
  Package,
  Recycle,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";

import {
  useStoreBoutiques,
  type StoreBoutique,
  type StoreProductPreview,
} from "@/hooks/useStore";
import { Logo } from "@/components/Logo";
import { useSEO } from "@/hooks/useSEO";

/* =========================================================
   HELPERS
   ========================================================= */

function getStoryImage(
  boutique: StoreBoutique,
) {
  return boutique.stories.find(
    (story) =>
      story.enabled !== false &&
      story.kind === "image",
  );
}

function formatNumber(
  value: number,
) {
  return new Intl.NumberFormat("fr-FR").format(
    Number(value ?? 0),
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export default function StoreBoutique() {
  const { slug } =
    useParams<{ slug: string }>();

  const navigate = useNavigate();

  const {
    data: boutiques,
    isLoading,
    isError,
  } = useStoreBoutiques();

  /* =======================================================
     BOUTIQUE
     ======================================================= */

  const boutique = useMemo(
    () =>
      (boutiques ?? []).find(
        (item) => item.slug === slug,
      ) ?? null,
    [boutiques, slug],
  );

  /* =======================================================
     SEO
     ======================================================= */

  useSEO({
    title: boutique
      ? `${boutique.name} | BIB Store`
      : "Boutique | BIB Store",

    description: boutique
      ? boutique.description ??
        boutique.tagline ??
        `Découvrez ${boutique.name} sur BIB Store.`
      : "Découvrez les boutiques référencées par Brand-In-A-Box.",
  });

  /* =======================================================
     CHARGEMENT
     ======================================================= */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader />

        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement de la boutique…
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     ERREUR / BOUTIQUE INTROUVABLE
     ======================================================= */

  if (
    isError ||
    !boutique ||
    !slug
  ) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader />

        <main className="container mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Store className="h-6 w-6 text-muted-foreground" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold">
            Boutique introuvable
          </h1>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Cette boutique n'est plus disponible
            dans le réseau BIB ou le lien utilisé
            n'est plus valide.
          </p>

          <Link
            to="/store"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Retour au Store
          </Link>
        </main>
      </div>
    );
  }

  /* =======================================================
     DONNÉES
     ======================================================= */

  const storyImage =
    getStoryImage(boutique);

  const products =
    boutique.product_previews ?? [];

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader />

      <main className="container mx-auto max-w-7xl px-4 pb-16">

        {/* =================================================
            BREADCRUMB
           ================================================= */}

        <div className="flex items-center gap-2 overflow-hidden py-5 text-xs text-muted-foreground">
          <Link
            to="/store"
            className="shrink-0 transition hover:text-foreground"
          >
            Store
          </Link>

          <ChevronRight className="h-3.5 w-3.5 shrink-0" />

          <span className="truncate text-foreground">
            {boutique.name}
          </span>
        </div>

        {/* =================================================
            RETOUR
           ================================================= */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        {/* =================================================
            HERO BOUTIQUE
           ================================================= */}

        <section className="overflow-hidden rounded-[28px] border border-border bg-card">

          {/* COVER */}

          <div className="relative h-[220px] overflow-hidden bg-muted sm:h-[300px] lg:h-[360px]">
            {boutique.cover_image_url ? (
              <img
                src={boutique.cover_image_url}
                alt={`Couverture de ${boutique.name}`}
                className="h-full w-full object-cover"
              />
            ) : storyImage ? (
              <img
                src={storyImage.url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Store className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* BIB BADGE */}

            <div className="absolute left-5 top-5">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Vérifiée par BIB
              </div>
            </div>

            {/* STORY COUNT */}

            {boutique.stories.length > 0 && (
              <div className="absolute right-5 top-5">
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-medium text-white backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {boutique.stories.length}{" "}
                  {boutique.stories.length > 1
                    ? "stories"
                    : "story"}
                </div>
              </div>
            )}

            {/* BOUTIQUE NAME OVER COVER */}

            <div className="absolute bottom-5 left-5 right-5 sm:bottom-7 sm:left-7">
              <div className="flex items-end gap-4">

                <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/80 bg-background shadow-lg sm:flex">
                  {boutique.logo_url ? (
                    <img
                      src={boutique.logo_url}
                      alt={boutique.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Store className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 text-white">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                      {boutique.name}
                    </h1>

                    <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-400" />
                  </div>

                  {boutique.tagline && (
                    <p className="mt-1 max-w-2xl text-sm text-white/85 sm:text-base">
                      {boutique.tagline}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOUTIQUE SUMMARY */}

          <div className="p-5 sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              <div className="flex min-w-0 gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted sm:hidden">
                  {boutique.logo_url ? (
                    <img
                      src={boutique.logo_url}
                      alt={boutique.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      {boutique.category}
                    </span>

                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                      Verified by BIB
                    </span>

                    {boutique.market && (
                      <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                        {boutique.market}
                      </span>
                    )}
                  </div>

                  {boutique.description && (
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">
                      {boutique.description}
                    </p>
                  )}
                </div>
              </div>

              <Link
                to={`/boutique/${boutique.slug}`}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
              >
                Visiter la boutique
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* =================================================
                STATS
               ================================================= */}

            <div className="mt-7 grid gap-3 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                icon={
                  <Package className="h-4 w-4" />
                }
                label="Produits"
                value={formatNumber(
                  boutique.product_count,
                )}
              />

              <StatCard
                icon={
                  <TrendingUp className="h-4 w-4" />
                }
                label="Ventes"
                value={formatNumber(
                  boutique.total_sales,
                )}
              />

              <StatCard
                icon={
                  <Recycle className="h-4 w-4" />
                }
                label="Points recyclage"
                value={formatNumber(
                  boutique.recycling_points,
                )}
              />

              <StatCard
                icon={
                  <ShieldCheck className="h-4 w-4" />
                }
                label="Protection BIB"
                value={
                  boutique.has_protection
                    ? "Active"
                    : "Standard"
                }
              />
            </div>
          </div>
        </section>

        {/* =================================================
            STORIES
           ================================================= */}

        {boutique.stories.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  À découvrir
                </p>

                <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                  L'univers de la boutique
                </h2>
              </div>
            </div>

            <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
              {boutique.stories.map(
                (story) => (
                  <a
                    key={story.id}
                    href={
                      story.cta_url ??
                      story.url
                    }
                    target={
                      story.cta_url
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      story.cta_url
                        ? "noreferrer"
                        : undefined
                    }
                    className="group relative h-48 w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted sm:h-56 sm:w-36"
                  >
                    {story.kind ===
                    "image" ? (
                      <img
                        src={story.url}
                        alt={
                          story.label ??
                          "Story boutique"
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <video
                        src={story.url}
                        muted
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
                      {story.label && (
                        <p className="text-xs font-medium text-white">
                          {story.label}
                        </p>
                      )}
                    </div>
                  </a>
                ),
              )}
            </div>
          </section>
        )}

        {/* =================================================
            PRODUITS
           ================================================= */}

        <section className="mt-12">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Sélection
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Produits de la boutique
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Découvrez une sélection des produits
                référencés par BIB.
              </p>
            </div>

            <Link
              to={`/boutique/${boutique.slug}/products`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:underline"
            >
              Voir toute la boutique
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map(
                (product) => (
                  <StoreProductCard
                    key={product.id}
                    product={product}
                  />
                ),
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
              <Package className="mx-auto h-8 w-8 text-muted-foreground/50" />

              <p className="mt-3 text-sm font-medium">
                Aucun produit à afficher
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Les produits disponibles dans cette
                boutique apparaîtront ici.
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            CTA FINAL
           ================================================= */}

        <section className="mt-14 overflow-hidden rounded-[28px] border border-border bg-muted/30 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />

                <span className="text-sm font-semibold">
                  Boutique référencée par BIB
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Découvrez l'univers de{" "}
                {boutique.name}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                BIB facilite la découverte des boutiques
                de son réseau. Retrouvez l'ensemble de
                l'expérience directement sur leur espace
                boutique.
              </p>
            </div>

            <Link
              to={`/boutique/${boutique.slug}`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
            >
              Visiter la boutique
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* =====================================================
          FOOTER
         ===================================================== */}

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
   HEADER
   ========================================================= */

function StoreHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="container mx-auto flex min-h-[68px] max-w-7xl items-center gap-3 px-4 py-3">

        <Link
          to="/store"
          aria-label="Accueil BIB"
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

        <div className="ml-auto flex items-center gap-1">
          <Link
            to="/store/cart"
            aria-label="Panier Store"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-95"
          >
            <ShoppingBag
              className="h-5 w-5"
              strokeWidth={1.8}
            />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   STAT CARD
   ========================================================= */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({
  icon,
  label,
  value,
}: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold">
          {value}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

interface StoreProductCardProps {
  product: StoreProductPreview;
}

function StoreProductCard({
  product,
}: StoreProductCardProps) {
  return (
    <Link
      to={`/store/product/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-background/90 px-2.5 py-1 text-[10px] font-semibold shadow-sm backdrop-blur">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Vérifié
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-medium transition group-hover:text-primary">
          {product.name}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="font-mono text-sm font-semibold tabular-nums">
            {Number(product.price ?? 0).toFixed(2)} €
          </span>

          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}