import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, ShoppingCart, Receipt, Target, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const monthlyData = [
  { month: "Jan", revenue: 4200 },
  { month: "Fév", revenue: 5100 },
  { month: "Mar", revenue: 4800 },
  { month: "Avr", revenue: 6200 },
  { month: "Mai", revenue: 7500 },
  { month: "Juin", revenue: 8100 },
];

const topProducts = [
  { name: "Lampe LED Design", sales: 45, revenue: 2250 },
  { name: "Coussin Velours", sales: 38, revenue: 1140 },
  { name: "Vase Céramique", sales: 32, revenue: 1280 },
  { name: "Cadre Photo Bois", sales: 28, revenue: 840 },
];

const lowRotationProducts = [
  { name: "Tapis Berbère XL", daysSinceLastSale: 45, stock: 12 },
  { name: "Étagère Murale", daysSinceLastSale: 38, stock: 8 },
  { name: "Miroir Vintage", daysSinceLastSale: 32, stock: 5 },
];

function StatCard({ title, value, trend, icon: Icon }: { title: string; value: string; trend?: number; icon: React.ElementType }) {
  const isPositive = trend && trend > 0;
  
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? "+" : ""}{trend}%</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Ventes() {
  return (
    <DashboardLayout title="Ventes" subtitle="Analysez vos performances commerciales">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Chiffre d'affaires" value="8 100 €" trend={12.5} icon={Euro} />
        <StatCard title="Nombre de ventes" value="143" trend={8.2} icon={ShoppingCart} />
        <StatCard title="Panier moyen" value="56,64 €" trend={-2.1} icon={Receipt} />
        <StatCard title="Taux de conversion" value="3,2%" trend={0.5} icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Evolution Chart */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products Chart */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Produits les plus performants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Rotation Products Warning */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Produits à faible rotation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowRotationProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Dernière vente il y a {product.daysSinceLastSale} jours • Stock: {product.stock}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500">
                  Attention
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
