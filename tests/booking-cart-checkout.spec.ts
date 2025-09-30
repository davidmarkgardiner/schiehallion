import { test, expect } from '@playwright/test';

test.describe('Booking Cart and Checkout Flow', () => {
  const testEmail = 'playright@example.com';
  const testPassword = 'playright';

  test('Complete flow: Add room to cart and proceed to checkout', async ({ page }) => {
    console.log('\n=== COMPLETE BOOKING FLOW TEST ===');

    // Capture all console messages
    const consoleMessages: string[] = [];
    const errorMessages: string[] = [];

    page.on('console', msg => {
      const message = `[${msg.type().toUpperCase()}]: ${msg.text()}`;
      consoleMessages.push(message);
      if (msg.type() === 'error' || msg.type() === 'warning') {
        errorMessages.push(message);
        console.log(message);
      }
    });

    page.on('pageerror', error => {
      const message = `[PAGE ERROR]: ${error.message}`;
      errorMessages.push(message);
      console.log(message);
    });

    // Step 1: Navigate and authenticate
    console.log('\n--- Step 1: Initial Navigation ---');
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    if (page.url().includes('/booking')) {
      const accessRequired = await page.locator('text=Access Required').isVisible({ timeout: 3000 }).catch(() => false);

      if (accessRequired) {
        console.log('Need to login, navigating to login page...');
        await page.locator('a:has-text("Go to Login")').click();
        await page.waitForTimeout(1000);

        await page.locator('input[type="email"]').first().fill(testEmail);
        await page.locator('input[type="password"]').first().fill(testPassword);
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(3000);

        if (!page.url().includes('/booking')) {
          await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(3000);
        }
      }
    }

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/flow-01-authenticated-booking.png',
      fullPage: true
    });

    // Step 2: Select dates and guests
    console.log('\n--- Step 2: Selecting Dates and Guests ---');

    const checkInInput = page.locator('input[type="date"]').first();
    const checkOutInput = page.locator('input[type="date"]').nth(1);

    // Set dates (3 days from now to 5 days from now)
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 3);
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 5);

    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];

    await checkInInput.fill(checkInStr);
    console.log(`Set check-in date: ${checkInStr}`);
    await page.waitForTimeout(500);

    await checkOutInput.fill(checkOutStr);
    console.log(`Set check-out date: ${checkOutStr}`);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/flow-02-dates-selected.png',
      fullPage: true
    });

    // Step 3: Select package type
    console.log('\n--- Step 3: Package Selection ---');

    const packageSelect = page.locator('select').first();
    const packageOptions = await packageSelect.locator('option').allTextContents();
    console.log(`Available packages: ${JSON.stringify(packageOptions)}`);

    // Try selecting B&B if available
    const hasBnB = packageOptions.some(opt => opt.toLowerCase().includes('b&b') || opt.toLowerCase().includes('breakfast'));
    if (hasBnB) {
      await packageSelect.selectOption({ label: packageOptions.find(opt => opt.toLowerCase().includes('b&b') || opt.toLowerCase().includes('breakfast')) || '' });
      console.log('Selected B&B package');
      await page.waitForTimeout(500);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/flow-03-package-selected.png',
        fullPage: true
      });
    }

    // Step 4: Select a room
    console.log('\n--- Step 4: Room Selection ---');

    // Look for room cards - try to click on the first room card to potentially expand it
    const roomButtons = page.locator('button:visible').filter({ hasText: /Room \d+/ });
    const roomButtonCount = await roomButtons.count();

    if (roomButtonCount > 0) {
      console.log(`Found ${roomButtonCount} room buttons`);
      await roomButtons.first().click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/flow-04-room-clicked.png',
        fullPage: true
      });
    }

    // Step 5: Add to cart
    console.log('\n--- Step 5: Adding Room to Cart ---');

    const addToCartButton = page.locator('button:has-text("Add Room to Cart"), button:has-text("Add to Cart")');
    const hasAddButton = await addToCartButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasAddButton) {
      console.log('Clicking "Add Room to Cart" button');
      await addToCartButton.click();
      await page.waitForTimeout(2000);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/flow-05-added-to-cart.png',
        fullPage: true
      });

      // Check if cart has items
      const cartDetails = await page.locator('[class*="stay details" i], .cart, [class*="summary"]').textContent();
      console.log(`Cart/Summary content: ${cartDetails?.substring(0, 300)}`);
    } else {
      console.log('WARNING: Add to Cart button not found');
    }

    // Step 6: Look for checkout/continue button
    console.log('\n--- Step 6: Looking for Checkout Options ---');

    const continueButtons = page.locator('button:has-text("Continue"), button:has-text("Checkout"), button:has-text("Proceed"), button:has-text("Next Step"), a[href*="checkout"]');
    const continueCount = await continueButtons.count();

    console.log(`Found ${continueCount} continue/checkout buttons`);

    if (continueCount > 0) {
      for (let i = 0; i < continueCount; i++) {
        const btnText = await continueButtons.nth(i).textContent();
        console.log(`  Button ${i + 1}: "${btnText}"`);
      }

      // Try clicking the first continue button
      const firstContinueBtn = continueButtons.first();
      const isVisible = await firstContinueBtn.isVisible({ timeout: 2000 }).catch(() => false);

      if (isVisible) {
        console.log('Clicking continue button...');
        await firstContinueBtn.click();
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/flow-06-after-continue.png',
          fullPage: true
        });

        console.log(`URL after continue: ${page.url()}`);
      }
    } else {
      console.log('No continue/checkout buttons found - may need to scroll or meet requirements');
    }

    // Step 7: Check current page state
    console.log('\n--- Step 7: Current Page Analysis ---');

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    const headings = await page.locator('h1, h2').allTextContents();
    console.log(`Current headings: ${JSON.stringify(headings)}`);

    // Look for forms
    const forms = await page.locator('form').count();
    console.log(`Forms on page: ${forms}`);

    if (forms > 0) {
      console.log('Analyzing form fields...');
      const inputs = page.locator('form input, form textarea, form select');
      const inputCount = await inputs.count();

      for (let i = 0; i < Math.min(inputCount, 15); i++) {
        const input = inputs.nth(i);
        const name = await input.getAttribute('name');
        const type = await input.getAttribute('type');
        const label = await input.getAttribute('aria-label') || await input.getAttribute('placeholder');
        console.log(`  Input ${i + 1}: name="${name}", type="${type}", label="${label}"`);
      }
    }

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/flow-07-final-state.png',
      fullPage: true
    });

    // Step 8: Try to find cart/summary
    console.log('\n--- Step 8: Cart Summary Analysis ---');

    const cartSummary = page.locator('[class*="cart"], [class*="summary"], [class*="total"]');
    const summaryCount = await cartSummary.count();

    if (summaryCount > 0) {
      console.log(`Found ${summaryCount} cart/summary elements`);
      const summaryText = await cartSummary.first().textContent();
      console.log(`Summary content: ${summaryText}`);
    }

    // Step 9: Summary of errors
    console.log('\n--- Step 9: Error Summary ---');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total errors/warnings: ${errorMessages.length}`);

    if (errorMessages.length > 0) {
      console.log('\nUnique errors:');
      const uniqueErrors = [...new Set(errorMessages)];
      uniqueErrors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    }

    console.log('\n=== TEST COMPLETE ===');
  });
});