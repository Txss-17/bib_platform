import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO 3166-1 numeric → ISO 3166-1 alpha-2 mapping for countries we care about
const numericToAlpha2: Record<string, string> = {
  "250": "FR", "276": "DE", "724": "ES", "380": "IT", "056": "BE",
  "528": "NL", "620": "PT", "756": "CH", "040": "AT", "616": "PL",
  "504": "MA", "686": "SN", "384": "CI", "788": "TN", "120": "CM",
  "012": "DZ", "818": "EG", "566": "NG", "710": "ZA", "404": "KE",
  "840": "US", "124": "CA", "484": "MX",
  "076": "BR", "032": "AR", "170": "CO", "152": "CL", "604": "PE",
  "156": "CN", "392": "JP", "410": "KR", "356": "IN", "702": "SG",
  "764": "TH", "704": "VN", "360": "ID",
  "036": "AU", "554": "NZ",
};

// Continent code per alpha-2
const countryToContinent: Record<string, string> = {
  FR: "EU", DE: "EU", ES: "EU", IT: "EU", BE: "EU", NL: "EU", PT: "EU", CH: "EU", AT: "EU", PL: "EU",
  MA: "AF", SN: "AF", CI: "AF", TN: "AF", CM: "AF", DZ: "AF", EG: "AF", NG: "AF", ZA: "AF", KE: "AF",
  US: "NA", CA: "NA", MX: "NA",
  BR: "SA", AR: "SA", CO: "SA", CL: "SA", PE: "SA",
  CN: "AS", JP: "AS", KR: "AS", IN: "AS", SG: "AS", TH: "AS", VN: "AS", ID: "AS",
  AU: "OC", NZ: "OC",
};

// Rough continent bounding for zoom
const continentProjection: Record<string, { center: [number, number]; zoom: number }> = {
  EU: { center: [15, 50], zoom: 3.5 },
  AF: { center: [20, 5], zoom: 2.5 },
  NA: { center: [-100, 45], zoom: 2.5 },
  SA: { center: [-60, -15], zoom: 2.2 },
  AS: { center: [100, 30], zoom: 2.5 },
  OC: { center: [140, -25], zoom: 3 },
};

interface SalesData {
  location: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface WorldMapProps {
  salesByCountry: SalesData[];
  onSelectContinent?: (code: string) => void;
  onSelectCountry?: (code: string) => void;
  selectedContinent: string | null;
}

export function WorldMap({
  salesByCountry,
  onSelectContinent,
  onSelectCountry,
  selectedContinent,
}: WorldMapProps) {
  const [tooltip, setTooltip] = useState<{ name: string; data?: SalesData } | null>(null);

  const salesMap = useMemo(() => {
    const m = new Map<string, SalesData>();
    salesByCountry.forEach((s) => m.set(s.location, s));
    return m;
  }, [salesByCountry]);

  const maxRevenue = useMemo(() => {
    return Math.max(...salesByCountry.map((s) => s.revenue), 1);
  }, [salesByCountry]);

  const projection = selectedContinent
    ? continentProjection[selectedContinent]
    : { center: [0, 20] as [number, number], zoom: 1 };

  const getCountryColor = (alpha2: string | undefined) => {
    if (!alpha2) return "hsl(var(--muted))";
    const data = salesMap.get(alpha2);
    if (!data) return "hsl(var(--muted))";

    // Color intensity based on revenue
    const intensity = Math.max(0.15, data.revenue / maxRevenue);
    return `hsl(var(--primary) / ${intensity})`;
  };

  return (
    <div className="relative w-full" style={{ aspectRatio: "2 / 1" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 120,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup center={projection.center} zoom={projection.zoom}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numId = geo.id || geo.properties?.["ISO_A3_EH"];
                const alpha2 = numericToAlpha2[numId];
                const data = alpha2 ? salesMap.get(alpha2) : undefined;
                const continent = alpha2 ? countryToContinent[alpha2] : undefined;

                // If viewing a continent, dim countries outside it
                const isInView = !selectedContinent || continent === selectedContinent;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (!selectedContinent && continent) {
                        onSelectContinent?.(continent);
                      } else if (alpha2 && data) {
                        onSelectCountry?.(alpha2);
                      }
                    }}
                    onMouseEnter={() => {
                      setTooltip({
                        name: geo.properties?.name || "Inconnu",
                        data,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: {
                        fill: isInView ? getCountryColor(alpha2) : "hsl(var(--muted) / 0.3)",
                        stroke: "hsl(var(--border))",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: (data || (!selectedContinent && continent)) ? "pointer" : "default",
                        transition: "fill 0.2s",
                      },
                      hover: {
                        fill: data ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
                        stroke: "hsl(var(--border))",
                        strokeWidth: 0.75,
                        outline: "none",
                        cursor: (data || (!selectedContinent && continent)) ? "pointer" : "default",
                      },
                      pressed: {
                        fill: "hsl(var(--primary))",
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-3 shadow-lg pointer-events-none text-sm">
          <p className="font-semibold text-foreground">{tooltip.name}</p>
          {tooltip.data ? (
            <div className="mt-1 space-y-0.5 text-muted-foreground">
              <p>Ventes: <span className="text-foreground font-medium">{tooltip.data.sales}</span></p>
              <p>CA: <span className="text-foreground font-medium">{tooltip.data.revenue.toFixed(0)}€</span></p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-1">Aucune vente</p>
          )}
        </div>
      )}
    </div>
  );
}
