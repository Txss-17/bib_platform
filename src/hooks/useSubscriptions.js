import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getStripeEnvironment } from "@/lib/stripe";
function isActiveSubscription(subscription) {
  return subscription.status === "active" || subscription.status === "trialing";
}
function isBibSubscriber(subscription) {
  return subscription.kind === "bib_subscriber" && isActiveSubscription(subscription);
}
function useBibSubscriberSubscription() {
  const { data: subscriptions = [], ...query } = useUserSubscriptions();
  const subscription = subscriptions.find(isBibSubscriber) ?? null;
  return {
    ...query,
    data: subscription,
    subscription,
    isSubscriber: !!subscription
  };
}
function useUserSubscriptions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscriptions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) {
        return [];
      }
      const { data, error } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", {
        ascending: false
      });
      if (error) {
        throw error;
      }
      return data ?? [];
    }
  });
}
function useOpenBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "create-portal-session",
        {
          body: {
            returnUrl: `${window.location.origin}/store/account`
          }
        }
      );
      if (error || !data?.url) {
        throw new Error(
          error?.message || "Impossible d'ouvrir le portail de facturation"
        );
      }
      window.location.href = data.url;
    }
  });
}
function useInvalidateSubscriptions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({
    queryKey: ["subscriptions"]
  });
}
function subscriptionCategory(subscription) {
  if (subscription.kind === "bib_subscriber") return null;
  if (subscription.price_id.startsWith("insurance_")) return "insurance";
  if (/(starter|growth|pro)_(monthly|yearly)$/.test(subscription.price_id)) return "plan";
  return null;
}
function useManageSubscription() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuth();
  return useMutation({
    mutationFn: async (input) => {
      const { data, error } = await supabase.functions.invoke(
        "manage-subscription",
        { body: { ...input, environment: getStripeEnvironment() } }
      );
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Op\xE9ration impossible");
      }
      return data;
    },
    onSuccess: async () => {
      await new Promise((r) => setTimeout(r, 2500));
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      await refreshProfile();
    }
  });
}
export {
  isActiveSubscription,
  isBibSubscriber,
  subscriptionCategory,
  useBibSubscriberSubscription,
  useInvalidateSubscriptions,
  useManageSubscription,
  useOpenBillingPortal,
  useUserSubscriptions
};
