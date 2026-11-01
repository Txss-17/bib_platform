import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isPublicInformationPath } from "@/lib/publicPrelaunch";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("Public registration remains closed", () => {
  it("routes all known signup entry points to Coming Soon", () => {
    const router = read("src/App.tsx");
    for (const route of ["/signup", "/store/signup", "/register"]) {
      expect(router).toContain(`path="${route}" element={<SignupComingSoon />} />`);
      expect(isPublicInformationPath(route)).toBe(true);
    }
    expect(router).not.toContain('element={<Signup />}');
    expect(router).not.toContain('element={<StoreSignup />}');
  });

  it("blocks client signup while retaining sign-in for existing test merchants", () => {
    const auth = read("src/contexts/AuthContext.tsx");
    expect(auth).toContain('error: new AuthError("Account registration is coming soon.", 403)');
    expect(auth).not.toContain("supabase.auth.signUp(");
    expect(auth).toContain("supabase.auth.signInWithPassword(");
  });

  it("presents bilingual Coming Soon copy with login and home links", () => {
    const page = read("src/pages/SignupComingSoon.tsx");
    expect(page).toContain("Bientôt disponible");
    expect(page).toContain("Coming soon");
    expect(page).toContain('to="/login"');
    expect(page).toContain('to="/"');
  });
});
