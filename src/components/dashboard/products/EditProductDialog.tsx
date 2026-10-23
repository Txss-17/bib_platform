
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BadgeEuro,
  CalendarClock,
  CheckCircle2,
  Info,
  Package,
  Percent,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Tags,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";
import { useUpdateProduct } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    boutique_id: string;
    supplier_product_id: string;
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

const inputClass =
  "h-10 rounded-lg border-border bg-background focus-visible:ring-[#D0AD62]";

const sectionClass =
  "space-y-4 rounded-xl border border-border/80 bg-card p-4 sm:p-5";

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D0AD62]/30 bg-[#D0AD62]/10 text-[#A17B32]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
      </Label>
      {children}
      {hint && (
        <p className="text-[11px] leading-4 text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

function ReadonlyMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-muted/30 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function EditProductDialog({
  open,
  onOpenChange,
  product,
}: EditProductDialogProps) {
  const update = useUpdateProduct();
  const navigate = useNavigate();

  const [margin, setMargin] = useState("");
  const [threshold, setThreshold] = useState("");
  const [restockQuantity, setRestockQuantity] = useState("");
  const [restockPending, setRestockPending] = useState(false);
  const [restockRequests, setRestockRequests] = useState<any[]>([]);

  const [promotionEnabled, setPromotionEnabled] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [promotionLabel, setPromotionLabel] = useState("");
  const [promotionStartsAt, setPromotionStartsAt] = useState("");
  const [promotionEndsAt, setPromotionEndsAt] = useState("");

  useEffect(() => {
    if (!open) return;
    setMargin(String(product.applied_margin ?? ""));
    setThreshold(String(product.low_stock_threshold ?? 5));
    void supabase.from("stock_restock_requests" as any).select("id,requested_quantity,status,created_at").eq("product_id", product.id).order("created_at", { ascending: false }).then(({data}: any) => setRestockRequests(data ?? []));

    const existingSalePrice =
      product.sale_price != null && Number(product.sale_price) > 0
        ? String(product.sale_price)
        : "";

    setSalePrice(existingSalePrice);
    setPromotionEnabled(existingSalePrice !== "");
    setPromotionLabel(product.promotion_label ?? "");
    setPromotionStartsAt(toDatetimeLocal(product.promotion_starts_at));
    setPromotionEndsAt(toDatetimeLocal(product.promotion_ends_at));
  }, [open, product]);

  const supplier = product.supplier_products;
  const supplierBasePrice = Number(supplier?.base_price ?? 0);
  const maxMargin = Number(supplier?.max_margin_percent ?? 0);
  const moq = supplier?.moq ?? null;
  const appliedMargin = Number(margin);
  const publicPrice = Number.isFinite(appliedMargin)
    ? Number((supplierBasePrice * (1 + appliedMargin / 100)).toFixed(2))
    : 0;

  const requestRestock = async () => {
    const quantity = Number(restockQuantity);
    if (!Number.isInteger(quantity) || quantity < Number(moq ?? 1)) { toast.error("La quantité doit respecter le minimum de commande du catalogue BIB."); return; }
    setRestockPending(true);
    const { error } = await supabase.from("stock_restock_requests" as any).insert({ product_id: product.id, supplier_product_id: product.supplier_product_id, boutique_id: product.boutique_id, requested_quantity: quantity, catalog_moq: Number(moq ?? 1) });
    setRestockPending(false);
    if (error) { toast.error("Impossible d’envoyer la demande de réassort."); return; }
    setRestockQuantity(""); toast.success("Demande de réassort envoyée à BIB.");
    const { data: requests } = await supabase.from("stock_restock_requests" as any).select("id,requested_quantity,status,created_at").eq("product_id", product.id).order("created_at", { ascending: false }); setRestockRequests(requests ?? []);
  };
  const preview = useMemo(() => {
    const calculatedPrice = publicPrice;
    const promotionalPrice = Number(salePrice);

    if (!Number.isFinite(calculatedPrice) || calculatedPrice <= 0) {
      return {
        valid: false,
        discountPercent: 0,
        saving: 0,
        currentPrice: calculatedPrice,
      };
    }

    if (!promotionEnabled) {
      return {
        valid: true,
        discountPercent: 0,
        saving: 0,
        currentPrice: calculatedPrice,
      };
    }

    if (
      salePrice.trim() === "" ||
      !Number.isFinite(promotionalPrice) ||
      promotionalPrice < 0 ||
      promotionalPrice >= calculatedPrice
    ) {
      return {
        valid: false,
        discountPercent: 0,
        saving: 0,
        currentPrice: promotionalPrice,
      };
    }

    return {
      valid: true,
      discountPercent: Math.round(
        ((calculatedPrice - promotionalPrice) / calculatedPrice) * 100,
      ),
      saving: Number((calculatedPrice - promotionalPrice).toFixed(2)),
      currentPrice: promotionalPrice,
    };
  }, [publicPrice, promotionEnabled, salePrice]);

  const submit = async () => {
    const calculatedPrice = publicPrice;
    const appliedMargin = Number(margin);
    const lowStockThreshold = Number(threshold);

    if (!Number.isFinite(calculatedPrice) || calculatedPrice <= 0) {
      toast.error("Saisissez un prix public valide.");
      return;
    }

    if (margin.trim() === "" || !Number.isFinite(appliedMargin) || appliedMargin < 0) {
      toast.error("Saisissez une marge valide.");
      return;
    }

    if (maxMargin > 0 && appliedMargin > maxMargin) {
      toast.error(`La marge ne peut pas dépasser ${maxMargin} %.`);
      return;
    }

    if (
      threshold.trim() === "" ||
      !Number.isFinite(lowStockThreshold) ||
      lowStockThreshold < 0 ||
      !Number.isInteger(lowStockThreshold)
    ) {
      toast.error("Le seuil de stock doit être un entier positif ou nul.");
      return;
    }

    let finalSalePrice: number | null = null;
    let finalPromotionStart: string | null = null;
    let finalPromotionEnd: string | null = null;
    let finalPromotionLabel: string | null = null;

    if (promotionEnabled) {
      if (
        salePrice.trim() === "" ||
        !Number.isFinite(Number(salePrice)) ||
        Number(salePrice) < 0 ||
        Number(salePrice) >= calculatedPrice
      ) {
        toast.error(
          "Le prix promotionnel doit être valide et inférieur au prix public.",
        );
        return;
      }

      if (promotionStartsAt) {
        const start = new Date(promotionStartsAt);
        if (Number.isNaN(start.getTime())) {
          toast.error("La date de début de promotion est invalide.");
          return;
        }
        finalPromotionStart = start.toISOString();
      }

      if (promotionEndsAt) {
        const end = new Date(promotionEndsAt);
        if (Number.isNaN(end.getTime())) {
          toast.error("La date de fin de promotion est invalide.");
          return;
        }
        finalPromotionEnd = end.toISOString();
      }

      if (promotionStartsAt && promotionEndsAt) {
        if (new Date(promotionEndsAt) < new Date(promotionStartsAt)) {
          toast.error(
            "La fin de promotion doit être postérieure à son début.",
          );
          return;
        }
      }

      finalSalePrice = Number(Number(salePrice).toFixed(2));
      finalPromotionLabel = promotionLabel.trim() || null;
    }

    try {
      await update.mutateAsync({
        id: product.id,
        updates: {
          public_price: Number(calculatedPrice.toFixed(2)),
          applied_margin: Number(appliedMargin.toFixed(2)),
          low_stock_threshold: lowStockThreshold,
          sale_price: finalSalePrice,
          promotion_starts_at: finalPromotionStart,
          promotion_ends_at: finalPromotionEnd,
          promotion_label: finalPromotionLabel,
        },
      });

      toast.success("Produit mis à jour.");
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit :", error);
      toast.error("La mise à jour du produit a échoué.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-[calc(100%-1rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-border bg-muted/20 px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3 pr-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#172B4D] text-white">
              <Package className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  Modifier le produit
                </DialogTitle>
                <Badge variant="outline" className="border-[#D0AD62]/50 bg-[#D0AD62]/10 text-[#8B692B]">
                  Catalogue BIB
                </Badge>
              </div>
              <DialogDescription className="mt-1 line-clamp-2">
                {supplier?.name || "Produit sans nom"} — gérez le prix,
                les promotions et le stock.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
          <section className={sectionClass}>
            <SectionHeading
              icon={Package}
              title="Référence fournisseur"
              description="Informations de référence communiquées par le fournisseur. Ces données ne sont pas modifiables ici."
            />

            {supplier?.description && (
              <p className="text-sm leading-6 text-muted-foreground">
                {supplier.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <ReadonlyMetric
                label="Catégorie"
                value={supplier?.category || "Non renseignée"}
              />
              <ReadonlyMetric
                label="Prix fournisseur"
                value={`${supplierBasePrice.toFixed(2)} €`}
              />
              <ReadonlyMetric
                label="MOQ fournisseur"
                value={moq !== null ? String(moq) : "Non renseigné"}
              />
              <ReadonlyMetric
                label="Marge maximale"
                value={maxMargin > 0 ? `${maxMargin} %` : "Non renseignée"}
              />
            </div>

            <Alert className="border-[#D0AD62]/30 bg-[#D0AD62]/5">
              <Info className="h-4 w-4 text-[#A17B32]" />
              <AlertDescription className="text-xs leading-5">
                Le MOQ est fixé par le fournisseur. Il ne peut pas être
                abaissé ou modifié depuis l’espace marchand.
              </AlertDescription>
            </Alert>
          </section>

          <section className={sectionClass}>
            <SectionHeading
              icon={BadgeEuro}
              title="Prix de vente et marge"
              description="Définissez votre prix public dans le respect des contraintes commerciales applicables."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ReadonlyMetric label="Prix public calculé" value={`${publicPrice.toFixed(2)} €`} />

              <Field
                id="margin"
                label="Marge appliquée (%)"
                hint={
                  maxMargin > 0
                    ? `Plafond fournisseur : ${maxMargin} %.`
                    : "Respectez les conditions commerciales du fournisseur."
                }
              >
                <Input
                  id="margin"
                  className={inputClass}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  max={maxMargin > 0 ? maxMargin : undefined}
                  value={margin}
                  onChange={(event) => setMargin(event.target.value)}
                />
              </Field>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="flex items-start justify-between gap-4">
              <SectionHeading
                icon={Tags}
                title="Promotion commerciale"
                description="Configurez une réduction temporaire pour la boutique."
              />
              <Switch
                checked={promotionEnabled}
                onCheckedChange={setPromotionEnabled}
                aria-label="Activer la promotion"
              />
            </div>

            {promotionEnabled ? (
              <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="sale-price" label="Prix promotionnel (€)">
                    <Input
                      id="sale-price"
                      className={inputClass}
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      max={publicPrice || undefined}
                      value={salePrice}
                      onChange={(event) => setSalePrice(event.target.value)}
                    />
                  </Field>

                  <Field id="promotion-label" label="Libellé promotionnel">
                    <Input
                      id="promotion-label"
                      className={inputClass}
                      value={promotionLabel}
                      maxLength={80}
                      placeholder="Ex. Offre de lancement"
                      onChange={(event) => setPromotionLabel(event.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="promotion-start" label="Début de la promotion">
                    <Input
                      id="promotion-start"
                      className={inputClass}
                      type="datetime-local"
                      value={promotionStartsAt}
                      onChange={(event) => setPromotionStartsAt(event.target.value)}
                    />
                  </Field>

                  <Field id="promotion-end" label="Fin de la promotion">
                    <Input
                      id="promotion-end"
                      className={inputClass}
                      type="datetime-local"
                      value={promotionEndsAt}
                      onChange={(event) => setPromotionEndsAt(event.target.value)}
                    />
                  </Field>
                </div>

                {preview.valid && preview.discountPercent > 0 && (
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold">
                        Réduction de {preview.discountPercent} %
                      </p>
                      <p className="mt-0.5 text-xs">
                        Économie de {preview.saving.toFixed(2)} € par unité.
                      </p>
                    </div>
                  </div>
                )}

                {!preview.valid && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Le prix promotionnel doit être renseigné et inférieur
                      au prix public.
                    </AlertDescription>
                  </Alert>
                )}

                <p className="text-xs leading-5 text-muted-foreground">
                  Les dates sont facultatives individuellement. Si elles
                  sont toutes les deux renseignées, la fin doit être
                  postérieure au début.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4 shrink-0" />
                Aucune promotion active dans cette configuration.
              </div>
            )}
          </section>

          <section className={sectionClass}>
            <SectionHeading
              icon={Warehouse}
              title="Gestion du stock"
              description="Le stock réel est actualisé à partir des réceptions confirmées et des mouvements de stock enregistrés."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ReadonlyMetric
                label="Stock disponible"
                value={String(product.stock_quantity ?? 0)}
              />

              <Field
                id="stock-threshold"
                label="Seuil d’alerte de stock"
                hint="Une alerte est déclenchée lorsque le stock atteint ce seuil."
              >
                <Input
                  id="stock-threshold"
                  className={inputClass}
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Field id="restock-quantity" label="Quantité à réapprovisionner" hint={`Minimum catalogue BIB : ${moq ?? 1} unité(s). La demande ne modifie pas le stock disponible.`}>
                <Input id="restock-quantity" type="number" min={moq ?? 1} step="1" inputMode="numeric" value={restockQuantity} onChange={(e) => setRestockQuantity(e.target.value)} placeholder={String(moq ?? 1)} />
              </Field>
              <Button type="button" onClick={requestRestock} disabled={restockPending || !restockQuantity}>{restockPending ? "Envoi…" : "Demander le réassort"}</Button>
            </div>
            {restockRequests.length > 0 && <div className="space-y-2 rounded-lg border p-3"><p className="text-sm font-medium">Suivi des demandes</p>{restockRequests.map((request) => <div key={request.id} className="flex flex-wrap items-center justify-between gap-2 text-xs"><span>{request.requested_quantity} unité(s) · {new Date(request.created_at).toLocaleDateString("fr-FR")}</span><Badge variant="outline">{request.status === "requested" ? "Demandée" : request.status === "approved" ? "Approuvée" : request.status === "ordered" ? "Commandée" : request.status === "received" ? "Reçue" : request.status === "rejected" ? "Refusée" : request.status === "cancelled" ? "Annulée" : request.status}</Badge></div>)}</div>}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs leading-5">
                Le stock ne peut pas être augmenté ou diminué manuellement
                depuis cette fenêtre. Toute entrée doit correspondre à une
                réception confirmée ; toute sortie doit correspondre à un
                mouvement de stock enregistré.
              </AlertDescription>
            </Alert>
          </section>

          <section className={sectionClass}>
            <SectionHeading
              icon={Sparkles}
              title="Personnalisation du produit"
              description="La configuration avancée sera pilotée depuis le module Personnalisation."
            />

            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                window.location.assign(
                  `/dashboard/personnalisation?productId=${encodeURIComponent(product.id)}`,
                );
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Ouvrir l’outil de personnalisation
            </Button>

            <div className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Options autorisées par le fournisseur
                </p>
                <p className="text-xs leading-5 text-muted-foreground">
                  Logo, couleurs, textes, matières, formes, finitions,
                  étiquettes et packaging ne seront configurables que si
                  les capacités correspondantes sont renseignées et validées
                  pour cette référence. Aucune option n’est activée
                  arbitrairement dans cette fenêtre.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#172B4D]/15 bg-[#172B4D]/[0.035] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#172B4D]" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Contrôles et validation BIB
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Les conditions fournisseur, les exigences de conformité
                  et la validation de l’échantillon restent régies par les
                  contrôles BIB. Enregistrer ces paramètres ne contourne
                  pas les règles d’activation du produit.
                </p>
              </div>
            </div>
          </section>
        </div>

        <Separator />

        <DialogFooter className="gap-2 border-t border-border bg-background px-5 py-4 sm:px-7">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={update.isPending}
          >
            Annuler
          </Button>

          <Button
            type="button"
            className="rounded-lg bg-[#172B4D] text-white hover:bg-[#223D66]"
            onClick={submit}
            disabled={
              update.isPending ||
              (promotionEnabled && !preview.valid)
            }
          >
            {update.isPending ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 16);
}



