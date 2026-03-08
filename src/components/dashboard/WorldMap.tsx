import { useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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

const countryToContinent: Record<string, string> = {
  FR: "EU", DE: "EU", ES: "EU", IT: "EU", BE: "EU", NL: "EU", PT: "EU", CH: "EU", AT: "EU", PL: "EU",
  MA: "AF", SN: "AF", CI: "AF", TN: "AF", CM: "AF", DZ: "AF", EG: "AF", NG: "AF", ZA: "AF", KE: "AF",
  US: "NA", CA: "NA", MX: "NA",
  BR: "SA", AR: "SA", CO: "SA", CL: "SA", PE: "SA",
  CN: "AS", JP: "AS", KR: "AS", IN: "AS", SG: "AS", TH: "AS", VN: "AS", ID: "AS",
  AU: "OC", NZ: "OC",
};

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
  const [tooltip, setTooltip] = useState<{ name: string; data?: SalesData; x: number; y: number } | null>(null);
  const [rotation, setRotation] = useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState<{ x: number; y: number } | null>(null);

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
    const intensity = Math.max(0.15, data.revenue / maxRevenue);
    return `hsl(var(--primary) / ${intensity})`;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !lastMouse) return;
    const dx = (e.clientX - lastMouse.x) * 0.3;
    const dy = (e.clientY - lastMouse.y) * 0.3;
    setRotation(prev => [
      Math.max(-30, Math.min(30, prev[0] - dy)),
      Math.max(-45, Math.min(45, prev[1] + dx)),
    ]);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setLastMouse(null);
  };

  return (
    <div 
      className="relative w-full select-none" 
      style={{ aspectRatio: "2 / 1", perspective: "1200px" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div
        className="w-full h-full transition-transform duration-100"
        style={{
          transform: `rotateX(${15 + rotation[0]}deg) rotateY(${rotation[1]}deg) rotateZ(-2deg)`,
          transformStyle: "preserve-3d",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 120 }}
          style={{ width: "100%", height: "100%" }}
        >
          <defs>
            <linearGradient id="mapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
            <filter id="mapShadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="hsl(var(--primary))" floodOpacity="0.15" />
            </filter>
            <filter id="mapGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <ZoomableGroup center={projection.center} zoom={projection.zoom}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numId = geo.id || geo.properties?.["ISO_A3_EH"];
                  const alpha2 = numericToAlpha2[numId];
                  const data = alpha2 ? salesMap.get(alpha2) : undefined;
                  const continent = alpha2 ? countryToContinent[alpha2] : undefined;
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
                      onMouseEnter={(e) => {
                        const rect = (e.target as SVGElement).closest('div')?.getBoundingClientRect();
                        setTooltip({
                          name: geo.properties?.name || "Inconnu",
                          data,
                          x: e.clientX - (rect?.left || 0),
                          y: e.clientY - (rect?.top || 0),
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
                          transition: "fill 0.3s, stroke-width 0.2s",
                          filter: data ? "url(#mapShadow)" : "none",
                        },
                        hover: {
                          fill: data ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)",
                          stroke: "hsl(var(--primary))",
                          strokeWidth: 1,
                          outline: "none",
                          cursor: (data || (!selectedContinent && continent)) ? "pointer" : "default",
                          filter: data ? "url(#mapGlow)" : "none",
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
      </div>

      {/* Floating tooltip following cursor */}
      {tooltip && (
        <div 
          className="absolute bg-card/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl pointer-events-none text-sm z-10"
          style={{ 
            left: Math.min(tooltip.x + 10, 280), 
            top: Math.max(tooltip.y - 60, 10),
          }}
        >
          <p className="font-semibold text-foreground">{tooltip.name}</p>
          {tooltip.data ? (
            <div className="mt-1.5 space-y-1 text-muted-foreground">
              <p>Ventes: <span className="text-foreground font-bold">{tooltip.data.sales}</span></p>
              <p>CA: <span className="text-foreground font-bold">{tooltip.data.revenue.toFixed(0)}€</span></p>
              <p>Commandes: <span className="text-foreground font-bold">{tooltip.data.orders}</span></p>
            </div>
          ) : (
            <p className="text-muted-foreground mt-1">Aucune vente</p>
          )}
        </div>
      )}

      {/* 3D shadow effect */}
      <div 
        className="absolute inset-x-4 -bottom-2 h-6 rounded-full opacity-20 blur-lg"
        style={{ background: "hsl(var(--primary))" }}
      />
    </div>
  );
}
