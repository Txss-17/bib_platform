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

  // Official Brand-In-A-Box icon (box + gold B), cropped from the source asset.
  // Source asset is 1243x629; the icon area sits at x∈[18.6%, 41.2%], y∈[25.8%, 76.3%].
  // We render the full image inside a square viewport and offset it via background-position
  // so only the icon mark is visible — never recolored, never recreated.
  const Mark = (
    <span
      className="relative inline-block w-9 h-9 shrink-0"
      style={{
        backgroundImage: `url(${logoImg})`,
        // 1243/(1243*(0.412-0.186)) ≈ 444% width; 629/(629*(0.763-0.258)) ≈ 198% height
        backgroundSize: "444% 198%",
        // Position so the icon bbox is centered in our 36x36 viewport
        // x: left edge 18.6% → -18.6%/(0.412-0.186) of viewport width
        backgroundPosition: "-82.3% -51.1%",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden
    />
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