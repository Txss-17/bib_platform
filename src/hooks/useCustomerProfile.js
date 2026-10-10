import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
function useCustomerProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("customer_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}
function useCreateCustomerProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      if (!user) throw new Error("Not authenticated");
      const { data: profile, error } = await supabase.from("customer_profiles").insert({
        user_id: user.id,
        email: input.email.toLowerCase().trim(),
        full_name: input.fullName ?? null,
        marketing_opt_in: input.marketingOptIn ?? false
      }).select().single();
      if (error) throw error;
      const { data: claimed } = await supabase.rpc("claim_guest_orders", {
        _customer_profile_id: profile.id,
        _email: input.email
      });
      return { profile, claimedCount: claimed ?? 0 };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-profile"] });
      qc.invalidateQueries({ queryKey: ["customer-orders"] });
      qc.invalidateQueries({ queryKey: ["customer-gift-cards"] });
    }
  });
}
function useCustomerOrders() {
  const { data: profile } = useCustomerProfile();
  return useQuery({
    queryKey: ["customer-orders", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase.from("orders").select(`
          id, order_number, amount, logistics_status, created_at,
          customer_name, customer_email,
          boutiques ( id, name, slug, logo_url ),
          products ( supplier_products ( name, image_url ) )
        `).eq("customer_profile_id", profile.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile
  });
}
function useCustomerGiftCards() {
  const { data: profile } = useCustomerProfile();
  return useQuery({
    queryKey: ["customer-gift-cards", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase.from("gift_cards").select(`
          id, balance_cents, updated_at,
          boutiques ( id, name, slug, logo_url, cover_image_url )
        `).eq("customer_profile_id", profile.id).gt("balance_cents", 0).order("balance_cents", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile
  });
}
function useRecyclingHistory() {
  const { data: profile } = useCustomerProfile();
  return useQuery({
    queryKey: ["customer-recycling", profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      const { data, error } = await supabase.from("recycling_scans").select(`
          id, points, source, created_at,
          boutiques ( id, name, slug, logo_url )
        `).eq("customer_profile_id", profile.id).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!profile
  });
}
function useRecordRecyclingScan() {
  const { data: profile } = useCustomerProfile();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input) => {
      if (!profile) throw new Error("Customer profile required");
      const { data, error } = await supabase.from("recycling_scans").insert({
        customer_profile_id: profile.id,
        boutique_id: input.boutiqueId,
        points: input.points,
        order_id: input.orderId ?? null,
        source: input.source ?? "qr_scan"
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-profile"] });
      qc.invalidateQueries({ queryKey: ["customer-gift-cards"] });
      qc.invalidateQueries({ queryKey: ["customer-recycling"] });
    }
  });
}
export {
  useCreateCustomerProfile,
  useCustomerGiftCards,
  useCustomerOrders,
  useCustomerProfile,
  useRecordRecyclingScan,
  useRecyclingHistory
};
