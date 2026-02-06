import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, MapPin, TrendingUp, Package, DollarSign, Globe } from "lucide-react";
import { continents, countries } from "@/lib/salesGeoData";

interface SalesData {
  location: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface SalesMapProps {
  salesByContinent: SalesData[];
  salesByCountry: SalesData[];
  salesByCity: SalesData[];
}

type ViewLevel = "continents" | "countries" | "cities";

export function SalesMap({ salesByContinent, salesByCountry, salesByCity }: SalesMapProps) {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("continents");
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const handleContinentClick = (continentCode: string) => {
    setSelectedContinent(continentCode);
    setViewLevel("countries");
  };

  const handleCountryClick = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setViewLevel("cities");
  };

  const handleBack = () => {
    if (viewLevel === "cities") {
      setSelectedCountry(null);
      setViewLevel("countries");
    } else if (viewLevel === "countries") {
      setSelectedContinent(null);
      setViewLevel("continents");
    }
  };

  // Aggregate data by continent
  const continentData = Object.entries(continents).map(([code, continent]) => {
    const countryCodes = continent.countries;
    const countrySales = salesByCountry.filter(s => countryCodes.includes(s.location));
    const totalSales = countrySales.reduce((sum, s) => sum + s.sales, 0);
    const totalRevenue = countrySales.reduce((sum, s) => sum + s.revenue, 0);
    const totalOrders = countrySales.reduce((sum, s) => sum + s.orders, 0);
    
    return {
      code,
      name: continent.name,
      emoji: continent.emoji,
      sales: totalSales,
      revenue: totalRevenue,
      orders: totalOrders,
    };
  }).filter(c => c.sales > 0 || c.orders > 0);

  // Get countries for selected continent
  const countryData = selectedContinent
    ? continents[selectedContinent].countries
        .map(code => {
          const country = countries[code];
          const sales = salesByCountry.find(s => s.location === code);
          return {
            code,
            name: country?.name || code,
            emoji: country?.emoji || "🏳️",
            sales: sales?.sales || 0,
            revenue: sales?.revenue || 0,
            orders: sales?.orders || 0,
          };
        })
        .filter(c => c.sales > 0 || c.orders > 0)
    : [];

  // Get cities for selected country
  const cityData = selectedCountry
    ? (countries[selectedCountry]?.cities || [])
        .map(cityName => {
          const sales = salesByCity.find(s => s.location === cityName);
          return {
            name: cityName,
            sales: sales?.sales || 0,
            revenue: sales?.revenue || 0,
            orders: sales?.orders || 0,
          };
        })
        .filter(c => c.sales > 0 || c.orders > 0)
    : [];

  const getBreadcrumb = () => {
    const parts = ["Monde"];
    if (selectedContinent) {
      parts.push(continents[selectedContinent]?.name || selectedContinent);
    }
    if (selectedCountry) {
      parts.push(countries[selectedCountry]?.name || selectedCountry);
    }
    return parts.join(" → ");
  };

  const renderLocationCard = (
    item: { code?: string; name: string; emoji?: string; sales: number; revenue: number; orders: number },
    onClick?: () => void
  ) => (
    <button
      key={item.name}
      onClick={onClick}
      disabled={!onClick}
      className={`w-full p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-all text-left ${
        onClick ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {item.emoji && <span className="text-2xl">{item.emoji}</span>}
          {!item.emoji && <MapPin className="w-5 h-5 text-muted-foreground" />}
          <span className="font-semibold text-foreground">{item.name}</span>
        </div>
        {onClick && (
          <Badge variant="outline" className="text-xs">
            Voir détails
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <Package className="w-3 h-3" />
            <span className="text-xs">Ventes</span>
          </div>
          <p className="font-bold text-foreground">{item.sales}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs">Commandes</span>
          </div>
          <p className="font-bold text-foreground">{item.orders}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
            <DollarSign className="w-3 h-3" />
            <span className="text-xs">CA</span>
          </div>
          <p className="font-bold text-foreground">{item.revenue.toFixed(0)}€</p>
        </div>
      </div>
    </button>
  );

  const hasNoData = viewLevel === "continents" && continentData.length === 0;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {viewLevel !== "continents" && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Ventes par zone géographique
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{getBreadcrumb()}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Temps réel
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {hasNoData ? (
          <div className="text-center py-12 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune donnée de vente disponible.</p>
            <p className="text-sm mt-1">Les ventes apparaîtront ici une fois les premières commandes passées.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viewLevel === "continents" &&
              continentData.map(continent =>
                renderLocationCard(
                  { ...continent, emoji: continent.emoji },
                  () => handleContinentClick(continent.code)
                )
              )}

            {viewLevel === "countries" &&
              countryData.map(country =>
                renderLocationCard(
                  country,
                  country.sales > 0 ? () => handleCountryClick(country.code) : undefined
                )
              )}

            {viewLevel === "cities" &&
              cityData.map(city => renderLocationCard(city))}
          </div>
        )}

        {viewLevel === "countries" && countryData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucune vente dans cette région.</p>
          </div>
        )}

        {viewLevel === "cities" && cityData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Données par ville non disponibles.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
