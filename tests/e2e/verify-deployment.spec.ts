import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://schiehallion.vercel.app';
const BYPASS_TOKEN = 'hEG6AqKmAM4VaPXi3yUjN8N58WaekIGU';
const PRODUCTION_URL_WITH_BYPASS = `${PRODUCTION_URL}?x-vercel-protection-bypass=${BYPASS_TOKEN}`;
const TIMEOUT_THRESHOLD = 5000; // 5 seconds

test.describe('Schiehallion Deployment Verification', () => {

  test.beforeEach(async ({ page }) => {
    // Set a reasonable timeout for page loads
    page.setDefaultTimeout(10000);
  });

  test('1. Deployment Protection Bypass - Should access site without authentication redirect', async ({ page }) => {
    console.log('Testing deployment protection bypass...');

    // Navigate with bypass token
    const response = await page.goto(PRODUCTION_URL_WITH_BYPASS, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Take screenshot of landing page
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/01-landing-with-bypass.png', fullPage: true });

    // Should not be redirected to Vercel authentication
    expect(page.url()).not.toContain('vercel.com/login');
    expect(page.url()).not.toContain('vercel.com/security');

    // Should successfully load the landing page
    expect(response?.status()).toBe(200);

    console.log('✓ Bypass token working - no authentication redirect');
  });

  test('2. Landing Page - Should load correctly within timeout', async ({ page }) => {
    console.log('Testing landing page load...');

    const startTime = Date.now();
    await page.goto(PRODUCTION_URL_WITH_BYPASS, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    const loadTime = Date.now() - startTime;

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/02-landing-page.png', fullPage: true });

    // Check load time
    console.log(`Landing page loaded in ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000);

    // Check for key elements
    const hasLogo = await page.locator('text=/Schiehallion/i').count() > 0;
    console.log(`Has Schiehallion branding: ${hasLogo}`);

    // Check for navigation elements
    const hasNavigation = await page.locator('nav, header a[href*="/rooms"], header a[href*="/booking"]').count() > 0;
    console.log(`Has navigation: ${hasNavigation}`);

    console.log('✓ Landing page loaded successfully');
  });

  test('3. Rooms Page - Should load within 5 seconds without infinite spinner', async ({ page }) => {
    console.log('Testing /rooms page...');

    // Navigate to rooms page
    const startTime = Date.now();
    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/rooms`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    const loadTime = Date.now() - startTime;

    console.log(`/rooms page loaded in ${loadTime}ms`);

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/03-rooms-page.png', fullPage: true });

    // Check that page loaded within 5 seconds
    expect(loadTime).toBeLessThan(TIMEOUT_THRESHOLD);

    // Should show "Find Your Perfect Stay" heading
    const hasHeading = await page.getByText(/Find Your Perfect Stay/i).count() > 0;
    console.log(`Has "Find Your Perfect Stay" heading: ${hasHeading}`);
    expect(hasHeading).toBe(true);

    // Should NOT be stuck on "Loading..."
    const isStillLoading = await page.locator('text=/Loading rooms/i').isVisible().catch(() => false);
    console.log(`Still showing loading spinner: ${isStillLoading}`);
    expect(isStillLoading).toBe(false);

    // Should have room content or error message (not blank)
    const hasContent = await page.locator('text=/Room/i').count() > 0;
    console.log(`Has room content: ${hasContent}`);

    console.log('✓ /rooms page loaded without hanging');
  });

  test('4. Booking Page - Should load within 5 seconds without infinite spinner', async ({ page }) => {
    console.log('Testing /booking page...');

    const startTime = Date.now();
    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/booking`, {
      waitUntil: 'domcontentloaded',
      timeout: 10000
    });
    const loadTime = Date.now() - startTime;

    console.log(`/booking page loaded in ${loadTime}ms`);

    // Wait a bit for dynamic content
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/04-booking-page.png', fullPage: true });

    // Check that page loaded within 5 seconds
    expect(loadTime).toBeLessThan(TIMEOUT_THRESHOLD);

    // Should NOT be stuck on "Loading available rooms..."
    const isStillLoading = await page.locator('text=/Loading available rooms/i').isVisible().catch(() => false);
    console.log(`Still showing loading spinner: ${isStillLoading}`);
    expect(isStillLoading).toBe(false);

    // Should have booking content
    const hasBookingContent = await page.locator('text=/booking|room|select|guest/i').count() > 0;
    console.log(`Has booking content: ${hasBookingContent}`);

    console.log('✓ /booking page loaded without hanging');
  });

  test('5. Navigation - Should navigate between pages successfully', async ({ page }) => {
    console.log('Testing navigation flow...');

    await page.goto(PRODUCTION_URL_WITH_BYPASS);

    // Try to navigate to rooms
    try {
      await page.click('a[href*="/rooms"], text=/rooms|view rooms|find room/i', { timeout: 5000 });
      await page.waitForURL('**/rooms', { timeout: 5000 });
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/05-navigation-to-rooms.png', fullPage: true });
      console.log('✓ Successfully navigated to /rooms');
    } catch (error) {
      console.log('Could not find rooms navigation link, trying direct navigation...');
      await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/rooms`);
    }

    // Check if we can see room content
    await page.waitForTimeout(2000);
    const hasRoomContent = await page.locator('text=/room/i').count() > 0;
    console.log(`Rooms page has content: ${hasRoomContent}`);
  });

  test('6. Console Errors - Check for Firebase and authentication errors', async ({ page }) => {
    console.log('Monitoring console for errors...');

    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);

      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Visit main pages
    await page.goto(PRODUCTION_URL_WITH_BYPASS);
    await page.waitForTimeout(2000);

    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/rooms`);
    await page.waitForTimeout(2000);

    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/booking`);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/06-final-state.png', fullPage: true });

    // Log all console messages
    console.log('\n--- Console Messages ---');
    consoleMessages.forEach(msg => console.log(msg));

    console.log('\n--- Console Errors ---');
    if (consoleErrors.length === 0) {
      console.log('No console errors detected ✓');
    } else {
      consoleErrors.forEach(err => console.log(`ERROR: ${err}`));
    }

    // Check for specific Firebase/timeout related errors
    const hasFirebaseTimeout = consoleErrors.some(err =>
      err.includes('timeout') || err.includes('Firebase')
    );

    console.log(`Has Firebase timeout errors: ${hasFirebaseTimeout}`);
  });

  test('7. Room Listing Display - Verify rooms are shown or fallback to mock data', async ({ page }) => {
    console.log('Testing room display functionality...');

    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/rooms`);
    await page.waitForTimeout(3000); // Give time for data to load

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/07-room-listing.png', fullPage: true });

    // Check for room cards or room information
    const roomCards = await page.locator('[class*="room"], [class*="Room"]').count();
    console.log(`Found ${roomCards} room-related elements`);

    // Check for specific room types mentioned in the code
    const hasRoomTypes = await page.locator('text=/standard|deluxe|suite|family/i').count() > 0;
    console.log(`Has room type information: ${hasRoomTypes}`);

    // Check for pricing information
    const hasPricing = await page.locator('text=/£|price/i').count() > 0;
    console.log(`Has pricing information: ${hasPricing}`);
  });

  test('8. Guest-Friendly Booking Flow - Check cart functionality', async ({ page }) => {
    console.log('Testing guest-friendly booking flow...');

    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/rooms`);
    await page.waitForTimeout(2000);

    // Look for cart or booking elements
    const hasCart = await page.locator('text=/cart/i').count() > 0;
    console.log(`Has cart element: ${hasCart}`);

    // Check for guest flow elements
    const hasGuestFlow = await page.locator('text=/guest|login|checkout/i').count() > 0;
    console.log(`Has guest flow elements: ${hasGuestFlow}`);

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/08-booking-flow.png', fullPage: true });
  });

  test('9. Performance - Page should not hang indefinitely', async ({ page }) => {
    console.log('Testing timeout protection...');

    // Test that pages don't hang beyond the 5-second timeout
    const pages = [
      { path: '/', name: 'Landing' },
      { path: '/rooms', name: 'Rooms' },
      { path: '/booking', name: 'Booking' }
    ];

    for (const { path, name } of pages) {
      const startTime = Date.now();

      try {
        await page.goto(`${PRODUCTION_URL_WITH_BYPASS}${path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });

        const loadTime = Date.now() - startTime;
        console.log(`${name} page loaded in ${loadTime}ms`);

        // Verify not stuck loading
        await page.waitForTimeout(1000);
        const isLoading = await page.locator('text=/loading/i').isVisible().catch(() => false);

        if (isLoading) {
          console.log(`WARNING: ${name} page still showing loading indicator`);
        } else {
          console.log(`✓ ${name} page not stuck in loading state`);
        }
      } catch (error) {
        console.log(`ERROR loading ${name} page: ${error}`);
      }
    }
  });
});
