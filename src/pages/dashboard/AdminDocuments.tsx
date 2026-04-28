import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, SectionCard, KpiTile, EmptyState, KpiGrid } from "@/components/dashboard/shared";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Shield, FileText, CheckCircle, XCircle, Clock, Search, Eye, Loader2, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import { toast } from "sonner";

interface AdminDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  status: string;
  rejection_reason: string | null;
  uploaded_at: string;
  user_profile?: {
    full_name: string | null;
    business_name: string | null;
    business_type: string | null;
  };
}

const DOC_TYPE_LABELS: Record<string, string> = {
  kbis: "Extrait KBIS",
  siret: "Certificat SIRET / SIREN",
  id_card: "Carte d'identité",
  id_passport: "Passeport",
  proof_of_address: "Justificatif de domicile",
  other: "Autre document",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof Clock }> = {
  pending: { label: "En attente", variant: "secondary", icon: Clock },
  verified: { label: "Vérifié", variant: "default", icon: CheckCircle },
  rejected: { label: "Rejeté", variant: "destructive", icon: XCircle },
};

async function adminFetch(action: string, method = "GET", body?: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-documents?action=${action}`;
  const options: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

export default function AdminDocuments() {
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<AdminDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { documents: docs, profiles } = await adminFetch("list");
      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      );
      const enrichedDocs = (docs || []).map((d: any) => ({
        ...d,
        user_profile: profileMap.get(d.user_id) || null,
      }));
      setDocuments(enrichedDocs);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) fetchDocuments();
  }, [isAdmin, fetchDocuments]);

  const handleVerify = async (doc: AdminDocument) => {
    setActionLoading(true);
    try {
      await adminFetch("verify", "POST", { documentId: doc.id });
      toast.success("Document vérifié avec succès");
      await fetchDocuments();
      setSelectedDoc(null);
    } catch {
      toast.error("Erreur lors de la vérification");
    }
    setActionLoading(false);
  };

  const handleReject = async (doc: AdminDocument) => {
    if (!rejectionReason.trim()) {
      toast.error("Veuillez indiquer un motif de rejet");
      return;
    }
    setActionLoading(true);
    try {
      await adminFetch("reject", "POST", { documentId: doc.id, reason: rejectionReason.trim() });
      toast.success("Document rejeté");
      setRejectionReason("");
      await fetchDocuments();
      setSelectedDoc(null);
    } catch {
      toast.error("Erreur lors du rejet");
    }
    setActionLoading(false);
  };

  const filteredDocs = documents.filter((d) => {
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = d.user_profile?.full_name?.toLowerCase() || "";
      const biz = d.user_profile?.business_name?.toLowerCase() || "";
      const docType = (DOC_TYPE_LABELS[d.document_type] || d.document_type).toLowerCase();
      return name.includes(q) || biz.includes(q) || docType.includes(q);
    }
    return true;
  });

  const pendingCount = documents.filter((d) => d.status === "pending").length;

  if (adminLoading) {
    return (
      <DashboardLayout>
        <PageHeader
          eyebrow="Administration"
          title="Vérification des documents"
          subtitle="Chargement…"
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <PageHeader
          eyebrow="Administration"
          title="Accès refusé"
          subtitle="Vous n'avez pas les permissions nécessaires."
        />
        <SectionCard>
          <EmptyState
            variant="forbidden"
            title="Accès administrateur requis"
            description="Cette page est réservée aux administrateurs de la plateforme Brand-In-A-Box."
          />
        </SectionCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Administration"
        title="Vérification des documents"
        subtitle="Gérez les documents d'entreprise soumis par les vendeurs."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Vérification documents" },
        ]}
      />

      {/* KPIs */}
      <KpiGrid cols={3}>
        <KpiTile
          label="En attente"
          value={pendingCount}
          icon={<Clock className="w-5 h-5" />}
          tone="gold"
        />
        <KpiTile
          label="Vérifiés"
          value={documents.filter((d) => d.status === "verified").length}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <KpiTile
          label="Rejetés"
          value={documents.filter((d) => d.status === "rejected").length}
          icon={<XCircle className="w-5 h-5" />}
        />
      </KpiGrid>

      {/* Filters */}
      <SectionCard className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, entreprise ou type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="verified">Vérifiés</SelectItem>
              <SelectItem value="rejected">Rejetés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      {/* Documents Table */}
      <SectionCard
        icon={<FileText className="w-4 h-4" />}
        title={`Documents soumis (${filteredDocs.length})`}
        description="Cliquez sur un document pour le vérifier ou le rejeter."
      >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-6 h-6" />}
              title="Aucun document trouvé"
              description="Ajustez vos filtres ou attendez de nouvelles soumissions."
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendeur</TableHead>
                      <TableHead>Type de document</TableHead>
                      <TableHead>Fichier</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocs.map((doc) => {
                      const statusInfo = STATUS_CONFIG[doc.status];
                      return (
                        <TableRow key={doc.id} className="cursor-pointer" onClick={() => { setSelectedDoc(doc); setRejectionReason(""); }}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground text-sm">
                                {doc.user_profile?.full_name || "—"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {doc.user_profile?.business_name || "—"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px] block">
                              {doc.file_name}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(doc.uploaded_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo?.variant}>{statusInfo?.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); setRejectionReason(""); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredDocs.map((doc) => {
                  const statusInfo = STATUS_CONFIG[doc.status];
                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-lg bg-muted/50 border border-border/30 cursor-pointer"
                      onClick={() => { setSelectedDoc(doc); setRejectionReason(""); }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {doc.user_profile?.full_name || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.user_profile?.business_name || "—"}
                          </p>
                        </div>
                        <Badge variant={statusInfo?.variant} className="text-[10px]">
                          {statusInfo?.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {DOC_TYPE_LABELS[doc.document_type] || doc.document_type} • {new Date(doc.uploaded_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
      </SectionCard>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={(o) => { if (!o) setSelectedDoc(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails du document</DialogTitle>
            <DialogDescription>
              Vérifiez le document et approuvez ou rejetez-le
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {selectedDoc.user_profile?.full_name || "Utilisateur inconnu"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Entreprise : {selectedDoc.user_profile?.business_name || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Type : {selectedDoc.user_profile?.business_type || "—"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type de document</span>
                  <span className="font-medium text-foreground">
                    {DOC_TYPE_LABELS[selectedDoc.document_type] || selectedDoc.document_type}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date d'envoi</span>
                  <span className="text-foreground">
                    {new Date(selectedDoc.uploaded_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Statut actuel</span>
                  <Badge variant={STATUS_CONFIG[selectedDoc.status]?.variant}>
                    {STATUS_CONFIG[selectedDoc.status]?.label}
                  </Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href={selectedDoc.file_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Voir le document ({selectedDoc.file_name})
                </a>
              </Button>

              {selectedDoc.status !== "verified" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Motif de rejet (obligatoire pour rejeter)
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ex: Document illisible, nom ne correspond pas..."
                    rows={3}
                  />
                </div>
              )}

              {selectedDoc.status === "rejected" && selectedDoc.rejection_reason && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-xs font-medium text-destructive">Motif du rejet précédent :</p>
                  <p className="text-sm text-destructive/80">{selectedDoc.rejection_reason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedDoc?.status !== "verified" && (
              <Button
                onClick={() => selectedDoc && handleVerify(selectedDoc)}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Vérifier
              </Button>
            )}
            {selectedDoc?.status !== "rejected" && (
              <Button
                variant="destructive"
                onClick={() => selectedDoc && handleReject(selectedDoc)}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Rejeter
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
