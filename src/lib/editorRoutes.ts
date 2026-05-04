/**
 * Centralized routing for the boutique editor & storefront.
 * Single source of truth — every "view/edit/back" button must use these helpers.
 * Tested in src/lib/__tests__/editorRoutes.test.ts.
 */

export const EDITOR_ROUTES = {
  /** Dashboard list of boutiques. */
  boutiquesList: () => "/dashboard/boutiques",
  /** Editor for a specific boutique. */
  boutiqueEdit: (id: string) => `/dashboard/boutique/${encodeURIComponent(id)}/edit`,
  /** Public storefront — MUST match <Route path="/boutique/:slug"> in App.tsx. */
  storefront: (slug: string) => `/boutique/${encodeURIComponent(slug)}`,
  /** Public product page. */
  storefrontProduct: (slug: string, productId: string) =>
    `/boutique/${encodeURIComponent(slug)}/product/${encodeURIComponent(productId)}`,
  /** Per-boutique analytics studio. */
  analyticsStudio: (id: string) =>
    `/dashboard/boutique/${encodeURIComponent(id)}/analytics`,
} as const;

/** True if the given slug renders a usable storefront URL. */
export function canPreviewStorefront(slug?: string | null): slug is string {
  return typeof slug === "string" && slug.trim().length > 0;
}