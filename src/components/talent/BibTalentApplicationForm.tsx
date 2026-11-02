import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const POLES = [
  ["product_engineering", "Product Engineering — produit et développement", "Product Engineering — product & development"],
  ["marketplace", "Marketplace — marchands et fournisseurs", "Marketplace — merchants & suppliers"],
  ["communication", "Communication et création", "Communications & creative"],
  ["operations", "Opérations et logistique", "Operations & logistics"],
  ["quality_audit", "Qualité, audit et conformité", "Quality, audit & compliance"],
  ["undecided", "À définir ensemble", "Help me choose"],
] as const;
const TYPES = [
  ["volunteer", "Contribution volontaire", "Voluntary contribution"],
  ["internship", "Stage (si une possibilité s'ouvre)", "Internship (if available)"],
  ["future_opportunities", "Futures opportunités", "Future opportunities"],
  ["explore", "Premier échange", "Initial conversation"],
] as const;
const AVAILABILITY = [
  ["few_hours", "Quelques heures par semaine", "A few hours per week"],
  ["part_time", "Disponibilité régulière", "Regular part-time availability"],
  ["flexible", "Flexible", "Flexible"],
  ["discuss", "À discuter", "To discuss"],
] as const;

export function BibTalentApplicationForm() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const tr = (fr: string, english: string) => en ? english : fr;
  const [form, setForm] = useState({
    full_name: "", email: "", location: "", current_activity: "",
    preferred_pole: "", contribution_type: "explore",
    skills: "", motivation: "", availability: "discuss", portfolio_url: "", website: "",
  });
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const update = (field: keyof typeof form, value: string) => setForm(old => ({ ...old, [field]: value }));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !consent || !form.preferred_pole) return;
    setBusy(true);
    setError("");
    try {
      const { data, error: serverError } = await supabase.functions.invoke("submit-talent-application", {
        body: { ...form, locale: en ? "en" : "fr", consent },
      });
      if (serverError || data?.ok !== true) throw serverError ?? new Error("talent_submission_failed");
      setDone(true);
    } catch {
      setError(tr("La candidature n'a pas pu être enregistrée. Vérifiez vos réponses ou réessayez.",
        "We could not submit your application. Please check the form or try again."));
    } finally {
      setBusy(false);
    }
  }
  if (done) return <div role="status" className="mx-auto max-w-2xl rounded-3xl border border-primary/20 bg-card p-8 text-center">
    <CheckCircle2 className="mx-auto mb-4 h-11 w-11 text-primary" />
    <h2 className="text-2xl font-semibold">{tr("Merci pour votre intérêt !", "Thank you for your interest!")}</h2>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">
      {tr("Votre manifestation d'intérêt a été enregistrée et orientée vers le domaine concerné. L'équipe BIB examinera votre dossier ; cela ne constitue pas une promesse de collaboration ou de réponse dans un délai précis.",
        "Your interest has been received and routed to the relevant team. BIB may review it; this does not guarantee an opportunity or a reply within a specific time.")}
    </p>
    <Button asChild variant="outline" className="mt-6"><Link to="/">{tr("Retour à l'accueil", "Back to homepage")}</Link></Button>
  </div>;

  return <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-border bg-card p-5 text-left shadow-sm sm:p-8" aria-labelledby="talent-form-heading">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-ink">BIB Talent</p>
      <h2 id="talent-form-heading" className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
        {tr("Exprimer mon intérêt", "Express my interest")}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {tr("Aucun compte nécessaire. Votre dossier sera orienté vers la coordination Talent et le pôle concerné ; il ne sera pas publié.",
          "No account required. Your submission will be handled by Talent coordination and the relevant team; it won't be made public.")}
      </p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="talent-name">{tr("Nom et prénom *", "Full name *")}</Label>
        <Input id="talent-name" required minLength={2} maxLength={120} value={form.full_name} autoComplete="name" onChange={e => update("full_name",e.target.value)} />
      </div>
      <div className="space-y-2"><Label htmlFor="talent-email">{tr("Adresse email *", "Email address *")}</Label>
        <Input id="talent-email" type="email" required maxLength={254} autoComplete="email" value={form.email} onChange={e => update("email",e.target.value)} />
      </div>
      <div className="space-y-2"><Label htmlFor="talent-location">{tr("Ville / pays (facultatif)", "City / country (optional)")}</Label>
        <Input id="talent-location" maxLength={120} autoComplete="address-level2" value={form.location} onChange={e => update("location",e.target.value)} />
      </div>
      <div className="space-y-2"><Label htmlFor="talent-activity">{tr("Votre situation actuelle *", "Current activity *")}</Label>
        <Input id="talent-activity" required minLength={2} maxLength={160} placeholder={tr("Étudiant, professionnel, en reconversion…", "Student, professional, career change…")} value={form.current_activity} onChange={e => update("current_activity",e.target.value)} />
      </div>
      <div className="space-y-2"><Label htmlFor="talent-pole">{tr("Domaine qui vous intéresse *", "Area of interest *")}</Label>
        <Select value={form.preferred_pole} onValueChange={value => update("preferred_pole",value)}>
          <SelectTrigger id="talent-pole"><SelectValue placeholder={tr("Choisir un domaine", "Choose an area")} /></SelectTrigger>
          <SelectContent>{POLES.map(([key,fr,english]) => <SelectItem key={key} value={key}>{tr(fr,english)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label htmlFor="talent-type">{tr("Type de contribution", "Type of interest")}</Label>
        <Select value={form.contribution_type} onValueChange={value => update("contribution_type",value)}>
          <SelectTrigger id="talent-type"><SelectValue /></SelectTrigger>
          <SelectContent>{TYPES.map(([key,fr,english]) => <SelectItem key={key} value={key}>{tr(fr,english)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="talent-skills">{tr("Compétences, expériences ou centres d'intérêt *", "Skills, experience or interests *")}</Label>
        <Textarea id="talent-skills" required minLength={5} maxLength={1200} rows={3} value={form.skills} onChange={e => update("skills",e.target.value)} />
      </div>
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="talent-motivation">{tr("Pourquoi souhaitez-vous contribuer à BIB ? *", "Why would you like to contribute to BIB? *")}</Label>
        <Textarea id="talent-motivation" required minLength={20} maxLength={1800} rows={4} value={form.motivation} onChange={e => update("motivation",e.target.value)} />
      </div>
      <div className="space-y-2"><Label htmlFor="talent-availability">{tr("Disponibilité", "Availability")}</Label>
        <Select value={form.availability} onValueChange={value => update("availability",value)}>
          <SelectTrigger id="talent-availability"><SelectValue /></SelectTrigger>
          <SelectContent>{AVAILABILITY.map(([key,fr,english]) => <SelectItem key={key} value={key}>{tr(fr,english)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label htmlFor="talent-link">{tr("Lien LinkedIn ou portfolio (facultatif, HTTPS)", "LinkedIn or portfolio URL (optional, HTTPS)")}</Label>
        <Input id="talent-link" type="url" maxLength={500} placeholder="https://" value={form.portfolio_url} onChange={e => update("portfolio_url",e.target.value)} />
      </div>
    </div>
    <div className="hidden" aria-hidden="true">
      <Label htmlFor="talent-website">Website</Label>
      <Input id="talent-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => update("website",e.target.value)} />
    </div>
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4">
      <Checkbox checked={consent} onCheckedChange={checked => setConsent(checked === true)} aria-label={tr("Accepter le traitement de ma candidature", "Consent to application processing")} className="mt-1" />
      <span className="text-xs leading-6 text-muted-foreground">
        {tr("J'accepte que BIB utilise les informations fournies pour étudier ma manifestation d'intérêt et me contacter si nécessaire. Durée de conservation maximale prévue : 180 jours.",
          "I consent to BIB processing this information to review my interest and contact me if needed. Planned maximum retention: 180 days.")}
        {" "}<Link to="/talent/confidentialite" className="font-semibold text-accent-ink underline">{tr("Politique de confidentialité", "Privacy policy")}</Link>.
      </span>
    </label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <p className="text-xs text-muted-foreground">{tr("Cette démarche n'est pas une candidature à un poste ouvert ni une promesse d'embauche.", "This is not an application for a confirmed opening or a hiring guarantee.")}</p>
      <Button type="submit" disabled={busy || !consent || !form.preferred_pole} className="w-full gap-2 sm:w-auto">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {busy ? tr("Envoi…", "Sending…") : tr("Envoyer mon intérêt", "Submit interest")}
      </Button>
    </div>
  </form>;
}
