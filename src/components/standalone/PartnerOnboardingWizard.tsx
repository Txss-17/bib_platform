import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Loader2,
  Mail,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

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
  options?: {
    value: string;
    label: string;
  }[];
}

export interface OnboardingConfig {
  portal: "suppliers" | "ops";
  title: string;
  subtitle: string;
  documents: DocSlot[];
  commitments: CommitmentItem[];
  integration: IntegrationField[];
  pilot: {
    title: string;
    description: string;
    placeholder: string;
  };
}

interface UploadedDocument {
  slotId: string;
  name: string;
  path: string;
  size: number;
  type: string;
}

interface IdentityValues {
  access_code: string;
  company: string;
  legal_rep: string;
  email: string;
  phone: string;
  address: string;
}

interface PartnerOnboardingWizardProps {
  config: OnboardingConfig;

  /**
   * Mode création :
   * parcours normal après présélection.
   *
   * Mode édition :
   * permet de reprendre un dossier existant depuis le portail sécurisé.
   */
  mode?: "new" | "edit";

  initialValues?: Partial<IdentityValues>;
  initialPayload?: Record<string, unknown>;
  initialDocuments?: UploadedDocument[];
  initialEmailVerified?: boolean;

  accessToken?: string;

  onSubmitted?: (result: {
    submissionId?: string;
    portalUrl?: string;
  }) => void;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const identitySchema = z.object({
  access_code: z
    .string()
    .trim()
    .min(4, "Code d'accès requis")
    .max(80, "Code d'accès invalide"),

  company: z
    .string()
    .trim()
    .min(2, "Société requise")
    .max(120, "Société trop longue"),

  legal_rep: z
    .string()
    .trim()
    .min(2, "Représentant légal requis")
    .max(120, "Nom trop long"),

  email: z
    .string()
    .trim()
    .email("Email invalide")
    .max(255, "Email trop long"),

  phone: z
    .string()
    .trim()
    .min(6, "Téléphone requis")
    .max(40, "Téléphone invalide"),

  address: z
    .string()
    .trim()
    .min(5, "Adresse requise")
    .max(300, "Adresse trop longue"),
});

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const STEPS = [
  {
    id: 1,
    label: "Identité",
    icon: UserRound,
  },
  {
    id: 2,
    label: "Documents",
    icon: FileText,
  },
  {
    id: 3,
    label: "Engagements",
    icon: ShieldCheck,
  },
  {
    id: 4,
    label: "Intégration",
    icon: ClipboardCheck,
  },
  {
    id: 5,
    label: "Pilote",
    icon: CheckCircle2,
  },
  {
    id: 6,
    label: "Vérification",
    icon: Mail,
  },
  {
    id: 7,
    label: "Récapitulatif",
    icon: FileCheck2,
  },
] as const;

function getFileExtension(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() || "bin" : "bin";
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)} Ko`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

function safeJson(value: unknown) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return {};
  }
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PartnerOnboardingWizard({
  config,
  mode = "new",
  initialValues,
  initialPayload,
  initialDocuments,
  initialEmailVerified = false,
  accessToken,
  onSubmitted,
}: PartnerOnboardingWizardProps) {
  const storageKey = `bib-onboarding-${config.portal}`;

  const [step, setStep] = useState(mode === "edit" ? 7 : 1);

  const [identity, setIdentity] = useState<IdentityValues>({
    access_code: initialValues?.access_code ?? "",
    company: initialValues?.company ?? "",
    legal_rep: initialValues?.legal_rep ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    address: initialValues?.address ?? "",
  });

  const [documents, setDocuments] = useState<UploadedDocument[]>(
    initialDocuments ?? [],
  );

  const [commitments, setCommitments] = useState<Record<string, boolean>>({});

  const [integration, setIntegration] = useState<Record<string, string>>(
    {},
  );

  const [pilotNotes, setPilotNotes] = useState("");

  const [finalDecl, setFinalDecl] = useState(false);

  const [emailVerified, setEmailVerified] =
    useState(initialEmailVerified);

  const [otpRequested, setOtpRequested] = useState(false);
  const [otp, setOtp] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [submissionId, setSubmissionId] = useState<string | undefined>();
  const [portalUrl, setPortalUrl] = useState<string | undefined>();

  /* ------------------------------------------------------------------------ */
  /* Restore draft                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (mode !== "new") return;

    try {
      const raw = localStorage.getItem(storageKey);

      if (!raw) return;

      const saved = JSON.parse(raw);

      if (saved.identity) {
        setIdentity((current) => ({
          ...current,
          ...saved.identity,
        }));
      }

      if (saved.documents) {
        setDocuments(saved.documents);
      }

      if (saved.commitments) {
        setCommitments(saved.commitments);
      }

      if (saved.integration) {
        setIntegration(saved.integration);
      }

      if (typeof saved.pilotNotes === "string") {
        setPilotNotes(saved.pilotNotes);
      }

      if (typeof saved.finalDecl === "boolean") {
        setFinalDecl(saved.finalDecl);
      }
    } catch {
      // Ignore invalid local draft.
    }
  }, [mode, storageKey]);

  /* ------------------------------------------------------------------------ */
  /* Persist draft                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (mode !== "new" || submitted) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          identity,
          documents,
          commitments,
          integration,
          pilotNotes,
          finalDecl,
        }),
      );
    } catch {
      // Local persistence is best effort.
    }
  }, [
    mode,
    storageKey,
    identity,
    documents,
    commitments,
    integration,
    pilotNotes,
    finalDecl,
    submitted,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Initial payload in edit mode                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!initialPayload) return;

    const payload = initialPayload as {
      identity?: Partial<IdentityValues>;
      commitments?: Record<string, boolean>;
      integration?: Record<string, string>;
      pilotNotes?: string;
      finalDecl?: boolean;
    };

    if (payload.identity) {
      setIdentity((current) => ({
        ...current,
        ...payload.identity,
      }));
    }

    if (payload.commitments) {
      setCommitments(payload.commitments);
    }

    if (payload.integration) {
      setIntegration(payload.integration);
    }

    if (typeof payload.pilotNotes === "string") {
      setPilotNotes(payload.pilotNotes);
    }

    if (typeof payload.finalDecl === "boolean") {
      setFinalDecl(payload.finalDecl);
    }
  }, [initialPayload]);

  /* ------------------------------------------------------------------------ */
  /* Derived state                                                            */
  /* ------------------------------------------------------------------------ */

  const requiredDocuments = useMemo(
    () => config.documents.filter((document) => document.required),
    [config.documents],
  );

  const missingDocuments = useMemo(
    () =>
      requiredDocuments.filter(
        (slot) => !documents.some((document) => document.slotId === slot.id),
      ),
    [requiredDocuments, documents],
  );

  const missingCommitments = useMemo(
    () =>
      config.commitments.filter(
        (commitment) => commitments[commitment.id] !== true,
      ),
    [config.commitments, commitments],
  );

  const missingIntegration = useMemo(
    () =>
      config.integration.filter(
        (field) =>
          field.required &&
          !String(integration[field.id] ?? "").trim(),
      ),
    [config.integration, integration],
  );

  const identityResult = useMemo(
    () => identitySchema.safeParse(identity),
    [identity],
  );

  const pilotValid = pilotNotes.trim().length >= 20;

  const canSubmit =
    identityResult.success &&
    missingDocuments.length === 0 &&
    missingCommitments.length === 0 &&
    missingIntegration.length === 0 &&
    pilotValid &&
    emailVerified &&
    finalDecl;

  /* ------------------------------------------------------------------------ */
  /* Step validation                                                          */
  /* ------------------------------------------------------------------------ */

  function validateStep(targetStep: number) {
    setError(null);

    if (targetStep === 1) {
      const parsed = identitySchema.safeParse(identity);

      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ??
            "Vérifiez les informations d'identité.",
        );

        return false;
      }
    }

    if (targetStep === 2 && missingDocuments.length > 0) {
      setError(
        `Documents requis manquants : ${missingDocuments
          .map((item) => item.label)
          .join(", ")}.`,
      );

      return false;
    }

    if (targetStep === 3 && missingCommitments.length > 0) {
      setError(
        "Tous les engagements doivent être explicitement confirmés.",
      );

      return false;
    }

    if (targetStep === 4 && missingIntegration.length > 0) {
      setError(
        `Informations opérationnelles manquantes : ${missingIntegration
          .map((item) => item.label)
          .join(", ")}.`,
      );

      return false;
    }

    if (targetStep === 5 && !pilotValid) {
      setError(
        "Décrivez les conditions envisagées pour le pilote avec au moins 20 caractères.",
      );

      return false;
    }

    if (targetStep === 6 && !emailVerified) {
      setError("Votre adresse email doit être vérifiée.");

      return false;
    }

    return true;
  }

  function goNext() {
    if (step >= STEPS.length) return;

    if (!validateStep(step)) return;

    setStep((current) => Math.min(current + 1, STEPS.length));
  }

  function goBack() {
    setError(null);
    setStep((current) => Math.max(current - 1, 1));
  }

  function goToStep(targetStep: number) {
    if (targetStep >= step) return;

    setError(null);
    setStep(targetStep);
  }

  /* ------------------------------------------------------------------------ */
  /* Document upload                                                          */
  /* ------------------------------------------------------------------------ */

  async function handleDocumentUpload(
    slot: DocSlot,
    file: File | undefined,
  ) {
    if (!file) return;

    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `Le fichier "${file.name}" dépasse la limite de 8 Mo.`,
      );
      return;
    }

    setUploading(true);

    try {
      const extension = getFileExtension(file);

      const path = `onboarding/${config.portal}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("support-attachments")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        throw uploadError;
      }

      const uploaded: UploadedDocument = {
        slotId: slot.id,
        name: file.name,
        path,
        size: file.size,
        type: file.type,
      };

      setDocuments((current) => [
        ...current.filter((document) => document.slotId !== slot.id),
        uploaded,
      ]);
    } catch (uploadError) {
      console.error(uploadError);

      setError(
        "Le document n'a pas pu être téléversé. Réessayez.",
      );
    } finally {
      setUploading(false);
    }
  }

  function removeDocument(slotId: string) {
    setDocuments((current) =>
      current.filter((document) => document.slotId !== slotId),
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Email OTP                                                                */
  /* ------------------------------------------------------------------------ */

  async function requestOtp() {
    setError(null);

    if (!identity.email.trim()) {
      setError("Renseignez d'abord une adresse email valide.");
      return;
    }

    const parsed = identitySchema.safeParse(identity);

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ??
          "Vérifiez les informations d'identité.",
      );
      return;
    }

    setOtpLoading(true);

    try {
      const { error: functionError } =
        await supabase.functions.invoke("partner-otp-request", {
          body: {
            email: identity.email.trim().toLowerCase(),
            company: identity.company.trim(),
            portal: config.portal,
            access_code: identity.access_code.trim(),
          },
        });

      if (functionError) {
        throw functionError;
      }

      setOtpRequested(true);
      setOtp("");
    } catch (otpError) {
      console.error(otpError);

      setError(
        "Le code de vérification n'a pas pu être envoyé. Réessayez.",
      );
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOtp() {
    setError(null);

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }

    setOtpLoading(true);

    try {
      const { data, error: functionError } =
        await supabase.functions.invoke("partner-otp-verify", {
          body: {
            email: identity.email.trim().toLowerCase(),
            code: otp.trim(),
            portal: config.portal,
            access_code: identity.access_code.trim(),
          },
        });

      if (functionError) {
        throw functionError;
      }

      if (!data?.verified) {
        throw new Error("Email non vérifié.");
      }

      setEmailVerified(true);
      setOtp("");
    } catch (otpError) {
      console.error(otpError);

      setError(
        "Le code est invalide ou expiré. Demandez un nouveau code.",
      );
    } finally {
      setOtpLoading(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Submission                                                               */
  /* ------------------------------------------------------------------------ */

  async function submit() {
    setError(null);

    if (!canSubmit) {
      setError(
        "Certaines informations obligatoires doivent encore être complétées.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        identity: safeJson(identity),
        documents: safeJson(documents),
        commitments: safeJson(commitments),
        integration: safeJson(integration),
        pilotNotes: pilotNotes.trim(),
        finalDecl,
        emailVerified,
        submittedAt: new Date().toISOString(),
      };

      const summaryLines = [
        `Portail : ${config.portal}`,
        `Société : ${identity.company}`,
        `Représentant légal : ${identity.legal_rep}`,
        `Email : ${identity.email}`,
        `Téléphone : ${identity.phone}`,
        `Adresse : ${identity.address}`,
        "",
        `Documents fournis : ${documents.length}`,
        `Engagements confirmés : ${config.commitments.length}`,
        `Email vérifié : oui`,
        "",
        "Informations d'intégration :",
        ...config.integration.map(
          (field) =>
            `- ${field.label} : ${
              integration[field.id]?.trim() || "Non renseigné"
            }`,
        ),
        "",
        `Pilote : ${pilotNotes.trim()}`,
      ];

      const { data, error: functionError } =
        await supabase.functions.invoke("partner-onboarding-submit", {
          body: {
            access_token: accessToken ?? identity.access_code,
            contact_name: identity.legal_rep,
            company: identity.company,
            payload,
            attachments: documents,
            summary_lines: summaryLines,
            mode,
          },
        });

      if (functionError) {
        throw functionError;
      }

      setSubmissionId(data?.submission_id);
      setPortalUrl(data?.portal_url);

      setSubmitted(true);

      if (mode === "new") {
        localStorage.removeItem(storageKey);
      }

      onSubmitted?.({
        submissionId: data?.submission_id,
        portalUrl: data?.portal_url,
      });
    } catch (submitError) {
      console.error(submitError);

      setError(
        "Votre dossier n'a pas pu être transmis. Vérifiez les informations puis réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Submitted state                                                          */
  /* ------------------------------------------------------------------------ */

  if (submitted) {
    return (
      <section className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border bg-card p-8 shadow-sm md:p-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>

          <div className="mt-6 space-y-3">
            <Badge variant="secondary">
              Dossier transmis
            </Badge>

            <h2 className="text-2xl font-semibold tracking-tight">
              Votre dossier a bien été transmis
            </h2>

            <p className="max-w-2xl text-muted-foreground">
              BIB va maintenant examiner les informations et pièces
              transmises afin de poursuivre le processus de qualification
              et d’intégration.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border bg-muted/30 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div>
                <p className="font-medium">
                  Prochaine étape
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Votre dossier passe en revue opérationnelle. BIB pourra
                  vous contacter si des informations complémentaires sont
                  nécessaires.
                </p>
              </div>
            </div>
          </div>

          {submissionId && (
            <div className="mt-6 rounded-xl border px-4 py-3 text-sm">
              <span className="text-muted-foreground">
                Référence du dossier :
              </span>{" "}
              <span className="font-medium">
                {submissionId}
              </span>
            </div>
          )}

          {portalUrl && (
            <div className="mt-6">
              <Button asChild>
                <a href={portalUrl}>
                  Accéder au suivi du dossier
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Step content                                                             */
  /* ------------------------------------------------------------------------ */

  function renderIdentityStep() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            Identité du partenaire
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Ces informations permettent d’identifier le dossier et
            l’interlocuteur responsable.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="access_code">
              Code d'accès
            </Label>

            <Input
              id="access_code"
              value={identity.access_code}
              onChange={(event) =>
                setIdentity((current) => ({
                  ...current,
                  access_code: event.target.value,
                }))
              }
              placeholder="Code transmis par BIB"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">
              Société
            </Label>

            <Input
              id="company"
              value={identity.company}
              onChange={(event) =>
                setIdentity((current) => ({
                  ...current,
                  company: event.target.value,
                }))
              }
              placeholder="Nom légal de l'entreprise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_rep">
              Représentant légal
            </Label>

            <Input
              id="legal_rep"
              value={identity.legal_rep}
              onChange={(event) =>
                setIdentity((current) => ({
                  ...current,
                  legal_rep: event.target.value,
                }))
              }
              placeholder="Nom et prénom"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>

            <Input
              id="email"
              type="email"
              value={identity.email}
              onChange={(event) => {
                setEmailVerified(false);

                setIdentity((current) => ({
                  ...current,
                  email: event.target.value,
                }));
              }}
              placeholder="contact@entreprise.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Téléphone
            </Label>

            <Input
              id="phone"
              type="tel"
              value={identity.phone}
              onChange={(event) =>
                setIdentity((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              placeholder="+33 ..."
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">
              Adresse
            </Label>

            <Textarea
              id="address"
              value={identity.address}
              onChange={(event) =>
                setIdentity((current) => ({
                  ...current,
                  address: event.target.value,
                }))
              }
              placeholder="Adresse complète de l'entité"
              rows={3}
            />
          </div>
        </div>
      </div>
    );
  }

  function renderDocumentsStep() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            Documents
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Téléversez les documents nécessaires à la vérification du
            dossier.
          </p>
        </div>

        <div className="space-y-4">
          {config.documents.map((slot) => {
            const uploaded = documents.find(
              (document) => document.slotId === slot.id,
            );

            return (
              <div
                key={slot.id}
                className="rounded-2xl border p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {slot.label}
                      </p>

                      {slot.required ? (
                        <Badge variant="secondary">
                          Requis
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Optionnel
                        </Badge>
                      )}
                    </div>

                    {slot.hint && (
                      <p className="text-sm text-muted-foreground">
                        {slot.hint}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <label
                      htmlFor={`document-${slot.id}`}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                        "hover:bg-muted",
                        uploading &&
                          "pointer-events-none opacity-50",
                      )}
                    >
                      <Upload className="h-4 w-4" />
                      {uploaded
                        ? "Remplacer"
                        : "Ajouter"}
                    </label>

                    <input
                      id={`document-${slot.id}`}
                      type="file"
                      className="sr-only"
                      accept={slot.accept}
                      onChange={(event) =>
                        handleDocumentUpload(
                          slot,
                          event.target.files?.[0],
                        )
                      }
                    />
                  </div>
                </div>

                {uploaded && (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileCheck2 className="h-5 w-5 shrink-0 text-primary" />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {uploaded.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploaded.size)}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        removeDocument(slot.id)
                      }
                    >
                      Retirer
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Taille maximale : 8 Mo par fichier.
        </p>
      </div>
    );
  }

  function renderCommitmentsStep() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            Engagements opérationnels
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Confirmez chaque principe applicable au fonctionnement avec
            BIB.
          </p>
        </div>

        <div className="space-y-4">
          {config.commitments.map((commitment) => {
            const checked =
              commitments[commitment.id] === true;

            return (
              <label
                key={commitment.id}
                className={cn(
                  "flex cursor-pointer gap-4 rounded-2xl border p-5 transition-colors",
                  checked && "border-primary/40 bg-primary/5",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) =>
                    setCommitments((current) => ({
                      ...current,
                      [commitment.id]: value === true,
                    }))
                  }
                  className="mt-1"
                />

                <div className="space-y-1">
                  <p className="font-medium">
                    {commitment.title}
                  </p>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {commitment.text}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  }

  function renderIntegrationStep() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            Intégration opérationnelle
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Ces informations servent à préparer le fonctionnement
            opérationnel avec BIB.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {config.integration.map((field) => (
            <div
              key={field.id}
              className={cn(
                "space-y-2",
                field.type === "textarea" &&
                  "md:col-span-2",
              )}
            >
              <Label htmlFor={`integration-${field.id}`}>
                {field.label}
                {field.required && (
                  <span className="ml-1 text-destructive">
                    *
                  </span>
                )}
              </Label>

              {field.type === "textarea" ? (
                <Textarea
                  id={`integration-${field.id}`}
                  value={integration[field.id] ?? ""}
                  onChange={(event) =>
                    setIntegration((current) => ({
                      ...current,
                      [field.id]: event.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  rows={4}
                />
              ) : field.type === "select" ? (
                <select
                  id={`integration-${field.id}`}
                  value={integration[field.id] ?? ""}
                  onChange={(event) =>
                    setIntegration((current) => ({
                      ...current,
                      [field.id]: event.target.value,
                    }))
                  }
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">
                    Sélectionner
                  </option>

                  {field.options?.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={`integration-${field.id}`}
                  type={field.type}
                  value={integration[field.id] ?? ""}
                  onChange={(event) =>
                    setIntegration((current) => ({
                      ...current,
                      [field.id]: event.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                />
              )}

              {field.hint && (
                <p className="text-xs text-muted-foreground">
                  {field.hint}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderPilotStep() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {config.pilot.title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {config.pilot.description}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pilot-notes">
            Informations pour le pilote
          </Label>

          <Textarea
            id="pilot-notes"
            value={pilotNotes}
            onChange={(event) =>
              setPilotNotes(event.target.value)
            }
            placeholder={config.pilot.placeholder}
            rows={9}
          />

          <p className="text-xs text-muted-foreground">
            Minimum recommandé : 20 caractères.
          </p>
        </div>
      </div>
    );
  }

  function renderVerificationStep() {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            Vérification de l’email
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Un code de vérification permet de confirmer que l’adresse
            indiquée dans le dossier est bien accessible par son
            interlocuteur.
          </p>
        </div>

        {emailVerified ? (
          <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />

            <div>
              <p className="font-medium">
                Adresse email vérifiée
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {identity.email}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border p-5">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />

                <div>
                  <p className="font-medium">
                    {identity.email || "Adresse email"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Code à usage unique
                  </p>
                </div>
              </div>
            </div>

            {!otpRequested ? (
              <Button
                type="button"
                className="w-full"
                onClick={requestOtp}
                disabled={otpLoading}
              >
                {otpLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                Envoyer le code
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">
                    Code à 6 chiffres
                  </Label>

                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6),
                      )
                    }
                    placeholder="000000"
                    className="text-center text-lg tracking-[0.35em]"
                  />
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={verifyOtp}
                  disabled={otpLoading || otp.length !== 6}
                >
                  {otpLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  Vérifier le code
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={requestOtp}
                  disabled={otpLoading}
                >
                  Renvoyer un code
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  function renderSummaryStep() {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            Vérification finale
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Vérifiez les informations avant de transmettre définitivement
            le dossier à BIB.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Entreprise
            </p>

            <p className="mt-2 font-medium">
              {identity.company}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {identity.legal_rep}
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Contact
            </p>

            <p className="mt-2 font-medium">
              {identity.email}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {identity.phone}
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Documents
            </p>

            <p className="mt-2 font-medium">
              {documents.length} document
              {documents.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Engagements
            </p>

            <p className="mt-2 font-medium">
              {config.commitments.length} /{" "}
              {config.commitments.length} confirmés
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/30 p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

            <div className="space-y-2">
              <p className="font-medium">
                Déclaration
              </p>

              <p className="text-sm leading-6 text-muted-foreground">
                Je confirme que les informations et documents transmis
                dans ce dossier sont exacts et à jour à ma connaissance.
                Je comprends que BIB peut demander des informations
                complémentaires ou effectuer des contrôles nécessaires
                à l’évaluation du dossier.
              </p>

              <label className="flex cursor-pointer items-start gap-3 pt-2">
                <Checkbox
                  checked={finalDecl}
                  onCheckedChange={(value) =>
                    setFinalDecl(value === true)
                  }
                  className="mt-0.5"
                />

                <span className="text-sm font-medium">
                  Je confirme cette déclaration.
                </span>
              </label>
            </div>
          </div>
        </div>

        {!emailVerified && (
          <Alert>
            <AlertCircle className="h-4 w-4" />

            <AlertDescription>
              L’adresse email doit être vérifiée avant la transmission
              finale du dossier.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  function renderCurrentStep() {
    switch (step) {
      case 1:
        return renderIdentityStep();

      case 2:
        return renderDocumentsStep();

      case 3:
        return renderCommitmentsStep();

      case 4:
        return renderIntegrationStep();

      case 5:
        return renderPilotStep();

      case 6:
        return renderVerificationStep();

      case 7:
        return renderSummaryStep();

      default:
        return null;
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="space-y-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {config.portal === "suppliers"
                ? "Fournisseur"
                : "Partenaire logistique"}
            </Badge>

            <Badge variant="outline">
              Après présélection
            </Badge>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            {config.title}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {config.subtitle}
          </p>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-max items-center gap-2">
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              const active = step === item.id;
              const completed = step > item.id;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() =>
                      completed && goToStep(item.id)
                    }
                    disabled={!completed}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors",
                      active &&
                        "bg-primary text-primary-foreground",
                      completed &&
                        "cursor-pointer bg-muted text-foreground",
                      !active &&
                        !completed &&
                        "text-muted-foreground",
                    )}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}

                    <span>{item.label}</span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div className="h-px w-5 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />

            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          {renderCurrentStep()}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={step === 1 || submitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          {step < STEPS.length ? (
            <Button
              type="button"
              onClick={goNext}
              disabled={submitting}
            >
              Continuer
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={submit}
              disabled={!canSubmit || submitting}
            >
              {submitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              Transmettre le dossier
              {!submitting && (
                <Check className="ml-2 h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        <p className="text-center text-xs leading-5 text-muted-foreground">
          Les informations transmises sont utilisées dans le cadre de
          l’étude, de la qualification et de l’intégration opérationnelle
          du partenaire auprès de BIB.
        </p>
      </div>
    </section>
  );
}
