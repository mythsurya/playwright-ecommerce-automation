import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'https://automationpractice.techwithjatin.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(process.platform === 'win32' && !process.env.CI
          ? {
              launchOptions: {
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
              },
            }
          : {}),
      },
      testIgnore: '**/api/**',
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/api/**',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/api/**',
    },
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
    },
  ],
});
