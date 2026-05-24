import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StorefrontProducts } from "../StorefrontProducts";
import { EDITOR_ROUTES } from "@/lib/editorRoutes";

// CartContext + StorefrontContext are consumed by the component.
vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));
vi.mock("@/contexts/StorefrontContext", () => ({
  useStorefrontContext: () => null,
}));
vi.mock("../Storefront3DEffects", () => ({
  TiltCard: ({ children }: any) => <>{children}</>,
  ShineCard: ({ children }: any) => <>{children}</>,
}));
vi.mock("../RecyclingBadge", () => ({
  RecyclingBadge: () => null,
}));

const products = [
  { id: "prod-aaa-111", name: "Sérum Vitamine C", price: 24.9, image_url: "https://x/y.jpg" },
  { id: "prod-bbb-222", name: "Coque iPhone Bio", price: 19.5, image_url: null },
];

describe("StorefrontProducts navigation", () => {
  it("renders product cards as links to /boutique/:slug/product/:id", () => {
    const slug = "ma-boutique";
    render(
      <MemoryRouter>
        <StorefrontProducts
          title="Nos produits"
          products={products}
          primaryColor="#000"
          boutiqueSlug={slug}
        />
      </MemoryRouter>,
    );

    for (const p of products) {
      const expected = EDITOR_ROUTES.storefrontProduct(slug, p.id);
      // At least one anchor must point to the canonical product URL.
      const matches = screen
        .getAllByRole("link")
        .filter((a) => (a as HTMLAnchorElement).getAttribute("href") === expected);
      expect(matches.length, `link for ${p.id} → ${expected}`).toBeGreaterThan(0);
      // The product name must be a clickable link too.
      const titleLink = screen.getByRole("link", { name: p.name });
      expect(titleLink.getAttribute("href")).toBe(expected);
    }
  });

  it("does not render product links when boutiqueSlug is missing", () => {
    render(
      <MemoryRouter>
        <StorefrontProducts title="Nos produits" products={products} primaryColor="#000" />
      </MemoryRouter>,
    );
    const links = screen
      .queryAllByRole("link")
      .filter((a) => (a as HTMLAnchorElement).getAttribute("href")?.includes("/product/"));
    expect(links).toHaveLength(0);
  });

  it("EDITOR_ROUTES.storefrontProduct stays the single source of truth", () => {
    expect(EDITOR_ROUTES.storefrontProduct("ma-boutique", "abc")).toBe(
      "/boutique/ma-boutique/product/abc",
    );
    // Special chars must be encoded so links never break.
    expect(EDITOR_ROUTES.storefrontProduct("café & co", "id/with slash")).toBe(
      "/boutique/caf%C3%A9%20%26%20co/product/id%2Fwith%20slash",
    );
  });
});