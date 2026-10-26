import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpCircle,
  MessageSquare,
} from "lucide-react";
import {
  useOrderIssues,
  useIssueResponses,
  useRespondToIssue,
  useRefundOrderIssue,
  ISSUE_TYPE_LABELS,
  ISSUE_STATUS_LABELS,
  ISSUE_ACTION_LABELS,
  type OrderIssue,
  type IssueAction,
  type IssueStatus,
} from "@/hooks/useOrderIssues.ts";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  accepted: CheckCircle,
  refused: XCircle,
  resolved: CheckCircle,
  escalated: ArrowUpCircle,
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/15 text-warning",
  accepted: "bg-success/15 text-success",
  refused: "bg-destructive/15 text-destructive",
  resolved: "bg-info/15 text-info",
  escalated: "bg-warning/15 text-warning",
};

interface OrderIssueSectionProps {
  orderId: string;
}

export function OrderIssueSection({ orderId }: OrderIssueSectionProps) {
  useLanguage();
  const { data: issues = [], isLoading } = useOrderIssues(orderId);

  if (isLoading) {
    return (
      <p className="text-xs text-muted-foreground">
        {translateUi("Chargement des signalements...")}
      </p>
    );
  }

  if (issues.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        {translateUi("Aucun signalement pour cette commande.")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}

function IssueCard({ issue }: { issue: OrderIssue }) {
  useLanguage();
  const [showResponse, setShowResponse] = useState(false);
  const [action, setAction] = useState<IssueAction>("accept");
  const [message, setMessage] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const { data: responses = [] } = useIssueResponses(issue.id);
  const respondMutation = useRespondToIssue();
  const refundMutation = useRefundOrderIssue();

  const StatusIcon = statusIcons[issue.status] || Clock;

  const handleRespond = () => {
    if (action === "partial_refund") {
      const amountCents = Math.round(Number(refundAmount) * 100);
      if (!Number.isSafeInteger(amountCents) || amountCents < 1) {
        toast({
          title: translateUi("Montant invalide"),
          description: translateUi("Saisissez un montant positif en euros."),
          variant: "destructive",
        });
        return;
      }
      refundMutation.mutate(
        { issueId: issue.id, amountCents },
        {
          onSuccess: (result) => {
            toast({
              title:
                result.status === "succeeded"
                  ? "Remboursement effectuÃ©"
                  : "Remboursement en attente",
              description:
                result.status === "succeeded"
                  ? "Stripe a confirmÃ© le remboursement. Le stock attend une rÃ©ception contrÃ´lÃ©e."
                  : "Le rÃ©sultat Stripe est en attente de confirmation.",
            });
            setShowResponse(false);
            setRefundAmount("");
            setMessage("");
          },
          onError: (error) =>
            toast({
              title: translateUi("Remboursement impossible"),
              description: error.message,
              variant: "destructive",
            }),
        },
      );
      return;
    }
    const newStatus: IssueStatus =
      action === "accept"
        ? "accepted"
        : action === "refuse"
          ? "refused"
          : "resolved";

    respondMutation.mutate(
      {
        issueId: issue.id,
        action,
        message,
        newStatus,
      },
      {
        onSuccess: () => {
          toast({
            title: translateUi("RÃ©ponse envoyÃ©e"),
            description: translateUi(
              "RÃ©ponse enregistrÃ©e dans le dossier de commande.",
            ),
          });

          setShowResponse(false);
          setMessage("");
        },

        onError: () =>
          toast({
            title: translateUi("Erreur"),
            variant: "destructive",
          }),
      },
    );
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />

            <div>
              <p className="text-sm font-medium">
                {ISSUE_TYPE_LABELS[issue.type]}
              </p>

              <p className="text-xs text-muted-foreground">
                {issue.customer_email}
              </p>
            </div>
          </div>

          <Badge className={statusColors[issue.status]}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {ISSUE_STATUS_LABELS[issue.status]}
          </Badge>
        </div>

        {issue.message && (
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            {issue.message}
          </p>
        )}

        {issue.image_url && (
          <img
            src={issue.image_url}
            alt={translateUi("Preuve")}
            className="w-20 h-20 rounded object-cover"
          />
        )}

        {responses.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border/30">
            {responses.map((response) => (
              <div key={response.id} className="flex items-start gap-2 text-xs">
                <MessageSquare className="w-3 h-3 mt-0.5 text-primary shrink-0" />

                <div>
                  <span className="font-medium">
                    {ISSUE_ACTION_LABELS[response.action]}
                  </span>

                  {response.message && (
                    <span className="text-muted-foreground">
                      {" "}
                      {translateUi("â€”") + " "}
                      {response.message}
                    </span>
                  )}

                  <p className="text-[10px] text-muted-foreground">
                    {new Date(response.created_at).toLocaleDateString(
                      getUiLocale(),
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {(issue.status === "pending" || issue.status === "accepted") &&
          !showResponse && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => setShowResponse(true)}
            >
              {translateUi("RÃ©pondre au signalement")}
            </Button>
          )}

        {showResponse && (
          <div className="space-y-2 pt-2 border-t border-border/30">
            <Select
              value={action}
              onValueChange={(value) => setAction(value as IssueAction)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {(Object.keys(ISSUE_ACTION_LABELS) as IssueAction[])
                  .filter((actionKey) => actionKey !== "resend")
                  .map((actionKey) => (
                    <SelectItem key={actionKey} value={actionKey}>
                      {ISSUE_ACTION_LABELS[actionKey]}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {action === "partial_refund" && (
              <div className="space-y-1">
                <label
                  className="text-xs font-medium"
                  htmlFor={`refund-amount-${issue.id}`}
                >
                  {translateUi("Montant du remboursement (EUR)")}
                </label>
                <Input
                  id={`refund-amount-${issue.id}`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={refundAmount}
                  onChange={(event) => setRefundAmount(event.target.value)}
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  {translateUi(
                    "Le montant est plafonnÃ© au solde de la ligne. Le stock ne sera rÃ©intÃ©grÃ© quâ€™aprÃ¨s rÃ©ception contrÃ´lÃ©e.",
                  )}
                </p>
              </div>
            )}
            <Textarea
              placeholder={translateUi("Message au client (optionnel)...")}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="text-xs min-h-[60px]"
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 text-xs"
                onClick={handleRespond}
                disabled={
                  respondMutation.isPending ||
                  refundMutation.isPending ||
                  (action === "partial_refund" && !refundAmount)
                }
              >
                {translateUi("Envoyer")}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setShowResponse(false)}
              >
                {translateUi("Annuler")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
