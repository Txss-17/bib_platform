import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

type LogisticsStatus = "pending" | "processing" | "shipped" | "delivered" | "returned";

const mockOrders = [
  { orderNumber: "LKS26-A3F2B1", product: "Lampe LED Design", status: "delivered" as LogisticsStatus, customer: "Marie Martin", market: "FR", date: "2026-01-28", amount: 49.99 },
  { orderNumber: "LKS26-B7C4D9", product: "Coussin Velours", status: "shipped" as LogisticsStatus, customer: "Pierre Dubois", market: "BE", date: "2026-01-27", amount: 29.99 },
  { orderNumber: "LKS26-E2F8G3", product: "Vase Céramique", status: "processing" as LogisticsStatus, customer: "Sophie Laurent", market: "FR", date: "2026-01-27", amount: 39.99 },
  { orderNumber: "LKS26-H5J1K6", product: "Cadre Photo Bois", status: "pending" as LogisticsStatus, customer: "Jean Petit", market: "DE", date: "2026-01-26", amount: 24.99 },
  { orderNumber: "LKS26-L9M3N7", product: "Tapis Berbère", status: "delivered" as LogisticsStatus, customer: "Emma Bernard", market: "FR", date: "2026-01-25", amount: 89.99 },
  { orderNumber: "LKS26-P4Q8R2", product: "Étagère Murale", status: "returned" as LogisticsStatus, customer: "Lucas Moreau", market: "NL", date: "2026-01-24", amount: 59.99 },
];

const statusConfig: Record<LogisticsStatus, { label: string; icon: React.ElementType; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "En attente", icon: Clock, variant: "outline" },
  processing: { label: "En préparation", icon: Package, variant: "secondary" },
  shipped: { label: "Expédié", icon: Truck, variant: "default" },
  delivered: { label: "Livré", icon: CheckCircle, variant: "default" },
  returned: { label: "Retourné", icon: AlertCircle, variant: "destructive" },
};

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

export default function Commandes() {
  return (
    <DashboardLayout title="Commandes" subtitle="Suivez vos commandes en temps réel">
      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20 mb-8">
        <CardContent className="p-4">
          <p className="text-sm text-foreground">
            <span className="font-medium">💡 La logistique est transparente</span> — vous vendez, LINKSY opère. 
            Toutes les expéditions et retours sont gérés automatiquement.
          </p>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Toutes les commandes</CardTitle>
        </CardHeader>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow key={order.orderNumber}>
                  <TableCell className="font-mono text-sm font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded bg-muted text-xs font-medium">{order.market}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right font-medium">{order.amount.toFixed(2)} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
