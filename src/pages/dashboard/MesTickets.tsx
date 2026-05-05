import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader, SectionCard, EmptyStateInline } from "@/components/dashboard/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  useSupportTickets, useTicketDetail, useUpdateTicketStatus,
  useAddTicketResponse, getAttachmentSignedUrl,
  type SupportTicketRow, type SupportTicketStatus,
} from "@/hooks/useSupportTickets";
import { Ticket, Paperclip, Loader2, Mail, Clock } from "lucide-react";
import { toast } from "sonner";

const STATUS_TONE: Record<SupportTicketStatus, string> = {
  open: "bg-info/10 text-info border-info/30",
  in_progress: "bg-warning/10 text-warning border-warning/30",
  resolved: "bg-success/10 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
};
const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
  closed: "Fermé",
};

export default function MesTickets() {
  const { data: tickets = [], isLoading } = useSupportTickets();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = useMemo(
    () => tickets.find((t) => t.id === openId) ?? null,
    [tickets, openId],
  );

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Support"
        title="Mes tickets"
        subtitle="Historique, statuts et réponses des demandes liées à vos boutiques et à votre compte."
      />

      <SectionCard
        title="Tous mes tickets"
        description={`${tickets.length} ticket(s)`}
        icon={<Ticket className="w-4 h-4" />}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
          </div>
        ) : tickets.length === 0 ? (
          <EmptyStateInline
            variant="no-content"
            title="Aucun ticket pour l'instant."
            description="Utilisez le bouton flottant d'aide pour ouvrir une demande."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sujet</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium max-w-[280px] truncate">
                    {t.subject}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.source === "storefront" ? "Storefront" : "Dashboard IA"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_TONE[t.status]}>
                      {STATUS_LABEL[t.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => setOpenId(t.id)}>
                      Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <TicketDrawer ticket={open} onClose={() => setOpenId(null)} />
    </DashboardLayout>
  );
}

function TicketDrawer({
  ticket,
  onClose,
}: {
  ticket: SupportTicketRow | null;
  onClose: () => void;
}) {
  const { data, isLoading } = useTicketDetail(ticket?.id ?? null);
  const updateStatus = useUpdateTicketStatus();
  const addResponse = useAddTicketResponse();
  const [reply, setReply] = useState("");

  const downloadAttachment = async (path: string, name: string) => {
    try {
      const url = await getAttachmentSignedUrl(path);
      window.open(url, "_blank", "noopener");
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur de téléchargement");
    }
  };

  return (
    <Sheet open={!!ticket} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col p-0">
        {ticket && (
          <>
            <SheetHeader className="border-b p-4">
              <SheetTitle className="text-base">{ticket.subject}</SheetTitle>
              <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{ticket.contact_email}</span>
                <span>·</span>
                <Clock className="w-3 h-3" />
                <span>{new Date(ticket.created_at).toLocaleString("fr-FR")}</span>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {ticket.boutique_id && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Statut :</span>
                  <Select
                    value={ticket.status}
                    onValueChange={(v) =>
                      updateStatus.mutate({
                        ticket,
                        status: v as SupportTicketStatus,
                      })
                    }
                    disabled={updateStatus.isPending}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Ouvert</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="resolved">Résolu</SelectItem>
                      <SelectItem value="closed">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Message</p>
                <p className="text-sm whitespace-pre-wrap bg-muted/40 rounded-lg p-3">
                  {ticket.message}
                </p>
              </div>

              {data?.attachments && data.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    Pièces jointes
                  </p>
                  <div className="space-y-1.5">
                    {data.attachments.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => downloadAttachment(a.storage_path, a.file_name)}
                        className="w-full flex items-center gap-2 text-left text-sm bg-muted/40 hover:bg-muted/70 rounded-lg px-3 py-2 transition-colors"
                      >
                        <Paperclip className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate flex-1">{a.file_name}</span>
                        {a.byte_size && (
                          <span className="text-[10px] text-muted-foreground">
                            {Math.round(a.byte_size / 1024)} Ko
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                  Réponses
                </p>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : data?.responses && data.responses.length > 0 ? (
                  <div className="space-y-2">
                    {data.responses.map((r) => (
                      <div
                        key={r.id}
                        className="text-sm bg-primary/5 border border-primary/20 rounded-lg p-3"
                      >
                        <p className="whitespace-pre-wrap">{r.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          {new Date(r.created_at).toLocaleString("fr-FR")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Aucune réponse pour l'instant.
                  </p>
                )}
              </div>

              {ticket.boutique_id && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    Répondre au client
                  </p>
                  <Textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Votre réponse…"
                    className="min-h-[90px]"
                  />
                  <Button
                    className="mt-2 w-full"
                    size="sm"
                    disabled={!reply.trim() || addResponse.isPending}
                    onClick={() => {
                      addResponse.mutate(
                        { ticketId: ticket.id, message: reply.trim() },
                        { onSuccess: () => setReply("") },
                      );
                    }}
                  >
                    {addResponse.isPending ? "Envoi…" : "Publier la réponse"}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}