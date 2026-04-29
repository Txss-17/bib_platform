import { useState, useMemo } from "react";
import { TrendingUp, Wallet, Receipt, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * PriceTransparencySection
 * Live margin simulator. Public sees exactly:
 *   - supplier base price (input)
 *   - chosen margin %
 *   - public price (output)
 *   - platform fee (flat 5% — example only)
 *   - net to seller
 * Strict palette: ivory bg / marine ink / gold accent.
 */
const PLATFORM_FEE_PCT = 5;

export default function PriceTransparencySection() {
  const { lang } = useLanguage();
  const [base, setBase] = useState(18);
  const [marginPct, setMarginPct] = useState(40);

  const computed = useMemo(() => {
    const margin = +(base * (marginPct / 100));
    const publicPrice = +(base + margin);
    const platformFee = +(publicPrice * (PLATFORM_FEE_PCT / 100));
    const net = +(margin - platformFee);
    return {
      margin: margin.toFixed(2),
      publicPrice: publicPrice.toFixed(2),
      platformFee: platformFee.toFixed(2),
      net: net.toFixed(2),
      netPct: ((net / publicPrice) * 100).toFixed(1),
    };
  }, [base, marginPct]);

  return (
    <section
      id="transparency"
      className="py-20 lg:py-28 bg-bib-ivory relative overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
          {/* LEFT — copy */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bib-gold/15 border border-bib-gold/30 mb-5">
              <Receipt size={14} className="text-bib-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bib-gold">
                {lang === "fr" ? "Transparence prix" : "Price transparency"}
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5 text-bib-marine">
              {lang === "fr" ? (
                <>
                  Aucun frais caché.{" "}
                  <span className="text-bib-gold">Jamais.</span>
                </>
              ) : (
                <>
                  No hidden fees.{" "}
                  <span className="text-bib-gold">Ever.</span>
                </>
              )}
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
              {lang === "fr"
                ? "Une seule commission claire sur chaque vente. Vous voyez exactement combien vous gagnez avant de publier le produit."
                : "One clear commission per sale. You see exactly what you earn before you publish."}
            </p>

            <ul className="space-y-3 text-bib-marine">
              {[
                lang === "fr"
                  ? "Marge libre dans la limite fixée par le fournisseur"
                  : "Free margin within supplier-defined cap",
                lang === "fr"
                  ? "Commission unique de 5% sur le prix public"
                  : "Single 5% commission on public price",
                lang === "fr"
                  ? "Aucun frais sur les remboursements"
                  : "No fee on refunds",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-bib-gold shrink-0" />
                  <span className="leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1.5">
              <Info size={12} />
              {lang === "fr"
                ? "Simulateur indicatif. Les marges réelles dépendent du fournisseur."
                : "Indicative simulator. Real margins depend on the supplier."}
            </p>
          </div>

          {/* RIGHT — live simulator card */}
          <div className="relative">
            <div className="rounded-2xl border border-bib-marine/10 bg-card shadow-premium p-6 lg:p-8">
              <p className="font-display font-semibold text-bib-marine mb-1">
                {lang === "fr" ? "Simulateur de marge" : "Margin simulator"}
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                {lang === "fr"
                  ? "Ajustez le prix d'achat et votre marge cible."
                  : "Adjust the cost price and your target margin."}
              </p>

              {/* Base price slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-bib-marine">
                    {lang === "fr" ? "Prix d'achat" : "Cost price"}
                  </label>
                  <span className="font-display font-bold text-bib-marine">
                    € {base.toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={[base]}
                  onValueChange={(v) => setBase(v[0])}
                  min={5}
                  max={150}
                  step={1}
                  aria-label="Cost price"
                />
              </div>

              {/* Margin slider */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-bib-marine">
                    {lang === "fr" ? "Marge appliquée" : "Applied margin"}
                  </label>
                  <span className="font-display font-bold text-bib-gold">{marginPct}%</span>
                </div>
                <Slider
                  value={[marginPct]}
                  onValueChange={(v) => setMarginPct(v[0])}
                  min={5}
                  max={80}
                  step={1}
                  aria-label="Margin"
                />
              </div>

              {/* Breakdown */}
              <div className="rounded-xl bg-bib-ivory border border-bib-marine/10 divide-y divide-bib-marine/10">
                <Row
                  label={lang === "fr" ? "Prix public" : "Public price"}
                  value={`€ ${computed.publicPrice}`}
                  strong
                />
                <Row
                  label={lang === "fr" ? "Coût fournisseur" : "Supplier cost"}
                  value={`− € ${base.toFixed(2)}`}
                />
                <Row
                  label={
                    lang === "fr"
                      ? `Commission Brand-In-A-Box (${PLATFORM_FEE_PCT}%)`
                      : `Brand-In-A-Box commission (${PLATFORM_FEE_PCT}%)`
                  }
                  value={`− € ${computed.platformFee}`}
                />
                <Row
                  label={lang === "fr" ? "Vous gagnez" : "You earn"}
                  value={`€ ${computed.net}`}
                  highlight
                />
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-lg border border-bib-marine/10 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    <Wallet size={11} />
                    {lang === "fr" ? "Marge nette" : "Net margin"}
                  </div>
                  <p className="font-display font-bold text-bib-marine text-lg">
                    {computed.netPct}%
                  </p>
                </div>
                <div className="rounded-lg border border-bib-gold/30 bg-bib-gold/5 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-bib-gold mb-1">
                    <TrendingUp size={11} />
                    {lang === "fr" ? "Vente unitaire" : "Per sale"}
                  </div>
                  <p className="font-display font-bold text-bib-gold text-lg">
                    € {computed.net}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  strong,
  highlight,
}: {
  label: string;
  value: string;
  strong?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span
        className={`text-sm ${
          highlight ? "text-bib-marine font-semibold" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <span
        className={`font-display ${
          highlight
            ? "text-bib-gold text-lg font-bold"
            : strong
              ? "text-bib-marine font-bold"
              : "text-bib-marine/80 font-medium"
        }`}
      >
        {value}
      </span>
    </div>
  );
}