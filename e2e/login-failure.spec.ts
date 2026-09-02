import { test, expect } from '@playwright/test';

test('shows an error for invalid credentials', async ({ page }) => {
  await page.goto('/login');
  
  await page.getByLabel(/email|username/i).fill('invalid-e2e-user@example.test');
  await page.getByLabel('Password').fill('NotTheCorrectPassword1!');
  
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/auth/login') &&
      response.request().method() === 'POST',
  );
  
  await page.getByRole('button', { name: /sign in|login/i }).click();
  const loginResponse = await loginResponsePromise;

  // Verify the backend blocks unauthorized access
  expect([401, 429]).toContain(loginResponse.status());
  
  // Confirm the user remains on the login view
  await expect(page).toHaveURL(/\/login$/);
});