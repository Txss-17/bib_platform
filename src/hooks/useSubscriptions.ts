import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getStripeEnvironment } from "@/lib/stripe";

export interface Subscription {
  id: string;
  price_id: string;
  product_id: string;
  status: string;
  current_period_start?: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_subscription_id: string;
  stripe_customer_id?: string | null;
  environment: string;
  kind: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Statuts qui donnent actuellement accès à un abonnement.
 */
export function isActiveSubscription(
  subscription: Subscription,
): boolean {
  return (
    subscription.status === "active" ||
    subscription.status === "trialing"
  );
}

/**
 * Identifie spécifiquement BIB Abonné.
 *
 * Un compte Store n'est PAS automatiquement abonné.
 */
export function isBibSubscriber(
  subscription: Subscription,
): boolean {
  return (
    subscription.kind === "bib_subscriber" &&
    isActiveSubscription(subscription)
  );
}

/**
 * Retourne l'abonnement BIB Abonné actif
 * de l'utilisateur courant.
 */
export function useBibSubscriberSubscription() {
  const { data: subscriptions = [], ...query } =
    useUserSubscriptions();

  const subscription =
    subscriptions.find(isBibSubscriber) ?? null;

  return {
    ...query,
    data: subscription,
    subscription,
    isSubscriber: !!subscription,
  };
}

/**
 * Retourne tous les abonnements de l'utilisateur courant.
 */
export function useUserSubscriptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subscriptions", user?.id],
    enabled: !!user,

    queryFn: async (): Promise<Subscription[]> => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      return (data ?? []) as Subscription[];
    },
  });
}

/**
 * Ouvre le portail Stripe de gestion des abonnements.
 */
export function useOpenBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } =
        await supabase.functions.invoke(
          "create-portal-session",
          {
            body: {
              returnUrl:
                `${window.location.origin}/store/account`,
            },
          },
        );

      if (error || !data?.url) {
        throw new Error(
          error?.message ||
            "Impossible d'ouvrir le portail de facturation",
        );
      }

      window.location.href = data.url;
    },
  });
}

export function useInvalidateSubscriptions() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      queryKey: ["subscriptions"],
    });
}

/** Catégorie d'un abonnement marchand : plan ou assurance. */
export function subscriptionCategory(
  subscription: Subscription,
): "plan" | "insurance" | null {
  if (subscription.kind === "bib_subscriber") return null;
  if (subscription.price_id.startsWith("insurance_")) return "insurance";
  if (/(starter|growth|pro)_(monthly|yearly)$/.test(subscription.price_id)) return "plan";
  return null;
}

export type ManageSubscriptionInput =
  | { action: "change"; priceId: string }
  | { action: "cancel"; category: "plan" | "insurance" };

/**
 * Changement de plan immédiat au prorata, ou résiliation immédiate.
 * Le statut final est confirmé par les événements de paiement côté serveur.
 */
export function useManageSubscription() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuth();

  return useMutation({
    mutationFn: async (input: ManageSubscriptionInput) => {
      const { data, error } = await supabase.functions.invoke(
        "manage-subscription",
        { body: { ...input, environment: getStripeEnvironment() } },
      );
      if (error || data?.error) {
        throw new Error(data?.error || error?.message || "Opération impossible");
      }
      return data;
    },
    onSuccess: async () => {
      // Laisse le temps aux événements serveur d'arriver, puis rafraîchit.
      await new Promise((r) => setTimeout(r, 2500));
      await queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      await refreshProfile();
    },
  });
}
