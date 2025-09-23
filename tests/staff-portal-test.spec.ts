import { test, expect } from '@playwright/test';

test.describe('Staff Portal Authentication', () => {
  test('should test staff portal login with demo credentials', async ({ page }) => {
    // Navigate to staff portal
    await page.goto('http://localhost:3000/admin/login');

    // Take screenshot of staff portal login page
    await page.screenshot({ path: 'staff-portal-initial.png', fullPage: true });

    // Test with demo credentials provided on page
    const staffCredentials = [
      { email: 'staff@hotel.com', password: 'password' },
      { email: 'manager@hotel.com', password: 'password' },
      { email: 'admin@hotel.com', password: 'password' }
    ];

    for (let i = 0; i < staffCredentials.length; i++) {
      const cred = staffCredentials[i];

      if (i > 0) {
        await page.reload();
        await page.waitForTimeout(1000);
      }

      // Fill in staff credentials
      await page.getByRole('textbox', { name: /email/i }).fill(cred.email);
      await page.getByRole('textbox', { name: /password/i }).fill(cred.password);

      await page.screenshot({ path: `staff-login-attempt-${i + 1}.png`, fullPage: true });

      // Click Sign In
      await page.getByRole('button', { name: /sign in/i }).click();

      // Wait for 2FA prompt or redirect
      await page.waitForTimeout(3000);

      // Check if 2FA is required or if we're redirected
      const currentUrl = page.url();
      const has2FAPrompt = await page.locator('input[placeholder*="2FA"], input[placeholder*="code"]').isVisible().catch(() => false);

      if (has2FAPrompt) {
        await page.screenshot({ path: `2fa-prompt-${i + 1}.png`, fullPage: true });

        // Try the demo 2FA code: 123456
        await page.locator('input[placeholder*="2FA"], input[placeholder*="code"]').fill('123456');
        await page.screenshot({ path: `2fa-filled-${i + 1}.png`, fullPage: true });

        // Submit 2FA
        await page.getByRole('button', { name: /verify|submit/i }).click();
        await page.waitForTimeout(3000);

        await page.screenshot({ path: `after-2fa-${i + 1}.png`, fullPage: true });
      }

      // Check final state
      const finalUrl = page.url();
      await page.screenshot({ path: `staff-final-state-${i + 1}.png`, fullPage: true });

      console.log(`Staff login attempt ${i + 1}: ${cred.email}`);
      console.log(`Initial URL: ${currentUrl}`);
      console.log(`Final URL: ${finalUrl}`);
      console.log(`2FA required: ${has2FAPrompt}`);

      // If we successfully logged in (URL changed or we're on a different page)
      if (finalUrl !== 'http://localhost:3000/admin/login' && !finalUrl.includes('/login')) {
        console.log(`Successful staff login with: ${cred.email}`);

        // Test navigation and check for admin dashboard
        await page.screenshot({ path: `authenticated-staff-dashboard-${i + 1}.png`, fullPage: true });

        // Look for admin/staff dashboard elements
        const dashboardElements = await page.locator('nav, .dashboard, .admin, [data-testid*="dashboard"]').count();
        console.log(`Dashboard elements found: ${dashboardElements}`);

        break;
      }
    }
  });

  test('should test back to main site functionality', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/login');

    // Click "Back to main site" link
    const backLink = page.getByText('Back to main site');
    await expect(backLink).toBeVisible();

    await page.screenshot({ path: 'before-back-to-main.png', fullPage: true });

    await backLink.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'after-back-to-main.png', fullPage: true });

    // Should be back to main login page
    const currentUrl = page.url();
    console.log('URL after back to main:', currentUrl);

    // Should see the main login form again
    const mainLoginForm = await page.locator('form').isVisible();
    console.log('Main login form visible:', mainLoginForm);
  });

  test('should test guest login from main page', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Try guest credentials that might work
    const guestCredentials = [
      { email: 'guest@hotel.com', password: 'guest' },
      { email: 'user@example.com', password: 'password' },
      { email: 'demo@demo.com', password: 'demo' }
    ];

    for (let i = 0; i < guestCredentials.length; i++) {
      const cred = guestCredentials[i];

      if (i > 0) {
        await page.reload();
        await page.waitForTimeout(1000);
      }

      await page.getByRole('textbox', { name: /email/i }).fill(cred.email);
      await page.getByRole('textbox', { name: /password/i }).fill(cred.password);

      await page.screenshot({ path: `guest-login-attempt-${i + 1}.png`, fullPage: true });

      await page.getByRole('button', { name: /login/i }).click();
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      const stillOnLogin = await page.locator('form').isVisible().catch(() => false);

      if (!stillOnLogin || currentUrl !== 'http://localhost:3000') {
        await page.screenshot({ path: `successful-guest-login-${i + 1}.png`, fullPage: true });
        console.log(`Guest login successful with: ${cred.email}`);
        console.log(`Redirected to: ${currentUrl}`);

        // Check for main hotel website content
        const hasHotelContent = await page.locator('nav, header, .hotel, .booking').count();
        console.log(`Hotel content elements found: ${hasHotelContent}`);

        break;
      }
    }
  });
});