import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("Merchant operational workspaces", () => {
  it("walks each new merchant through real features and remembers progress by account", () => {
    const tour = read("src/components/tour/PlatformTour.tsx");
    const hook = read("src/hooks/useTourProgress.ts");
    const checklist = read("src/components/onboarding/OnboardingChecklist.tsx");
    const migration = read("supabase/migrations/20261102170500_merchant_tour_progress.sql");
    const dashboard = read("src/pages/Dashboard.tsx");
    expect(dashboard).not.toContain('<PlatformTour autoOpen availablePersonas={["seller"]} />');
    expect(dashboard).toContain("<OnboardingChecklist />");
    expect(checklist).toContain("Votre prochaine action");
    expect(checklist).toContain("Voir toutes les étapes");
    expect(checklist).toContain("steps.find(step => !step.done)");
    expect(dashboard).toContain("<OnboardingChecklist />");
    expect(tour).toContain("Bienvenue dans votre espace marchand BIB");
    expect(tour).toContain("4. Vérifiez les conditions d'activation des produits");
    expect(tour).toContain("6. Préparez la publication");
    expect(tour).toContain("9. Retrouvez l'assistance et le guide");
    expect(tour).toContain("onOpenChange?.(false)");
    expect(hook).toContain('onConflict: "user_id,scope"');
    expect(hook).not.toContain("localStorage.setItem");
    expect(hook).toContain('onConflict: "user_id,scope"');
    expect(migration).toContain("PRIMARY KEY (user_id, scope)");
    expect(migration).toContain("auth.uid()=user_id");
    expect(checklist).not.toContain("localStorage.setItem");
  });

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
    expect(widget).toContain('data?.offer_ticket === true && typeof data?.offer_id === "string"');
    expect(widget).toContain("const confirmTicket = async () =>");
    expect(widget).toContain("Oui, ouvrir un ticket");
    expect(widget).toContain("Non, pas de ticket");
    expect(widget).toContain("Quel point souhaitez-vous approfondir ?");
    expect(server).toContain("Mes boutiques > Paramètres de la boutique");
    expect(server).not.toContain("versements tous les 15 jours");
  });

  it("requires a completed diagnostic and explicit single-use consent for support tickets", () => {
    const server = read("supabase/functions/support-ai/index.ts");
    const widget = read("src/components/support/FloatingSupportButton.tsx");
    const schema = read("supabase/migrations/20261102130000_support_ticket_consent_and_prelaunch_survey.sql");
    expect(server).toContain("userTurns >= 3");
    expect(server).toContain("priorDiagnosticQuestions >= 2");
    expect(server).toContain("reconstructConversation");
    expect(server).toContain("conversation_hash: hash");
    expect(server).toContain("explicit_ticket_consent_required");
    expect(server).toContain('consume_support_ticket_offer');
    expect(server).toContain('body.confirmed !== true');
    expect(server).toContain('name: "finish_topic"');
    expect(server).toContain("sealAssistantTurn");
    expect(server).toContain("openAssistantTurn");
    expect(server).toContain("offer_another_topic");
    expect(widget).toContain("confirmed: true");
    expect(widget).toContain("turn_token: turnToken");
    expect(widget).toContain("offer_id: offerId");
    expect(widget).toContain("Oui, ouvrir un ticket");
    expect(widget).toContain("Non, pas de ticket");
    expect(widget).toContain("Oui, un autre sujet");
    expect(widget).toContain("Non, merci");
    expect(widget).toContain("🙇");
    expect(schema).toContain("consumed_at IS NULL AND expires_at>now()");
    expect(schema).toContain("conversation_hash=p_hash");
    expect(schema).toContain("REVOKE ALL ON public.support_ticket_offers");
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

  it("applies Hero Cinema Pro media and color overrides in live and preview renderers", () => {
    const renderer = read("src/components/storefront/StudioSceneRenderer.tsx");
    const inspector = read("src/components/dashboard/boutique/SceneInspectorPro.tsx");
    const css = read("src/components/storefront/studioScene.css");
    expect(renderer).toContain("proBackground={scene.style_overrides?.background}");
    expect(renderer).toContain("const heroVideo = proBackground?.videoUrl");
    expect(renderer).toContain("const heroImage = proBackground?.imageUrl");
    expect(renderer).toContain("const overlayOpacity = proBackground?.overlayOpacity");
    expect(renderer).toContain("const hasBgMedia = !heroCinema");
    expect(renderer).toContain("proHasMedia || proHasColor");
    expect(inspector).toContain("Couleur de fond Pro");
    expect(inspector).toContain('setBg("color", hexToHsl(event.target.value))');
    expect(inspector).toContain("scene.content.backgroundImage || scene.content.videoUrl");
    expect(css).toContain(".studio-scope.has-frame-vars > section");
    expect(css).toContain(".studio-btn-pill a[href]");
  });

  it("supports advertising drafts per merchant boutique without fake publishing", () => {
    const marketing = read("src/pages/dashboard/Marketing.tsx");
    const boutiques = read("src/pages/dashboard/Boutiques.tsx");
    const ads = read("src/components/marketing/MerchantAdsWorkspace.tsx");
    const migration = read("supabase/migrations/20261102121500_merchant_ad_drafts.sql");
    expect(marketing).toContain('<TabsTrigger value="ads"');
    expect(marketing).toContain("<MerchantAdsWorkspace");
    expect(marketing).toContain('activeTab !== "ads" && !gmailReady');
    expect(boutiques).toContain("tab=ads&boutiqueId=");
    expect(ads).toContain("Proposer un texte depuis la boutique");
    expect(ads).toContain('status: "draft" as const');
    expect(ads).toContain("No ad was published and no advertising charges were made.");
    expect(ads).toContain("Integration not connected");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("user_id = auth.uid()");
    expect(migration).toContain("ad_publication_requires_provider_connection");
  });

  it("lets merchants compose pages, reorder navigation and place their own logo", () => {
    const studio = read("src/components/dashboard/boutique/StudioEditor.tsx");
    const panel = read("src/components/dashboard/boutique/StorefrontNavigationEditor.tsx");
    const gallery = read("src/components/dashboard/boutique/StudioThemeGallery.tsx");
    const header = read("src/components/storefront/StorefrontHeader.tsx");
    const presets = read("src/lib/studioScenes.ts");
    const generate = read("src/hooks/useBrandStudio.ts");
    const publicPage = read("src/pages/BoutiquePublic.tsx");
    const productPage = read("src/pages/ProductPublic.tsx");
    const legacy = read("src/components/storefront/StorefrontPreview.tsx");
    expect(studio).toContain('<TabsTrigger value="navigation"');
    expect(studio).toContain('<TabsTrigger value="themes"');
    expect(studio).toContain("<StorefrontNavigationEditor");
    expect(studio).toContain("<StudioThemeGallery");
    expect(studio).toContain("handleReorderScenes");
    expect(panel).toContain('navigation: draft');
    expect(panel).toContain("pageOrder: ids");
    expect(panel).toContain('logoPosition');
    expect(panel).toContain("showHomeLink");
    expect(header).toContain('const centeredBrand = logoPosition === "center"');
    expect(header).toContain('layout === "minimal" ? "hidden"');
    expect(header).toContain("const orderedPages");
    expect(publicPage).toContain("navigation={themeSettings?.navigation}");
    expect(productPage).toContain("navigation={themeSettings?.navigation}");
    expect(legacy).toContain("navigation={themeSettings?.navigation}");
    expect(gallery).toContain('.is("page_id", null)');
    expect(gallery).not.toContain('.delete()');
    expect(gallery).toContain('content: definition.defaultContent');
    expect(presets).toContain('key: "editorial-luxe"');
    expect(presets).toContain('key: "boutique-directe"');
    expect(generate).toContain("layoutByBundle");
    expect(read("src/components/dashboard/boutique/SceneInspectorPro.tsx")).toContain('setLayout("maxWidth"');
    expect(read("src/components/storefront/studioScene.css")).toContain(".studio-width-narrow");
  });

  it("enforces supplier price floors, paid Pro sales, and authenticated brand generation", () => {
    const pricing = read("supabase/migrations/20261102123000_pricing_and_pro_sales_guards.sql");
    const limits = read("supabase/migrations/20261102123500_brand_ai_rate_limits.sql");
    const applications = read("supabase/migrations/20261102124000_public_application_and_attachment_hardening.sql");
    const pos = read("supabase/functions/create-pos-checkout/index.ts");
    const checkout = read("supabase/functions/create-storefront-checkout/index.ts");
    const ai = read("supabase/functions/boutique-ai/index.ts");
    const legacy = read("supabase/functions/generate-brand-dna/index.ts");
    const support = read("supabase/functions/support-ai/index.ts");
    const widget = read("src/components/support/FloatingSupportButton.tsx");
    expect(pricing).toContain("price_outside_supplier_margin");
    expect(pricing).toContain("promotion_below_supplier_base_or_invalid");
    expect(pricing).toContain("bib_has_active_pro_subscription");
    expect(pricing).toContain('sub.status IN (\'active\',\'trialing\')');
    expect(pricing).toContain("bib_private_sale_pro_guard");
    expect(pos).toContain('bib_has_active_pro_subscription');
    expect(pos).toContain("supplier.base_price");
    expect(checkout).toContain("supplier.base_price");
    expect(limits).toContain("usage_count<8");
    expect(ai).toContain('reserve_boutique_ai_generation');
    expect(legacy).toContain('status: 410');
    expect(applications).toContain('DROP POLICY IF EXISTS "Anyone can submit a partner application"');
    expect(applications).toContain('DROP POLICY IF EXISTS "Anonymous can upload to storefront tickets"');
    expect(support).toContain('(msg as { role?: string }).role !== "user"');
    expect(widget).toContain('messages: next.filter(msg => msg.role === "user")');
  });

  it("hardens critical public checkout, identity and mail security boundaries", () => {
    const migration = read("supabase/migrations/20261102070000_critical_public_access_hardening.sql");
    const sensitive = read("supabase/migrations/20261102070200_financial_entitlement_partner_guards.sql");
    const quotas = read("supabase/migrations/20261102070100_support_ai_usage_limits.sql");
    const ai = read("supabase/functions/support-ai/index.ts");
    const boutiqueEmail = read("supabase/functions/send-boutique-email/index.ts");
    const marketing = read("supabase/functions/send-marketing-campaign/index.ts");
    const transactional = read("supabase/functions/send-transactional-email/index.ts");
    const storefront = read("supabase/functions/create-storefront-checkout/index.ts");
    const pos = read("supabase/functions/create-pos-checkout/index.ts");
    const trustedUrl = read("supabase/functions/_shared/return-url.ts");
    expect(migration).toContain('DROP POLICY IF EXISTS "Anyone can create orders for published boutiques"');
    expect(migration).toContain("email_confirmed_at IS NOT NULL");
    expect(migration).toContain("storage.foldername(name)");
    expect(sensitive).toContain("server_only_order_financial_fields");
    expect(sensitive).toContain("verified_guest_order_claim_required");
    expect(sensitive).toContain("server_only_profile_entitlements");
    expect(sensitive).toContain("server_only_partner_approval");
    expect(quotas).toContain("ON CONFLICT (user_id,kind,window_start)");
    expect(ai).toContain('reserve_support_ai_request');
    expect(ai).toContain("last_message_must_be_user");
    expect(boutiqueEmail).toContain("server_verified_email_workflow_required");
    expect(boutiqueEmail).toContain("email_rate_limited");
    expect(marketing).toContain("safeEmailHtml(body_html)");
    expect(transactional).toContain("email_rate_limited");
    expect(storefront).toContain("getCurrentBasePrice(product)");
    expect(pos).toContain("getCurrentBasePrice(product)");
    expect(trustedUrl).toContain("BUILTIN_HOSTS");
  });

  it("does not bypass sample validation with stock and uses the atomic SAV response RPC", () => {
    const products = read("src/pages/dashboard/Produits.tsx");
    const sav = read("src/hooks/useOrderIssues.ts");
    const migration = read("drizzle/migrations/0024_sav_48h_atomic_escalation.sql");
    expect(products).not.toContain("hasPhysicalStock");
    expect(products).toContain('sampleStatus !== "validated"');
    expect(sav).toContain('rpc("respond_to_order_issue"');
    expect(sav).not.toContain('from("issue_responses" as any).insert');
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.respond_to_order_issue");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION public.escalate_unanswered_order_issues");
  });

  it("shows compact logo-led merchant boutiques without oversized diagnostics", () => {
    const shops = read("src/pages/dashboard/Boutiques.tsx");
    expect(shops).toContain("boutique.logo_url");
    expect(shops).toContain("grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4");
    expect(shops).toContain("Produits actifs");
    expect(shops).toContain("Commandes à traiter");
    expect(shops).toContain("Paramètres");
    expect(shops).not.toContain("<BoutiqueHealth");
    expect(shops).not.toContain("<HealthRing");
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
