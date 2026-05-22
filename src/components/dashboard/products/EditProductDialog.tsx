import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useUpdateProduct } from "@/hooks/useProducts";

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    public_price: number | string;
    applied_margin: number | string;
    stock_quantity: number | null;
    low_stock_threshold: number | null;
    supplier_products?: { name?: string | null } | null;
  };
}

export function EditProductDialog({ open, onOpenChange, product }: EditProductDialogProps) {
  const update = useUpdateProduct();
  const [price, setPrice] = useState(String(product.public_price ?? ""));
  const [margin, setMargin] = useState(String(product.applied_margin ?? ""));
  const [stock, setStock] = useState(String(product.stock_quantity ?? 0));
  const [threshold, setThreshold] = useState(String(product.low_stock_threshold ?? 5));

  useEffect(() => {
    if (open) {
      setPrice(String(product.public_price ?? ""));
      setMargin(String(product.applied_margin ?? ""));
      setStock(String(product.stock_quantity ?? 0));
      setThreshold(String(product.low_stock_threshold ?? 5));
    }
  }, [open, product]);

  const submit = async () => {
    const p = Number(price);
    const m = Number(margin);
    const s = Number(stock);
    const t = Number(threshold);
    if (!Number.isFinite(p) || p < 0) return toast.error("Prix invalide");
    if (!Number.isFinite(m) || m < 0) return toast.error("Marge invalide");
    if (!Number.isFinite(s) || s < 0) return toast.error("Stock invalide");
    try {
      await update.mutateAsync({
        productId: product.id,
        updates: {
          public_price: p,
          applied_margin: m,
          stock_quantity: Math.round(s),
          low_stock_threshold: Math.round(t),
        },
      });
      toast.success("Produit mis à jour");
      onOpenChange(false);
    } catch (e) {
      toast.error("Mise à jour impossible");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            Modifier — {product.supplier_products?.name || "Produit"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Prix public (€)</Label>
            <Input value={price} type="number" step="0.01" min="0" onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Marge (%)</Label>
            <Input value={margin} type="number" step="1" min="0" onChange={(e) => setMargin(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Stock</Label>
            <Input value={stock} type="number" step="1" min="0" onChange={(e) => setStock(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Seuil stock bas</Label>
            <Input value={threshold} type="number" step="1" min="0" onChange={(e) => setThreshold(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={submit} disabled={update.isPending}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
