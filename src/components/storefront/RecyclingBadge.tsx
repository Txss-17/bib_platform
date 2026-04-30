import { Recycle, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecyclingBadgeProps {
  /** Points awarded when the customer recycles the packaging. Defaults to 10. */
  points?: number;
  /** Compact variant for product cards; full variant for product detail / hero zones. */
  variant?: "compact" | "full";
  className?: string;
  primaryColor?: string;
}

/**
 * Visual indicator that a boutique participates in the Brand-In-A-Box recycling
 * program. Used on product cards, category pages and storefront hero blocks to
 * surface environmental impact and the loyalty-points reward.
 */
export function RecyclingBadge({
  points = 10,
  variant = "compact",
  className,
  primaryColor,
}: RecyclingBadgeProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success",
          className,
        )}
        title={`Emballage recyclable — +${points} pts`}
      >
        <Recycle className="h-3 w-3" />
        <span>+{points} pts</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 p-3",
        className,
      )}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: primaryColor ? `${primaryColor}1a` : undefined }}
      >
        <Leaf className="h-4 w-4 text-success" />
      </div>
      <div className="flex-1 text-xs">
        <p className="font-semibold text-foreground">Emballage éco-responsable</p>
        <p className="mt-0.5 text-muted-foreground">
          Scannez l'étiquette après livraison pour recycler et gagner{" "}
          <span className="font-medium text-success">+{points} points</span> sur votre carte cadeau.
        </p>
      </div>
    </div>
  );
}
