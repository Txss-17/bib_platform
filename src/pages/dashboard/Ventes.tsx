import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Euro, ShoppingCart, Receipt, Target, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { SalesMap } from "@/components/dashboard/SalesMap";
import { useSalesGeography } from "@/hooks/useSalesGeography";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useOrders } from "@/hooks/useOrders";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, trend, icon: Icon, loading }: { title: string; value: string; trend?: number; icon: React.ElementType; loading?: boolean }) {
  const isPositive = trend && trend > 0;
  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? <Skeleton className="h-8 w-24 mt-1" /> : (
              <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            )}
            {trend !== undefined && !loading && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isPositive ? "+" : ""}{trend.toFixed(1)}%</span>
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
  const { data: salesGeo } = useSalesGeography();
  const { data: boutiques = [] } = useBoutiques();
  const { data: orders, isLoading } = useOrders();
  const { data: products } = useProducts();
  const [selectedBoutique, setSelectedBoutique] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (selectedBoutique === "all") return orders;
    return orders.filter(o => o.boutique_id === selectedBoutique);
  }, [orders, selectedBoutique]);

  // Real KPIs
  const totalRevenue = useMemo(() => filteredOrders.reduce((s, o) => s + Number(o.amount), 0), [filteredOrders]);
  const totalSales = filteredOrders.length;
  const avgBasket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Monthly chart from real orders
  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    filteredOrders.forEach(o => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = monthNames[d.getMonth()];
      months[key] = (months[key] || 0) + Number(o.amount);
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, revenue]) => {
        const [, monthIdx] = key.split("-");
        return { month: monthNames[parseInt(monthIdx)], revenue: Math.round(revenue) };
      });
  }, [filteredOrders]);

  // Top products from real data
  const topProducts = useMemo(() => {
    if (!products || !filteredOrders.length) return [];
    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
      const pName = o.products?.supplier_products?.name || "Inconnu";
      if (!productSales[o.product_id]) {
        productSales[o.product_id] = { name: pName, sales: 0, revenue: 0 };
      }
      productSales[o.product_id].sales++;
      productSales[o.product_id].revenue += Number(o.amount);
    });
    return Object.values(productSales).sort((a, b) => b.sales - a.sales).slice(0, 5);
  }, [filteredOrders, products]);

  // Low rotation products
  const lowRotationProducts = useMemo(() => {
    if (!products || !orders) return [];
    const now = Date.now();
    return products
      .filter(p => p.status === "active")
      .map(p => {
        const productOrders = orders.filter(o => o.product_id === p.id);
        const lastSale = productOrders.length > 0
          ? Math.max(...productOrders.map(o => new Date(o.created_at).getTime()))
          : 0;
        const daysSinceLastSale = lastSale > 0 ? Math.floor((now - lastSale) / (1000 * 60 * 60 * 24)) : 999;
        return {
          name: p.supplier_products?.name || "Produit",
          daysSinceLastSale,
          totalSales: productOrders.length,
        };
      })
      .filter(p => p.daysSinceLastSale > 14)
      .sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale)
      .slice(0, 5);
  }, [products, orders]);

  return (
    <DashboardLayout title="Ventes" subtitle="Analysez vos performances commerciales">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Filtrer par boutique :</span>
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Chiffre d'affaires" value={`${totalRevenue.toLocaleString('fr-FR')} €`} icon={Euro} loading={isLoading} />
        <StatCard title="Nombre de ventes" value={totalSales.toString()} icon={ShoppingCart} loading={isLoading} />
        <StatCard title="Panier moyen" value={`${avgBasket.toFixed(2)} €`} icon={Receipt} loading={isLoading} />
        <StatCard title="Produits actifs" value={(products?.filter(p => p.status === "active").length || 0).toString()} icon={Target} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Évolution mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {monthlyData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée de vente pour le moment
                </div>
              ) : (
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
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Produits les plus performants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {topProducts.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Aucune vente enregistrée
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" width={120} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <SalesMap
          salesByContinent={salesGeo?.byContinent || []}
          salesByCountry={salesGeo?.byCountry || []}
          salesByCity={salesGeo?.byCity || []}
        />
      </div>

      {/* Low Rotation Products */}
      {lowRotationProducts.length > 0 && (
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
                      {product.daysSinceLastSale >= 999
                        ? "Aucune vente enregistrée"
                        : `Dernière vente il y a ${product.daysSinceLastSale} jours`}
                      {" • "}{product.totalSales} vente(s) totale(s)
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
      )}
    </DashboardLayout>
  );
}
