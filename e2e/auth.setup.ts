import { test as setup, expect } from '@playwright/test';

const storageStatePath = 'playwright/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  const email = process.env['TMS_ADMIN_EMAIL'] ?? process.env['TMS_ADMIN_USER'];
  const password = process.env['TMS_ADMIN_PASS'];

  if (!email || !password) {
    throw new Error(
      'Set TMS_ADMIN_EMAIL (or TMS_ADMIN_USER) and TMS_ADMIN_PASS before running authenticated E2E tests.',
    );
  }

  await page.goto('/login');
  await page.getByLabel(/email|username/i).fill(email);
  await page.getByLabel('Password').fill(password);
  const loginResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/auth/login') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Sign In' }).click();
  expect(
    (await loginResponse).status(),
    'Admin login must return HTTP 200. Check the API is running and the E2E credentials are valid.',
  ).toBe(200);

  // Admin users arrive at the Admin Command Center after signing in.
  await expect(page.getByRole('heading', { name: /command center/i })).toBeVisible();
  await page.context().storageState({ path: storageStatePath });
});
