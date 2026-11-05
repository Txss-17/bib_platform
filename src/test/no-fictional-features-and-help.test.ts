import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Production BIB contains no invented operations or obsolete programs", () => {
  it("uses an empty approved catalogue rather than fake supplier fixtures", () => {
    const store = read("src/hooks/useStore.ts");
    const home = read("src/components/landing/DiscoverBoutiquesSection.tsx");
    expect(store).not.toContain("recycling_scans");
    expect(home).toContain("boutique.product_count > 0");
    expect(read("src/components/TrustSection.tsx")).not.toContain("99.9%");
  });

  it("does not advertise unlaunched rewards or recycling", () => {
    const terms = read("src/pages/LegalPages.tsx").toLowerCase();
    const help = read("src/lib/centreAideData.ts").toLowerCase();
    for (const obsolete of ["cartes cadeaux", "programme de points", "recyclage"]) {
      expect(terms).not.toContain(obsolete);
      expect(help).not.toContain(obsolete);
    }
  });

  it("never displays a fake support submission", () => {
    const source = read("src/pages/dashboard/Aide.tsx");
    const migration = read("supabase/migrations/20261102183500_dashboard_support_real_consent.sql");
    expect(source).not.toContain("setTimeout");
    expect(source).toContain('from("support_tickets").insert');
    expect(source).toContain("consent_notice_version");
    expect(source).toContain("if (error) throw error");
    expect(migration).toContain("bib_guard_dashboard_support_ticket");
    expect(migration).toContain("dashboard_support_requires_owner");
  });

  it("does not persist cart or checkout profile locally, but preserves Supabase auth across redirects", () => {
    expect(read("src/contexts/StoreCartContext.tsx")).not.toContain("localStorage.");
    expect(read("src/components/storefront/CheckoutForm.tsx")).not.toContain("localStorage.");
    const authClient = read("src/integrations/supabase/client.ts");
    expect(authClient).toContain("persistSession: true");
    expect(authClient).toContain("autoRefreshToken: true");
    expect(authClient).not.toContain("memoryAuthStorage");
    const migration = read("src/lib/purgeLegacyBrowserRecords.ts");
    expect(migration).toContain('migrationMarker = "bib:legacy-browser-cleanup:v2"');
    expect(migration).toContain("key !== \"supabase.auth.token\"");
    expect(migration).toContain("!/^sb-[a-z0-9-]+-auth-token$/i.test(key)");
    expect(read("src/hooks/useTourProgress.ts")).not.toContain("localStorage.setItem");
  });
});
