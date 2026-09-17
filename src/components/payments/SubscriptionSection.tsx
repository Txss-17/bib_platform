import { useState } from "react";
import { Crown, Check, Sparkles, ShieldCheck, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePlans, useCurrentPlan, type PlanTier } from "@/hooks/usePlans";
import { useUserSubscriptions, useOpenBillingPortal } from "@/hooks/useSubscriptions";
import { useAuth } from "@/contexts/AuthContext";
import { StripeEmbeddedCheckout } from "@/components/payments/StripeEmbeddedCheckout";
import { cn } from "@/lib/utils";

/**
 * Real-data subscription manager: shows current plan, allows upgrade/downgrade,
 * shows the insurance add-on status, and opens the Stripe portal for management.
 */
export function SubscriptionSection() {const { user } = useAuth();

const { data: plans = [] } = usePlans();

const {
  plan: currentPlan,
  tier,
  billingCycle,
  insuranceAddonEnabled,
} = useCurrentPlan();

const { data: subscriptions = [] } = useUserSubscriptions();

const billingPortal = useOpenBillingPortal();

const [annual, setAnnual] = useState(
  billingCycle === "annual",
);

const [checkoutPriceId, setCheckoutPriceId] = useState<
  string | null
>(null);

const sortedPlans = [...plans].sort(
  (a, b) => a.sort_order - b.sort_order,
);

const insuranceSubscription = subscriptions.find(
  (subscription) =>
    subscription.price_id.startsWith("insurance_") &&
    ["active", "trialing"].includes(subscription.status),
);

function subscribe(tier: PlanTier) {
  const cycle = annual ? "yearly" : "monthly";

  setCheckoutPriceId(`${tier}_${cycle}`);
}

function subscribeInsurance() {
  const cycle = annual ? "yearly" : "monthly";

  setCheckoutPriceId(`insurance_${tier}_${cycle}`);
}

return (
  <div className="space-y-6">
    {/* Current plan */}
    <div className="rounded-2xl border border-bib-gold/30 bg-bib-gold/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-bib-gold/15 flex items-center justify-center shrink-0">
          <Crown className="h-5 w-5 text-bib-gold" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-display text-lg font-semibold text-foreground capitalize">
              Plan {tier}
            </p>

            <Badge
              variant="outline"
              className="text-[10px]"
            >
              {billingCycle === "annual"
                ? "Annuel"
                : "Mensuel"}
            </Badge>

            {insuranceAddonEnabled && (
              <Badge className="bg-info/15 text-info hover:bg-info/15 text-[10px] gap-1">
                <ShieldCheck className="h-3 w-3" />
                Assurance active
              </Badge>
            )}
          </div>

          {currentPlan && (
            <p className="text-xs text-muted-foreground">
              Commission {currentPlan.commission_percent}% ·
              jusqu'à {currentPlan.max_boutiques} boutique
              {currentPlan.max_boutiques > 1 ? "s" : ""} ·{" "}
              {currentPlan.max_products
                ? `${currentPlan.max_products} produits`
                : "produits illimités"}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => billingPortal.mutate()}
          disabled={
            billingPortal.isPending ||
            subscriptions.length === 0
          }
        >
          {billingPortal.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" />
          )}

          <span className="ml-1.5">
            Gérer ma facturation
          </span>
        </Button>
      </div>
    </div>

    {/* Billing cycle */}
    <div className="flex items-center justify-center gap-3 rounded-full border border-border bg-card px-4 py-2 w-fit mx-auto">
      <span
        className={cn(
          "text-sm font-medium",
          !annual
            ? "text-foreground"
            : "text-muted-foreground",
        )}
      >
        Mensuel
      </span>

      <Switch
        checked={annual}
        onCheckedChange={setAnnual}
        aria-label="Cycle annuel"
      />

      <span
        className={cn(
          "text-sm font-medium flex items-center gap-1.5",
          annual
            ? "text-foreground"
            : "text-muted-foreground",
        )}
      >
        Annuel

        <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0">
          −20%
        </Badge>
      </span>
    </div>

    {/* Subscription plans */}
    <div className="grid gap-4 md:grid-cols-3">
      {sortedPlans.map((plan) => {
        const isCurrent = plan.tier === tier;

        const price = annual
          ? plan.annual_monthly_price_eur
          : plan.monthly_price_eur;

        const featured = plan.tier === "growth";

        return (
          <div
            key={plan.id}
            className={cn(
              "relative rounded-2xl border p-4 flex flex-col bg-card",
              isCurrent
                ? "border-bib-gold ring-2 ring-bib-gold/30"
                : "border-border",
              !isCurrent &&
                featured &&
                "border-bib-gold/40",
            )}
          >
            {isCurrent && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-bib-gold text-bib-marine text-[10px]">
                Actuel
              </Badge>
            )}

            <h4 className="font-display font-semibold text-foreground">
              {plan.name}
            </h4>

            <p className="text-2xl font-bold text-foreground mt-2">
              {price}€
              <span className="text-xs text-muted-foreground font-normal">
                /mois
              </span>
            </p>

            <p className="text-[11px] text-muted-foreground mb-3">
              Commission {plan.commission_percent}%
            </p>

            <ul className="space-y-1.5 text-xs text-foreground/80 flex-1 mb-3">
              {plan.features.slice(0, 4).map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-1.5"
                >
                  <Check className="h-3 w-3 text-success shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              size="sm"
              variant={isCurrent ? "outline" : "coral"}
              disabled={isCurrent}
              onClick={() => subscribe(plan.tier)}
              className="w-full"
            >
              {isCurrent
                ? "Plan actuel"
                : `Passer à ${plan.name}`}
            </Button>
          </div>
        );
      })}
    </div>

    {/* Insurance add-on */}
    {currentPlan && (
      <div className="rounded-2xl border border-info/30 bg-info/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-info/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-info" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-display font-semibold text-foreground">
                Add-on Assurance
              </p>

              {insuranceAddonEnabled ? (
                <Badge className="bg-success/15 text-success hover:bg-success/15 text-[10px]">
                  Active
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px]"
                >
                  Non active
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Couverture jusqu'à{" "}
              <strong>
                {currentPlan.insurance_per_dispute_cap_eur}€/litige
              </strong>
              {currentPlan.insurance_max_disputes_per_month
                ? `, ${currentPlan.insurance_max_disputes_per_month} litiges/mois`
                : ", litiges illimités"}
              . Médiation prise en charge sous 48h.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-lg font-bold text-foreground">
                +{currentPlan.insurance_addon_price_eur}€
                <span className="text-xs text-muted-foreground font-normal">
                  /mois
                </span>
              </p>

              {insuranceAddonEnabled ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => billingPortal.mutate()}
                  disabled={billingPortal.isPending}
                >
                  Gérer / annuler
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="coral"
                  onClick={subscribeInsurance}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Activer l'assurance
                </Button>
              )}
            </div>

            {insuranceSubscription?.cancel_at_period_end && (
              <p className="text-[11px] text-warning mt-2">
                Annulation programmée le{" "}
                {insuranceSubscription.current_period_end
                  ? new Date(
                      insuranceSubscription.current_period_end,
                    ).toLocaleDateString("fr-FR")
                  : "—"}
              </p>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Subscription checkout */}
    <Dialog
      open={!!checkoutPriceId}
      onOpenChange={(open) => {
        if (!open) {
          setCheckoutPriceId(null);
        }
      }}
    >
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-2">
          <DialogTitle>
            Finaliser votre abonnement
          </DialogTitle>
        </DialogHeader>

        {checkoutPriceId && user && (
          <div className="px-2 pb-2">
            <StripeEmbeddedCheckout
              priceId={checkoutPriceId}
              userId={user.id}
              customerEmail={user.email ?? undefined}
              returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  </div>
);}