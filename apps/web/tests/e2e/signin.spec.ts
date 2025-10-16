import { test, expect } from '@playwright/test';

test.describe('Sign In Page', () => {
  test('should render sign in page and display providers', async ({ page }) => {
    await page.goto('/signin');
    await expect(page).toHaveTitle(/Sign in/);

    // Check if sign-in experience renders
    const signInTitle = page.getByRole('heading', { name: /sign in/i });
    await expect(signInTitle).toBeVisible();

    // Check for sign-in providers (e.g., Google, etc.)
    const providers = page.getByRole('button', { name: /continue with/i });
    await expect(providers).toBeVisible();

    // Mock sending a link if there's a magic link option
    // If there's an email input for magic link, test it
    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      // button text in the app is "Send sign-in link"; use a flexible regex to match variants
      await page.getByRole('button', { name: /send.*link/i }).click();
      await expect(page.getByText(/check your email/i)).toBeVisible();
    }
  });
});
