import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Heart, Package, ShoppingBag, SlidersHorizontal, MapPin, Boxes, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
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

function money(amount: number) {
  return new Intl.NumberFormat(getUiLocale(), {
    style: "currency", currency: "EUR",
  }).format(amount);
}

export function ProductDetailDialog({
  product, open, onOpenChange, onAdd, isFavorite, onToggleFavorite,
}: ProductDetailDialogProps) {
  useLanguage();
  const basePrice = Number(product.base_price) || 0;
  const maxMargin = Math.max(0, Number(product.max_margin_percent) || 0);
  const [requestedMargin, setRequestedMargin] = useState(20);
  const margin = Math.min(requestedMargin, maxMargin);
  const sellingPrice = basePrice * (1 + margin / 100);
  const grossDifference = sellingPrice - basePrice;
  const minimumQuantity = Number(product.moq) || 0;
  const favorite = isFavorite(product.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-1rem)] max-w-5xl flex-col overflow-hidden rounded-2xl p-0 sm:w-[calc(100vw-2rem)]">
        <DialogHeader className="shrink-0 border-b border-border/70 px-4 py-4 pr-12 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {translateUi("Catalogue BIB")}
            </Badge>
          </div>
          <DialogTitle className="mt-2 text-left text-xl font-semibold leading-tight sm:text-2xl">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-left text-sm">
            {translateUi("Informations produit et simulation de prix avant l'ajout à votre boutique.")}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="min-w-0 border-b border-border/70 bg-muted/20 p-4 sm:p-6 lg:border-b-0 lg:border-r">
              <div className="flex aspect-[5/4] items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-card">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-12 w-12 opacity-50" />
                    <span className="text-sm">{translateUi("Visuel indisponible")}</span>
                  </div>
                )}
              </div>
              {product.description && (
                <section className="mt-5">
                  <h3 className="text-sm font-semibold text-foreground">{translateUi("Description du produit")}</h3>
                  <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-muted-foreground">
                    {product.description}
                  </p>
                </section>
              )}
            </div>

            <div className="min-w-0 space-y-5 p-4 sm:p-6">
              <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
                <h3 className="mb-4 text-sm font-semibold">{translateUi("Conditions commerciales")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{translateUi("Prix de base")}</p>
                    <p className="mt-1 text-xl font-bold tabular-nums">{money(basePrice)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{translateUi("Marge maximale autorisée")}</p>
                    <p className="mt-1 text-xl font-bold tabular-nums text-primary">{maxMargin} %</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {translateUi("Le prix final dépend de la marge que vous choisissez et des frais applicables.")}
                </p>
              </section>

              <section className="rounded-2xl border border-border/70 bg-muted/20 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold">{translateUi("Simuler mon prix de vente")}</h3>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs text-muted-foreground" htmlFor="supplier-detail-margin">
                    {translateUi("Marge appliquée")}
                  </label>
                  <span className="text-sm font-semibold tabular-nums">{margin} %</span>
                </div>
                <Slider
                  id="supplier-detail-margin"
                  min={0}
                  max={Math.max(1, maxMargin)}
                  step={1}
                  value={[margin]}
                  onValueChange={([next]) => setRequestedMargin(Math.min(next, maxMargin))}
                  className="mt-3"
                  disabled={maxMargin === 0}
                />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-card p-3">
                    <p className="text-xs text-muted-foreground">{translateUi("Prix de vente estimé")}</p>
                    <p className="mt-1 text-lg font-bold tabular-nums">{money(sellingPrice)}</p>
                  </div>
                  <div className="rounded-xl bg-card p-3">
                    <p className="text-xs text-muted-foreground">{translateUi("Écart brut par unité")}</p>
                    <p className="mt-1 text-lg font-bold tabular-nums text-primary">{money(grossDifference)}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {translateUi("Simulation indicative avant commissions, impôts et éventuels frais supplémentaires ; ce montant n'est pas un bénéfice net.")}
                </p>
              </section>

              <section className="rounded-2xl border border-border/70 p-4 sm:p-5">
                <h3 className="mb-3 text-sm font-semibold">{translateUi("Informations complémentaires")}</h3>
                <div className="divide-y divide-border/60 text-sm">
                  <div className="flex items-center justify-between gap-3 py-2">
                    <span className="inline-flex items-center gap-2 text-muted-foreground"><Boxes className="h-4 w-4" />{translateUi("Quantité minimale")}</span>
                    <span className="font-medium tabular-nums">{minimumQuantity > 0 ? minimumQuantity : "—"}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3 py-2">
                    <span className="inline-flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 shrink-0" />{translateUi("Marché commercial")}</span>
                    <span className="max-w-[55%] break-words text-right font-medium">{product.market || translateUi("Non renseigné")}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-background px-4 py-3 sm:px-6">
          <Button type="button" variant="outline" className="gap-2" onClick={() => onToggleFavorite(product)}>
            <Heart className={`h-4 w-4 ${favorite ? "fill-destructive text-destructive" : ""}`} />
            {favorite ? translateUi("En favoris") : translateUi("Ajouter aux favoris")}
          </Button>
          <div className="flex flex-1 justify-end gap-2 sm:flex-none">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {translateUi("Fermer")}
            </Button>
            <Button type="button" onClick={onAdd} className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              {translateUi("Ajouter à une boutique")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailDialog;
