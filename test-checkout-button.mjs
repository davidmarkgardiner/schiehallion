import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('=== CHECKOUT BUTTON VERIFICATION TEST ===\n');

  // Listen for errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Step 1: Navigate to booking page
  console.log('Step 1: Navigating to booking page...');
  await page.goto('http://localhost:3000/booking', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Step 2: Set dates
  console.log('Step 2: Setting dates...');
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + 3);
  const checkOutDate = new Date();
  checkOutDate.setDate(checkOutDate.getDate() + 5);

  await page.locator('input[type="date"]').first().fill(checkInDate.toISOString().split('T')[0]);
  await page.locator('input[type="date"]').nth(1).fill(checkOutDate.toISOString().split('T')[0]);
  await page.waitForTimeout(1000);

  // Step 3: Take screenshot of booking page
  await page.screenshot({ path: '/tmp/checkout-test-01-booking-page.png', fullPage: true });
  console.log('Screenshot: /tmp/checkout-test-01-booking-page.png\n');

  // Step 4: Look for "Add Room to Cart" button
  console.log('Step 3: Looking for Add Room to Cart button...');
  const addToCartButton = page.locator('button:has-text("Add Room to Cart"), button:has-text("ADD ROOM TO CART")');
  const addButtonExists = await addToCartButton.count() > 0;
  console.log(`Add Room to Cart button found: ${addButtonExists}`);

  if (addButtonExists) {
    const buttonText = await addToCartButton.first().textContent();
    const isVisible = await addToCartButton.first().isVisible();
    const isEnabled = await addToCartButton.first().isEnabled();
    console.log(`  Text: "${buttonText}"`);
    console.log(`  Visible: ${isVisible}`);
    console.log(`  Enabled: ${isEnabled}\n`);

    // Step 5: Click the button
    console.log('Step 4: Clicking Add Room to Cart button...');
    await addToCartButton.first().click();
    await page.waitForTimeout(3000);

    await page.screenshot({ path: '/tmp/checkout-test-02-after-add-to-cart.png', fullPage: true });
    console.log('Screenshot: /tmp/checkout-test-02-after-add-to-cart.png\n');

    // Step 6: Look for error messages
    console.log('Step 5: Checking for error messages...');
    const errorMessage = await page.locator('text=Missing or insufficient permissions, text=error, [class*="error"]').first().textContent().catch(() => null);
    if (errorMessage) {
      console.log(`  Error displayed: "${errorMessage}"\n`);
    } else {
      console.log('  No error message visible\n');
    }

    // Step 7: Look for cart modal or cart indicator
    console.log('Step 6: Looking for cart modal or indicator...');
    const cartModal = page.locator('[role="dialog"], [class*="modal"], [class*="cart"]');
    const modalCount = await cartModal.count();
    console.log(`  Cart modals/dialogs found: ${modalCount}\n`);

    // Step 8: Look for checkout button anywhere on the page
    console.log('Step 7: Looking for checkout/continue buttons...');
    const checkoutPatterns = [
      'Checkout',
      'Proceed to Checkout',
      'Continue',
      'Next',
      'Book Now',
      'Confirm Booking',
      'Complete Booking'
    ];

    for (const pattern of checkoutPatterns) {
      const buttons = page.locator(`button:has-text("${pattern}"), a:has-text("${pattern}")`);
      const count = await buttons.count();
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const text = await buttons.nth(i).textContent();
          const isVisible = await buttons.nth(i).isVisible();
          console.log(`  Found "${pattern}" button: "${text}" (visible: ${isVisible})`);
        }
      }
    }
    console.log();

    // Step 9: Check all visible buttons on the page
    console.log('Step 8: All visible buttons on page:');
    const allButtons = page.locator('button:visible');
    const buttonCount = await allButtons.count();
    console.log(`  Total visible buttons: ${buttonCount}`);
    for (let i = 0; i < Math.min(buttonCount, 15); i++) {
      const text = await allButtons.nth(i).textContent();
      console.log(`    ${i + 1}. "${text?.trim()}"`);
    }
    console.log();

    // Step 10: Look for cart icon with badge
    console.log('Step 9: Looking for cart icon with item count...');
    const cartIcon = page.locator('[data-testid="cart"], [aria-label*="cart"], svg + [class*="badge"]');
    const cartIconCount = await cartIcon.count();
    if (cartIconCount > 0) {
      console.log(`  Cart icon found: ${cartIconCount}`);
      const cartText = await cartIcon.first().textContent().catch(() => '');
      console.log(`  Cart text/badge: "${cartText}"`);
    } else {
      console.log('  No cart icon found');
    }
    console.log();
  }

  // Step 11: Report errors
  console.log('Step 10: Console errors encountered:');
  if (errors.length > 0) {
    const uniqueErrors = [...new Set(errors)];
    uniqueErrors.slice(0, 5).forEach((err, idx) => {
      console.log(`  ${idx + 1}. ${err.substring(0, 100)}`);
    });
  } else {
    console.log('  None');
  }
  console.log();

  console.log('=== TEST COMPLETE ===');
  console.log('Browser will close in 5 seconds...');
  await page.waitForTimeout(5000);

  await browser.close();
})();
