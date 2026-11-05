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

const OFFERS = [
  ["STG-RD-01", "R&D et expérience utilisateur", "Product research and user experience", "product_engineering"],
  ["STG-MKT-01", "Marketing et étude de marché", "Marketing and market research", "communication"],
  ["STG-JUR-01", "Recherche juridique et conformité documentaire", "Legal research and document compliance", "quality_audit"],
  ["STG-FRN-01", "Relations et qualification fournisseurs", "Supplier relations and qualification", "marketplace"],
] as const;

const POLES = [
  ["product_engineering", "Produit et développement", "Product and development"],
  ["communication", "Marketing et communication", "Marketing and communications"],
  ["quality_audit", "Juridique et conformité documentaire", "Legal and documentation compliance"],
  ["marketplace", "Marchands et fournisseurs", "Merchants and suppliers"],
  ["operations", "Opérations et logistique", "Operations and logistics"],
  ["undecided", "À préciser", "To be discussed"],
] as const;

const stageToPole: Record<string, string> = Object.fromEntries(OFFERS.map(([code, , , pole]) => [code, pole]));

export function BibTalentApplicationForm({ initialStageCode = null }: { initialStageCode?: string | null }) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const tr = (fr: string, english: string) => en ? english : fr;
  const validInitial = OFFERS.some(([code]) => code === initialStageCode) ? initialStageCode : null;
  const [selectedOffer, setSelectedOffer] = useState<string>(validInitial ?? "spontaneous");
  const [desiredPeriod, setDesiredPeriod] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    location: "",
    current_activity: "",
    preferred_pole: validInitial ? stageToPole[validInitial] : "undecided",
    contribution_type: validInitial ? "internship" : "future_opportunities",
    skills: "",
    motivation: "",
    availability: "discuss",
    portfolio_url: "",
    linkedin_url: "",
    website: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [futureConsent, setFutureConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const isInternship = form.contribution_type === "internship";
  const update = (field: keyof typeof form, value: string) => setForm(old => ({ ...old, [field]: value }));
  const chooseOffer = (offer: string) => {
    setSelectedOffer(offer);
    setForm(old => ({
      ...old,
      preferred_pole: stageToPole[offer] ?? "undecided",
      contribution_type: offer === "spontaneous" ? "future_opportunities" : "internship",
    }));
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !consent || !form.preferred_pole) return;
    const reference = selectedOffer === "spontaneous" ? "Candidature spontanée" : `Offre ${selectedOffer}`;
    const period = desiredPeriod.trim() ? `Période souhaitée : ${desiredPeriod.trim()}` : "";
    // Keep the current RH intake schema: identify the selected offer and timing in
    // the motivation field so the protected intranet bridge receives both.
    const motivation = [reference, period, form.motivation.trim()].filter(Boolean).join(" — ");
    if (motivation.length > 1800) {
      setError(tr("Votre motivation est trop longue.", "Your motivation is too long."));
      return;
    }
    if (cvFile && (cvFile.size > 4 * 1024 * 1024 || !/\.(pdf|docx)$/i.test(cvFile.name))) {
      setError(tr("Le CV doit être un PDF ou DOCX de 4 Mo maximum.", "Your CV must be a PDF or DOCX of at most 4 MB."));
      return;
    }
    const payload = new FormData();
    payload.append("payload", JSON.stringify({
      ...form, motivation, locale: en ? "en" : "fr", consent,
      future_opportunities_consent: futureConsent,
    }));
    if (cvFile) payload.append("cv", cvFile, cvFile.name);
    setBusy(true);
    setError("");
    try {
      const { data, error: serverError } = await supabase.functions.invoke("submit-talent-application", {
        body: payload,
      });
      if (serverError || data?.ok !== true) throw serverError ?? new Error("talent_submission_failed");
      setDone(true);
    } catch {
      setError(tr("La candidature n'a pas pu être enregistrée. Vérifiez les informations saisies et réessayez.",
        "We could not submit your application. Check your details and try again."));
    } finally {
      setBusy(false);
    }
  }

  if (done) return <div role="status" className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
    <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
    <h3 className="text-xl font-semibold">{tr("Candidature reçue", "Application received")}</h3>
    <p className="mt-3 text-sm leading-7 text-muted-foreground">{tr(
      "Votre candidature a bien été transmise à l'équipe chargée des candidatures BIB.",
      "Your application has been forwarded to the BIB recruitment team."
    )}</p>
    <Button asChild variant="outline" className="mt-6"><Link to="/carrieres">{tr("Retour aux offres", "Back to opportunities")}</Link></Button>
  </div>;

  return <form onSubmit={submit} className="mx-auto max-w-3xl space-y-7 rounded-2xl border border-border bg-card p-5 text-left shadow-sm sm:p-8" aria-labelledby="career-form-heading">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.17em] text-accent-ink">{tr("Carrières BIB", "BIB Careers")}</p>
      <h3 id="career-form-heading" className="mt-2 font-display text-2xl font-semibold">{tr("Votre candidature", "Your application")}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{tr(
        "Aucun compte n'est nécessaire. Le dossier est traité par l'équipe chargée des candidatures et le pôle concerné.",
        "No account is required. The recruitment team and relevant department will review your submission."
      )}</p>
    </div>

    <fieldset className="space-y-4">
      <legend className="mb-4 text-base font-semibold">{tr("1. Offre souhaitée", "1. Selected opportunity")}</legend>
      <div className="space-y-2">
        <Label htmlFor="career-offer">{tr("Offre à laquelle vous postulez *", "Opportunity you are applying for *")}</Label>
        <Select value={selectedOffer} onValueChange={chooseOffer}>
          <SelectTrigger id="career-offer"><SelectValue /></SelectTrigger>
          <SelectContent>
            {OFFERS.map(([code, fr, english]) => <SelectItem key={code} value={code}>{code} — {tr(fr, english)}</SelectItem>)}
            <SelectItem value="spontaneous">{tr("Candidature spontanée", "General application")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {selectedOffer === "spontaneous" && <div className="space-y-2">
        <Label htmlFor="career-pole">{tr("Domaine qui vous intéresse *", "Area of interest *")}</Label>
        <Select value={form.preferred_pole} onValueChange={value => update("preferred_pole", value)}>
          <SelectTrigger id="career-pole"><SelectValue /></SelectTrigger>
          <SelectContent>{POLES.map(([key, fr, english]) => <SelectItem key={key} value={key}>{tr(fr, english)}</SelectItem>)}</SelectContent>
        </Select>
      </div>}
    </fieldset>

    <fieldset className="space-y-4">
      <legend className="mb-4 text-base font-semibold">{tr("2. Coordonnées", "2. Contact details")}</legend>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="career-name">{tr("Nom et prénom *", "Full name *")}</Label>
          <Input id="career-name" required autoComplete="name" minLength={2} maxLength={120} value={form.full_name} onChange={e => update("full_name", e.target.value)} />
        </div>
        <div className="space-y-2"><Label htmlFor="career-email">{tr("Adresse email *", "Email address *")}</Label>
          <Input id="career-email" required autoComplete="email" type="email" maxLength={254} value={form.email} onChange={e => update("email", e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2"><Label htmlFor="career-location">{tr("Ville / pays (facultatif)", "City / country (optional)")}</Label>
          <Input id="career-location" autoComplete="address-level2" maxLength={120} value={form.location} onChange={e => update("location", e.target.value)} />
        </div>
      </div>
    </fieldset>

    <fieldset className="space-y-4">
      <legend className="mb-4 text-base font-semibold">{tr("3. Votre parcours", "3. Your background")}</legend>
      <div className="space-y-2"><Label htmlFor="career-education">{tr("Formation actuelle et établissement (ou situation professionnelle) *", "Current course and institution (or professional status) *")}</Label>
        <Input id="career-education" required minLength={2} maxLength={160} placeholder={tr("Ex. BUT Informatique — IUT de ...", "e.g. Computer science — University of ...")} value={form.current_activity} onChange={e => update("current_activity", e.target.value)} />
      </div>
      <div className="space-y-2"><Label htmlFor="career-skills">{tr("Compétences et expériences utiles *", "Relevant skills and experience *")}</Label>
        <Textarea id="career-skills" required minLength={5} maxLength={1200} rows={3} value={form.skills} onChange={e => update("skills", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="career-cv">{tr("Joindre votre CV (facultatif)", "Attach your CV (optional)")}</Label>
        <Input id="career-cv" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => {
          const selected = e.target.files?.[0] ?? null;
          if (!selected) { setCvFile(null); return; }
          if (selected.size > 4 * 1024 * 1024 || !/\.(pdf|docx)$/i.test(selected.name)) {
            setCvFile(null);
            e.target.value = "";
            setError(tr("Choisissez un PDF ou DOCX de 4 Mo maximum.", "Choose a PDF or DOCX up to 4 MB."));
            return;
          }
          setError("");
          setCvFile(selected);
        }} />
        <p className="text-xs text-muted-foreground">{tr("PDF ou DOCX, 4 Mo maximum. Le fichier est transmis avec votre candidature et stocké dans un espace privé.", "PDF or DOCX, 4 MB maximum. Uploaded securely with your application and stored privately.")}</p>
        {cvFile && <p className="text-xs font-medium text-foreground">{tr("Fichier sélectionné :", "Selected file:")} {cvFile.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="career-linkedin">{tr("Lien vers votre profil LinkedIn (facultatif)", "LinkedIn profile URL (optional)")}</Label>
        <Input id="career-linkedin" type="url" placeholder="https://www.linkedin.com/in/..." maxLength={500} value={form.linkedin_url} onChange={e => update("linkedin_url", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="career-link">{tr("Autre lien vers un CV ou portfolio (facultatif, HTTPS)", "Another CV or portfolio link (optional, HTTPS)")}</Label>
        <Input id="career-link" type="url" placeholder="https://" maxLength={500} value={form.portfolio_url} onChange={e => update("portfolio_url", e.target.value)} />
      </div>
    </fieldset>

    <fieldset className="space-y-4">
      <legend className="mb-4 text-base font-semibold">{tr("4. Votre projet", "4. Your interests")}</legend>
      <div className="space-y-2"><Label htmlFor="career-period">{tr("Période envisagée (facultatif)", "Preferred dates (optional)")}</Label>
        <Input id="career-period" maxLength={120} placeholder={tr("Ex. mai à juin 2027", "e.g. May to June 2027")} value={desiredPeriod} onChange={e => setDesiredPeriod(e.target.value)} />
      </div>
      <div className="space-y-2"><Label htmlFor="career-motivation">{tr("Pourquoi cette opportunité vous intéresse-t-elle ? *", "Why are you interested in this opportunity? *")}</Label>
        <Textarea id="career-motivation" required minLength={20} maxLength={1400} rows={5} value={form.motivation} onChange={e => update("motivation", e.target.value)} />
      </div>
    </fieldset>

    <div className="hidden" aria-hidden="true">
      <Label htmlFor="career-website">Website</Label>
      <Input id="career-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => update("website", e.target.value)} />
    </div>
    <div className="space-y-3">
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
        <Checkbox checked={consent} onCheckedChange={checked => setConsent(checked === true)} aria-label={tr("Accepter le traitement de ma candidature", "Consent to application processing")} className="mt-1" />
        <span className="text-xs leading-6 text-muted-foreground">{tr(
          "J'accepte le traitement des informations transmises pour l'examen de ma candidature et les échanges liés à celle-ci.",
          "I agree to the processing of my information to review my application and communicate about it."
        )}{" "}<Link to="/talent/confidentialite" className="font-semibold text-accent-ink underline">{tr("Politique de confidentialité", "Privacy policy")}</Link>.</span>
      </label>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">
        <Checkbox checked={futureConsent} onCheckedChange={checked => setFutureConsent(checked === true)} aria-label={tr("Autoriser le contact pour de futures opportunités", "Allow contact for future opportunities")} className="mt-1" />
        <span className="text-xs leading-6 text-muted-foreground">{tr(
          "Facultatif : j'autorise BIB à conserver ma candidature pour me proposer d'autres opportunités. Je peux retirer cet accord à tout moment.",
          "Optional: I allow BIB to retain my application for other opportunities. I may withdraw this permission at any time."
        )}{" "}<Link to="/talent/confidentialite#conservation-candidatures" className="underline">{tr("Informations sur la conservation", "Retention information")}</Link>.</span>
      </label>
    </div>
    <p className="text-xs leading-6 text-muted-foreground">{isInternship
      ? tr("Pour tout stage, une convention et la validation de l'établissement sont nécessaires avant l'accueil.", "Any internship requires an agreement and approval from the educational institution.")
      : tr("L'envoi de votre candidature ne constitue pas une promesse d'embauche.", "Submitting an application does not guarantee employment.")}</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Button type="submit" disabled={busy || !consent || !form.preferred_pole} className="w-full gap-2 sm:w-auto">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {busy ? tr("Envoi…", "Sending…") : tr("Envoyer ma candidature", "Submit application")}
    </Button>
  </form>;
}
