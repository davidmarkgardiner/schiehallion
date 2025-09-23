import { test, expect } from '@playwright/test';

test.describe('Responsive Design Testing', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`should display login form correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000');

      // Take screenshot of main login page
      await page.screenshot({ path: `${viewport.name}-main-login.png`, fullPage: true });

      // Verify form elements are visible and accessible
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /login/i })).toBeVisible();

      // Check Staff Portal link
      await expect(page.getByText('Staff Portal')).toBeVisible();
    });

    test(`should display staff portal correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/admin/login');

      // Take screenshot of staff portal
      await page.screenshot({ path: `${viewport.name}-staff-portal.png`, fullPage: true });

      // Verify staff portal elements
      await expect(page.getByText('Staff Portal')).toBeVisible();
      await expect(page.getByText('Secure access for hotel staff and management')).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });
  }
});