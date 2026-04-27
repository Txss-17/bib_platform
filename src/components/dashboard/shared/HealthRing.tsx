import { cn } from "@/lib/utils";

interface HealthRingProps {
  score: number;
  level?: "excellent" | "good" | "fair" | "poor";
  size?: number;
  strokeWidth?: number;
  className?: string;
  loading?: boolean;
}

/**
 * Reusable circular health-score ring. Marine track + gold/destructive
 * progress, with the score typeset in Playfair display.
 */
export function HealthRing({
  score,
  level = "good",
  size = 64,
  strokeWidth = 6,
  className,
  loading,
}: HealthRingProps) {
  const radius = (50 - strokeWidth) ;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, score));
  const offset = circumference - (safeScore / 100) * circumference;

  const ringColor =
    level === "poor"
      ? "hsl(var(--destructive))"
      : level === "fair"
        ? "hsl(var(--secondary))"
        : "hsl(var(--secondary))";

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={loading ? circumference : offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display font-bold text-foreground leading-none"
          style={{ fontSize: Math.max(12, size * 0.32) }}
        >
          {loading ? "—" : safeScore}
        </span>
      </div>
    </div>
  );
}