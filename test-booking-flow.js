const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  const page = await context.newPage();

  const results = {
    roomsLoaded: false,
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

    console.log('Step 4: Check for date inputs');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/02-before-filling-dates.png', fullPage: true });

    // Try to find and interact with date inputs using multiple selectors
    const dateInputs = await page.locator('input[type="text"]').all();
    console.log(`Found ${dateInputs.length} text inputs`);

    if (dateInputs.length >= 2) {
      console.log('Step 5: Fill check-in date');
      await dateInputs[0].click();
      await dateInputs[0].fill('15/10/2025');
      await page.waitForTimeout(1000);

      console.log('Step 6: Fill check-out date');
      await dateInputs[1].click();
      await dateInputs[1].fill('17/10/2025');
      await page.waitForTimeout(1000);
    } else {
      console.log('Warning: Could not find date inputs, proceeding without filling dates');
    }

    console.log('Step 7: Guests already set to 2 (default)');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/03-after-date-attempt.png', fullPage: true });

    console.log('Step 8: Look for ADD ROOM TO CART button');
    const addToCartButton = await page.locator('button:has-text("ADD ROOM TO CART")');

    const isVisible = await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false);
    if (isVisible) {
      console.log('✓ ADD ROOM TO CART button found and visible');

      console.log('Step 9: Click the ADD ROOM TO CART button');
      await addToCartButton.click();
      results.addToCartWorked = true;

      console.log('Step 10: Wait 3 seconds');
      await page.waitForTimeout(3000);

      console.log('Step 11: Take snapshot after adding to cart');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/04-after-add-to-cart.png', fullPage: true });

      console.log('Step 12: Check for success indicators');
      // Check for cart indicator in header
      const cartIndicator = await page.locator('text=/Cart \\(\\d+\\)/').isVisible({ timeout: 2000 }).catch(() => false);
      if (cartIndicator) {
        console.log('✓ Cart indicator visible in header');
      }

      console.log('Step 13: Look for Cart button in header');
      // Try to find cart button in header
      const headerCartButton = await page.locator('button:has-text("Cart")').first();
      let cartButtonVisible = await headerCartButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (!cartButtonVisible) {
        // Try looking for "View Cart" button
        const viewCartButton = await page.locator('button:has-text("View Cart")').first();
        cartButtonVisible = await viewCartButton.isVisible({ timeout: 2000 }).catch(() => false);

        if (cartButtonVisible) {
          console.log('✓ View Cart button found');

          console.log('Step 14: Click View Cart button');
          await viewCartButton.click();
          await page.waitForTimeout(2000);
          results.cartModalOpened = true;

          console.log('Step 15: Take snapshot of cart modal/view');
          await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/05-cart-opened.png', fullPage: true });

          console.log('Step 16: Check for Continue to Checkout button');
          const checkoutButton = await page.locator('button:has-text("Continue"), button:has-text("Checkout"), button:has-text("Proceed")').first();

          const checkoutVisible = await checkoutButton.isVisible({ timeout: 2000 }).catch(() => false);
          if (checkoutVisible) {
            console.log('✓ Continue to Checkout button found');
            results.checkoutButtonVisible = true;
          } else {
            console.log('✗ Continue to Checkout button NOT found');
            results.checkoutButtonVisible = false;
          }
        }
      } else {
        console.log('✓ Cart button found in header');

        console.log('Step 14: Click cart button');
        await headerCartButton.click();
        await page.waitForTimeout(2000);
        results.cartModalOpened = true;

        console.log('Step 15: Take snapshot of cart modal/view');
        await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/05-cart-opened.png', fullPage: true });

        console.log('Step 16: Check for Continue to Checkout button');
        const checkoutButton = await page.locator('button:has-text("Continue"), button:has-text("Checkout"), button:has-text("Proceed")').first();

        const checkoutVisible = await checkoutButton.isVisible({ timeout: 2000 }).catch(() => false);
        if (checkoutVisible) {
          console.log('✓ Continue to Checkout button found');
          results.checkoutButtonVisible = true;
        } else {
          console.log('✗ Continue to Checkout button NOT found');
          results.checkoutButtonVisible = false;
        }
      }

      if (!cartButtonVisible) {
        console.log('✗ Cart button NOT found');
        // Take screenshot of current state
        await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/05-no-cart-button.png', fullPage: true });
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

  console.log('\n=== TEST RESULTS ===');
  console.log(`Rooms loaded successfully: ${results.roomsLoaded ? 'YES' : 'NO'}`);
  console.log(`ADD ROOM TO CART button worked: ${results.addToCartWorked ? 'YES' : 'NO'}`);
  console.log(`Cart modal opened: ${results.cartModalOpened ? 'YES' : 'NO'}`);
  console.log(`Continue to Checkout button visible: ${results.checkoutButtonVisible ? 'YES' : 'NO'}`);
  if (results.errors.length > 0) {
    console.log(`Errors encountered: ${results.errors.join(', ')}`);
  }
  console.log('\nScreenshots saved to: /Users/davidgardiner/Desktop/repo/schiehallion/screenshots/');

  await page.waitForTimeout(3000);
  await browser.close();
})();
