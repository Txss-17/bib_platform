/**
 * Public marketing prelaunch must not expose unfinished commerce screens.
 * This is a UI scope gate, NOT a replacement for Supabase RLS or server ACLs.
 * The Lovable internal preview remains available for QA of the full app.
 */
export function isPublicPrelaunchHost(hostname: string): boolean {
 const host=hostname.trim().toLowerCase();
 return !(host==="localhost" || host==="127.0.0.1" ||
   host.startsWith("id-preview--") || host.startsWith("preview--"));
}
export const PRELAUNCH_PUBLIC_ROUTES = [
 "/",
 "/carrieres",
 "/carrieres/postes",
 "/carrieres/talent",
 "/careers",
 "/careers/jobs",
 "/bib-talent",
 "/pack-legal",
 "/legal",
 "/cgv",
 "/cgu",
 "/mentions-legales",
 "/confidentialite",
 "/cookies",
 "/talent/mentions-legales",
 "/talent/confidentialite",
 "/talent/cookies",
] as const;

/** During the closed boutique pilot, expose only authenticated account and
 * dashboard routes through the full application router. ProtectedRoute and
 * Supabase RLS remain authoritative for business data and mutations.
 * Public signup, checkout and storefront remain under the prelaunch gate.
 */
export function isMerchantTestPath(pathname: string): boolean {
  return pathname === "/login" ||
    pathname === "/reset-password" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");
}
