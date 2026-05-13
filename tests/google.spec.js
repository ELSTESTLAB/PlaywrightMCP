import { test, expect } from '@playwright/test';

test('navigate to google.com', async ({ page }) => {
  await page.goto('https://www.google.com');
  await expect(page).toHaveTitle(/Google/);
});

test('search on google', async ({ page }) => {
  await page.goto('https://www.google.com');
  await page.getByRole('combobox', { name: /search/i }).fill('Playwright');
  await page.getByRole('button', { name: /google search/i }).click();
  await expect(page).toHaveURL(/search\?q=Playwright/);
});
