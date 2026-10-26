import { Recycle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
interface RecyclingBadgeProps {
  points?: number;
  variant?: "compact" | "full";
  className?: string;
  primaryColor?: string;
}
/** Discovery notice; no unverified recycling or reward claim. */
export function RecyclingBadge({
  variant = "compact",
  className,
}: RecyclingBadgeProps) {
  const { lang } = useLanguage();
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-muted/40 text-muted-foreground",
        variant === "full" ? "p-3 text-xs" : "px-2 py-1 text-[10px]",
        className,
      )}
    >
      <Recycle className="h-3.5 w-3.5 shrink-0" />
      <span>
        {lang === "en"
          ? "B.I.B Circular · In preparation"
          : "B.I.B Circular · En préparation"}
      </span>
    </div>
  );
}
