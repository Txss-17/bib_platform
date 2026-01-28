import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StockItem {
  id: string;
  name: string;
  current: number;
  minimum: number;
  status: "critical" | "low" | "warning";
  supplier: string;
}

const stockAlerts: StockItem[] = [
  { id: "1", name: "Smart Watch Pro", current: 3, minimum: 20, status: "critical", supplier: "TechSupply Co." },
  { id: "2", name: "Wireless Earbuds", current: 8, minimum: 25, status: "critical", supplier: "AudioMax Ltd." },
  { id: "3", name: "Phone Case Bundle", current: 15, minimum: 30, status: "low", supplier: "CaseCraft Inc." },
  { id: "4", name: "LED Desk Lamp", current: 22, minimum: 35, status: "warning", supplier: "LightWorks Co." },
];

const statusConfig = {
  critical: { color: "bg-destructive/10 text-destructive border-destructive/20", progressColor: "bg-destructive" },
  low: { color: "bg-warning/10 text-warning border-warning/20", progressColor: "bg-warning" },
  warning: { color: "bg-accent/10 text-accent border-accent/20", progressColor: "bg-accent" },
};

export function StockAlerts() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <CardTitle className="text-lg font-semibold">Stock Alerts</CardTitle>
        </div>
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          {stockAlerts.filter(s => s.status === "critical").length} Critical
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stockAlerts.map((item) => {
            const config = statusConfig[item.status];
            const percentage = (item.current / item.minimum) * 100;
            return (
              <div key={item.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.supplier}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{item.current} units</p>
                    <p className="text-xs text-muted-foreground">Min: {item.minimum}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Stock Level</span>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
                {item.status === "critical" && (
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <TrendingDown className="w-3 h-3" />
                    <span>Reorder immediately to avoid stockout</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
