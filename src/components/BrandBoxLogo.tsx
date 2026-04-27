import { useEffect, useRef, useState } from "react";
import logoImg from "@/assets/brand-in-a-box-logo.png";

/**
 * Brand-In-A-Box signature animation — the gold "B" falls into the marine box.
 *
 * Strict brand rules:
 *  - Three colors only: ivory (background), marine (box), gold (B).
 *  - NO blends, NO gradients, NO recoloring of the asset.
 *  - Uses the official PNG twice with percent-based crops, so the rendered
 *    icon is byte-identical to the source mark at any size.
 *
 * The icon bbox in the 1243×629 source is x∈[231,512], y∈[162,480]:
 *   fracX 0.186, fracY 0.258, fracW 0.226, fracH 0.505 → ratio ≈ 0.884
 * Inside that bbox, the B occupies roughly the top ~58% (y 0.258→0.55),
 * the box opening sits around 55%, and the box body fills the bottom 45%.
 *
 * Variants:
 *  - "icon": just the mark (square-ish), used in the hero
 *  - "full": full uploaded asset including wordmark
 */

const ICON = {
  fracX: 0.186,
  fracY: 0.258,
  fracW: 0.226,
  fracH: 0.505,
  ratio: 281 / 318, // ≈ 0.884 (icon W/H)
  // Vertical split between "B" (above) and "box body + opening" (below).
  // Measured from the icon top, expressed as a percent of icon height.
  splitPct: 56,
} as const;

interface BrandBoxLogoProps {
  /** Pixel height of the icon. Width follows the icon ratio (or full asset ratio). */
  size?: number;
  /** Replays the animation each time the logo enters the viewport. */
  replayOnScroll?: boolean;
  /** Drives the drop progress from external scroll (0 → 1). Overrides intersection-based replay. */
  progress?: number;
  className?: string;
  variant?: "icon" | "full";
}

export function BrandBoxLogo({
  size = 240,
  replayOnScroll = true,
  progress,
  className = "",
  variant = "icon",
}: BrandBoxLogoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  // Auto-play once on mount + replay on viewport entry (when not progress-driven).
  useEffect(() => {
    if (typeof progress === "number") return;
    const t = window.setTimeout(() => setPlaying(true), 150);
    return () => window.clearTimeout(t);
  }, [progress]);

  useEffect(() => {
    if (typeof progress === "number" || !replayOnScroll || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPlaying(false);
            requestAnimationFrame(() =>
              requestAnimationFrame(() => setPlaying(true)),
            );
          }
        });
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [replayOnScroll, progress]);

  const aspectFull = 1243 / 629;
  const width = variant === "full" ? size * aspectFull : Math.round(size * ICON.ratio);
  const height = size;

  // ---- FULL variant: render the official asset 1:1, with a discreet entry fade.
  //      The dramatic B-drops-into-box motion is reserved for the ICON variant
  //      so the wordmark and tagline never get distorted.
  if (variant === "full") {
    return (
      <div
        ref={ref}
        className={`relative inline-block ${className}`}
        style={{ width, height }}
        role="img"
        aria-label="Brand-In-A-Box — Your brand. Ready to launch."
      >
        <img
          src={logoImg}
          alt=""
          draggable={false}
          className={`w-full h-full object-contain select-none pointer-events-none ${
            playing ? "animate-fade-up" : "opacity-0"
          }`}
        />
      </div>
    );
  }

  // ---- ICON variant: clean two-layer composition (box body static, B drops in) ----
  // We render the source PNG enlarged + offset so only the icon bbox is visible,
  // then split into "below split" (box body, static) and "above split" (B, animated).
  const scale = 100 / ICON.fracW; // % width
  const offsetX = `${-ICON.fracX * scale}%`;
  const offsetYIcon = `${-ICON.fracY * scale * (629 / 1243)}%`;
  const splitInsetTop = `${ICON.splitPct}%`;
  const splitInsetBottom = `${100 - ICON.splitPct}%`;

  return (
    <div
      ref={ref}
      className={`relative inline-block ${className}`}
      style={{ width, height }}
      role="img"
      aria-label="Brand-In-A-Box"
    >
      {/* Soft shadow under the icon (depth, no color blend) */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "-6%",
          width: "70%",
          height: "8%",
          borderRadius: "50%",
          background: "hsl(var(--bib-marine) / 0.18)",
          filter: "blur(10px)",
        }}
      />

      {/* Bottom layer: box body (always visible) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(${splitInsetTop} 0 0 0)` }}
      >
        <img
          src={logoImg}
          alt=""
          draggable={false}
          className="absolute select-none pointer-events-none max-w-none"
          style={{
            width: `${scale}%`,
            height: "auto",
            left: offsetX,
            top: offsetYIcon,
          }}
        />
      </div>

      {/* Inside-the-box subtle inner shadow when B has landed */}
      <div
        aria-hidden
        className={`absolute left-[8%] right-[8%] rounded-md transition-opacity duration-500 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
        style={{
          top: `${ICON.splitPct - 2}%`,
          height: "8%",
          background:
            "linear-gradient(180deg, hsl(var(--bib-marine) / 0.35), hsl(var(--bib-marine) / 0))",
        }}
      />

      {/* Top layer: the B (animated drop) */}
      <div
        className={`absolute inset-0 overflow-hidden ${
          typeof progress === "number"
            ? ""
            : playing
              ? "bib-anim-bdrop"
              : "opacity-0"
        }`}
        style={{
          clipPath: `inset(0 0 ${splitInsetBottom} 0)`,
          transform:
            typeof progress === "number"
              ? `translateY(${(-1 + Math.min(Math.max(progress, 0), 1)) * 70}%) scale(${0.9 + 0.1 * Math.min(progress, 1)})`
              : undefined,
          opacity: typeof progress === "number" ? Math.min(progress * 1.4, 1) : undefined,
          transformOrigin: "50% 100%",
          transition: typeof progress === "number" ? "none" : undefined,
        }}
      >
        <img
          src={logoImg}
          alt=""
          draggable={false}
          className="absolute select-none pointer-events-none max-w-none"
          style={{
            width: `${scale}%`,
            height: "auto",
            left: offsetX,
            top: offsetYIcon,
          }}
        />
      </div>

      <style>{`
        @keyframes bib-bdrop {
          0%   { transform: translateY(-95%) scale(0.78); opacity: 0; }
          18%  { opacity: 1; }
          55%  { transform: translateY(0%)  scale(1);    }
          68%  { transform: translateY(-6%) scale(1.02); }
          80%  { transform: translateY(0%)  scale(0.99); }
          90%  { transform: translateY(-2%) scale(1);    }
          100% { transform: translateY(0%)  scale(1); opacity: 1; }
        }
        .bib-anim-bdrop {
          animation: bib-bdrop 1.6s cubic-bezier(0.34, 1.56, 0.4, 1) both;
          transform-origin: 50% 100%;
        }
        @media (prefers-reduced-motion: reduce) {
          .bib-anim-bdrop { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

export default BrandBoxLogo;