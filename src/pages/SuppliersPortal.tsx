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
import { useLanguage } from "@/contexts/LanguageContext";
import { PlatformTour, PlatformTourLauncher } from "@/components/tour/PlatformTour";
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
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => english ? en : fr;
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
          <p className="text-sm text-muted-foreground mt-3">{tx("Chargement du portail…", "Loading portal…")}</p>
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
                <h2 className="font-semibold">{tx("Accès impossible", "Access unavailable")}</h2>
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
  const productionEvents = events.filter((e) => e.kind === "delivery_update");
  const auditEvents = events.filter((e) => e.kind === "packaging_alert");
  const invoiceDocs = documents.filter((d) =>
    /facture|invoice/i.test(d.category) || /facture|invoice/i.test(d.file_name),
  );
  const totalMoqDelivered = moqRequests.filter((e) => e.status === "resolved").length;
  const totalProductionConfirmed = productionEvents.filter((e) => e.status === "resolved").length;
  const openAudits = auditEvents.filter((e) => e.status !== "resolved").length;

  async function submitCatalog() {
    if (!catName.trim() || !catPrice) {
      toast({ title: tx("Champs manquants", "Missing fields"), description: tx("Nom et prix de base requis.", "Product name and base price are required.") });
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
      toast({ title: tx("Produit envoyé en validation", "Product submitted for review"), description: tx("L'équipe revient vers vous sous 48h.", "Our team will get back to you within 48 hours.") });
    } catch (e) {
      toast({ title: tx("Erreur", "Error"), description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function submitIssue() {
    if (!issueTitle.trim() || !issueDesc.trim()) {
      toast({ title: tx("Champs manquants", "Missing fields"), description: tx("Titre et description requis.", "A title and description are required.") });
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
      toast({ title: tx("Signalement envoyé", "Report submitted"), description: tx("Notre équipe Ops vous répond sous 24h.", "Our operations team will reply within 24 hours.") });
    } catch (e) {
      toast({ title: tx("Erreur", "Error"), description: (e as Error).message, variant: "destructive" });
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
      toast({ title: tx("Document transmis", "Document uploaded"), description: file.name });
    } catch (e) {
      toast({ title: tx("Erreur upload", "Upload error"), description: (e as Error).message, variant: "destructive" });
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
              <ArrowLeft className="w-4 h-4 mr-1.5" /> {tx("Suivi onboarding", "Onboarding status")}
            </Link>
          </Button>
          <Badge variant="secondary" className="mb-2">{tx("Portail opérationnel · Suppliers", "Operations portal · Suppliers")}</Badge>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              {submission.company ?? submission.contact_email}
            </h1>
            <PlatformTourLauncher label={tx("Guide partenaire", "Partner guide")} availablePersonas={["ops", "supplier"]} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {tx("Catalogue, demandes MOQ, documents, signalements.", "Catalog, MOQ requests, documents and reports.")}
          </p>
          <PlatformTour autoOpen availablePersonas={["ops", "supplier"]} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Package className="w-4 h-4" />} label={tx("Produits en validation", "Products under review")} value={catalogDrafts.filter(e => e.status === "open").length} />
          <StatCard icon={<Truck className="w-4 h-4" />} label={tx("MOQ à livrer", "MOQ to deliver")} value={moqRequests.filter(e => e.status !== "resolved").length} />
          <StatCard icon={<TriangleAlert className="w-4 h-4" />} label={tx("Signalements ouverts", "Open reports")} value={issues.filter(e => e.status === "open").length} />
          <StatCard icon={<FileUp className="w-4 h-4" />} label="Documents" value={documents.length} />
        </div>

        <Tabs defaultValue="catalog">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="catalog">{tx("Catalogue", "Catalog")}</TabsTrigger>
            <TabsTrigger value="moq">{tx("Demandes MOQ", "MOQ requests")}</TabsTrigger>
            <TabsTrigger value="operations">{tx("Opérations", "Operations")}</TabsTrigger>
            <TabsTrigger value="documents">{tx("Documents", "Documents")}</TabsTrigger>
            <TabsTrigger value="signal">{tx("Signaler", "Report an issue")}</TabsTrigger>
          </TabsList>

          {/* CATALOG */}
          <TabsContent value="catalog" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <PackagePlus className="w-4 h-4 text-primary" /> {tx("Déposer un produit", "Submit a product")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>{tx("Nom du produit *", "Product name *")}</Label><Input value={catName} onChange={(e) => setCatName(e.target.value)} /></div>
                <div><Label>{tx("Catégorie", "Category")}</Label><Input value={catCategory} onChange={(e) => setCatCategory(e.target.value)} placeholder={tx("ex: textile, beauté", "e.g. textiles, beauty")} /></div>
                <div><Label>{tx("Prix de base (€) *", "Base price (€) *")}</Label><Input type="number" step="0.01" value={catPrice} onChange={(e) => setCatPrice(e.target.value)} /></div>
                <div><Label>{tx("MOQ minimum", "Minimum MOQ")}</Label><Input type="number" value={catMoq} onChange={(e) => setCatMoq(e.target.value)} /></div>
                <div className="sm:col-span-2"><Label>{tx("Description / spécifications", "Description / specifications")}</Label><Textarea rows={3} value={catDesc} onChange={(e) => setCatDesc(e.target.value)} /></div>
              </div>
              <Button onClick={submitCatalog} disabled={busy} className="mt-4">
                {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Envoyer en validation
              </Button>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3">{tx("Statut de mes produits", "My product status")}</h3>
              <EventList events={catalogDrafts} emptyLabel="Aucun produit déposé pour le moment." />
            </Card>
          </TabsContent>

          {/* MOQ */}
          <TabsContent value="moq" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> {tx("Demandes MOQ à livrer au partenaire logistique", "MOQ requests to deliver to the logistics partner")}
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
                    toast({ title: tx("Erreur", "Error"), description: (e as Error).message, variant: "destructive" }),
                  )
                }
              />
            </Card>
          </TabsContent>

          {/* OPERATIONS */}
          <TabsContent value="operations" className="space-y-4 mt-4">
            {/* Confirmer production */}
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Factory className="w-4 h-4 text-primary" /> {tx("Confirmer une production", "Confirm production")}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Indiquez qu'un lot est produit et prêt à être expédié au partenaire logistique.
              </p>
              <ProductionConfirmForm
                busy={busy}
                onSubmit={async (payload, title) => {
                  setBusy(true);
                  try {
                    await callAction({ action: "create_event", kind: "delivery_update", title, payload });
                    toast({ title: tx("Production confirmée", "Production confirmed"), description: title });
                  } catch (e) {
                    toast({ title: tx("Erreur", "Error"), description: (e as Error).message, variant: "destructive" });
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Historique ({totalProductionConfirmed} confirmées)
                </p>
                <EventList events={productionEvents} emptyLabel="Aucune production confirmée." />
              </div>
            </Card>

            {/* Imprimer étiquettes */}
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Printer className="w-4 h-4 text-primary" /> {tx("Imprimer des étiquettes", "Print labels")}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {tx("Génère une planche d'étiquettes d'expédition pour les MOQ à livrer.", "Generates a sheet of shipping labels for pending MOQ deliveries.")}
                {moqRequests.filter((e) => e.status !== "resolved").length === 0
                  ? ` ${tx("Aucune demande MOQ en attente pour le moment.", "No pending MOQ requests at this time.")}`
                  : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    printShippingLabels(
                      moqRequests.filter((e) => e.status !== "resolved"),
                      submission.company ?? submission.contact_email,
                      lang,
                    )
                  }
                  disabled={moqRequests.filter((e) => e.status !== "resolved").length === 0}
                >
                  <Printer className="w-4 h-4 mr-2" /> {tx("Étiquettes MOQ en attente", "Pending MOQ labels")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => printGenericLabel(submission.company ?? submission.contact_email, lang)}
                >
                  {tx("Étiquette vierge", "Blank label")}
                </Button>
              </div>
            </Card>

            {/* Suivre audit */}
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> {tx("Suivi des audits", "Audit tracking")}
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <MiniStat label={tx("Ouverts", "Open")} value={openAudits} />
                <MiniStat label={tx("Résolus", "Resolved")} value={auditEvents.filter((e) => e.status === "resolved").length} />
                <MiniStat label="Total" value={auditEvents.length} />
              </div>
              <EventList
                events={auditEvents}
                emptyLabel="Aucun audit en cours. L'équipe Ops déclenchera un audit si un contrôle qualité est requis."
                allowStatusUpdate
                onStatusChange={(id, status) =>
                  callAction({ action: "update_event_status", event_id: id, status }).catch((e) =>
                    toast({ title: tx("Erreur", "Error"), description: (e as Error).message, variant: "destructive" }),
                  )
                }
              />
            </Card>

            {/* Consulter factures */}
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> {tx("Mes factures", "My invoices")}
              </h3>
              {invoiceDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune facture déposée. L'équipe Ops publie les factures mensuelles dans cette section.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {invoiceDocs.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{d.file_name}</span>
                        <Badge variant="outline" className="shrink-0 text-[10px]">{d.category}</Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          const { data: signed } = await supabase.storage
                            .from("support-attachments")
                            .createSignedUrl(d.storage_path, 60);
                          if (signed?.signedUrl) window.open(signed.signedUrl, "_blank");
                          else toast({ title: tx("Lien indisponible", "Link unavailable"), variant: "destructive" });
                        }}
                      >
                        Ouvrir
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Consulter performances */}
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> {tx("Performances", "Performance")}
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MiniStat label={tx("Produits validés", "Approved products")} value={catalogDrafts.filter((e) => e.status === "resolved").length} />
                <MiniStat label={tx("MOQ livrées", "MOQ delivered")} value={totalMoqDelivered} />
                <MiniStat label={tx("Productions", "Production runs")} value={totalProductionConfirmed} />
                <MiniStat
                  label={tx("Taux résolution", "Resolution rate")}
                  value={`${events.length > 0
                    ? Math.round((events.filter((e) => e.status === "resolved").length / events.length) * 100)
                    : 0}%`}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Indicateurs calculés sur l'ensemble de votre activité dans le portail. Un rapport mensuel détaillé est joint dans la section Factures.
              </p>
            </Card>
          </TabsContent>

          {/* DOCUMENTS */}
          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileUp className="w-4 h-4 text-primary" /> {tx("Uploader un document", "Upload a document")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 items-end">
                <div>
                  <Label>{tx("Catégorie", "Category")}</Label>
                  <Input value={docCategory} onChange={(e) => setDocCategory(e.target.value)} placeholder={tx("ex: ISO 9001, fiche technique", "e.g. ISO 9001, technical sheet")} />
                </div>
                <div>
                  <Label>{tx("Fichier", "File")}</Label>
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
              <h3 className="font-semibold mb-3">{tx("Documents transmis", "Submitted documents")}</h3>
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tx("Aucun document complémentaire.", "No additional documents.")}</p>
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
                <AlertTriangle className="w-4 h-4 text-warning" /> {tx("Signaler un problème", "Report an issue")}
              </h3>
              <div className="space-y-3">
                <div><Label>{tx("Titre *", "Title *")}</Label><Input value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} placeholder={tx("ex: Rupture de stock imminente", "e.g. Imminent stockout")} /></div>
                <div><Label>{tx("Description *", "Description *")}</Label><Textarea rows={4} value={issueDesc} onChange={(e) => setIssueDesc(e.target.value)} /></div>
                <Button onClick={submitIssue} disabled={busy}>
                  {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Envoyer le signalement
                </Button>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold mb-3">{tx("Mes signalements", "My reports")}</h3>
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
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => english ? en : fr;
  if (events.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  return (
    <ul className="space-y-3">
      {events.map((e) => (
        <li key={e.id} className="border-b border-border/50 pb-3 last:border-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-sm">{e.title}</p>
              <p className="text-[11px] text-muted-foreground">{new Date(e.created_at).toLocaleString(english ? "en-GB" : "fr-FR")}</p>
            </div>
            <Badge variant={STATUS_VARIANT[e.status]}>{english ? ({ open: "Open", in_progress: "In progress", resolved: "Resolved", rejected: "Rejected" }[e.status]) : STATUS_LABEL[e.status]}</Badge>
          </div>
          {allowStatusUpdate && e.status !== "resolved" && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => onStatusChange?.(e.id, "in_progress")}>
                {tx("Préparation", "In progress")}
              </Button>
              <Button size="sm" onClick={() => onStatusChange?.(e.id, "resolved")}>
                {tx("Marquer expédié", "Mark as shipped")}
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-xl font-display font-semibold mt-1">{value}</p>
    </div>
  );
}

function ProductionConfirmForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (payload: Record<string, unknown>, title: string) => Promise<void>;
}) {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => english ? en : fr;
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [batch, setBatch] = useState("");
  const [note, setNote] = useState("");

  async function submit() {
    if (!product.trim() || !quantity) {
      toast({ title: tx("Champs manquants", "Missing fields"), description: "Produit et quantité requis." });
      return;
    }
    const title = `Production confirmée : ${product.trim()} × ${quantity}`;
    await onSubmit(
      { product: product.trim(), quantity: Number(quantity), batch_number: batch.trim() || null, note: note.trim() || null },
      title,
    );
    setProduct(""); setQuantity(""); setBatch(""); setNote("");
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div><Label>{tx("Produit *", "Product *")}</Label><Input value={product} onChange={(e) => setProduct(e.target.value)} /></div>
      <div><Label>{tx("Quantité produite *", "Quantity produced *")}</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
      <div><Label>{tx("N° de lot", "Batch number")}</Label><Input value={batch} onChange={(e) => setBatch(e.target.value)} placeholder={tx("optionnel", "optional")} /></div>
      <div><Label>{tx("Note logistique", "Logistics note")}</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={tx("optionnel", "optional")} /></div>
      <div className="sm:col-span-2">
        <Button onClick={submit} disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {tx("Confirmer la production", "Confirm production")}
        </Button>
      </div>
    </div>
  );
}

function printShippingLabels(events: PortalEvent[], supplier: string, lang: "fr" | "en") {
  const english = lang === "en";
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  const labels = events
    .map((e) => {
      const p = e.payload as Record<string, unknown>;
      return `
        <div class="label">
          <div class="hd">BRAND-IN-A-BOX · ${english ? "LOGISTICS" : "LOGISTIQUE"}</div>
          <h2>${escapeHtml(e.title)}</h2>
          <p><b>${english ? "Supplier:" : "Fournisseur :"}</b> ${escapeHtml(supplier)}</p>
          <p><b>${english ? "Reference:" : "Référence :"}</b> ${escapeHtml(e.id.slice(0, 8).toUpperCase())}</p>
          <p><b>${english ? "Qty:" : "Qté :"}</b> ${escapeHtml(String(p?.quantity ?? "—"))}</p>
          <p><b>Date :</b> ${new Date(e.created_at).toLocaleDateString(english ? "en-GB" : "fr-FR")}</p>
          <p class="addr">${english ? "Ship to the logistics partner designated by Brand-In-A-Box." : "À expédier au partenaire logistique désigné par Brand-In-A-Box."}</p>
        </div>`;
    })
    .join("");
  win.document.write(`
    <html lang="${lang}"><head><title>${english ? "Labels" : "Étiquettes"}</title><style>
      body{font-family:Inter,system-ui,sans-serif;margin:0;padding:16px;background:#fff;color:#000;}
      .label{border:2px dashed #000;padding:18px;margin-bottom:18px;page-break-after:always;}
      .hd{font-size:11px;letter-spacing:.12em;font-weight:600;margin-bottom:6px;}
      h2{margin:6px 0 12px;font-size:18px;}
      p{margin:4px 0;font-size:13px;}
      .addr{margin-top:14px;font-style:italic;font-size:12px;}
      @media print { .label{page-break-after:always;} }
    </style></head><body>${labels}<script>window.print()</script></body></html>
  `);
  win.document.close();
}

function printGenericLabel(supplier: string, lang: "fr" | "en") {
  const english = lang === "en";
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  win.document.write(`
    <html lang="${lang}"><head><title>${english ? "Blank label" : "Étiquette vierge"}</title><style>
      body{font-family:Inter,system-ui,sans-serif;margin:0;padding:32px;}
      .label{border:2px dashed #000;padding:24px;}
      h2{margin:0 0 12px;} p{margin:6px 0;}
    </style></head><body>
      <div class="label">
        <div style="font-size:11px;letter-spacing:.12em;font-weight:600;">BRAND-IN-A-BOX · LOGISTIQUE</div>
        <h2>${english ? "Shipping label" : "Étiquette d'expédition"}</h2>
        <p><b>${english ? "Supplier:" : "Fournisseur :"}</b> ${escapeHtml(supplier)}</p>
        <p><b>Date :</b> ${new Date().toLocaleDateString(english ? "en-GB" : "fr-FR")}</p>
        <p>${english ? "Product:" : "Produit :"} ____________________</p>
        <p>${english ? "Quantity:" : "Quantité :"} ____________________</p>
        <p>${english ? "Batch no.:" : "N° lot :"} ____________________</p>
      </div>
      <script>window.print()</script>
    </body></html>
  `);
  win.document.close();
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}