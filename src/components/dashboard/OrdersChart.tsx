import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { useOrders } from "@/hooks/useOrders";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(var(--chart-1, 40 90% 50%))",
  processing: "hsl(var(--chart-2, 210 80% 55%))",
  shipped: "hsl(var(--chart-3, 260 70% 60%))",
  delivered: "hsl(var(--chart-4, 140 70% 45%))",
  returned: "hsl(var(--chart-5, 0 70% 55%))",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  processing: "En préparation",
  shipped: "Expédié",
  delivered: "Livré",
  returned: "Retourné",
};

export function OrdersChart() {
  const { data: orders, isLoading } = useOrders();

  const pieData = useMemo(() => {
    if (!orders?.length) return [];
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      counts[o.logistics_status] = (counts[o.logistics_status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: STATUS_LABELS[status] || status,
      value,
      status,
    }));
  }, [orders]);

  const weeklyData = useMemo(() => {
    if (!orders?.length) return [];
    const now = new Date();
    const days: { label: string; date: string; pending: number; processing: number; shipped: number; delivered: number; returned: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        label: d.toLocaleDateString("fr-FR", { weekday: "short" }),
        date: dateStr,
        pending: 0, processing: 0, shipped: 0, delivered: 0, returned: 0,
      });
    }
    orders.forEach(o => {
      const oDate = o.created_at.slice(0, 10);
      const day = days.find(d => d.date === oDate);
      if (day && o.logistics_status in day) {
        (day as any)[o.logistics_status]++;
      }
    });
    return days;
  }, [orders]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full rounded-xl" />;
  }

  if (!orders?.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Pie Chart - Status Distribution */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Répartition par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || "#888"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart - Weekly Orders */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Commandes (7 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="pending" name="En attente" fill={STATUS_COLORS.pending} stackId="a" />
                <Bar dataKey="processing" name="En préparation" fill={STATUS_COLORS.processing} stackId="a" />
                <Bar dataKey="shipped" name="Expédié" fill={STATUS_COLORS.shipped} stackId="a" />
                <Bar dataKey="delivered" name="Livré" fill={STATUS_COLORS.delivered} stackId="a" />
                <Bar dataKey="returned" name="Retourné" fill={STATUS_COLORS.returned} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
