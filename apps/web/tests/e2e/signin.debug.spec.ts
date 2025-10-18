import { test, expect } from '@playwright/test';

const SIGNIN_PATH = '/signin';

test('debug: signin flow with console log capture', async ({ page }) => {
  page.on('console', (msg) => {
    // Print console messages so they appear in the test runner output
    console.log(`[page console:${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.log(`[page error] ${err.message}`);
  });

  await page.goto(SIGNIN_PATH);
  await page.waitForLoadState('domcontentloaded');

  const heading = page.getByTestId('heading-signin');
  await expect(heading).toBeVisible();

  const emailInput = page.getByTestId('input-email').first();
  await expect(emailInput).toBeVisible();
  await emailInput.fill('test@example.com');

  const sendBtn = page.getByTestId('btn-send-link').first();
  await expect(sendBtn).toBeVisible();
  await sendBtn.click();

  // wait longer here to observe what happens
  await page.waitForTimeout(5000);

  // snapshot HTML for debugging
  const html = await page.content();
  console.log('---PAGE HTML START---');
  console.log(html.slice(0, 20_000));
  console.log('---PAGE HTML END---');
});
