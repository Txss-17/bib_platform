import { memo } from "react";

/**
 * Mini schématique SVG par variante. Donne un aperçu visuel rapide de la
 * disposition pour aider l'utilisateur à choisir sans relire les noms techniques.
 * Le rendu est volontairement abstrait (rectangles + lignes) pour rester lisible
 * en très petite taille.
 */
function Schematic({ variant }: { variant: string }) {
  const key = variant.toLowerCase();
  const stroke = "currentColor";
  const fill = "currentColor";
  const wrap = (children: React.ReactNode) => (
    <svg viewBox="0 0 60 40" className="h-full w-full" aria-hidden>
      {children}
    </svg>
  );

  // Layouts génériques par mots-clés.
  if (key === "fullscreen" || key === "full") {
    return wrap(<rect x="2" y="2" width="56" height="36" rx="2" fill={fill} opacity="0.18" />);
  }
  if (key === "split" || key === "split-image" || key === "split-newsletter" || key === "split-tall") {
    return wrap(
      <>
        <rect x="2" y="2" width="27" height="36" rx="2" fill={fill} opacity="0.25" />
        <rect x="31" y="2" width="27" height="36" rx="2" fill="none" stroke={stroke} strokeWidth="1" opacity="0.6" />
        <line x1="35" y1="14" x2="55" y2="14" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="35" y1="20" x2="50" y2="20" stroke={stroke} strokeWidth="1" opacity="0.5" />
      </>
    );
  }
  if (key === "type-only" || key === "minimal") {
    return wrap(
      <>
        <line x1="6" y1="14" x2="54" y2="14" stroke={stroke} strokeWidth="2" opacity="0.7" />
        <line x1="6" y1="22" x2="42" y2="22" stroke={stroke} strokeWidth="1.5" opacity="0.55" />
        <line x1="6" y1="28" x2="34" y2="28" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "centered") {
    return wrap(
      <>
        <line x1="14" y1="13" x2="46" y2="13" stroke={stroke} strokeWidth="2" opacity="0.7" />
        <line x1="20" y1="20" x2="40" y2="20" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <rect x="22" y="26" width="16" height="6" rx="1" fill={fill} opacity="0.5" />
      </>
    );
  }
  if (key === "alternating" || key === "zigzag") {
    return wrap(
      <>
        <rect x="2" y="3" width="20" height="14" rx="1" fill={fill} opacity="0.25" />
        <line x1="26" y1="8" x2="56" y2="8" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="26" y1="13" x2="50" y2="13" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <rect x="38" y="22" width="20" height="14" rx="1" fill={fill} opacity="0.25" />
        <line x1="4" y1="27" x2="34" y2="27" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="4" y1="32" x2="28" y2="32" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "side-pinned") {
    return wrap(
      <>
        <rect x="2" y="2" width="14" height="36" rx="1" fill={fill} opacity="0.3" />
        <line x1="20" y1="10" x2="56" y2="10" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="16" x2="50" y2="16" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <line x1="20" y1="22" x2="54" y2="22" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <line x1="20" y1="28" x2="48" y2="28" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "asymmetric") {
    return wrap(
      <>
        <rect x="2" y="2" width="36" height="22" rx="1" fill={fill} opacity="0.3" />
        <rect x="40" y="2" width="18" height="14" rx="1" fill={fill} opacity="0.2" />
        <rect x="40" y="18" width="18" height="20" rx="1" fill={fill} opacity="0.25" />
        <rect x="2" y="26" width="36" height="12" rx="1" fill={fill} opacity="0.2" />
      </>
    );
  }
  if (key === "tiled" || key === "uniform" || key === "mosaic") {
    return wrap(
      <>
        {[0, 1, 2].map((c) =>
          [0, 1].map((r) => (
            <rect
              key={`${c}-${r}`}
              x={2 + c * 19}
              y={2 + r * 19}
              width="17"
              height="17"
              rx="1"
              fill={fill}
              opacity={0.18 + ((c + r) % 2) * 0.08}
            />
          ))
        )}
      </>
    );
  }
  if (key === "masonry") {
    return wrap(
      <>
        <rect x="2" y="2" width="17" height="22" rx="1" fill={fill} opacity="0.25" />
        <rect x="2" y="26" width="17" height="12" rx="1" fill={fill} opacity="0.2" />
        <rect x="21" y="2" width="17" height="14" rx="1" fill={fill} opacity="0.22" />
        <rect x="21" y="18" width="17" height="20" rx="1" fill={fill} opacity="0.28" />
        <rect x="40" y="2" width="18" height="36" rx="1" fill={fill} opacity="0.2" />
      </>
    );
  }
  const upMatch = key.match(/^(\d)-up$/) || (key === "compact" ? ["", "3"] : null);
  if (upMatch) {
    const n = Math.min(6, Math.max(2, parseInt(upMatch[1] || "3", 10)));
    const w = (56 - (n - 1) * 2) / n;
    return wrap(
      <>
        {Array.from({ length: n }).map((_, i) => (
          <rect key={i} x={2 + i * (w + 2)} y="6" width={w} height="28" rx="1" fill={fill} opacity="0.25" />
        ))}
      </>
    );
  }
  if (key === "carousel" || key === "scrolling" || key === "marquee") {
    return wrap(
      <>
        <rect x="-4" y="10" width="20" height="20" rx="1" fill={fill} opacity="0.18" />
        <rect x="18" y="6" width="24" height="28" rx="1" fill={fill} opacity="0.32" />
        <rect x="44" y="10" width="20" height="20" rx="1" fill={fill} opacity="0.18" />
      </>
    );
  }
  if (key === "image-left") {
    return wrap(
      <>
        <rect x="2" y="2" width="24" height="36" rx="1" fill={fill} opacity="0.3" />
        <line x1="30" y1="10" x2="56" y2="10" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="18" x2="50" y2="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <line x1="30" y1="26" x2="54" y2="26" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "image-right") {
    return wrap(
      <>
        <rect x="34" y="2" width="24" height="36" rx="1" fill={fill} opacity="0.3" />
        <line x1="4" y1="10" x2="30" y2="10" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="4" y1="18" x2="24" y2="18" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <line x1="4" y1="26" x2="28" y2="26" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "image-top") {
    return wrap(
      <>
        <rect x="2" y="2" width="56" height="18" rx="1" fill={fill} opacity="0.3" />
        <line x1="6" y1="26" x2="54" y2="26" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="6" y1="32" x2="44" y2="32" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "letter" || key === "stacked") {
    return wrap(
      <>
        <line x1="6" y1="8" x2="54" y2="8" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="6" y1="14" x2="50" y2="14" stroke={stroke} strokeWidth="1" opacity="0.45" />
        <line x1="6" y1="20" x2="54" y2="20" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="6" y1="26" x2="46" y2="26" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <line x1="6" y1="32" x2="40" y2="32" stroke={stroke} strokeWidth="1" opacity="0.35" />
      </>
    );
  }
  if (key === "portrait-left") {
    return wrap(
      <>
        <circle cx="12" cy="20" r="8" fill={fill} opacity="0.3" />
        <line x1="24" y1="14" x2="56" y2="14" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="24" y1="20" x2="50" y2="20" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <line x1="24" y1="26" x2="54" y2="26" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "portrait-right") {
    return wrap(
      <>
        <circle cx="48" cy="20" r="8" fill={fill} opacity="0.3" />
        <line x1="4" y1="14" x2="36" y2="14" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="4" y1="20" x2="30" y2="20" stroke={stroke} strokeWidth="1" opacity="0.4" />
        <line x1="4" y1="26" x2="34" y2="26" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "xl") {
    return wrap(
      <>
        <line x1="6" y1="22" x2="54" y2="22" stroke={stroke} strokeWidth="4" opacity="0.7" />
      </>
    );
  }
  if (key === "accordion" || key === "list" || key === "table") {
    return wrap(
      <>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="4"
            y1={6 + i * 8}
            x2="56"
            y2={6 + i * 8}
            stroke={stroke}
            strokeWidth="1"
            opacity={0.5 - i * 0.08}
          />
        ))}
      </>
    );
  }
  if (key === "two-column" || key === "2-cols") {
    return wrap(
      <>
        <rect x="2" y="4" width="27" height="32" rx="1" fill="none" stroke={stroke} strokeWidth="1" opacity="0.55" />
        <rect x="31" y="4" width="27" height="32" rx="1" fill="none" stroke={stroke} strokeWidth="1" opacity="0.55" />
      </>
    );
  }
  if (key === "3-cols") {
    return wrap(
      <>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={2 + i * 19}
            y="4"
            width="17"
            height="32"
            rx="1"
            fill="none"
            stroke={stroke}
            strokeWidth="1"
            opacity="0.55"
          />
        ))}
      </>
    );
  }
  if (key === "4-cols") {
    return wrap(
      <>
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={2 + i * 14.5}
            y="4"
            width="12.5"
            height="32"
            rx="1"
            fill="none"
            stroke={stroke}
            strokeWidth="1"
            opacity="0.55"
          />
        ))}
      </>
    );
  }
  if (key === "vertical") {
    return wrap(
      <>
        {[0, 1, 2].map((i) => (
          <rect key={i} x="20" y={4 + i * 12} width="20" height="9" rx="1" fill={fill} opacity="0.25" />
        ))}
      </>
    );
  }
  if (key === "horizontal") {
    return wrap(
      <>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={4 + i * 19} y="14" width="17" height="13" rx="1" fill={fill} opacity="0.25" />
        ))}
      </>
    );
  }
  if (key === "boxed") {
    return wrap(
      <>
        <rect x="6" y="6" width="48" height="28" rx="2" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.6" />
        <line x1="14" y1="16" x2="46" y2="16" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="22" x2="40" y2="22" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "circle") {
    return wrap(
      <>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={14 + i * 16} cy="20" r="7" fill={fill} opacity="0.25" />
        ))}
      </>
    );
  }
  if (key === "stars") {
    return wrap(
      <>
        <text x="30" y="24" textAnchor="middle" fontSize="14" fill={fill} opacity="0.7">
          ★ ★ ★
        </text>
      </>
    );
  }
  if (key === "check-cross") {
    return wrap(
      <>
        <text x="20" y="26" textAnchor="middle" fontSize="14" fill={fill} opacity="0.7">✓</text>
        <text x="40" y="26" textAnchor="middle" fontSize="14" fill={fill} opacity="0.7">✕</text>
      </>
    );
  }
  if (key === "press-first" || key === "reviews-first" || key === "badges-row") {
    return wrap(
      <>
        <rect x="2" y="6" width="56" height="10" rx="1" fill={fill} opacity="0.3" />
        <line x1="6" y1="22" x2="54" y2="22" stroke={stroke} strokeWidth="1" opacity="0.5" />
        <line x1="6" y1="28" x2="44" y2="28" stroke={stroke} strokeWidth="1" opacity="0.4" />
      </>
    );
  }
  if (key === "sticky-only") {
    return wrap(
      <>
        <rect x="2" y="28" width="56" height="10" rx="1" fill={fill} opacity="0.4" />
      </>
    );
  }
  if (key === "static-grid") {
    return wrap(
      <>
        {[0, 1].map((r) =>
          [0, 1, 2].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={2 + c * 19}
              y={2 + r * 19}
              width="17"
              height="17"
              rx="1"
              fill={fill}
              opacity="0.22"
            />
          ))
        )}
      </>
    );
  }
  if (key === "dark") {
    return wrap(<rect x="2" y="2" width="56" height="36" rx="2" fill={fill} opacity="0.85" />);
  }
  if (key === "light") {
    return wrap(
      <rect x="2" y="2" width="56" height="36" rx="2" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.6" />
    );
  }
  if (key === "accent") {
    return wrap(<rect x="2" y="2" width="56" height="36" rx="2" fill={fill} opacity="0.55" />);
  }
  if (key === "outline") {
    return wrap(
      <rect x="2" y="2" width="56" height="36" rx="2" fill="none" stroke={stroke} strokeWidth="2" opacity="0.7" />
    );
  }
  if (key === "solid") {
    return wrap(<rect x="10" y="14" width="40" height="12" rx="6" fill={fill} opacity="0.7" />);
  }
  if (key === "gradient") {
    return wrap(
      <>
        <defs>
          <linearGradient id="grad" x1="0" x2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.2" />
            <stop offset="100%" stopColor={fill} stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <rect x="10" y="14" width="40" height="12" rx="6" fill="url(#grad)" />
      </>
    );
  }
  if (key === "featured") {
    return wrap(
      <>
        <rect x="2" y="2" width="32" height="36" rx="1" fill={fill} opacity="0.3" />
        <rect x="36" y="2" width="22" height="17" rx="1" fill={fill} opacity="0.22" />
        <rect x="36" y="21" width="22" height="17" rx="1" fill={fill} opacity="0.22" />
      </>
    );
  }
  if (key === "grid") {
    return wrap(
      <>
        {[0, 1].map((r) =>
          [0, 1, 2].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={4 + c * 18}
              y={4 + r * 16}
              width="16"
              height="14"
              rx="1"
              fill={fill}
              opacity="0.22"
            />
          ))
        )}
      </>
    );
  }
  // Fallback générique : pavé centré
  return wrap(
    <>
      <rect x="6" y="6" width="48" height="28" rx="2" fill={fill} opacity="0.18" />
      <line x1="14" y1="16" x2="46" y2="16" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <line x1="14" y1="22" x2="40" y2="22" stroke={stroke} strokeWidth="1" opacity="0.4" />
    </>
  );
}

