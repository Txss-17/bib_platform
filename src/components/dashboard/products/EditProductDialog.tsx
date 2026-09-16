import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  BadgeEuro,
  Package,
  Percent,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProductCommercialState,
  useUpdateProduct,
} from "@/hooks/useProducts";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    public_price: number | string;
    applied_margin: number | string;
    stock_quantity: number | null;
    low_stock_threshold: number | null;

    sale_price?: number | string | null;
    promotion_starts_at?: string | null;
    promotion_ends_at?: string | null;
    promotion_label?: string | null;

    supplier_products?: {
      name?: string | null;
      category?: string | null;
      description?: string | null;
      base_price?: number | null;
      moq?: number | null;
      max_margin_percent?: number | null;
    } | null;
  };
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
}: EditProductDialogProps) {
  const update = useUpdateProduct();

  /* ---------------------------------------------------------------------- */
  /* Commercial                                                              */
  /* ---------------------------------------------------------------------- */

  const [price, setPrice] = useState("");
  const [margin, setMargin] = useState("");

  /* ---------------------------------------------------------------------- */
  /* Stock                                                                   */
  /* ---------------------------------------------------------------------- */

  const [stock, setStock] = useState("");
  const [threshold, setThreshold] = useState("");

  /* ---------------------------------------------------------------------- */
  /* Promotion                                                               */
  /* ---------------------------------------------------------------------- */

  const [promotionEnabled, setPromotionEnabled] =
    useState(false);

  const [salePrice, setSalePrice] = useState("");
  const [promotionLabel, setPromotionLabel] =
    useState("");

  const [promotionStartsAt, setPromotionStartsAt] =
    useState("");

  const [promotionEndsAt, setPromotionEndsAt] =
    useState("");

  /* ---------------------------------------------------------------------- */
  /* Initialisation                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    setPrice(
      String(product.public_price ?? ""),
    );

    setMargin(
      String(product.applied_margin ?? ""),
    );

    setStock(
      String(product.stock_quantity ?? 0),
    );

    setThreshold(
      String(product.low_stock_threshold ?? 5),
    );

    const existingSalePrice =
      product.sale_price !== null &&
      product.sale_price !== undefined &&
      Number(product.sale_price) > 0
        ? String(product.sale_price)
        : "";

    setSalePrice(existingSalePrice);

    setPromotionEnabled(
      existingSalePrice !== "",
    );

    setPromotionLabel(
      product.promotion_label ?? "",
    );

    setPromotionStartsAt(
      toDatetimeLocal(
        product.promotion_starts_at,
      ),
    );

    setPromotionEndsAt(
      toDatetimeLocal(
        product.promotion_ends_at,
      ),
    );
  }, [open, product]);

  /* ---------------------------------------------------------------------- */
  /* Supplier information                                                    */
  /* ---------------------------------------------------------------------- */

  const supplierBasePrice = Number(
    product.supplier_products?.base_price ?? 0,
  );

  const maxMargin = Number(
    product.supplier_products?.max_margin_percent ?? 0,
  );

  const moq = product.supplier_products?.moq ?? null;

  /* ---------------------------------------------------------------------- */
  /* Commercial preview                                                      */
  /* ---------------------------------------------------------------------- */

  const commercialPreview = useMemo(() => {
    const publicPrice = Number(price);

    if (
      !Number.isFinite(publicPrice) ||
      publicPrice <= 0
    ) {
      return {
        valid: false,
        discountPercent: 0,
        saving: 0,
        currentPrice: publicPrice,
      };
    }

    if (!promotionEnabled) {
      return {
        valid: true,
        discountPercent: 0,
        saving: 0,
        currentPrice: publicPrice,
      };
    }

    const promotionPrice = Number(salePrice);

    if (
      !Number.isFinite(promotionPrice) ||
      promotionPrice < 0 ||
      promotionPrice >= publicPrice
    ) {
      return {
        valid: false,
        discountPercent: 0,
        saving: 0,
        currentPrice: promotionPrice,
      };
    }

    return {
      valid: true,
      discountPercent: Math.round(
        ((publicPrice - promotionPrice) /
          publicPrice) *
          100,
      ),
      saving: Number(
        (publicPrice - promotionPrice).toFixed(2),
      ),
      currentPrice: promotionPrice,
    };
  }, [
    price,
    promotionEnabled,
    salePrice,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Submit                                                                  */
  /* ---------------------------------------------------------------------- */

  const submit = async () => {
    const p = Number(price);
    const m = Number(margin);
    const s = Number(stock);
    const t = Number(threshold);

    /* -------------------------------------------------------------------- */
    /* Basic validation                                                      */
    /* -------------------------------------------------------------------- */

    if (!Number.isFinite(p) || p <= 0) {
      toast.error("Prix public invalide");
      return;
    }

    if (!Number.isFinite(m) || m < 0) {
      toast.error("Marge invalide");
      return;
    }

    if (
      maxMargin > 0 &&
      m > maxMargin
    ) {
      toast.error(
        `La marge ne peut pas dépasser ${maxMargin} %.`,
      );
      return;
    }

    if (!Number.isFinite(s) || s < 0) {
      toast.error("Stock invalide");
      return;
    }

    if (!Number.isFinite(t) || t < 0) {
      toast.error("Seuil de stock invalide");
      return;
    }

    /* -------------------------------------------------------------------- */
    /* Promotion validation                                                  */
    /* -------------------------------------------------------------------- */

    let promotionSalePrice:
      | number
      | null = null;

    let promotionStart:
      | string
      | null = null;

    let promotionEnd:
      | string
      | null = null;

    let promotionName:
      | string
      | null = null;

    if (promotionEnabled) {
      const sp = Number(salePrice);

      if (!Number.isFinite(sp)) {
        toast.error(
          "Prix promotionnel invalide",
        );
        return;
      }

      if (sp < 0) {
        toast.error(
          "Le prix promotionnel ne peut pas être négatif.",
        );
        return;
      }

      if (sp >= p) {
        toast.error(
          "Le prix promotionnel doit être inférieur au prix public.",
        );
        return;
      }

      if (
        promotionStartsAt &&
        promotionEndsAt
      ) {
        const start = new Date(
          promotionStartsAt,
        );

        const end = new Date(
          promotionEndsAt,
        );

        if (
          Number.isNaN(start.getTime()) ||
          Number.isNaN(end.getTime())
        ) {
          toast.error(
            "Dates de promotion invalides.",
          );
          return;
        }

        if (end < start) {
          toast.error(
            "La fin de promotion doit être postérieure au début.",
          );
          return;
        }
      }

      promotionSalePrice = Number(
        sp.toFixed(2),
      );

      promotionStart =
        promotionStartsAt
          ? new Date(
              promotionStartsAt,
            ).toISOString()
          : null;

      promotionEnd =
        promotionEndsAt
          ? new Date(
              promotionEndsAt,
            ).toISOString()
          : null;

      promotionName =
        promotionLabel.trim() || null;
    }

    /* -------------------------------------------------------------------- */
    /* Update                                                                 */
    /* -------------------------------------------------------------------- */

    try {
      await update.mutateAsync({
        id: product.id,

        updates: {
          public_price: Number(
            p.toFixed(2),
          ),

          applied_margin: Number(
            m.toFixed(2),
          ),

          stock_quantity: Math.round(s),

          low_stock_threshold:
            Math.round(t),

          sale_price:
            promotionSalePrice,

          promotion_starts_at:
            promotionStart,

          promotion_ends_at:
            promotionEnd,

          promotion_label:
            promotionName,
        },
      });

      toast.success(
        "Produit mis à jour",
      );

      onOpenChange(false);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du produit :",
        error,
      );

      toast.error(
        "Mise à jour impossible",
      );
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Modifier —{" "}
            {product.supplier_products?.name ||
              "Produit"}
          </DialogTitle>

          <DialogDescription>
            Gérez les paramètres commerciaux et
            opérationnels de ce produit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ============================================================ */}
          {/* Informations fournisseur                                    */}
          {/* ============================================================ */}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />

              <h3 className="text-sm font-semibold">
                Référence produit
              </h3>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info
                  label="Catégorie"
                  value={
                    product.supplier_products
                      ?.category || "—"
                  }
                />

                <Info
                  label="Prix fournisseur"
                  value={`${supplierBasePrice.toFixed(
                    2,
                  )} €`}
                />

                <Info
                  label="MOQ"
                  value={
                    moq !== null
                      ? String(moq)
                      : "—"
                  }
                />

                <Info
                  label="Marge maximale"
                  value={
                    maxMargin > 0
                      ? `${maxMargin} %`
                      : "—"
                  }
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* ============================================================ */}
          {/* Prix                                                          */}
          {/* ============================================================ */}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <BadgeEuro className="h-4 w-4" />

              <h3 className="text-sm font-semibold">
                Commercial
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="public-price"
                  className="text-xs"
                >
                  Prix public (€)
                </Label>

                <Input
                  id="public-price"
                  value={price}
                  type="number"
                  step="0.01"
                  min="0"
                  onChange={(event) =>
                    setPrice(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="margin"
                  className="text-xs"
                >
                  Marge (%)
                </Label>

                <Input
                  id="margin"
                  value={margin}
                  type="number"
                  step="0.01"
                  min="0"
                  max={
                    maxMargin > 0
                      ? maxMargin
                      : undefined
                  }
                  onChange={(event) =>
                    setMargin(
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* ============================================================ */}
          {/* Promotion                                                     */}
          {/* ============================================================ */}

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4" />

                <div>
                  <h3 className="text-sm font-semibold">
                    Promotion
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Configurez une réduction temporaire
                    visible sur la boutique et le Store BIB.
                  </p>
                </div>
              </div>

              <Switch
                checked={promotionEnabled}
                onCheckedChange={
                  setPromotionEnabled
                }
              />
            </div>

            {promotionEnabled && (
              <div className="space-y-4 rounded-lg border p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="sale-price"
                      className="text-xs"
                    >
                      Prix promotionnel (€)
                    </Label>

                    <Input
                      id="sale-price"
                      value={salePrice}
                      type="number"
                      step="0.01"
                      min="0"
                      max={Number(price) || undefined}
                      onChange={(event) =>
                        setSalePrice(
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="promotion-label"
                      className="text-xs"
                    >
                      Libellé
                    </Label>

                    <Input
                      id="promotion-label"
                      value={promotionLabel}
                      placeholder="Ex. Offre spéciale"
                      maxLength={80}
                      onChange={(event) =>
                        setPromotionLabel(
                          event.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="promotion-start"
                      className="text-xs"
                    >
                      Début
                    </Label>

                    <Input
                      id="promotion-start"
                      type="datetime-local"
                      value={promotionStartsAt}
                      onChange={(event) =>
                        setPromotionStartsAt(
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="promotion-end"
                      className="text-xs"
                    >
                      Fin
                    </Label>

                    <Input
                      id="promotion-end"
                      type="datetime-local"
                      value={promotionEndsAt}
                      onChange={(event) =>
                        setPromotionEndsAt(
                          event.target.value,
                        )
                      }
                    />
                  </div>
                </div>

                {commercialPreview.valid &&
                  commercialPreview.discountPercent >
                    0 && (
                    <Alert>
                      <Percent className="h-4 w-4" />

                      <AlertDescription>
                        Réduction calculée :{" "}
                        <strong>
                          -
                          {
                            commercialPreview.discountPercent
                          }
                          %
                        </strong>{" "}
                        — économie de{" "}
                        <strong>
                          {commercialPreview.saving.toFixed(
                            2,
                          )}{" "}
                          €
                        </strong>
                      </AlertDescription>
                    </Alert>
                  )}

                {promotionEnabled &&
                  !commercialPreview.valid && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />

                      <AlertDescription>
                        Le prix promotionnel doit être
                        inférieur au prix public.
                      </AlertDescription>
                    </Alert>
                  )}
              </div>
            )}
          </section>

          <Separator />

          {/* ============================================================ */}
          {/* Stock                                                         */}
          {/* ============================================================ */}

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />

              <h3 className="text-sm font-semibold">
                Stock
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="stock"
                  className="text-xs"
                >
                  Stock disponible
                </Label>

                <Input
                  id="stock"
                  value={stock}
                  type="number"
                  step="1"
                  min="0"
                  onChange={(event) =>
                    setStock(
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="stock-threshold"
                  className="text-xs"
                >
                  Seuil de stock bas
                </Label>

                <Input
                  id="stock-threshold"
                  value={threshold}
                  type="number"
                  step="1"
                  min="0"
                  onChange={(event) =>
                    setThreshold(
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* Personnalisation                                             */}
          {/* ============================================================ */}

          <Separator />

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">
                Personnalisation
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Les possibilités de personnalisation
                dépendent des capacités validées pour ce
                produit et son fournisseur.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />

              <AlertDescription>
                La configuration détaillée de la
                personnalisation — design, logo, couleur,
                texte, étiquette, matière, forme,
                finition ou packaging — sera disponible
                uniquement lorsque ces capacités sont
                enregistrées et validées pour le produit.
              </AlertDescription>
            </Alert>
          </section>

          {/* ============================================================ */}
          {/* Contrôle BIB                                                  */}
          {/* ============================================================ */}

          <section className="rounded-lg border border-dashed p-4">
            <h3 className="text-sm font-semibold">
              Contrôles BIB
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Les règles de conformité, de zone autorisée,
              de disponibilité au catalogue et de
              validation fournisseur restent contrôlées
              par BIB. Elles ne sont pas modifiables
              librement depuis cette fenêtre.
            </p>
          </section>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={update.isPending}
          >
            Annuler
          </Button>

          <Button
            onClick={submit}
            disabled={
              update.isPending ||
              (promotionEnabled &&
                !commercialPreview.valid)
            }
          >
            {update.isPending
              ? "Enregistrement..."
              : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function toDatetimeLocal(
  value: string | null | undefined,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() - offset * 60_000,
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-0.5 font-medium">
        {value}
      </p>
    </div>
  );
}
