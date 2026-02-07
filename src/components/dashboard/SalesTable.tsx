import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { countries } from "@/lib/salesGeoData";

interface SalesData {
  location: string;
  sales: number;
  revenue: number;
  orders: number;
}

interface SalesTableProps {
  data: SalesData[];
  level: "continent" | "country";
  onRowClick?: (code: string) => void;
}

const continentNames: Record<string, { name: string; emoji: string }> = {
  EU: { name: "Europe", emoji: "🇪🇺" },
  AF: { name: "Afrique", emoji: "🌍" },
  NA: { name: "Amérique du Nord", emoji: "🌎" },
  SA: { name: "Amérique du Sud", emoji: "🌎" },
  AS: { name: "Asie", emoji: "🌏" },
  OC: { name: "Océanie", emoji: "🌏" },
};

export function SalesTable({ data, level, onRowClick }: SalesTableProps) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  const getLabel = (code: string) => {
    if (level === "continent") {
      const c = continentNames[code];
      return c ? `${c.emoji} ${c.name}` : code;
    }
    const c = countries[code];
    return c ? `${c.emoji} ${c.name}` : code;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{level === "continent" ? "Continent" : "Pays"}</TableHead>
          <TableHead className="text-right">Ventes</TableHead>
          <TableHead className="text-right">Commandes</TableHead>
          <TableHead className="text-right">CA</TableHead>
          <TableHead className="text-right">% du total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => (
          <TableRow
            key={row.location}
            onClick={() => onRowClick?.(row.location)}
            className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
          >
            <TableCell className="font-medium">{getLabel(row.location)}</TableCell>
            <TableCell className="text-right">{row.sales}</TableCell>
            <TableCell className="text-right">{row.orders}</TableCell>
            <TableCell className="text-right font-semibold">{row.revenue.toFixed(0)}€</TableCell>
            <TableCell className="text-right text-muted-foreground">
              {totalRevenue > 0 ? ((row.revenue / totalRevenue) * 100).toFixed(1) : 0}%
            </TableCell>
          </TableRow>
        ))}
        {sorted.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              Aucune donnée disponible
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
