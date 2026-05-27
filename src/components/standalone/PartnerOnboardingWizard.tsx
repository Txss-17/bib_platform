import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSignature,
  FileUp,
  Loader2,
  PackageCheck,
  Plug,
  Rocket,
  ShieldCheck,
  Trash2,
  UserCheck,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

/**
 * PartnerOnboardingWizard
 * Multi-step operational onboarding for pre-approved partners (suppliers / ops).
 * Progress is persisted in localStorage so the partner can resume.
 * Final submission creates a `support_tickets` row tagged `partner_inquiry`
 * (subject prefixed with "[Onboarding …]") and uploads any KYC documents
 * to the `support-attachments` bucket (anonymous insert allowed for that bucket
 * once the parent ticket is created).
 */

export interface DocSlot {
  id: string;
  label: string;
  required: boolean;
  hint?: string;
  accept?: string;
}

export interface CommitmentItem {
  id: string;
  title: string;
  text: string;
}

export interface IntegrationField {
  id: string;
  label: string;
  type: "text" | "url" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
}

export interface OnboardingConfig {
  portal: "suppliers" | "ops";
  /** Title shown in the wizard hero */
  title: string;
  /** One-liner under the title */
  subtitle: string;
  /** KYC / legal documents to upload */
  documents: DocSlot[];
  /** Operational commitments (acknowledgements) */
  commitments: CommitmentItem[];
  /** Technical integration fields */
  integration: IntegrationField[];
  /** Pilot description shown at the pilot step */
  pilot: {
    title: string;
    description: string;
    placeholder: string;
  };
}

const identitySchema = z.object({
  access_code: z.string().trim().min(4, "Code requis").max(40),
  company: z.string().trim().min(2, "Société requise").max(120),
  legal_rep: z.string().trim().min(2, "Représentant légal requis").max(120),
  email: z.string().trim().email("Email invalide").max(255),
  phone: z.string().trim().min(6, "Téléphone requis").max(40),
  address: z.string().trim().min(5, "Adresse requise").max(300),
});

type Identity = z.infer<typeof identitySchema>;

interface UploadedDoc {
  slotId: string;
  fileName: string;
  path: string; // storage path
  size: number;
}

const STORAGE_KEY_PREFIX = "bib-onboarding-";

