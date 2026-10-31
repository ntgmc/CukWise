import { defineConfig } from "@playwright/test";

const base = (process.env.BASE_PATH || "/").replace(/\/$/, "");
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:4321${base}/`, browserName: "chromium", trace: "retain-on-failure" },
  webServer: { command: "npm run preview -- --port 4321", url: `http://127.0.0.1:4321${base}/`, reuseExistingServer: false }
});