const LABELS: Record<string, string> = {
  fullscreen: "Plein écran",
  split: "Split",
  "split-image": "Split image",
  "split-newsletter": "Split + newsletter",
  "split-tall": "Split haut",
  "type-only": "Typo seule",
  centered: "Centré",
  alternating: "Alterné",
  zigzag: "Zigzag",
  "side-pinned": "Latéral",
  asymmetric: "Asymétrique",
  tiled: "Tuiles",
  uniform: "Uniforme",
  mosaic: "Mosaïque",
  masonry: "Masonry",
  "3-up": "3 colonnes",
  "4-up": "4 colonnes",
  carousel: "Carrousel",
  scrolling: "Défilant",
  marquee: "Bandeau",
  "image-left": "Image à gauche",
  "image-right": "Image à droite",
  "image-top": "Image en haut",
  letter: "Lettre",
  stacked: "Empilé",
  "portrait-left": "Portrait gauche",
  "portrait-right": "Portrait droite",
  xl: "XL",
  accordion: "Accordéon",
  list: "Liste",
  table: "Tableau",
  "two-column": "2 colonnes",
  "2-cols": "2 colonnes",
  "3-cols": "3 colonnes",
  "4-cols": "4 colonnes",
  vertical: "Vertical",
  horizontal: "Horizontal",
  boxed: "Encadré",
  circle: "Cercles",
  stars: "Étoiles",
  "check-cross": "Pour / Contre",
  "press-first": "Presse en premier",
  "reviews-first": "Avis en premier",
  "badges-row": "Badges",
  "sticky-only": "Sticky",
  "static-grid": "Grille statique",
  dark: "Sombre",
  light: "Clair",
  accent: "Accent",
  outline: "Contour",
  solid: "Plein",
  gradient: "Dégradé",
  featured: "Vedette",
  grid: "Grille",
  compact: "Compact",
  full: "Complet",
  minimal: "Minimal",
};

function labelOf(v: string) {
  return LABELS[v] ?? v;
}

interface VariantPickerProps {
  variants: string[];
  value: string;
  onChange: (v: string) => void;
}

function VariantPickerImpl({ variants, value, onChange }: VariantPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {variants.map((v) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={active}
            title={labelOf(v)}
            className={`group flex flex-col items-stretch gap-1 rounded-md border p-1.5 text-left transition-all ${
              active
                ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                : "border-border/60 bg-background hover:border-primary/40 hover:bg-muted/30"
            }`}
          >
            <div
              className={`aspect-[3/2] overflow-hidden rounded-sm bg-muted/40 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Schematic variant={v} />
            </div>
            <span
              className={`truncate text-[10px] leading-tight ${
                active ? "font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {labelOf(v)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export const VariantPicker = memo(VariantPickerImpl);