import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import {
  PartnerOnboardingWizard,
  type OnboardingPrefill,
} from "@/components/standalone/PartnerOnboardingWizard";
import { PARTNER_ONBOARDING_CONFIGS } from "@/config/partnerOnboarding";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Loader2,
  PackageCheck,
  Pencil,
  Rocket,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type Status =
  | "draft"
  | "email_verified"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

interface Submission {
  id: string;
  portal: "suppliers" | "ops";
  contact_email: string;
  contact_name: string | null;
  company: string | null;
  status: Status;
  payload: Record<string, unknown>;
  kyc_attachments: { slotId?: string; fileName: string; path: string; size?: number; mimeType?: string }[];
  support_ticket_id: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface HistoryEntry {
  id: string;
  changed_at: string;
  change_summary: string;
  diff: Record<string, unknown>;
  actor_email: string | null;
}

const TIMELINE: { key: Status | "go_live"; label: string; icon: typeof FileCheck2 }[] = [
  { key: "submitted", label: "Documents reçus", icon: FileCheck2 },
  { key: "under_review", label: "Conformité validée", icon: ShieldCheck },
  { key: "approved", label: "Intégration planifiée", icon: PackageCheck },
  { key: "go_live", label: "Go-live", icon: Rocket },
];

function statusIndex(status: Status): number {
  switch (status) {
    case "draft":
    case "email_verified":
      return -1;
    case "submitted":
      return 0;
    case "under_review":
      return 1;
    case "approved":
      return 2;
    case "rejected":
      return -1;
    default:
      return -1;
  }
}

export default function PartnerOnboardingPortal() {
  const { token = "" } = useParams<{ token: string }>();
  const [sub, setSub] = useState<Submission | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useSEO({
    title: sub
      ? `Suivi onboarding · ${sub.company ?? sub.contact_email} — Brand-In-A-Box`
      : "Suivi onboarding — Brand-In-A-Box",
    description: "Suivi en temps réel de votre dossier d'onboarding partenaire.",
  });

  async function load() {
    if (!token) {
      setError("Lien invalide.");
      setLoading(false);
      return;
    }
    setLoading(true);
    const client = supabase as unknown as {
      rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>;
    };
    const [{ data: s, error: se }, { data: h }] = await Promise.all([
      client.rpc("partner_load_submission", { _access_token: token }),
      client.rpc("partner_load_history", { _access_token: token }),
    ]);
    setLoading(false);
    if (se || !s || (Array.isArray(s) && s.length === 0)) {
      setError("Lien expiré ou invalide. Demandez un nouveau code.");
      return;
    }
    const row = (Array.isArray(s) ? s[0] : s) as unknown as Submission;
    setSub(row);
    setHistory(Array.isArray(h) ? (h as unknown as HistoryEntry[]) : []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const config = useMemo(() => sub ? PARTNER_ONBOARDING_CONFIGS[sub.portal] : null, [sub]);

  if (loading) {
    return (
      <StandaloneLayout portal="Suppliers" accent="primary" menuItems={[]}>
        <section className="container mx-auto px-4 py-20 max-w-xl text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">Chargement de votre dossier…</p>
        </section>
      </StandaloneLayout>
    );
  }

  if (error || !sub || !config) {
    return (
      <StandaloneLayout portal="Suppliers" accent="primary" menuItems={[]}>
        <section className="container mx-auto px-4 py-16 max-w-xl">
          <Card className="p-6 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h2 className="font-semibold">Accès impossible</h2>
                <p className="text-sm text-muted-foreground mt-1">{error ?? "Dossier introuvable."}</p>
                <div className="flex gap-2 mt-4">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/suppliers/onboarding/resume?portal=suppliers">Renvoyer un code Suppliers</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/ops/onboarding/resume?portal=ops">Renvoyer un code Logistique</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </StandaloneLayout>
    );
  }

  const portalLabel = sub.portal === "suppliers" ? "Suppliers" : "Ops";
  const accent = sub.portal === "suppliers" ? "primary" : "accent";
  const isApproved = sub.status === "approved";
  const isRejected = sub.status === "rejected";
  const canEdit = !isApproved && !isRejected;
  const idx = statusIndex(sub.status);

  if (editing && canEdit) {
    const prefill: OnboardingPrefill = {
      accessToken: token,
      contactEmail: sub.contact_email,
      contactName: sub.contact_name,
      company: sub.company,
      payload: sub.payload,
      kycAttachments: sub.kyc_attachments ?? [],
      portalUrl: typeof window !== "undefined" ? window.location.href : undefined,
    };
    return (
      <StandaloneLayout
        portal={portalLabel}
        accent={accent}
        menuItems={[
          { label: "Présentation", href: sub.portal === "suppliers" ? "/suppliers" : "/ops", icon: sub.portal === "suppliers" ? "layers" : "truck" },
          { label: "Mon dossier", href: `/portal/onboarding/${token}`, icon: "file" },
        ]}
      >
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-3xl">
          <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => setEditing(false)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Revenir au suivi
          </Button>
          <Badge variant="secondary" className="mb-3">Édition · Avant validation finale</Badge>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Modifier mon dossier</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Vos modifications seront envoyées à l'équipe Ops avec un historique des changements.
          </p>
          <PartnerOnboardingWizard
            config={config}
            mode="edit"
            prefill={prefill}
            onSubmitted={() => {
              setEditing(false);
              load();
            }}
          />
        </section>
      </StandaloneLayout>
    );
  }

  return (
    <StandaloneLayout
      portal={portalLabel}
      accent={accent}
      menuItems={[
        { label: "Présentation", href: sub.portal === "suppliers" ? "/suppliers" : "/ops", icon: sub.portal === "suppliers" ? "layers" : "truck" },
        { label: "Candidature", href: sub.portal === "suppliers" ? "/suppliers/apply" : "/ops/apply", icon: "clipboard" },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-3xl space-y-6">
        <div>
          <Badge variant="secondary" className="mb-3">Suivi onboarding {portalLabel}</Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {sub.company ?? sub.contact_email}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Dossier #{sub.id.slice(0, 8)} · {sub.contact_email}
            {sub.support_ticket_id && <> · Ticket #{sub.support_ticket_id.slice(0, 8)}</>}
          </p>
        </div>

        {/* Status banner */}
        <Card className={`p-5 ${isApproved ? "bg-success/5 border-success/30" : isRejected ? "bg-destructive/5 border-destructive/30" : "bg-muted/30"}`}>
          <div className="flex items-start gap-3">
            {isApproved ? <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
              : isRejected ? <XCircle className="w-5 h-5 text-destructive mt-0.5" />
              : <Clock3 className="w-5 h-5 text-primary mt-0.5" />}
            <div className="flex-1">
              <p className="font-semibold text-sm">
                {isApproved ? "Dossier validé — accès au portail ouvert"
                  : isRejected ? "Dossier refusé — voir motifs ci-dessous"
                  : sub.status === "submitted" ? "Soumis — en file d'instruction"
                  : sub.status === "under_review" ? "En revue par l'équipe Ops"
                  : "Brouillon — en attente de soumission"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Dernière mise à jour : {new Date(sub.updated_at).toLocaleString("fr-FR")}
              </p>
            </div>
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Modifier
              </Button>
            )}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold mb-4">Étapes</h2>
          <ol className="space-y-3">
            {TIMELINE.map((stage, i) => {
              const done = i <= idx;
              const current = i === idx + (sub.status === "approved" ? 0 : 0);
              const Icon = stage.icon;
              return (
                <li key={stage.key} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center border ${
                    done
                      ? "bg-success text-success-foreground border-success"
                      : current
                      ? "bg-primary/10 text-primary border-primary/40"
                      : "bg-muted text-muted-foreground border-border"
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className={`text-sm font-medium ${done ? "" : "text-muted-foreground"}`}>{stage.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {stage.key === "submitted" && sub.submitted_at && `Soumis le ${new Date(sub.submitted_at).toLocaleDateString("fr-FR")}`}
                      {stage.key === "approved" && sub.approved_at && `Validé le ${new Date(sub.approved_at).toLocaleDateString("fr-FR")}`}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        {/* Documents */}
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold mb-3">Documents transmis</h2>
          {sub.kyc_attachments?.length ? (
            <ul className="space-y-2 text-sm">
              {sub.kyc_attachments.map((k, i) => (
                <li key={i} className="flex items-center gap-2 text-muted-foreground">
                  <FileCheck2 className="w-3.5 h-3.5 text-success" />
                  <span className="truncate">{k.fileName}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun document attaché.</p>
          )}
        </Card>

        {/* History */}
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold mb-3">Historique</h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pas encore d'événement.</p>
          ) : (
            <ul className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="text-sm">
                  <p className="font-medium">{h.change_summary}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(h.changed_at).toLocaleString("fr-FR")}
                    {h.actor_email && ` · ${h.actor_email}`}
                  </p>
                  {Object.keys(h.diff ?? {}).length > 0 && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Champs modifiés : {Object.keys(h.diff).join(", ")}
                    </p>
                  )}
                  <Separator className="mt-3" />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {isApproved && (
          <Card className="p-5 bg-primary/5 border-primary/30">
            <p className="text-sm">
              Votre accès au portail opérationnel <strong>{portalLabel}</strong> est ouvert.
              Un email avec votre lien de connexion vous a été transmis.
            </p>
          </Card>
        )}
      </section>
    </StandaloneLayout>
  );
}