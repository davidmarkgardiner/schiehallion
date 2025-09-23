import { test, expect } from '@playwright/test';

test.describe('Comprehensive Authentication Testing', () => {
  test('should test email-based login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Test with proper email format
    const validCredentials = [
      { email: 'admin@schiehallion.com', password: 'admin' },
      { email: 'admin@example.com', password: 'password' },
      { email: 'test@test.com', password: 'test' },
      { email: 'guest@hotel.com', password: 'guest' }
    ];

    for (let i = 0; i < validCredentials.length; i++) {
      const cred = validCredentials[i];

      if (i > 0) {
        await page.reload();
        await page.waitForTimeout(1000);
      }

      // Fill in credentials
      await page.getByRole('textbox', { name: /email/i }).fill(cred.email);
      await page.getByRole('textbox', { name: /password/i }).fill(cred.password);

      await page.screenshot({ path: `login-attempt-${i + 1}.png`, fullPage: true });

      // Submit form
      await page.getByRole('button', { name: /login/i }).click();

      // Wait for response
      await page.waitForTimeout(3000);

      // Check if we're redirected away from login page
      const currentUrl = page.url();
      const stillOnLoginPage = await page.locator('form').isVisible().catch(() => false);

      if (!stillOnLoginPage || currentUrl !== 'http://localhost:3000') {
        await page.screenshot({ path: `successful-login-${i + 1}.png`, fullPage: true });
        console.log(`Login successful with: ${cred.email}`);

        // Take screenshot of authenticated state
        await page.screenshot({ path: `authenticated-state-${i + 1}.png`, fullPage: true });
        return; // Exit once we find working credentials
      } else {
        await page.screenshot({ path: `failed-login-${i + 1}.png`, fullPage: true });
      }
    }
  });

  test('should test Staff Portal functionality', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Take screenshot before clicking Staff Portal
    await page.screenshot({ path: 'before-staff-portal.png', fullPage: true });

    // Click on Staff Portal link
    await page.getByText('Staff Portal').click();

    await page.waitForTimeout(2000);

    // Take screenshot after clicking Staff Portal
    await page.screenshot({ path: 'after-staff-portal-click.png', fullPage: true });

    // Check if we're redirected to a different page or modal
    const currentUrl = page.url();
    console.log('Current URL after Staff Portal click:', currentUrl);
  });

  test('should test form validation and error handling', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Test empty form submission
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'empty-form-validation.png', fullPage: true });

    // Test invalid email format
    await page.getByRole('textbox', { name: /email/i }).fill('invalid-email');
    await page.getByRole('textbox', { name: /password/i }).fill('password');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'invalid-email-validation.png', fullPage: true });

    // Clear and test with proper email but wrong credentials
    await page.getByRole('textbox', { name: /email/i }).fill('wrong@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'wrong-credentials-test.png', fullPage: true });
  });

  test('should test Google login option', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check if Google login button is present and clickable
    const googleButton = page.getByText('Continue with Google');
    await expect(googleButton).toBeVisible();

    await page.screenshot({ path: 'google-login-option.png', fullPage: true });

    // Note: We won't actually click this as it would redirect to Google
    console.log('Google login button is present and visible');
  });

  test('should test registration link', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check for registration link
    const signUpLink = page.getByText('Need an account? Sign up');
    if (await signUpLink.isVisible()) {
      await page.screenshot({ path: 'before-signup-click.png', fullPage: true });

      await signUpLink.click();
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'after-signup-click.png', fullPage: true });

      const currentUrl = page.url();
      console.log('URL after signup click:', currentUrl);
    }
  });
});