import { spawn } from "node:child_process";
import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
const base = process.env.BIB_BASE_URL ?? "http://127.0.0.1:5173";
const output =
  process.env.BIB_SMOKE_ARTIFACTS ?? resolve(tmpdir(), "bib-consistency-smoke");
mkdirSync(output, { recursive: true });
// This browser test fulfils every backend request locally. No production session or data is used.
const project = readFileSync(
  new URL("../../supabase/config.toml", import.meta.url),
  "utf8",
).match(/project_id\s*=\s*"([^"]+)"/)[1];
const userId = "10000000-0000-4000-8000-000000000001",
  boutiqueId = "20000000-0000-4000-8000-000000000001",
  supplierId = "30000000-0000-4000-8000-000000000001",
  productId = "40000000-0000-4000-8000-000000000001";
const supplier = {
  id: supplierId,
  intranet_id: supplierId,
  name: "Tasse Atelier",
  category: "Maison",
  description: "Description fournisseur conservée",
  base_price: 20,
  max_margin_percent: 50,
  moq: 10,
  is_active: true,
  market: "EU",
  rotation_indicator: "green",
  supplier_rating: 4.8,
  customization_capabilities: {
    logo: ["Impression"],
    colors: ["#123456"],
    packaging: ["Kraft"],
    text: true,
  },
  customization_terms: {
    moq: 10,
    lead_time_days: 12,
    surcharge_cents: 150,
    currency: "EUR",
    sample_required: true,
  },
  catalog_details: { origin: "France" },
};
const boutique = {
  id: boutiqueId,
  user_id: userId,
  name: "Atelier Démo",
  slug: "atelier-demo",
  status: "draft",
  category: "Maison",
  studio_completed_at: "2026-10-20T12:00:00Z",
  seo_title: "Atelier Démo — Collection",
  seo_description:
    "Découvrez les produits de notre atelier, préparés avec soin pour votre quotidien.",
  created_at: "2026-10-20T12:00:00Z",
};
const product = {
  id: productId,
  boutique_id: boutiqueId,
  supplier_product_id: supplierId,
  public_price: 28,
  margin_percent: 40,
  stock_quantity: 20,
  low_stock_threshold: 5,
  status: "paused",
  supplier_products: supplier,
  boutiques: boutique,
  created_at: "2026-10-20T12:00:00Z",
};
const user = {
  id: userId,
  email: "demo@example.test",
  aud: "authenticated",
  role: "authenticated",
  email_confirmed_at: "2026-10-20T12:00:00Z",
  user_metadata: { account_type: "platform", full_name: "Compte Démo" },
  app_metadata: { provider: "email", providers: ["email"] },
  created_at: "2026-10-20T12:00:00Z",
};
const payload = {
  sub: userId,
  aud: "authenticated",
  role: "authenticated",
  exp: Math.floor(Date.now() / 1000) + 3600,
};
const token =
  Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString(
    "base64url",
  ) +
  "." +
  Buffer.from(JSON.stringify(payload)).toString("base64url") +
  ".fixture";
