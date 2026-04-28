import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, ShoppingBag, Eye, CheckCircle2, Camera, 
  Loader2, AlertTriangle, ArrowRight, Upload 
} from "lucide-react";
import { 
  useSampleValidation, useOrderSample, useReceiveSample, useValidateSample,
  getSampleStatusLabel, getSampleStatusColor, type SampleStatus
} from "@/hooks/useSampleValidation";
import { toast } from "sonner";

interface SampleValidationPanelProps {
  productId: string;
  productName: string;
  compact?: boolean;
}

const steps = [
  { key: "ordered" as const, label: "Commander", icon: ShoppingBag, description: "Commander un échantillon" },
  { key: "received" as const, label: "Tester", icon: Eye, description: "Tester le produit" },
  { key: "validated" as const, label: "Valider", icon: CheckCircle2, description: "Valider l'échantillon" },
];

function getStepIndex(status: SampleStatus): number {
  switch (status) {
    case "none": return -1;
    case "ordered": return 0;
    case "received": return 1;
    case "validated": return 2;
  }
}

export function SampleValidationPanel({ productId, productName, compact = false }: SampleValidationPanelProps) {
  const { data: validation, isLoading } = useSampleValidation(productId);
  const orderSample = useOrderSample();
  const receiveSample = useReceiveSample();
  const validateSample = useValidateSample();
  const [comment, setComment] = useState("");
  const [showValidateForm, setShowValidateForm] = useState(false);

  if (isLoading) return null;

  const status = validation?.status || "none";
  const currentStep = getStepIndex(status);

  const handleOrder = async () => {
    try {
      await orderSample.mutateAsync(productId);
      toast.success("📦 Échantillon commandé !", {
        description: `Votre échantillon de "${productName}" a été commandé. Vous serez notifié à la réception.`,
        duration: 5000,
      });
    } catch {
      toast.error("Erreur lors de la commande");
    }
  };

  const handleReceive = async () => {
    try {
      await receiveSample.mutateAsync(productId);
      toast.success("🔍 Échantillon reçu !", {
        description: `"${productName}" est marqué comme reçu. Testez-le puis validez pour l'activer en boutique.`,
        duration: 5000,
      });
    } catch {
      toast.error("Erreur");
    }
  };

  const handleValidate = async () => {
    if (!comment.trim()) {
      toast.error("Veuillez ajouter un commentaire sur votre retour d'expérience");
      return;
    }
    try {
      await validateSample.mutateAsync({ productId, comment });
      toast.success("✅ Produit validé et activé !", {
        description: `"${productName}" est maintenant visible et disponible à la vente dans votre boutique.`,
        duration: 6000,
      });
      setShowValidateForm(false);
    } catch {
      toast.error("Erreur lors de la validation");
    }
  };

  if (status === "validated" && compact) {
    return (
      <Badge className="text-[10px] bg-success/15 text-success border-success/30">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Validé
      </Badge>
    );
  }

  if (compact) {
    return (
      <Badge className={`text-[10px] border ${getSampleStatusColor(status)}`}>
        {getSampleStatusLabel(status)}
      </Badge>
    );
  }

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">Validation produit</h4>
          </div>
          <Badge className={`text-[10px] border ${getSampleStatusColor(status)}`}>
            {getSampleStatusLabel(status)}
          </Badge>
        </div>

        {/* Info message */}
        {status !== "validated" && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 dark:border-warning/30">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <p className="text-xs text-warning dark:text-warning">
              Vous devez tester ce produit avant de le vendre. Les vendeurs testant leurs produits vendent 3x mieux !
            </p>
          </div>
        )}

        {/* Steps timeline */}
        <div className="flex items-center gap-1">
          {steps.map((step, i) => {
            const done = currentStep >= i;
            const active = currentStep === i - 1 || (currentStep === -1 && i === 0);
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center gap-1.5 p-2 rounded-lg flex-1 text-xs transition-colors ${
                  done 
                    ? "bg-success/15 text-success dark:text-success" 
                    : active 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                }`}>
                  <StepIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium hidden sm:inline">{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className={`w-3 h-3 shrink-0 ${done ? "text-success" : "text-muted-foreground/30"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        {status === "none" && (
          <Button 
            onClick={handleOrder} 
            disabled={orderSample.isPending}
            className="w-full gap-2"
            size="sm"
          >
            {orderSample.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingBag className="w-4 h-4" />}
            Commander un échantillon
          </Button>
        )}

        {status === "ordered" && (
          <Button 
            onClick={handleReceive} 
            disabled={receiveSample.isPending}
            className="w-full gap-2"
            variant="outline"
            size="sm"
          >
            {receiveSample.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
            J'ai reçu mon échantillon
          </Button>
        )}

        {status === "received" && !showValidateForm && (
          <Button 
            onClick={() => setShowValidateForm(true)}
            className="w-full gap-2"
            size="sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Valider mon échantillon
          </Button>
        )}

        {status === "received" && showValidateForm && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/50">
            <p className="text-xs font-medium">Votre retour d'expérience</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment est le produit ? Qualité, texture, rendu..."
              className="text-sm min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValidateForm(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={handleValidate}
                disabled={validateSample.isPending || !comment.trim()}
                className="flex-1 gap-2"
              >
                {validateSample.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Valider
              </Button>
            </div>
          </div>
        )}

        {status === "validated" && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 dark:border-success/30">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <div>
              <p className="text-xs font-medium text-success dark:text-success">Produit validé et actif</p>
              {validation && 'comment' in validation && (validation as any).comment && (
                <p className="text-[10px] text-success dark:text-success mt-0.5">"{(validation as any).comment}"</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
