import { useEffect, useState } from "react";
import { Check, X, Clock, Sparkles, Tag, ArrowRight } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

function hex(color?: string, fallback = "#0F172A") {
  return color || fallback;
}

/* -------------------------------------------------------------------------- */
/* 1. Announcement bar — top sticky strip                                     */
/* -------------------------------------------------------------------------- */

export function StorefrontAnnouncement({
  message = "Livraison offerte sur toute la boutique",
  emoji = "✨",
  primaryColor,
}: {
  message?: string;
  emoji?: string;
  primaryColor?: string;
}) {
  return (
    <div
      className="w-full text-center text-sm py-2.5 px-4 font-medium tracking-wide"
      style={{ background: hex(primaryColor), color: "#FAF7F0" }}
      role="banner"
    >
      <span className="mr-2" aria-hidden>{emoji}</span>
      {message}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Countdown — urgency timer                                               */
/* -------------------------------------------------------------------------- */

function useCountdown(targetMs: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const diff = Math.max(0, targetMs - now);
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: diff === 0,
  };
}

export function StorefrontCountdown({
  title = "Offre se termine dans",
  endsInHours = 24,
  primaryColor,
  secondaryColor,
}: {
  title?: string;
  endsInHours?: number;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  // Stable end time per session (does not move when component re-renders)
  const [target] = useState(() => Date.now() + endsInHours * 3600 * 1000);
  const { days, hours, minutes, seconds, done } = useCountdown(target);

  const Cell = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div
        className="min-w-[64px] sm:min-w-[80px] rounded-xl px-3 py-3 sm:py-4 text-center font-display font-bold text-2xl sm:text-3xl"
        style={{ background: hex(primaryColor), color: hex(secondaryColor, "#C9A14A") }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] uppercase tracking-[0.18em] mt-2 text-muted-foreground font-semibold">
        {label}
      </span>
    </div>
  );

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4" style={{ background: `${hex(secondaryColor, "#C9A14A")}20`, color: hex(primaryColor) }}>
          <Clock size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Urgent</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6" style={{ color: hex(primaryColor) }}>
          {done ? "Offre terminée" : title}
        </h2>
        {!done && (
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <Cell value={days} label="Jours" />
            <span className="font-display text-2xl sm:text-3xl font-bold opacity-30" style={{ color: hex(primaryColor) }}>:</span>
            <Cell value={hours} label="Heures" />
            <span className="font-display text-2xl sm:text-3xl font-bold opacity-30" style={{ color: hex(primaryColor) }}>:</span>
            <Cell value={minutes} label="Min" />
            <span className="font-display text-2xl sm:text-3xl font-bold opacity-30" style={{ color: hex(primaryColor) }}>:</span>
            <Cell value={seconds} label="Sec" />
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Comparison — Us vs Them / Before vs After                               */
/* -------------------------------------------------------------------------- */

interface ComparisonRow {
  label: string;
  us: boolean;
  them: boolean;
}

export function StorefrontComparison({
  title = "Pourquoi nous choisir",
  us = "Notre offre",
  them = "Les autres",
  rows = [],
  primaryColor,
  secondaryColor,
}: {
  title?: string;
  us?: string;
  them?: string;
  rows?: ComparisonRow[];
  primaryColor?: string;
  secondaryColor?: string;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="py-16 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-10" style={{ color: hex(primaryColor) }}>
          {title}
        </h2>
        <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-white">
          <div className="grid grid-cols-[1fr_auto_auto] divide-y divide-border">
            <div className="contents text-xs sm:text-sm uppercase tracking-wider font-semibold" style={{ color: hex(primaryColor) }}>
              <div className="px-4 sm:px-6 py-4 bg-muted/40" />
              <div className="px-4 sm:px-6 py-4 text-center bg-muted/40" style={{ color: hex(primaryColor) }}>
                {us}
              </div>
              <div className="px-4 sm:px-6 py-4 text-center bg-muted/40 text-muted-foreground">
                {them}
              </div>
            </div>
            {rows.map((row, i) => (
              <div className="contents" key={i}>
                <div className="px-4 sm:px-6 py-4 text-sm sm:text-base font-medium" style={{ color: hex(primaryColor) }}>
                  {row.label}
                </div>
                <div className="px-4 sm:px-6 py-4 text-center">
                  {row.us ? (
                    <Check className="inline-block" size={20} style={{ color: hex(secondaryColor, "#C9A14A") }} strokeWidth={3} />
                  ) : (
                    <X className="inline-block text-muted-foreground/40" size={20} />
                  )}
                </div>
                <div className="px-4 sm:px-6 py-4 text-center">
                  {row.them ? (
                    <Check className="inline-block text-muted-foreground/60" size={20} strokeWidth={3} />
                  ) : (
                    <X className="inline-block text-muted-foreground/40" size={20} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. Bundle — group offer with savings                                       */
/* -------------------------------------------------------------------------- */

export function StorefrontBundle({
  title = "Offre groupée",
  subtitle,
  items = [],
  originalPrice,
  bundlePrice,
  primaryColor,
  secondaryColor,
}: {
  title?: string;
  subtitle?: string;
  items?: string[];
  originalPrice?: number;
  bundlePrice?: number;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  const savings = originalPrice && bundlePrice ? originalPrice - bundlePrice : 0;
  const pct = originalPrice && savings > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="rounded-3xl p-8 sm:p-12 border-2 shadow-xl relative overflow-hidden" style={{ borderColor: hex(secondaryColor, "#C9A14A"), background: "white" }}>
          {pct > 0 && (
            <div
              className="absolute top-6 right-6 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: hex(secondaryColor, "#C9A14A"), color: hex(primaryColor) }}
            >
              −{pct}%
            </div>
          )}
          <div className="flex items-center gap-2 mb-3" style={{ color: hex(secondaryColor, "#C9A14A") }}>
            <Tag size={16} />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">Pack avantage</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2" style={{ color: hex(primaryColor) }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mb-8 text-lg">{subtitle}</p>
          )}
          <ul className="space-y-3 mb-8">
            {items.map((it, i) => (
              <li key={i} className="flex items-start gap-3 text-base sm:text-lg" style={{ color: hex(primaryColor) }}>
                <span
                  className="mt-1 inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                  style={{ background: `${hex(secondaryColor, "#C9A14A")}20`, color: hex(secondaryColor, "#C9A14A") }}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                {it}
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 pt-6 border-t border-border">
            <div>
              {originalPrice && (
                <p className="text-base text-muted-foreground line-through">€{originalPrice.toFixed(2)}</p>
              )}
              <p className="font-display text-4xl sm:text-5xl font-bold" style={{ color: hex(primaryColor) }}>
                €{(bundlePrice ?? 0).toFixed(2)}
              </p>
              {savings > 0 && (
                <p className="text-sm font-semibold mt-1" style={{ color: hex(secondaryColor, "#C9A14A") }}>
                  Vous économisez €{savings.toFixed(2)}
                </p>
              )}
            </div>
            <button
              className="sm:ml-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-transform hover:scale-[1.02]"
              style={{ background: hex(primaryColor), color: hex(secondaryColor, "#C9A14A") }}
            >
              Ajouter le pack
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. Lookbook — editorial gallery (3-up asymmetric)                          */
/* -------------------------------------------------------------------------- */

export function StorefrontLookbook({
  title = "Le lookbook",
  images = [],
  primaryColor,
}: {
  title?: string;
  images?: { url: string; alt?: string }[];
  primaryColor?: string;
}) {
  // Sensible defaults using brand-tone gradient blocks if no images
  const slots = [0, 1, 2, 3].map((i) => images[i]);

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold" style={{ color: hex(primaryColor) }}>
            {title}
          </h2>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hidden sm:block">
            Édition limitée
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {slots.map((img, i) => (
            <div
              key={i}
              className={`relative rounded-2xl overflow-hidden bg-muted ${
                i === 0 ? "lg:row-span-2 aspect-[3/4] lg:aspect-[3/5]" : "aspect-[3/4]"
              }`}
              style={!img ? { background: hex(primaryColor) } : undefined}
            >
              {img ? (
                <img src={img.url} alt={img.alt || `Look ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/30 font-display text-6xl">
                  {i + 1}
                </div>
              )}
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-white/90 text-[10px] font-bold uppercase tracking-wider" style={{ color: hex(primaryColor) }}>
                Look {i + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. Sticky CTA — fixed bottom buy bar                                       */
/* -------------------------------------------------------------------------- */

export function StorefrontStickyCTA({
  label = "Acheter maintenant",
  anchor = "products",
  primaryColor,
  secondaryColor,
}: {
  label?: string;
  anchor?: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-4 pointer-events-none transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      aria-hidden={!visible}
    >
      <div className="container mx-auto max-w-2xl">
        <a
          href={`#${anchor}`}
          onClick={handleClick}
          className="pointer-events-auto flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-semibold shadow-2xl transition-transform hover:scale-[1.01] active:scale-[0.99]"
          style={{ background: hex(primaryColor), color: hex(secondaryColor, "#C9A14A") }}
        >
          <Sparkles size={18} />
          {label}
          <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
}