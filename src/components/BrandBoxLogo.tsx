import { useEffect, useRef, useState } from "react";
import logoImg from "@/assets/brand-in-a-box-logo.png";

/**
 * Brand-In-A-Box signature mark — uses the OFFICIAL uploaded logo image.
 * Animation: the gold "B" appears to drop INTO the marine open box.
 * We layer two clipped copies of the same logo image:
 *  - bottom layer: only the box (lower half), always visible
 *  - top layer: only the B (upper half), translates in from above on reveal
 * The brand logo is preserved 1:1 from the source asset — no recoloring,
 * no recreated SVG, no marine/gold blend.
 *
 * `variant`:
 *  - "icon": only the box-and-B mark (icon area)
 *  - "full": full uploaded asset including wordmark
 */
interface BrandBoxLogoProps {
  size?: number;
  replayOnScroll?: boolean;
  className?: string;
  variant?: "icon" | "full";
}

export function BrandBoxLogo({
  size = 240,
  replayOnScroll = true,
  className = "",
  variant = "full",
}: BrandBoxLogoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setPlaying(true), 200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!replayOnScroll || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPlaying(false);
            requestAnimationFrame(() =>
              requestAnimationFrame(() => setPlaying(true))
            );
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [replayOnScroll]);

  // Source asset is 1243 x 629 (≈ 1.976 ratio).
  // The icon (box + B) sits in the left ~38% of the image.
  // We split the icon vertically at ~46% to separate the B (top) from the box (bottom).
  const aspectFull = 1243 / 629; // full asset
  const width = variant === "full" ? size * aspectFull : size; // icon ≈ square
  const height = size;

  // For "icon" variant, we crop the source image to just the mark area.
  const iconClip = "inset(4% 62% 6% 18%)"; // top right bottom left
  const splitPct = 46;

  return (
    <div
      ref={ref}
      className={`relative inline-block ${className}`}
      style={{ width, height }}
      aria-label="Brand-In-A-Box"
      role="img"
    >
      {variant === "full" ? (
        <>
          {/* Full asset — bottom half (box + wordmark baseline) */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: `inset(${splitPct}% 0 0 0)`,
              WebkitClipPath: `inset(${splitPct}% 0 0 0)`,
            }}
          >
            <img
              src={logoImg}
              alt=""
              className="w-full h-full object-contain select-none pointer-events-none"
              draggable={false}
            />
          </div>
          {/* Full asset — top half (B + upper wordmark), drops in */}
          <div
            className={`absolute inset-0 ${playing ? "bib-anim-drop" : "opacity-0"}`}
            style={{
              clipPath: `inset(0 0 ${100 - splitPct}% 0)`,
              WebkitClipPath: `inset(0 0 ${100 - splitPct}% 0)`,
            }}
          >
            <img
              src={logoImg}
              alt="Brand-In-A-Box — Your brand. Ready to launch."
              className="w-full h-full object-contain select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </>
      ) : (
        <>
          {/* Icon-only — bottom (box) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(${splitPct}% 0 0 0)` }}
          >
            <img
              src={logoImg}
              alt=""
              className="absolute select-none pointer-events-none"
              style={{
                width: `${(1 / 0.2) * 100}%`,
                height: "auto",
                left: "-90%",
                top: "0%",
                clipPath: iconClip,
                WebkitClipPath: iconClip,
              }}
              draggable={false}
            />
          </div>
          {/* Icon-only — top (B) drops in */}
          <div
            className={`absolute inset-0 overflow-hidden ${
              playing ? "bib-anim-drop" : "opacity-0"
            }`}
            style={{ clipPath: `inset(0 0 ${100 - splitPct}% 0)` }}
          >
            <img
              src={logoImg}
              alt="Brand-In-A-Box"
              className="absolute select-none pointer-events-none"
              style={{
                width: `${(1 / 0.2) * 100}%`,
                height: "auto",
                left: "-90%",
                top: "0%",
                clipPath: iconClip,
                WebkitClipPath: iconClip,
              }}
              draggable={false}
            />
          </div>
        </>
      )}

      <style>{`
        @keyframes bib-drop {
          0%   { transform: translateY(-70%) rotate(-3deg); opacity: 0; }
          25%  { opacity: 1; }
          70%  { transform: translateY(0) rotate(0deg); }
          82%  { transform: translateY(-4%) rotate(1deg); }
          100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        }
        .bib-anim-drop { animation: bib-drop 1.4s cubic-bezier(0.5, 0, 0.2, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .bib-anim-drop { animation: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default BrandBoxLogo;
