import { test, expect } from '@playwright/test';

test('admin approves a pending enrollment', async ({ page }) => {
  // Go to admin dashboard with network idle to avoid rate-limit overlaps
  await page.goto('/admin-dashboard', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /command center/i })).toBeVisible();

  // Navigate to enrollments view
  await page.getByRole('link', { name: /enrollments/i }).click();
  await expect(page.getByRole('heading', { name: 'Enrollment Records' })).toBeVisible();

  // Give the table a moment to receive data without flooding requests
  await page.waitForTimeout(500);

  // Find a pending row in the table
  const pendingRow = page.locator('tr.mat-mdc-row, tr, mat-row').filter({ hasText: /pending/i }).first();
  
  if (await pendingRow.count() === 0) {
    test.skip(true, 'No pending enrollments available in the database to approve.');
    return;
  }

  await expect(pendingRow).toBeVisible();

  // Set up response promise for the specific approval endpoint
  const approveResponsePromise = page.waitForResponse(
    (response) =>
      Boolean(response.url().match(/\/api\/v2\/enrollments\/\d+\/approve/) &&
      response.request().method() === 'POST')
  );

  await pendingRow.getByRole('button', { name: /approve/i }).click();
  
  const approveResponse = await approveResponsePromise;
  expect(approveResponse.status()).toBe(200);

  // Verify UI update feedback
  await expect(page.locator('body')).toContainText(/approved|active|confirmed/i);
});