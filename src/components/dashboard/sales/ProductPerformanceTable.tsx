import { Link } from "react-router-dom";
import { ArrowUpRight, CalendarClock, PackageCheck } from "lucide-react";
import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import type { RankedProduct } from "@/hooks/useSalesPerformance";

const money = (amount: number) => new Intl.NumberFormat(getUiLocale(), {
  style: "currency", currency: "EUR", maximumFractionDigits: 0,
}).format(amount);

export function ProductPerformanceTable({ products }: { products: RankedProduct[] }) {
  if (!products.length) return null;
  const maximum = Math.max(1, ...products.map(p => p.revenue));
  return (
    <div className="min-w-0 space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{translateUi("Classement des ventes payées")}</span>
        <span>{translateUi("Six derniers mois")}</span>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">{translateUi("Produit et boutique")}</th>
              <th className="px-3 py-3 text-right font-semibold">{translateUi("Unités")}</th>
              <th className="px-3 py-3 text-right font-semibold">{translateUi("Chiffre d'affaires")}</th>
              <th className="px-3 py-3 font-semibold">{translateUi("Stock")}</th>
              <th className="px-3 py-3 font-semibold">{translateUi("Dernière vente")}</th>
              <th className="px-3 py-3 text-right font-semibold">{translateUi("Ouvrir")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product,index) => (
              <tr key={product.id} className="group transition-colors hover:bg-muted/25">
                <td className="px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold tabular-nums">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="max-w-[245px] truncate font-semibold text-foreground" title={product.name}>{product.name}</p>
                      <p className="max-w-[245px] truncate text-xs text-muted-foreground">{product.boutiqueName}</p>
                      <div className="mt-2 h-1.5 max-w-[240px] overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{width:`${Math.max(2,product.revenue/maximum*100)}%`}} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-right font-semibold tabular-nums">{product.sales.toLocaleString(getUiLocale())}</td>
                <td className="px-3 py-4 text-right font-semibold tabular-nums">{money(product.revenue)}</td>
                <td className="px-3 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs tabular-nums">
                    <PackageCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    {product.stock === null ? "—" : product.stock.toLocaleString(getUiLocale())}
                  </span>
                </td>
                <td className="px-3 py-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="h-3.5 w-3.5"/>
                    {product.lastSoldAt ? new Date(product.lastSoldAt).toLocaleDateString(getUiLocale()) : "—"}
                  </span>
                </td>
                <td className="px-3 py-4 text-right">
                  <Link to={`/dashboard/produits?productId=${encodeURIComponent(product.id)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                    {translateUi("Ouvrir")} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
