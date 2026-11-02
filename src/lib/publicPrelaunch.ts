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
 "/signup",
 "/store/signup",
 "/store/login",
 "/register",
 "/pack-legal",
 "/donnees-et-consentements",
 "/annexe-donnees-marchands",
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

/**
 * Restore all informational/marketing pages while critical commerce and
 * partner workflows remain under security review. The original prelaunch
 * catch-all must not redirect ordinary navigation to BIB Talent.
 */
export function isPublicInformationPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return new Set([
    "/", "/landing", "/vendre", "/tarifs", "/pricing",
    "/signup", "/store/signup", "/store/login", "/register",
    "/store", "/store/products",
    "/store/account", "/store/favorites", "/store/orders",
    // Partner applications and their token-scoped onboarding/resume pages.
    "/suppliers/apply", "/fournisseurs/candidature",
    "/suppliers/onboarding", "/suppliers/reprendre",
    "/suppliers/onboarding/resume", "/suppliers/resume", "/suppliers/portal",
    "/ops/apply", "/ops/candidature", "/logistics/apply",
    "/logistique/candidature", "/ops/onboarding",
    "/ops/reprendre", "/ops/onboarding/resume", "/ops/resume", "/ops/portal",
    "/a-propos", "/bib-talent", "/suppliers", "/fournisseurs",
    "/ops", "/logistics", "/logistique", "/centre-aide",
    "/help", "/help/faq", "/help/guide", "/pack-legal",
    "/donnees-et-consentements", "/annexe-donnees-marchands",
    "/legal", "/mentions-legales", "/cgu", "/cgv",
    "/confidentialite", "/cookies", "/talent/mentions-legales",
    "/talent/confidentialite", "/talent/cookies",
    "/carrieres", "/carrieres/postes", "/carrieres/talent",
    "/careers", "/careers/jobs",
  ]).has(path) ||
    /^\/(suppliers|ops)\/portal\/[^/]+$/.test(path) ||
    /^\/store\/(boutique|product)\/[^/]+$/.test(path);
}
