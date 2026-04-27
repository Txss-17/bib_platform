interface MarqueeStripProps {
  items: string[];
  tone?: "marine" | "gold";
}

export function MarqueeStrip({ items, tone = "marine" }: MarqueeStripProps) {
  const repeated = [...items, ...items, ...items];
  const text = tone === "marine" ? "text-bib-marine" : "text-bib-gold";
  const dot = tone === "marine" ? "bg-bib-gold" : "bg-bib-marine";

  return (
    <div className="overflow-hidden border-y border-bib-marine/10 bg-bib-ivory py-5">
      <div className="flex gap-10 whitespace-nowrap animate-bib-marquee">
        {repeated.map((it, i) => (
          <div key={i} className="flex items-center gap-10 shrink-0">
            <span className={`font-display text-xl sm:text-2xl font-semibold tracking-tight ${text}`}>{it}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes bib-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.3333%); }
        }
        .animate-bib-marquee { animation: bib-marquee 28s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .animate-bib-marquee { animation: none; } }
      `}</style>
    </div>
  );
}

export default MarqueeStrip;
