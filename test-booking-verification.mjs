import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Starting booking flow verification...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[Browser ${type.toUpperCase()}]:`, msg.text());
    }
  });

  try {
    // Step 1: Navigate to booking page
    console.log('Step 1: Navigating to http://localhost:3000/booking');
    await page.goto('http://localhost:3000/booking', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Step 2: Wait 8 seconds for page to fully load
    console.log('Step 2: Waiting 8 seconds for page to fully load...');
    await page.waitForTimeout(8000);

    // Step 3: Take initial snapshot
    console.log('Step 3: Taking initial snapshot...');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/01-booking-initial-state.png', fullPage: true });
    console.log('✅ Screenshot saved: 01-booking-initial-state.png\n');

    // Check page state
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    // Check if we need to login first
    const loginButton = await page.locator('button:has-text("Login"), button:has-text("Sign in"), a:has-text("Login")').first();
    const isLoginButtonVisible = await loginButton.isVisible().catch(() => false);

    if (isLoginButtonVisible) {
      console.log('⚠️ Login required, page showing login prompt');
      console.log('Attempting to continue as guest or navigate to booking...');
    }

    // Step 4: Fill in the booking form
    console.log('\nStep 4: Filling in booking form...');

    // Try to find date inputs
    await page.waitForTimeout(2000);
    const dateInputs = await page.locator('input[type="date"]').all();
    console.log(`Found ${dateInputs.length} date inputs`);

    if (dateInputs.length >= 2) {
      // Check-in date
      await dateInputs[0].fill('2025-10-15');
      console.log('✅ Check-in date set to 2025-10-15');

      // Check-out date
      await dateInputs[1].fill('2025-10-17');
      console.log('✅ Check-out date set to 2025-10-17');
    } else {
      console.log('❌ Date inputs not found or insufficient');
    }

    // Guests
    const numberInputs = await page.locator('input[type="number"]').all();
    console.log(`Found ${numberInputs.length} number inputs`);

    if (numberInputs.length > 0) {
      await numberInputs[0].fill('2');
      console.log('✅ Guests set to 2');
    } else {
      console.log('❌ Guests input not found');
    }

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/02-form-filled.png', fullPage: true });
    console.log('✅ Screenshot saved: 02-form-filled.png\n');

    // Step 5: Select a package
    console.log('\nStep 5: Selecting package...');
    await page.waitForTimeout(2000);

    // Look for package buttons - try multiple patterns
    const packagePatterns = [
      'Bed & Breakfast',
      'Half Board',
      'Full Board',
      'Room Only',
      'Breakfast'
    ];

    let packageSelected = false;
    for (const pattern of packagePatterns) {
      try {
        const btn = page.locator(`button:has-text("${pattern}")`).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          await btn.click();
          console.log(`✅ Selected package: ${pattern}`);
          packageSelected = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Try next pattern
      }
    }

    if (!packageSelected) {
      console.log('⚠️ No package buttons found, might be auto-selected or different UI');
    }

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/03-package-selected.png', fullPage: true });
    console.log('✅ Screenshot saved: 03-package-selected.png\n');

    // Step 6: Select a room
    console.log('\nStep 6: Looking for rooms...');
    await page.waitForTimeout(3000);

    // Look for room elements - be more flexible
    const roomPatterns = [
      'Standard Room',
      'Deluxe Room',
      'Suite',
      'Room'
    ];

    let roomSelected = false;
    for (const pattern of roomPatterns) {
      try {
        // Try as button first
        const btn = page.locator(`button:has-text("${pattern}")`).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          await btn.click();
          console.log(`✅ Clicked room: ${pattern}`);
          roomSelected = true;
          await page.waitForTimeout(2000);
          break;
        }
      } catch (e) {
        // Try as clickable div/card
        try {
          const card = page.locator(`[class*="room"]:has-text("${pattern}")`).first();
          if (await card.isVisible({ timeout: 2000 })) {
            await card.click();
            console.log(`✅ Clicked room card: ${pattern}`);
            roomSelected = true;
            await page.waitForTimeout(2000);
            break;
          }
        } catch (e2) {
          // Continue
        }
      }
    }

    if (!roomSelected) {
      console.log('⚠️ No specific room found, trying generic selector...');
      try {
        const anyRoomCard = page.locator('[class*="room-card"], [class*="RoomCard"], [data-room]').first();
        if (await anyRoomCard.isVisible({ timeout: 2000 })) {
          await anyRoomCard.click();
          console.log('✅ Clicked on first available room card');
          roomSelected = true;
          await page.waitForTimeout(2000);
        }
      } catch (e) {
        console.log('❌ Could not find any room elements to click');
      }
    }

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/04-room-selected.png', fullPage: true });
    console.log('✅ Screenshot saved: 04-room-selected.png\n');

    // Step 7: Look for and click "ADD ROOM TO CART" button
    console.log('\nStep 7: Looking for "ADD ROOM TO CART" button...');
    await page.waitForTimeout(2000);

    // Try various selectors for the add to cart button
    const addToCartSelectors = [
      'button:has-text("ADD ROOM TO CART")',
      'button:has-text("Add to Cart")',
      'button:has-text("Add Room")',
      'button:has-text("ADD TO CART")',
      'button[class*="cart"]',
      '[class*="sidebar"] button:has-text("Add")',
      'button:has-text("Add")'
    ];

    let addToCartButton = null;
    let buttonText = '';

    for (const selector of addToCartSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          addToCartButton = btn;
          buttonText = await btn.textContent();
          console.log(`✅ Found button with text: "${buttonText.trim()}"`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!addToCartButton) {
      console.log('⚠️ Specific add to cart button not found, listing all buttons...');

      // List all buttons on the page for debugging
      const allButtons = await page.locator('button').all();
      console.log(`\nAll buttons on page (${allButtons.length} total):`);
      for (let i = 0; i < Math.min(allButtons.length, 30); i++) {
        try {
          const text = await allButtons[i].textContent();
          const isVisible = await allButtons[i].isVisible();
          if (isVisible) {
            console.log(`  - Button ${i + 1}: "${text.trim()}"`);
          }
        } catch (e) {
          // Skip
        }
      }
    }

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/05-before-add-to-cart.png', fullPage: true });
    console.log('✅ Screenshot saved: 05-before-add-to-cart.png\n');

    if (addToCartButton) {
      console.log('Clicking add to cart button...');
      await addToCartButton.click();
      console.log('✅ Clicked "ADD TO CART" button');

      // Step 8: Wait 3 seconds
      console.log('\nStep 8: Waiting 3 seconds after clicking...');
      await page.waitForTimeout(3000);
    } else {
      console.log('❌ Could not click add to cart button - not found');
    }

    // Step 9: Take snapshot of result
    console.log('\nStep 9: Taking snapshot after add to cart attempt...');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/06-after-add-to-cart.png', fullPage: true });
    console.log('✅ Screenshot saved: 06-after-add-to-cart.png\n');

    // Step 10: Check for error/success messages
    console.log('\nStep 10: Checking for messages and cart elements...');

    // Check for error messages - more comprehensive
    const errorSelectors = [
      '[class*="error"]',
      '[class*="Error"]',
      '[class*="alert-error"]',
      '[role="alert"]',
      'div[style*="red"]',
      'div[style*="pink"]'
    ];

    let errorCount = 0;
    for (const selector of errorSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const el of elements) {
          const isVisible = await el.isVisible();
          if (isVisible) {
            const text = await el.textContent();
            if (text && text.trim().length > 0) {
              console.log(`  ❌ Error message: ${text.trim()}`);
              errorCount++;
            }
          }
        }
      } catch (e) {
        // Continue
      }
    }
    console.log(`Total error messages found: ${errorCount}`);

    // Check for success messages
    const successSelectors = [
      '[class*="success"]',
      '[class*="Success"]',
      'div[style*="green"]'
    ];

    let successCount = 0;
    for (const selector of successSelectors) {
      try {
        const elements = await page.locator(selector).all();
        for (const el of elements) {
          const isVisible = await el.isVisible();
          if (isVisible) {
            const text = await el.textContent();
            if (text && text.trim().length > 0) {
              console.log(`  ✅ Success message: ${text.trim()}`);
              successCount++;
            }
          }
        }
      } catch (e) {
        // Continue
      }
    }
    console.log(`Total success messages found: ${successCount}`);

    // Check for cart icon/button
    const cartSelectors = [
      '[class*="cart-icon"]',
      '[class*="shopping-cart"]',
      '[class*="ShoppingCart"]',
      'button:has-text("Cart")',
      'button:has-text("cart")',
      '[aria-label*="cart"]',
      'svg[class*="cart"]',
      '[data-cart]'
    ];

    let cartElement = null;
    let cartFound = false;

    for (const selector of cartSelectors) {
      try {
        const el = page.locator(selector).first();
        if (await el.isVisible({ timeout: 1000 })) {
          cartElement = el;
          cartFound = true;
          console.log(`✅ Cart element found with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!cartFound) {
      console.log('⚠️ No cart icon/button found');
    }

    // Check if cart modal is open
    const modalSelectors = [
      '[class*="modal"]',
      '[class*="Modal"]',
      '[class*="cart-modal"]',
      '[role="dialog"]',
      '[class*="drawer"]',
      '[class*="Drawer"]'
    ];

    let isModalVisible = false;
    let modalElement = null;

    for (const selector of modalSelectors) {
      try {
        const el = page.locator(selector).first();
        if (await el.isVisible({ timeout: 1000 })) {
          isModalVisible = true;
          modalElement = el;
          console.log(`✅ Modal/drawer found with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    console.log(`Cart modal/drawer visible: ${isModalVisible}`);

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/07-cart-state.png', fullPage: true });
    console.log('✅ Screenshot saved: 07-cart-state.png\n');

    // Step 11: Try to open cart if not already open
    if (!isModalVisible && cartElement) {
      console.log('\nStep 11: Clicking cart button/icon to open cart...');
      await cartElement.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/08-cart-opened.png', fullPage: true });
      console.log('✅ Screenshot saved: 08-cart-opened.png\n');

      // Check if modal opened after click
      for (const selector of modalSelectors) {
        try {
          const el = page.locator(selector).first();
          if (await el.isVisible({ timeout: 1000 })) {
            isModalVisible = true;
            console.log('✅ Cart modal opened successfully');
            break;
          }
        } catch (e) {
          // Continue
        }
      }
    } else if (isModalVisible) {
      console.log('\nStep 11: Cart modal already open');
    } else {
      console.log('\nStep 11: No cart element to click');
    }

    // Step 12: Take snapshot of cart
    console.log('\nStep 12: Taking cart snapshot...');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/09-cart-detail.png', fullPage: true });
    console.log('✅ Screenshot saved: 09-cart-detail.png\n');

    // Step 13: Look for checkout button
    console.log('\nStep 13: Looking for checkout button...');

    const checkoutSelectors = [
      'button:has-text("Continue to Checkout")',
      'button:has-text("CONTINUE TO CHECKOUT")',
      'button:has-text("Checkout")',
      'button:has-text("Proceed to Checkout")',
      'button:has-text("checkout")',
      'a:has-text("Checkout")',
      'a:has-text("Continue to Checkout")'
    ];

    let checkoutButton = null;
    let checkoutButtonText = null;

    for (const selector of checkoutSelectors) {
      try {
        const btn = page.locator(selector).first();
        if (await btn.isVisible({ timeout: 2000 })) {
          checkoutButton = btn;
          checkoutButtonText = await btn.textContent();
          console.log(`✅ Checkout button found: "${checkoutButtonText.trim()}"`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    if (!checkoutButton) {
      console.log('⚠️ Checkout button not found with specific selectors');

      // List all visible buttons for debugging
      console.log('\nAll visible buttons on page:');
      const allButtons = await page.locator('button, a[role="button"]').all();
      let visibleCount = 0;
      for (let i = 0; i < allButtons.length; i++) {
        try {
          const isVisible = await allButtons[i].isVisible();
          if (isVisible) {
            const text = await allButtons[i].textContent();
            console.log(`  - "${text.trim()}"`);
            visibleCount++;
          }
        } catch (e) {
          // Skip
        }
      }
      console.log(`Total visible buttons: ${visibleCount}`);
    }

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/10-final-state.png', fullPage: true });
    console.log('✅ Screenshot saved: 10-final-state.png\n');

    // Step 14: Final report
    console.log('\n' + '='.repeat(80));
    console.log('FINAL REPORT - BOOKING FLOW VERIFICATION');
    console.log('='.repeat(80));
    console.log(`1. Did adding to cart work without errors? ${errorCount === 0 ? 'YES ✅' : `NO ❌ (${errorCount} errors found)`}`);
    console.log(`2. Is the cart visible? ${cartFound || isModalVisible ? 'YES ✅' : 'NO ❌'}`);
    console.log(`3. Is the checkout button visible? ${checkoutButton !== null ? 'YES ✅' : 'NO ❌'}`);
    console.log(`4. Checkout button text: ${checkoutButtonText ? `"${checkoutButtonText.trim()}"` : 'N/A'}`);
    console.log('\nAdditional findings:');
    console.log(`   - Success messages: ${successCount}`);
    console.log(`   - Cart modal opened: ${isModalVisible ? 'YES' : 'NO'}`);
    console.log(`   - Add to cart button found: ${addToCartButton !== null ? 'YES' : 'NO'}`);
    console.log(`   - Room selection successful: ${roomSelected ? 'YES' : 'UNCERTAIN'}`);
    console.log('='.repeat(80));

    console.log('\n✅ Test completed! Check the screenshots folder for visual evidence.');
    console.log('Screenshots saved in: /Users/davidgardiner/Desktop/repo/schiehallion/screenshots/\n');

    // Keep browser open for 5 seconds so we can see final state
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    try {
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/error-state.png', fullPage: true });
      console.log('Error screenshot saved');
    } catch (e) {
      console.log('Could not save error screenshot');
    }
  } finally {
    await browser.close();
  }
})();
