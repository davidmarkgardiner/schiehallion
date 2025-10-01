import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('Step 1: Navigating to booking page...');
  await page.goto('http://localhost:3000/booking');

  console.log('Step 2: Waiting for page to load (10 seconds)...');
  await page.waitForTimeout(10000);

  console.log('Step 3: Taking initial snapshot...');
  await page.screenshot({ path: '/tmp/booking-page-initial.png', fullPage: true });
  console.log('Screenshot saved: /tmp/booking-page-initial.png');

  console.log('Step 4: Looking for Add to Cart or room selection buttons...');
  const addToCartButtons = await page.locator('button:has-text("Add to Cart"), button:has-text("Select"), button:has-text("Book"), button:has-text("Add")').count();
  console.log(`Found ${addToCartButtons} potential room selection buttons`);

  if (addToCartButtons > 0) {
    console.log('Step 5: Clicking first Add to Cart/Select button...');
    await page.locator('button:has-text("Add to Cart"), button:has-text("Select"), button:has-text("Book"), button:has-text("Add")').first().click();
    await page.waitForTimeout(2000);
    console.log('Clicked button, waiting for response...');

    console.log('Step 6: Looking for cart button or indicator...');
    const cartButton = page.locator('[aria-label*="cart" i], button:has-text("Cart"), [class*="cart"]').first();
    const cartExists = await cartButton.count() > 0;
    console.log(`Cart button found: ${cartExists}`);

    if (cartExists) {
      console.log('Step 7: Clicking cart to open modal...');
      await cartButton.click();
      await page.waitForTimeout(2000);

      console.log('Step 8: Taking cart modal snapshot...');
      await page.screenshot({ path: '/tmp/booking-cart-modal.png', fullPage: true });
      console.log('Screenshot saved: /tmp/booking-cart-modal.png');

      console.log('Step 9: Looking for checkout/proceed button...');
      const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("Proceed"), button:has-text("Continue"), button:has-text("Book Now")');
      const checkoutExists = await checkoutButton.count() > 0;

      if (checkoutExists) {
        const buttonText = await checkoutButton.first().textContent();
        console.log(`✓ Checkout button found with text: "${buttonText}"`);
      } else {
        console.log('✗ No checkout button found in cart modal');
      }
    } else {
      console.log('✗ Cart button not found after adding item');
    }
  } else {
    console.log('✗ No Add to Cart or room selection buttons found');
  }

  console.log('\nTest completed. Browser will stay open for 5 seconds...');
  await page.waitForTimeout(5000);

  await browser.close();
})();
