const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const errors = [];
  const consoleMessages = [];

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  // Capture page errors
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  // Capture network errors
  page.on('requestfailed', request => {
    console.log(`[NETWORK ERROR] ${request.url()} - ${request.failure().errorText}`);
  });

  console.log('\n=== STEP 1: Navigate to booking page ===\n');

  try {
    await page.goto('http://localhost:3000/booking', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    console.log('\n=== Taking screenshot of current page ===\n');
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-error-screenshot.png',
      fullPage: true
    });

    console.log(`\nCurrent URL: ${page.url()}`);
    console.log(`Page title: ${await page.title()}`);

    // Check if we need to login
    const needsAuth = await page.locator('text=Access Required').isVisible({ timeout: 2000 }).catch(() => false);

    if (needsAuth) {
      console.log('\n=== STEP 2: Logging in ===\n');

      await page.locator('a:has-text("Go to Login")').click();
      await page.waitForTimeout(1000);

      await page.locator('input[type="email"]').fill('playright@example.com');
      await page.locator('input[type="password"]').fill('playright');

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-login-form.png',
        fullPage: true
      });

      await page.locator('button[type="submit"]').click();
      console.log('Submitted login form');

      await page.waitForTimeout(3000);

      console.log(`\nAfter login URL: ${page.url()}`);

      // Navigate back to booking if needed
      if (!page.url().includes('/booking')) {
        console.log('\nNavigating back to /booking...');
        await page.goto('http://localhost:3000/booking', {
          waitUntil: 'networkidle',
          timeout: 30000
        });
        await page.waitForTimeout(2000);
      }
    }

    console.log('\n=== STEP 3: Analyze booking page ===\n');

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-authenticated-page.png',
      fullPage: true
    });

    console.log(`Final URL: ${page.url()}`);
    console.log(`Final title: ${await page.title()}`);

    // Get all headings
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log(`\nPage headings: ${JSON.stringify(headings)}`);

    // Check for loading indicator
    const loading = await page.locator('text=/loading/i').isVisible({ timeout: 1000 }).catch(() => false);
    console.log(`Loading indicator: ${loading}`);

    // Check for error messages
    const errorMsg = await page.locator('text=/error/i').first().textContent({ timeout: 1000 }).catch(() => null);
    if (errorMsg) {
      console.log(`Error message on page: ${errorMsg}`);
    }

    // Check for room selection elements
    const roomCards = await page.locator('[class*="room"], [data-testid*="room"]').count();
    console.log(`Room cards found: ${roomCards}`);

    // Check for date inputs
    const dateInputs = await page.locator('input[type="date"]').count();
    console.log(`Date inputs found: ${dateInputs}`);

    // Check for add to cart buttons
    const cartButtons = await page.locator('button:has-text("Add"), button:has-text("Cart")').count();
    console.log(`Cart-related buttons found: ${cartButtons}`);

    console.log('\n=== STEP 4: Try to interact with booking form ===\n');

    // Try to find and click an "Add to Cart" button if available
    const addButton = page.locator('button:has-text("Add")').first();
    const hasAddButton = await addButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasAddButton) {
      console.log('Found Add button, attempting to click...');

      await addButton.click();
      await page.waitForTimeout(2000);

      console.log('Clicked Add button');

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-after-add.png',
        fullPage: true
      });
    } else {
      console.log('No Add button found on page');
    }

    console.log('\n=== Summary ===\n');
    console.log(`Total console messages: ${consoleMessages.length}`);
    console.log(`Total page errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nPage Errors:');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err}`);
      });
    }

    // Filter for relevant console errors
    const relevantErrors = consoleMessages.filter(m =>
      m.type === 'error' &&
      !m.text.includes('404') &&
      !m.text.includes('Failed to load resource')
    );

    if (relevantErrors.length > 0) {
      console.log('\nRelevant Console Errors:');
      relevantErrors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.text}`);
      });
    }

  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-error-state.png',
      fullPage: true
    });
  }

  console.log('\n=== Test Complete - Browser will close in 10 seconds ===\n');
  await page.waitForTimeout(10000);

  await browser.close();
})();