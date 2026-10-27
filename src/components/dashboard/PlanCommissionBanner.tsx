import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Receipt, TrendingDown } from "lucide-react";
import { useCurrentPlan } from "@/hooks/usePlans";
import { Button } from "@/components/ui/button";

/**
 * Slim banner shown at the top of the Sales page (and reusable elsewhere)
 * to remind the seller of the commission applied to every order, plus a
 * shortcut to upgrade for a lower rate.
 */
export function PlanCommissionBanner() {
  useLanguage();
  const { plan, tier } = useCurrentPlan();
  if (!plan) return null;

  const canUpgrade = tier !== "pro";

  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Receipt className="h-4 w-4 text-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            Plan <span className="text-foreground">{plan.name}</span> ·
            commission{" "}
            <span className="font-semibold">{plan.commission_percent}%</span>{" "}
            {translateUi("par vente")}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {translateUi(
              "Prélevée automatiquement sur chaque commande payée. Livraison EU incluse.",
            )}
          </p>
        </div>
      </div>
      {canUpgrade && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
        >
          <Link to="/tarifs">
            <TrendingDown className="h-3.5 w-3.5" />{" "}
            {translateUi("Réduire ma commission")}
          </Link>
        </Button>
      )}
    </div>
  );
}
