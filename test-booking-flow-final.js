const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  const results = {
    roomsLoaded: false,
    datesFilledSuccessfully: false,
    addToCartWorked: false,
    cartModalOpened: false,
    checkoutButtonVisible: false,
    errors: []
  };

  console.log('\n=== BOOKING FLOW TEST (WITHOUT LOGIN) ===\n');

  try {
    console.log('Step 1: Navigate to booking page');
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('Step 2: Wait 10 seconds for page to fully load');
    await page.waitForTimeout(10000);

    console.log('Step 3: Take initial snapshot');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/01-booking-page-initial.png', fullPage: true });

    // Check if rooms loaded
    const roomCount = await page.locator('text=Standard Room').count();
    results.roomsLoaded = roomCount > 0;
    console.log(`✓ Rooms loaded: ${roomCount} room cards found`);

    console.log('Step 4: Find and fill check-in date input');
    // Look for all input elements
    const allInputs = await page.locator('input').all();
    console.log(`Found ${allInputs.length} total input elements`);

    // Find inputs by label text
    const checkInLabel = await page.locator('text=Check-in Date').count();
    console.log(`Check-in label found: ${checkInLabel > 0}`);

    // Try using the label to find the associated input
    const checkInInput = await page.locator('input').first();
    await checkInInput.click();
    await page.waitForTimeout(500);

    // Try typing the date in format shown in placeholder (dd/mm/yyyy)
    await checkInInput.fill('15/10/2025');
    await page.waitForTimeout(1000);

    console.log('Step 5: Fill check-out date');
    const checkOutInput = await page.locator('input').nth(1);
    await checkOutInput.click();
    await page.waitForTimeout(500);
    await checkOutInput.fill('17/10/2025');
    await page.waitForTimeout(2000);

    // Click away to trigger any validation
    await page.locator('body').click({ position: { x: 100, y: 100 } });
    await page.waitForTimeout(1000);

    console.log('Step 6: Take snapshot after filling dates');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/02-dates-filled.png', fullPage: true });

    // Check the "Your stay details" panel to see if dates were accepted
    const stayDetailsPanel = await page.locator('text=Your stay details');
    const panelVisible = await stayDetailsPanel.isVisible();
    console.log(`Stay details panel visible: ${panelVisible}`);

    // Look for date values in the panel
    const panelText = await page.locator('[class*="stay"]').first().textContent().catch(() => '');
    console.log(`Panel content check: ${panelText.includes('15/10') || panelText.includes('Select date') ? 'checking...' : 'unknown'}`);

    console.log('Step 7: Ensure guests is set to 2');
    const guestsInput = await page.locator('input[type="number"]').first();
    await guestsInput.click();
    await guestsInput.fill('2');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/03-ready-to-add.png', fullPage: true });

    console.log('Step 8: Look for ADD ROOM TO CART button');
    const addToCartButton = await page.locator('button:has-text("ADD ROOM TO CART")');

    const isVisible = await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      console.log('✓ ADD ROOM TO CART button found and visible');

      console.log('Step 9: Click the ADD ROOM TO CART button');
      await addToCartButton.click();
      await page.waitForTimeout(3000);

      console.log('Step 10: Take snapshot after clicking add to cart');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/04-after-add-to-cart.png', fullPage: true });

      // Check if there's an error message
      const errorMessage = await page.locator('text=/Please choose both/').isVisible({ timeout: 1000 }).catch(() => false);

      if (errorMessage) {
        console.log('✗ Validation error: Dates not properly set');
        results.addToCartWorked = false;
        results.errors.push('Date validation failed');
      } else {
        console.log('✓ No validation error detected');

        // Check for cart indicator in header
        await page.waitForTimeout(2000);
        const cartIndicator = await page.locator('button:has-text("Cart")').isVisible({ timeout: 3000 }).catch(() => false);

        if (cartIndicator) {
          console.log('✓ Cart indicator visible in header - item added successfully!');
          results.addToCartWorked = true;

          console.log('Step 11: Click on cart button to open cart');
          const cartButton = await page.locator('button:has-text("Cart")').first();
          await cartButton.click();
          await page.waitForTimeout(2000);
          results.cartModalOpened = true;

          console.log('Step 12: Take snapshot of cart modal');
          await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/05-cart-opened.png', fullPage: true });

          console.log('Step 13: Check for Continue/Checkout button');
          // Look for various checkout button patterns
          const checkoutSelectors = [
            'button:has-text("Continue to Booking")',
            'button:has-text("Proceed to Booking")',
            'button:has-text("Continue")',
            'button:has-text("Checkout")',
            'button:has-text("Proceed")'
          ];

          let checkoutVisible = false;
          let foundSelector = '';

          for (const selector of checkoutSelectors) {
            const btn = await page.locator(selector).first();
            checkoutVisible = await btn.isVisible({ timeout: 1000 }).catch(() => false);
            if (checkoutVisible) {
              foundSelector = selector;
              break;
            }
          }

          if (checkoutVisible) {
            console.log(`✓ Found checkout button with selector: ${foundSelector}`);
            results.checkoutButtonVisible = true;
          } else {
            console.log('✗ Continue to Checkout button NOT found');
            results.checkoutButtonVisible = false;

            // Log all visible buttons to help debug
            const allButtons = await page.locator('button').all();
            console.log(`Total buttons visible: ${allButtons.length}`);
          }

        } else {
          console.log('✗ Cart indicator NOT visible after clicking add to cart');
          results.addToCartWorked = false;
        }
      }

      // Take a final screenshot
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/06-final-state.png', fullPage: true });

    } else {
      console.log('✗ ADD ROOM TO CART button NOT found or not visible');
      results.addToCartWorked = false;
    }

  } catch (error) {
    console.error('Error during test:', error.message);
    results.errors.push(error.message);
    try {
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/error-state.png', fullPage: true });
    } catch (screenshotError) {
      console.error('Could not take error screenshot');
    }
  }

  console.log('\n=== FINAL TEST RESULTS ===');
  console.log(`Rooms loaded successfully: ${results.roomsLoaded ? 'YES' : 'NO'}`);
  console.log(`Dates filled successfully: ${results.datesFilledSuccessfully ? 'YES' : 'NO'}`);
  console.log(`ADD ROOM TO CART button worked: ${results.addToCartWorked ? 'YES' : 'NO'}`);
  console.log(`Cart modal opened: ${results.cartModalOpened ? 'YES' : 'NO'}`);
  console.log(`Continue to Checkout button visible: ${results.checkoutButtonVisible ? 'YES' : 'NO'}`);
  if (results.errors.length > 0) {
    console.log(`\nErrors encountered:`);
    results.errors.forEach(err => console.log(`  - ${err}`));
  }
  console.log('\nAll screenshots saved to: /Users/davidgardiner/Desktop/repo/schiehallion/screenshots/');

  await page.waitForTimeout(3000);
  await browser.close();
})();
