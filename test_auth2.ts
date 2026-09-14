import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/farmer/login');
  await page.getByLabel(/phone number or email/i).fill('kwame.mensah@example.com');
  await page.locator('input[name="password"]').fill('password');
  await page.getByRole('button', { name: /Sign in/i }).click();

  await page.waitForTimeout(2000);

  await page.locator('input[id="phone"]').fill('0244123456');
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.waitForTimeout(1000);

  await page.getByLabel(/Farm name/i).fill('My Farm');
  await page.locator('input[id="primaryCrops"]').fill('Tomatoes');
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.waitForTimeout(1000);

  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Ashanti' }).click();
  await page.getByLabel(/District/i).fill('Ejisu');
  await page.getByLabel(/Town or village/i).fill('Village');
  await page.getByRole('button', { name: /Continue/i }).click();
  await page.waitForTimeout(1000);

  page.on('request', request => {
    if (request.url().includes('farmers/onboarding')) {
      console.log('API Request:', request.postData());
    }
  });

  page.on('response', async response => {
    if (response.url().includes('farmers/onboarding')) {
      console.log('API Response:', response.status(), await response.text());
    }
  });

  await page.getByRole('button', { name: /Go to dashboard/i }).click();
  await page.waitForTimeout(2000);

  console.log('Final URL:', page.url());
  const errorAlert3 = await page.locator('[role="alert"]').allTextContents();
  console.log('Alert step 4 texts:', errorAlert3);

  await browser.close();
})();
