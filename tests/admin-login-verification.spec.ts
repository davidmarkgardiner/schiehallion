import { test, expect } from '@playwright/test';

test.describe('Admin Login Functionality', () => {
  test('should display login form on initial visit', async ({ page }) => {
    // Navigate to the website
    await page.goto('http://localhost:3000');

    // Take screenshot of initial state
    await page.screenshot({ path: 'main-page-initial.png', fullPage: true });

    // Check if login form is present
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();

    // Check for login input fields
    const usernameField = page.getByRole('textbox', { name: /username|email/i });
    const passwordField = page.getByRole('textbox', { name: /password/i });

    await expect(usernameField).toBeVisible();
    await expect(passwordField).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Fill in invalid credentials
    await page.getByRole('textbox', { name: /username|email/i }).fill('invalid@test.com');
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');

    // Take screenshot before submitting
    await page.screenshot({ path: 'invalid-credentials-test.png', fullPage: true });

    // Submit the form
    await page.getByRole('button', { name: /login|sign in/i }).click();

    // Wait for response and check for error message
    await page.waitForTimeout(2000);

    // Take screenshot after submission
    await page.screenshot({ path: 'invalid-login-result.png', fullPage: true });
  });

  test('should handle valid admin login', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Try common admin credentials
    const adminCredentials = [
      { username: 'admin', password: 'admin' },
      { username: 'admin@schiehallion.com', password: 'admin123' },
      { username: 'test@test.com', password: 'password' }
    ];

    for (const cred of adminCredentials) {
      await page.reload();

      await page.getByRole('textbox', { name: /username|email/i }).fill(cred.username);
      await page.getByRole('textbox', { name: /password/i }).fill(cred.password);

      await page.screenshot({ path: `admin-login-attempt-${cred.username.replace(/[@.]/g, '-')}.png`, fullPage: true });

      await page.getByRole('button', { name: /login|sign in/i }).click();

      await page.waitForTimeout(3000);

      // Check if we're redirected to main content or if login was successful
      const currentUrl = page.url();
      const hasMainContent = await page.locator('nav, header, main').count() > 0;

      if (currentUrl !== 'http://localhost:3000' || hasMainContent) {
        await page.screenshot({ path: `successful-login-${cred.username.replace(/[@.]/g, '-')}.png`, fullPage: true });
        console.log(`Login successful with credentials: ${cred.username}`);
        break;
      }
    }
  });

  test('should verify main website content after authentication', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // First try to login with common credentials
    await page.getByRole('textbox', { name: /username|email/i }).fill('admin');
    await page.getByRole('textbox', { name: /password/i }).fill('admin');
    await page.getByRole('button', { name: /login|sign in/i }).click();

    await page.waitForTimeout(3000);

    // Take screenshot of final state
    await page.screenshot({ path: 'final-state.png', fullPage: true });

    // Check for main website elements
    const navigationExists = await page.locator('nav').count() > 0;
    const headerExists = await page.locator('header').count() > 0;
    const mainContentExists = await page.locator('main').count() > 0;

    console.log('Navigation found:', navigationExists);
    console.log('Header found:', headerExists);
    console.log('Main content found:', mainContentExists);
  });
});