import { describe, expect, it } from "vitest";
import { validateBoutiquePublication, } from "../boutiquePublication";

const ready = () => ({
  studioCompletedAt: "2026-10-19T00:00:00Z",
  scenes: [
    { page_id: null, position: 0, is_visible: true, role: "hero", variant: "type-only", content: { title: "Porte moi", ctaLabel: "Découvrir" } },
    { page_id: null, position: 1, is_visible: true, role: "showcase", variant: "default", content: {} },
    { page_id: null, position: 2, is_visible: true, role: "cta", variant: "default", content: {} },
  ],
  eligibleProductCount: 1,
  seoTitle: "Porte moi — Collection",
  seoDescription: "Découvrez notre collection et les produits de notre boutique Porte moi.",
});

describe("boutique publication readiness", () => {
  it("accepts a complete homepage", () => expect(validateBoutiquePublication(ready()).ok).toBe(true));
  it("does not count scenes on another page", () => {
    const input = ready();
    input.scenes = input.scenes.map((scene) => ({ ...scene, page_id: "about" }));
    expect(validateBoutiquePublication(input).ok).toBe(false);
  });
  it("ignores unrelated page content when the homepage is valid", () => {
    const input = ready();
    input.scenes.push({ ...input.scenes[0], page_id: "about", position: -1, content: {} });
    expect(validateBoutiquePublication(input).ok).toBe(true);
  });
  it("blocks hidden required scenes", () => {
    const input = ready(); input.scenes[1].is_visible = false;
    expect(validateBoutiquePublication(input).ok).toBe(false);
  });
  it("blocks deleted homepage scenes", () => {
    const input = ready(); input.scenes.pop();
    expect(validateBoutiquePublication(input).ok).toBe(false);
  });
  it("validates the first visible hero in position order", () => {
    const input = ready(); input.scenes.push({ ...input.scenes[0], position: -1, content: {} });
    expect(validateBoutiquePublication(input).ok).toBe(false);
  });
  it("requires a completed studio", () => expect(validateBoutiquePublication({ ...ready(), studioCompletedAt: null }).ok).toBe(false));
  it("requires at least one eligible active catalogue product", () => expect(validateBoutiquePublication({ ...ready(), eligibleProductCount: 0 }).ok).toBe(false));
  it.each(["loading", "failed", "saving"] )("blocks publication while %s even with cached valid data", (state) => {
    expect(validateBoutiquePublication({ ...ready(), [state]: true }).ok).toBe(false);
  });
  it.each([9, 61])("rejects a SEO title of %i characters", (length) => expect(validateBoutiquePublication({ ...ready(), seoTitle: "a".repeat(length) }).ok).toBe(false));
  it.each([49, 161])("rejects a SEO description of %i characters", (length) => expect(validateBoutiquePublication({ ...ready(), seoDescription: "a".repeat(length) }).ok).toBe(false));
  it.each([10, 60])("accepts a SEO title of %i characters", (length) => expect(validateBoutiquePublication({ ...ready(), seoTitle: "a".repeat(length) }).ok).toBe(true));
  it.each([50, 160])("accepts a SEO description of %i characters", (length) => expect(validateBoutiquePublication({ ...ready(), seoDescription: "a".repeat(length) }).ok).toBe(true));
  it("rejects an incomplete edited hero", () => {
    const input = ready(); input.scenes[0].content = { title: "abcd", ctaLabel: "a" };
    expect(validateBoutiquePublication(input).ok).toBe(false);
  });
  it("requires nonblank media for fullscreen heroes", () => {
    const input = ready(); input.scenes[0].variant = "fullscreen";
    input.scenes[0].content = { title: "Porte moi", ctaLabel: "Découvrir", backgroundImage: " " };
    expect(validateBoutiquePublication(input).ok).toBe(false);
    input.scenes[0].content = { title: "Porte moi", ctaLabel: "Découvrir", videoUrl: "/video.mp4" };
    expect(validateBoutiquePublication(input).ok).toBe(true);
  });
});