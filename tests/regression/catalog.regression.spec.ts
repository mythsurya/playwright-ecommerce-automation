import { expect, test } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test('search returns the matching catalog product', async ({ page }) => {
  const home = new HomePage(page);

  await home.open();
  await home.searchFor('Faded Short Sleeves T-shirt');

  await expect(page).toHaveURL(/\/search/);
  const product = page.locator('.product-container').filter({ hasText: 'Faded Short Sleeves T-shirt' }).first();
  await expect(product).toBeVisible();
  await expect(product.locator('a.product-name')).toBeVisible();
});

test('T-shirts category displays products', async ({ page }) => {
  await page.goto('/5-tshirts');

  await expect(page.getByRole('heading', { name: 'T-shirts', level: 1 })).toBeVisible();
  await expect(page.locator('.product-container').first()).toBeVisible();
});

test('product can be added to an isolated cart', async ({ page }) => {
  await page.goto('/tshirts/1-faded-short-sleeves-tshirt.html');
  await expect(page.getByRole('heading', { name: 'Faded Short Sleeves T-shirt' })).toBeVisible();

  await page.locator('#add_to_cart').click();

  const cartConfirmation = page.locator('#layer_cart');
  await expect(cartConfirmation).toBeVisible();
  await expect(cartConfirmation).toContainText('Product successfully added to your shopping cart');
  await expect(cartConfirmation).toContainText('There is 1 item in your cart.');
});
