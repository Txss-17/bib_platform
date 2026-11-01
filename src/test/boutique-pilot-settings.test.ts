import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { isMerchantTestPath } from "@/lib/publicPrelaunch";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("BIB pilot settings boundaries", () => {
  it("keeps merchant screens authenticated without opening public signup or checkout", () => {
    expect(isMerchantTestPath("/login")).toBe(true);
    expect(isMerchantTestPath("/dashboard")).toBe(true);
    expect(isMerchantTestPath("/dashboard/boutiques/example/settings")).toBe(true);
    for (const route of ["/signup", "/checkout", "/store", "/boutique/example", "/admin"]) {
      expect(isMerchantTestPath(route)).toBe(false);
    }
    const router = read("src/App.tsx");
    expect(router).toContain('isMerchantTestPath(window.location.pathname)');
    expect(router).toContain('path="/dashboard/boutiques/:id/settings"');
    expect(router).toContain("<ProtectedRoute>");
  });

  it("locates store settings on each store, independently of Brand Studio", () => {
    const config = read("src/pages/dashboard/BoutiqueConfiguration.tsx");
    const stores = read("src/pages/dashboard/Boutiques.tsx");
    const studio = read("src/pages/dashboard/BoutiqueEdit.tsx");
    expect(config).toContain("<BoutiqueSettingsTab boutiqueId={boutique.id} />");
    expect(config).toContain("<EmailMarketingSettings boutiqueId={boutique.id} />");
    expect(config).toContain("<BoutiqueAlertsSettings boutiqueId={boutique.id} />");
    expect(stores).toContain("/dashboard/boutiques/${boutique.id}/settings");
    expect(studio).toContain("/dashboard/boutiques/${boutique.id}/settings");
  });

  it("selects only EU when a new boutique is created", () => {
    const wizard = read("src/components/onboarding/OnboardingWizard.tsx");
    const hook = read("src/hooks/useOnboardingState.ts");
    const create = read("src/pages/dashboard/BoutiqueCreate.tsx");
    expect(wizard).not.toContain("const MARKETS =");
    expect(hook).not.toContain("hasMarket");
    expect(create).toContain('market: "EU"');
    expect(create).toContain('target_markets: [formData.market]');
    expect(create).toContain('<SelectItem value="EU">');
    for (const market of ["UAE", "INTL", "WW"]) {
      expect(create).not.toContain('<SelectItem value="' + market + '">');
    }
  });

  it("distinguishes account, profile and boutique settings", () => {
    const account = read("src/pages/dashboard/Parametres.tsx");
    const profile = read("src/pages/dashboard/MonProfil.tsx");
    expect(account).not.toContain("<EmailMarketingSettings");
    expect(account).not.toContain("<BoutiqueAlertsSettings");
    expect(profile).not.toContain("handleSignOutAll");
    expect(profile).toContain('to="/dashboard/parametres"');
  });

  it("keeps the wordmark legible at night and removes premature multi-market copy", () => {
    const logo = read("src/components/Logo.tsx");
    const footer = read("src/components/Footer.tsx");
    const features = read("src/components/FeaturesSection.tsx");
    expect(logo).toContain("dark:text-bib-gold-light");
    expect(footer).not.toContain('t("footer.multimarket")');
    expect(footer).not.toContain("EU · UAE · Africa");
    expect(features).not.toContain("features.multimarket");
  });
});
