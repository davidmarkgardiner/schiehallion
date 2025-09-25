import { test, expect } from '@playwright/test';

test.describe('Room Images Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL
    await page.goto('http://localhost:3001');
  });

  test('should verify room images are loading properly', async ({ page }) => {
    // Take initial screenshot
    await page.screenshot({ path: 'test-results/initial-page.png', fullPage: true });

    // Step 1: Login with test account
    console.log('Step 1: Logging in with test account');

    // Look for login form or button
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), a[href*="login"]').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(1000);
    }

    // Try to find email input field
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('test1758836028077@example.com');

      // Find password input
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('testpassword123'); // Using common test password

        // Find and click submit button
        const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
        await submitButton.click();
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: 'test-results/after-login-attempt.png', fullPage: true });

    // Step 2: Navigate to /rooms page
    console.log('Step 2: Navigating to rooms page');
    await page.goto('http://localhost:3001/rooms');
    await page.waitForTimeout(3000); // Wait for page to load

    await page.screenshot({ path: 'test-results/rooms-page-initial.png', fullPage: true });

    // Step 3: Check for room images and skeleton loaders
    console.log('Step 3: Checking for room images');

    // Look for skeleton loaders (should be fewer now)
    const skeletonLoaders = page.locator('[data-testid*="skeleton"], .skeleton, [class*="skeleton"]');
    const skeletonCount = await skeletonLoaders.count();
    console.log(`Found ${skeletonCount} skeleton loaders`);

    // Look for actual images
    const images = page.locator('img');
    const imageCount = await images.count();
    console.log(`Found ${imageCount} images on the page`);

    // Wait for images to load
    await page.waitForTimeout(5000);

    // Check for loaded images
    const loadedImages = await page.locator('img').evaluateAll((imgs) => {
      return imgs.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        alt: img.alt
      }));
    });

    console.log('Image loading status:', loadedImages);

    await page.screenshot({ path: 'test-results/rooms-page-after-load.png', fullPage: true });

    // Step 4: Monitor browser console for errors
    console.log('Step 4: Checking console for errors');

    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else {
        consoleLogs.push(`${msg.type()}: ${msg.text()}`);
      }
    });

    // Step 5: Monitor network requests
    console.log('Step 5: Monitoring network requests');

    const networkRequests: any[] = [];
    const failedRequests: any[] = [];

    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    page.on('response', response => {
      if (!response.ok()) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });

    // Reload the page to capture all network activity
    await page.reload();
    await page.waitForTimeout(5000);

    // Step 6: Final verification
    console.log('Step 6: Final verification');

    // Take final screenshot
    await page.screenshot({ path: 'test-results/rooms-page-final.png', fullPage: true });

    // Check for room cards or containers
    const roomElements = page.locator('[data-testid*="room"], .room-card, [class*="room"]');
    const roomCount = await roomElements.count();
    console.log(`Found ${roomCount} room elements`);

    // Generate test report
    const report = {
      timestamp: new Date().toISOString(),
      totalImages: imageCount,
      skeletonLoaders: skeletonCount,
      loadedImages: loadedImages.filter(img => img.complete && img.naturalWidth > 0).length,
      consoleErrors: consoleErrors,
      failedNetworkRequests: failedRequests.filter(req => req.url.includes('image') || req.status === 400),
      totalNetworkRequests: networkRequests.length,
      roomElements: roomCount
    };

    console.log('Test Report:', JSON.stringify(report, null, 2));

    // Assertions
    expect(imageCount).toBeGreaterThan(0);
    expect(loadedImages.filter(img => img.complete && img.naturalWidth > 0).length).toBeGreaterThan(0);
    expect(failedRequests.filter(req => req.status === 400).length).toBeLessThan(5); // Should have fewer 400 errors
  });
});