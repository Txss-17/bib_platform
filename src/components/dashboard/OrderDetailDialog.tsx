import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Truck, CheckCircle, Clock, AlertCircle, RotateCcw, ArrowRight, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrderWithProduct } from "@/hooks/useOrders";
import { useValidateOrder } from "@/hooks/useOrders";
import type { Database } from "@/integrations/supabase/types";
import { OrderIssuePanel } from "./OrderIssuePanel";
import { toast } from "sonner";

type LogisticsStatus = Database["public"]["Enums"]["logistics_status"];

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "En attente", icon: Clock, color: "text-yellow-500" },
  processing: { label: "En préparation", icon: Package, color: "text-blue-500" },
  shipped: { label: "Expédié", icon: Truck, color: "text-purple-500" },
  delivered: { label: "Livré", icon: CheckCircle, color: "text-green-500" },
  returned: { label: "Retourné", icon: AlertCircle, color: "text-destructive" },
};

interface StatusHistoryEntry {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_at: string;
}

function useOrderHistory(orderId: string | null) {
  return useQuery({
    queryKey: ["order-history", orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from("order_status_history" as any)
        .select("*")
        .eq("order_id", orderId)
        .order("changed_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as StatusHistoryEntry[];
    },
    enabled: !!orderId,
  });
}

interface OrderDetailDialogProps {
  order: OrderWithProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
  const { data: history, isLoading: historyLoading } = useOrderHistory(order?.id || null);
  const validateOrder = useValidateOrder();

  if (!order) return null;

  const StatusIcon = statusConfig[order.logistics_status]?.icon || Clock;
  const isNotValidated = !order.customer_validated && order.logistics_status === "pending";

  const handleValidate = async () => {
    try {
      await validateOrder.mutateAsync(order.id);
      toast.success("Commande validée ! Vous pouvez maintenant gérer son statut.");
    } catch {
      toast.error("Erreur lors de la validation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-primary" />
            Commande {order.order_number}
          </DialogTitle>
        </DialogHeader>

        {/* Order info */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Client</p>
              <p className="font-medium">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Email</p>
              <p className="font-medium truncate">{order.customer_email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Produit</p>
              <p className="font-medium">{order.products?.supplier_products?.name || "Inconnu"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Montant</p>
              <p className="font-bold text-primary">{Number(order.amount).toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Marché</p>
              <Badge variant="secondary">{order.market}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Date</p>
              <p className="font-medium">{new Date(order.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          </div>

          {/* Current status */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <StatusIcon className={`w-5 h-5 ${statusConfig[order.logistics_status]?.color}`} />
            <span className="text-sm font-medium">Statut actuel :</span>
            <Badge>{statusConfig[order.logistics_status]?.label || order.logistics_status}</Badge>
          </div>

          {/* Validate button */}
          {isNotValidated && (
            <Button 
              onClick={handleValidate} 
              disabled={validateOrder.isPending}
              className="w-full gap-2"
              size="lg"
            >
              {validateOrder.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Validation en cours...</>
              ) : (
                <><ShieldCheck className="w-5 h-5" /> Valider cette commande</>
              )}
            </Button>
          )}

          {order.customer_validated && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Commande validée par le vendeur</span>
            </div>
          )}

          {/* Status history timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Historique des statuts</h4>
            {historyLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : history && history.length > 0 ? (
              <div className="relative space-y-0">
                {/* Creation entry */}
                <TimelineEntry
                  label="Commande créée"
                  status="pending"
                  date={order.created_at}
                  isFirst
                  isLast={history.length === 0}
                />
                {history.map((entry, i) => {
                  const config = statusConfig[entry.new_status];
                  return (
                    <TimelineEntry
                      key={entry.id}
                      label={
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-muted-foreground">{statusConfig[entry.old_status || ""]?.label || "—"}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <span className="font-medium">{config?.label || entry.new_status}</span>
                        </span>
                      }
                      status={entry.new_status}
                      date={entry.changed_at}
                      isLast={i === history.length - 1}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Aucun changement de statut enregistré pour le moment.</p>
            )}
          </div>

          {/* Signalements */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Signalements
            </h4>
            <OrderIssuePanel orderId={order.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TimelineEntry({ label, status, date, isFirst, isLast }: {
  label: React.ReactNode;
  status: string;
  date: string;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const config = statusConfig[status];
  const Icon = config?.icon || Clock;
  const color = config?.color || "text-muted-foreground";

  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center bg-background ${color} border-current`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        {!isLast && <div className="w-0.5 h-6 bg-border" />}
      </div>
      <div className="pb-4 min-w-0">
        <div className="text-sm">{label}</div>
        <p className="text-[10px] text-muted-foreground">
          {new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          {" à "}
          {new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