export function PartnerOnboardingWizard({ config }: { config: OnboardingConfig }) {
  const { toast } = useToast();
  const storageKey = `${STORAGE_KEY_PREFIX}${config.portal}`;

  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState<Partial<Identity>>({});
  const [uploaded, setUploaded] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [commitAck, setCommitAck] = useState<Record<string, boolean>>({});
  const [integration, setIntegration] = useState<Record<string, string>>({});
  const [pilotNotes, setPilotNotes] = useState("");
  const [finalDecl, setFinalDecl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // OTP verification state
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [otpSentTo, setOtpSentTo] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpRequesting, setOtpRequesting] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);

  // Restore progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      setIdentity(data.identity ?? {});
      setUploaded(data.uploaded ?? []);
      setCommitAck(data.commitAck ?? {});
      setIntegration(data.integration ?? {});
      setPilotNotes(data.pilotNotes ?? "");
      setStep(typeof data.step === "number" ? data.step : 0);
      if (data.accessToken) setAccessToken(data.accessToken);
      if (data.otpSentTo) setOtpSentTo(data.otpSentTo);
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ step, identity, uploaded, commitAck, integration, pilotNotes, accessToken, otpSentTo }),
      );
    } catch {
      /* ignore */
    }
  }, [storageKey, step, identity, uploaded, commitAck, integration, pilotNotes, accessToken, otpSentTo]);

  const steps = useMemo(
    () => [
      { key: "identity", label: "Identité", icon: UserCheck },
      { key: "documents", label: "Documents", icon: FileUp },
      { key: "commitments", label: "Engagements", icon: FileSignature },
      { key: "integration", label: "Intégration", icon: Plug },
      { key: "pilot", label: "Pilote", icon: PackageCheck },
      { key: "verify", label: "Vérification email", icon: Mail },
      { key: "review", label: "Récap", icon: ClipboardCheck },
    ],
    [],
  );
  const totalSteps = steps.length;
  const pct = Math.round(((step + 1) / totalSteps) * 100);

  function setIdField<K extends keyof Identity>(k: K, v: string) {
    setIdentity((s) => ({ ...s, [k]: v }));
  }

  const identityValid = identitySchema.safeParse(identity).success;
  const requiredDocsOk = config.documents
    .filter((d) => d.required)
    .every((d) => uploaded.some((u) => u.slotId === d.id));
  const allCommitOk = config.commitments.every((c) => commitAck[c.id]);
  const requiredIntegrationOk = config.integration
    .filter((f) => f.required)
    .every((f) => (integration[f.id] ?? "").trim().length > 0);
  const pilotOk = pilotNotes.trim().length >= 20;
  const emailVerified = !!accessToken && otpSentTo === (identity.email ?? "").trim().toLowerCase();

  const canNext =
    (step === 0 && identityValid) ||
    (step === 1 && requiredDocsOk) ||
    (step === 2 && allCommitOk) ||
    (step === 3 && requiredIntegrationOk) ||
    (step === 4 && pilotOk) ||
    (step === 5 && emailVerified) ||
    step === 6;

  async function handleUpload(slot: DocSlot, file: File) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: "Limite 8 Mo.", variant: "destructive" });
      return;
    }
    setUploading(slot.id);
    const ext = file.name.split(".").pop() || "bin";
    const path = `onboarding/${config.portal}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("support-attachments").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    setUploading(null);
    if (error) {
      toast({
        title: "Upload impossible",
        description: "Réessayez ou envoyez par email à partners@brand-in-a-box.space",
        variant: "destructive",
      });
      return;
    }
    setUploaded((arr) => [
      ...arr.filter((u) => u.slotId !== slot.id),
      { slotId: slot.id, fileName: file.name, path, size: file.size },
    ]);
    toast({ title: "Document ajouté", description: slot.label });
  }

  async function handleSubmit() {
    if (!finalDecl) return;
    if (!accessToken) {
      toast({ title: "Vérification email requise", description: "Validez votre email avant de soumettre.", variant: "destructive" });
      setStep(5);
      return;
    }
    setSubmitting(true);
    const parsed = identitySchema.safeParse(identity);
    if (!parsed.success) {
      setSubmitting(false);
      toast({ title: "Identité incomplète", variant: "destructive" });
      setStep(0);
      return;
    }

    const summary_lines = [
      "— Documents fournis —",
      ...config.documents.map((d) => {
        const u = uploaded.find((x) => x.slotId === d.id);
        return `${u ? "✅" : d.required ? "❌" : "—"} ${d.label}${u ? ` (${u.fileName})` : ""}`;
      }),
      "",
      "— Engagements —",
      ...config.commitments.map((c) => `${commitAck[c.id] ? "✅" : "❌"} ${c.title}`),
      "",
      "— Intégration technique —",
      ...config.integration.map((f) => {
        const v = integration[f.id] ?? "";
        const label = f.type === "select" && v ? f.options?.find((o) => o.value === v)?.label ?? v : v || "—";
        return `${f.label} : ${label}`;
      }),
      "",
      "— Pilote —",
      pilotNotes || "—",
    ];

    const { data, error } = await supabase.functions.invoke("partner-onboarding-submit", {
      body: {
        access_token: accessToken,
        contact_name: parsed.data.legal_rep,
        company: parsed.data.company,
        payload: {
          identity: parsed.data,
          commitAck,
          integration,
          pilotNotes,
        },
        kyc_attachments: uploaded.map((u) => ({
          slotId: u.slotId,
          fileName: u.fileName,
          path: u.path,
          size: u.size,
        })),
        summary_lines,
      },
    });

    setSubmitting(false);
    if (error || !data?.ok) {
      toast({
        title: "Envoi impossible",
        description: "Réessayez ou contactez partners@brand-in-a-box.space",
        variant: "destructive",
      });
      return;
    }
    setPortalUrl((data as { portal_url?: string }).portal_url ?? null);
    setSubmitted(true);
    try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
    toast({ title: "Onboarding soumis", description: "Vous recevez un email de suivi." });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function requestOtp() {
    const email = (identity.email ?? "").trim().toLowerCase();
    if (!email) {
      toast({ title: "Email manquant", description: "Renseignez votre email à l'étape Identité.", variant: "destructive" });
      setStep(0);
      return;
    }
    setOtpRequesting(true);
    setOtpError(null);
    const { data, error } = await supabase.functions.invoke("partner-otp-request", {
      body: { email, portal: config.portal },
    });
    setOtpRequesting(false);
    if (error || !(data as { ok?: boolean })?.ok) {
      const code = (data as { error?: string })?.error;
      setOtpError(code === "rate_limited" ? "Trop de demandes — patientez une minute." : "Envoi impossible. Réessayez.");
      return;
    }
    setOtpSentTo(email);
    setAccessToken(null);
    toast({ title: "Code envoyé", description: `Vérifiez la boîte ${email}.` });
  }

  async function verifyOtp() {
    const email = (identity.email ?? "").trim().toLowerCase();
    if (!/^\d{6}$/.test(otpCode)) {
      setOtpError("Saisissez les 6 chiffres du code.");
      return;
    }
    setOtpVerifying(true);
    setOtpError(null);
    const { data, error } = await supabase.functions.invoke("partner-otp-verify", {
      body: { email, portal: config.portal, code: otpCode },
    });
    setOtpVerifying(false);
    const ok = (data as { ok?: boolean; access_token?: string; resumed?: boolean })?.ok;
    if (error || !ok) {
      const msg = (data as { error?: string })?.error;
      setOtpError(
        msg === "invalid_code" ? "Code incorrect."
        : msg === "expired" ? "Code expiré, renvoyez un nouveau code."
        : msg === "too_many_attempts" ? "Trop de tentatives. Renvoyez un code."
        : "Vérification impossible."
      );
      return;
    }
    setAccessToken((data as { access_token: string }).access_token);
    setOtpSentTo(email);
    setOtpCode("");
    toast({ title: "Email vérifié", description: "Vous pouvez soumettre votre dossier." });
    if ((data as { resumed?: boolean }).resumed) {
      toast({ title: "Dossier existant repris", description: "Vos précédentes informations seront mises à jour." });
    }
  }

  if (submitted) {
    return (
      <Card className="p-8 space-y-4 bg-success/5 border-success/30">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-success mt-0.5" />
          <div>
            <h3 className="font-display text-xl font-semibold">Onboarding soumis</h3>
            <p className="text-sm text-muted-foreground mt-1.5">
              Votre dossier opérationnel est en file d'instruction. Vous recevrez un email avec votre
              accès au portail <strong>{config.portal === "suppliers" ? "Suppliers" : "Ops"}</strong> sous
              48 heures ouvrées, accompagné du planning de pilote.
            </p>
            {portalUrl && (
              <p className="text-xs mt-3">
                Suivi en temps réel : <a className="underline text-primary break-all" href={portalUrl}>{portalUrl}</a>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Rocket className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Prochain jalon : commande pilote — préparée par notre Ops Manager dédié.
          </span>
        </div>
      </Card>
    );
  }

  const CurrentIcon = steps[step].icon;

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CurrentIcon className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Étape {step + 1} / {totalSteps} — {steps[step].label}
            </span>
          </div>
          <Badge variant="secondary" className="text-[10px]">{pct}%</Badge>
        </div>
        <Progress value={pct} className="h-1.5" />
        <div className="hidden sm:flex gap-1 mt-3">
          {steps.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => i <= step && setStep(i)}
              className={`flex-1 text-[10px] py-1 rounded-md transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "bg-primary/10 text-primary cursor-pointer"
                  : "bg-muted/40 text-muted-foreground cursor-not-allowed"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      {step === 0 && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-display text-base font-semibold">Identité confirmée</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Code d'accès envoyé par email après votre présélection. Reprend votre fiche de qualification.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="access_code">Code d'accès *</Label>
              <Input
                id="access_code"
                value={identity.access_code ?? ""}
                onChange={(e) => setIdField("access_code", e.target.value)}
                placeholder="ONBD-XXXX-XXXX"
                maxLength={40}
              />
              <p className="text-[11px] text-muted-foreground">
                Pas de code ? Écrivez à <a className="underline" href="mailto:partners@brand-in-a-box.space">partners@brand-in-a-box.space</a>.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Société *</Label>
              <Input id="company" value={identity.company ?? ""} onChange={(e) => setIdField("company", e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="legal_rep">Représentant légal *</Label>
              <Input id="legal_rep" value={identity.legal_rep ?? ""} onChange={(e) => setIdField("legal_rep", e.target.value)} maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={identity.email ?? ""} onChange={(e) => setIdField("email", e.target.value)} maxLength={255} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone direct *</Label>
              <Input id="phone" type="tel" value={identity.phone ?? ""} onChange={(e) => setIdField("phone", e.target.value)} maxLength={40} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Adresse complète *</Label>
              <Input id="address" value={identity.address ?? ""} onChange={(e) => setIdField("address", e.target.value)} maxLength={300} />
            </div>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-display text-base font-semibold">Documents légaux & conformité</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              PDF, JPG ou PNG. 8 Mo maximum par fichier. Tous les documents marqués d'un astérisque sont obligatoires.
            </p>
          </div>
          <div className="space-y-3">
            {config.documents.map((d) => {
              const u = uploaded.find((x) => x.slotId === d.id);
              return (
                <div key={d.id} className={`p-3 rounded-md border ${u ? "border-success/40 bg-success/5" : "border-border bg-muted/20"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {d.label} {d.required && <span className="text-primary">*</span>}
                      </p>
                      {d.hint && <p className="text-[11px] text-muted-foreground mt-0.5">{d.hint}</p>}
                      {u && (
                        <p className="text-[11px] text-success mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {u.fileName} ({Math.round(u.size / 1024)} Ko)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button asChild size="sm" variant="outline" disabled={uploading === d.id}>
                        <label className="cursor-pointer">
                          {uploading === d.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileUp className="w-3.5 h-3.5" />
                          )}
                          <span className="ml-1.5">{u ? "Remplacer" : "Ajouter"}</span>
                          <input
                            type="file"
                            accept={d.accept ?? "application/pdf,image/png,image/jpeg"}
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUpload(d, f);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </Button>
                      {u && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setUploaded((arr) => arr.filter((x) => x.slotId !== d.id))}
                          aria-label="Retirer le document"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="font-display text-base font-semibold">Engagements opérationnels</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Cochez chaque engagement. Ces clauses seront reprises dans votre contrat — la signature électronique
            intervient après onboarding validé.
          </p>
          <div className="space-y-2">
            {config.commitments.map((c) => (
              <label
                key={c.id}
                className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                  commitAck[c.id] ? "border-success/40 bg-success/5" : "border-border bg-muted/20"
                }`}
              >
                <Checkbox
                  checked={!!commitAck[c.id]}
                  onCheckedChange={(v) => setCommitAck((s) => ({ ...s, [c.id]: v === true }))}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.text}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Plug className="w-4 h-4 text-primary" />
            <h3 className="font-display text-base font-semibold">Intégration technique</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Permet à notre équipe de configurer vos accès au portail et — si applicable — la synchronisation
            EDI / webhook avec votre système.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.integration.map((f) => (
              <div key={f.id} className={`space-y-1.5 ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
                <Label htmlFor={f.id}>
                  {f.label} {f.required && <span className="text-primary">*</span>}
                </Label>
                {f.hint && <p className="text-[11px] text-muted-foreground -mt-1">{f.hint}</p>}
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.id}
                    rows={3}
                    maxLength={1000}
                    value={integration[f.id] ?? ""}
                    onChange={(e) => setIntegration((s) => ({ ...s, [f.id]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                ) : f.type === "select" ? (
                  <Select
                    value={integration[f.id] ?? ""}
                    onValueChange={(v) => setIntegration((s) => ({ ...s, [f.id]: v }))}
                  >
                    <SelectTrigger id={f.id}>
                      <SelectValue placeholder={f.placeholder ?? "Choisir…"} />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover">
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={f.id}
                    type={f.type}
                    maxLength={255}
                    value={integration[f.id] ?? ""}
                    onChange={(e) => setIntegration((s) => ({ ...s, [f.id]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-primary" />
            <h3 className="font-display text-base font-semibold">{config.pilot.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground">{config.pilot.description}</p>
          <Textarea
            rows={6}
            maxLength={2000}
            value={pilotNotes}
            onChange={(e) => setPilotNotes(e.target.value)}
            placeholder={config.pilot.placeholder}
          />
          <p className="text-[11px] text-muted-foreground">{pilotNotes.length}/2000 — minimum 20 caractères.</p>
        </Card>
      )}

      {step === 5 && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <h3 className="font-display text-base font-semibold">Vérification de votre email</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Pour sécuriser votre dossier et vous permettre de le reprendre/modifier après soumission,
            nous envoyons un code à 6 chiffres à <strong>{identity.email || "—"}</strong>.
          </p>
          {!otpSentTo || otpSentTo !== (identity.email ?? "").trim().toLowerCase() ? (
            <Button onClick={requestOtp} disabled={otpRequesting || !identity.email} className="w-full sm:w-auto">
              {otpRequesting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Envoyer le code
            </Button>
          ) : emailVerified ? (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="w-4 h-4" />
              Email vérifié — vous pouvez passer au récapitulatif.
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Code reçu par email</Label>
                <div className="mt-2">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" onClick={verifyOtp} disabled={otpVerifying || otpCode.length !== 6}>
                  {otpVerifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Vérifier le code
                </Button>
                <Button size="sm" variant="ghost" onClick={requestOtp} disabled={otpRequesting}>
                  Renvoyer le code
                </Button>
              </div>
              {otpError && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> {otpError}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Code valable 10 minutes. Max 5 tentatives par code.
              </p>
            </div>
          )}
        </Card>
      )}

      {step === 6 && (
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary" />
            <h3 className="font-display text-base font-semibold">Récapitulatif & soumission</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <SummaryItem label="Société" value={identity.company} />
            <SummaryItem label="Représentant légal" value={identity.legal_rep} />
            <SummaryItem label="Email" value={identity.email} />
            <SummaryItem label="Téléphone" value={identity.phone} />
            <SummaryItem
              label="Documents"
              value={`${uploaded.length} / ${config.documents.length} fournis`}
            />
            <SummaryItem
              label="Engagements"
              value={`${Object.values(commitAck).filter(Boolean).length} / ${config.commitments.length} acceptés`}
            />
            <SummaryItem label="Email vérifié" value={emailVerified ? "✅ confirmé" : "❌ requis"} />
          </div>
          <label className="flex items-start gap-3 p-3 rounded-md border border-border bg-muted/20 cursor-pointer">
            <Checkbox checked={finalDecl} onCheckedChange={(c) => setFinalDecl(c === true)} className="mt-0.5" />
            <span className="text-xs text-muted-foreground leading-relaxed">
              Je certifie l'exactitude des informations et des documents fournis. Je comprends que toute fausse
              déclaration entraîne l'exclusion immédiate du réseau Brand-In-A-Box, sans préavis ni indemnité.
            </span>
          </label>
          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            disabled={submitting || !finalDecl || !emailVerified || !identityValid || !requiredDocsOk || !allCommitOk || !requiredIntegrationOk || !pilotOk}
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
            Soumettre mon onboarding
          </Button>
        </Card>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Retour
        </Button>
        {step < totalSteps - 1 && (
          <Button size="sm" onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))} disabled={!canNext}>
            Continuer <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="p-2.5 rounded-md bg-muted/30 border border-border/50">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value || "—"}</p>
    </div>
  );
}