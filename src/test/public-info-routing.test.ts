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

  it("keeps checkout blocked but exposes customer and partner applications", () => {
    for (const route of [
      "/store/cart", "/checkout",
    ]) {
      expect(isPublicInformationPath(route)).toBe(false);
      expect(isMerchantTestPath(route)).toBe(false);
    }
    for (const route of ["/store", "/store/products", "/store/boutique/sample", "/store/product/item", "/store/login", "/store/account", "/store/signup", "/suppliers/apply", "/fournisseurs/candidature", "/ops/apply", "/logistics/apply", "/suppliers/portal/test-token", "/ops/portal/test-token"]) {
      expect(isPublicInformationPath(route)).toBe(true);
    }
  });

  it("keeps merchant signup on Coming Soon but permits customer registration", () => {
    for (const path of ["/signup", "/register"]) {
      expect(isPublicInformationPath(path)).toBe(true);
      expect(app).toContain('path="' + path + '" element={<SignupComingSoon />} />');
    }
    expect(app).toContain('path="/store/signup" element={<StoreSignup />} />');
  });

  it("does not unhide Careers ahead of the recruitment phase", () => {
    expect(app).toContain('<Route path="/carrieres" element={<Navigate to="/bib-talent" replace />} />');
  });
});
