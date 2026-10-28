import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
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
  useLanguage();
  // The asset is the standalone icon (≈36×37), shown whole without cropping.
  return (
    <img
      src={logoImg}
      alt=""
      aria-hidden
      draggable={false}
      className={`inline-block shrink-0 select-none object-contain ${className}`}
      style={{ height: size, width: "auto" }}
    />
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
  useLanguage();
  const wordmarkColor = onLight ? "text-foreground" : "text-bib-ivory";
  const taglineColor = onLight ? "text-muted-foreground" : "text-bib-ivory/70";

  const Mark = <BrandIcon size={iconSize} />;

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {Mark}
      {variant !== "icon" && (
        <span className="flex flex-col leading-none">
          <span
            className={`font-display font-bold text-base sm:text-lg tracking-tight ${wordmarkColor}`}
          >
            Brand<span className="text-bib-gold">-In-A-</span>Box
          </span>
          {variant === "full" && (
            <span
              className={`text-[10px] uppercase tracking-[0.18em] mt-0.5 ${taglineColor}`}
            >
              {translateUi("Your brand. Ready to launch.")}
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link to={to} aria-label="Brand-In-A-Box">
      {content}
    </Link>
  );
}

/** Raw logo image (uploaded reference asset). Use for splash / login side panels. */
export function LogoImage({ className = "" }: { className?: string }) {
  useLanguage();
  return (
    <img
      src={logoImg}
      alt="Brand-In-A-Box"
      className={className}
      loading="lazy"
    />
  );
}

export default Logo;
