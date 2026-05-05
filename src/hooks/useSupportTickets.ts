import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface SupportTicketRow {
  id: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  source: "dashboard_ai" | "storefront";
  contact_email: string;
  contact_name: string | null;
  user_id: string | null;
  boutique_id: string | null;
  ai_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketAttachment {
  id: string;
  ticket_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  byte_size: number | null;
  created_at: string;
}

export interface SupportTicketResponse {
  id: string;
  ticket_id: string;
  author_id: string;
  message: string;
  created_at: string;
}

export function useSupportTickets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["support_tickets", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SupportTicketRow[];
    },
  });
}

export function useTicketDetail(ticketId: string | null) {
  return useQuery({
    queryKey: ["support_ticket_detail", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const [att, resp] = await Promise.all([
        supabase
          .from("support_ticket_attachments")
          .select("*")
          .eq("ticket_id", ticketId!)
          .order("created_at", { ascending: true }),
        supabase
          .from("support_ticket_responses")
          .select("*")
          .eq("ticket_id", ticketId!)
          .order("created_at", { ascending: true }),
      ]);
      if (att.error) throw att.error;
      if (resp.error) throw resp.error;
      return {
        attachments: (att.data ?? []) as SupportTicketAttachment[],
        responses: (resp.data ?? []) as SupportTicketResponse[],
      };
    },
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticket,
      status,
    }: {
      ticket: SupportTicketRow;
      status: SupportTicketStatus;
    }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status })
        .eq("id", ticket.id);
      if (error) throw error;

      // Notify customer if a meaningful transition happens
      if (
        ticket.contact_email &&
        (status === "in_progress" || status === "resolved" || status === "closed")
      ) {
        const trackingUrl =
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard/aide?ticket=${ticket.id}`
            : `https://brand-in-a-box.space/dashboard/aide?ticket=${ticket.id}`;
        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "support-ticket-status",
              recipientEmail: ticket.contact_email,
              idempotencyKey: `ticket-${ticket.id}-${status}`,
              templateData: {
                name: ticket.contact_name ?? undefined,
                subject: ticket.subject,
                status,
                trackingUrl,
                ticketId: ticket.id,
              },
            },
          });
        } catch (e) {
          console.warn("Email notification failed", e);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support_tickets"] });
      toast.success("Statut mis à jour", {
        description: "Le client est notifié par e-mail.",
      });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erreur de mise à jour"),
  });
}

export function useAddTicketResponse() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      if (!user) throw new Error("Auth requise");
      const { error } = await supabase
        .from("support_ticket_responses")
        .insert({ ticket_id: ticketId, author_id: user.id, message });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["support_ticket_detail", vars.ticketId] });
      toast.success("Réponse publiée");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erreur"),
  });
}

/**
 * Upload a file to support-attachments bucket and register it in support_ticket_attachments.
 * Path convention: <ticketId>/<timestamp>-<filename>
 */
export async function uploadTicketAttachment(
  ticketId: string,
  file: File,
  uploadedBy: string | null,
) {
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const path = `${ticketId}/${Date.now()}-${safeName}`;
  const { error: upErr } = await supabase.storage
    .from("support-attachments")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (upErr) throw upErr;
  const { error: rowErr } = await supabase.from("support_ticket_attachments").insert({
    ticket_id: ticketId,
    storage_path: path,
    file_name: file.name,
    mime_type: file.type || null,
    byte_size: file.size,
    uploaded_by: uploadedBy,
  });
  if (rowErr) throw rowErr;
  return path;
}

export async function getAttachmentSignedUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from("support-attachments")
    .createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}