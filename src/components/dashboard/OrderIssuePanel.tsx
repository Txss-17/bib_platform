import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle, XCircle, ArrowUpCircle, MessageSquare } from "lucide-react";
import {
  useOrderIssues,
  useIssueResponses,
  useRespondToIssue,
  ISSUE_TYPE_LABELS,
  ISSUE_STATUS_LABELS,
  ISSUE_ACTION_LABELS,
  type OrderIssue,
  type IssueAction,
  type IssueStatus,
} from "@/hooks/useOrderIssues";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface OrderIssuePanelProps {
  orderId: string;
}

export function OrderIssuePanel({ orderId }: OrderIssuePanelProps) {
  const { data: issues = [], isLoading } = useOrderIssues(orderId);

  if (isLoading) return <p className="text-xs text-muted-foreground">Chargement des signalements...</p>;
  if (issues.length === 0) return <p className="text-xs text-muted-foreground italic">Aucun signalement pour cette commande.</p>;

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}

function IssueCard({ issue }: { issue: OrderIssue }) {
  const [showResponse, setShowResponse] = useState(false);
  const [action, setAction] = useState<IssueAction>("accept");
  const [message, setMessage] = useState("");
  const { data: responses = [] } = useIssueResponses(issue.id);
  const respondMutation = useRespondToIssue();

  const StatusIcon = statusIcons[issue.status] || Clock;
  const deadline = new Date(issue.deadline_at);
  const isOverdue = issue.status === "pending" && deadline < new Date();
  const hoursLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 3600000));

  const handleRespond = () => {
    const newStatus: IssueStatus =
      action === "accept" ? "accepted" :
      action === "refuse" ? "refused" : "resolved";

    respondMutation.mutate(
      { issueId: issue.id, action, message, newStatus },
      {
        onSuccess: () => {
          toast({ title: "Réponse envoyée", description: "Le client sera notifié." });
          setShowResponse(false);
          setMessage("");
        },
        onError: () => toast({ title: "Erreur", variant: "destructive" }),
      }
    );
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <div>
              <p className="text-sm font-medium">{ISSUE_TYPE_LABELS[issue.type]}</p>
              <p className="text-xs text-muted-foreground">{issue.customer_email}</p>
            </div>
          </div>
          <Badge className={statusColors[issue.status]}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {ISSUE_STATUS_LABELS[issue.status]}
          </Badge>
        </div>

        {issue.message && (
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{issue.message}</p>
        )}

        {issue.image_url && (
          <img src={issue.image_url} alt="Preuve" className="w-20 h-20 rounded object-cover" />
        )}

        {issue.status === "pending" && (
          <div className="flex items-center justify-between text-xs">
            <span className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}>
              {isOverdue ? "⚠️ Délai dépassé — escalade automatique" : `⏳ ${hoursLeft}h restantes pour répondre`}
            </span>
          </div>
        )}

        {/* Responses */}
        {responses.length > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-border/30">
            {responses.map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-xs">
                <MessageSquare className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                <div>
                  <span className="font-medium">{ISSUE_ACTION_LABELS[r.action]}</span>
                  {r.message && <span className="text-muted-foreground"> — {r.message}</span>}
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Response form */}
        {issue.status === "pending" && !showResponse && (
          <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setShowResponse(true)}>
            Répondre au signalement
          </Button>
        )}

        {showResponse && (
          <div className="space-y-2 pt-2 border-t border-border/30">
            <Select value={action} onValueChange={(v) => setAction(v as IssueAction)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ISSUE_ACTION_LABELS) as IssueAction[]).map((a) => (
                  <SelectItem key={a} value={a}>{ISSUE_ACTION_LABELS[a]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Message au client (optionnel)..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-xs min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 text-xs" onClick={handleRespond} disabled={respondMutation.isPending}>
                Envoyer
              </Button>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowResponse(false)}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
