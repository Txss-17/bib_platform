import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Globe } from "lucide-react";
import { WorldMap } from "./WorldMap";
import { SalesTable } from "./SalesTable";
import { continents } from "@/lib/salesGeoData";
import { getContinentForMarket } from "@/lib/salesGeoData";

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

export function SalesMap({ salesByContinent, salesByCountry }: SalesMapProps) {
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);

  const handleBack = () => setSelectedContinent(null);

  const handleContinentClick = (code: string) => setSelectedContinent(code);

  // Filter countries for selected continent
  const filteredCountries = selectedContinent
    ? salesByCountry.filter(
        (s) => continents[selectedContinent]?.countries.includes(s.location)
      )
    : [];

  const breadcrumb = selectedContinent
    ? `Monde → ${continents[selectedContinent]?.name || selectedContinent}`
    : "Monde";

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedContinent && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Ventes par zone géographique
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{breadcrumb}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Temps réel
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interactive Map */}
        <div className="rounded-xl border border-border/50 overflow-hidden bg-muted/20">
          <WorldMap
            salesByCountry={salesByCountry}
            selectedContinent={selectedContinent}
            onSelectContinent={handleContinentClick}
            onSelectCountry={() => {}}
          />
        </div>

        {/* Data Table */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          {selectedContinent ? (
            <SalesTable
              data={filteredCountries}
              level="country"
            />
          ) : (
            <SalesTable
              data={salesByContinent}
              level="continent"
              onRowClick={handleContinentClick}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
