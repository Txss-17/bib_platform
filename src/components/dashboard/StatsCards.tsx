import { TrendingUp, TrendingDown, Package, ShoppingCart, Users, Euro } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down";
}

const StatCard = ({ title, value, change, icon, trend }: StatCardProps) => (
  <Card className="bg-card border-border/50 hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-xl bg-primary/10">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          trend === "up" ? "text-success" : "text-destructive"
        }`}>
          {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      </div>
    </CardContent>
  </Card>
);

export function StatsCards() {
  const stats = [
    {
      title: "Revenue (MTD)",
      value: "€24,580",
      change: 12.5,
      icon: <Euro className="w-5 h-5 text-primary" />,
      trend: "up" as const,
    },
    {
      title: "Orders",
      value: "342",
      change: 8.2,
      icon: <ShoppingCart className="w-5 h-5 text-primary" />,
      trend: "up" as const,
    },
    {
      title: "Products Active",
      value: "48",
      change: -2.1,
      icon: <Package className="w-5 h-5 text-primary" />,
      trend: "down" as const,
    },
    {
      title: "Customers",
      value: "1,247",
      change: 15.3,
      icon: <Users className="w-5 h-5 text-primary" />,
      trend: "up" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
