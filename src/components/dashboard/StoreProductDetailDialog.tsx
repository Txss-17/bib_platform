import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Image as ImageIcon,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";

import type { StoreProduct } from "@/hooks/useStore";
import { useFavorites } from "@/hooks/useFavorites";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/* =========================================================
   HELPERS
   ========================================================= */

function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/* =========================================================
   PROPS
   ========================================================= */

interface StoreProductDetailDialogProps {
  product: StoreProduct;
  onClose?: () => void;
}

/* =========================================================
   COMPONENT
   ========================================================= */

export function StoreProductDetailDialog({
  product,
  onClose,
}: StoreProductDetailDialogProps) {
  const {
    isFavorite,
    toggleFavorite,
  } = useFavorites();

  const favorite = isFavorite(product.id);

  return (
    <div className="min-h-screen bg-background">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            to="/store/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux produits
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/store/cart"
              aria-label="Panier"
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted"
            >
              <ShoppingBag className="h-[19px] w-[19px]" />
            </Link>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,0.9fr)] lg:gap-12">
          {/* =================================================
              PRODUCT IMAGE
              ================================================= */}

          <div>
            <div className="relative overflow-hidden rounded-3xl bg-muted/40">
              <div className="aspect-square">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="absolute left-4 top-4">
                <Badge className="rounded-full bg-background/90 px-3 py-1.5 text-foreground shadow-sm backdrop-blur hover:bg-background">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Vérifié par BIB
                </Badge>
              </div>

              <button
                type="button"
                aria-label={
                  favorite
                    ? `Retirer ${product.name} des favoris`
                    : `Ajouter ${product.name} aux favoris`
                }
                aria-pressed={favorite}
                onClick={() =>
                  toggleFavorite(product.id)
                }
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition hover:bg-background"
              >
                <Heart
                  className={`h-5 w-5 ${
                    favorite
                      ? "fill-current text-foreground"
                      : "text-foreground"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* =================================================
              PRODUCT INFO
              ================================================= */}

          <div className="flex flex-col">
            <div className="mb-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {product.boutique_category && (
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1 text-xs"
                  >
                    {product.boutique_category}
                  </Badge>
                )}

                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-xs"
                >
                  <ShieldCheck className="mr-1.5 h-3 w-3" />
                  Vérifié
                </Badge>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 text-2xl font-semibold">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Boutique */}

            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Store className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Boutique
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold">
                      {product.boutique_name}
                    </p>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-xl"
                  >
                    <Link
                      to={`/store/boutique/${product.boutique_slug}`}
                    >
                      Voir
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Description */}

            <section className="mt-8">
              <h2 className="text-base font-semibold">
                À propos du produit
              </h2>

              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {product.description ||
                  "Aucune description détaillée n’est disponible pour le moment."}
              </p>
            </section>

            <Separator className="my-8" />

            {/* Trust */}

            <section>
              <h2 className="text-base font-semibold">
                Sélection BIB
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-muted/40 p-4">
                  <ShieldCheck className="h-5 w-5" />

                  <p className="mt-3 text-sm font-medium">
                    Boutique vérifiée
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Ce produit est présenté par une boutique
                    intégrée au réseau BIB.
                  </p>
                </div>

                <div className="rounded-2xl bg-muted/40 p-4">
                  <Store className="h-5 w-5" />

                  <p className="mt-3 text-sm font-medium">
                    Achat auprès de la boutique
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Le Store sert à découvrir les produits.
                    L’achat s’effectue ensuite sur le site de
                    la boutique.
                  </p>
                </div>
              </div>
            </section>

            {/* Actions */}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="flex-1 rounded-xl"
              >
                <Link
                  to={`/store/boutique/${product.boutique_slug}`}
                >
                  <Store className="mr-2 h-4 w-4" />
                  Voir la boutique
                </Link>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-xl"
                onClick={() =>
                  toggleFavorite(product.id)
                }
              >
                <Heart
                  className={`mr-2 h-4 w-4 ${
                    favorite ? "fill-current" : ""
                  }`}
                />
                {favorite
                  ? "Retirer des favoris"
                  : "Ajouter aux favoris"}
              </Button>
            </div>

            {onClose && (
              <Button
                type="button"
                variant="ghost"
                className="mt-3 rounded-xl"
                onClick={onClose}
              >
                Fermer
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
