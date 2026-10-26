import { expect, test } from '@playwright/test';
import { AccountPage } from '../pages/account.page';
import { invalidAccount } from '../support/test-data';

test('sign-in rejects an invalid test account and keeps the guest on authentication', async ({ page }) => {
  const account = new AccountPage(page);

  await account.open();
  await account.signIn(invalidAccount.email, invalidAccount.password);

  await expect(page.locator('.alert-danger').filter({ hasText: 'Authentication failed.' })).toBeVisible();
  await expect(page.locator('#email')).toHaveValue(invalidAccount.email);
  await expect(page.locator('#passwd')).toBeVisible();
});
