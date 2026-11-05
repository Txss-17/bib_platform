import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { guideGroups } from "@/lib/centreAideData";
import { guideAccessHref, guideDescriptionPath, isProtectedGuidePath } from "@/lib/centreAideAccess";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("BIB help guide access", () => {
  const guides = guideGroups.flatMap((group) => group.guides);
  const protectedGuides = guides.filter((guide) => guide.requiresAuth);
  const publicGuides = guides.filter((guide) => !guide.requiresAuth);

  it("requires login immediately for every locked guide and restores the exact guide URL", () => {
    expect(protectedGuides.length).toBeGreaterThan(0);
    for (const guide of protectedGuides) {
      const guidePath = guideDescriptionPath(guide.slug);
      expect(isProtectedGuidePath(guidePath), guide.slug).toBe(true);
      expect(guideAccessHref(guide, false)).toBe(
        `/login?next=${encodeURIComponent(guidePath)}`
      );
      expect(guideAccessHref(guide, true)).toBe(guidePath);
    }
  });

  it("opens public guides without authentication and rejects arbitrary redirect paths", () => {
    for (const guide of publicGuides) {
      const guidePath = guideDescriptionPath(guide.slug);
      expect(isProtectedGuidePath(guidePath)).toBe(false);
      expect(guideAccessHref(guide, false)).toBe(guidePath);
    }
    for (const unsafe of [
      "//evil.example", "https://evil.example",
      "/dashboard", "/centre-aide/guide/not-a-real-guide",
      "/centre-aide/guide/boutique?unexpected=1", "/centre-aide/guide/../../dashboard",
    ]) {
      expect(isProtectedGuidePath(unsafe)).toBe(false);
    }
  });

  it("blocks direct deep links before rendering any locked guide description", () => {
    const guidePage = read("src/pages/CentreAideGuide.tsx");
    const landing = read("src/pages/CentreAide.tsx");
    const login = read("src/pages/Login.tsx");
    expect(guidePage).toContain("if (guide?.requiresAuth && loading)");
    expect(guidePage).toContain("if (guide?.requiresAuth && !canReadProtectedGuides)");
    expect(guidePage).toContain('<Navigate to={guideAccessHref(guide, false)} replace />');
    expect(guidePage).toContain('g.requiresAuth && !canReadProtectedGuides');
    expect(guidePage).toContain("guideAccessHref(g, canReadProtectedGuides)");
    expect(landing).toContain("guideAccessHref(guide, canReadProtectedGuides)");
    expect(landing).toContain("Connexion nécessaire pour lire la description");
    expect(login).toContain("isProtectedGuidePath(from)");
    expect(login).toContain("navigate(destination, { replace: true })");
  });
});
