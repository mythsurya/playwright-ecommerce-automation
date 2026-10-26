import { expect, test } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test('storefront home page and primary navigation are available', async ({ page }) => {
  const home = new HomePage(page);

  await home.open();

  await expect(page.getByRole('link', { name: 'Women' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart (empty)' })).toBeVisible();
});

test('account entry point opens the sign-in page for a guest', async ({ page }) => {
  const home = new HomePage(page);

  await home.open();
  await home.openAccount();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Already registered?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Sign in/ })).toBeVisible();
});

test('shopping cart page opens without placing an order', async ({ page }) => {
  const response = await page.goto('/order');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Order - Automation Practice/);
  await expect(page.getByText(/shopping cart is empty/i)).toBeVisible();
});
