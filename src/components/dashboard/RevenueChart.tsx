import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const dailyData = [
  { name: "Mon", revenue: 1200, orders: 24 },
  { name: "Tue", revenue: 1800, orders: 32 },
  { name: "Wed", revenue: 1400, orders: 28 },
  { name: "Thu", revenue: 2200, orders: 42 },
  { name: "Fri", revenue: 2800, orders: 56 },
  { name: "Sat", revenue: 3200, orders: 64 },
  { name: "Sun", revenue: 2400, orders: 48 },
];

const monthlyData = [
  { name: "Jan", revenue: 18000, orders: 340 },
  { name: "Feb", revenue: 22000, orders: 420 },
  { name: "Mar", revenue: 19500, orders: 380 },
  { name: "Apr", revenue: 24000, orders: 460 },
  { name: "May", revenue: 28000, orders: 520 },
  { name: "Jun", revenue: 32000, orders: 620 },
];

const yearlyData = [
  { name: "2020", revenue: 180000, orders: 3400 },
  { name: "2021", revenue: 240000, orders: 4600 },
  { name: "2022", revenue: 320000, orders: 6200 },
  { name: "2023", revenue: 420000, orders: 8100 },
  { name: "2024", revenue: 380000, orders: 7400 },
  { name: "2025", revenue: 290000, orders: 5600 },
];

export function RevenueChart() {
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("monthly");

  const getData = () => {
    switch (period) {
      case "daily":
        return dailyData;
      case "monthly":
        return monthlyData;
      case "yearly":
        return yearlyData;
    }
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="daily" className="text-xs">Daily</TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getData()}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `€${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`€${value.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
