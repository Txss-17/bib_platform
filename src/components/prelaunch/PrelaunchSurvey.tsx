import { useState } from "react";
import { CheckCircle2, MessageSquareQuote, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

type Answer = { value: string; fr: string; en: string };
const ISSUES: Answer[] = [
  { value: "fraud", fr: "Arnaques et vendeurs peu fiables", en: "Scams and unreliable sellers" },
  { value: "delivery", fr: "Retards et problèmes de livraison", en: "Delays and delivery problems" },
  { value: "quality", fr: "Qualité différente des annonces", en: "Products unlike their descriptions" },
  { value: "returns", fr: "Retours et remboursements compliqués", en: "Difficult returns and refunds" },
  { value: "trust", fr: "Manque de transparence et de confiance", en: "Lack of trust and transparency" },
  { value: "visibility", fr: "Manque de visibilité des petits marchands", en: "Low visibility for small sellers" },
  { value: "costs", fr: "Coûts et commissions élevés", en: "High costs and commissions" },
];
const SOLUTIONS: Answer[] = [
  { value: "verified_suppliers", fr: "Des fournisseurs vérifiés", en: "Verified suppliers" },
  { value: "secure_delivery", fr: "Une logistique mieux encadrée", en: "More reliable delivery" },
  { value: "transparent_sav", fr: "Un SAV et des retours transparents", en: "Transparent support and returns" },
  { value: "brand_tools", fr: "Créer facilement une vraie marque", en: "Tools for building a real brand" },
  { value: "product_quality", fr: "Des produits et échantillons contrôlés", en: "Better product and sample checks" },
  { value: "merchant_control", fr: "Plus d'autonomie pour les marchands", en: "More independence for merchants" },
];
const ROLES: Answer[] = [
  { value: "exploring", fr: "Je découvre le projet", en: "I'm exploring" },
  { value: "merchant", fr: "Je suis marchand(e)", en: "I'm a seller" },
  { value: "customer", fr: "J'achète en ligne", en: "I shop online" },
  { value: "both", fr: "Les deux", en: "Both" },
];
const STORAGE_KEY = "bib.prelaunch.survey.dismissed.v1";

export function PrelaunchSurvey() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const tx = (fr: string, english: string) => en ? english : fr;
  const [dismissed, setDismissed] = useState(() => {
    try { return typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY) === "yes"; }
    catch { return false; }
  });
  const [issue, setIssue] = useState("");
  const [solution, setSolution] = useState("");
  const [role, setRole] = useState("exploring");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const dismiss = () => {
    setDismissed(true);
    try { window.localStorage.setItem(STORAGE_KEY, "yes"); } catch { /* browser may block storage */ }
  };
  const submit = async () => {
    if (!issue || !solution || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const { data, error: requestError } = await supabase.functions.invoke("submit-prelaunch-survey", {
        body: { challenge: issue, solution, role, locale: en ? "en" : "fr" },
      });
      if (requestError || data?.ok !== true) throw requestError ?? new Error("survey_save_failed");
      setSubmitted(true);
      dismiss();
    } catch {
      setError(tx("Votre réponse n'a pas pu être enregistrée. Vous pouvez réessayer ou passer le sondage.",
        "Your answer could not be saved. Please retry or skip."));
    } finally {
      setSubmitting(false);
    }
  };
  if (submitted) {
    return <div role="status" className="mx-auto mt-10 max-w-xl rounded-2xl border border-border/70 bg-card p-6 text-center">
      <CheckCircle2 className="mx-auto mb-3 h-7 w-7 text-primary" />
      <p className="font-semibold">{tx("Merci d'avoir partagé votre avis.", "Thank you for your feedback.")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{tx("Votre réponse contribuera à orienter les priorités de BIB.", "Your feedback will help shape BIB's priorities.")}</p>
    </div>;
  }
  if (dismissed) return null;

  return (
    <aside aria-labelledby="prelaunch-survey-title" className="mx-auto mt-12 w-full max-w-2xl rounded-2xl border border-border/80 bg-card p-5 text-left shadow-sm sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent-ink">
            <MessageSquareQuote className="h-4 w-4" /> {tx("Votre regard sur l'e-commerce", "Your view of e-commerce")}
          </p>
          <h2 id="prelaunch-survey-title" className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {tx("Deux questions avant de partir ?", "Two quick questions before you go?")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {tx("Vous avez envisagé de rejoindre BIB : votre avis nous aidera à prioriser les problèmes à résoudre.",
              "You considered joining BIB. Your answers can help us focus on the most important problems.")}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" className="shrink-0" aria-label={tx("Ignorer le sondage", "Skip survey")} onClick={dismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <fieldset className="mt-6 space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          {tx("1. Qu'est-ce qui vous fait le plus perdre confiance dans l'e-commerce aujourd'hui ?",
            "1. What most undermines your trust in online commerce today?")}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {ISSUES.map(option => <button key={option.value} type="button" aria-pressed={issue === option.value}
            onClick={() => setIssue(option.value)}
            className={`rounded-xl border px-3 py-2.5 text-left text-xs leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${issue === option.value ? "border-primary bg-primary/10 font-semibold text-foreground" : "border-border/70 text-muted-foreground hover:border-primary/40"}`}>
            {en ? option.en : option.fr}
          </button>)}
        </div>
      </fieldset>

      <fieldset className="mt-6 space-y-3">
        <legend className="text-sm font-semibold text-foreground">
          {tx("2. Quelle solution proposée par BIB vous intéresse le plus ?",
            "2. Which BIB solution interests you the most?")}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SOLUTIONS.map(option => <button key={option.value} type="button" aria-pressed={solution === option.value}
            onClick={() => setSolution(option.value)}
            className={`rounded-xl border px-3 py-2.5 text-left text-xs leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${solution === option.value ? "border-primary bg-primary/10 font-semibold text-foreground" : "border-border/70 text-muted-foreground hover:border-primary/40"}`}>
            {en ? option.en : option.fr}
          </button>)}
        </div>
      </fieldset>
      <div className="mt-5">
        <p className="text-xs font-semibold">{tx("Votre profil (facultatif)", "Your profile (optional)")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ROLES.map(option => <button key={option.value} type="button" onClick={() => setRole(option.value)}
            aria-pressed={role === option.value}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${role === option.value ? "border-primary bg-primary/10 font-semibold" : "border-border/70 text-muted-foreground"}`}>
            {en ? option.en : option.fr}
          </button>)}
        </div>
      </div>

      {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" className="px-1 text-muted-foreground" onClick={dismiss}>
          {tx("Passer, sans répondre", "Skip without answering")}
        </Button>
        <Button type="button" className="gap-2" onClick={submit} disabled={!issue || !solution || submitting}>
          <Send className="h-4 w-4" />
          {submitting ? tx("Envoi…", "Submitting…") : tx("Envoyer mon avis", "Send my feedback")}
        </Button>
      </div>
      <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
        {tx("Facultatif, sans création de compte. Aucun nom ni email demandé. Une empreinte réseau temporaire limite les réponses répétées.",
          "Optional, no account needed. We don't ask for your name or email. A temporary network fingerprint limits repeated submissions.")}
      </p>
    </aside>
  );
}
