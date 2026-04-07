import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Package, RotateCcw, Wrench, CheckCircle, Loader2 } from "lucide-react";
import { useCreateOrderIssue, type IssueType } from "@/hooks/useOrderIssues";
import { toast } from "@/hooks/use-toast";

const issueOptions: { value: IssueType; label: string; icon: React.ElementType; description: string }[] = [
  { value: "not_received", label: "Produit non reçu", icon: Package, description: "Je n'ai pas reçu ma commande" },
  { value: "return_request", label: "Demande de retour", icon: RotateCcw, description: "Je souhaite retourner le produit" },
  { value: "defective", label: "Produit défectueux", icon: Wrench, description: "Le produit est endommagé ou ne fonctionne pas" },
];

interface OrderIssueFormProps {
  orderId: string;
  customerEmail: string;
  onSuccess?: () => void;
}

export function OrderIssueForm({ orderId, customerEmail, onSuccess }: OrderIssueFormProps) {
  const [type, setType] = useState<IssueType | "">("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const createIssue = useCreateOrderIssue();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;

    createIssue.mutate(
      {
        order_id: orderId,
        type: type as IssueType,
        message: message || undefined,
        customer_email: customerEmail,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast({ title: "Signalement envoyé", description: "Le vendeur sera notifié sous 48h." });
          onSuccess?.();
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible d'envoyer le signalement.", variant: "destructive" });
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="font-semibold text-foreground">Signalement envoyé</h3>
        <p className="text-sm text-muted-foreground">
          Le vendeur dispose de 48h pour vous répondre. Vous recevrez une notification par email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200">
        <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
        <p className="text-xs text-orange-800">
          Le vendeur dispose de 48h pour traiter votre demande. Sans réponse, la plateforme prendra le relais.
        </p>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Quel est le problème ?</Label>
        <RadioGroup value={type} onValueChange={(v) => setType(v as IssueType)} className="space-y-2">
          {issueOptions.map((option) => {
            const Icon = option.icon;
            return (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  type === option.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
              >
                <RadioGroupItem value={option.value} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="issue-message" className="text-sm font-medium">
          Détails supplémentaires <span className="text-muted-foreground font-normal">(optionnel)</span>
        </Label>
        <Textarea
          id="issue-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre problème en détail..."
          className="mt-1.5 min-h-[80px]"
          maxLength={500}
        />
        <p className="text-[10px] text-muted-foreground mt-1">{message.length}/500</p>
      </div>

      <Button type="submit" className="w-full" disabled={!type || createIssue.isPending}>
        {createIssue.isPending ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Envoi en cours...</>
        ) : (
          "Envoyer le signalement"
        )}
      </Button>
    </form>
  );
}
