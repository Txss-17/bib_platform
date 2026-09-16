import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visual badge for a boutique URL.
 * Displays `nom-boutique.brand-in-a-box.space` with the boutique slug bold,
 * but the underlying click still targets the real route `/boutique/:slug`
 * (no wildcard DNS required — pure presentation layer).
 */
export function BoutiqueUrlBadge({
  slug,
  size = "sm",
  className,
}: {
  slug: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const textSize = size === "xs" ? "text-[10px]" : size === "md" ? "text-sm" : "text-xs";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 font-mono text-muted-foreground",
        textSize,
        className,
      )}
      title={`URL publique de votre boutique : ${slug}.brand-in-a-box.space`}
    >
      <Globe className="h-3 w-3 shrink-0" aria-hidden />
      <span className="truncate">
        <strong className="font-semibold text-foreground">{slug}</strong>
        <span>.brand-in-a-box.space</span>
      </span>
    </span>
  );
}