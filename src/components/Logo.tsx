import { Link } from "react-router-dom";
import logoImg from "@/assets/brand-in-a-box-logo.png";

// Source asset: 1243x629. Icon bbox measured from the official PNG:
// x∈[231,512] (≈22.6% wide), y∈[162,480] (≈50.5% tall). Aspect ≈ 281/318 ≈ 0.884.
// All values below are pure percentages so the crop is pixel-identical at any size.
const ICON_CROP = {
  fracW: 0.226, // (512-231)/1243
  fracH: 0.505, // (480-162)/629
  fracX: 0.186, // 231/1243
  fracY: 0.258, // 162/629
  ratio: 281 / 318, // displayed aspect ratio (≈ 0.884)
} as const;

export interface BrandIconProps {
  /** Pixel size of the icon's bounding box (height). Width follows the ratio. */
  size?: number;
  className?: string;
}

/**
 * Official Brand-In-A-Box icon (gold B inside marine box) cropped from the
 * uploaded reference PNG. Pure CSS percent-positioning → identical crop at
 * every size (36px on mobile, 72px on desktop, anything in between).
 */
export function BrandIcon({ size = 36, className = "" }: BrandIconProps) {
  // Width derived from displayed aspect ratio so the crop stays pixel-true.
  const width = Math.round(size * ICON_CROP.ratio);
  return (
    <span
      className={`relative inline-block overflow-hidden shrink-0 ${className}`}
      style={{ width, height: size }}
      aria-hidden
    >
      <img
        src={logoImg}
        alt=""
        draggable={false}
        className="absolute select-none pointer-events-none max-w-none"
        style={{
          width: `${100 / ICON_CROP.fracW}%`,
          height: "auto",
          left: `${-ICON_CROP.fracX * (100 / ICON_CROP.fracW)}%`,
          top: `${-ICON_CROP.fracY * (100 / ICON_CROP.fracW) * (629 / 1243)}%`,
        }}
      />
    </span>
  );
}

interface LogoProps {
  variant?: "full" | "compact" | "icon";
  className?: string;
  onLight?: boolean;
  asLink?: boolean;
  to?: string;
  /** Icon pixel size (height). Defaults to 36 on mobile, scales up via responsive prop. */
  iconSize?: number;
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
  iconSize = 36,
}: LogoProps) {
  const wordmarkColor = onLight ? "text-foreground" : "text-primary-foreground";
  const taglineColor = onLight ? "text-muted-foreground" : "text-primary-foreground/70";

  const Mark = <BrandIcon size={iconSize} />;

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