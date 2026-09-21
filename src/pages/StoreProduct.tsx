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
  ShieldCheck,
  Store,
  User,
} from "lucide-react";

import {
  useStoreProduct,
  type StoreProduct as StoreProductData,
} from "@/hooks/useStore";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import { useBibSubscriberSubscription } from "@/hooks/useSubscriptions";

import { Logo } from "@/components/Logo";
import { useSEO } from "@/hooks/useSEO";

/* =========================================================
   HELPERS
   ========================================================= */

function getProductImages(
  product: StoreProductData,
): string[] {
  if (
    typeof product.image_url === "string" &&
    product.image_url.trim().length > 0
  ) {
    return [product.image_url];
  }

  return ["/placeholder.svg"];
}

function getProductDescription(
  product: StoreProductData,
): string {
  if (
    typeof product.description === "string" &&
    product.description.trim().length > 0
  ) {
    return product.description;
  }

  return "Découvrez ce produit proposé par une boutique référencée dans le réseau BIB.";
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/* =========================================================
   PAGE
   ========================================================= */

export default function StoreProduct() {
  const { productId } =
    useParams<{ productId: string }>();

  const navigate = useNavigate();

  const {
    data: product,
    isLoading,
    isError,
  } = useStoreProduct(productId);

  const {
    toggleFavorite,
    isFavorite,
  } = useFavorites();

  const { user } = useAuth();

  const {
    isSubscriber,
  } = useBibSubscriberSubscription();

  const images = useMemo(
    () =>
      product
        ? getProductImages(product)
        : [],
    [product],
  );

  const productName =
    product?.name ?? "Produit";

  const boutiqueName =
    product?.boutique_name ??
    "Boutique";

  const boutiqueSlug =
    product?.boutique_slug ?? "";

  const price =
    typeof product?.price === "number" &&
    Number.isFinite(product.price)
      ? product.price
      : 0;

  const productIsFavorite =
    product
      ? isFavorite(product.id)
      : false;

  useSEO({
    title: product
      ? `${productName} — ${boutiqueName} | BIB Store`
      : "Produit — BIB Store",

    description: product
      ? getProductDescription(product)
      : "Découvrez les produits sélectionnés par Brand-In-A-Box.",
  });

  const goToSubscriber = () => {
    if (!user) {
      navigate(
        `/store/login?next=${encodeURIComponent(
          `/store/product/${productId ?? ""}`,
        )}`,
      );
      return;
    }

    if (!isSubscriber) {
      navigate("/store/subscribe");
      return;
    }

    navigate("/store/account");
  };

  /* =======================================================
     LOADING
     ======================================================= */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader
          isSubscriber={isSubscriber}
          onAccount={goToSubscriber}
        />

        <main className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />

            <span>
              Chargement du produit…
            </span>
          </div>
        </main>
      </div>
    );
  }

  /* =======================================================
     ERROR / NOT FOUND
     ======================================================= */

  if (
    isError ||
    !product ||
    !productId
  ) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <StoreHeader
          isSubscriber={isSubscriber}
          onAccount={goToSubscriber}
        />

        <main className="container mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Store className="h-6 w-6 text-muted-foreground" />
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

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StoreHeader
        isSubscriber={isSubscriber}
        onAccount={goToSubscriber}
      />

      <main className="container mx-auto max-w-7xl px-4 pb-16">
        <div className="flex items-center gap-2 overflow-hidden py-5 text-xs text-muted-foreground">
          <Link
            to="/store"
            className="shrink-0 transition hover:text-foreground"
          >
            Store
          </Link>

          <ChevronRight className="h-3.5 w-3.5 shrink-0" />

          <Link
            to="/store/products"
            className="shrink-0 transition hover:text-foreground"
          >
            Produits
          </Link>

          <ChevronRight className="h-3.5 w-3.5 shrink-0" />

          <span className="truncate text-foreground">
            {productName}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />

          Retour
        </button>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:gap-12">
          <ProductGallery
            productName={productName}
            images={images}
            favorite={productIsFavorite}
            onToggleFavorite={() =>
              toggleFavorite(product.id)
            }
          />

          <div className="flex flex-col">
            <Link
              to={`/store/boutique/${boutiqueSlug}`}
              className="group flex w-fit items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Store className="h-4 w-4" />
              </span>

              <span className="transition group-hover:text-foreground">
                {boutiqueName}
              </span>

              <Check className="h-4 w-4 text-primary" />

              <span className="text-xs font-medium text-primary">
                Vérifiée par BIB
              </span>
            </Link>

            <h1 className="mt-5 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
              {productName}
            </h1>

            <div className="mt-5">
              <span className="font-mono text-2xl font-semibold tabular-nums">
                {formatPrice(price)}
              </span>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <h2 className="text-sm font-semibold">
                À propos du produit
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                {getProductDescription(product)}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div>
                  <p className="text-sm font-semibold">
                    Référence vérifiée par BIB
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Ce produit est présenté dans
                    le BIB Store par une boutique
                    référencée et vérifiée par BIB.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7">
              <Link
                to={`/boutique/${boutiqueSlug}/product/${product.id}`}
                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110 active:scale-[0.98]"
              >
                Voir dans la boutique

                <Store className="h-4 w-4" />
              </Link>

              <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                Retrouvez ce produit directement
                dans la boutique pour consulter
                ses détails et poursuivre votre
                achat.
              </p>
            </div>

            <div className="mt-7 border-t border-border pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Store className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Achat auprès de{" "}
                    {boutiqueName}
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    BIB facilite la découverte du
                    produit. Le parcours d'achat
                    se poursuit directement depuis
                    la boutique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 border-t border-border pt-8">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              title="Référencé par BIB"
              text="Les produits présentés dans le Store proviennent de boutiques intégrées au réseau BIB."
            />

            <InfoCard
              title="Découverte avant achat"
              text="Le BIB Store permet de découvrir les produits et les boutiques avant de poursuivre vers leur espace de vente."
            />

            <InfoCard
              title="Votre boutique reste votre destination"
              text="Le parcours commercial et les informations propres à la boutique sont accessibles depuis sa fiche produit."
            />
          </div>
        </section>
      </main>

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
   PRODUCT GALLERY
   ========================================================= */

