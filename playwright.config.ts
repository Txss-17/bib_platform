import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config — run with: `npx playwright test`
 * Requires `npm i -D @playwright/test` and `npx playwright install chromium` locally.
 * BASE_URL defaults to the local Vite dev server.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});