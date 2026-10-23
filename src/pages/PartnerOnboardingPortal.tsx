import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import PartnerOnboardingWizard from "@/components/standalone/PartnerOnboardingWizard";
import type { OnboardingConfig } from "@/components/standalone/PartnerOnboardingWizard";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Portal = "suppliers" | "ops";

type Status =
  | "draft"
  | "email_verified"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

interface Submission {
  id: string;
  portal: Portal;
  contact_email: string;
  contact_name: string;
  company: string;
  status: Status;
  payload: Record<string, unknown>;
  attachments: unknown[];
  support_ticket_id?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface HistoryEntry {
  id?: string;
  status?: Status;
  action?: string;
  message?: string;
  created_at?: string;
  created_by?: string | null;
}

interface PartnerOnboardingPortalProps {
  portal: Portal;
  token: string;
  config: OnboardingConfig;
}

/* -------------------------------------------------------------------------- */
/* Status configuration                                                       */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    description: string;
    icon: typeof Check;
    tone: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  draft: {
    label: "Brouillon",
    description:
      "Le dossier a été commencé mais n’a pas encore été transmis.",
    icon: Clock3,
    tone: "outline",
  },

  email_verified: {
    label: "Email vérifié",
    description:
      "L’adresse email du dossier a été vérifiée.",
    icon: ShieldCheck,
    tone: "secondary",
  },

  submitted: {
    label: english ? "Submitted" : "Dossier transmis",
    description:
      "Le dossier a été transmis à BIB et attend son examen.",
    icon: FileCheck2,
    tone: "secondary",
  },

  under_review: {
    label: "En cours d’examen",
    description:
      "BIB examine actuellement les informations et documents transmis.",
    icon: Clock3,
    tone: "secondary",
  },

  approved: {
    label: "Dossier validé",
    description:
      "Le dossier a été validé pour la suite du processus d’intégration.",
    icon: CheckCircle2,
    tone: "secondary",
  },

