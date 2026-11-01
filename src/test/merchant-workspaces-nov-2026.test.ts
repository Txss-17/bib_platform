import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("Merchant operational workspaces", () => {
  it("stores notification preferences without disabling mandatory security emails", () => {
    const sql = read("supabase/migrations/20261101170000_account_boutique_preferences.sql");
    expect(sql).toContain("account_notification_preferences");
    expect(sql).toContain("NEW.security_emails:=true");
    expect(sql).toContain("boutique_payout_preferences");
    expect(sql).toContain("pending_verification");
    expect(sql).toContain("public.owns_boutique(auth.uid(),boutique_id)");
    const account = read("src/pages/dashboard/Parametres.tsx");
    expect(account).toContain("<AccountNotificationPreferences />");
    expect(account).not.toContain("AddOnsCompact");
    expect(account).not.toContain("BOUTIQUE_PRICE = 9");
    expect(account).toContain('searchParams.get("tab")');
    expect(read("supabase/functions/onboarding-reminders/index.ts")).toContain("notificationPrefs?.account_updates === false");
  });

  it("provides payout, alerts, email and authorized team configuration per boutique", () => {
    const config = read("src/pages/dashboard/BoutiqueConfiguration.tsx");
    expect(config).toContain("<BoutiquePayoutSettings boutiqueId={boutique.id} />");
    expect(config).toContain("<BoutiqueAlertsSettings boutiqueId={boutique.id} />");
    expect(config).toContain("<EmailMarketingSettings boutiqueId={boutique.id} />");
    expect(config).toContain('tier === "growth" || tier === "pro"');
    expect(read("src/App.tsx")).toContain('path="/dashboard/boutiques/configuration"');
    expect(read("src/components/dashboard/DashboardSidebar.tsx")).toContain('url: "/dashboard/boutiques/configuration"');
    const team = read("supabase/migrations/20261101171000_growth_pro_team_access.sql");
    expect(team).toContain("Growth Pro owners manage team");
    expect(team).toContain("team_requires_growth_or_pro");
    expect(team).toContain("Gestion d’équipe et rôles");
    expect(read("src/hooks/useBoutiqueMembers.ts")).toContain("pro: 10");
    expect(read("src/pages/dashboard/Equipe.tsx")).toContain("canUseTeam");
  });

  it("does not fabricate sales or payout information", () => {
    const sales = read("src/pages/dashboard/Ventes.tsx");
    expect(sales).not.toContain("Lampe LED Design");
    expect(sales).not.toContain("Coussin Velours");
    expect(sales).toContain("useSalesPerformance(selectedBoutique)");
    expect(sales).toContain("Vos ventes par marché");
    expect(sales).not.toContain("hors test");
    expect(read("src/components/dashboard/sales/SalesHeatmap.tsx")).toContain("conic-gradient");
    const geo = read("src/hooks/useSalesGeography.ts");
    expect(geo).toContain('.eq("payment_status", "paid")');
    expect(geo).toContain('order.stripe_environment === "sandbox"');
    const payouts = read("src/pages/dashboard/Paiements.tsx");
    expect(payouts).not.toContain("nextPayoutDate()");
    expect(payouts).toContain("nextConfirmedPayout");
    const stats = read("src/pages/dashboard/SEOAnalytics.tsx");
    expect(stats).toContain('order.payment_status === "paid"');
    expect(stats).toContain("Statistiques & qualité SEO");
  });

  it("shows a real product operations table and mobile marketing layout", () => {
    const catalog = read("src/pages/dashboard/Produits.tsx");
    expect(catalog).toContain('className="w-full min-w-[850px]');
    expect(catalog).toContain("filteredProducts.map(product =>");
    expect(catalog).toContain("lg:hidden");
    const marketing = read("src/pages/dashboard/Marketing.tsx");
    expect(marketing).toContain('w-full min-w-0 pb-1');
    expect(marketing).toContain('min-w-0 grid-cols-3');
    expect(marketing).toContain('sm:flex-row sm:items-end');
    const composer = read("src/components/marketing/BlockComposer.tsx");
    expect(composer).toContain("lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]");
    expect(read("src/pages/dashboard/Ventes.tsx")).toContain("<LiveSalesGlobe boutiqueId={selectedBoutique} />");
  });
  it("persists per-store alert settings with owner-only access and safe email templates", () => {
    const sql = read("supabase/migrations/20261101183000_boutique_alerts_persistence.sql");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.boutique_alert_settings");
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS public.boutique_alert_log");
    expect(sql).toContain("Merchant manages own alert settings");
    expect(sql).toContain("public.bib_has_portal('platform')");
    const server = read("supabase/functions/send-boutique-email/index.ts");
    expect(server).toContain("alert_recipient_not_authorized");
    expect(server).toContain('type === "alert"');
    expect(server).toContain("invalid_alert_variables");
    const checker = read("src/lib/boutiqueAlertChecker.ts");
    expect(checker).toContain("if (!s.enabled) return");
    expect(checker).not.toContain("subject_override:");
    expect(checker).not.toContain("body_override:");
    const panel = read("src/components/dashboard/BoutiqueAlertsSettings.tsx");
    expect(panel).toContain("Journal des alertes");
    expect(panel).toContain("useResolveAlert()");
    expect(panel).toContain("await upsert.mutateAsync(s)");
  });

  it("separates dedicated team settings, allows EU payout location, and renders actionable sales rows", () => {
    expect(read("src/components/dashboard/boutique/BoutiqueSettingsTab.tsx")).toContain("showTeam = false");
    const config = read("src/pages/dashboard/BoutiqueConfiguration.tsx");
    expect(config).toContain('searchParams.get("tab")');
    expect(config).toContain("overflow-x-auto");
    expect(config).toContain("boutiqueId=${boutique.id}");
    const payout = read("src/components/dashboard/boutique/BoutiquePayoutSettings.tsx");
    expect(payout).toContain("EU_PAYOUT_COUNTRIES");
    expect(payout).toContain("country_code: draft.country_code");
    const sales = read("src/pages/dashboard/Ventes.tsx");
    expect(sales).toContain("ProductPerformanceTable");
    expect(sales).toContain("Identifiez les marchés qui génèrent le plus de chiffre d’affaires.");
    const table = read("src/components/dashboard/sales/ProductPerformanceTable.tsx");
    expect(table).toContain("Dernière vente");
    expect(table).toContain("stock");
    const marketing = read("src/pages/dashboard/Marketing.tsx");
    expect(marketing).toContain("max-h-[90dvh] overflow-y-auto");
    const products = read("src/pages/dashboard/Produits.tsx");
    expect(products).toContain('if (product.status !== "active") return false;');
  });

});
