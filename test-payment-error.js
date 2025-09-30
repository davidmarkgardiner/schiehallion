const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[BROWSER ${type.toUpperCase()}]:`, text);
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.log('[PAGE ERROR]:', error.message);
  });

  try {
    console.log('Navigating to booking page...');
    await page.goto('http://localhost:3000/booking', { waitUntil: 'networkidle' });
    
    // Take screenshot of initial page
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-1-booking-page.png' });
    console.log('Screenshot saved: screenshot-1-booking-page.png');

    // Check if we're redirected to login
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('\nLogging in...');
      await page.fill('input[type="email"]', 'playright@example.com');
      await page.fill('input[type="password"]', 'playright');
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-2-after-login.png' });
      console.log('Screenshot saved: screenshot-2-after-login.png');
    }

    // Wait for booking page to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-3-booking-loaded.png' });
    console.log('Screenshot saved: screenshot-3-booking-loaded.png');

    // Try to find date pickers and select dates
    console.log('\nLooking for date inputs...');
    const checkInInput = await page.locator('input[name="checkIn"], input[placeholder*="Check"], input[type="date"]').first();
    const checkOutInput = await page.locator('input[name="checkOut"], input[placeholder*="Check"], input[type="date"]').nth(1);

    if (await checkInInput.count() > 0) {
      console.log('Found date inputs, filling them...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      
      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };

      await checkInInput.fill(formatDate(tomorrow));
      await checkOutInput.fill(formatDate(dayAfter));
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-4-dates-filled.png' });
      console.log('Screenshot saved: screenshot-4-dates-filled.png');

      // Look for search/check availability button
      const searchButton = await page.locator('button:has-text("Check"), button:has-text("Search"), button:has-text("Availability")').first();
      if (await searchButton.count() > 0) {
        console.log('Clicking search button...');
        await searchButton.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-5-rooms-displayed.png' });
        console.log('Screenshot saved: screenshot-5-rooms-displayed.png');
      }
    }

    // Look for room selection or "Add to Cart" buttons
    console.log('\nLooking for room selection options...');
    const addToCartButtons = await page.locator('button:has-text("Add"), button:has-text("Select"), button:has-text("Book")');
    const buttonCount = await addToCartButtons.count();
    console.log(`Found ${buttonCount} potential room selection buttons`);

    if (buttonCount > 0) {
      console.log('Clicking first room selection button...');
      await addToCartButtons.first().click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-6-room-selected.png' });
      console.log('Screenshot saved: screenshot-6-room-selected.png');
    }

    // Look for "Continue" or "Next" buttons to proceed
    const continueButton = await page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Proceed")').first();
    if (await continueButton.count() > 0) {
      console.log('Clicking continue button...');
      await continueButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-7-next-step.png' });
      console.log('Screenshot saved: screenshot-7-next-step.png');
    }

    // Wait and take final screenshot
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-8-final.png' });
    console.log('Screenshot saved: screenshot-8-final.png');

    console.log('\nTest completed. Check screenshots for results.');

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshot-error.png' });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
})();
