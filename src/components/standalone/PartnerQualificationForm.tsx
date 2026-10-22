import { useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle2, Info, Loader2, Lock, Send, ShieldAlert } from "lucide-react";

export interface QualSelectField {
  type: "select";
  id: string;
  label: string;
  required?: boolean;
  options: { value: string; label: string }[];
  hint?: string;
}

export interface QualBlocker {
  id: string;
  title: string;
  text: string;
}

interface PartnerQualificationFormProps {
  portal: "suppliers" | "ops";
  /** Operational dropdowns shown in step 1 (after identity). */
  fields: QualSelectField[];
  /** Non-negotiable acceptance toggles. Refusing any disables submit. */
  blockers: QualBlocker[];
  accentTokenClass: string; // e.g. "bg-primary text-primary-foreground"
}

const identitySchema = (english: boolean) => z.object({
  company: z.string().trim().min(2, english ? "Company name is required" : "Nom de société requis").max(120),
  contact_name: z.string().trim().min(2, english ? "Contact name is required" : "Nom du contact requis").max(120),
  email: z.string().trim().email(english ? "Invalid email" : "Email invalide").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().max(255).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

const englishQualificationCopy: Record<string, string> = {
  "Pays de production": "Country of production",
  "Type de structure": "Business type",
  "MOQ minimum par référence": "Minimum MOQ per product",
  "Quantité minimale généralement demandée pour une référence": "Minimum quantity usually required per product",
  "Moins de 50 unités": "Fewer than 50 units",
  "Moins de 1 000 unités": "Fewer than 1,000 units",
  "Plus de 1 000 unités": "More than 1,000 units",
  "Plus de 20 000 unités": "More than 20,000 units",
  "Capacité mensuelle disponible": "Available monthly capacity",
  "Moins de 1 000 unités / mois": "Fewer than 1,000 units / month",
  "1 000 – 5 000 unités / mois": "1,000–5,000 units / month",
  "5 000 – 20 000 unités / mois": "5,000–20,000 units / month",
  "Délai moyen de production": "Average production lead time",
  "De la validation de la commande à la mise à disposition pour expédition": "From order approval to ready for dispatch",
  "Moins de 10 jours": "Fewer than 10 days",
  "Plus de 90 jours": "More than 90 days",
  "Délai habituel d'expédition vers l'UE": "Usual shipping time to the EU",
  "Délai de transport ou de mise à disposition après production": "Transit or handover time after production",
  "Moins de 7 jours": "Fewer than 7 days",
  "Plus de 30 jours": "More than 30 days",
  "Traçabilité des expéditions": "Shipment tracking",
  "Oui, avec suivi complet": "Yes, with full tracking",
  "Partielle selon le transporteur": "Partial, depending on carrier",
  "Non disponible actuellement": "Not currently available",
  "Pays du siège": "Headquarters country",
  "Pays-Bas / Belgique": "Netherlands / Belgium",
  "Espagne / Italie": "Spain / Italy",
  "Autre": "Other",
  "3PL spécialiste": "Specialist 3PL",
  "Fulfillment e-commerce": "E-commerce fulfillment",
  "Transporteur / Express": "Carrier / Express",
  "Intégrateur logistique": "Logistics integrator",
  "Délai France": "Delivery time in France",
  "Délai UE moyen": "Average EU delivery time",
  "J+3 à J+5": "D+3 to D+5",
  "J+5 à J+10": "D+5 to D+10",
  "Au-delà de J+10": "More than D+10",
  "J+2 à J+3": "D+2 to D+3",
  "J+10 à J+15": "D+10 to D+15",
  "Au-delà de J+15": "More than D+15",
  "Volume mensuel gérable": "Monthly parcel capacity",
  "Moins de 1 000 colis / mois": "Fewer than 1,000 parcels / month",
  "Stockage disponible": "Available storage",
  "Moins de 500 m²": "Fewer than 500 m²",
  "Plus de 10 000 m²": "More than 10,000 m²",
  "Niveau de tracking proposé": "Tracking level offered",
  "Temps réel, lien client communicable": "Real-time, customer-shareable link",
  "Partiel (étapes clés seulement)": "Partial (key milestones only)",
  "Non disponible": "Unavailable",
  "Taux de livraison dans les délais (3 derniers mois)": "On-time delivery rate (last 3 months)",
  "97% ou plus": "97% or higher",
  "Moins de 90%": "Below 90%",
  "Non mesuré": "Not measured",
  "Acceptation du processus de contrôle": "Acceptance of the inspection process",
  "Les fournisseurs présélectionnés doivent accepter les contrôles nécessaires avant leur référencement définitif. Selon le pays, le profil du fournisseur et les produits concernés, ces contrôles peuvent être réalisés sur site ou selon un dispositif adapté.": "Preselected suppliers must agree to the required checks before final listing. Depending on the country, supplier profile and products, checks may take place on site or through an appropriate alternative.",
  "Traçabilité des produits et des commandes": "Product and order traceability",
  "Le fournisseur doit pouvoir transmettre les informations nécessaires au suivi des références, des lots, des quantités et des expéditions lorsque ces données sont requises. Les modalités sont précisées lors de l'intégration.": "The supplier must be able to provide required information for tracking products, batches, quantities and shipments. The process is defined during onboarding.",
  "Conformité documentaire": "Document compliance",
  "L'entreprise, ses coordonnées, ses capacités et les documents nécessaires à la qualification doivent pouvoir être vérifiés. Des justificatifs complémentaires peuvent être demandés au cours du processus.": "The company, contact details, capabilities and qualification documents must be verifiable. Additional supporting documents may be requested during the process.",
  "Compatibilité avec le schéma logistique BIB": "Compatibility with the BIB logistics model",
  "Les flux sont organisés selon les zones, les produits et les capacités disponibles, avec les partenaires logistiques retenus par BIB. Le fournisseur doit pouvoir préparer et remettre les marchandises conformément aux modalités convenues.": "Flows are organized by region, product and available capacity with logistics partners selected by BIB. Suppliers must prepare and hand over goods according to agreed procedures.",
  "SLA livraison ≥ 95 % garanti contractuellement": "On-time delivery SLA of at least 95%, contractually guaranteed",
  "En dessous de 90 % sur 30 jours consécutifs : mise en observation puis suspension avec préavis 30 jours.": "Below 90% for 30 consecutive days: monitored status followed by suspension with 30 days' notice.",
  "Tracking temps réel communicable au client final": "Real-time tracking that can be shared with customers",
  "BIB transmet le lien de suivi à l'acheteur. Tracking non fonctionnel = incident critique.": "BIB shares the tracking link with the buyer. Non-functional tracking is a critical incident.",
  "Point de contact dédié (ops manager) aux heures ouvrées UE": "Dedicated operations contact during EU business hours",
  "Un interlocuteur unique pour gestion d'incidents et escalade. Pas de support généraliste.": "A single contact for incident management and escalation. General support is not sufficient.",
  "Rapport de performance mensuel partagé": "Shared monthly performance report",
  "Taux de livraison, incidents, retours et délais transmis via portail ou export structuré chaque mois.": "Monthly delivery rates, incidents, returns and lead times shared through the portal or a structured export.",
  "🇩🇪 Allemagne": "🇩🇪 Germany",
  "🇳🇱 Pays-Bas / Belgique": "🇳🇱 Netherlands / Belgium",
  "🇵🇱 Pologne": "🇵🇱 Poland",
  "🇪🇸 Espagne / Italie": "🇪🇸 Spain / Italy",
  "🇬🇧 Royaume-Uni": "🇬🇧 United Kingdom",
  "🇪🇺 Italie / Espagne / Portugal": "🇪🇺 Italy / Spain / Portugal",
  "🇪🇺 Allemagne / Pologne / Europe centrale": "🇪🇺 Germany / Poland / Central Europe",
  "🌍 Maroc / Tunisie / Maghreb": "🌍 Morocco / Tunisia / Maghreb",
  "🇹🇷 Turquie": "🇹🇷 Türkiye",
  "🇨🇳 Chine": "🇨🇳 China",
  "🌏 Inde / Bangladesh / Vietnam / Asie": "🌏 India / Bangladesh / Vietnam / Asia",
  "🌍 Autre pays": "🌍 Other country",
  "🏭 Fabricant / Usine directe": "🏭 Manufacturer / Direct factory",
  "🧵 Atelier artisanal": "🧵 Artisan workshop",
  "🔧 Sous-traitant / Façonnier": "🔧 Subcontractor / Contract manufacturer",
  "📦 Grossiste / Distributeur": "📦 Wholesaler / Distributor",
  "50 – 100 unités": "50–100 units",
  "100 – 300 unités": "100–300 units",
  "300 – 1 000 unités": "300–1,000 units",
  "1 000 – 5 000 unités": "1,000–5,000 units",
  "5 000 – 20 000 unités": "5,000–20,000 units",
  "10 – 20 jours": "10–20 days",
  "20 – 45 jours": "20–45 days",
  "45 – 90 jours": "45–90 days",
  "7 – 14 jours": "7–14 days",
  "14 – 30 jours": "14–30 days",
  "1 000 – 5 000": "1,000–5,000",
  "5 000 – 20 000": "5,000–20,000",
  "J+1 (24h)": "D+1 (24h)",
  "J+2 (48h)": "D+2 (48h)",
  "95 – 97%": "95–97%",
  "90 – 95%": "90–95%",
  "500 – 2 000 m²": "500–2,000 m²",
  "2 000 – 10 000 m²": "2,000–10,000 m²",
};

export function localizePartnerQualificationCopy(text: string, english: boolean) {
  return english ? (englishQualificationCopy[text] ?? text) : text;
}
export function PartnerQualificationForm({
  portal,
  fields,
  blockers,
  accentTokenClass,
}: PartnerQualificationFormProps) {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => english ? en : fr;
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selects, setSelects] = useState<Record<string, string>>({});
  // blocker state: undefined = not answered, true = accepted, false = refused
  const [accept, setAccept] = useState<Record<string, boolean | undefined>>({});
  const [decl, setDecl] = useState(false);

  const refused = useMemo(
    () => blockers.filter((b) => accept[b.id] === false).map((b) => b.title),
    [accept, blockers]
  );
  const blocked = refused.length > 0;

  function setSelect(id: string, v: string) {
    setSelects((s) => ({ ...s, [id]: v }));
  }
  function setBlocker(id: string, v: boolean) {
    setAccept((a) => ({ ...a, [id]: v }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const parsed = identitySchema(english).safeParse({
      company: data.get("company"),
      contact_name: data.get("contact_name"),
      email: data.get("email"),
      phone: data.get("phone") ?? "",
      website: data.get("website") ?? "",
      notes: data.get("notes") ?? "",
    });
    if (!parsed.success) {
      toast({
        title: tx("Formulaire incomplet", "Incomplete form"),
        description: parsed.error.issues[0]?.message ?? tx("Vérifiez les champs", "Check the form fields"),
        variant: "destructive",
      });
      return;
    }
    const missing = fields.filter((f) => f.required !== false && !selects[f.id]);
    if (missing.length > 0) {
      toast({ title: tx("Champs requis", "Required fields"), description: `${tx("À renseigner", "Please complete")}: ${localizePartnerQualificationCopy(missing[0].label, english)}`, variant: "destructive" });
      return;
    }
    if (blocked) return;
    setSubmitting(true);
    const portalLabel = portal === "suppliers" ? tx("Fournisseur", "Supplier") : tx("Opérations / Logistique", "Operations / Logistics");
    const subject = `[${portalLabel} — Qualification] ${parsed.data.company}`;
    const lines: string[] = [
      `Société : ${parsed.data.company}`,
      `Contact : ${parsed.data.contact_name}`,
      `Email : ${parsed.data.email}`,
      `Téléphone : ${parsed.data.phone || "—"}`,
      `Site web : ${parsed.data.website || "—"}`,
      "",
      "— Capacités opérationnelles —",
      ...fields.map((f) => {
        const v = selects[f.id];
        const label = f.options.find((o) => o.value === v)?.label ?? "—";
        return `${f.label} : ${label}`;
      }),
      "",
      "— Critères bloquants —",
      ...blockers.map((b) => `${accept[b.id] ? "✅" : accept[b.id] === false ? "❌" : "—"} ${b.title}`),
    ];
    if (parsed.data.notes) {
      lines.push("", "— Notes —", parsed.data.notes);
    }
    const { error } = await supabase.from("support_tickets").insert({
      source: "partner_inquiry",
      contact_email: parsed.data.email,
      contact_name: parsed.data.contact_name,
      subject,
      message: lines.join("\n"),
      boutique_id: null,
    } as any);
    setSubmitting(false);
    if (error) {
      toast({
        title: tx("Envoi impossible", "Unable to submit"),
        description: tx("Réessayez ou écrivez à partners@brand-in-a-box.space", "Try again or email partners@brand-in-a-box.space"),
        variant: "destructive",
      });
      return;
    }
    setSubmitted(true);
    toast({ title: tx("Qualification envoyée", "Qualification submitted"), description: tx("Réponse sous 3 jours ouvrés.", "We will reply within 3 business days.") });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-success/5 border-success/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
            <div>
              <h3 className="font-display text-lg font-semibold">{tx("Qualification reçue", "Qualification received")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tx("Notre équipe étudie votre dossier. Vous recevrez un retour par email sous", "Our team will review your application. You will receive a response by email within")} <strong>{tx("3 jours ouvrés", "3 business days")}</strong>.
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-8 text-center space-y-3 bg-muted/30">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="font-display text-xl">{tx("Étape 2 — Dossier complet", "Step 2 — Full application")}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Cette étape (certifications, documents, tarification détaillée) s'ouvre uniquement après présélection.
            Un lien personnalisé vous sera envoyé en cas d'avis favorable.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Stepper */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-muted/40 border border-border/50">
        <div className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium ${accentTokenClass}`}>
          <span className="w-5 h-5 rounded-full bg-background/20 inline-flex items-center justify-center text-[10px]">1</span>
          Qualification
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-muted-foreground">
          <Lock className="w-3.5 h-3.5" /> Dossier complet
        </div>
      </div>

      <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border/60 bg-muted/30">
        <Info className="w-3.5 h-3.5" /> {tx("Étape 1 — 4 à 6 minutes. Les réponses imprécises pénalisent votre dossier.", "Step 1 — 4 to 6 minutes. Inaccurate answers may affect your application.")}
      </div>

      {/* Identity */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="font-display text-sm font-semibold">{tx("Identité de l'entreprise", "Company details")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{tx("Informations légales minimales", "Basic legal information")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="company">{tx("Société *", "Company *")}</Label>
            <Input id="company" name="company" required maxLength={120} placeholder={portal === "ops" ? "FastLog SAS" : "Atelier Dupont SAS"} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">{tx("Nom du contact *", "Contact name *")}</Label>
            <Input id="contact_name" name="contact_name" required maxLength={120} placeholder="Marie Dupont" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required maxLength={255} placeholder="contact@societe.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{tx("Téléphone", "Phone")}</Label>
            <Input id="phone" name="phone" type="tel" maxLength={40} placeholder="+33 6 12 34 56 78" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="website">{tx("Site web", "Website")}</Label>
            <Input id="website" name="website" type="url" maxLength={255} placeholder="https://…" />
          </div>
        </div>
      </Card>

      {/* Operational fields */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="font-display text-sm font-semibold">{tx("Capacités opérationnelles", "Operational capacity")}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{tx("Chiffres réels — pas d'estimations gonflées", "Actual figures — no inflated estimates")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.id} className="space-y-1.5">
              <Label htmlFor={f.id}>
                {localizePartnerQualificationCopy(f.label, english)} {f.required !== false && <span className="text-primary">*</span>}
              </Label>
              {f.hint && <p className="text-[11px] text-muted-foreground -mt-1">{localizePartnerQualificationCopy(f.hint, english)}</p>}
              <Select value={selects[f.id] ?? ""} onValueChange={(v) => setSelect(f.id, v)}>
                <SelectTrigger id={f.id}>
                  <SelectValue placeholder={tx("Choisir…", "Select…")} />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{localizePartnerQualificationCopy(o.label, english)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </Card>

      {/* Blockers */}
      <Card id="blockers" className="p-5 sm:p-6 space-y-4 scroll-mt-20">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-semibold">{tx("Compatibilité opérationnelle", "Operational compatibility")}</h3>
          <Badge variant="destructive" className="text-[10px]">{tx("Critères bloquants", "Mandatory criteria")}</Badge>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-md bg-warning/10 border border-warning/30 text-xs">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <span>{tx("Un refus sur l'un de ces points met fin au processus. Ces conditions s'appliquent dès le premier jour.", "Declining any of these terms ends the process. These conditions apply from day one.")}</span>
        </div>
        <div className="space-y-2">
          {blockers.map((b) => {
            const v = accept[b.id];
            return (
              <div
                key={b.id}
                className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                  v === true
                    ? "border-success/40 bg-success/5"
                    : v === false
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border bg-muted/20"
                }`}
              >
                <Switch checked={v === true} onCheckedChange={(c) => setBlocker(b.id, c)} aria-label={localizePartnerQualificationCopy(b.title, english)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{localizePartnerQualificationCopy(b.title, english)}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{localizePartnerQualificationCopy(b.text, english)}</p>
                </div>
              </div>
            );
          })}
        </div>
        {blocked && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-xs text-destructive">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{tx("Critère(s) refusé(s)", "Declined criteria")}: {refused.map((item) => localizePartnerQualificationCopy(item, english)).join(", ")}. {tx("La candidature ne peut pas être soumise.", "The application cannot be submitted.")}</span>
          </div>
        )}
      </Card>

      {/* Free notes */}
      <Card className="p-5 sm:p-6 space-y-2">
        <Label htmlFor="notes">{tx("Précisions libres", "Additional details")}</Label>
        <Textarea id="notes" name="notes" rows={4} maxLength={2000} placeholder={tx("Spécialités, marchés, certifications notables…", "Specialties, markets, notable certifications…")} />
      </Card>

      {/* Declaration */}
      <label className="flex items-start gap-3 p-3 rounded-md border border-border bg-muted/20 cursor-pointer">
        <Checkbox checked={decl} onCheckedChange={(c) => setDecl(c === true)} className="mt-0.5" />
        <span className="text-xs text-muted-foreground leading-relaxed">
          {tx("Je certifie l'exactitude des informations fournies et j'accepte le processus de validation Brand-In-A-Box. Ce formulaire ne constitue pas un engagement contractuel.", "I certify that the information provided is accurate and agree to the Brand-In-A-Box review process. This form is not a contractual commitment.")}
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={submitting || blocked || !decl} variant={portal === "ops" ? "coral" : "default"}>
        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        {tx("Soumettre la qualification", "Submit qualification")}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        {tx("L'étape 2 (dossier complet, documents, tarification) est débloquée uniquement après présélection.", "Step 2 (full application, documents and pricing) is available only after preselection.")}
      </p>
    </form>
  );
}