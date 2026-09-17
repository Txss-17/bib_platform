import { useMemo } from "react";
import {
  Check,
  Heart,
  MapPin,
  Package,
  Percent,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  TrendingUp,
  X,
  ShieldCheck,
  Clock3,
  Boxes,
  BadgeCheck,
  ArrowUpRight,
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

interface ProductDetailDialogProps {
  product: SupplierProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => void;
  isFavorite: (productId: string) => boolean;
  onToggleFavorite: (product: SupplierProduct) => void;
}

type RotationIndicator = "green" | "yellow" | "orange" | "red";

const rotationConfig: Record<
  RotationIndicator,
  {
    label: string;
    shortLabel: string;
    description: string;
    className: string;
  }
> = {
  green: {
    label: "Demande élevée",
    shortLabel: "Élevée",
    description: "Produit présentant une forte dynamique commerciale.",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  yellow: {
    label: "Demande modérée",
    shortLabel: "Modérée",
    description: "Produit présentant une demande régulière.",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-300",
  },
  orange: {
    label: "Demande faible",
    shortLabel: "Faible",
    description: "Produit à positionner avec une stratégie commerciale adaptée.",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
  },
  red: {
    label: "Très utilisé",
    shortLabel: "Très utilisé",
    description: "Produit déjà fortement représenté dans le réseau.",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
  },
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function getRotationConfig(
  indicator: SupplierProduct["rotation_indicator"],
) {
  return rotationConfig[indicator as RotationIndicator] ?? rotationConfig.yellow;
}

function getPerformanceLabel(
  indicator: SupplierProduct["rotation_indicator"],
) {
  switch (indicator) {
    case "green":
      return "Très bon potentiel";
    case "yellow":
      return "Potentiel régulier";
    case "orange":
      return "Potentiel à travailler";
    case "red":
      return "Marché déjà exploité";
    default:
      return "Potentiel commercial";
  }
}

function getCommercialScore(
  indicator: SupplierProduct["rotation_indicator"],
  margin: number,
) {
  const rotationScore =
    indicator === "green"
      ? 5
      : indicator === "yellow"
        ? 4
        : indicator === "orange"
          ? 3
          : 2;

  const marginScore =
    margin >= 50 ? 5 : margin >= 35 ? 4 : margin >= 20 ? 3 : 2;

  return Math.round(((rotationScore + marginScore) / 10) * 100);
}

function getMarketLabel(market: string | null | undefined) {
  if (!market) return "Marché BIB";

  return market
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" · ");
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
  onAdd,
  isFavorite,
  onToggleFavorite,
}: ProductDetailDialogProps) {
  const rotation = getRotationConfig(product.rotation_indicator);

  const commercialData = useMemo(() => {
    const basePrice = Number(product.base_price) || 0;
    const maxMargin = Number(product.max_margin_percent) || 0;
    const moq = Number(product.moq) || 0;

    const recommendedPrice = basePrice * (1 + maxMargin / 100);
    const potentialProfit = recommendedPrice - basePrice;

    const commercialScore = getCommercialScore(
      product.rotation_indicator,
      maxMargin,
    );

    /*
     * Ces données représentent la vision commerciale cible de BIB.
     * Lovable/Supabase pourra ensuite les remplacer par les vrais champs.
     */
    const estimatedDelivery = "3 à 7 jours";
    const availability = "Disponible";
    const logisticsIncluded = true;
    const commercialZones = product.market
      ? getMarketLabel(product.market)
      : "France · Europe";

    return {
      basePrice,
      maxMargin,
      moq,
      recommendedPrice,
      potentialProfit,
      commercialScore,
      estimatedDelivery,
      availability,
      logisticsIncluded,
      commercialZones,
    };
  }, [product]);

  const favorite = isFavorite(product.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-6xl overflow-hidden p-0">
        <div className="flex max-h-[92vh] flex-col overflow-hidden">
          {/* Header */}
          <DialogHeader className="border-b px-6 py-5">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="gap-1 border-0 bg-emerald-600 text-white">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Validé par BIB
                  </Badge>

                  <Badge variant="outline">{product.category}</Badge>

                  <Badge
                    variant="outline"
                    className={rotation.className}
                  >
                    <TrendingUp className="mr-1 h-3.5 w-3.5" />
                    {rotation.label}
                  </Badge>
                </div>

                <DialogTitle className="text-xl font-semibold md:text-2xl">
                  {product.name}
                </DialogTitle>

                <DialogDescription className="mt-1 max-w-3xl">
                  Évaluez rapidement le potentiel commercial de ce produit
                  avant de l’intégrer à votre boutique.
                </DialogDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => onToggleFavorite(product)}
                aria-label={
                  favorite
                    ? "Retirer des favoris"
                    : "Ajouter aux favoris"
                }
              >
                <Heart
                  className={`h-5 w-5 ${
                    favorite
                      ? "fill-current text-red-500"
                      : ""
                  }`}
                />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              {/* Product visual */}
              <div className="border-b bg-muted/20 p-5 lg:border-b-0 lg:border-r lg:p-6">
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
                      Produit validé
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Potentiel commercial
                          </p>
                          <p className="font-semibold">
                            {getPerformanceLabel(
                              product.rotation_indicator,
                            )}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => {
                            const active =
                              index <
                              Math.round(
                                commercialData.commercialScore / 20,
                              );

                            return (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${
                                  active
                                    ? "fill-current"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Commercial confidence */}
                <div className="mt-5 rounded-xl border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        Indice commercial BIB
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Synthèse du potentiel du produit
                      </p>
                    </div>

                    <span className="text-lg font-bold">
                      {commercialData.commercialScore}/100
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground transition-all"
                      style={{
                        width: `${commercialData.commercialScore}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Commercial information */}
              <div className="p-5 lg:p-6">
                {/* Price block */}
                <div className="rounded-2xl border bg-muted/20 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <h3 className="font-semibold">
                      Opportunité commerciale
                    </h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Prix fournisseur
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {formatPrice(commercialData.basePrice)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Marge maximale
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        +{commercialData.maxMargin}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Prix potentiel
                      </p>
                      <p className="mt-1 text-xl font-bold">
                        {formatPrice(
                          commercialData.recommendedPrice,
                        )}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      Potentiel brut par unité
                    </span>

                    <span className="font-semibold text-emerald-600">
                      +{formatPrice(commercialData.potentialProfit)}
                    </span>
                  </div>
                </div>

                {/* Commercial indicators */}
                <div className="mt-5">
                  <h3 className="mb-3 font-semibold">
                    Indicateurs commerciaux
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Zones de commercialisation
                          </p>
                          <p className="mt-1 font-medium">
                            {commercialData.commercialZones}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Rotation
                          </p>
                          <p className="mt-1 font-medium">
                            {rotation.label}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <Boxes className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Quantité minimale
                          </p>
                          <p className="mt-1 font-medium">
                            {commercialData.moq} unité
                            {commercialData.moq > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <Package className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Disponibilité
                          </p>
                          <p className="mt-1 font-medium">
                            {commercialData.availability}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <Truck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Logistique
                          </p>
                          <p className="mt-1 font-medium">
                            {commercialData.logisticsIncluded
                              ? "Logistique incluse"
                              : "Logistique à prévoir"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4">
                      <div className="flex items-start gap-3">
                        <Clock3 className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            Délai indicatif
                          </p>
                          <p className="mt-1 font-medium">
                            {commercialData.estimatedDelivery}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance history */}
                <div className="mt-5 rounded-xl border p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <h3 className="font-semibold">
                      Performance commerciale
                    </h3>
                  </div>

                  {product.performance_history ? (
                    <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                      Historique de performance disponible.
                      <span className="ml-1 font-medium text-foreground">
                        Les données détaillées sont suivies par BIB.
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                      Les données historiques détaillées seront
                      progressivement enrichies par BIB.
                    </div>
                  )}
                </div>

                {/* Product description */}
                {product.description && (
                  <div className="mt-5">
                    <h3 className="mb-2 font-semibold">
                      À propos du produit
                    </h3>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* BIB validation */}
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="font-medium">
                        Produit validé par BIB
                      </p>

                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        Ce produit fait partie du catalogue sélectionné
                        par BIB. Les informations commerciales et
                        logistiques sont présentées pour vous aider à
                        évaluer son intégration à votre boutique.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-background px-5 py-4 lg:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>
                  Vous pouvez modifier votre stratégie de marge après
                  l’ajout.
                </span>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Fermer
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onToggleFavorite(product)}
                  className="gap-2"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      favorite ? "fill-current text-red-500" : ""
                    }`}
                  />
                  {favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                </Button>

                <Button
                  type="button"
                  onClick={onAdd}
                  className="gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Ajouter à ma boutique
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailDialog;
