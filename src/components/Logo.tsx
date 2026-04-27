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

  const Mark = (
    <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden bg-primary shadow-sm shrink-0">
      <span className="absolute inset-0 bg-gradient-premium opacity-90" />
      <span className="relative font-display font-bold text-bib-gold text-lg leading-none">B</span>
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