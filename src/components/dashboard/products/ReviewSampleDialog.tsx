import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useReviewSample, useSampleValidation, getSampleStatusColor, getSampleStatusLabel } from "@/hooks/useSampleValidation";

interface ReviewSampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function ReviewSampleDialog({ open, onOpenChange, productId, productName }: ReviewSampleDialogProps) {
  const review = useReviewSample();
  const { data: current } = useSampleValidation(productId);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) setComment((current && "comment" in current ? (current as any).comment : "") || "");
  }, [open, current]);

  const submit = async (status: "to_validate" | "rejected") => {
    try {
      await review.mutateAsync({ productId, status, comment: comment.trim() || undefined });
      toast.success(status === "to_validate" ? "Marqué « À valider »" : "Produit rejeté");
      onOpenChange(false);
    } catch {
      toast.error("Action impossible");
    }
  };

  const status = (current && "status" in current ? (current as any).status : "none") as any;
  const validatedAt = (current && "validated_at" in current ? (current as any).validated_at : null) as string | null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Modération — {productName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Statut actuel :</span>
            <Badge className={`border ${getSampleStatusColor(status)}`}>{getSampleStatusLabel(status)}</Badge>
            {validatedAt && (
              <span className="text-muted-foreground">
                · {new Date(validatedAt).toLocaleString("fr-FR")}
              </span>
            )}
          </div>
          <div>
            <Label className="text-xs">Commentaire (optionnel)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Raison, points à corriger, retours fournisseur…"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button variant="destructive" onClick={() => submit("rejected")} disabled={review.isPending}>
            <XCircle className="w-4 h-4 mr-1" /> Rejeter
          </Button>
          <Button onClick={() => submit("to_validate")} disabled={review.isPending}>
            <CheckCircle2 className="w-4 h-4 mr-1" /> À valider
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
