import { spawn } from "node:child_process";
import { chromium, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const base = process.env.BIB_PRIVACY_BASE_URL ?? "http://127.0.0.1:5185";
const output = process.env.BIB_PRIVACY_ARTIFACTS ?? resolve(tmpdir(), "bib-cookie-smoke");
mkdirSync(output, { recursive: true });
const server = process.env.BIB_PRIVACY_BASE_URL ? null : spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5185", "--strictPort"], {
  cwd: root, stdio: "ignore", env: { ...process.env, VITE_SUPABASE_URL: "https://privacy-test.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "privacy-test-public-key" },
});
const intranetBase = process.env.BIB_INTRABIB_BASE_URL ?? (process.env.BIB_INTRABIB_ROOT ? "http://127.0.0.1:5186" : undefined);
const intranetServer = process.env.BIB_INTRABIB_ROOT && !process.env.BIB_INTRABIB_BASE_URL ? spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5186", "--strictPort"], {
  cwd: resolve(process.env.BIB_INTRABIB_ROOT), stdio: "ignore", env: { ...process.env, VITE_SUPABASE_URL: "https://privacy-test.supabase.co", VITE_SUPABASE_PUBLISHABLE_KEY: "privacy-test-public-key" },
}) : null;
let browser;
try {
  let ready = false;
  for (let i = 0; i < 80; i++) {
    try { ready = (await fetch(`${base}/tests/privacy/harness.html`)).ok; } catch { /* server starting */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error("Privacy test server did not start");
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"], ...(process.env.BIB_CHROMIUM_EXECUTABLE ? { executablePath: process.env.BIB_CHROMIUM_EXECUTABLE } : {}) });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const mediaRequests = [], statisticRequests = [], marketingRequests = [], errors = [];
  let marketingUnavailable = false;
  const marketingNotice = { scope_key: "bib", boutique_id: null, controller_name: "Opérateur fictif de recette", audience_name: "BIB", notice_text: "J’accepte les offres BIB par email. Ce choix est facultatif et indépendant des cookies et des achats. Je peux me désabonner dans chaque email.", notice_hash: "a".repeat(64), notice_version: "test-v1", privacy_url: "https://example.test/confidentialite" };
  const localOrigins = new Set([new URL(base).origin]);
  if (intranetBase) localOrigins.add(new URL(intranetBase).origin);
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (localOrigins.has(url.origin)) return route.continue();
    // No test ever reaches a production backend or a media provider.
    if (url.hostname.endsWith(".supabase.co")) {
      if (url.pathname.endsWith("/functions/v1/marketing-subscription")) {
        const headers = { "access-control-allow-origin": "*", "access-control-allow-headers": "authorization,apikey,x-client-info,content-type", "access-control-allow-methods": "POST,OPTIONS" };
        if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers });
        const body = route.request().postDataJSON();
        marketingRequests.push(body);
        if (marketingUnavailable) return route.fulfill({ status: 503, headers, contentType: "application/json", body: JSON.stringify({ error: "subscription_unavailable" }) });
        const result = body.action === "context" ? marketingNotice : body.action === "request" ? { accepted: true } : { valid: true, state: body.action === "withdraw" ? "withdrawn" : body.action === "inspect_confirmation" ? "pending" : "active", audience_name: "BIB", controller_name: marketingNotice.controller_name, notice_text: marketingNotice.notice_text };
        return route.fulfill({ status: body.action === "request" ? 202 : 200, headers, contentType: "application/json", body: JSON.stringify(result) });
      }
      if (url.pathname.includes("/rest/v1/storefront_events") && route.request().method() === "POST") statisticRequests.push(url.href);
      return route.fulfill({ status: 200, contentType: "application/json", body: "[]", headers: { "access-control-allow-origin": "*" } });
    }
    if (["www.youtube-nocookie.com", "player.vimeo.com", "www.google.com"].includes(url.hostname)) {
      mediaRequests.push(url.href);
      return route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Stubbed external provider</title>" });
    }
    return route.abort();
  });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${base}/tests/privacy/harness.html`);
  await expect(page.getByRole("button", { name: "Personnaliser", exact: true })).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.getByRole("button", { name: "Émettre un événement de test" }).click();
  expect(statisticRequests).toHaveLength(0);
  expect(mediaRequests).toHaveLength(0);
  const accept = page.getByRole("button", { name: "Tout accepter", exact: true });
  const refuse = page.getByRole("button", { name: "Tout refuser", exact: true });
  expect(await accept.getAttribute("class")).toBe(await refuse.getAttribute("class"));

  await page.getByRole("button", { name: "Personnaliser", exact: true }).click();
  const panel = page.getByRole("dialog");
  await expect(panel.getByRole("switch", { name: "Statistiques des boutiques", exact: true })).not.toBeChecked();
  await expect(panel.getByRole("switch", { name: "Contenus externes", exact: true })).not.toBeChecked();
  await panel.getByRole("switch", { name: "Statistiques des boutiques", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Personnaliser", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Émettre un événement de test" }).click();
  expect(statisticRequests).toHaveLength(0); // Editing a draft is not consent.

  await page.getByRole("button", { name: "Personnaliser", exact: true }).click();
  await panel.getByRole("switch", { name: "Statistiques des boutiques", exact: true }).click();
  await panel.getByRole("button", { name: "Enregistrer mes choix", exact: true }).click();
  await page.getByRole("button", { name: "Émettre un événement de test" }).click();
  await expect.poll(() => statisticRequests.length).toBe(1);
  await expect(page.locator("iframe")).toHaveCount(0);

  await page.getByRole("button", { name: "Gérer les cookies", exact: true }).first().click();
  await panel.getByRole("switch", { name: "Statistiques des boutiques", exact: true }).click();
  await panel.getByRole("switch", { name: "Contenus externes", exact: true }).click();
  await panel.getByRole("button", { name: "Enregistrer mes choix", exact: true }).click();
  await expect(page.locator("iframe")).toHaveCount(2);
  await expect.poll(() => mediaRequests.length).toBe(2);
  await page.getByRole("button", { name: "Émettre un événement de test" }).click();
  expect(statisticRequests).toHaveLength(1);

  const otherTab = await context.newPage();
  await otherTab.goto(`${base}/tests/privacy/harness.html`);
  await expect(otherTab.locator("iframe")).toHaveCount(2);
  await otherTab.getByRole("button", { name: "Gérer les cookies", exact: true }).click();
  await otherTab.getByRole("button", { name: "Tout refuser", exact: true }).click();
  await expect(otherTab.locator("iframe")).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveCount(0); // Withdrawal reaches other tabs.
  await page.reload();
  await expect(page.getByRole("button", { name: "Gérer les cookies", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Personnaliser", exact: true })).toHaveCount(0);

  // Check real application mounting on legal, auth and talent routes.
  for (const path of ["/cookies", "/login", "/bib-talent"]) {
    await page.goto(`${base}${path}`);
    await expect(page.locator("#cookie-settings-trigger")).toBeVisible();
  }
  // Full application email flow: accepting cookies never enrolls a visitor.
  await page.goto(`${base}/communications`);
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  await page.locator("#cookie-settings-trigger").click();
  await page.getByRole("button", { name: "Tout accepter", exact: true }).click();
  await expect(page.getByRole("checkbox")).not.toBeChecked();
  expect(marketingRequests.filter(body => body.action === "request")).toHaveLength(0);
  await page.getByLabel("Votre adresse email").fill("recipient@example.test");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Recevoir l’email de confirmation" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Votre demande a été prise en compte" })).toBeVisible();
  expect(marketingRequests.filter(body => body.action === "request")).toHaveLength(1);
  await page.goto(`${base}/communications?action=confirm#token=${"a".repeat(64)}`);
  await expect(page.getByRole("button", { name: "Confirmer mon abonnement" })).toBeVisible();
  expect(new URL(page.url()).hash).toBe("");
  expect(marketingRequests.filter(body => body.action === "confirm")).toHaveLength(0);
  await page.getByRole("button", { name: "Confirmer mon abonnement" }).click();
  await expect(page.getByText("Votre abonnement est confirmé.", { exact: true })).toBeVisible();
  await page.goto(`${base}/communications?action=unsubscribe#token=${"b".repeat(64)}`);
  await page.getByRole("button", { name: "Me désabonner de ces offres" }).click();
  await expect(page.getByText("Vous êtes désabonné de ces offres.", { exact: true })).toBeVisible();
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${base}/communications`);
    await expect(page.getByRole("checkbox")).not.toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: resolve(output, `email-subscription-${width}.png`), animations: "disabled", fullPage: true });
  }
  marketingUnavailable = true;
  await page.goto(`${base}/communications`);
  await expect(page.getByRole("alert").filter({ hasText: "L’inscription n’a pas pu être enregistrée" })).toBeVisible();
  marketingUnavailable = false;
  await page.evaluate(() => localStorage.removeItem("bib:platform:cookie-consent:v1"));
  await page.goto(`${base}/cookies`);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole("button", { name: "Tout refuser", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: resolve(output, `banner-${width}.png`), animations: "disabled" });
    await page.getByRole("button", { name: "Personnaliser", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.screenshot({ path: resolve(output, `preferences-${width}.png`), animations: "disabled" });
    const box = await page.getByRole("dialog").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  if (intranetBase) {
    await page.goto(`${intranetBase}/login`);
    await page.getByRole("button", { name: "Cookies et confidentialité", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Cookies et stockage dans Intrabib" })).toBeVisible();
    await expect(page.getByRole("switch")).toHaveCount(0);
    await page.screenshot({ path: resolve(output, "intrabib-information.png"), animations: "disabled" });
  }
  expect(errors).toEqual([]);
  console.log("PASS: cookie blocking and withdrawal; explicit scoped email request; manual confirmation and unsubscribe; unavailable backend; real routes and 320/390px layouts; no runtime errors.");
} finally {
  if (browser) await browser.close();
  server?.kill("SIGTERM");
  intranetServer?.kill("SIGTERM");
}
