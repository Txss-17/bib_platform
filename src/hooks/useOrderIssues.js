 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

 























const ISSUE_TYPE_LABELS = {
  not_received: "Produit non reçu",
  return_request: "Demande de retour",
  defective: "Produit défectueux",
};

const ISSUE_STATUS_LABELS = {
  pending: "En attente",
  accepted: "Accepté",
  refused: "Refusé",
  resolved: "Résolu",
  escalated: "Escaladé",
};

const ISSUE_ACTION_LABELS = {
  accept: "Accepter",
  refuse: "Refuser",
  partial_refund: "Remboursement partiel",
  resend: "Renvoi du produit",
  other: "Autre solution",
};

export { ISSUE_TYPE_LABELS, ISSUE_STATUS_LABELS, ISSUE_ACTION_LABELS };

export function useOrderIssues(orderId) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["order-issues", orderId || "all", _optionalChain([user, 'optionalAccess', _ => _.id])],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("order_issues" )
        .select("*")
        .order("created_at", { ascending: false });

      if (orderId) {
        query = query.eq("order_id", orderId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) ;
    },
    enabled: !!user,
  });
}

export function useAllBoutiqueIssues() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-boutique-issues", _optionalChain([user, 'optionalAccess', _2 => _2.id])],
    queryFn: async () => {
      if (!user) return [];

      // Get user's boutiques
      const { data: boutiques } = await supabase
        .from("boutiques")
        .select("id")
        .eq("user_id", user.id);

      if (!_optionalChain([boutiques, 'optionalAccess', _3 => _3.length])) return [];

      const boutiqueIds = boutiques.map((b) => b.id);

      // Get orders for these boutiques
      const { data: orders } = await supabase
        .from("orders")
        .select("id")
        .in("boutique_id", boutiqueIds);

      if (!_optionalChain([orders, 'optionalAccess', _4 => _4.length])) return [];

      const orderIds = orders.map((o) => o.id);

      // Get issues for these orders
      const { data, error } = await supabase
        .from("order_issues" )
        .select("*")
        .in("order_id", orderIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) ;
    },
    enabled: !!user,
  });
}

export function useRefundOrderIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input) => {
      const { data, error } = await supabase.functions.invoke("refund-order-issue", {
        body: { issueId: input.issueId, amountCents: input.amountCents },
      });
      if (error) throw error;
      return data ;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue-responses"] });
      queryClient.invalidateQueries({ queryKey: ["all-boutique-issues"] });
    },
  });
}

export function useCreateOrderIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (issue





) => {
      const client = supabase 




;
      const { data, error } = await client.rpc("create_order_issue", {
        _order_number: issue.order_number,
        _customer_email: issue.customer_email,
        _type: issue.type,
        _message: issue.message || null,
        _image_url: issue.image_url || null,

      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-issues"] });
      queryClient.invalidateQueries({ queryKey: ["all-boutique-issues"] });
    },
  });
}

export function useIssueResponses(issueId) {
  return useQuery({
    queryKey: ["issue-responses", issueId],
    queryFn: async () => {
      if (!issueId) return [];
      const { data, error } = await supabase
        .from("issue_responses" )
        .select("*")
        .eq("issue_id", issueId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data || []) ;
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
    }




) => {
      // Create response
      const { error: responseError } = await supabase
        .from("issue_responses" )
        .insert({
          issue_id: issueId,
          action,
          message: message || null,
        });

      if (responseError) throw responseError;

      // Update issue status
      const { error: updateError } = await supabase
        .from("order_issues" )
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
