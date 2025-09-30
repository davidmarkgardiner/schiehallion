const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'test-screenshots-authenticated');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  console.log('=== AUTHENTICATED BOOKING PAGE TEST START ===\n');

  // Collect console messages
  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(text);
    }
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('Page Error:', error.message);
  });

  try {
    // Step 1: Navigate to booking page (unauthenticated)
    console.log('\n--- Step 1: Navigate to booking page (unauthenticated) ---');
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '01-booking-unauthenticated.png'), fullPage: true });

    const h1 = await page.$('h1');
    if (h1) {
      const h1Text = await h1.textContent();
      console.log('Page heading:', h1Text);

      if (h1Text.includes('Access Required')) {
        console.log('✓ Access gate is working - authentication required');
      }
    }

    // Step 2: Click "GO TO LOGIN" button
    console.log('\n--- Step 2: Navigate to login page ---');
    const loginButton = await page.$('button:has-text("GO TO LOGIN")');

    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '02-login-page.png'), fullPage: true });
      console.log('Current URL:', page.url());
      console.log('✓ Navigated to login page');
    } else {
      console.log('⚠ GO TO LOGIN button not found');
    }

    // Step 3: Perform login
    console.log('\n--- Step 3: Attempt login ---');

    // Look for email and password fields
    const emailInput = await page.$('input[type="email"], input[name="email"]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');

    if (emailInput && passwordInput) {
      console.log('Login form found - filling credentials');

      // Use test credentials
      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpassword123');

      await page.screenshot({ path: path.join(screenshotsDir, '03-login-filled.png'), fullPage: true });

      // Find and click submit button
      const submitButton = await page.$('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In"), button:has-text("Login")');

      if (submitButton) {
        console.log('Clicking login button...');
        await submitButton.click();
        await page.waitForTimeout(4000);

        const currentUrl = page.url();
        console.log('URL after login attempt:', currentUrl);

        await page.screenshot({ path: path.join(screenshotsDir, '04-after-login.png'), fullPage: true });

        // Check if we're redirected to booking or still on login
        if (currentUrl.includes('/booking')) {
          console.log('✓ Successfully redirected to booking page');
        } else {
          console.log('⚠ Still on login page - checking for errors');

          const errorMessage = await page.$('[role="alert"], .error, [class*="error"]');
          if (errorMessage) {
            const errorText = await errorMessage.textContent();
            console.log('Error message:', errorText);
          }
        }
      } else {
        console.log('⚠ Login submit button not found');
      }
    } else {
      console.log('⚠ Login form not found');
      console.log('Email input found:', !!emailInput);
      console.log('Password input found:', !!passwordInput);
    }

    // Step 4: Check if we can access booking page now
    console.log('\n--- Step 4: Navigate to booking page (after login attempt) ---');
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(screenshotsDir, '05-booking-after-auth.png'), fullPage: true });

    const h1AfterLogin = await page.$('h1');
    if (h1AfterLogin) {
      const heading = await h1AfterLogin.textContent();
      console.log('Booking page heading:', heading);

      if (heading.includes('Access Required')) {
        console.log('⚠ Still blocked - authentication not successful');
      } else {
        console.log('✓ Access granted - checking booking form');
      }
    }

    // Step 5: Check for booking form elements
    console.log('\n--- Step 5: Check booking form elements ---');

    const form = await page.$('form');
    const allInputs = await page.$$('input, select, textarea');
    const allButtons = await page.$$('button');

    console.log('Form element exists:', !!form);
    console.log('Total input fields:', allInputs.length);
    console.log('Total buttons:', allButtons.length);

    if (allInputs.length > 0) {
      console.log('\nInput fields found:');
      for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
        const input = allInputs[i];
        const tagName = await input.evaluate(el => el.tagName);
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const placeholder = await input.getAttribute('placeholder');
        console.log(`  ${i + 1}. <${tagName}> type="${type}", name="${name}", placeholder="${placeholder}"`);
      }
    }

    if (allButtons.length > 0) {
      console.log('\nButtons found:');
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const button = allButtons[i];
        const text = await button.textContent();
        const type = await button.getAttribute('type');
        console.log(`  ${i + 1}. text="${text.trim()}", type="${type}"`);
      }
    }

    // Step 6: Test room selection if available
    console.log('\n--- Step 6: Test room selection ---');

    // Look for room cards or room selection elements
    const roomCards = await page.$$('[class*="room"], [data-testid*="room"], .card');
    console.log('Room selection elements found:', roomCards.length);

    if (roomCards.length > 0) {
      console.log('✓ Room selection interface detected');

      // Try to click first room
      const firstRoom = roomCards[0];
      await firstRoom.scrollIntoViewIfNeeded();
      await firstRoom.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, '06-room-selected.png'), fullPage: true });
      console.log('✓ Clicked on room selection element');
    } else {
      console.log('⚠ No room selection elements found');
    }

    // Step 7: Check cart functionality
    console.log('\n--- Step 7: Check shopping cart ---');

    const cartButton = await page.$('button:has-text("Cart"), [aria-label*="cart"], [class*="cart"]');
    if (cartButton) {
      console.log('Cart button found - clicking');
      await cartButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(screenshotsDir, '07-cart-opened.png'), fullPage: true });
    } else {
      console.log('Cart button not found');
    }

    // Step 8: Test mobile view
    console.log('\n--- Step 8: Test responsive design ---');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(screenshotsDir, '08-mobile-view.png'), fullPage: true });
    console.log('✓ Mobile view captured');

    // Summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`Console messages captured: ${consoleMessages.length}`);
    console.log(`JavaScript errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\nJavaScript Errors:');
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    const consoleErrors = consoleMessages.filter(msg => msg.includes('[error]'));
    const warnings = consoleMessages.filter(msg => msg.includes('[warning]'));

    console.log(`\nConsole errors: ${consoleErrors.length}`);
    console.log(`Console warnings: ${warnings.length}`);

    if (consoleErrors.length > 0) {
      console.log('\nKey Console Errors:');
      // Filter out repeated Firebase errors and show unique errors
      const uniqueErrors = [...new Set(consoleErrors)];
      uniqueErrors.slice(0, 5).forEach((err, i) => console.log(`  ${i + 1}. ${err.substring(0, 150)}`));
    }

    console.log('\n✓ Test completed');
    console.log(`Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('\n✗ Test failed with error:', error.message);
    try {
      await page.screenshot({ path: path.join(screenshotsDir, 'error-state.png'), fullPage: true });
    } catch (e) {
      console.error('Could not capture error screenshot');
    }
  } finally {
    await browser.close();
  }

  console.log('\n=== AUTHENTICATED BOOKING PAGE TEST END ===');
})();