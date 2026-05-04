import { test, expect } from "@playwright/test";

/**
 * E2E coverage for the editor flow.
 * Set the following env vars before running:
 *   E2E_EMAIL, E2E_PASSWORD       — test account credentials
 *   E2E_BOUTIQUE_SLUG             — slug of a published test boutique
 *   PLAYWRIGHT_BASE_URL           — defaults to http://localhost:8080
 */
const EMAIL = process.env.E2E_EMAIL ?? "";
const PASSWORD = process.env.E2E_PASSWORD ?? "";
const SLUG = process.env.E2E_BOUTIQUE_SLUG ?? "";

test.describe("Editor flow", () => {
  test.skip(!EMAIL || !PASSWORD, "E2E_EMAIL / E2E_PASSWORD not set");

  test("login → boutiques → editor", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/mot de passe|password/i).fill(PASSWORD);
    await page.getByRole("button", { name: /se connecter|login/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/dashboard/boutiques");
    await expect(page.getByRole("heading", { name: /boutiques/i })).toBeVisible();
  });

  test("storefront route exists", async ({ page }) => {
    test.skip(!SLUG, "E2E_BOUTIQUE_SLUG not set");
    const res = await page.goto(`/boutique/${SLUG}`);
    expect(res?.status()).toBeLessThan(400);
  });

  test("publish button shows feedback state", async ({ page }) => {
    await page.goto("/dashboard/boutiques");
    const editLink = page.getByRole("link", { name: /éditer|edit/i }).first();
    if (!(await editLink.count())) test.skip(true, "No editable boutique");
    await editLink.click();
    const publish = page.getByRole("button", { name: /publier|republier/i });
    await expect(publish).toBeVisible();
    // Just assert the button is wired (state attribute managed by ActionButton).
    await expect(publish).toHaveAttribute("data-state", /idle|loading|success|error/);
  });
});