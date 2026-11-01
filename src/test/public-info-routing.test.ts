import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isPublicInformationPath, isMerchantTestPath } from "@/lib/publicPrelaunch";

const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

describe("BIB public navigation", () => {
  it("keeps information pages accessible on the public domain", () => {
    for (const route of [
      "/", "/landing", "/a-propos", "/bib-talent", "/tarifs",
      "/pricing", "/vendre", "/suppliers", "/fournisseurs", "/ops",
      "/logistics", "/centre-aide", "/pack-legal", "/cgv", "/cgu",
      "/confidentialite", "/cookies",
    ]) expect(isPublicInformationPath(route)).toBe(true);
    expect(app).toContain("!isPublicInformationPath(window.location.pathname)");
  });

  it("keeps commerce and partner mutations outside the public informational allowlist", () => {
    for (const route of [
      "/store", "/checkout", "/suppliers/apply",
      "/ops/apply",
    ]) {
      expect(isPublicInformationPath(route)).toBe(false);
      expect(isMerchantTestPath(route)).toBe(false);
    }
  });

  it("routes both signup paths to the bilingual Coming Soon screen", () => {
    for (const path of ["/signup", "/store/signup", "/register"]) {
      expect(isPublicInformationPath(path)).toBe(true);
      expect(app).toContain('path="' + path + '" element={<SignupComingSoon />} />');
    }
  });

  it("does not unhide Careers ahead of the recruitment phase", () => {
    expect(app).toContain('<Route path="/carrieres" element={<Navigate to="/bib-talent" replace />} />');
  });
});
