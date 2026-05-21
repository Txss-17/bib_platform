import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown, ChevronUp, Loader2, QrCode, CheckCircle2, Clock, XCircle,
  PackageCheck, Download, ExternalLink, Search, Copy, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface PosOrder {
  id: string;
  order_number: string;
  amount: number;
  payment_status: string | null;
  logistics_status: string;
  stripe_session_id: string | null;
  pos_qr_url: string | null;
  payment_completed_at: string | null;
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

const PAGE_SIZE = 10;

function csvEscape(v: unknown) {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function PosSessionJournal({ boutiqueId, startsAt, endsAt }: Props) {
  const [open, setOpen] = useState(false);
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, amount, payment_status, logistics_status, stripe_session_id, pos_qr_url, payment_completed_at, created_at")
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

  const q = search.trim().toLowerCase();
  const filtered = q
    ? orders.filter((o) => o.order_number?.toLowerCase().includes(q))
    : orders;

  const paidCount = orders.filter((o) => o.payment_status === "paid").length;
  const totalCA = orders.filter((o) => o.payment_status === "paid").reduce((s, o) => s + Number(o.amount), 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportCsv = () => {
    const headers = [
      "order_number", "created_at", "payment_status", "payment_completed_at",
      "amount_eur", "stripe_session_id", "qr_url", "logistics_status",
    ];
    const rows = filtered.map((o) => [
      o.order_number, o.created_at, o.payment_status ?? "",
      o.payment_completed_at ?? "", Number(o.amount).toFixed(2),
      o.stripe_session_id ?? "", o.pos_qr_url ?? "", o.logistics_status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-pos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copy = (txt: string, label = "Copié") => {
    navigator.clipboard.writeText(txt);
    toast.success(label);
  };

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
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher n° de commande…"
                className="h-8 pl-7 text-xs"
              />
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="h-3.5 w-3.5 mr-1" />Exporter CSV
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={fetchOrders}>Rafraîchir</Button>
          </div>

          {loading ? (
            <div className="py-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Aucune transaction POS sur cette session.</p>
          ) : (
            <>
              <div className="space-y-1.5">
                {pageRows.map((o) => {
                  const dt = (s: string | null) =>
                    s ? new Date(s).toLocaleString("fr-FR", {
                      hour: "2-digit", minute: "2-digit", second: "2-digit",
                      day: "2-digit", month: "2-digit",
                    }) : "—";
                  return (
                    <div key={o.id} className="p-2.5 rounded-md bg-muted/40 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono font-semibold text-foreground truncate">{o.order_number}</div>
                          <div className="text-muted-foreground">QR émis : {dt(o.created_at)}</div>
                        </div>
                        <div className="font-bold text-bib-marine">{Number(o.amount).toFixed(2)}€</div>
                        <StatusBadge status={o.payment_status} />
                        {o.payment_status === "paid" && (
                          <Badge variant="outline" className="bg-info/10 text-info border-info/30 hidden sm:inline-flex">
                            <PackageCheck className="h-3 w-3 mr-1" />Stock −
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        {o.payment_status === "paid" && (
                          <span className="text-success">Payé : {dt(o.payment_completed_at)}</span>
                        )}
                        {(o.payment_status === "failed" || o.payment_status === "canceled") && (
                          <span className="text-destructive">Échec : {dt(o.payment_completed_at)}</span>
                        )}
                        {o.stripe_session_id && (
                          <button
                            onClick={() => copy(o.stripe_session_id!, "Session ID copié")}
                            className="inline-flex items-center gap-1 hover:text-foreground font-mono"
                            title={o.stripe_session_id}
                          >
                            <Copy className="h-3 w-3" />
                            {o.stripe_session_id.slice(0, 14)}…
                          </button>
                        )}
                        {o.pos_qr_url && (
                          <a
                            href={o.pos_qr_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />Ouvrir QR
                          </a>
                        )}
                        {o.pos_qr_url && (
                          <button
                            onClick={() => copy(o.pos_qr_url!, "Lien QR copié")}
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            <Copy className="h-3 w-3" />Copier lien
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{filtered.length} résultat(s) · page {currentPage} / {totalPages}</span>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}