import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://schiehallion.vercel.app';
const BYPASS_TOKEN = 'hEG6AqKmAM4VaPXi3yUjN8N58WaekIGU';

test.describe('Correct URL Testing', () => {

  test('Test with properly formatted URLs', async ({ page }) => {
    console.log('\n=== TESTING WITH CORRECT URL FORMAT ===\n');

    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test 1: Landing page
    console.log('1. Landing page...');
    await page.goto(`${PRODUCTION_URL}?x-vercel-protection-bypass=${BYPASS_TOKEN}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/final-01-landing.png',
      fullPage: true
    });
    console.log(`   URL: ${page.url()}`);
    console.log(`   ✓ Landing page loaded\n`);

    // Test 2: Rooms page with correct URL format
    console.log('2. Rooms page...');
    await page.goto(`${PRODUCTION_URL}/rooms?x-vercel-protection-bypass=${BYPASS_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(6000); // Wait for data load + timeout

    const roomsURL = page.url();
    console.log(`   URL: ${roomsURL}`);

    const hasRoomHeading = await page.locator('h1:has-text("Find Your Perfect Stay")').count() > 0;
    console.log(`   Has "Find Your Perfect Stay" heading: ${hasRoomHeading}`);

    const hasQuickSearch = await page.locator('text=/Quick Search/i').count() > 0;
    console.log(`   Has Quick Search: ${hasQuickSearch}`);

    const hasRoomList = await page.locator('text=/Available|Loading rooms/i').count() > 0;
    console.log(`   Has room list content: ${hasRoomList}`);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/final-02-rooms.png',
      fullPage: true
    });
    console.log(`   ✓ Rooms page loaded\n`);

    // Test 3: Booking page with correct URL format
    console.log('3. Booking page...');
    await page.goto(`${PRODUCTION_URL}/booking?x-vercel-protection-bypass=${BYPASS_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(6000); // Wait for data load + timeout

    const bookingURL = page.url();
    console.log(`   URL: ${bookingURL}`);

    const hasBookingContent = await page.locator('text=/room|guest|booking/i').count() > 0;
    console.log(`   Has booking content: ${hasBookingContent}`);

    const notStuckLoading = !(await page.locator('text=/Loading available rooms/i').isVisible().catch(() => false));
    console.log(`   Not stuck in loading: ${notStuckLoading}`);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/final-03-booking.png',
      fullPage: true
    });
    console.log(`   ✓ Booking page loaded\n`);

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`Total console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Errors:');
      consoleErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.substring(0, 100)}`);
      });
    }

    console.log('\n=== TEST COMPLETE ===\n');

    // Assertions
    expect(hasRoomHeading).toBe(true);
    expect(notStuckLoading).toBe(true);
  });
});
