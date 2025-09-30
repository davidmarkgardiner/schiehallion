import { test, expect } from '@playwright/test';

test.describe('Booking Flow - Detailed Analysis', () => {
  const testEmail = 'playright@example.com';
  const testPassword = 'playright';

  test.beforeEach(async ({ page }) => {
    // Capture console messages
    page.on('console', msg => {
      const type = msg.type();
      console.log(`[CONSOLE ${type.toUpperCase()}]: ${msg.text()}`);
    });

    // Capture page errors
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR]: ${error.message}\n${error.stack}`);
    });

    // Capture failed requests
    page.on('requestfailed', request => {
      console.log(`[REQUEST FAILED]: ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('Complete booking flow with authentication', async ({ page }) => {
    console.log('\n=== STEP 1: INITIAL NAVIGATION TO BOOKING PAGE ===');

    // Navigate to booking page
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-01-initial-load.png',
      fullPage: true
    });

    const initialUrl = page.url();
    console.log(`Initial URL: ${initialUrl}`);

    // Check if we see "Access Required" message
    const accessRequired = page.locator('text=Access Required');
    const hasAccessRequired = await accessRequired.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasAccessRequired) {
      console.log('Access Required message detected - need to login');

      // Look for "Go to Login" link
      const loginLink = page.locator('a:has-text("Go to Login"), a[href*="login"], button:has-text("Login")');
      await loginLink.first().click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-02-login-page.png',
        fullPage: true
      });

      console.log('\n=== STEP 2: AUTHENTICATION ===');
      console.log(`Login page URL: ${page.url()}`);

      // Fill in credentials
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill(testEmail);
      console.log(`Filled email: ${testEmail}`);

      await expect(passwordInput).toBeVisible();
      await passwordInput.fill(testPassword);
      console.log('Filled password');

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-03-credentials-filled.png',
        fullPage: true
      });

      // Submit login form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      console.log('Clicked login button');

      // Wait for navigation
      await page.waitForTimeout(3000);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-04-after-login.png',
        fullPage: true
      });

      const afterLoginUrl = page.url();
      console.log(`After login URL: ${afterLoginUrl}`);

      // Navigate back to booking if not already there
      if (!afterLoginUrl.includes('/booking')) {
        console.log('Not on booking page, navigating there...');
        await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);
      }
    }

    console.log('\n=== STEP 3: BOOKING PAGE ANALYSIS ===');

    // Wait for booking page to load
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-05-booking-page.png',
      fullPage: true
    });

    const bookingUrl = page.url();
    console.log(`Booking page URL: ${bookingUrl}`);

    // Analyze page content
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log(`Page headings: ${JSON.stringify(headings)}`);

    const buttons = await page.locator('button:visible').allTextContents();
    console.log(`Visible buttons: ${JSON.stringify(buttons)}`);

    // Check for error messages
    const errorMessages = page.locator('[role="alert"], .error, [class*="error"]');
    const errorCount = await errorMessages.count();

    if (errorCount > 0) {
      console.log(`\nFound ${errorCount} error elements:`);
      for (let i = 0; i < errorCount; i++) {
        const errorText = await errorMessages.nth(i).textContent();
        console.log(`  Error ${i + 1}: ${errorText}`);
      }
    }

    // Check for Firebase permission errors in page content
    const bodyText = await page.locator('body').textContent();
    if (bodyText?.includes('permission') || bodyText?.includes('Firebase')) {
      console.log('\nWARNING: Page content mentions permissions or Firebase');
    }

    console.log('\n=== STEP 4: ROOM SELECTION ATTEMPT ===');

    // Look for room elements
    const roomCards = page.locator('[class*="room" i], [data-testid*="room"], article, .card');
    const roomCount = await roomCards.count();
    console.log(`Found ${roomCount} potential room elements`);

    if (roomCount > 0) {
      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-06-rooms-visible.png',
        fullPage: true
      });

      // Log first room details
      const firstRoomText = await roomCards.first().textContent();
      console.log(`First room content preview: ${firstRoomText?.substring(0, 200)}...`);
    } else {
      console.log('WARNING: No room elements found');

      // Check if there's a loading indicator
      const loading = page.locator('[class*="loading" i], [class*="spinner" i], [role="progressbar"]');
      const isLoading = await loading.isVisible({ timeout: 1000 }).catch(() => false);
      console.log(`Loading indicator visible: ${isLoading}`);
    }

    // Look for action buttons
    const actionButtons = page.locator('button:has-text("Select"), button:has-text("Book"), button:has-text("Add"), button:has-text("Choose")');
    const actionButtonCount = await actionButtons.count();
    console.log(`Found ${actionButtonCount} action buttons (Select/Book/Add/Choose)`);

    if (actionButtonCount > 0) {
      console.log('\n=== STEP 5: ATTEMPTING ROOM SELECTION ===');
      const firstButton = actionButtons.first();
      const buttonText = await firstButton.textContent();
      console.log(`Clicking button: "${buttonText}"`);

      await firstButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-07-after-room-selection.png',
        fullPage: true
      });

      console.log(`URL after room selection: ${page.url()}`);
    }

    console.log('\n=== STEP 6: CART/CHECKOUT ANALYSIS ===');

    // Look for cart-related elements
    const cartIndicators = page.locator('[href*="cart"], button:has-text("Cart"), [aria-label*="cart" i], [class*="cart" i]');
    const cartCount = await cartIndicators.count();
    console.log(`Found ${cartCount} cart-related elements`);

    if (cartCount > 0) {
      const cartElement = cartIndicators.first();
      const cartText = await cartElement.textContent();
      console.log(`Cart element text: "${cartText}"`);

      await cartElement.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-08-cart-view.png',
        fullPage: true
      });

      console.log(`URL after cart click: ${page.url()}`);
    }

    // Look for checkout/continue buttons
    const checkoutButtons = page.locator('button:has-text("Checkout"), button:has-text("Continue"), button:has-text("Proceed"), button:has-text("Next")');
    const checkoutCount = await checkoutButtons.count();
    console.log(`Found ${checkoutCount} checkout/continue buttons`);

    if (checkoutCount > 0) {
      console.log('\n=== STEP 7: CHECKOUT FLOW ===');
      const checkoutButton = checkoutButtons.first();
      const checkoutText = await checkoutButton.textContent();
      console.log(`Clicking: "${checkoutText}"`);

      await checkoutButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-09-checkout.png',
        fullPage: true
      });

      console.log(`URL at checkout: ${page.url()}`);
    }

    console.log('\n=== STEP 8: FORM ANALYSIS ===');

    // Look for input fields
    const inputFields = page.locator('input:visible, textarea:visible, select:visible');
    const inputCount = await inputFields.count();
    console.log(`Found ${inputCount} visible input fields`);

    if (inputCount > 0) {
      console.log('Input field details:');
      for (let i = 0; i < Math.min(inputCount, 10); i++) {
        const input = inputFields.nth(i);
        const name = await input.getAttribute('name');
        const type = await input.getAttribute('type');
        const placeholder = await input.getAttribute('placeholder');
        console.log(`  ${i + 1}. Name: ${name}, Type: ${type}, Placeholder: ${placeholder}`);
      }

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-10-forms.png',
        fullPage: true
      });
    }

    // Look for package selection
    console.log('\n=== STEP 9: PACKAGE OPTIONS ===');
    const packageOptions = page.locator('[role="radio"], input[type="radio"], button:has-text("Room Only"), button:has-text("B&B"), button:has-text("Breakfast"), button:has-text("Half Board")');
    const packageCount = await packageOptions.count();
    console.log(`Found ${packageCount} package-related elements`);

    if (packageCount > 0) {
      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-11-packages.png',
        fullPage: true
      });
    }

    console.log('\n=== STEP 10: RESPONSIVE TEST ===');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-12-mobile-view.png',
      fullPage: true
    });

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/step-13-tablet-view.png',
      fullPage: true
    });

    console.log('\n=== TEST COMPLETE ===');
  });
});