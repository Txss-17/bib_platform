import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("Merchant operational workspaces", () => {
  it("supports a collapsible dashboard and clearly identified BIB assistant", () => {
    const layout = read("src/components/dashboard/DashboardLayout.tsx");
    const sidebar = read("src/components/dashboard/DashboardSidebar.tsx");
    const widget = read("src/components/support/FloatingSupportButton.tsx");
    const server = read("supabase/functions/support-ai/index.ts");
    expect(layout).toContain("bib.dashboard.sidebar.collapsed");
    expect(layout).toContain("PanelLeftOpen");
    expect(layout).toContain("PanelLeftClose");
    expect(sidebar).toContain("if (collapsed) return null;");
    expect(widget).toContain("Assistant BIB");
    expect(widget).toContain("Besoin d’aide ?");
    expect(server).toContain("CONNAISSANCES BIB");
    expect(server).toContain('name: "suggest_ticket"');
    expect(server).toContain('body?.action === "create_ticket"');
    expect(server).toContain("offer_ticket: offerTicket");
    expect(widget).toContain("Bonjour ! Comment puis-je vous aider ?");
    expect(widget).toContain("setOfferTicket(data?.offer_ticket === true)");
    expect(widget).toContain("const confirmTicket = async () =>");
    expect(widget).toContain("Continuer la discussion");
    expect(server).toContain("Mes boutiques > Paramètres de la boutique");
    expect(server).not.toContain("versements tous les 15 jours");
  });

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

  it("keeps store SEO tools in boutique settings instead of Help", () => {
    const help = read("src/pages/dashboard/Aide.tsx");
    const config = read("src/pages/dashboard/BoutiqueConfiguration.tsx");
    const seo = read("src/components/dashboard/boutique/BoutiqueSeoTools.tsx");
    expect(help).not.toContain("Connecter Google Search Console");
    expect(help).not.toContain("SeoFixChecklist");
    expect(config).toContain('<TabsTrigger value="seo"');
    expect(config).toContain("<BoutiqueSeoTools boutiqueId={boutique.id} />");
    expect(seo).toContain("allBoutiques.filter((boutique) => boutique.id === boutiqueId)");
    expect(seo).toContain("allProducts.filter((product) => product.boutique_id === boutiqueId)");
    expect(seo).toContain("SeoFixChecklist boutiques={boutiques} products={products}");
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

  it("presents product customization as an editable product dossier rather than a KPI dashboard", () => {
    const page = read("src/pages/dashboard/Personnalisation.tsx");
    const editor = read("src/components/dashboard/products/ProductCustomizationEditor.tsx");
    expect(page).toContain("Donnez votre identité à vos produits");
    expect(page).toContain("Personnalisation BIB");
    expect(page).not.toContain("Références au catalogue");
    expect(page).not.toContain("Capacités qualifiées");
    expect(page).toContain("<ProductCustomizationEditor key={selected.id} product={selected} />");
    expect(editor).toContain("Choix de personnalisation");
    expect(editor).toContain("Visuels du fournisseur");
    expect(editor).toContain("Récapitulatif de vos choix");
    expect(editor).toContain("Enregistrer le brouillon");
    expect(editor).toContain("Demander la revue BIB");
  });

  it("separates standard catalog from customization and requires paid physical samples", () => {
    const supplier = read("src/pages/dashboard/ProduitsFournisseurs.tsx");
    const personalization = read("src/pages/dashboard/Personnalisation.tsx");
    const hook = read("src/hooks/useSampleValidation.ts");
    const validation = read("src/components/dashboard/SimpleValidationSection.tsx");
    const purchases = read("supabase/functions/create-sample-checkout/index.ts");
    const webhook = read("supabase/functions/payments-webhook/index.ts");
    const migration = read("supabase/migrations/20261101223500_paid_sample_validation.sql");
    const products = read("src/pages/dashboard/Produits.tsx");
    expect(supplier).not.toContain("handleCustomize");
    expect(supplier).not.toContain("Personnaliser");
    expect(personalization).toContain("!hasCustomization(caps)");
    expect(personalization).toContain("hasCustomization(readCatalogCustomization(supplierCandidate).capabilities)");
    expect(hook).toContain('functions.invoke("create-sample-checkout"');
    expect(hook).toContain('rpc("mark_paid_sample_received"');
    expect(hook).toContain('rpc("validate_paid_sample"');
    expect(validation).toContain("Acheter l’échantillon pour validation");
    expect(purchases).toContain('BIB_SAMPLE_FULFILLMENT_READY');
    expect(purchases).toContain("checkout.sessions.create");
    expect(webhook).toContain('session.metadata?.kind === "merchant_sample"');
    expect(webhook).toContain('session.payment_status !== "paid"');
    expect(migration).toContain("require_verified_sample_before_activation");
    expect(migration).toContain("stripe_environment='live'");
    expect(products).not.toContain("!hasPhysicalStock");
    expect(products).toContain('sampleCheckout === "success"');
  });

  it("shows merchant logos and prevents fictitious default studio proof", () => {
    const settings = read("src/pages/dashboard/BoutiqueConfiguration.tsx");
    const logo = read("src/components/dashboard/boutique/BoutiqueLogoManager.tsx");
    const header = read("src/components/storefront/StorefrontHeader.tsx");
    const scenes = read("src/lib/studioScenes.ts");
    const renderer = read("src/components/storefront/StudioSceneRenderer.tsx");
    expect(settings).toContain('<TabsTrigger value="identity"');
    expect(settings).toContain("<BoutiqueLogoManager");
    expect(logo).toContain('update({ logo_url: data.publicUrl })');
    expect(logo).toContain("image/png,image/jpeg,image/webp");
    expect(header).toContain("logoUrl");
    expect(header).toContain('alt="" className="h-9 w-9');
    expect(scenes).not.toContain("Verified by Linksy");
    expect(scenes).not.toContain("Rejoignez les 10 000 clients");
    expect(scenes).not.toContain("10K+");
    expect(scenes).not.toContain("48 à 72h");
    expect(renderer).toContain("if (!reviews.length && !badges.length && !press.length) return null");
    expect(renderer).toContain("if (!stats.length) return null");
    expect(renderer).toContain("if (!logos.length) return null");
    expect(renderer).toContain("if (!rows.length) return null");
  });

  it("keeps the supplier catalog focused on discovery rather than favorite KPIs", () => {
    const catalog = read("src/pages/dashboard/ProduitsFournisseurs.tsx");
    expect(catalog).toContain("Trouvez les produits de votre prochaine collection");
    expect(catalog).toContain("Explorer les références");
    expect(catalog).toContain("Mes favoris");
    expect(catalog).toContain("Ajouter aux favoris");
    expect(catalog).not.toContain("<KpiTile");
    expect(catalog).not.toContain("catalogueKpis");
    expect(catalog).toContain('className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 2xl:grid-cols-4"');
    expect(catalog).toContain("AddToBoutiqueDialog");
    expect(catalog).toContain("ProductDetailDialog");
    const details = read("src/components/dashboard/ProductDetailDialog.tsx");
    expect(details).toContain("Informations complémentaires");
    expect(details).toContain("Simuler mon prix de vente");
    expect(details).toContain("Écart brut par unité");
    expect(details).not.toContain("Indice commercial BIB");
    expect(details).not.toContain("3 à 7 jours");
    expect(details).not.toContain("France · Europe");
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
