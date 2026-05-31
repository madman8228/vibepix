import { defineConfig, devices } from "playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4100",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: {
    command:
      "npm run db:push && npm run db:seed && npx next dev --hostname 127.0.0.1 --port 4100",
    port: 4100,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
