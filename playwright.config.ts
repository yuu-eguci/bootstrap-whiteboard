import { defineConfig, devices } from '@playwright/test';

const port = 4173;
// BASE_URL を指定したときは、起動中のサーバ (Docker の web コンテナなど) に対してテストします。
const baseURL = process.env.BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.BASE_URL ? undefined : {
    command: 'node scripts/serve.ts',
    url: `${baseURL}/`,
    env: { PORT: String(port) },
    reuseExistingServer: !process.env.CI,
  },
});
