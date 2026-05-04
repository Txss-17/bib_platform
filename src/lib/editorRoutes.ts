/**
 * Centralized routing for the boutique editor & storefront.
 * Single source of truth — every "view/edit/back" button must use these helpers.
 * Tested in src/lib/__tests__/editorRoutes.test.ts.
 */

export const EDITOR_ROUTES = {
  /** Dashboard list of boutiques. */
  boutiquesList: () => "/dashboard/boutiques",
  /** Editor for a specific boutique. Must match <Route path="/dashboard/boutiques/edit/:id">. */
  boutiqueEdit: (id: string) => `/dashboard/boutiques/edit/${encodeURIComponent(id)}`,
  /** Public storefront — MUST match <Route path="/boutique/:slug"> in App.tsx. */
  storefront: (slug: string) => `/boutique/${encodeURIComponent(slug)}`,
  /** Public product page. */
  storefrontProduct: (slug: string, productId: string) =>
    `/boutique/${encodeURIComponent(slug)}/product/${encodeURIComponent(productId)}`,
  /** Per-boutique analytics studio. Must match <Route path="/dashboard/boutiques/analytics/:id">. */
  analyticsStudio: (id: string) =>
    `/dashboard/boutiques/analytics/${encodeURIComponent(id)}`,
} as const;

/** True if the given slug renders a usable storefront URL. */
export function canPreviewStorefront(slug?: string | null): slug is string {
  return typeof slug === "string" && slug.trim().length > 0;
}