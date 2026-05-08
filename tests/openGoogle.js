import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';

test('navigate to Google', async ({ page }) => {
  await page.goto('https://www.google.com');
  await expect(page).toHaveTitle(/Google/);
});

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

test('navigate to Google and check page contains Google', async ({ page }) => {
  await page.goto('https://www.google.com');
  await expect(page).toHaveTitle(/Google/);
  await expect(page.locator('body')).toContainText('Google');
});

test('navigate to codeslaps.com and verify login button', async ({ page }) => {
  await page.goto('http://www.codeslaps.com/');
  // Adjust the selector below if the button text or role is different
  await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
});

test('navigate to codeslaps.com, click authenticate, and select new user', async ({ page }) => {
  await page.goto('http://www.codeslaps.com/');
  // Click the authenticate button (adjust selector if needed)
  await page.getByRole('button', { name: /authenticate/i }).click();
  // Select the 'New User' option (adjust selector if needed)
  await page.getByRole('option', { name: /new user/i }).click();
  // Optionally, add an assertion to verify the new user flow
});

test('create new user from Excel data', async ({ page }) => {
  // Read Excel file
  const workbook = XLSX.readFile('userData.xlsx');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet)[0];

  await page.goto('http://www.codeslaps.com/');
  await page.getByRole('button', { name: /authenticate/i }).click();
  await page.getByRole('option', { name: /new user/i }).click();

  // Fill the form fields
  await page.getByLabel('Name').fill(data.Name);
  await page.getByLabel('Email ID').fill(data.Email);
  await page.getByLabel('Password').fill(data.Password);
  await page.getByLabel('Confirm Password').fill(data.ConfirmPassword);
  await page.getByLabel('Designation').fill(data.Designation);
  await page.getByLabel('Country').fill(data.Country);

  // Click Create account
  await page.getByRole('button', { name: /create account/i }).click();

  // Assert that account was created (adjust selector/text as needed)
  await expect(page.locator('body')).toContainText(/account created|welcome|registration successful/i);

  // Log out if needed (adjust selector as needed)
  // await page.getByRole('button', { name: /logout/i }).click();

  // Authenticate with the new account
  await page.goto('http://www.codeslaps.com/');
  await page.getByRole('button', { name: /authenticate/i }).click();
  // Fill login form
  await page.getByLabel('Email ID').fill(data.Email);
  await page.getByLabel('Password').fill(data.Password);
  await page.getByRole('button', { name: /login/i }).click();

  // Assert successful login (adjust selector/text as needed)
  await expect(page.locator('body')).toContainText(/welcome|dashboard|logout/i);

  // Log out (adjust selector as needed)
  await page.getByRole('button', { name: /logout/i }).click();
  // Optionally, assert that logout was successful
  await expect(page.locator('body')).toContainText(/login/i);
});