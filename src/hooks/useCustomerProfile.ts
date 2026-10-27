import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CustomerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  total_recycling_points: number;
  marketing_opt_in: boolean;
  created_at: string;
}

/** Loads the marketplace customer profile for the current user (if any). */
export function useCustomerProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async (): Promise<CustomerProfile | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("customer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

/** Creates a customer profile + claims any guest orders matching the email. */
export function useCreateCustomerProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      email: string;
      fullName?: string;
      marketingOptIn?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: profile, error } = await supabase
        .from("customer_profiles")
        .insert({
          user_id: user.id,
          email: input.email.toLowerCase().trim(),
          full_name: input.fullName ?? null,
          marketing_opt_in: input.marketingOptIn ?? false,
        })
        .select()
        .single();

      if (error) throw error;

      // Claim any guest orders matching the email
      const { data: claimed } = await supabase.rpc("claim_guest_orders", {
        _customer_profile_id: profile.id,
        _email: input.email,
      });

      return { profile, claimedCount: claimed ?? 0 };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-profile"] });
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
      qc.invalidateQueries({ queryKey: ["customer-gift-cards"] });
    },
  });
}

/** Loads all orders linked to the current customer profile, grouped by boutique. */
export function useCustomerOrders() {
  const { data: profile } = useCustomerProfile();

  return useQuery({
    queryKey: ["customer-orders", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id, order_number, amount, logistics_status, created_at,
          customer_name, customer_email,
          boutiques ( id, name, slug, logo_url ),
          products ( supplier_products ( name, image_url ) )
        `,
        )
        .eq("customer_profile_id", profile.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile,
  });
}

/** Loads all gift cards (one per boutique) for the current customer. */
export function useCustomerGiftCards() {
  const { data: profile } = useCustomerProfile();

  return useQuery({
    queryKey: ["customer-gift-cards", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("gift_cards")
        .select(
          `
          id, balance_cents, updated_at,
          boutiques ( id, name, slug, logo_url, cover_image_url )
        `,
        )
        .eq("customer_profile_id", profile.id)
        .gt("balance_cents", 0)
        .order("balance_cents", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile,
  });
}

/** Loads recycling scan history for the current customer. */
export function useRecyclingHistory() {
  const { data: profile } = useCustomerProfile();

  return useQuery({
    queryKey: ["customer-recycling", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase
        .from("recycling_scans")
        .select(
          `
          id, points, source, created_at,
          boutiques ( id, name, slug, logo_url )
        `,
        )
        .eq("customer_profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile,
  });
}

/** The physical recycling workflow is not yet operational. Client scans cannot award credit. */
export function useRecordRecyclingScan() {
  return useMutation({
    mutationFn: async (_input: {
      boutiqueId: string;
      points: number;
      orderId?: string;
      source?: "qr_scan" | "manual" | "pickup";
    }): Promise<never> => {
      throw new Error("recycling_verification_required");
    },
  });
}
