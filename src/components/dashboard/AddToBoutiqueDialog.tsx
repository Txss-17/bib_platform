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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  Package,
  Store,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";
import type { Tables } from "@/integrations/supabase/types";

type SupplierProduct = Tables<"supplier_products">;

interface AddToBoutiqueDialogProps {
  product: SupplierProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToBoutiqueDialog({
  product,
  open,
  onOpenChange,
}: AddToBoutiqueDialogProps) {
  const { toast } = useToast();

  const {
    data: boutiques = [],
    isLoading: boutiquesLoading,
  } = useBoutiques();

  const {
    data: existingProducts = [],
    isLoading: productsLoading,
  } = useProducts();

  const [selectedBoutiqueId, setSelectedBoutiqueId] =
    useState<string>("");

  const [margin, setMargin] = useState<number>(
    product.max_margin_percent > 0
      ? Math.min(
          30,
          product.max_margin_percent,
        )
      : 0,
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  /* ---------------------------------------------------------------------- */
  /* Reset dialog state                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      setSelectedBoutiqueId("");
      setMargin(
        product.max_margin_percent > 0
          ? Math.min(
              30,
              product.max_margin_percent,
            )
          : 0,
      );
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [open, product]);

  /* ---------------------------------------------------------------------- */
  /* Eligible boutiques                                                     */
  /* ---------------------------------------------------------------------- */

  const eligibleBoutiques = useMemo(
    () =>
      boutiques.filter(
        (boutique) =>
          boutique.status === "draft" ||
          boutique.status === "published",
      ),
    [boutiques],
  );

  /* ---------------------------------------------------------------------- */
  /* Existing product detection                                            */
  /* ---------------------------------------------------------------------- */

  const existingProduct = useMemo(() => {
    if (!selectedBoutiqueId) {
      return null;
    }

    return (
      existingProducts.find(
        (existing) =>
          existing.boutique_id ===
            selectedBoutiqueId &&
          existing.supplier_product_id ===
            product.id,
      ) ?? null
    );
  }, [
    existingProducts,
    product.id,
    selectedBoutiqueId,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Commercial calculations                                                */
  /* ---------------------------------------------------------------------- */

  const basePrice = Number(
    product.base_price ?? 0,
  );

  const maxMargin = Number(
    product.max_margin_percent ?? 0,
  );

  const safeMargin = Math.min(
    Math.max(margin, 0),
    maxMargin,
  );

  const sellingPrice = useMemo(
    () =>
      Number(
        (
          basePrice *
          (1 + safeMargin / 100)
        ).toFixed(2),
      ),
    [basePrice, safeMargin],
  );

  const estimatedProfit = Number(
    (sellingPrice - basePrice).toFixed(2),
  );

  /* ---------------------------------------------------------------------- */
  /* Add product                                                             */
  /* ---------------------------------------------------------------------- */

  const handleAdd = async () => {
    if (!selectedBoutiqueId) {
      toast({
        title: "Boutique requise",
        description:
          "Sélectionnez une boutique avant de continuer.",
        variant: "destructive",
      });

      return;
    }

    if (existingProduct) {
      toast({
        title: "Produit déjà ajouté",
        description:
          "Ce produit existe déjà dans cette boutique.",
        variant: "destructive",
      });

      return;
    }

    if (safeMargin > maxMargin) {
      toast({
        title: "Marge invalide",
        description:
          "La marge sélectionnée dépasse la marge maximale autorisée.",
        variant: "destructive",
      });

      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("products")
        .insert({
          boutique_id: selectedBoutiqueId,
          supplier_product_id: product.id,

          public_price: sellingPrice,
          applied_margin: safeMargin,

          /*
           * Les données promotionnelles sont volontairement
           * nulles à la création.
           *
           * Elles seront configurées depuis la gestion
           * du produit après son ajout.
           */
          sale_price: null,
          promotion_starts_at: null,
          promotion_ends_at: null,
          promotion_label: null,

          /*
           * Le produit doit passer par le processus
           * de validation d'échantillon avant publication.
           */
          status: "paused",

          /*
           * Valeurs initiales de stock.
           * Elles pourront être modifiées ensuite
           * depuis la gestion de la boutique.
           */
          stock_quantity: 0,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      setSuccess(true);

      toast({
        title: "Produit ajouté",
        description:
          "Le produit a été ajouté à votre boutique et placé en attente de validation.",
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout du produit :",
        error,
      );

      toast({
        title: "Impossible d'ajouter le produit",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Success state                                                           */
  /* ---------------------------------------------------------------------- */

  if (success) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center gap-5 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                Produit ajouté
              </h2>

              <p className="text-sm text-muted-foreground">
                Le produit a bien été ajouté à votre
                boutique.
              </p>
            </div>

            <Alert className="text-left">
              <Package className="h-4 w-4" />

              <AlertDescription>
                Un échantillon doit être validé avant
                que le produit puisse être vendu.
              </AlertDescription>
            </Alert>

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Main dialog                                                             */
  /* ---------------------------------------------------------------------- */

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Ajouter à ma boutique
          </DialogTitle>

          <DialogDescription>
            Configurez le prix de vente du produit avant
            de l'ajouter à votre catalogue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* ---------------------------------------------------------------- */}
          {/* Product summary                                                   */}
          {/* ---------------------------------------------------------------- */}

          <div className="flex gap-4 rounded-lg border p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-medium">
                {product.name}
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                {product.category}
              </p>

              <p className="mt-2 text-sm font-medium">
                Prix fournisseur :{" "}
                {basePrice.toFixed(2)} €
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Boutique                                                           */}
          {/* ---------------------------------------------------------------- */}

          <div className="space-y-2">
            <Label htmlFor="boutique">
              Boutique
            </Label>

            <Select
              value={selectedBoutiqueId}
              onValueChange={setSelectedBoutiqueId}
              disabled={
                boutiquesLoading ||
                productsLoading ||
                isSubmitting
              }
            >
              <SelectTrigger id="boutique">
                <SelectValue
                  placeholder={
                    boutiquesLoading
                      ? "Chargement..."
                      : "Sélectionner une boutique"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {eligibleBoutiques.map(
                  (boutique) => (
                    <SelectItem
                      key={boutique.id}
                      value={boutique.id}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4" />

                        <span>
                          {boutique.name}
                        </span>
                      </div>
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            {eligibleBoutiques.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucune boutique disponible.
              </p>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Margin                                                             */}
          {/* ---------------------------------------------------------------- */}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="margin">
                Marge appliquée
              </Label>

              <span className="font-medium">
                {safeMargin} %
              </span>
            </div>

            <Slider
              id="margin"
              value={[safeMargin]}
              min={0}
              max={Math.max(maxMargin, 1)}
              step={1}
              onValueChange={([value]) =>
                setMargin(value)
              }
              disabled={isSubmitting}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 %</span>

              <span>
                Maximum : {maxMargin} %
              </span>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Price summary                                                     */}
          {/* ---------------------------------------------------------------- */}

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Prix fournisseur
              </span>

              <span>
                {basePrice.toFixed(2)} €
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Marge
              </span>

              <span>
                {safeMargin} %
              </span>
            </div>

            <div className="my-3 border-t" />

            <div className="flex items-center justify-between">
              <span className="font-medium">
                Prix de vente
              </span>

              <span className="text-lg font-semibold">
                {sellingPrice.toFixed(2)} €
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Bénéfice estimé / unité
              </span>

              <span className="text-sm font-medium">
                {estimatedProfit.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Validation information                                            */}
          {/* ---------------------------------------------------------------- */}

          <Alert>
            <AlertCircle className="h-4 w-4" />

            <AlertDescription>
              Le produit sera ajouté en statut{" "}
              <strong>en attente</strong>. Un échantillon
              devra être validé avant sa mise en vente.
            </AlertDescription>
          </Alert>

          {/* ---------------------------------------------------------------- */}
          {/* Promotion information                                             */}
          {/* ---------------------------------------------------------------- */}

          <div className="rounded-lg border border-dashed p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Promotion
              </p>

              <p className="text-sm text-muted-foreground">
                Aucune promotion n'est configurée lors de
                l'ajout. Vous pourrez définir ultérieurement
                un prix promotionnel, une période et un
                libellé depuis la gestion du produit.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Annuler
          </Button>

          <Button
            type="button"
            onClick={handleAdd}
            disabled={
              isSubmitting ||
              !selectedBoutiqueId ||
              !!existingProduct ||
              eligibleBoutiques.length === 0
            }
          >
            {isSubmitting
              ? "Ajout..."
              : "Ajouter à ma boutique"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
