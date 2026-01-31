import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Truck, CheckCircle, Clock, AlertCircle, ShoppingBag } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type LogisticsStatus = Database["public"]["Enums"]["logistics_status"];

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

function OrdersTableSkeleton() {
  return (
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
        {[1, 2, 3, 4, 5].map(i => (
          <TableRow key={i}>
            <TableCell><Skeleton className="w-24 h-4" /></TableCell>
            <TableCell><Skeleton className="w-32 h-4" /></TableCell>
            <TableCell><Skeleton className="w-20 h-5" /></TableCell>
            <TableCell><Skeleton className="w-28 h-4" /></TableCell>
            <TableCell><Skeleton className="w-8 h-5" /></TableCell>
            <TableCell><Skeleton className="w-20 h-4" /></TableCell>
            <TableCell className="text-right"><Skeleton className="w-16 h-4 ml-auto" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function EmptyState() {
  return (
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
  );
}

export default function Commandes() {
  const { data: orders, isLoading, error } = useOrders();

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
      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20 mb-8">
        <CardContent className="p-4">
          <p className="text-sm text-foreground">
            <span className="font-medium">💡 La logistique est transparente</span> — vous vendez, LINKSY opère. 
            Toutes les expéditions et retours sont gérés automatiquement.
          </p>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Toutes les commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersTableSkeleton />
          </CardContent>
        </Card>
      ) : orders && orders.length === 0 ? (
        <EmptyState />
      ) : (
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
                {orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.products?.supplier_products?.name || "Produit inconnu"}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.logistics_status} />
                    </TableCell>
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
