import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Plus, Store, Calculator, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type SupplierProduct = Tables<"supplier_products">;

interface AddToBoutiqueDialogProps {
  product: SupplierProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToBoutiqueDialog({ product, open, onOpenChange }: AddToBoutiqueDialogProps) {
  const { data: boutiques, isLoading: loadingBoutiques } = useBoutiques();
  const { data: existingProducts } = useProducts();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState("");
  const [margin, setMargin] = useState(20);
  const [isAdding, setIsAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  const sellingPrice = product.base_price * (1 + margin / 100);
  const profit = sellingPrice - product.base_price;

  const isDuplicate = useMemo(() => {
    if (!selectedBoutiqueId || !existingProducts) return false;
    return existingProducts.some(
      p => p.boutique_id === selectedBoutiqueId && p.supplier_product_id === product.id
    );
  }, [selectedBoutiqueId, existingProducts, product.id]);

  const handleAdd = async () => {
    if (!selectedBoutiqueId || !user) return;

    setIsAdding(true);
    try {
      const { error } = await supabase.from("products").insert({
        boutique_id: selectedBoutiqueId,
        supplier_product_id: product.id,
        public_price: Number(sellingPrice.toFixed(2)),
        applied_margin: margin,
      });

      if (error) {
        if (error.message.includes("duplicate") || error.code === "23505") {
          toast.error("Ce produit est déjà dans cette boutique");
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product-stats"] });
        toast.success(`${product.name} ajouté à votre boutique !`);
        setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
          setSelectedBoutiqueId("");
        }, 1500);
      }
    } catch (err: any) {
      toast.error("Erreur lors de l'ajout: " + (err.message || "Réessayez"));
    } finally {
      setIsAdding(false);
    }
  };

  const publishedBoutiques = boutiques?.filter(b => b.status === "published") || [];
  const allBoutiques = boutiques || [];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isAdding) { onOpenChange(v); setSuccess(false); } }}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Store className="w-4 h-4" />
            Ajouter à ma boutique
          </DialogTitle>
          <DialogDescription className="text-xs">{product.name}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-sm font-medium">Produit ajouté avec succès !</p>
            <p className="text-xs text-muted-foreground">
              Retrouvez-le dans "Mes Produits"
            </p>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Boutique selector */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Choisir une boutique</label>
              {loadingBoutiques ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Chargement...
                </div>
              ) : allBoutiques.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  Vous n'avez pas encore de boutique. Créez-en une d'abord.
                </p>
              ) : (
                <Select value={selectedBoutiqueId} onValueChange={setSelectedBoutiqueId}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Sélectionner une boutique" />
                  </SelectTrigger>
                  <SelectContent>
                    {allBoutiques.map(b => (
                      <SelectItem key={b.id} value={b.id}>
                        <div className="flex items-center gap-2">
                          <span>{b.name}</span>
                          <Badge variant="outline" className="text-[9px] h-4 px-1">
                            {b.status === "published" ? "Publiée" : "Brouillon"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Margin calculator */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">Configurer la marge</span>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Marge: {margin}%</span>
                  <span>Max: {product.max_margin_percent}%</span>
                </div>
                <Slider
                  min={0} max={product.max_margin_percent} step={1}
                  value={[margin]}
                  onValueChange={([v]) => setMargin(v)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                <div>
                  <p className="text-[10px] text-muted-foreground">Prix base</p>
                  <p className="text-sm font-bold">{product.base_price.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Prix de vente</p>
                  <p className="text-sm font-bold text-primary">{sellingPrice.toFixed(2)} €</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Profit/unité</p>
                  <p className="text-sm font-bold text-green-600">+{profit.toFixed(2)} €</p>
                </div>
              </div>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!selectedBoutiqueId || isAdding}
              onClick={handleAdd}
            >
              {isAdding ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Ajout en cours...</>
              ) : (
                <><Plus className="w-4 h-4" /> Ajouter à ma boutique</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
