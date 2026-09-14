import { test, expect } from '@playwright/test';

test.describe('Farmer demo journey', () => {
  test('login page shows field journal messaging', async ({ page }) => {
    await page.goto('/farmer/login');
    await expect(
      page.getByRole('heading', {
        name: /Turn your next harvest into a confirmed opportunity/i,
      }),
    ).toBeVisible();
    await expect(page.getByLabel(/phone number or email/i)).toBeVisible();
  });

  test('list produce entry shows three input methods', async ({ page }) => {
    await page.goto('/farmer/login');
    await page.getByLabel(/phone number or email/i).fill('kwame.mensah@example.com');
    await page.locator('input[name="password"]').fill('password');
    await page.getByRole('button', { name: /Sign in/i }).click();

    await page.waitForURL('**/farmer**');

    // Handle onboarding if it appears
    await page.waitForTimeout(1000);
    if (page.url().includes('onboarding')) {
        await page.locator('input[id="phone"]').fill('0244123456');
        await page.getByRole('button', { name: /Continue/i }).click();

        await page.waitForTimeout(1000);
        if (page.url().includes('onboarding')) {
           await page.getByLabel(/Farm name/i).fill('My Farm');
           await page.locator('input[id="primaryCrops"]').fill('Tomatoes');
           await page.getByRole('button', { name: /Continue/i }).click();
           await page.waitForTimeout(1000);

           if (page.url().includes('onboarding')) {
             await page.getByRole('combobox').click();
             await page.getByRole('option', { name: 'Ashanti' }).click();
             await page.getByLabel(/District/i).fill('Ejisu');
             await page.getByLabel(/Town or village/i).fill('Village');
             await page.getByRole('button', { name: /Continue/i }).click();
             await page.waitForTimeout(1000);

             if (page.url().includes('onboarding')) {
                 await page.getByRole('button', { name: /Go to dashboard/i }).click();
             }
           }
        }
        await page.waitForURL('**/farmer**');
    }

    await page.goto('/farmer/list-produce');
    await expect(page.getByRole('link', { name: /Speak/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Type/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Fill form/i })).toBeVisible();
  });
});
