import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://schiehallion.vercel.app';
const BYPASS_TOKEN = 'hEG6AqKmAM4VaPXi3yUjN8N58WaekIGU';

test.describe('Final Comprehensive Verification', () => {

  test('Complete site verification with network monitoring', async ({ page }) => {
    console.log('\n' + '='.repeat(70));
    console.log('SCHIEHALLION HOTEL - FINAL DEPLOYMENT VERIFICATION');
    console.log('='.repeat(70) + '\n');

    const consoleErrors: string[] = [];
    const failedRequests: { url: string; status: number; method: string }[] = [];

    // Monitor console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Monitor network
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });

    // TEST 1: Deployment Protection Bypass
    console.log('TEST 1: Deployment Protection Bypass');
    console.log('-'.repeat(70));

    const response = await page.goto(`${PRODUCTION_URL}?x-vercel-protection-bypass=${BYPASS_TOKEN}`, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    const bypassWorking = !page.url().includes('vercel.com/login') && response?.status() === 200;
    console.log(`✓ Bypass token configured: ${bypassWorking ? 'PASS' : 'FAIL'}`);
    console.log(`  - No auth redirect: ${!page.url().includes('vercel.com')}`);
    console.log(`  - Response status: ${response?.status()}\n`);

    // TEST 2: Landing Page
    console.log('TEST 2: Landing Page Performance');
    console.log('-'.repeat(70));

    const landingStart = Date.now();
    await page.goto(`${PRODUCTION_URL}?x-vercel-protection-bypass=${BYPASS_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');
    const landingTime = Date.now() - landingStart;

    const hasBranding = await page.locator('text=/Schiehallion/i').count() > 0;
    const hasNavigation = await page.locator('nav, header').count() > 0;

    console.log(`✓ Load time: ${landingTime}ms`);
    console.log(`✓ Has branding: ${hasBranding}`);
    console.log(`✓ Has navigation: ${hasNavigation}\n`);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/final-report-01-landing.png',
      fullPage: true
    });

    // TEST 3: Rooms Page with Timeout Protection
    console.log('TEST 3: /rooms Page (Timeout Protection)');
    console.log('-'.repeat(70));

    const roomsStart = Date.now();
    await page.goto(`${PRODUCTION_URL}/rooms?x-vercel-protection-bypass=${BYPASS_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');
    const roomsInitialLoad = Date.now() - roomsStart;

    console.log(`✓ Initial load: ${roomsInitialLoad}ms (threshold: 5000ms)`);

    // Wait for data to load or timeout
    await page.waitForTimeout(6000);
    const roomsTotalTime = Date.now() - roomsStart;

    const hasRoomHeading = await page.locator('h1:has-text("Find Your Perfect Stay")').count() > 0;
    const hasQuickSearch = await page.locator('text=/Quick Search/i').count() > 0;
    const hasRoomCards = await page.locator('text=/SELECT ROOM/i').count();
    const roomCount = await page.locator('text=/Rooms Available/i').textContent().then(
      text => text?.match(/(\d+)\s+Rooms? Available/)?.[1] || '0'
    ).catch(() => '0');
    const isStuckLoading = await page.locator('text=/Loading rooms/i').isVisible().catch(() => false);

    console.log(`✓ Total load time: ${roomsTotalTime}ms`);
    console.log(`✓ Has "Find Your Perfect Stay" heading: ${hasRoomHeading}`);
    console.log(`✓ Has Quick Search panel: ${hasQuickSearch}`);
    console.log(`✓ Rooms displayed: ${roomCount}`);
    console.log(`✓ Room cards with SELECT button: ${hasRoomCards}`);
    console.log(`✓ Not stuck in loading state: ${!isStuckLoading}`);
    console.log(`✓ Timeout protection working: ${roomsInitialLoad < 5000 ? 'PASS' : 'FAIL'}\n`);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/final-report-02-rooms.png',
      fullPage: true
    });

    // TEST 4: Booking Page with Timeout Protection
    console.log('TEST 4: /booking Page (Timeout Protection)');
    console.log('-'.repeat(70));

    const bookingStart = Date.now();
    await page.goto(`${PRODUCTION_URL}/booking?x-vercel-protection-bypass=${BYPASS_TOKEN}`);
    await page.waitForLoadState('domcontentloaded');
    const bookingInitialLoad = Date.now() - bookingStart;

    console.log(`✓ Initial load: ${bookingInitialLoad}ms (threshold: 5000ms)`);

    // Wait for data to load or timeout
    await page.waitForTimeout(6000);
    const bookingTotalTime = Date.now() - bookingStart;

    const hasBookingHeading = await page.locator('h1:has-text("Build Your Perfect Stay")').count() > 0;
    const hasDatePickers = await page.locator('input[type="text"][placeholder*="dd/mm/yyyy"]').count();
    const hasRoomSelection = await page.locator('text=/Choose your room/i').count() > 0;
    const bookingRoomCount = await page.locator('text=/Room/i').count();
    const isStuckLoadingBooking = await page.locator('text=/Loading available rooms/i').isVisible().catch(() => false);

    console.log(`✓ Total load time: ${bookingTotalTime}ms`);
    console.log(`✓ Has "Build Your Perfect Stay" heading: ${hasBookingHeading}`);
    console.log(`✓ Has date pickers: ${hasDatePickers > 0}`);
    console.log(`✓ Has room selection: ${hasRoomSelection}`);
    console.log(`✓ Room options visible: ${bookingRoomCount}`);
    console.log(`✓ Not stuck in loading state: ${!isStuckLoadingBooking}`);
    console.log(`✓ Timeout protection working: ${bookingInitialLoad < 5000 ? 'PASS' : 'FAIL'}\n`);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/final-report-03-booking.png',
      fullPage: true
    });

    // TEST 5: Navigation & Core Functionality
    console.log('TEST 5: Navigation & Core Functionality');
    console.log('-'.repeat(70));

    await page.goto(`${PRODUCTION_URL}?x-vercel-protection-bypass=${BYPASS_TOKEN}`);

    const navLinks = {
      'Overview': await page.locator('a[href="/"]').count() > 0,
      'Rooms': await page.locator('a[href="/rooms"]').count() > 0,
      'Dining': await page.locator('a[href*="/restaurant"], a[href*="/dining"]').count() > 0,
      'Booking': await page.locator('a[href="/booking"]').count() > 0,
    };

    console.log('Navigation links:');
    Object.entries(navLinks).forEach(([name, exists]) => {
      console.log(`  ${exists ? '✓' : '✗'} ${name}`);
    });

    const hasConcierge = await page.locator('text=/Ask the concierge/i').count() > 0;
    console.log(`✓ Concierge widget: ${hasConcierge}\n`);

    // TEST 6: Guest-Friendly Booking Flow
    console.log('TEST 6: Guest-Friendly Booking Flow');
    console.log('-'.repeat(70));

    await page.goto(`${PRODUCTION_URL}/rooms?x-vercel-protection-bypass=${BYPASS_TOKEN}`);
    await page.waitForTimeout(3000);

    const guestFeatures = {
      'Date picker': await page.locator('button:has-text("Check-in")').count() > 0,
      'Guest selector': await page.locator('select').count() > 0,
      'Room type filter': await page.locator('select option[value="standard"]').count() > 0,
      'View toggle (Grid/List)': await page.locator('button:has-text("Grid"), button:has-text("List")').count() > 0,
    };

    console.log('Guest booking features:');
    Object.entries(guestFeatures).forEach(([name, exists]) => {
      console.log(`  ${exists ? '✓' : '✗'} ${name}`);
    });
    console.log();

    // TEST 7: Error Analysis
    console.log('TEST 7: Error Analysis');
    console.log('-'.repeat(70));

    console.log(`Console errors: ${consoleErrors.length}`);
    console.log(`Failed HTTP requests: ${failedRequests.length}`);

    if (failedRequests.length > 0) {
      console.log('\nFailed requests:');
      const uniqueUrls = new Set<string>();
      failedRequests.forEach(req => {
        const urlPath = new URL(req.url).pathname;
        if (!uniqueUrls.has(urlPath)) {
          uniqueUrls.add(urlPath);
          console.log(`  - ${req.method} ${urlPath} (${req.status})`);
        }
      });
    }

    const hasFirebaseTimeoutErrors = consoleErrors.some(err =>
      err.toLowerCase().includes('firebase query timeout')
    );
    console.log(`\nFirebase timeout errors: ${hasFirebaseTimeoutErrors ? 'YES (Issue!)' : 'NO (Good!)'}`);

    const hasCriticalErrors = consoleErrors.some(err =>
      !err.includes('Failed to load resource') &&
      !err.includes('Database lives in a different region')
    );
    console.log(`Critical JavaScript errors: ${hasCriticalErrors ? 'YES (Issue!)' : 'NO (Good!)'}\n`);

    // FINAL SUMMARY
    console.log('='.repeat(70));
    console.log('FINAL SUMMARY');
    console.log('='.repeat(70));

    const allPassed =
      bypassWorking &&
      hasRoomHeading &&
      hasBookingHeading &&
      !isStuckLoading &&
      !isStuckLoadingBooking &&
      roomsInitialLoad < 5000 &&
      bookingInitialLoad < 5000;

    console.log(`\n${allPassed ? '✓ PASS' : '✗ FAIL'} - Overall Status: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    console.log(`\nKey Metrics:`);
    console.log(`  - Bypass token: ${bypassWorking ? 'Working' : 'Not working'}`);
    console.log(`  - /rooms page: ${hasRoomHeading && !isStuckLoading ? 'Working' : 'Issues detected'}`);
    console.log(`  - /booking page: ${hasBookingHeading && !isStuckLoadingBooking ? 'Working' : 'Issues detected'}`);
    console.log(`  - Timeout protection: ${roomsInitialLoad < 5000 && bookingInitialLoad < 5000 ? 'Active' : 'Not working'}`);
    console.log(`  - Rooms displayed: ${roomCount}`);
    console.log(`  - No infinite loading: ${!isStuckLoading && !isStuckLoadingBooking ? 'Confirmed' : 'Issues detected'}`);

    console.log('\n' + '='.repeat(70) + '\n');

    // Assertions
    expect(bypassWorking).toBe(true);
    expect(roomsInitialLoad).toBeLessThan(5000);
    expect(bookingInitialLoad).toBeLessThan(5000);
    expect(isStuckLoading).toBe(false);
    expect(isStuckLoadingBooking).toBe(false);
  });
});
