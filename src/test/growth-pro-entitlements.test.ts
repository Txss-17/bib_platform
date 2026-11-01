import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("BIB Starter / Growth / Pro entitlements", () => {
  it("sets Growth 50 products and support within 48h without custom domains", () => {
    const sql = read("supabase/migrations/20261101152500_growth_pro_entitlements.sql");
    expect(sql).toContain("max_products=50");
    expect(sql).toContain("Support prioritaire 48h");
    expect(sql).toContain("Analytics complets (pages, scènes, produits) + exports CSV et PDF");
    expect(sql).toContain("1 boutique incluse");
  });

  it("keeps advanced analytics and exports hidden from Starter", () => {
    const component = read("src/pages/dashboard/BoutiqueAnalytics.tsx");
    expect(component).toContain('tier === "growth" || tier === "pro"');
    expect(component).toContain("!canViewDetailedAnalytics ?");
    for (const exporter of ["exportPages", "exportScenes", "exportProducts"]) {
      expect(component).toContain(`const ${exporter} =`);
    }
    expect((component.match(/if \(!canViewDetailedAnalytics\) return;/g) ?? []).length).toBe(3);
    const backend = read("supabase/migrations/20261101154500_plan_analytics_rpcs.sql");
    expect(backend).toContain("page_analytics_summary");
    expect(backend).toContain("product_funnel_summary");
    expect(backend).toContain("boutique_period_kpis");
    expect(backend).toContain("pr.plan_tier::text IN ('growth','pro')");
    expect(read("supabase/migrations/20261101154000_advanced_scene_analytics_tiers.sql")).toContain("Growth and Pro owners read scene analytics");
  });

  it("requires paid Growth or Pro shop add-on before authorizing 2 or 3 shops", () => {
    const sql = read("supabase/migrations/20261101153000_pro_boutique_addon_quota.sql");
    const plans = read("supabase/migrations/20261101152500_growth_pro_entitlements.sql");
    expect(plans).toContain("19,99");
    expect(plans).toContain("35,99");
    expect(sql).toContain("environment='live'");
    expect(sql).toContain("kind='boutique_extra'");
    expect(sql).toContain("LEAST(3,lim_boutiques+paid_extra)");
    const client = read("src/hooks/usePlanLimits.ts");
    expect(client).toContain('s.environment === "live"');
    expect(client).toContain("Math.min(3");
    const checkout = read("supabase/functions/create-checkout/index.ts");
    expect(checkout).toContain("expectedCents");
    expect(checkout).toContain("ACTIVE_GROWTH_OR_PRO_PLAN_REQUIRED");
    const manager = read("supabase/functions/manage-subscription/index.ts");
    expect(manager).toContain("BOUTIQUE_EXTRA_RE");
    expect(manager).toContain("Growth or Pro plan required");
  });

  it("reserves custom public-origin settings for Pro and protects them in SQL", () => {
    expect(read("src/components/dashboard/boutique/StudioEditor.tsx")).toContain("disabled={!canCustomizeDomain}");
    expect(read("supabase/migrations/20261101155500_pro_only_public_origin.sql")).toContain("pro_plan_required_for_custom_domain");
  });
});
