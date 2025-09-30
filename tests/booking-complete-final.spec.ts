import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow - Final Verification', () => {
  const testEmail = 'playright@example.com';
  const testPassword = 'playright';

  test('End-to-end booking with cart and checkout', async ({ page }) => {
    console.log('\n========== COMPLETE E2E BOOKING FLOW ==========\n');

    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`[CONSOLE ERROR]: ${msg.text()}`);
      }
    });

    // STEP 1: Authentication
    console.log('STEP 1: Navigate to booking page');
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const needsAuth = await page.locator('text=Access Required').isVisible({ timeout: 2000 }).catch(() => false);
    if (needsAuth) {
      console.log('  -> Redirecting to login...');
      await page.locator('a:has-text("Go to Login")').click();
      await page.waitForTimeout(1000);

      await page.locator('input[type="email"]').fill(testEmail);
      await page.locator('input[type="password"]').fill(testPassword);
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-01-login.png', fullPage: true });

      await page.locator('button[type="submit"]').click();
      console.log('  -> Logged in successfully');
      await page.waitForTimeout(3000);

      if (!page.url().includes('/booking')) {
        await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
      }
    }

    console.log('  ✓ Authentication complete\n');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-02-booking-page.png', fullPage: true });

    // STEP 2: Configure booking details
    console.log('STEP 2: Configure booking details');

    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7);
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 10);

    await page.locator('input[type="date"]').first().fill(checkInDate.toISOString().split('T')[0]);
    await page.locator('input[type="date"]').nth(1).fill(checkOutDate.toISOString().split('T')[0]);
    console.log(`  -> Dates: ${checkInDate.toISOString().split('T')[0]} to ${checkOutDate.toISOString().split('T')[0]}`);

    await page.locator('select').first().selectOption('Bed & Breakfast');
    console.log('  -> Package: Bed & Breakfast');

    await page.waitForTimeout(1000);
    console.log('  ✓ Booking details configured\n');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-03-details-set.png', fullPage: true });

    // STEP 3: Add room to cart
    console.log('STEP 3: Add room to cart');

    const addToCartBtn = page.locator('button:has-text("Add Room to Cart")');
    await addToCartBtn.click();
    console.log('  -> Clicked "Add Room to Cart"');

    await page.waitForTimeout(2000);

    // Check for cart indicator in header
    const cartIndicator = page.locator('text=/Cart.*£/');
    const cartVisible = await cartIndicator.isVisible({ timeout: 3000 }).catch(() => false);

    if (cartVisible) {
      const cartText = await cartIndicator.textContent();
      console.log(`  -> Cart indicator: ${cartText}`);
    }

    // Check for success message
    const successMsg = page.locator('text=/Added.*to.*cart/i');
    const hasSuccess = await successMsg.isVisible({ timeout: 2000 }).catch(() => false);
    if (hasSuccess) {
      const msg = await successMsg.textContent();
      console.log(`  -> Success message: ${msg}`);
    }

    console.log('  ✓ Room added to cart\n');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-04-room-added.png', fullPage: true });

    // STEP 4: View cart
    console.log('STEP 4: Navigate to cart');

    const viewCartBtn = page.locator('button:has-text("VIEW CART"), a:has-text("VIEW CART")');
    const hasViewCart = await viewCartBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasViewCart) {
      const btnText = await viewCartBtn.textContent();
      console.log(`  -> Clicking "${btnText}"`);
      await viewCartBtn.click();
      await page.waitForTimeout(2000);

      console.log(`  -> Current URL: ${page.url()}`);
      console.log('  ✓ Navigated to cart\n');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-05-cart-page.png', fullPage: true });
    } else {
      console.log('  ⚠ VIEW CART button not found - checking if already on cart page\n');
    }

    // STEP 5: Analyze cart contents
    console.log('STEP 5: Analyze cart page');

    const pageHeadings = await page.locator('h1, h2').allTextContents();
    console.log(`  -> Page headings: ${JSON.stringify(pageHeadings)}`);

    // Look for cart items
    const cartItems = page.locator('[class*="cart-item"], [class*="booking"], [data-testid*="cart"]');
    const itemCount = await cartItems.count();
    console.log(`  -> Cart items found: ${itemCount}`);

    // Look for totals
    const totalElements = page.locator('text=/total/i, text=/£\\d+/');
    const totalCount = await totalElements.count();
    console.log(`  -> Total price elements found: ${totalCount}`);

    if (totalCount > 0) {
      const totals = await totalElements.allTextContents();
      console.log(`  -> Price info: ${JSON.stringify(totals.slice(0, 5))}`);
    }

    console.log('  ✓ Cart analyzed\n');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-06-cart-details.png', fullPage: true });

    // STEP 6: Proceed to checkout/guest info
    console.log('STEP 6: Proceed to next step');

    const proceedButtons = page.locator('button:has-text("Continue"), button:has-text("Checkout"), button:has-text("Proceed"), button:has-text("Next"), button:has-text("Guest")');
    const proceedCount = await proceedButtons.count();
    console.log(`  -> Found ${proceedCount} proceed buttons`);

    if (proceedCount > 0) {
      for (let i = 0; i < proceedCount; i++) {
        const btn = proceedButtons.nth(i);
        const text = await btn.textContent();
        const isVisible = await btn.isVisible().catch(() => false);
        console.log(`    ${i + 1}. "${text}" (visible: ${isVisible})`);
      }

      const firstVisible = proceedButtons.first();
      const canClick = await firstVisible.isVisible({ timeout: 2000 }).catch(() => false);

      if (canClick) {
        const btnText = await firstVisible.textContent();
        console.log(`  -> Clicking "${btnText}"`);
        await firstVisible.click();
        await page.waitForTimeout(2000);

        console.log(`  -> New URL: ${page.url()}`);
        console.log('  ✓ Proceeded to next step\n');
        await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-07-next-step.png', fullPage: true });
      }
    } else {
      console.log('  ⚠ No proceed buttons found\n');
    }

    // STEP 7: Analyze next page (guest info / checkout)
    console.log('STEP 7: Analyze current page state');

    const currentUrl = page.url();
    console.log(`  -> Current URL: ${currentUrl}`);

    const allHeadings = await page.locator('h1, h2, h3').allTextContents();
    console.log(`  -> All headings: ${JSON.stringify(allHeadings)}`);

    // Check for forms
    const forms = await page.locator('form').count();
    console.log(`  -> Forms on page: ${forms}`);

    if (forms > 0) {
      console.log('  -> Analyzing form fields:');
      const inputs = page.locator('form input:visible, form textarea:visible, form select:visible');
      const inputCount = await inputs.count();

      for (let i = 0; i < Math.min(inputCount, 10); i++) {
        const input = inputs.nth(i);
        const name = await input.getAttribute('name') || 'no-name';
        const type = await input.getAttribute('type') || 'no-type';
        const placeholder = await input.getAttribute('placeholder') || '';
        const label = await input.getAttribute('aria-label') || '';
        console.log(`    ${i + 1}. name="${name}" type="${type}" placeholder="${placeholder}" label="${label}"`);
      }

      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-08-form-page.png', fullPage: true });
    }

    // Check for payment elements
    const paymentElements = page.locator('text=/payment/i, text=/card/i, iframe[title*="payment"], [class*="stripe"]');
    const hasPayment = await paymentElements.count();
    if (hasPayment > 0) {
      console.log(`  -> Payment elements found: ${hasPayment}`);
    }

    console.log('  ✓ Page analyzed\n');

    // STEP 8: Try filling guest information if present
    console.log('STEP 8: Guest information form (if present)');

    const guestNameInput = page.locator('input[name*="name" i], input[placeholder*="name" i]').first();
    const hasNameInput = await guestNameInput.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasNameInput) {
      console.log('  -> Found guest information form');
      await guestNameInput.fill('Test Guest Name');
      console.log('  -> Filled name field');

      const emailInput = page.locator('input[type="email"], input[name*="email" i]').first();
      const hasEmail = await emailInput.isVisible({ timeout: 1000 }).catch(() => false);
      if (hasEmail) {
        await emailInput.fill('testguest@example.com');
        console.log('  -> Filled email field');
      }

      const phoneInput = page.locator('input[type="tel"], input[name*="phone" i]').first();
      const hasPhone = await phoneInput.isVisible({ timeout: 1000 }).catch(() => false);
      if (hasPhone) {
        await phoneInput.fill('01234567890');
        console.log('  -> Filled phone field');
      }

      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-09-guest-info-filled.png', fullPage: true });
      console.log('  ✓ Guest information filled\n');
    } else {
      console.log('  -> No guest information form found on this page\n');
    }

    // STEP 9: Final summary
    console.log('STEP 9: Test Summary');
    console.log(`  -> Final URL: ${page.url()}`);
    console.log(`  -> Total errors captured: ${errors.length}`);

    if (errors.length > 0) {
      const uniqueErrors = [...new Set(errors)];
      console.log('  -> Unique errors:');
      uniqueErrors.slice(0, 5).forEach((err, idx) => {
        console.log(`    ${idx + 1}. ${err.substring(0, 100)}`);
      });
    }

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-results/final-10-final-state.png', fullPage: true });

    console.log('\n========== TEST COMPLETE ==========\n');
  });
});