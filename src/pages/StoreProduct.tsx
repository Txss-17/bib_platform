import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  ShieldCheck,
} from "lucide-react";

import {
  useStoreBoutiques,
  type StoreBoutique,
} from "@/hooks/useStore";
import { useStoreCart } from "@/contexts/StoreCartContext";
import { Logo } from "@/components/Logo";
import { useSEO } from "@/hooks/useSEO";

/* =========================================================
   TYPES
   ========================================================= */

type StoreProductPreview =
  StoreBoutique["product_previews"][number];

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
    : "Découvrez ce produit proposé par une boutique référencée dans le réseau BIB.";
}

function getProductImages(
  product: StoreProductPreview,
): string[] {
  const images = [
    (product as any).image_url,
    (product as any).image_2_url,
    (product as any).image_3_url,
    (product as any).image_4_url,
  ].filter(
    (value): value is string =>
      typeof value === "string" &&
      value.trim().length > 0,
  );

  if (images.length > 0) {
    return Array.from(new Set(images));
  }

  return [getProductImage(product)];
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

/* =========================================================
   PAGE
   ========================================================= */

export default function StoreProduct() {
  const { productId } =
    useParams<{ productId: string }>();

  const navigate = useNavigate();

  const {
    data: boutiques = [],
    isLoading,
  } = useStoreBoutiques();

  const {
    addItem,
    getItemQuantity,
  } = useStoreCart();

  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [favorite, setFavorite] = useState(false);

  /* =======================================================
     RECHERCHE DU PRODUIT
     ======================================================= */

  const result = useMemo(() => {
    if (!productId) {
      return null;
    }

    for (const boutique of boutiques) {
      const product =
        boutique.product_previews.find(
          (item) =>
            getProductId(item) === productId,
        );

      if (product) {
        return {
          boutique,
          product,
        };
      }
    }

    return null;
  }, [boutiques, productId]);

  const boutique = result?.boutique;
  const product = result?.product;

  const images = useMemo(
    () =>
      product
        ? getProductImages(product)
        : [],
    [product],
  );

  const price = product
    ? getProductPrice(product)
    : 0;

  const productName =
    product?.name ?? "Produit";

  const existingQuantity =
    productId && boutique
      ? getItemQuantity(
          productId,
          boutique.id,
        )
      : 0;

  /* =======================================================
     SEO
     ======================================================= */

  useSEO({
    title: product
      ? `${productName} — ${
          boutique?.name ?? "BIB"
        }`
      : "Produit — Store BIB",

    description: product
      ? getProductDescription(product)
      : "Découvrez les produits sélectionnés par Brand-In-A-Box.",
  });

  /* =======================================================
     PANIER STORE
     ======================================================= */

  const addToCart = () => {
    if (
      !product ||
      !boutique ||
      !productId
    ) {
      return;
    }

    addItem(
      {
        productId,
        productName,
        productImage:
          getProductImage(product),
        price,
        boutiqueId: boutique.id,
        boutiqueName: boutique.name,
        boutiqueSlug: boutique.slug,
        boutiqueUrl:
          getBoutiqueUrl(boutique),
      },
      quantity,
    );

    setAdded(true);
  };

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
            Chargement du produit…
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     PRODUIT INTROUVABLE
     ======================================================= */

  if (!product || !boutique) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader />

        <main className="container mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold">
            Produit introuvable
          </h1>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Ce produit n'est plus disponible
            dans le catalogue BIB ou le lien
            utilisé n'est plus valide.
          </p>

          <Link
            to="/store/products"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Découvrir les produits
          </Link>
        </main>
      </div>
    );
  }

  const boutiqueUrl =
    getBoutiqueUrl(boutique);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader />

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

          <Link
            to="/store/products"
            className="transition hover:text-foreground"
          >
            Produits
          </Link>

          <ChevronRight className="h-3.5 w-3.5" />

          <span className="truncate text-foreground">
            {productName}
          </span>
        </div>

        {/* RETOUR */}

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        {/* PRODUIT */}

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-12">

          {/* =================================================
              GALERIE
             ================================================= */}

          <div>
            <div className="relative aspect-square overflow-hidden rounded-[28px] border border-border bg-muted">

              <img
                src={images[imageIndex]}
                alt={productName}
                className="h-full w-full object-cover"
              />

              {/* BADGE BIB */}

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-3 py-2 text-xs font-semibold shadow-sm backdrop-blur">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[7px] font-bold text-background">
                  BIB
                </span>

                <span>
                  Vérifié par BIB
                </span>
              </div>

              {/* FAVORI */}

              <button
                type="button"
                onClick={() =>
                  setFavorite(
                    (current) => !current,
                  )
                }
                aria-label={
                  favorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"
                }
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/95 text-foreground shadow-sm backdrop-blur transition hover:bg-background active:scale-95"
              >
                <Heart
                  className="h-5 w-5"
                  fill={
                    favorite
                      ? "currentColor"
                      : "none"
                  }
                  strokeWidth={1.8}
                />
              </button>

              {/* NAVIGATION IMAGES */}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setImageIndex(
                        (current) =>
                          current === 0
                            ? images.length - 1
                            : current - 1,
                      )
                    }
                    aria-label="Image précédente"
                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/95 shadow-sm transition hover:bg-background active:scale-95"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setImageIndex(
                        (current) =>
                          (current + 1) %
                          images.length,
                      )
                    }
                    aria-label="Image suivante"
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/95 shadow-sm transition hover:bg-background active:scale-95"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* MINIATURES */}

            {images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setImageIndex(index)
                      }
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        imageIndex === index
                          ? "border-primary"
                          : "border-border"
                      }`}
                    >
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* =================================================
              INFORMATIONS PRODUIT
             ================================================= */}

          <div className="flex flex-col">

            {/* BOUTIQUE */}

            <Link
              to={`/store/boutique/${boutique.slug}`}
              className="group inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Store className="h-4 w-4" />
              </span>

              <span>
                {boutique.name}
              </span>

              <Check className="h-4 w-4 text-primary" />

              <span className="text-xs text-primary">
                Vérifiée par BIB
              </span>
            </Link>

            {/* NOM */}

            <h1 className="mt-5 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {productName}
            </h1>

            {/* PRIX */}

            <div className="mt-5">
              <span className="font-mono text-2xl font-semibold tabular-nums">
                {price.toFixed(2)} €
              </span>
            </div>

            {/* DESCRIPTION */}

            <div className="mt-6 border-t border-border pt-6">
              <h2 className="text-sm font-semibold">
                À propos du produit
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                {getProductDescription(
                  product,
                )}
              </p>
            </div>

            {/* VÉRIFICATION BIB */}

            <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div>
                  <p className="text-sm font-semibold">
                    Produit sélectionné par BIB
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Les boutiques et références
                    présentées dans le Store sont
                    intégrées au réseau BIB selon
                    ses critères de référencement.
                  </p>
                </div>
              </div>
            </div>

            {/* QUANTITÉ */}

            <div className="mt-7">
              <p className="mb-2 text-sm font-medium">
                Quantité
              </p>

              <div className="flex h-11 w-fit items-center overflow-hidden rounded-full border border-border">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (current) =>
                        Math.max(
                          1,
                          current - 1,
                        ),
                    )
                  }
                  disabled={quantity <= 1}
                  aria-label="Diminuer la quantité"
                  className="flex h-full w-11 items-center justify-center text-muted-foreground transition hover:bg-muted disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <span className="flex w-10 justify-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      (current) =>
                        Math.min(
                          99,
                          current + 1,
                        ),
                    )
                  }
                  disabled={quantity >= 99}
                  aria-label="Augmenter la quantité"
                  className="flex h-full w-11 items-center justify-center text-muted-foreground transition hover:bg-muted disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {existingQuantity > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {existingQuantity} déjà dans
                  votre panier Store.
                </p>
              )}
            </div>

            {/* ACTIONS PANIER */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={addToCart}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Ajouté au panier
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Ajouter au panier
                  </>
                )}
              </button>

              <Link
                to="/store/cart"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold transition hover:bg-muted"
              >
                Voir le panier
              </Link>
            </div>

            {/* BOUTIQUE */}

            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Store className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Vendu par{" "}
                    {boutique.name}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    BIB vous permet de découvrir
                    et sélectionner les produits.
                    L'achat final est effectué
                    sur le site de la boutique.
                  </p>

                  {boutiqueUrl && (
                    <a
                      href={boutiqueUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      Découvrir la boutique
                      <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            INFORMATIONS ACHAT
           ================================================= */}

        <section className="mt-14 border-t border-border pt-8">
          <div className="grid gap-4 md:grid-cols-3">

            <InfoCard
              title="Sélection BIB"
              text="Les références présentées dans le Store sont issues de boutiques référencées dans le réseau BIB."
            />

            <InfoCard
              title="Achat auprès de la boutique"
              text="BIB centralise la découverte et le panier. Le paiement est réalisé sur le site de la boutique."
            />

            <InfoCard
              title="Une boutique à la fois"
              text="Les produits sont regroupés par boutique afin de poursuivre l'achat directement auprès de chaque boutique concernée."
            />
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
            aria-label="Panier"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted active:scale-95"
          >
            <ShoppingCart
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
   INFO CARD
   ========================================================= */

interface InfoCardProps {
  title: string;
  text: string;
}

function InfoCard({
  title,
  text,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {text}
      </p>
    </div>
  );
}
