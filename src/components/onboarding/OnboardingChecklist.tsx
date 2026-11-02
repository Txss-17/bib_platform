import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, ListChecks, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateUi } from "@/lib/uiTranslation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";



/**
 * Contextual first-run assistance:
 * one relevant action instead of a mandatory walkthrough.
 * Completion comes from real boutique/profile/product data, not "Next" clicks.
 */
export function OnboardingChecklist() {
  useLanguage();
  const { user } = useAuth();
  const { steps, doneCount, totalCount, completionPct, allDone } = useOnboardingState();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);



  if (!user || allDone || dismissed || !totalCount) return null;
  const next = steps.find(step => !step.done);
  if (!next) return null;

  const dismiss = () => {
    setDismissed(true);
  };

  return (
    <section aria-label={translateUi("Votre prochaine action marchand")} className="mb-5 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ListChecks className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {translateUi("Votre prochaine action")} · {doneCount}/{totalCount}
            </p>
            <button type="button" onClick={dismiss} aria-label={translateUi("Masquer cette aide")} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-1 text-base font-semibold">{next.label}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{next.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button asChild size="sm" className="gap-1.5">
              <Link to={next.href}>{next.cta} <ChevronRight className="h-4 w-4" /></Link>
            </Button>
            <button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded}
              className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
              {expanded ? translateUi("Masquer les étapes") : translateUi("Voir toutes les étapes")}
            </button>
          </div>
        </div>
      </div>
      <Progress value={completionPct} className="mt-4 h-1" />
      {expanded && (
        <ul className="mt-3 space-y-1 border-t border-border/60 pt-3">
          {steps.map(step => <li key={step.key}>
            <Link to={step.href} className="flex items-center gap-2 rounded-md px-2 py-2 text-xs hover:bg-muted/50">
              {step.done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" /> :
                <span className="h-4 w-4 shrink-0 rounded-full border border-border" />}
              <span className={step.done ? "flex-1 text-muted-foreground" : "flex-1 font-medium"}>{step.label}</span>
              {!step.done && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
            </Link>
          </li>)}
        </ul>
      )}
    </section>
  );
}
