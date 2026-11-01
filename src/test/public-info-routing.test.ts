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
      "/store", "/checkout", "/signup", "/suppliers/apply",
      "/ops/apply", "/store/signup",
    ]) {
      expect(isPublicInformationPath(route)).toBe(false);
      expect(isMerchantTestPath(route)).toBe(false);
    }
  });

  it("does not unhide Careers ahead of the recruitment phase", () => {
    expect(app).toContain('<Route path="/carrieres" element={<Navigate to="/bib-talent" replace />} />');
  });
});
