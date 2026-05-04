import { describe, it, expect } from "vitest";
import { EDITOR_ROUTES, canPreviewStorefront } from "../editorRoutes";

describe("EDITOR_ROUTES", () => {
  it("storefront matches the public route registered in App.tsx", () => {
    expect(EDITOR_ROUTES.storefront("ma-boutique")).toBe("/boutique/ma-boutique");
  });
  it("editor matches /dashboard/boutiques/edit/:id", () => {
    expect(EDITOR_ROUTES.boutiqueEdit("abc")).toBe("/dashboard/boutiques/edit/abc");
  });
  it("analytics matches /dashboard/boutiques/analytics/:id", () => {
    expect(EDITOR_ROUTES.analyticsStudio("abc")).toBe("/dashboard/boutiques/analytics/abc");
  });
  it("encodes slugs with special chars", () => {
    expect(EDITOR_ROUTES.storefront("café & co")).toBe("/boutique/caf%C3%A9%20%26%20co");
  });
  it("canPreviewStorefront rejects empty/null", () => {
    expect(canPreviewStorefront(null)).toBe(false);
    expect(canPreviewStorefront("")).toBe(false);
    expect(canPreviewStorefront("ok")).toBe(true);
  });
});