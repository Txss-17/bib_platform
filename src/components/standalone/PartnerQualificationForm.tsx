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

const identitySchema = z.object({
  company: z.string().trim().min(2, "Nom de société requis").max(120),
  contact_name: z.string().trim().min(2, "Nom du contact requis").max(120),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().max(255).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export function PartnerQualificationForm({
  portal,
  fields,
  blockers,
  accentTokenClass,
}: PartnerQualificationFormProps) {
  const { toast } = useToast();
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
    const parsed = identitySchema.safeParse({
      company: data.get("company"),
      contact_name: data.get("contact_name"),
      email: data.get("email"),
      phone: data.get("phone") ?? "",
      website: data.get("website") ?? "",
      notes: data.get("notes") ?? "",
    });
    if (!parsed.success) {
      toast({
        title: "Formulaire incomplet",
        description: parsed.error.issues[0]?.message ?? "Vérifiez les champs",
        variant: "destructive",
      });
      return;
    }
    const missing = fields.filter((f) => f.required !== false && !selects[f.id]);
    if (missing.length > 0) {
      toast({ title: "Champs requis", description: `À renseigner : ${missing[0].label}`, variant: "destructive" });
      return;
    }
    if (blocked) return;
    setSubmitting(true);
    const portalLabel = portal === "suppliers" ? "Fournisseur" : "Opérations / Logistique";
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
        title: "Envoi impossible",
        description: "Réessayez ou écrivez à partners@brand-in-a-box.space",
        variant: "destructive",
      });
      return;
    }
    setSubmitted(true);
    toast({ title: "Qualification envoyée", description: "Réponse sous 3 jours ouvrés." });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-success/5 border-success/30">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
            <div>
              <h3 className="font-display text-lg font-semibold">Qualification reçue</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Notre équipe étudie votre dossier. Vous recevrez un retour par email sous <strong>3 jours ouvrés</strong>.
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-8 text-center space-y-3 bg-muted/30">
          <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="font-display text-xl">Étape 2 — Dossier complet</h3>
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
        <Info className="w-3.5 h-3.5" /> Étape 1 — 4 à 6 minutes. Les réponses imprécises pénalisent votre dossier.
      </div>

      {/* Identity */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="font-display text-sm font-semibold">Identité de l'entreprise</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Informations légales minimales</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="company">Société *</Label>
            <Input id="company" name="company" required maxLength={120} placeholder={portal === "ops" ? "FastLog SAS" : "Atelier Dupont SAS"} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact_name">Nom du contact *</Label>
            <Input id="contact_name" name="contact_name" required maxLength={120} placeholder="Marie Dupont" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required maxLength={255} placeholder="contact@societe.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" name="phone" type="tel" maxLength={40} placeholder="+33 6 12 34 56 78" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="website">Site web</Label>
            <Input id="website" name="website" type="url" maxLength={255} placeholder="https://…" />
          </div>
        </div>
      </Card>

      {/* Operational fields */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="font-display text-sm font-semibold">Capacités opérationnelles</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Chiffres réels — pas d'estimations gonflées</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.id} className="space-y-1.5">
              <Label htmlFor={f.id}>
                {f.label} {f.required !== false && <span className="text-primary">*</span>}
              </Label>
              {f.hint && <p className="text-[11px] text-muted-foreground -mt-1">{f.hint}</p>}
              <Select value={selects[f.id] ?? ""} onValueChange={(v) => setSelect(f.id, v)}>
                <SelectTrigger id={f.id}>
                  <SelectValue placeholder="Choisir…" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  {f.options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
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
          <h3 className="font-display text-sm font-semibold">Compatibilité opérationnelle</h3>
          <Badge variant="destructive" className="text-[10px]">Critères bloquants</Badge>
        </div>
        <div className="flex items-start gap-2 p-3 rounded-md bg-warning/10 border border-warning/30 text-xs">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <span>Un refus sur l'un de ces points met fin au processus. Ces conditions s'appliquent dès le premier jour.</span>
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
                <Switch checked={v === true} onCheckedChange={(c) => setBlocker(b.id, c)} aria-label={b.title} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{b.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{b.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        {blocked && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-xs text-destructive">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Critère(s) refusé(s) : {refused.join(", ")}. La candidature ne peut pas être soumise.</span>
          </div>
        )}
      </Card>

      {/* Free notes */}
      <Card className="p-5 sm:p-6 space-y-2">
        <Label htmlFor="notes">Précisions libres</Label>
        <Textarea id="notes" name="notes" rows={4} maxLength={2000} placeholder="Spécialités, marchés, certifications notables…" />
      </Card>

      {/* Declaration */}
      <label className="flex items-start gap-3 p-3 rounded-md border border-border bg-muted/20 cursor-pointer">
        <Checkbox checked={decl} onCheckedChange={(c) => setDecl(c === true)} className="mt-0.5" />
        <span className="text-xs text-muted-foreground leading-relaxed">
          Je certifie l'exactitude des informations fournies et j'accepte le processus de validation Brand-In-A-Box.
          Ce formulaire ne constitue pas un engagement contractuel.
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={submitting || blocked || !decl} variant={portal === "ops" ? "coral" : "default"}>
        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
        Soumettre la qualification
      </Button>
      <p className="text-[11px] text-muted-foreground text-center">
        L'étape 2 (dossier complet, documents, tarification) est débloquée uniquement après présélection.
      </p>
    </form>
  );
}