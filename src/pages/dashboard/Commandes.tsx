import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Package, Truck, CheckCircle, Clock, AlertCircle, ShoppingBag, MoreHorizontal, Download } from "lucide-react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useBoutiques } from "@/hooks/useBoutiques";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type LogisticsStatus = Database["public"]["Enums"]["logistics_status"];

const statusConfig: Record<LogisticsStatus, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", icon: Clock, variant: "outline" },
  processing: { label: "En préparation", icon: Package, variant: "secondary" },
  shipped: { label: "Expédié", icon: Truck, variant: "default" },
  delivered: { label: "Livré", icon: CheckCircle, variant: "default" },
  returned: { label: "Retourné", icon: AlertCircle, variant: "destructive" },
};

const statusFlow: LogisticsStatus[] = ["pending", "processing", "shipped", "delivered"];

function StatusBadge({ status }: { status: LogisticsStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

function exportCSV(orders: any[]) {
  const headers = ["N° Commande", "Client", "Email", "Produit", "Montant", "Statut", "Marché", "Date"];
  const rows = orders.map(o => [
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.products?.supplier_products?.name || "",
    Number(o.amount).toFixed(2),
    statusConfig[o.logistics_status as LogisticsStatus]?.label || o.logistics_status,
    o.market,
    new Date(o.created_at).toLocaleDateString("fr-FR"),
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Commandes() {
  const { data: orders, isLoading, error } = useOrders();
  const { data: boutiques = [] } = useBoutiques();
  const updateStatus = useUpdateOrderStatus();
  const [selectedBoutique, setSelectedBoutique] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredOrders = orders?.filter(order => {
    if (selectedBoutique !== "all" && order.boutique_id !== selectedBoutique) return false;
    if (selectedStatus !== "all" && order.logistics_status !== selectedStatus) return false;
    return true;
  });

  const handleStatusChange = (orderId: string, newStatus: LogisticsStatus) => {
    updateStatus.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => toast({ title: "Statut mis à jour", description: `Commande passée en "${statusConfig[newStatus].label}"` }),
        onError: () => toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" }),
      }
    );
  };

  if (error) {
    return (
      <DashboardLayout title="Commandes" subtitle="Suivez vos commandes en temps réel">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Une erreur est survenue lors du chargement des commandes.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Commandes" subtitle="Suivez vos commandes en temps réel">
      <Card className="bg-primary/5 border-primary/20 mb-6">
        <CardContent className="p-4">
          <p className="text-sm text-foreground">
            <span className="font-medium">💡 La logistique est transparente</span> — vous vendez, LINKSY opère. 
            Toutes les expéditions et retours sont gérés automatiquement.
          </p>
        </CardContent>
      </Card>

      {/* Filters + Export */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Select value={selectedBoutique} onValueChange={setSelectedBoutique}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Toutes les boutiques" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les boutiques</SelectItem>
            {boutiques.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(selectedBoutique !== "all" || selectedStatus !== "all") && (
          <span className="text-xs text-muted-foreground">
            {filteredOrders?.length || 0} résultat(s)
          </span>
        )}

        <div className="ml-auto">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => filteredOrders && exportCSV(filteredOrders)} disabled={!filteredOrders?.length}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-lg">Toutes les commandes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead><TableHead>Produit</TableHead><TableHead>Statut</TableHead>
                  <TableHead>Client</TableHead><TableHead>Marché</TableHead><TableHead>Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead><TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1,2,3,4,5].map(i => (
                  <TableRow key={i}>
                    {[1,2,3,4,5,6,7,8].map(j => <TableCell key={j}><Skeleton className="w-20 h-4" /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : filteredOrders && filteredOrders.length === 0 ? (
        <Card className="bg-card border-border/50 border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucune commande</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Vos commandes apparaîtront ici dès que vos clients passeront leurs premières commandes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-lg">Toutes les commandes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Marché</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.products?.supplier_products?.name || "Produit inconnu"}</TableCell>
                    <TableCell><StatusBadge status={order.logistics_status} /></TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-muted text-xs font-medium">{order.market}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {Number(order.amount).toFixed(2)} €
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {statusFlow.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              disabled={order.logistics_status === s}
                              onClick={() => handleStatusChange(order.id, s)}
                            >
                              {statusConfig[s].label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuItem
                            className="text-destructive"
                            disabled={order.logistics_status === "returned"}
                            onClick={() => handleStatusChange(order.id, "returned")}
                          >
                            Marquer retourné
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
