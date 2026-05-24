import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "issue";
  date: string;
}

const orders: Order[] = [
  { id: "ORD-001", customer: "Marie L.", product: "Smart Watch Pro", amount: "€129", status: "delivered", date: "2h ago" },
  { id: "ORD-002", customer: "Jean P.", product: "Wireless Earbuds", amount: "€79", status: "shipped", date: "4h ago" },
  { id: "ORD-003", customer: "Sophie M.", product: "Fitness Tracker", amount: "€59", status: "processing", date: "6h ago" },
  { id: "ORD-004", customer: "Lucas B.", product: "Phone Case Bundle", amount: "€35", status: "pending", date: "8h ago" },
  { id: "ORD-005", customer: "Emma R.", product: "LED Desk Lamp", amount: "€45", status: "issue", date: "1d ago" },
];

const statusConfig = {
  pending: { icon: Clock, color: "bg-warning/10 text-warning border-warning/20", label: "Pending" },
  processing: { icon: Package, color: "bg-primary/10 text-primary border-primary/20", label: "Processing" },
  shipped: { icon: Truck, color: "bg-accent/10 text-accent border-accent/20", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "bg-success/10 text-success border-success/20", label: "Delivered" },
  issue: { icon: AlertCircle, color: "bg-destructive/10 text-destructive border-destructive/20", label: "Issue" },
};

export function OrdersTracking() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
        <Link to="/dashboard/commandes" className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => {
            const config = statusConfig[order.status];
            const Icon = config.icon;
            return (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{order.product}</p>
                    <p className="text-sm text-muted-foreground">{order.customer} • {order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground">{order.amount}</span>
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{order.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
