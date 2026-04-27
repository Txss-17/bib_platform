import { Link } from "react-router-dom";
import logoImg from "@/assets/brand-in-a-box-logo.png";

interface LogoProps {
  variant?: "full" | "compact" | "icon";
  className?: string;
  onLight?: boolean;
  asLink?: boolean;
  to?: string;
}

/**
 * Brand-In-A-Box reusable logo.
 * - "full": icon + wordmark + tagline
 * - "compact": icon + wordmark (default)
 * - "icon": icon only
 */
export function Logo({
  variant = "compact",
  className = "",
  onLight = true,
  asLink = true,
  to = "/",
}: LogoProps) {
  const wordmarkColor = onLight ? "text-foreground" : "text-primary-foreground";
  const taglineColor = onLight ? "text-muted-foreground" : "text-primary-foreground/70";

  // Official Brand-In-A-Box icon (box + gold B) extracted from the uploaded asset.
  // Source asset: 1243x629. Icon bbox: x∈[231,512] (≈22.6% wide), y∈[162,480] (≈50.5% tall).
  // We mount the full image scaled so the icon area exactly fills the square viewport,
  // then translate it so the bbox aligns with (0,0). No recolor, no recreated B.
  // Icon aspect ratio ≈ 281/318 ≈ 0.88 → we use a square viewport with object-cover-like crop.
  const Mark = (
    <span className="relative inline-block w-9 h-9 shrink-0 overflow-hidden">
      <img
        src={logoImg}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute select-none pointer-events-none max-w-none"
        style={{
          // viewport is 36px wide, icon crop is 22.6% of source → scale source to 36/0.226 ≈ 159px wide
          // Express in % of the viewport so it stays responsive to font-size based sizing.
          width: `${100 / 0.226}%`, // ≈ 442%
          height: "auto",
          // shift left so icon bbox left edge (18.6% of source) aligns to viewport x=0
          left: `${-0.186 * (100 / 0.226)}%`, // ≈ -82.3%
          // shift up so icon bbox top (25.8% of source) aligns to viewport y=0
          // image rendered height = width × (629/1243) = 442% × 0.506 ≈ 224% of viewport width = 224% of 36px ≈ 80.6px
          // top offset in px = -0.258 × 80.6 ≈ -20.8px ≈ -57.7% of viewport height (36px)
          top: `${-0.258 * (100 / 0.226) * (629 / 1243)}%`, // ≈ -57.7%
        }}
      />
    </span>
  );

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {Mark}
      {variant !== "icon" && (
        <span className="flex flex-col leading-none">
          <span className={`font-display font-bold text-base sm:text-lg tracking-tight ${wordmarkColor}`}>
            Brand<span className="text-bib-gold">-In-A-</span>Box
          </span>
          {variant === "full" && (
            <span className={`text-[10px] uppercase tracking-[0.18em] mt-0.5 ${taglineColor}`}>
              Your brand. Ready to launch.
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!asLink) return content;
  return <Link to={to} aria-label="Brand-In-A-Box">{content}</Link>;
}

/** Raw logo image (uploaded reference asset). Use for splash / login side panels. */
export function LogoImage({ className = "" }: { className?: string }) {
  return <img src={logoImg} alt="Brand-In-A-Box" className={className} loading="lazy" />;
}

export default Logo;