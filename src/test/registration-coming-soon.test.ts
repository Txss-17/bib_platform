import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isPublicInformationPath } from "@/lib/publicPrelaunch";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("Merchant registration remains closed while customers and partners can apply", () => {
  it("routes only merchant signup entry points to Coming Soon", () => {
    const router = read("src/App.tsx");
    for (const route of ["/signup", "/register"]) {
      expect(router).toContain(`path="${route}" element={<SignupComingSoon />} />`);
      expect(isPublicInformationPath(route)).toBe(true);
    }
    expect(router).not.toContain('element={<Signup />}');
    expect(router).toContain('path="/store/signup" element={<StoreSignup />} />');
  });

  it("blocks merchant signup, allows customer signup, and retains sign-in", () => {
    const auth = read("src/contexts/AuthContext.tsx");
    expect(auth).toContain('type !== "store"');
    expect(auth).toContain('error: new AuthError("Merchant account registration is coming soon.", 403)');
    expect(auth).toContain("supabase.auth.signUp(");
    expect(auth).toContain("supabase.auth.signInWithPassword(");
  });

  it("permits public partner qualification routes", () => {
    for (const route of ["/suppliers/apply", "/fournisseurs/candidature", "/ops/apply", "/logistics/apply", "/suppliers/portal/token", "/ops/portal/token"]) {
      expect(isPublicInformationPath(route)).toBe(true);
    }
  });

  it("presents bilingual Coming Soon copy with login and home links", () => {
    const page = read("src/pages/SignupComingSoon.tsx");
    expect(page).toContain("Bientôt disponible");
    expect(page).toContain("Coming soon");
    expect(page).toContain('to="/login"');
    expect(page).toContain('to="/"');
  });
});