const session = {
  access_token: token,
  refresh_token: "local-fixture-refresh-token",
  expires_at: payload.exp,
  expires_in: 3600,
  token_type: "bearer",
  user,
};
let preview;
if (process.env.BIB_START_PREVIEW === "1") {
  preview = spawn(
    process.execPath,
    [
      "node_modules/vite/bin/vite.js",
      ...(process.env.BIB_PREVIEW_MODE === "production" ? ["preview"] : []),
      "--host",
      "127.0.0.1",
      "--port",
      new URL(base).port || "5173",
      "--strictPort",
      ...(process.env.BIB_PREVIEW_MODE === "production" ? [] : ["--force"]),
    ],
    { stdio: "ignore" },
  );
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(base);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      /* The development server is starting. */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) {
    preview.kill();
    throw new Error("Preview did not start");
  }
}
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BIB_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.BIB_CHROMIUM_EXECUTABLE }
    : {}),
});
const results = [];
try {
  for (const mobile of [false, true])
    for (const theme of ["light", "dark"])
      for (const lang of ["fr", "en"]) {
        const context = await browser.newContext({
          viewport: mobile
            ? { width: 390, height: 844 }
            : { width: 1440, height: 1000 },
          colorScheme: theme,
        });
        let dossier = {
          id: "50000000-0000-4000-8000-000000000001",
          product_id: productId,
          version: 1,
          supplier_status: "not_requested",
          supplier_comment: null,
          merchant_config: {
            brand: "Marque Démo",
            color: "#123456",
            logo: "",
            logoOption: "",
            packaging: "Kraft",
            marking: "",
            material: "",
            finish: "",
            dimensions: "",
            text: "Notre texte",
            instructions: "",
          },
          updated_at: "2026-10-26T12:00:00Z",
        };
        const errors = [];
        await context.addInitScript(
          ({ project, session, theme, lang }) => {
            localStorage.setItem(
              `sb-${project}-auth-token`,
              JSON.stringify(session),
            );
            if (localStorage.getItem("bib-theme") === null)
              localStorage.setItem("bib-theme", theme);
            if (localStorage.getItem("bib-language") === null)
              localStorage.setItem("bib-language", lang);
          },
          { project, session, theme, lang },
        );
        await context.routeWebSocket(
          (url) => url.hostname !== new URL(base).hostname,
          (socket) => socket.close(),
        );
        await context.route("**/*", async (route) => {
          const request = route.request(),
            url = new URL(request.url());
          if (url.origin === new URL(base).origin) {
            if (url.pathname.startsWith("/__l5e/"))
              return route.fulfill({
                status: 404,
                body: "External asset omitted from local fixture",
              });
            return route.continue();
          }
          if (!url.hostname.endsWith("supabase.co")) return route.abort();
          const headers = {
            "access-control-allow-origin": "*",
            "access-control-allow-headers":
              request.headers()["access-control-request-headers"] ??
              "authorization,apikey,content-type,x-client-info,prefer,accept,accept-profile,content-profile,range,x-supabase-api-version",
            "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
            "content-type": "application/json",
          };
          if (request.method() === "OPTIONS")
            return route.fulfill({ status: 204, headers });
          let data = [];
          if (url.pathname.includes("/auth/v1/"))
            data = url.pathname.endsWith("/user") ? user : session;
          else if (
            url.pathname.includes("/rpc/save_product_customization_draft")
          ) {
            const body = request.postDataJSON();
            dossier = {
              ...dossier,
              merchant_config: body.p_config,
              version: dossier.version + 1,
              supplier_status: "not_requested",
            };
            data = dossier;
          } else if (
            url.pathname.includes("/rpc/submit_product_customization")
          ) {
            dossier = { ...dossier, supplier_status: "submitted" };
            data = dossier;
          } else {
            const table = url.pathname.split("/").at(-1);
            const rows = {
              profiles: [
                {
                  id: userId,
                  user_id: userId,
                  full_name: "Compte Démo",
                  email: user.email,
                  plan: "pro",
                  role: "owner",
                  onboarding_completed: true,
                },
              ],
              user_roles: [{ user_id: userId, role: "admin" }],
              boutiques: [boutique],
              supplier_products: [supplier],
              products: [product],
              product_customization_dossiers: [dossier],
              customer_profiles: [],
              boutique_members: [],
            };
            data = rows[table] ?? [];
            const singular = (request.headers()["accept"] ?? "").includes(
              "object+json",
            );
            if (singular) data = data[0] ?? null;
            headers["content-range"] =
              `0-${Array.isArray(data) ? Math.max(0, data.length - 1) : 0}/${Array.isArray(data) ? data.length : 1}`;
          }
          return route.fulfill({
            status: 200,
            headers,
            body: JSON.stringify(data),
          });
        });
        const page = await context.newPage();
        page.on("pageerror", (error) =>
          errors.push(error.stack ?? error.message),
        );
        const label = `${mobile ? "mobile" : "desktop"}-${theme}-${lang}`;
        await page.goto(base + "/a-propos", {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        await page
          .getByRole("heading", {
            name:
              lang === "fr"
                ? "La confiance avant le catalogue"
                : "Trust before the catalogue",
            exact: true,
          })
          .waitFor();
        assert.equal(await page.locator("html").getAttribute("lang"), lang);
        assert.equal(
          await page
            .locator("html")
            .evaluate((el) => el.classList.contains("dark")),
          theme === "dark",
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          "Public page overflow: " + label,
        );
        await page.screenshot({
          path: resolve(output, `about-${label}.png`),
          fullPage: true,
          animations: "disabled",
        });
        await page.goto(
          base + "/dashboard/personnalisation?supplierProductId=" + supplierId,
          { waitUntil: "domcontentloaded" },
        );
        await page
          .locator("#custom-brand")
          .waitFor()
          .catch(async (error) => {
            await page.screenshot({
              path: resolve(output, "failure.png"),
              fullPage: true,
              animations: "disabled",
            });
            console.error(
              JSON.stringify({
                url: page.url(),
                text: (await page.locator("body").innerText()).slice(0, 3500),
                errors,
              }),
            );
            throw error;
          });
        await expect(page.locator("#custom-brand")).toHaveValue("Marque Démo");
        await page
          .locator("#custom-brand")
          .fill("Marque personnelle conservée");
        await page
          .getByRole("button", {
            name: lang === "fr" ? "Enregistrer le brouillon" : "Save draft",
            exact: true,
          })
          .click();
        await page
          .getByText(lang === "fr" ? "Brouillon enregistré." : "Draft saved.", {
            exact: true,
          })
          .waitFor();
        assert.equal(
          dossier.merchant_config.brand,
          "Marque personnelle conservée",
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          "Customization overflow: " + label,
        );
        await page.screenshot({
          path: resolve(output, `customization-${label}.png`),
          fullPage: true,
          animations: "disabled",
        });
        await page
          .getByRole("button", {
            name: lang === "fr" ? "Passer en anglais" : "Switch to French",
            exact: true,
          })
          .click();
        assert.equal(
          await page.locator("#custom-brand").inputValue(),
          "Marque personnelle conservée",
        );
        const next = lang === "fr" ? "en" : "fr";
        await page.goto(base + "/dashboard/parametres", {
          waitUntil: "domcontentloaded",
        });
        await page
          .getByRole("tab", {
            name: next === "en" ? "Appearance" : "Apparence",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: new RegExp(next === "en" ? "^Dark" : "^Sombre"),
          })
          .click();
        await page.waitForFunction(() =>
          document.documentElement.classList.contains("dark"),
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          "Settings overflow: " + label,
        );
        await page
          .getByRole("button", { name: "Notifications", exact: true })
          .click();
        const popover = page.locator("[data-radix-popper-content-wrapper]");
        await popover.waitFor();
        assert.ok(
          (await popover.boundingBox()).height < 500,
          "Notification popup must not occupy the page height",
        );
        await page.screenshot({
          path: resolve(output, `settings-${label}.png`),
          fullPage: true,
          animations: "disabled",
        });
        assert.deepEqual(errors, [], "Browser runtime errors: " + label);
        results.push({
          viewport: mobile ? "mobile" : "desktop",
          theme,
          language: lang,
          pages: 3,
          draftSaved: true,
          merchantTextPreserved: true,
          notificationPopup: true,
        });
        await context.close();
      }
} finally {
  await browser.close();
  preview?.kill();
  writeFileSync(
    resolve(output, "results.json"),
    JSON.stringify(results, null, 2),
  );
}
console.log(
  JSON.stringify({
    scenarios: results.length,
    pages: results.length * 3,
    artifacts: output,
  }),
);
