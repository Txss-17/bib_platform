 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

 


































export function useSupportTickets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["support_tickets", _optionalChain([user, 'optionalAccess', _ => _.id])],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (_nullishCoalesce(data, () => ( []))) ;
    },
  });
}

export function useTicketDetail(ticketId) {
  return useQuery({
    queryKey: ["support_ticket_detail", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const [att, resp] = await Promise.all([
        supabase
          .from("support_ticket_attachments")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true }),
        supabase
          .from("support_ticket_responses")
          .select("*")
          .eq("ticket_id", ticketId)
          .order("created_at", { ascending: true }),
      ]);
      if (att.error) throw att.error;
      if (resp.error) throw resp.error;
      return {
        attachments: (_nullishCoalesce(att.data, () => ( []))) ,
        responses: (_nullishCoalesce(resp.data, () => ( []))) ,
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
    }


) => {
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
                name: _nullishCoalesce(ticket.contact_name, () => ( undefined)),
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
    onError: (e) => toast.error(_nullishCoalesce(_optionalChain([e, 'optionalAccess', _2 => _2.message]), () => ( "Erreur de mise à jour"))),
  });
}

export function useAddTicketResponse() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ ticketId, message }) => {
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
    onError: (e) => toast.error(_nullishCoalesce(_optionalChain([e, 'optionalAccess', _3 => _3.message]), () => ( "Erreur"))),
  });
}

/**
 * Upload a file to support-attachments bucket and register it in support_ticket_attachments.
 * Path convention: <ticketId>/<timestamp>-<filename>
 */
export async function uploadTicketAttachment(
  ticketId,
  file,
  uploadedBy,
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

export async function getAttachmentSignedUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from("support-attachments")
    .createSignedUrl(storagePath, 3600);
  if (error) throw error;
  return data.signedUrl;
}