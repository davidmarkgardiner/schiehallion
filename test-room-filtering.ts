import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

async function testRoomFiltering() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigating to booking page...');
    await page.goto('https://schiehallion.vercel.app/booking', {
      timeout: 60000,
      waitUntil: 'domcontentloaded'
    });

    console.log('Step 2: Waiting for page to load...');
    await page.waitForTimeout(5000);

    // Take initial screenshot
    const screenshotsDir = '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots';
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    await page.screenshot({
      path: path.join(screenshotsDir, '01-initial-page.png'),
      fullPage: true
    });
    console.log('Screenshot saved: 01-initial-page.png');

    // Log page title and URL
    console.log('Page URL:', page.url());
    console.log('Page title:', await page.title());

    console.log('Step 3: Looking for date inputs...');

    // Try to find date inputs
    const dateInputs = await page.locator('input[type="date"]').count();
    console.log(`Found ${dateInputs} date input(s)`);

    if (dateInputs >= 2) {
      console.log('Selecting check-in date (2025-10-05)...');
      const checkInInput = page.locator('input[type="date"]').first();
      await checkInInput.click({ timeout: 5000 });
      await checkInInput.fill('2025-10-05');

      await page.waitForTimeout(1000);

      await page.screenshot({
        path: path.join(screenshotsDir, '02-after-checkin-date.png'),
        fullPage: true
      });
      console.log('Screenshot saved: 02-after-checkin-date.png');

      console.log('Selecting check-out date (2025-10-07)...');
      const checkOutInput = page.locator('input[type="date"]').nth(1);
      await checkOutInput.click({ timeout: 5000 });
      await checkOutInput.fill('2025-10-07');

      await page.waitForTimeout(1000);

      await page.screenshot({
        path: path.join(screenshotsDir, '03-after-checkout-date.png'),
        fullPage: true
      });
      console.log('Screenshot saved: 03-after-checkout-date.png');

      console.log('Waiting for room list to update...');
      await page.waitForTimeout(4000);

      await page.screenshot({
        path: path.join(screenshotsDir, '04-after-filter-applied.png'),
        fullPage: true
      });
      console.log('Screenshot saved: 04-after-filter-applied.png');
    } else {
      console.log('Date inputs not found, checking page structure...');
      const bodyText = await page.locator('body').textContent();
      console.log('Page content preview:', bodyText?.substring(0, 500));
    }

    console.log('\nStep 6: Analyzing room cards...');

    // Get all text content
    const bodyContent = await page.textContent('body');

    // Check for room numbers
    const room102Match = bodyContent?.match(/102/g);
    const room101Match = bodyContent?.match(/101/g);
    const room103Match = bodyContent?.match(/103/g);

    console.log(`Occurrences of "102": ${room102Match?.length || 0}`);
    console.log(`Occurrences of "101": ${room101Match?.length || 0}`);
    console.log(`Occurrences of "103": ${room103Match?.length || 0}`);

    // Check for room types
    const deluxeCount = (bodyContent?.toLowerCase().match(/deluxe/g) || []).length;
    const standardCount = (bodyContent?.toLowerCase().match(/standard/g) || []).length;
    const suiteCount = (bodyContent?.toLowerCase().match(/suite/g) || []).length;

    console.log(`Occurrences of "deluxe": ${deluxeCount}`);
    console.log(`Occurrences of "standard": ${standardCount}`);
    console.log(`Occurrences of "suite": ${suiteCount}`);

    // Try different selectors for room cards
    const selectors = [
      'article',
      '[data-testid*="room"]',
      '[class*="room"]',
      '.card',
      'div[class*="card"]'
    ];

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`\nFound ${count} elements with selector: "${selector}"`);
        const first = await page.locator(selector).first().textContent();
        console.log('First element text preview:', first?.substring(0, 150));
      }
    }

    console.log('\n=== TEST COMPLETE ===');

  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/screenshots/error-state.png',
      fullPage: true
    });
  } finally {
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testRoomFiltering().catch(console.error);
