const EDITOR_ROUTES = {
  /** Dashboard list of boutiques. */
  boutiquesList: () => "/dashboard/boutiques",
  /** Editor for a specific boutique. Must match <Route path="/dashboard/boutiques/edit/:id">. */
  boutiqueEdit: (id) => `/dashboard/boutiques/edit/${encodeURIComponent(id)}`,
  /** Public storefront — MUST match <Route path="/boutique/:slug"> in App.tsx. */
  storefront: (slug) => `/boutique/${encodeURIComponent(slug)}`,
  /** Public product page. */
  storefrontProduct: (slug, productId) => `/boutique/${encodeURIComponent(slug)}/product/${encodeURIComponent(productId)}`,
  /** Per-boutique analytics studio. Must match <Route path="/dashboard/boutiques/analytics/:id">. */
  analyticsStudio: (id) => `/dashboard/boutiques/analytics/${encodeURIComponent(id)}`
};
function canPreviewStorefront(slug) {
  return typeof slug === "string" && slug.trim().length > 0;
}
export {
  EDITOR_ROUTES,
  canPreviewStorefront
};
