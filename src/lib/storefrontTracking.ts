import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "bib_storefront_session";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

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
  try {
    await supabase.from("storefront_events").insert({
      boutique_id: boutiqueId,
      product_id: options.productId ?? null,
      event_type: eventType,
      session_id: getSessionId(),
      metadata: options.metadata ?? {},
    });
  } catch {
    /* swallow — analytics must never break the storefront */
  }
}