  rejected: {
    label: "Dossier non retenu",
    description:
      "Le dossier n’est pas retenu dans son état actuel.",
    icon: XCircle,
    tone: "destructive",
  },
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const EN_STATUS_CONFIG: typeof STATUS_CONFIG = {
  draft: { ...STATUS_CONFIG.draft, label: "Draft", description: "This file has been started but not yet submitted." },
  email_verified: { ...STATUS_CONFIG.email_verified, label: "Email verified", description: "The email address on this file has been verified." },
  submitted: { ...STATUS_CONFIG.submitted, label: "Submitted", description: "The file has been submitted to BIB and is awaiting review." },
  under_review: { ...STATUS_CONFIG.under_review, label: "Under review", description: "BIB is reviewing the submitted information and documents." },
  approved: { ...STATUS_CONFIG.approved, label: "Approved", description: "The file has been approved for the next onboarding steps." },
  rejected: { ...STATUS_CONFIG.rejected, label: "Not selected", description: "The file has not been selected in its current state." },
};
const STATUS_ORDER: Status[] = [
  "draft",
  "email_verified",
  "submitted",
  "under_review",
  "approved",
];

function formatDate(value?: string | null, lang: "fr" | "en" = "fr") {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusIndex(status: Status) {
  const index = STATUS_ORDER.indexOf(status);

  return index >= 0 ? index : -1;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function PartnerOnboardingPortal({
  portal,
  token,
  config,
}: PartnerOnboardingPortalProps) {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => english ? en : fr;
  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Load submission                                                          */
  /* ------------------------------------------------------------------------ */

  const loadPortal = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const [
          { data: submissionData, error: submissionError },
          { data: historyData, error: historyError },
        ] = await Promise.all([
          (supabase.rpc as any)("partner_load_submission", {
            _access_token: token,
          }),

          (supabase.rpc as any)("partner_load_history", {
            _access_token: token,
          }),
        ]);

        if (submissionError) {
          throw submissionError;
        }

        if (historyError) {
          throw historyError;
        }

        if (!submissionData) {
          throw new Error(
            "Dossier introuvable ou accès expiré.",
          );
        }

        setSubmission(submissionData as unknown as Submission);
        setHistory(
          Array.isArray(historyData)
            ? (historyData as HistoryEntry[])
            : [],
        );
      } catch (loadError) {
        console.error(loadError);

        setSubmission(null);
        setHistory([]);

        setError(
          "Impossible de charger votre dossier. Vérifiez le lien d'accès ou réessayez.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, english],
  );

  useEffect(() => {
    loadPortal();
  }, [loadPortal]);

  /* ------------------------------------------------------------------------ */
  /* Derived values                                                           */
  /* ------------------------------------------------------------------------ */

  const status = submission?.status ?? "draft";

  const statusConfig = english ? EN_STATUS_CONFIG[status] : STATUS_CONFIG[status];

  const StatusIcon = statusConfig.icon;

  const statusIndex = getStatusIndex(status);

  const canEdit =
    submission != null &&
    status !== "approved" &&
    status !== "rejected";

  const isFinal =
    status === "approved" || status === "rejected";

  const timeline = useMemo(() => {
    return [
      {
        status: "submitted" as Status,
        label: english ? "Submitted" : "Dossier transmis",
        description:
          english ? "The completed file has been submitted to BIB." : "Le dossier complet a été transmis à BIB.",
      },
      {
        status: "under_review" as Status,
        label: english ? "File review" : "Examen du dossier",
        description:
          english ? "BIB is reviewing the information, documents and operational details." : "BIB vérifie les informations, documents et éléments opérationnels.",
      },
      {
        status: "approved" as Status,
        label: english ? "Approval" : "Validation",
        description:
          "Le dossier est validé pour la suite de l’intégration.",
      },
    ];
  }, [english]);

  /* ------------------------------------------------------------------------ */
  /* Edit mode                                                                */
  /* ------------------------------------------------------------------------ */

  if (editing && submission) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tx("Retour au dossier", "Back to file")}
            </Button>
          </div>

          <PartnerOnboardingWizard
            config={config}
            mode="edit"
            accessToken={token}
            initialValues={{
              company: submission.company,
              legal_rep:
                typeof submission.payload?.identity ===
                "object"
                  ? String(
                      (
                        submission.payload.identity as Record<
                          string,
                          unknown
                        >
                      )?.legal_rep ?? "",
                    )
                  : "",
              email: submission.contact_email,
              phone:
                typeof submission.payload?.identity ===
                "object"
                  ? String(
                      (
                        submission.payload.identity as Record<
                          string,
                          unknown
                        >
                      )?.phone ?? "",
                    )
                  : "",
              address:
                typeof submission.payload?.identity ===
                "object"
                  ? String(
                      (
                        submission.payload.identity as Record<
                          string,
                          unknown
                        >
                      )?.address ?? "",
                    )
                  : "",
              access_code: token,
            }}
            initialPayload={submission.payload}
            initialDocuments={
              Array.isArray(submission.attachments)
                ? (submission.attachments as any[])
                : []
            }
            initialEmailVerified={
              submission.status === "email_verified" ||
              submission.status === "submitted" ||
              submission.status === "under_review" ||
              submission.status === "approved"
            }
            onSubmitted={() => {
              setEditing(false);
              loadPortal();
            }}
          />
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          {tx("Chargement du dossier…", "Loading file…")}
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (!submission) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4">
        <Card className="w-full">
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>

            <CardTitle className="mt-4">
              {tx("Dossier inaccessible", "File unavailable")}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">
              {error ??
                "Ce lien ne permet pas d’accéder au dossier demandé."}
            </p>

            <Button
              type="button"
              onClick={() => loadPortal()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {tx("Réessayer", "Try again")}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Main portal                                                              */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {portal === "suppliers" ? tx("Fournisseur", "Supplier") : tx("Partenaire logistique", "Logistics partner")}
              </Badge>

              <Badge variant="outline">
                {tx("Dossier partenaire", "Partner file")}
              </Badge>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              {tx("Suivi de votre dossier", "Your file status")}
            </h1>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              {submission.company}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => loadPortal(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}

            {tx("Actualiser", "Refresh")}
          </Button>
        </header>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />

            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Current status */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                    status === "rejected"
                      ? "bg-destructive/10"
                      : "bg-primary/10",
                  )}
                >
                  <StatusIcon
                    className={cn(
                      "h-6 w-6",
                      status === "rejected"
                        ? "text-destructive"
                        : "text-primary",
                    )}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {statusConfig.label}
                    </h2>

                    <Badge
                      variant={statusConfig.tone}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {statusConfig.description}
                  </p>
                </div>
              </div>

              {canEdit && (
                <Button
                  type="button"
                  onClick={() => setEditing(true)}
                >
                  {tx("Modifier le dossier", "Edit file")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>
              {tx("Progression du dossier", "File progress")}
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              {tx("Les étapes affichées correspondent à l’avancement connu", "The steps shown reflect the latest known progress")}
              {tx("de votre dossier.", "of your file.")}
            </p>
          </CardHeader>

          <CardContent>
            <div className="space-y-0">
              {timeline.map((item, index) => {
                const itemIndex = getStatusIndex(
                  item.status,
                );

                const completed =
                  statusIndex >= itemIndex &&
                  status !== "rejected";

                const current =
                  status === item.status;

                const isLast =
                  index === timeline.length - 1;

                return (
                  <div
                    key={item.status}
                    className="relative flex gap-4"
                  >
                    {!isLast && (
                      <div
                        className={cn(
                          "absolute left-[15px] top-8 h-[calc(100%-8px)] w-px",
                          completed
                            ? "bg-primary/40"
                            : "bg-border",
                        )}
                      />
                    )}

                    <div
                      className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                        completed
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-background text-muted-foreground",
                        current &&
                          "ring-4 ring-primary/10",
                      )}
                    >
                      {completed ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div
                      className={cn(
                        "pb-8",
                        isLast && "pb-0",
                      )}
                    >
                      <p className="font-medium">
                        {item.label}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              {status === "rejected" && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

                  <div>
                    <p className="font-medium">
                      {tx("Dossier non retenu", "Not selected")}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {tx("Consultez l’historique ci-dessous pour connaître", "See the history below for")}
                      {tx("les informations éventuellement communiquées par BIB.", "any information shared by BIB.")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {tx("Informations du dossier", "File information")}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {tx("Société", "Company")}
                </p>

                <p className="mt-1 font-medium">
                  {submission.company}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {tx("Contact", "Contact")}
                </p>

                <p className="mt-1 font-medium">
                  {submission.contact_name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {submission.contact_email}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {tx("Référence", "Reference")}
                </p>

                <p className="mt-1 break-all font-mono text-sm">
                  {submission.id}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {tx("Dates clés", "Key dates")}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {tx("Création", "Created")}
                </p>

                <p className="mt-1 text-sm">
                  {formatDate(submission.created_at, lang)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {tx("Dernière mise à jour", "Last updated")}
                </p>

                <p className="mt-1 text-sm">
                  {formatDate(submission.updated_at, lang)}
                </p>
              </div>

              {submission.submitted_at && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {tx("Transmission", "Submitted")}
                  </p>

                  <p className="mt-1 text-sm">
                    {formatDate(submission.submitted_at, lang)}
                  </p>
                </div>
              )}

              {submission.approved_at && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {tx("Validation", "Approval")}
                  </p>

                  <p className="mt-1 text-sm">
                    {formatDate(submission.approved_at, lang)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approved */}
        {status === "approved" && (
          <Card className="border-primary/30">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    {tx("Dossier validé", "File approved")}
                  </h2>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {tx("Votre dossier a été validé. Les prochaines étapes", "Your file has been approved. The next steps")}
                    {tx("opérationnelles seront définies selon le périmètre", "will be set according to the agreed")}
                    {tx("retenu avec BIB.", "scope with BIB.")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>
              {tx("Historique du dossier", "File history")}
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              {tx("Les dernières actions enregistrées sur votre dossier.", "The latest actions recorded on your file.")}
            </p>
          </CardHeader>

          <CardContent>
            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center">
                <Clock3 className="mx-auto h-5 w-5 text-muted-foreground" />

                <p className="mt-2 text-sm text-muted-foreground">
                  {tx("Aucun événement complémentaire à afficher.", "No additional events to display.")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <div
                    key={
                      entry.id ??
                      `${entry.created_at}-${index}`
                    }
                    className="flex gap-4 rounded-2xl border p-4"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Clock3 className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {entry.status && (
                          <Badge variant="outline">
                            {STATUS_CONFIG[entry.status]?.label ??
                              entry.status}
                          </Badge>
                        )}

                        {entry.created_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.created_at, lang)}
                          </span>
                        )}
                      </div>

                      {entry.action && (
                        <p className="mt-2 font-medium">
                          {entry.action}
                        </p>
                      )}

                      {entry.message && (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {entry.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer notice */}
        <div className="flex items-start gap-3 rounded-2xl border bg-muted/30 p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <p className="text-sm leading-6 text-muted-foreground">
            {tx("Ce portail permet de consulter et, lorsque le dossier le", "This portal lets you review and, when the file allows,")}
            {tx("permet, de compléter les informations transmises à BIB.", "complete the information submitted to BIB.")}
            {tx("Les éventuelles étapes opérationnelles ultérieures sont", "Any later operational steps will be")}
            {tx("communiquées séparément selon la validation du dossier.", "communicated separately, based on the file review.")}
          </p>
        </div>

        {isFinal && (
          <p className="text-center text-xs text-muted-foreground">
            {tx("Dernière mise à jour :", "Last updated:")}{" "}
            {formatDate(submission.updated_at, lang)}
          </p>
        )}
      </div>
    </main>
  );
}