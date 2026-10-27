import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface RestockRequest {
  id: string;
  requested_quantity: number;
  status: "requested" | "approved" | "ordered" | "received" | "rejected" | "cancelled";
  created_at: string;
  review_comment: string | null;
}

export function useRestockRequests(productId: string, enabled: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stock-restock-requests", user?.id, productId],
    enabled: enabled && !!user,
    refetchInterval: enabled ? 30_000 : false,
    queryFn: async (): Promise<RestockRequest[]> => {
      const { data, error } = await supabase
        .from("stock_restock_requests" as never)
        .select("id,requested_quantity,status,created_at,review_comment")
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as RestockRequest[];
    },
  });
}
