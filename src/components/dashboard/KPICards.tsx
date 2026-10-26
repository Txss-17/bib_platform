import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Package,
  Euro,
  Store,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ElementType;
}

function KPICard({ title, value, trend, icon: Icon }: KPICardProps) {
  useLanguage();
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend !== undefined && (
              <div
                className={`flex items-center gap-1 text-sm ${
                  isPositive
                    ? "text-success"
                    : isNegative
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : isNegative ? (
                  <TrendingDown className="w-4 h-4" />
                ) : null}
                <span>
                  {isPositive ? "+" : ""}
                  {trend}%
                </span>
                <span className="text-muted-foreground">
                  {translateUi("vs mois dernier")}
                </span>
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

interface KPICardsProps {
  ordersCount: number;
  ordersTrend?: number;
  activeProducts: number;
  productsTrend?: number;
  revenue: number;
  revenueTrend?: number;
  activeBoutiques: number;
  boutiquesTrend?: number;
}

export function KPICards({
  ordersCount,
  ordersTrend,
  activeProducts,
  productsTrend,
  revenue,
  revenueTrend,
  activeBoutiques,
  boutiquesTrend,
}: KPICardsProps) {
  useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title={translateUi("Commandes")}
        value={ordersCount}
        trend={ordersTrend}
        icon={ShoppingCart}
      />
      <KPICard
        title={translateUi("Produits actifs")}
        value={activeProducts}
        trend={productsTrend}
        icon={Package}
      />
      <KPICard
        title={translateUi("Revenus")}
        value={`${revenue.toLocaleString(getUiLocale())} €`}
        trend={revenueTrend}
        icon={Euro}
      />
      <KPICard
        title={translateUi("Boutiques actives")}
        value={activeBoutiques}
        trend={boutiquesTrend}
        icon={Store}
      />
    </div>
  );
}
