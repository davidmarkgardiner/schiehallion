import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Listen for console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  // Listen for page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.toString());
  });

  // Listen for network failures
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('=== BOOKING PAGE TEST ===\n');
  console.log('Step 1: Navigating to http://localhost:3000/booking...');

  try {
    await page.goto('http://localhost:3000/booking', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Page loaded successfully\n');
  } catch (error) {
    console.log(`Page load error: ${error.message}\n`);
  }

  console.log('Step 2: Waiting for content to render (10 seconds)...');
  await page.waitForTimeout(10000);

  console.log('Step 3: Taking initial snapshot...');
  await page.screenshot({ path: '/tmp/booking-page-detailed.png', fullPage: true });
  console.log('Screenshot saved: /tmp/booking-page-detailed.png\n');

  console.log('Step 4: Analyzing page structure...');
  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);

  const bodyText = await page.locator('body').textContent();
  console.log(`Body text length: ${bodyText.length} characters`);
  console.log(`First 200 chars: ${bodyText.substring(0, 200).trim()}\n`);

  // Check for all buttons on the page
  const allButtons = await page.locator('button').all();
  console.log(`Total buttons found: ${allButtons.length}`);
  if (allButtons.length > 0) {
    console.log('Button texts:');
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const text = await allButtons[i].textContent();
      const isVisible = await allButtons[i].isVisible();
      console.log(`  ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
    }
  }
  console.log();

  // Check for room-related elements
  console.log('Step 5: Looking for room elements...');
  const roomElements = await page.locator('[class*="room" i], [id*="room" i]').count();
  console.log(`Elements with "room" in class/id: ${roomElements}`);

  const cardElements = await page.locator('[class*="card" i]').count();
  console.log(`Elements with "card" in class: ${cardElements}`);

  const priceElements = await page.locator('[class*="price" i], [class*="$" i]').count();
  console.log(`Elements with "price" in class: ${priceElements}\n`);

  // Check for cart elements
  console.log('Step 6: Looking for cart elements...');
  const cartElements = await page.locator('[class*="cart" i], [id*="cart" i], [aria-label*="cart" i]').all();
  console.log(`Cart-related elements: ${cartElements.length}`);
  if (cartElements.length > 0) {
    for (let i = 0; i < cartElements.length; i++) {
      const tagName = await cartElements[i].evaluate(el => el.tagName);
      const text = await cartElements[i].textContent();
      const isVisible = await cartElements[i].isVisible();
      console.log(`  ${i + 1}. ${tagName}: "${text?.trim()}" (visible: ${isVisible})`);
    }
  }
  console.log();

  // Check for specific button patterns
  console.log('Step 7: Looking for specific action buttons...');
  const patterns = [
    'Add to Cart',
    'Add',
    'Select',
    'Book',
    'Reserve',
    'Choose',
    'Cart',
    'Checkout',
    'Proceed'
  ];

  for (const pattern of patterns) {
    const count = await page.locator(`button:has-text("${pattern}")`).count();
    if (count > 0) {
      console.log(`  "${pattern}" buttons: ${count}`);
    }
  }
  console.log();

  // Report console messages
  console.log('Step 8: Console messages:');
  if (consoleMessages.length > 0) {
    consoleMessages.slice(0, 10).forEach(msg => console.log(`  ${msg}`));
    if (consoleMessages.length > 10) {
      console.log(`  ... and ${consoleMessages.length - 10} more`);
    }
  } else {
    console.log('  No console messages');
  }
  console.log();

  // Report page errors
  console.log('Step 9: Page errors:');
  if (pageErrors.length > 0) {
    pageErrors.forEach(err => console.log(`  ${err}`));
  } else {
    console.log('  No page errors');
  }
  console.log();

  // Report network errors
  console.log('Step 10: Network failures:');
  if (networkErrors.length > 0) {
    networkErrors.forEach(err => console.log(`  ${err}`));
  } else {
    console.log('  No network failures');
  }
  console.log();

  console.log('Test completed. Browser will stay open for 5 seconds...');
  await page.waitForTimeout(5000);

  await browser.close();
})();
