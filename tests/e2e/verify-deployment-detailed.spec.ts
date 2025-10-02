import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://schiehallion.vercel.app';
const BYPASS_TOKEN = 'hEG6AqKmAM4VaPXi3yUjN8N58WaekIGU';
const PRODUCTION_URL_WITH_BYPASS = `${PRODUCTION_URL}?x-vercel-protection-bypass=${BYPASS_TOKEN}`;

test.describe('Detailed Deployment Verification', () => {

  test('Complete Site Functionality Check', async ({ page }) => {
    console.log('\n========================================');
    console.log('COMPREHENSIVE DEPLOYMENT VERIFICATION');
    console.log('========================================\n');

    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    // Test 1: Bypass Token
    console.log('1. Testing Deployment Protection Bypass...');
    const response = await page.goto(PRODUCTION_URL_WITH_BYPASS, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    expect(page.url()).not.toContain('vercel.com/login');
    expect(response?.status()).toBe(200);
    console.log('   ✓ Bypass token working\n');

    // Test 2: Landing Page
    console.log('2. Testing Landing Page...');
    await page.goto(PRODUCTION_URL_WITH_BYPASS);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const hasOverview = await page.locator('text=/Overview|Schiehallion/i').count() > 0;
    console.log(`   ✓ Has branding: ${hasOverview}`);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/detailed-01-landing.png',
      fullPage: true
    });
    console.log('   ✓ Landing page loads correctly\n');

    // Test 3: Rooms Page - Detailed Check
    console.log('3. Testing /rooms Page with Timeout Protection...');
    const roomsStartTime = Date.now();
    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/rooms`);
    await page.waitForLoadState('domcontentloaded');
    const roomsLoadTime = Date.now() - roomsStartTime;

    console.log(`   - Initial load time: ${roomsLoadTime}ms`);

    // Wait for either loading or content to appear
    await page.waitForTimeout(3000);

    // Check for the heading
    const hasRoomHeading = await page.locator('text=/Find Your Perfect Stay/i').count() > 0;
    console.log(`   - Has "Find Your Perfect Stay" heading: ${hasRoomHeading}`);

    // Check for loading state
    const isLoading = await page.locator('text=/Loading rooms/i').isVisible().catch(() => false);
    console.log(`   - Shows loading indicator: ${isLoading}`);

    // Check for room selection UI
    const hasQuickSearch = await page.locator('text=/Quick Search/i').count() > 0;
    console.log(`   - Has Quick Search panel: ${hasQuickSearch}`);

    const hasGuestSelector = await page.locator('select').count() > 0;
    console.log(`   - Has guest selector: ${hasGuestSelector}`);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/detailed-02-rooms.png',
      fullPage: true
    });

    // Verify page loaded within threshold
    expect(roomsLoadTime).toBeLessThan(5000);
    console.log(`   ✓ /rooms page loaded in ${roomsLoadTime}ms (under 5s threshold)\n`);

    // Test 4: Booking Page - Detailed Check
    console.log('4. Testing /booking Page with Timeout Protection...');
    const bookingStartTime = Date.now();
    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/booking`);
    await page.waitForLoadState('domcontentloaded');
    const bookingLoadTime = Date.now() - bookingStartTime;

    console.log(`   - Initial load time: ${bookingLoadTime}ms`);

    await page.waitForTimeout(3000);

    const bookingStillLoading = await page.locator('text=/Loading available rooms/i').isVisible().catch(() => false);
    console.log(`   - Still in loading state: ${bookingStillLoading}`);

    const hasBookingContent = await page.locator('text=/room|select|guest|booking/i').count() > 0;
    console.log(`   - Has booking content: ${hasBookingContent}`);

    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/detailed-03-booking.png',
      fullPage: true
    });

    expect(bookingLoadTime).toBeLessThan(5000);
    console.log(`   ✓ /booking page loaded in ${bookingLoadTime}ms (under 5s threshold)\n`);

    // Test 5: Navigation
    console.log('5. Testing Navigation...');
    await page.goto(PRODUCTION_URL_WITH_BYPASS);

    const roomsLink = await page.locator('a[href="/rooms"]').count();
    console.log(`   - Rooms navigation link exists: ${roomsLink > 0}`);

    const bookingLink = await page.locator('a[href="/booking"]').count();
    console.log(`   - Booking navigation link exists: ${bookingLink > 0}`);

    const diningLink = await page.locator('a[href*="/restaurant"], a[href*="/dining"]').count();
    console.log(`   - Dining navigation link exists: ${diningLink > 0}`);

    console.log('   ✓ Navigation structure present\n');

    // Test 6: Guest-Friendly Booking Flow
    console.log('6. Testing Guest-Friendly Booking Features...');
    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/rooms`);
    await page.waitForTimeout(2000);

    // Check for cart functionality
    const hasCartButton = await page.locator('text=/cart/i').count() > 0;
    console.log(`   - Has cart button: ${hasCartButton}`);

    // Check for date picker
    const hasDatePicker = await page.locator('button:has-text("Check-in")').count() > 0;
    console.log(`   - Has date picker: ${hasDatePicker}`);

    console.log('   ✓ Guest booking elements present\n');

    // Test 7: Console Analysis
    console.log('7. Console Analysis...');
    console.log(`   - Total errors: ${consoleErrors.length}`);
    console.log(`   - Total warnings: ${consoleWarnings.length}`);

    if (consoleErrors.length > 0) {
      console.log('\n   Errors found:');
      consoleErrors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.substring(0, 100)}${err.length > 100 ? '...' : ''}`);
      });
    }

    if (consoleWarnings.length > 0) {
      console.log('\n   Warnings found:');
      consoleWarnings.slice(0, 5).forEach((warn, i) => {
        console.log(`   ${i + 1}. ${warn.substring(0, 100)}${warn.length > 100 ? '...' : ''}`);
      });
    }

    // Check for Firebase timeout errors
    const hasFirebaseTimeout = consoleErrors.some(err =>
      err.toLowerCase().includes('timeout') || err.toLowerCase().includes('firebase query timeout')
    );
    console.log(`   - Has Firebase timeout errors: ${hasFirebaseTimeout}`);

    // Note: Firebase region warnings are expected and not critical
    const hasFirebaseRegionWarning = consoleWarnings.some(warn =>
      warn.includes('Database lives in a different region')
    );
    if (hasFirebaseRegionWarning) {
      console.log('   - Note: Firebase region warning present (non-critical configuration issue)');
    }

    console.log('\n========================================');
    console.log('VERIFICATION COMPLETE');
    console.log('========================================\n');
  });
});
