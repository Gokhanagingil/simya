import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
    trace: 'off',
    locale: 'tr-TR',
  },
  projects: [
    { name: 'kucuk-360x800', use: { viewport: { width: 360, height: 800 } } },
    { name: 'buyuk-412x915', use: { viewport: { width: 412, height: 915 } } },
  ],
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
