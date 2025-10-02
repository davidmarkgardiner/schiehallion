import { defineConfig, devices } from "@playwright/test";

const DEFAULT_PORT = Number(process.env.PORT || 3002);
const HOST = process.env.PLAYWRIGHT_TEST_HOST || "127.0.0.1";
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || `http://${HOST}:${DEFAULT_PORT}`;
const IS_REMOTE = Boolean(process.env.PLAYWRIGHT_TEST_BASE_URL);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // Run tests sequentially for stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined, // Single worker in CI for stability
  timeout: 90000, // Allow additional time for the full booking journey
  reporter: process.env.CI
    ? [["html"], ["junit", { outputFile: "test-results/junit.xml" }]]
    : "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Only start local server if not testing against a remote URL
  webServer: IS_REMOTE
    ? undefined
    : {
        command: `npm run dev -- --hostname ${HOST} --port ${DEFAULT_PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000, // Allow extra time for initial data warm-up
        env: {
          ...process.env,
          PORT: String(DEFAULT_PORT),
          HOST,
          NEXT_PUBLIC_E2E_TEST_MODE: "true",
          PLAYWRIGHT_TEST_HOST: HOST,
        },
      },
});
