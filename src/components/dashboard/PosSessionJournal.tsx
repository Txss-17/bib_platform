import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Loader2, QrCode, CheckCircle2, Clock, XCircle, PackageCheck } from "lucide-react";

interface PosOrder {
  id: string;
  order_number: string;
  amount: number;
  payment_status: string | null;
  logistics_status: string;
  stripe_session_id: string | null;
  created_at: string;
}

interface Props {
  boutiqueId: string;
  startsAt: string;
  endsAt: string;
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "paid") {
    return <Badge variant="outline" className="bg-success/10 text-success border-success/30"><CheckCircle2 className="h-3 w-3 mr-1" />Payé</Badge>;
  }
  if (status === "failed" || status === "canceled") {
    return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" />Échec</Badge>;
  }
  return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30"><Clock className="h-3 w-3 mr-1" />En attente</Badge>;
}

export function PosSessionJournal({ boutiqueId, startsAt, endsAt }: Props) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, amount, payment_status, logistics_status, stripe_session_id, created_at")
      .eq("boutique_id", boutiqueId)
      .like("customer_email", "pos+%")
      .gte("created_at", startsAt)
      .lte("created_at", endsAt)
      .order("created_at", { ascending: false })
      .limit(200);
    setOrders((data || []) as PosOrder[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    fetchOrders();
    const channel = supabase
      .channel(`pos-journal-${boutiqueId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `boutique_id=eq.${boutiqueId}` }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, boutiqueId, startsAt, endsAt]);

  const paidCount = orders.filter((o) => o.payment_status === "paid").length;
  const totalCA = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.amount), 0);

  return (
    <div className="mt-4 border-t border-border pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground transition"
      >
        <span className="flex items-center gap-1.5">
          <QrCode className="h-3.5 w-3.5" />
          Journal de session POS
          {open && orders.length > 0 && (
            <span className="ml-2 text-foreground">· {paidCount} payée(s) · {totalCA.toFixed(2)}€</span>
          )}
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {open && (
        <div className="mt-3">
          {loading ? (
            <div className="py-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : orders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Aucune transaction POS sur cette session.</p>
          ) : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/40 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono font-medium text-foreground truncate">{o.order_number}</div>
                    <div className="text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
                      {o.stripe_session_id && <span className="ml-2">· QR émis</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-bib-marine">{Number(o.amount).toFixed(2)}€</div>
                  </div>
                  <StatusBadge status={o.payment_status} />
                  {o.payment_status === "paid" && (
                    <Badge variant="outline" className="bg-info/10 text-info border-info/30 hidden sm:inline-flex">
                      <PackageCheck className="h-3 w-3 mr-1" />Stock −
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={fetchOrders}>Rafraîchir</Button>
          </div>
        </div>
      )}
    </div>
  );
}