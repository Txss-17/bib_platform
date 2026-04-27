import { useEffect, useRef, useState } from "react";

/**
 * Animated Brand-In-A-Box signature mark.
 * A gold "B" drops into the marine open box on mount and on scroll.
 * Colors are kept strictly separated:
 *  - Marine (--bib-marine) for the box silhouette
 *  - Gold (--bib-gold) for the B
 *  - Ivory background only
 * No mixed/blended gradients between marine and gold.
 */
interface BrandBoxLogoProps {
  size?: number;
  /** If true, replays the drop animation when the element scrolls into view. */
  replayOnScroll?: boolean;
  className?: string;
}

export function BrandBoxLogo({ size = 240, replayOnScroll = true, className = "" }: BrandBoxLogoProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    // Initial play after mount
    const t = window.setTimeout(() => setPlaying(true), 150);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!replayOnScroll || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Restart animation
            setPlaying(false);
            requestAnimationFrame(() => requestAnimationFrame(() => setPlaying(true)));
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [replayOnScroll]);

  return (
    <div
      ref={ref}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      aria-label="Brand-In-A-Box"
      role="img"
    >
      <svg
        viewBox="0 0 240 240"
        width="100%"
        height="100%"
        className="overflow-visible"
      >
        <defs>
          {/* Solid colors only — no marine/gold blend */}
          <linearGradient id="bib-gold-flat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(41 65% 60%)" />
            <stop offset="100%" stopColor="hsl(41 55% 48%)" />
          </linearGradient>
          <linearGradient id="bib-marine-flat" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(215 55% 18%)" />
            <stop offset="100%" stopColor="hsl(215 55% 12%)" />
          </linearGradient>
        </defs>

        {/* Soft ivory pedestal shadow */}
        <ellipse
          cx="120"
          cy="218"
          rx="78"
          ry="6"
          fill="hsl(215 45% 12%)"
          opacity="0.12"
        />

        {/* The falling B — animated */}
        <g
          className={playing ? "bib-anim-drop" : ""}
          style={{ transformOrigin: "120px 120px" }}
        >
          <text
            x="120"
            y="138"
            textAnchor="middle"
            fontFamily="'Playfair Display', Georgia, serif"
            fontWeight="700"
            fontSize="120"
            fill="url(#bib-gold-flat)"
          >
            B
          </text>
        </g>

        {/* Box back wall (behind B reveal) */}
        <path
          d="M 50 110 L 120 90 L 190 110 L 190 200 L 50 200 Z"
          fill="url(#bib-marine-flat)"
        />

        {/* Box front face — masks the B's lower half (the B "enters" the box) */}
        <path
          d="M 50 130 L 120 110 L 190 130 L 190 200 L 50 200 Z"
          fill="hsl(215 55% 14%)"
        />

        {/* Front face highlight band (gold strip — clearly separated, not blended) */}
        <rect x="98" y="170" width="44" height="14" rx="2" fill="hsl(41 55% 52%)" />
        <text
          x="120"
          y="181"
          textAnchor="middle"
          fontFamily="'Inter', sans-serif"
          fontWeight="700"
          fontSize="9"
          fill="hsl(215 55% 14%)"
          letterSpacing="1"
        >
          BIB
        </text>

        {/* Box lid flaps — open */}
        <g>
          {/* Left flap */}
          <path
            d="M 50 110 L 120 90 L 120 60 L 30 80 Z"
            fill="hsl(215 55% 12%)"
            className={playing ? "bib-anim-flap-left" : ""}
            style={{ transformOrigin: "50px 110px" }}
          />
          {/* Right flap */}
          <path
            d="M 190 110 L 120 90 L 120 60 L 210 80 Z"
            fill="hsl(215 55% 16%)"
            className={playing ? "bib-anim-flap-right" : ""}
            style={{ transformOrigin: "190px 110px" }}
          />
        </g>

        {/* Sparkle on landing */}
        <g className={playing ? "bib-anim-sparkle" : "opacity-0"}>
          <circle cx="120" cy="120" r="3" fill="hsl(41 70% 75%)" />
          <circle cx="95" cy="125" r="2" fill="hsl(41 70% 75%)" />
          <circle cx="145" cy="125" r="2" fill="hsl(41 70% 75%)" />
        </g>
      </svg>

      <style>{`
        @keyframes bib-drop {
          0%   { transform: translateY(-160px) rotate(-8deg); opacity: 0; }
          15%  { opacity: 1; }
          55%  { transform: translateY(0) rotate(0deg); }
          65%  { transform: translateY(-12px) rotate(2deg); }
          80%  { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes bib-flap-left {
          0%, 30% { transform: rotate(0deg); }
          60%     { transform: rotate(-12deg); }
          100%    { transform: rotate(0deg); }
        }
        @keyframes bib-flap-right {
          0%, 30% { transform: rotate(0deg); }
          60%     { transform: rotate(12deg); }
          100%    { transform: rotate(0deg); }
        }
        @keyframes bib-sparkle {
          0%, 55% { opacity: 0; transform: scale(0.6); }
          70%     { opacity: 1; transform: scale(1.2); }
          100%    { opacity: 0; transform: scale(1); }
        }
        .bib-anim-drop      { animation: bib-drop 1.6s cubic-bezier(0.5, 0, 0.2, 1) both; }
        .bib-anim-flap-left { animation: bib-flap-left 1.6s ease-in-out both; }
        .bib-anim-flap-right{ animation: bib-flap-right 1.6s ease-in-out both; }
        .bib-anim-sparkle   { animation: bib-sparkle 1.6s ease-out both; transform-origin: 120px 120px; }
        @media (prefers-reduced-motion: reduce) {
          .bib-anim-drop, .bib-anim-flap-left, .bib-anim-flap-right, .bib-anim-sparkle { animation: none; }
        }
      `}</style>
    </div>
  );
}

export default BrandBoxLogo;