import { test, expect } from '@playwright/test';

const SIGNIN_PATH = '/signin';

test.describe('Sign In Page', () => {
  test('should render sign in page and display providers', async ({ page }) => {
    // Navigate using baseURL from config
    await page.goto(SIGNIN_PATH);
    // Ensure network settled so title/meta stabilize across browsers
    await page.waitForLoadState('domcontentloaded');

    // Prefer stable data-testid for title/heading
    const heading = page.getByTestId('heading-signin');
    await expect(heading).toBeVisible();

    // Prefer explicit Google provider button if rendered
    const googleBtn = page.getByTestId('btn-google');
    if (await googleBtn.count()) {
      await expect(googleBtn.first()).toBeVisible();
    } else {
      // fallback to role-based provider detection
      const providerButtons = page.getByRole('button', { name: /(continue|sign\s*in)\s*with|google|github|email/i });
      await expect(providerButtons.first()).toBeVisible();
    }

    // Email/magic link flow
    const emailInput = page.getByTestId('input-email').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');

      // Use stable test id for send button
      const sendBtn = page.getByTestId('btn-send-link').first();
      await expect(sendBtn).toBeVisible();
      await sendBtn.click();

      // Wait for explicit confirmation card or fallback to heading/body
      const confirmationCard = page.getByTestId('confirmation-card');
      const confirmationHeading = page.getByTestId('confirmation-heading');
      const confirmationBody = page.getByTestId('confirmation-body');

      if (await confirmationCard.count()) {
        await expect(confirmationCard.first()).toBeVisible({ timeout: 15_000 });
      } else if (await confirmationHeading.count()) {
        await expect(confirmationHeading.first()).toBeVisible({ timeout: 15_000 });
      } else if (await confirmationBody.count()) {
        await expect(confirmationBody.first()).toBeVisible({ timeout: 15_000 });
      } else {
        // last-resort: role=alert or confirmation text
        const alertRole = page.getByRole('alert').first();
        try {
          await alertRole.waitFor({ state: 'visible', timeout: 8_000 });
        } catch {
          // fallback to text-based confirmation search
          const confirmation = page
            .locator('h1,h2,h3,p,div')
            .filter({ hasText: /check your (email|inbox)|we sent (you )?a (magic|sign[-\s]?in) link|email (sent|on its way)/i })
            .first();
          await expect(confirmation).toBeVisible({ timeout: 10_000 });
        }
      }
    }
  });
});
