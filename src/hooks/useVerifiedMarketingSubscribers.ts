import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VerifiedMarketingSubscriber {
  email: string;
  confirmed_at: string;
  expires_at: string;
  total_spent_cents: number;
}

/** Read-only current audience. Email tokens and BIB's audience are never exposed to merchants. */
export function useVerifiedMarketingSubscribers(boutiqueId?: string) {
  return useQuery({
    queryKey: ["verified-marketing-subscribers", boutiqueId],
    enabled: !!boutiqueId,
    staleTime: 0,
    refetchInterval: 60_000,
    queryFn: async (): Promise<VerifiedMarketingSubscriber[]> => {
      const { data, error } = await supabase.rpc(
        "get_boutique_marketing_subscribers" as never,
        { p_boutique_id: boutiqueId } as never,
      );
      if (error) throw error;
      return (data ?? []) as unknown as VerifiedMarketingSubscriber[];
    },
  });
}
