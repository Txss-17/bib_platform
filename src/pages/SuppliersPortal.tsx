import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { usePartnerPortal, type PortalEvent } from "@/hooks/usePartnerPortal";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileUp,
  Loader2,
  Package,
  PackagePlus,
  TriangleAlert,
  Truck,
  XCircle,
  Factory,
  Printer,
  ShieldCheck,
  FileText,
  BarChart3,
} from "lucide-react";

const STATUS_LABEL: Record<PortalEvent["status"], string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  rejected: "Refusé",
};

const STATUS_VARIANT: Record<PortalEvent["status"], "secondary" | "outline" | "default" | "destructive"> = {
  open: "secondary",
  in_progress: "outline",
  resolved: "default",
  rejected: "destructive",
};

export default function SuppliersPortal() {
  const { token = "" } = useParams<{ token: string }>();
  const { data, loading, error, callAction } = usePartnerPortal(token);
  const [busy, setBusy] = useState(false);

  // Catalog draft form state
  const [catName, setCatName] = useState("");
  const [catCategory, setCatCategory] = useState("");
  const [catPrice, setCatPrice] = useState("");
  const [catMoq, setCatMoq] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Issue report state
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDesc, setIssueDesc] = useState("");

  // Document upload state
  const [docCategory, setDocCategory] = useState("Certification");

  useSEO({
    title: data
      ? `Portail Suppliers · ${data.submission.company ?? data.submission.contact_email} — Brand-In-A-Box`
      : "Portail Suppliers — Brand-In-A-Box",
    description: "Espace opérationnel fournisseurs : catalogue, MOQ, documents, signalements.",
  });

  if (loading) {
    return (
      <StandaloneLayout portal="Suppliers" accent="primary">
        <section className="container mx-auto px-4 py-20 max-w-xl text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">Chargement du portail…</p>
        </section>
      </StandaloneLayout>
    );
  }

  if (error || !data) {
    return (
      <StandaloneLayout portal="Suppliers" accent="primary">
        <section className="container mx-auto px-4 py-16 max-w-xl">
          <Card className="p-6 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h2 className="font-semibold">Accès impossible</h2>
                <p className="text-sm text-muted-foreground mt-1">{error ?? "Dossier introuvable."}</p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link to="/suppliers/onboarding/resume?portal=suppliers">
                    Récupérer l'accès à mon dossier
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </StandaloneLayout>
    );
  }

  const { submission, documents, events } = data;
  const catalogDrafts = events.filter((e) => e.kind === "catalog_draft");
  const moqRequests = events.filter((e) => e.kind === "moq_request");
  const issues = events.filter((e) => e.kind === "issue_report");

  async function submitCatalog() {
    if (!catName.trim() || !catPrice) {
      toast({ title: "Champs manquants", description: "Nom et prix de base requis." });
      return;
    }
    setBusy(true);
    try {
      await callAction({
        action: "create_event",
        kind: "catalog_draft",
        title: catName.trim(),
        payload: {
          category: catCategory,
          base_price_eur: Number(catPrice),
          moq: catMoq ? Number(catMoq) : null,
          description: catDesc,
        },
      });
      setCatName(""); setCatCategory(""); setCatPrice(""); setCatMoq(""); setCatDesc("");
      toast({ title: "Produit envoyé en validation", description: "L'équipe revient vers vous sous 48h." });
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function submitIssue() {
    if (!issueTitle.trim() || !issueDesc.trim()) {
      toast({ title: "Champs manquants", description: "Titre et description requis." });
      return;
    }
    setBusy(true);
    try {
      await callAction({
        action: "create_event",
        kind: "issue_report",
        title: issueTitle.trim(),
        payload: { description: issueDesc.trim() },
      });
      setIssueTitle(""); setIssueDesc("");
      toast({ title: "Signalement envoyé", description: "Notre équipe Ops vous répond sous 24h." });
    } catch (e) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function handleDocUpload(file: File) {
    setBusy(true);
    try {
      const path = `partner-portal/${submission.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage
        .from("support-attachments")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      await callAction({
        action: "add_document",
        category: docCategory,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type,
        byte_size: file.size,
      });
      toast({ title: "Document transmis", description: file.name });
    } catch (e) {
      toast({ title: "Erreur upload", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <StandaloneLayout
      portal="Suppliers"
      accent="primary"
      menuItems={[
        { label: "Présentation", href: "/suppliers", icon: "layers" },
        { label: "Mon dossier", href: `/portal/onboarding/${token}`, icon: "file" },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-5xl space-y-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link to={`/portal/onboarding/${token}`}>
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Suivi onboarding
            </Link>
          </Button>
          <Badge variant="secondary" className="mb-2">Portail opérationnel · Suppliers</Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {submission.company ?? submission.contact_email}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Catalogue, demandes MOQ, documents, signalements.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Package className="w-4 h-4" />} label="Produits en validation" value={catalogDrafts.filter(e => e.status === "open").length} />
          <StatCard icon={<Truck className="w-4 h-4" />} label="MOQ à livrer" value={moqRequests.filter(e => e.status !== "resolved").length} />
          <StatCard icon={<TriangleAlert className="w-4 h-4" />} label="Signalements ouverts" value={issues.filter(e => e.status === "open").length} />
          <StatCard icon={<FileUp className="w-4 h-4" />} label="Documents" value={documents.length} />
        </div>

        <Tabs defaultValue="catalog">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="catalog">Catalogue</TabsTrigger>
            <TabsTrigger value="moq">Demandes MOQ</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="signal">Signaler</TabsTrigger>
          </TabsList>

          {/* CATALOG */}
          <TabsContent value="catalog" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-primary" /> Déposer un produit
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Nom du produit *</Label><Input value={catName} onChange={(e) => setCatName(e.target.value)} /></div>
                <div><Label>Catégorie</Label><Input value={catCategory} onChange={(e) => setCatCategory(e.target.value)} placeholder="ex: textile, beauté" /></div>
                <div><Label>Prix de base (€) *</Label><Input type="number" step="0.01" value={catPrice} onChange={(e) => setCatPrice(e.target.value)} /></div>
                <div><Label>MOQ minimum</Label><Input type="number" value={catMoq} onChange={(e) => setCatMoq(e.target.value)} /></div>
                <div className="sm:col-span-2"><Label>Description / spécifications</Label><Textarea rows={3} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} /></div>
              </div>
              <Button onClick={submitCatalog} disabled={busy} className="mt-4">
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Envoyer en validation
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3">Statut de mes produits</h3>
              <EventList events={catalogDrafts} emptyLabel="Aucun produit déposé pour le moment." />
            </Card>
          </TabsContent>

          {/* MOQ */}
          <TabsContent value="moq" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Demandes MOQ à livrer au partenaire logistique
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Lorsqu'une boutique atteint le MOQ, vous recevez ici la demande à expédier au partenaire logistique
                désigné. Marquez chaque demande comme expédiée une fois traitée.
              </p>
              <EventList
                events={moqRequests}
                emptyLabel="Aucune demande MOQ active."
                allowStatusUpdate
                onStatusChange={(id, status) =>
                  callAction({ action: "update_event_status", event_id: id, status }).catch((e) =>
                    toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" }),
                  )
                }
              />
            </Card>
          </TabsContent>

          {/* DOCUMENTS */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileUp className="w-4 h-4 text-primary" /> Uploader un document
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 items-end">
                <div>
                  <Label>Catégorie</Label>
                  <Input value={docCategory} onChange={(e) => setDocCategory(e.target.value)} placeholder="ex: ISO 9001, fiche technique" />
                </div>
                <div>
                  <Label>Fichier</Label>
                  <Input
                    type="file"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleDocUpload(f);
                      e.currentTarget.value = "";
                    }}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3">Documents transmis</h3>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun document complémentaire.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {documents.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                        <span className="truncate">{d.file_name}</span>
                        <Badge variant="outline" className="shrink-0">{d.category}</Badge>
                      </div>
                      <Badge variant={d.status === "validated" ? "default" : d.status === "rejected" ? "destructive" : "secondary"}>
                        {d.status === "validated" ? "Validé" : d.status === "rejected" ? "Refusé" : "Reçu"}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </TabsContent>

          {/* SIGNAL */}
          <TabsContent value="signal" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> Signaler un problème
              </h3>
              <div className="space-y-3">
                <div><Label>Titre *</Label><Input value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} placeholder="ex: Rupture de stock imminente" /></div>
                <div><Label>Description *</Label><Textarea rows={4} value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} /></div>
                <Button onClick={submitIssue} disabled={busy}>
                  {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Envoyer le signalement
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3">Mes signalements</h3>
              <EventList events={issues} emptyLabel="Aucun signalement." />
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </StandaloneLayout>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">{icon} {label}</div>
      <p className="text-2xl font-display font-semibold mt-2">{value}</p>
    </Card>
  );
}

function EventList({
  events,
  emptyLabel,
  allowStatusUpdate,
  onStatusChange,
}: {
  events: PortalEvent[];
  emptyLabel: string;
  allowStatusUpdate?: boolean;
  onStatusChange?: (id: string, status: "in_progress" | "resolved" | "rejected") => void;
}) {
  if (events.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id} className="border-b border-border/50 pb-3 last:border-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-sm">{e.title}</p>
              <p className="text-[11px] text-muted-foreground">{new Date(e.created_at).toLocaleString("fr-FR")}</p>
            </div>
            <Badge variant={STATUS_VARIANT[e.status]}>{STATUS_LABEL[e.status]}</Badge>
          </div>
          {allowStatusUpdate && e.status !== "resolved" && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => onStatusChange?.(e.id, "in_progress")}>
                Préparation
              </Button>
              <Button size="sm" onClick={() => onStatusChange?.(e.id, "resolved")}>
                Marquer expédié
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}