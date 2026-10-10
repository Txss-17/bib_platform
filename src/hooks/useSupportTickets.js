import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
function useSupportTickets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["support_tickets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });
}
function useTicketDetail(ticketId) {
  return useQuery({
    queryKey: ["support_ticket_detail", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const [att, resp] = await Promise.all([
        supabase.from("support_ticket_attachments").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: true }),
        supabase.from("support_ticket_responses").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: true })
      ]);
      if (att.error) throw att.error;
      if (resp.error) throw resp.error;
      return {
        attachments: att.data ?? [],
        responses: resp.data ?? []
      };
    }
  });
}
function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticket,
      status
    }) => {
      const { error } = await supabase.from("support_tickets").update({ status }).eq("id", ticket.id);
      if (error) throw error;
      if (ticket.contact_email && (status === "in_progress" || status === "resolved" || status === "closed")) {
        const trackingUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard/aide?ticket=${ticket.id}` : `https://brand-in-a-box.space/dashboard/aide?ticket=${ticket.id}`;
        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "support-ticket-status",
              recipientEmail: ticket.contact_email,
              idempotencyKey: `ticket-${ticket.id}-${status}`,
              templateData: {
                name: ticket.contact_name ?? void 0,
                subject: ticket.subject,
                status,
                trackingUrl,
                ticketId: ticket.id
              }
            }
          });
        } catch (e) {
          console.warn("Email notification failed", e);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support_tickets"] });
      toast.success("Statut mis \xE0 jour", {
        description: "Le client est notifi\xE9 par e-mail."
      });
    },
    onError: (e) => toast.error(e?.message ?? "Erreur de mise \xE0 jour")
  });
}
function useAddTicketResponse() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ ticketId, message }) => {
      if (!user) throw new Error("Auth requise");
      const { error } = await supabase.from("support_ticket_responses").insert({ ticket_id: ticketId, author_id: user.id, message });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["support_ticket_detail", vars.ticketId] });
      toast.success("R\xE9ponse publi\xE9e");
    },
    onError: (e) => toast.error(e?.message ?? "Erreur")
  });
}
async function uploadTicketAttachment(ticketId, file, uploadedBy) {
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const path = `${ticketId}/${Date.now()}-${safeName}`;
  const { error: upErr } = await supabase.storage.from("support-attachments").upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;
  const { error: rowErr } = await supabase.from("support_ticket_attachments").insert({
    ticket_id: ticketId,
    storage_path: path,
    file_name: file.name,
    mime_type: file.type || null,
    byte_size: file.size,
    uploaded_by: uploadedBy
  });
  if (rowErr) throw rowErr;
  return path;
}
async function getAttachmentSignedUrl(storagePath) {
  const { data, error } = await supabase.storage.from("support-attachments").createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}
export {
  getAttachmentSignedUrl,
  uploadTicketAttachment,
  useAddTicketResponse,
  useSupportTickets,
  useTicketDetail,
  useUpdateTicketStatus
};
