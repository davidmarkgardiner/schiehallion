import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow with Authentication', () => {
  const testEmail = 'playright@example.com';
  const testPassword = 'playright';

  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => {
      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        console.log(`[CONSOLE ${type.toUpperCase()}]: ${msg.text()}`);
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      console.log(`[PAGE ERROR]: ${error.message}`);
    });
  });

  test('Step 1: Navigate to booking page and handle authentication', async ({ page }) => {
    console.log('=== STEP 1: NAVIGATING TO BOOKING PAGE ===');

    await page.goto('http://localhost:3000/booking');
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/01-initial-navigation.png', fullPage: true });

    // Check if we're redirected to login
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('/login') || currentUrl.includes('/auth') || currentUrl.includes('/signin')) {
      console.log('Redirected to login page - attempting authentication');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/02-login-page.png', fullPage: true });

      // Look for email/username field
      const emailInput = page.locator('input[type="email"], input[name="email"], input[id="email"], input[placeholder*="email" i]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });
      await emailInput.fill(testEmail);

      // Look for password field
      const passwordInput = page.locator('input[type="password"]').first();
      await expect(passwordInput).toBeVisible();
      await passwordInput.fill(testPassword);

      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/03-credentials-filled.png', fullPage: true });

      // Look for submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Login")').first();
      await submitButton.click();

      console.log('Waiting for authentication to complete...');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/04-after-login.png', fullPage: true });

      // Verify we're now on booking page or redirected there
      const finalUrl = page.url();
      console.log(`Final URL after login: ${finalUrl}`);

      if (!finalUrl.includes('/booking')) {
        console.log('Not on booking page yet, navigating there...');
        await page.goto('http://localhost:3000/booking');
        await page.waitForLoadState('networkidle');
      }
    }

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/05-booking-page-authenticated.png', fullPage: true });
    console.log('Authentication step completed');
  });

  test('Step 2: Browse and select available rooms', async ({ page }) => {
    console.log('=== STEP 2: BROWSING AND SELECTING ROOMS ===');

    // First authenticate
    await page.goto('http://localhost:3000/booking');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/login') || page.url().includes('/auth')) {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      await emailInput.fill(testEmail);
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill(testPassword);
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Now on booking page
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/06-rooms-listing.png', fullPage: true });

    // Look for room cards/listings
    const roomElements = await page.locator('[class*="room"], [data-testid*="room"], article, .card').all();
    console.log(`Found ${roomElements.length} potential room elements`);

    // Look for "Select", "Book", "Add to Cart" buttons
    const selectButtons = page.locator('button:has-text("Select"), button:has-text("Book"), button:has-text("Add to Cart"), button:has-text("Choose")');
    const buttonCount = await selectButtons.count();
    console.log(`Found ${buttonCount} selection buttons`);

    if (buttonCount > 0) {
      // Click the first available room selection button
      await selectButtons.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/07-room-selected.png', fullPage: true });
      console.log('Room selection completed');
    } else {
      console.log('WARNING: No room selection buttons found');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/07-no-rooms-found.png', fullPage: true });
    }
  });

  test('Step 3: Test cart functionality', async ({ page }) => {
    console.log('=== STEP 3: TESTING CART FUNCTIONALITY ===');

    // Authenticate and select a room first
    await page.goto('http://localhost:3000/booking');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/login') || page.url().includes('/auth')) {
      await page.locator('input[type="email"]').first().fill(testEmail);
      await page.locator('input[type="password"]').first().fill(testPassword);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Try to find and click add to cart
    const addToCartButton = page.locator('button:has-text("Add to Cart"), button:has-text("Select"), button:has-text("Book")').first();
    if (await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
    }

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/08-cart-state.png', fullPage: true });

    // Look for cart icon or cart page
    const cartLink = page.locator('[href*="cart"], button:has-text("Cart"), a:has-text("Cart"), [aria-label*="cart" i]');
    if (await cartLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cartLink.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/09-cart-page.png', fullPage: true });
      console.log('Navigated to cart page');
    } else {
      console.log('Cart link not found, might be on same page');
    }

    // Look for quantity controls
    const quantityIncrease = page.locator('button:has-text("+"), button[aria-label*="increase" i]');
    const quantityDecrease = page.locator('button:has-text("-"), button[aria-label*="decrease" i]');

    if (await quantityIncrease.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Testing quantity increase');
      await quantityIncrease.first().click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/10-quantity-increased.png', fullPage: true });
    }

    // Look for remove button
    const removeButton = page.locator('button:has-text("Remove"), button[aria-label*="remove" i]');
    if (await removeButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Found remove button (not clicking to preserve cart for next tests)');
    }
  });

  test('Step 4: Guest information form', async ({ page }) => {
    console.log('=== STEP 4: TESTING GUEST INFORMATION FORM ===');

    // Setup: authenticate and add room
    await page.goto('http://localhost:3000/booking');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/login') || page.url().includes('/auth')) {
      await page.locator('input[type="email"]').first().fill(testEmail);
      await page.locator('input[type="password"]').first().fill(testPassword);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Look for "Continue", "Next", "Proceed" buttons to go to guest info
    const proceedButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Proceed"), button:has-text("Guest Information")');
    if (await proceedButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await proceedButton.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/11-guest-info-form.png', fullPage: true });
    } else {
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/11-current-state.png', fullPage: true });
    }

    // Look for common form fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name"]').first();
    const emailInputForm = page.locator('input[name="email"], input[type="email"]').first();
    const phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="phone" i]').first();

    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('Filling guest information form');
      await nameInput.fill('Test Guest');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/12-form-filling.png', fullPage: true });
    }

    // Test form validation by submitting empty or proceeding
    const submitFormButton = page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Next")').first();
    if (await submitFormButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitFormButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/13-form-validation.png', fullPage: true });
    }
  });

  test('Step 5: Package type selection', async ({ page }) => {
    console.log('=== STEP 5: TESTING PACKAGE TYPE SELECTION ===');

    await page.goto('http://localhost:3000/booking');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/login') || page.url().includes('/auth')) {
      await page.locator('input[type="email"]').first().fill(testEmail);
      await page.locator('input[type="password"]').first().fill(testPassword);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Look for package options
    const packageOptions = page.locator('input[type="radio"], button:has-text("Room Only"), button:has-text("B&B"), button:has-text("Half Board"), button:has-text("Breakfast"), [role="radio"]');
    const packageCount = await packageOptions.count();
    console.log(`Found ${packageCount} package-related elements`);

    if (packageCount > 0) {
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/14-package-options.png', fullPage: true });

      // Try selecting different packages
      for (let i = 0; i < Math.min(packageCount, 3); i++) {
        const option = packageOptions.nth(i);
        if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
          await option.click();
          await page.waitForTimeout(500);
          await page.screenshot({ path: `/Users/davidgardiner/Desktop/repo/schiehallion/test-results/15-package-selected-${i}.png`, fullPage: true });
        }
      }
    } else {
      console.log('No package options found on current page');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/14-no-packages.png', fullPage: true });
    }
  });

  test('Step 6: Payment and checkout', async ({ page }) => {
    console.log('=== STEP 6: TESTING PAYMENT AND CHECKOUT ===');

    await page.goto('http://localhost:3000/booking');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/login') || page.url().includes('/auth')) {
      await page.locator('input[type="email"]').first().fill(testEmail);
      await page.locator('input[type="password"]').first().fill(testPassword);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // Look for checkout or payment buttons
    const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Payment"), button:has-text("Pay Now"), a[href*="checkout"]');
    const checkoutCount = await checkoutButton.count();
    console.log(`Found ${checkoutCount} checkout-related buttons`);

    if (checkoutCount > 0) {
      await checkoutButton.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/16-checkout-page.png', fullPage: true });
      console.log('Navigated to checkout page');
    } else {
      console.log('No checkout button found');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/16-no-checkout.png', fullPage: true });
    }

    // Look for payment form elements
    const cardInput = page.locator('input[name*="card"], input[placeholder*="card" i], iframe[name*="stripe"], iframe[title*="payment"]');
    if (await cardInput.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Payment form found');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/17-payment-form.png', fullPage: true });
    }
  });

  test('Step 7: Complete flow verification', async ({ page }) => {
    console.log('=== STEP 7: COMPLETE FLOW VERIFICATION ===');

    await page.goto('http://localhost:3000/booking');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/18-flow-start.png', fullPage: true });

    const currentUrl = page.url();
    console.log(`Starting URL: ${currentUrl}`);

    // Document the complete page structure
    const bodyText = await page.locator('body').textContent();
    console.log(`Page contains ${bodyText?.length || 0} characters of text`);

    // Check for key elements
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log('Page headings:', headings);

    const buttons = await page.locator('button').allTextContents();
    console.log('Available buttons:', buttons);

    const links = await page.locator('a[href]').count();
    console.log(`Found ${links} links on page`);

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/19-final-state.png', fullPage: true });
  });

  test('Step 8: Responsive behavior test', async ({ page }) => {
    console.log('=== STEP 8: TESTING RESPONSIVE BEHAVIOR ===');

    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} viewport: ${viewport.width}x${viewport.height}`);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/booking');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `/Users/davidgardiner/Desktop/repo/schiehallion/test-results/20-${viewport.name}-view.png`, fullPage: true });
    }
  });
});