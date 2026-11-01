import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isPublicInformationPath } from "@/lib/publicPrelaunch";
const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("BIB portal identity, CRM and subscriber offers", () => {
  it("uses an immutable database account portal instead of changeable auth user_metadata", () => {
    const sql = read("supabase/migrations/20261101161500_account_portal_isolation.sql");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.account_portals");
    expect(sql).toContain("portal IN ('store','platform')");
    expect(sql).toContain("bib_new_account_store_only");
    expect(sql).toContain("GRANT SELECT ON public.account_portals TO authenticated");
    expect(sql).toContain("Merchants create their own boutiques");
    expect(sql).toContain("public.bib_has_portal('platform')");
    const auth = read("src/contexts/AuthContext.tsx");
    expect(auth).toContain('.from("account_portals" as never)');
    expect(auth).toContain("const actualType = await resolveAccountType(data.user)");
    expect(auth).toContain("actualType !== portal");
    expect(auth).toContain("await supabase.auth.signOut()");
    expect(read("src/pages/Login.tsx")).toContain('signIn(email.trim(), password, "platform")');
    expect(read("src/pages/StoreLogin.tsx")).toContain('signIn(normalizedEmail, password, "store")');
  });

  it("permits customer authentication and own account routes", () => {
    for (const path of ["/store/login", "/store/signup", "/store/account", "/store/orders", "/store/favorites"]) {
      expect(isPublicInformationPath(path)).toBe(true);
    }
    expect(read("src/App.tsx")).toContain('<ProtectedRoute context="store">');
  });

  it("does not allow exporting customer CRM rows", () => {
    const crm = read("src/pages/dashboard/Clients.tsx");
    expect(crm).not.toContain("exportToCSV");
    expect(crm).not.toContain("handleExport");
    expect(crm).not.toContain("CSV généré");
  });

  it("removes J+ early-product access marketing from the effective plan migration", () => {
    const sql = read("supabase/migrations/20261101162000_growth_extra_boutiques_and_clean_plan_copy.sql");
    expect(sql).toContain("value NOT LIKE 'Accès nouveaux produits J+%'");
    expect(sql).toContain("tier::text IN ('growth','pro')");
    expect(sql).toContain("19,99");
    expect(sql).toContain("35,99");
  });

  it("advertises order tracking and covered return shipping in subscriber offer screens", () => {
    for (const path of [
      "src/pages/StoreSignup.tsx", "src/pages/StoreSubscriberSubscribe.tsx",
      "src/pages/StoreSubscriberAccount.tsx",
    ]) {
      const page = read(path);
      expect(page).toMatch(/suivi|tracking|Suivi/);
      expect(page).toContain("Retours gratuits : frais de retour pris en charge");
    }
  });
});
