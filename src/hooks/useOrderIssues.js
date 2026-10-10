import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
const ISSUE_TYPE_LABELS = {
  not_received: "Produit non re\xE7u",
  return_request: "Demande de retour",
  defective: "Produit d\xE9fectueux"
};
const ISSUE_STATUS_LABELS = {
  pending: "En attente",
  accepted: "Accept\xE9",
  refused: "Refus\xE9",
  resolved: "R\xE9solu",
  escalated: "Escalad\xE9"
};
const ISSUE_ACTION_LABELS = {
  accept: "Accepter",
  refuse: "Refuser",
  partial_refund: "Remboursement partiel",
  resend: "Renvoi du produit",
  other: "Autre solution"
};
function useOrderIssues(orderId) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["order-issues", orderId || "all", user?.id],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase.from("order_issues").select("*").order("created_at", { ascending: false });
      if (orderId) {
        query = query.eq("order_id", orderId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
}
function useAllBoutiqueIssues() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["all-boutique-issues", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: boutiques } = await supabase.from("boutiques").select("id").eq("user_id", user.id);
      if (!boutiques?.length) return [];
      const boutiqueIds = boutiques.map((b) => b.id);
      const { data: orders } = await supabase.from("orders").select("id").in("boutique_id", boutiqueIds);
      if (!orders?.length) return [];
      const orderIds = orders.map((o) => o.id);
      const { data, error } = await supabase.from("order_issues").select("*").in("order_id", orderIds).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
}
function useCreateOrderIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (issue) => {
      const deadlineAt = /* @__PURE__ */ new Date();
      deadlineAt.setHours(deadlineAt.getHours() + 48);
      const { data, error } = await supabase.from("order_issues").insert({
        order_id: issue.order_id,
        type: issue.type,
        message: issue.message || null,
        image_url: issue.image_url || null,
        customer_email: issue.customer_email,
        status: "pending",
        deadline_at: deadlineAt.toISOString()
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-issues"] });
      queryClient.invalidateQueries({ queryKey: ["all-boutique-issues"] });
    }
  });
}
function useIssueResponses(issueId) {
  return useQuery({
    queryKey: ["issue-responses", issueId],
    queryFn: async () => {
      if (!issueId) return [];
      const { data, error } = await supabase.from("issue_responses").select("*").eq("issue_id", issueId).order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!issueId
  });
}
function useRespondToIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      issueId,
      action,
      message,
      newStatus
    }) => {
      const { error: responseError } = await supabase.from("issue_responses").insert({
        issue_id: issueId,
        action,
        message: message || null
      });
      if (responseError) throw responseError;
      const { error: updateError } = await supabase.from("order_issues").update({ status: newStatus }).eq("id", issueId);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue-responses"] });
      queryClient.invalidateQueries({ queryKey: ["all-boutique-issues"] });
    }
  });
}
export {
  ISSUE_ACTION_LABELS,
  ISSUE_STATUS_LABELS,
  ISSUE_TYPE_LABELS,
  useAllBoutiqueIssues,
  useCreateOrderIssue,
  useIssueResponses,
  useOrderIssues,
  useRespondToIssue
};
