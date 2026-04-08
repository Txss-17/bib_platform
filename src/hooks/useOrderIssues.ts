import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type IssueType = "not_received" | "return_request" | "defective";
export type IssueStatus = "pending" | "accepted" | "refused" | "resolved" | "escalated";
export type IssueAction = "accept" | "refuse" | "partial_refund" | "resend" | "other";

export interface OrderIssue {
  id: string;
  order_id: string;
  type: IssueType;
  message: string | null;
  image_url: string | null;
  status: IssueStatus;
  created_at: string;
  deadline_at: string;
  customer_email: string;
}

export interface IssueResponse {
  id: string;
  issue_id: string;
  action: IssueAction;
  message: string | null;
  created_at: string;
}

const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  not_received: "Produit non reçu",
  return_request: "Demande de retour",
  defective: "Produit défectueux",
};

const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  pending: "En attente",
  accepted: "Accepté",
  refused: "Refusé",
  resolved: "Résolu",
  escalated: "Escaladé",
};

const ISSUE_ACTION_LABELS: Record<IssueAction, string> = {
  accept: "Accepter",
  refuse: "Refuser",
  partial_refund: "Remboursement partiel",
  resend: "Renvoi du produit",
  other: "Autre solution",
};

export { ISSUE_TYPE_LABELS, ISSUE_STATUS_LABELS, ISSUE_ACTION_LABELS };

export function useOrderIssues(orderId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order-issues", orderId || "all", user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("order_issues")
        .select("*")
        .order("created_at", { ascending: false });

      if (orderId) {
        query = query.eq("order_id", orderId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as OrderIssue[];
    },
    enabled: !!user,
  });
}

export function useAllBoutiqueIssues() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-boutique-issues", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get user's boutiques
      const { data: boutiques } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);

      if (!boutiques?.length) return [];

      const boutiqueIds = boutiques.map((b) => b.id);

      // Get orders for these boutiques
      const { data: orders } = await supabase
        .from("orders")
        .select("id")
        .in("boutique_id", boutiqueIds);

      if (!orders?.length) return [];

      const orderIds = orders.map((o) => o.id);

      // Get issues for these orders
      const { data, error } = await supabase
        .from("order_issues" as any)
        .select("*")
        .in("order_id", orderIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as OrderIssue[];
    },
    enabled: !!user,
  });
}

export function useCreateOrderIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue: {
      order_id: string;
      type: IssueType;
      message?: string;
      image_url?: string;
      customer_email: string;
    }) => {
      const deadlineAt = new Date();
      deadlineAt.setHours(deadlineAt.getHours() + 48);

      const { data, error } = await supabase
        .from("order_issues" as any)
        .insert({
          order_id: issue.order_id,
          type: issue.type,
          message: issue.message || null,
          image_url: issue.image_url || null,
          customer_email: issue.customer_email,
          status: "pending",
          deadline_at: deadlineAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-issues"] });
      queryClient.invalidateQueries({ queryKey: ["all-boutique-issues"] });
    },
  });
}

export function useIssueResponses(issueId?: string) {
  return useQuery({
    queryKey: ["issue-responses", issueId],
    queryFn: async () => {
      if (!issueId) return [];
      const { data, error } = await supabase
        .from("issue_responses" as any)
        .select("*")
        .eq("issue_id", issueId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as IssueResponse[];
    },
    enabled: !!issueId,
  });
}

export function useRespondToIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      issueId,
      action,
      message,
      newStatus,
    }: {
      issueId: string;
      action: IssueAction;
      message?: string;
      newStatus: IssueStatus;
    }) => {
      // Create response
      const { error: responseError } = await supabase
        .from("issue_responses" as any)
        .insert({
          issue_id: issueId,
          action,
          message: message || null,
        });

      if (responseError) throw responseError;

      // Update issue status
      const { error: updateError } = await supabase
        .from("order_issues" as any)
        .update({ status: newStatus })
        .eq("id", issueId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue-responses"] });
      queryClient.invalidateQueries({ queryKey: ["all-boutique-issues"] });
    },
  });
}
