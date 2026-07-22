import { defineConfig, devices } from '@playwright/test';

const testEnv = {
  ...process.env,
  VITE_WHATSAPP_NUMBER: '5548999998888',
  VITE_DEMO_URL: 'https://cal.com/piperkey/demo',
  VITE_SITE_URL: 'http://127.0.0.1:5178',
  VITE_GA4_ID: 'G-TEST123456',
  VITE_META_PIXEL_ID: '1234567890',
};

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:5178',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5178',
    url: 'http://127.0.0.1:5178',
    reuseExistingServer: !process.env.CI,
    env: testEnv,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      name: 'firefox-tablet',
      use: { ...devices['Desktop Firefox'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'webkit-mobile',
      use: { ...devices['iPhone 13'], viewport: { width: 390, height: 844 } },
    },
  ],
});
