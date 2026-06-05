import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Circle, ChevronRight, X, Sparkles, Bell, BellOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { Progress } from "@/components/ui/progress";
import { useOnboardingReminders } from "@/hooks/useOnboardingReminders";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DISMISS_KEY = "bib_onboarding_dismissed";

/**
 * OnboardingChecklist
 * Carte épinglée en haut du dashboard. Disparaît automatiquement à 100%
 * ou si l'utilisateur la ferme manuellement (état local persistant).
 * Étapes conditionnelles via useOnboardingState (KYC si business, marchés si multi-market).
 */
export function OnboardingChecklist() {
  const { steps, doneCount, totalCount, completionPct, allDone } = useOnboardingState();
  const { enabled: remindersEnabled, loading: remindersLoading, toggle: toggleReminders } =
    useOnboardingReminders();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState<boolean>(
    typeof window !== "undefined" && window.localStorage.getItem(DISMISS_KEY) === "1",
  );

  // Event-driven trigger: if at least one step is blocked, ping the
  // reminders function (rate-limited to once / 6h per browser).
  useEffect(() => {
    if (!user || remindersLoading || !remindersEnabled) return;
    if (allDone || totalCount === 0) return;
    const hasBlocked = steps.some((s) => !s.done);
    if (!hasBlocked) return;
    const key = `bib_reminder_event_${user.id}`;
    const last = Number(localStorage.getItem(key) || 0);
    if (Date.now() - last < 6 * 3600_000) return;
    localStorage.setItem(key, String(Date.now()));
    supabase.functions
      .invoke("onboarding-reminders", { body: { user_id: user.id, source: "event" } })
      .catch(() => {});
  }, [user, remindersLoading, remindersEnabled, steps, allDone, totalCount]);

  // Hide when complete or explicitly dismissed by the user.
  if (allDone || dismissed || totalCount === 0) return null;

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <section
      aria-label="Onboarding checklist"
      className="rounded-2xl border border-bib-gold/30 bg-card overflow-hidden mb-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-bib-gold/15 bg-bib-gold/[0.04]">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-bib-gold/15 text-bib-gold flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-semibold text-foreground">
              Démarrage — First 5 minutes
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {doneCount} / {totalCount} étapes terminées · {completionPct}%
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Masquer la checklist"
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-4 sm:px-5 pt-3">
        <Progress value={completionPct} className="h-1.5" />
      </div>

      {/* Steps */}
      <ul className="divide-y divide-border/40 px-1 py-2">
        {steps.map((step) => (
          <li key={step.key}>
            <Link
              to={step.href}
              className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg hover:bg-muted/40 transition-colors group ${
                step.done ? "opacity-70" : ""
              }`}
            >
              {step.done ? (
                <span className="w-7 h-7 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </span>
              ) : (
                <span className="w-7 h-7 rounded-full border-2 border-bib-gold/40 text-bib-gold flex items-center justify-center shrink-0">
                  <Circle className="w-3 h-3" />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    step.done ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{step.description}</p>
              </div>
              {!step.done && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 hidden sm:inline-flex h-8 text-xs gap-1 border-bib-gold/40 text-bib-marine hover:bg-bib-gold/10 hover:border-bib-gold/60"
                  asChild
                >
                  <span>
                    {step.cta} <ChevronRight className="w-3 h-3" />
                  </span>
                </Button>
              )}
              <ChevronRight className="w-4 h-4 text-muted-foreground sm:hidden shrink-0" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Reminder toggle */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border/40 bg-muted/20">
        <div className="flex items-start gap-2 min-w-0">
          {remindersEnabled ? (
            <Bell className="w-4 h-4 text-bib-gold mt-0.5 shrink-0" />
          ) : (
            <BellOff className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">Relances automatiques</p>
            <p className="text-xs text-muted-foreground">
              E-mail si une étape reste bloquée. Personnalisez délais, modèle et journal.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/dashboard/parametres/relances">
            <Button variant="ghost" size="sm" className="gap-1 h-8 px-2 text-xs">
              <Settings className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Réglages</span>
            </Button>
          </Link>
          <Switch
            checked={remindersEnabled}
            disabled={remindersLoading}
            onCheckedChange={toggleReminders}
            aria-label="Activer les relances onboarding par e-mail"
          />
        </div>
      </div>
    </section>
  );
}