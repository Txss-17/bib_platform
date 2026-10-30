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
 "/carrieres/talent",
 "/bib-talent",
 "/mentions-legales",
 "/confidentialite",
 "/cookies",
] as const;
