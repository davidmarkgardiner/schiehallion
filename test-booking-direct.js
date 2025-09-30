const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const consoleMessages = [];

  // Capture console messages
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[${msg.type().toUpperCase()}] ${text}`);
    }
  });

  // Capture page errors
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`[PAGE ERROR] ${error.message}`);
  });

  console.log('\n=== STEP 1: Login via home page ===\n');

  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('On home page, looking for login...');

    // Look for login button or link
    const loginButton = page.locator('button:has-text("LOG IN"), a:has-text("LOG IN"), button:has-text("Sign In"), a:has-text("Sign In")').first();
    const hasLogin = await loginButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasLogin) {
      console.log('Found login button, clicking...');
      await loginButton.click();
      await page.waitForTimeout(1000);

      console.log('Filling login form...');
      await page.locator('input[type="email"]').fill('playright@example.com');
      await page.locator('input[type="password"]').fill('playright');
      await page.locator('button[type="submit"]').click();

      console.log('Submitted login, waiting...');
      await page.waitForTimeout(3000);
    } else {
      console.log('No login button found, checking if already logged in...');
    }

    console.log('\n=== STEP 2: Navigate to booking page ===\n');

    await page.goto('http://localhost:3000/booking', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(3000);

    console.log(`Current URL: ${page.url()}`);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-page-loaded.png',
      fullPage: true
    });

    // Get page content
    const headings = await page.locator('h1, h2').allTextContents();
    console.log(`Page headings: ${JSON.stringify(headings)}`);

    // Check if we're on booking page or still loading
    const isLoading = await page.locator('text=/loading/i, text=/authenticating/i').isVisible({ timeout: 2000 }).catch(() => false);
    console.log(`Is loading: ${isLoading}`);

    if (isLoading) {
      console.log('Page is loading, waiting 5 more seconds...');
      await page.waitForTimeout(5000);
      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-after-wait.png',
        fullPage: true
      });
    }

    console.log('\n=== STEP 3: Look for room selection ===\n');

    // Check for any room cards or selection elements
    const roomElements = await page.locator('[class*="room"]').count();
    console.log(`Elements with "room" in class: ${roomElements}`);

    const dateInputs = await page.locator('input[type="date"]').count();
    console.log(`Date inputs: ${dateInputs}`);

    const selectElements = await page.locator('select').count();
    console.log(`Select dropdowns: ${selectElements}`);

    // Try to find the first "Add" button
    const buttons = await page.locator('button').allTextContents();
    console.log(`\nAll buttons on page: ${JSON.stringify(buttons.slice(0, 10))}`);

    console.log('\n=== STEP 4: Try to add a room to cart ===\n');

    // Set check-in date if date input exists
    if (dateInputs > 0) {
      console.log('Found date inputs, setting dates...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const checkOut = new Date();
      checkOut.setDate(checkOut.getDate() + 4);

      const checkInStr = tomorrow.toISOString().split('T')[0];
      const checkOutStr = checkOut.toISOString().split('T')[0];

      console.log(`Check-in: ${checkInStr}, Check-out: ${checkOutStr}`);

      await page.locator('input[type="date"]').first().fill(checkInStr);
      await page.waitForTimeout(500);
      await page.locator('input[type="date"]').nth(1).fill(checkOutStr);
      await page.waitForTimeout(1000);

      console.log('Dates set');

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-dates-set.png',
        fullPage: true
      });
    }

    // Try to click "Add to Cart" button
    const addToCartBtn = page.locator('button:has-text("Add Room to Cart"), button:has-text("Add to Cart")').first();
    const hasAddBtn = await addToCartBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasAddBtn) {
      console.log('Found "Add to Cart" button, clicking...');

      // Clear previous errors
      errors.length = 0;
      consoleMessages.length = 0;

      await addToCartBtn.click();
      console.log('Clicked add to cart');

      await page.waitForTimeout(3000);

      await page.screenshot({
        path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-after-add-clicked.png',
        fullPage: true
      });

      // Check for errors that occurred after clicking
      console.log('\n=== Errors after clicking Add to Cart ===\n');

      if (errors.length > 0) {
        console.log('Page Errors:');
        errors.forEach((err, idx) => {
          console.log(`  ${idx + 1}. ${err}`);
        });
      }

      const relevantErrors = consoleMessages.filter(m =>
        m.type === 'error' &&
        !m.text.includes('404') &&
        !m.text.includes('Failed to load resource') &&
        !m.text.includes('DevTools')
      );

      if (relevantErrors.length > 0) {
        console.log('\nConsole Errors:');
        relevantErrors.forEach((err, idx) => {
          console.log(`  ${idx + 1}. ${err.text.substring(0, 200)}`);
        });
      } else {
        console.log('No errors detected after clicking Add to Cart');
      }

      // Check for cart indicator
      const cartIndicator = await page.locator('text=/cart.*\\(/i').isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`\nCart indicator visible: ${cartIndicator}`);

      if (cartIndicator) {
        console.log('SUCCESS: Room appears to have been added to cart');
      }

      console.log('\n=== STEP 5: Try to proceed to guest info ===\n');

      // Click "View Cart" or "Proceed to Guest Info"
      const viewCartBtn = page.locator('button:has-text("View Cart"), button:has-text("Guest")').first();
      const hasViewCart = await viewCartBtn.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasViewCart) {
        const btnText = await viewCartBtn.textContent();
        console.log(`Found "${btnText}" button, clicking...`);

        errors.length = 0;
        consoleMessages.length = 0;

        await viewCartBtn.click();
        await page.waitForTimeout(3000);

        console.log(`New URL: ${page.url()}`);

        await page.screenshot({
          path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-cart-view.png',
          fullPage: true
        });

        // Check for errors
        if (errors.length > 0) {
          console.log('\nPage Errors after opening cart:');
          errors.forEach((err, idx) => {
            console.log(`  ${idx + 1}. ${err}`);
          });
        }

        const cartErrors = consoleMessages.filter(m =>
          m.type === 'error' &&
          !m.text.includes('404') &&
          !m.text.includes('Failed to load resource') &&
          !m.text.includes('DevTools')
        );

        if (cartErrors.length > 0) {
          console.log('\nConsole Errors after opening cart:');
          cartErrors.forEach((err, idx) => {
            console.log(`  ${idx + 1}. ${err.text.substring(0, 200)}`);
          });
        }

        console.log('\n=== STEP 6: Try to proceed to checkout ===\n');

        // Look for proceed/checkout button
        const proceedBtn = page.locator('button:has-text("Proceed"), button:has-text("Continue"), button:has-text("Checkout")').first();
        const hasProceed = await proceedBtn.isVisible({ timeout: 3000 }).catch(() => false);

        if (hasProceed) {
          const proceedText = await proceedBtn.textContent();
          console.log(`Found "${proceedText}" button, clicking...`);

          errors.length = 0;
          consoleMessages.length = 0;

          await proceedBtn.click();
          await page.waitForTimeout(3000);

          console.log(`New URL after proceed: ${page.url()}`);

          await page.screenshot({
            path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-after-proceed.png',
            fullPage: true
          });

          // This is where the actual booking creation happens - check for errors
          console.log('\n=== CRITICAL: Errors during booking creation ===\n');

          if (errors.length > 0) {
            console.log('Page Errors:');
            errors.forEach((err, idx) => {
              console.log(`  ${idx + 1}. ${err}`);
            });
          }

          const bookingErrors = consoleMessages.filter(m =>
            (m.type === 'error' || m.type === 'warning') &&
            !m.text.includes('404') &&
            !m.text.includes('Failed to load resource') &&
            !m.text.includes('DevTools')
          );

          if (bookingErrors.length > 0) {
            console.log('\nConsole Errors/Warnings during booking:');
            bookingErrors.forEach((err, idx) => {
              console.log(`  ${idx + 1}. [${err.type}] ${err.text}`);
            });
          } else {
            console.log('No errors detected during booking creation');
          }
        } else {
          console.log('No proceed button found');
        }
      } else {
        console.log('No "View Cart" button found');
      }

    } else {
      console.log('No "Add to Cart" button found on page');
      console.log('This might indicate the page did not load correctly');
    }

    console.log('\n=== Final Summary ===\n');
    console.log(`Total page errors: ${errors.length}`);
    console.log(`Total console messages: ${consoleMessages.length}`);

  } catch (error) {
    console.error('\nTest failed with error:', error.message);
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/booking-test-failed.png',
      fullPage: true
    });
  }

  console.log('\n=== Test Complete - Browser will close in 15 seconds ===\n');
  await page.waitForTimeout(15000);

  await browser.close();
})();