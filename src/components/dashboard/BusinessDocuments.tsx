import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Trash2, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface BusinessDocument {
  id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  status: string;
  rejection_reason: string | null;
  uploaded_at: string;
}

const DOCUMENT_TYPES = [
  { value: "kbis", label: "Extrait KBIS" },
  { value: "siret", label: "Certificat SIRET / SIREN" },
  { value: "id_card", label: "Carte d'identité" },
  { value: "id_passport", label: "Passeport" },
  { value: "proof_of_address", label: "Justificatif de domicile" },
  { value: "other", label: "Autre document" },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive"; icon: typeof Clock }> = {
  pending: { label: "En attente de vérification", variant: "secondary", icon: Clock },
  verified: { label: "Vérifié", variant: "default", icon: CheckCircle },
  rejected: { label: "Rejeté", variant: "destructive", icon: XCircle },
};

export function BusinessDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("business_documents" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
    } else {
      setDocuments((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const handleUpload = async (docType: string) => {
    if (!user) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,.webp";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 10 Mo");
        return;
      }

      setUploading(docType);

      const fileExt = file.name.split(".").pop();
      const filePath = `documents/${user.id}/${docType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("boutique-media")
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Erreur lors de l'upload du fichier");
        console.error(uploadError);
        setUploading(null);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("boutique-media")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("business_documents" as any)
        .insert({
          user_id: user.id,
          document_type: docType,
          file_url: urlData.publicUrl,
          file_name: file.name,
        } as any);

      if (insertError) {
        toast.error("Erreur lors de l'enregistrement du document");
        console.error(insertError);
      } else {
        toast.success("Document envoyé pour vérification");
        await fetchDocuments();
      }
      setUploading(null);
    };
    input.click();
  };

  const handleDelete = async (doc: BusinessDocument) => {
    const { error } = await supabase
      .from("business_documents" as any)
      .delete()
      .eq("id", doc.id);

    if (error) {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    } else {
      toast.success("Document supprimé");
      await fetchDocuments();
    }
  };

  const getExistingDoc = (type: string) =>
    documents.find((d) => d.document_type === type);

  if (loading) {
    return (
      <Card className="bg-card border-border/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents de vérification
        </CardTitle>
        <CardDescription>
          Envoyez vos documents d'entreprise pour vérification. Les documents acceptés : PDF, JPG, PNG (max 10 Mo).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {DOCUMENT_TYPES.map(({ value, label }) => {
          const existing = getExistingDoc(value);
          const isUploading = uploading === value;
          const statusInfo = existing ? STATUS_CONFIG[existing.status] : null;
          const StatusIcon = statusInfo?.icon;

          return (
            <div
              key={value}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-muted/50 border border-border/30"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{label}</p>
                {existing ? (
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {existing.file_name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {StatusIcon && <StatusIcon className="w-3.5 h-3.5" />}
                      <Badge variant={statusInfo?.variant} className="text-[10px] px-1.5 py-0">
                        {statusInfo?.label}
                      </Badge>
                    </div>
                    {existing.status === "rejected" && existing.rejection_reason && (
                      <p className="text-xs text-destructive mt-1">
                        Motif : {existing.rejection_reason}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">Non envoyé</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {existing?.status === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(existing)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {(!existing || existing.status === "rejected") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpload(value)}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-1.5" />
                    )}
                    {existing ? "Renvoyer" : "Envoyer"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
