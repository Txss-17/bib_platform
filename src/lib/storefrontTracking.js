import { supabase } from "@/integrations/supabase/client";
const SESSION_KEY = "bib_storefront_session";
function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}
async function trackStorefrontEvent(boutiqueId, eventType, options = {}) {
  if (!boutiqueId) return;
  try {
    await supabase.from("storefront_events").insert([
      {
        boutique_id: boutiqueId,
        product_id: options.productId ?? null,
        event_type: eventType,
        session_id: getSessionId(),
        metadata: options.metadata ?? {}
      }
    ]);
  } catch {
  }
}
export {
  trackStorefrontEvent
};
