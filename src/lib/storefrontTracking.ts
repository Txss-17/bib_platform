import { supabase } from "@/integrations/supabase/client";
import { getConsentedAnalyticsSession } from "@/lib/cookieConsent";

export type StorefrontEventType =
  | "boutique_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_start";

/**
 * Fire-and-forget storefront analytics event.
 * Safe to call from public pages (anonymous insert allowed by RLS for
 * published boutiques only). Errors are silently swallowed so they never
 * disrupt the buyer experience.
 */
export async function trackStorefrontEvent(
  boutiqueId: string,
  eventType: StorefrontEventType,
  options: { productId?: string; metadata?: Record<string, unknown> } = {},
): Promise<void> {
  if (!boutiqueId) return;
  const sessionId = getConsentedAnalyticsSession();
  if (!sessionId) return;
  try {
    await supabase.from("storefront_events").insert([
      {
        boutique_id: boutiqueId,
        product_id: options.productId ?? null,
        event_type: eventType,
        session_id: sessionId,
        metadata: (options.metadata ?? {}) as never,
      },
    ] as never);
  } catch {
    /* swallow — analytics must never break the storefront */
  }
}
