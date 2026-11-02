import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

type Option = { value: string; fr: string; en: string };
const ISSUES: Option[] = [
  { value: "fraud", fr: "Arnaques et vendeurs peu fiables", en: "Scams and unreliable sellers" },
  { value: "delivery", fr: "Retards et livraisons", en: "Delays and delivery" },
  { value: "quality", fr: "Qualité des produits", en: "Product quality" },
  { value: "returns", fr: "Retours et remboursements", en: "Returns and refunds" },
  { value: "trust", fr: "Manque de transparence", en: "Lack of transparency" },
  { value: "visibility", fr: "Visibilité des petits marchands", en: "Small merchants' visibility" },
  { value: "costs", fr: "Coûts trop élevés", en: "High costs" },
];
const SOLUTIONS: Option[] = [
  { value: "verified_suppliers", fr: "Fournisseurs vérifiés", en: "Verified suppliers" },
  { value: "secure_delivery", fr: "Livraison mieux encadrée", en: "More reliable delivery" },
  { value: "transparent_sav", fr: "SAV transparent", en: "Transparent after-sales support" },
  { value: "brand_tools", fr: "Créer ma marque", en: "Build my brand" },
  { value: "product_quality", fr: "Qualité contrôlée", en: "Checked product quality" },
  { value: "merchant_control", fr: "Autonomie des marchands", en: "Merchant independence" },
];
const TIMINGS: Option[] = [
  { value: "as_soon_as_possible", fr: "Dès que possible", en: "As soon as possible" },
  { value: "within_1_month", fr: "Dans le mois", en: "Within a month" },
  { value: "within_3_months", fr: "D'ici 3 mois", en: "Within 3 months" },
  { value: "within_6_months", fr: "D'ici 6 mois", en: "Within 6 months" },
  { value: "no_preference", fr: "Sans préférence", en: "No preference" },
];


