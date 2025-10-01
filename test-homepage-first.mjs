import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Listen for network failures
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push(`${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('=== HOMEPAGE TEST ===\n');
  console.log('Step 1: Navigating to http://localhost:3000...');

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Homepage loaded successfully\n');
  } catch (error) {
    console.log(`Homepage load error: ${error.message}\n`);
  }

  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/homepage-test.png', fullPage: true });
  console.log('Screenshot saved: /tmp/homepage-test.png\n');

  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);

  const allButtons = await page.locator('button').all();
  console.log(`Total buttons on homepage: ${allButtons.length}\n`);

  console.log('Network failures on homepage:');
  if (networkErrors.length > 0) {
    console.log(`  ${networkErrors.length} failures detected`);
    networkErrors.slice(0, 5).forEach(err => console.log(`  ${err}`));
  } else {
    console.log('  None - homepage loads correctly');
  }
  console.log();

  // Now try navigating to booking from homepage
  console.log('=== NAVIGATING TO BOOKING PAGE ===\n');

  // Clear network errors
  networkErrors.length = 0;

  console.log('Step 2: Looking for link to booking page...');
  const bookingLinks = await page.locator('a[href="/booking"], a[href*="booking"]').all();
  console.log(`Found ${bookingLinks.length} booking-related links\n`);

  if (bookingLinks.length > 0) {
    console.log('Step 3: Clicking first booking link...');
    await bookingLinks[0].click();
    await page.waitForTimeout(5000);
  } else {
    console.log('Step 3: No booking link found, navigating directly...');
    await page.goto('http://localhost:3000/booking', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: '/tmp/booking-from-homepage.png', fullPage: true });
  console.log('Screenshot saved: /tmp/booking-from-homepage.png\n');

  const bookingPageTitle = await page.title();
  console.log(`Booking page title: ${bookingPageTitle}`);

  const bookingButtons = await page.locator('button').all();
  console.log(`Total buttons on booking page: ${bookingButtons.length}`);

  if (bookingButtons.length > 0) {
    console.log('Button texts on booking page:');
    for (let i = 0; i < Math.min(bookingButtons.length, 10); i++) {
      const text = await bookingButtons[i].textContent();
      const isVisible = await bookingButtons[i].isVisible();
      console.log(`  ${i + 1}. "${text?.trim()}" (visible: ${isVisible})`);
    }
  }
  console.log();

  console.log('Network failures on booking page:');
  if (networkErrors.length > 0) {
    console.log(`  ${networkErrors.length} failures detected`);
    networkErrors.slice(0, 5).forEach(err => console.log(`  ${err}`));
  } else {
    console.log('  None - booking page loads correctly');
  }
  console.log();

  console.log('Test completed. Browser will stay open for 5 seconds...');
  await page.waitForTimeout(5000);

  await browser.close();
})();
