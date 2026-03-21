import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSupplierProducts } from "@/hooks/useSupplierProducts";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface StockItem {
  id: string;
  name: string;
  stock: number;
  moq: number;
  category: string;
  status: "critical" | "low" | "ok";
}

function getStockStatus(stock: number, moq: number): "critical" | "low" | "ok" {
  const ratio = stock / Math.max(moq, 1);
  if (ratio <= 0.1) return "critical";
  if (ratio <= 0.3) return "low";
  return "ok";
}

const statusConfig = {
  critical: {
    label: "Critique",
    color: "bg-destructive/10 text-destructive border-destructive/20",
    progressColor: "bg-destructive",
  },
  low: {
    label: "Faible",
    color: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
    progressColor: "bg-yellow-500",
  },
  ok: {
    label: "OK",
    color: "bg-green-500/10 text-green-700 border-green-200",
    progressColor: "bg-green-500",
  },
};

export function StockAlerts() {
  const { data: supplierProducts, isLoading: spLoading } = useSupplierProducts();
  const { data: userProducts, isLoading: upLoading } = useProducts();

  const isLoading = spLoading || upLoading;

  // Build stock items from user's products linked to supplier products
  const stockItems: StockItem[] = (userProducts || [])
    .map((product) => {
      const sp = product.supplier_products;
      if (!sp) return null;
      const stock = (sp as any).stock ?? 0;
      return {
        id: product.id,
        name: sp.name,
        stock,
        moq: sp.moq,
        category: sp.category,
        status: getStockStatus(stock, sp.moq),
      };
    })
    .filter(Boolean) as StockItem[];

  // Sort: critical first, then low, then ok
  const sortedItems = stockItems.sort((a, b) => {
    const order = { critical: 0, low: 1, ok: 2 };
    return order[a.status] - order[b.status];
  });

  const alertItems = sortedItems.filter((i) => i.status !== "ok");
  const displayItems = alertItems.length > 0 ? alertItems : sortedItems.slice(0, 4);

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <CardTitle className="text-lg font-semibold">Alertes Stock</CardTitle>
        </div>
        <Badge
          variant="outline"
          className={
            alertItems.filter((s) => s.status === "critical").length > 0
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-green-500/10 text-green-700 border-green-200"
          }
        >
          {alertItems.filter((s) => s.status === "critical").length} critique(s)
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <div className="text-center py-6">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucun produit à surveiller
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayItems.map((item) => {
              const config = statusConfig[item.status];
              const percentage = Math.min(
                (item.stock / Math.max(item.moq, 1)) * 100,
                100
              );
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-lg bg-muted/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {item.stock} unités
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        MOQ: {item.moq}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Niveau de stock</span>
                      <span>{percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                  {item.status === "critical" && (
                    <div className="flex items-center gap-1 text-[10px] text-destructive">
                      <TrendingDown className="w-3 h-3" />
                      <span>
                        Réapprovisionnement urgent pour éviter la rupture
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