interface ProductGalleryProps {
  productName: string;
  images: string[];
  favorite: boolean;
  onToggleFavorite: () => void;
}

function ProductGallery({
  productName,
  images,
  favorite,
  onToggleFavorite,
}: ProductGalleryProps) {
  const [imageIndex, setImageIndex] =
    useState(0);

  const currentImage =
    images[imageIndex] ??
    "/placeholder.svg";

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[28px] border border-border bg-muted">
        <img
          src={currentImage}
          alt={productName}
          className="h-full w-full object-cover"
        />

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-3 py-2 text-xs font-semibold shadow-sm backdrop-blur">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[7px] font-bold text-background">
            BIB
          </span>

          <span>
            Vérifié par BIB
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={
            favorite
              ? "Retirer des favoris"
              : "Ajouter aux favoris"
          }
          aria-pressed={favorite}
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
                aria-label={`Afficher l'image ${
                  index + 1
                }`}
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
  );
}

/* =========================================================
   STORE HEADER
   ========================================================= */

function StoreHeader({
  isSubscriber,
  onAccount,
}: {
  isSubscriber: boolean;
  onAccount: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-xl">
      <div className="container mx-auto flex min-h-[68px] max-w-7xl items-center gap-3 px-4 py-3">
        <Link
          to="/store"
          aria-label="Accueil BIB Store"
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
          {isSubscriber && (
            <Link
              to="/store/favorites"
              aria-label="Favoris"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground transition hover:bg-muted sm:flex"
            >
              <Heart
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </Link>
          )}

          <button
            type="button"
            onClick={onAccount}
            aria-label={
              isSubscriber
                ? "Mon compte"
                : "BIB Abonné"
            }
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground transition hover:bg-muted"
          >
            {isSubscriber ? (
              <User className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </button>
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
