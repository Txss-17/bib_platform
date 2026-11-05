import { useSyncExternalStore } from "react";
import { getCookieConsent, subscribeCookieConsent } from "@/lib/cookieConsent";

export function useCookieConsent() {
  return useSyncExternalStore(subscribeCookieConsent, getCookieConsent, () => null);
}