function SurveyOptions({ options, values, onChange, en }: {
  options: Option[]; values: string[]; onChange: (value: string[]) => void; en: boolean;
}) {
  return <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
    {options.map(option => {
      const checked = values.includes(option.value);
      return <button type="button" key={option.value}
        role="checkbox" aria-checked={checked}
        onClick={() => onChange(checked ? values.filter(value => value !== option.value) : [...values, option.value])}
        className={`flex min-h-9 items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${checked ? "border-primary bg-primary/10 font-semibold text-foreground" : "border-border/70 text-muted-foreground hover:border-primary/40"}`}>
        <span aria-hidden="true" className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[11px] ${checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"}`}>{checked ? "✓" : ""}</span>
        {en ? option.en : option.fr}
      </button>;
    })}
  </div>;
}
function TimingOptions({ options, value, onChange, en }: {
  options: Option[]; value: string; onChange: (value: string) => void; en: boolean;
}) {
  return <div role="radiogroup" className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
    {options.map(option => <button key={option.value} type="button" role="radio"
      aria-checked={value === option.value} onClick={() => onChange(option.value)}
      className={`rounded-lg border px-3 py-2 text-left text-xs ${value === option.value ? "border-primary bg-primary/10 font-semibold" : "border-border/70 text-muted-foreground"}`}>
      {en ? option.en : option.fr}
    </button>)}
  </div>;
}

export function PrelaunchSurvey() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const tx = (fr: string, english: string) => en ? english : fr;
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);
  const [issues, setIssues] = useState<string[]>([]);
  const [solutions, setSolutions] = useState<string[]>([]);
  const [wantsToBeMerchant, setWantsToBeMerchant] = useState<boolean | null>(null);
  const [launchTiming, setLaunchTiming] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const dismiss = () => {
    setDismissed(true);
  };
  const canContinue = step === 0 ? issues.length > 0 : step === 1 ? solutions.length > 0 :
    wantsToBeMerchant !== null && (!wantsToBeMerchant || !!launchTiming);

  const submit = async () => {
    if (!consent || !issues.length || !solutions.length || wantsToBeMerchant === null ||
        (wantsToBeMerchant && !launchTiming) || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const { data, error: requestError } = await supabase.functions.invoke("submit-prelaunch-survey", {
        body: {
          challenge: issues[0], solution: solutions[0],
          challenge_selections: issues, solution_selections: solutions,
          consent: true, consent_notice_version: "prelaunch-v1",
          role: "exploring", // Interest in becoming a merchant does not mean they are already one.
          wants_to_be_merchant: wantsToBeMerchant,
          preferred_launch_timing: wantsToBeMerchant ? launchTiming : null,
          locale: en ? "en" : "fr",
        },
      });
      if (requestError || data?.ok !== true) throw requestError ?? new Error("survey_save_failed");
      setSubmitted(true);
      dismiss();
    } catch {
      setError(tx("Impossible d'enregistrer votre avis. Réessayez ou passez le sondage.",
        "We couldn't save your answer. Retry or skip."));
    } finally { setSubmitting(false); }
  };

  if (submitted) return (
    <div role="status" className="mx-auto mt-6 max-w-md rounded-xl border border-border/70 bg-card px-5 py-6 text-center">
      <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-primary" />
      <p className="text-base font-semibold">{tx("Merci pour votre avis !", "Thank you for your feedback!")}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {tx("Nous attendons votre retour sur BIB.", "We look forward to welcoming you back to BIB.")}
      </p>
    </div>
  );
  if (dismissed) return null;

  return (
    <aside aria-labelledby="prelaunch-survey-title" className="mx-auto mt-7 w-full max-w-md rounded-xl border border-border/80 bg-card p-4 text-left shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-accent-ink">
            {tx("Votre avis pour BIB", "Your feedback for BIB")} · {step + 1}/3
          </p>
          <h2 id="prelaunch-survey-title" className="mt-1 text-base font-semibold tracking-tight">
            {tx("Préparons le lancement de BIB", "Help prepare BIB's launch")}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {tx("Vous avez envisagé de rejoindre BIB : votre avis nous aidera à préparer son lancement.", "You considered joining BIB: your feedback will help us prepare its launch.")}
          </p>
        </div>
        <Button type="button" size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={dismiss}
          aria-label={tx("Ignorer le sondage", "Skip survey")}><X className="h-4 w-4" /></Button>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {[0,1,2].map(i => <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />)}
      </div>

      <div className="mt-4 min-h-[136px] space-y-3" key={step}>
        {step === 0 && <fieldset className="space-y-2.5">
          <legend className="text-sm font-semibold">
            {tx("Qu'est-ce qui nuit le plus à votre confiance dans l'e-commerce ?", "What most harms your trust in e-commerce?")}
          </legend>
          <p className="text-[11px] text-muted-foreground">{tx("Plusieurs réponses possibles", "You can select multiple answers")}</p>
          <SurveyOptions options={ISSUES} values={issues} onChange={setIssues} en={en} />
        </fieldset>}
        {step === 1 && <fieldset className="space-y-2.5">
          <legend className="text-sm font-semibold">
            {tx("Quelle solution BIB vous intéresse le plus ?", "Which BIB solution interests you most?")}
          </legend>
          <p className="text-[11px] text-muted-foreground">{tx("Plusieurs réponses possibles", "You can select multiple answers")}</p>
          <SurveyOptions options={SOLUTIONS} values={solutions} onChange={setSolutions} en={en} />
        </fieldset>}
        {step === 2 && <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">
            {tx("Souhaitez-vous devenir marchand BIB ?", "Would you like to become a BIB merchant?")}
          </legend>
          <div className="flex gap-2">
            {[true,false].map(value => <button type="button" key={String(value)}
              aria-pressed={wantsToBeMerchant === value}
              onClick={() => { setWantsToBeMerchant(value); if (!value) setLaunchTiming(""); }}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs ${wantsToBeMerchant === value ? "border-primary bg-primary/10 font-semibold" : "border-border/70 text-muted-foreground"}`}>
              {value ? tx("Oui", "Yes") : tx("Non", "No")}
            </button>)}
          </div>
          {wantsToBeMerchant === true && <div className="space-y-2">
            <p className="text-xs font-medium">{tx("Si oui, quand souhaiteriez-vous le lancement ?", "If yes, when would you like BIB to launch?")}</p>
            <TimingOptions options={TIMINGS} value={launchTiming} onChange={setLaunchTiming} en={en} />
          </div>}
        </fieldset>}
      </div>
      {step === 2 && <label className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
        <input type="checkbox" className="mt-1 h-3.5 w-3.5 shrink-0 accent-primary" checked={consent} onChange={event => setConsent(event.target.checked)} />
        <span>{tx("J'accepte que BIB utilise mes réponses pour préparer son lancement et analyser les besoins des futurs utilisateurs.",
          "I agree that BIB may use my answers to prepare its launch and understand future users' needs.")}{" "}
          <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="font-medium underline">{tx("Confidentialité", "Privacy notice")}</a>
        </span>
      </label>}
      {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
      <div className="mt-4 flex items-center justify-between gap-2">
        {step === 0 ? <Button type="button" variant="ghost" size="sm" onClick={dismiss} className="px-1 text-xs">
          {tx("Passer", "Skip")}
        </Button> : <Button type="button" variant="ghost" size="sm" onClick={() => { setError(""); setStep(old => old-1); }}
          className="gap-1 px-1 text-xs"><ArrowLeft className="h-3 w-3" />{tx("Retour", "Back")}</Button>}
        {step < 2 ? <Button type="button" size="sm" className="gap-1" disabled={!canContinue}
          onClick={() => { setError(""); setStep(old => old+1); }}>
          {tx("Valider", "Continue")} <ArrowRight className="h-3.5 w-3.5" />
        </Button> : <Button type="button" size="sm" className="gap-1" disabled={!canContinue || !consent || submitting} onClick={submit}>
          <Send className="h-3.5 w-3.5" />{submitting ? tx("Envoi…", "Sending…") : tx("Envoyer", "Submit")}
        </Button>}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        {tx("Aucun contact nécessaire.", "No contact details required.")}
      </p>
    </aside>
  );
}
