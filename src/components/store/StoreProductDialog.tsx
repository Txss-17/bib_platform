import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Truck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Tables } from "@/integrations/supabase/types";

type SupplierProduct = Tables<"supplier_products">;

export interface StoreProductDialogProduct extends SupplierProduct {
  boutique?: {
    id?: string;
    name?: string;
    slug?: string;
    logo_url?: string | null;
    cover_image_url?: string | null;
    category?: string;
    description?: string | null;
    target_markets?: string[];
  } | null;

  public_price?: number | null;
  price?: number | null;
  boutique_name?: string | null;
  boutique_slug?: string | null;
}

interface StoreProductDialogProps {
  product: StoreProductDialogProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (
    product: StoreProductDialogProduct,
  ) => void;
}

function formatPrice(value: number | null | undefined) {
  if (value == null || Number.isNaN(Number(value))) {
    return "Prix indisponible";
  }

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));
}

function getRotationLabel(
  indicator: SupplierProduct["rotation_indicator"],
) {
  switch (indicator) {
    case "green":
      return "Très demandé";
    case "yellow":
      return "Demande régulière";
    case "orange":
      return "Demande modérée";
    case "red":
      return "Produit populaire";
    default:
      return "Sélection BIB";
  }
}

function getRotationClassName(
  indicator: SupplierProduct["rotation_indicator"],
) {
  switch (indicator) {
    case "green":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";

    case "yellow":
      return "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300";

    case "orange":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300";

    case "red":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function getStorefrontPath(
  product: StoreProductDialogProduct,
) {
  const slug =
    product.boutique_slug ??
    product.boutique?.slug;

  if (!slug) {
    return null;
  }

  return `/boutique/${slug}/product/${product.id}`;
}

export function StoreProductDialog({
  product,
  open,
  onOpenChange,
  isFavorite = false,
  onToggleFavorite,
}: StoreProductDialogProps) {
  const navigate = useNavigate();

  const boutiqueName =
    product.boutique_name ??
    product.boutique?.name ??
    "Boutique partenaire BIB";

  const boutiqueSlug =
    product.boutique_slug ??
    product.boutique?.slug;

  const boutiqueLogo =
    product.boutique?.logo_url ?? null;

  const storefrontPath = useMemo(
    () => getStorefrontPath(product),
    [product],
  );

  const displayPrice =
    product.public_price ??
    product.price ??
    null;

  const rotationLabel = getRotationLabel(
    product.rotation_indicator,
  );

  const rotationClassName =
    getRotationClassName(
      product.rotation_indicator,
    );

  const targetMarkets =
    product.boutique?.target_markets ??
    (product.market
      ? product.market
          .split(",")
          .map((market) => market.trim())
          .filter(Boolean)
      : []);

  const handleOpenStorefront = () => {
    if (!storefrontPath) {
      return;
    }

    onOpenChange(false);
    navigate(storefrontPath);
  };

  const handleOpenBoutique = () => {
    if (!boutiqueSlug) {
      return;
    }

    onOpenChange(false);
    navigate(`/boutique/${boutiqueSlug}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-5xl overflow-hidden p-0">
        <div className="flex max-h-[92vh] flex-col overflow-hidden">
          {/* Header */}
          <DialogHeader className="border-b px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start gap-4 pr-8">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="gap-1 border-0 bg-emerald-600 text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified by BIB
                  </Badge>

                  {product.category && (
                    <Badge variant="outline">
                      {product.category}
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className={rotationClassName}
                  >
                    {rotationLabel}
                  </Badge>
                </div>

                <DialogTitle className="text-xl font-semibold sm:text-2xl">
                  {product.name}
                </DialogTitle>

                <DialogDescription className="mt-1">
                  Découvrez ce produit et retrouvez-le directement
                  dans la boutique qui le commercialise.
                </DialogDescription>
              </div>

              {onToggleFavorite && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() =>
                    onToggleFavorite(product)
                  }
                  aria-label={
                    isFavorite
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"
                  }
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite
                        ? "fill-current text-red-500"
                        : ""
                    }`}
                  />
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid lg:grid-cols-[1fr_1fr]">
              {/* Product image */}
              <div className="border-b bg-muted/20 p-4 sm:p-6 lg:border-b-0 lg:border-r">
                <div className="relative aspect-square overflow-hidden rounded-2xl border bg-background">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Package className="h-14 w-14 opacity-40" />
                      <span className="text-sm">
                        Image produit indisponible
                      </span>
                    </div>
                  )}

                  <div className="absolute left-4 top-4">
                    <Badge className="gap-1 bg-background/95 text-foreground shadow-sm hover:bg-background">
                      <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Sélection BIB
                    </Badge>
                  </div>
                </div>

                {/* Trust block */}
                <div className="mt-4 rounded-xl border bg-background p-4">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="font-medium">
                        Produit sélectionné par BIB
                      </p>

                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        BIB référence des produits et boutiques
                        sélectionnés au sein de son réseau.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Information */}
              <div className="p-4 sm:p-6">
                {/* Price */}
                <div className="rounded-2xl border bg-muted/20 p-5">
                  <p className="text-sm text-muted-foreground">
                    Prix public
                  </p>

                  <div className="mt-1 flex items-end justify-between gap-4">
                    <p className="text-3xl font-bold tracking-tight">
                      {formatPrice(displayPrice)}
                    </p>

                    <Badge
                      variant="outline"
                      className="gap-1"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Sélectionné
                    </Badge>
                  </div>

                  <p className="mt-2 text-xs text-muted-foreground">
                    Le prix final est affiché sur la boutique
                    lors de votre visite.
                  </p>
                </div>

                {/* Boutique */}
                <div className="mt-5">
                  <h3 className="mb-3 font-semibold">
                    Disponible chez
                  </h3>

                  <button
                    type="button"
                    onClick={handleOpenBoutique}
                    disabled={!boutiqueSlug}
                    className="group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-muted/50 disabled:cursor-default disabled:hover:bg-background"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                      {boutiqueLogo ? (
                        <img
                          src={boutiqueLogo}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">
                          {boutiqueName}
                        </p>

                        <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Boutique sélectionnée par BIB
                      </p>
                    </div>

                    {boutiqueSlug && (
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                </div>

                {/* Product information */}
                <div className="mt-5">
                  <h3 className="mb-3 font-semibold">
                    À propos du produit
                  </h3>

                  {product.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-sm leading-6 text-muted-foreground">
                      Retrouvez les informations détaillées,
                      caractéristiques et conditions de vente
                      directement sur la boutique.
                    </p>
                  )}
                </div>

                {/* Product indicators */}
                <div className="mt-5">
                  <h3 className="mb-3 font-semibold">
                    Informations
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {product.category && (
                      <div className="rounded-xl border p-4">
                        <p className="text-xs text-muted-foreground">
                          Catégorie
                        </p>

                        <p className="mt-1 font-medium">
                          {product.category}
                        </p>
                      </div>
                    )}

                    <div className="rounded-xl border p-4">
                      <div className="flex gap-3">
                        <TrendingIcon
                          indicator={
                            product.rotation_indicator
                          }
                        />

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Popularité
                          </p>

                          <p className="mt-1 font-medium">
                            {rotationLabel}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex gap-3">
                        <Truck className="mt-0.5 h-5 w-5 text-muted-foreground" />

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Livraison
                          </p>

                          <p className="mt-1 font-medium">
                            Conditions affichées en boutique
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex gap-3">
                        <ShoppingBag className="mt-0.5 h-5 w-5 text-muted-foreground" />

                        <div>
                          <p className="text-xs text-muted-foreground">
                            Achat
                          </p>

                          <p className="mt-1 font-medium">
                            Directement auprès de la boutique
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Markets */}
                {targetMarkets.length > 0 && (
                  <div className="mt-5 rounded-xl border p-4">
                    <div className="flex gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Zones disponibles
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {targetMarkets.map(
                            (market) => (
                              <Badge
                                key={market}
                                variant="secondary"
                              >
                                {market}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BIB information */}
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="font-medium">
                        L'expérience d'achat se poursuit sur la boutique
                      </p>

                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        BIB vous permet de découvrir le produit.
                        La commande, le panier et le paiement sont
                        réalisés directement sur le site de la boutique.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-background px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                <span>
                  Achat effectué sur la boutique partenaire
                </span>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onOpenChange(false)
                  }
                >
                  Fermer
                </Button>

                {onToggleFavorite && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      onToggleFavorite(product)
                    }
                    className="gap-2"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isFavorite
                          ? "fill-current text-red-500"
                          : ""
                      }`}
                    />

                    {isFavorite
                      ? "Retirer des favoris"
                      : "Ajouter aux favoris"}
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={handleOpenStorefront}
                  disabled={!storefrontPath}
                  className="gap-2"
                >
                  Voir dans la boutique
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TrendingIcon({
  indicator,
}: {
  indicator: SupplierProduct["rotation_indicator"];
}) {
  return (
    <div className="mt-0.5 flex h-5 w-5 items-center justify-center">
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          indicator === "green"
            ? "bg-emerald-500"
            : indicator === "yellow"
              ? "bg-yellow-500"
              : indicator === "orange"
                ? "bg-orange-500"
                : "bg-red-500"
        }`}
      />
    </div>
  );
}

export default StoreProductDialog;
