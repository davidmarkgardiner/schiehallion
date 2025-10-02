import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://schiehallion.vercel.app';
const BYPASS_TOKEN = 'hEG6AqKmAM4VaPXi3yUjN8N58WaekIGU';
const PRODUCTION_URL_WITH_BYPASS = `${PRODUCTION_URL}?x-vercel-protection-bypass=${BYPASS_TOKEN}`;

test.describe('Client-Side Rendering Investigation', () => {

  test('Investigate /rooms page client-side hydration', async ({ page }) => {
    console.log('\n=== INVESTIGATING /rooms PAGE ===\n');

    const consoleMessages: { type: string; text: string }[] = [];

    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });

    // Navigate to rooms page
    console.log('\nNavigating to /rooms...');
    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/rooms`, {
      waitUntil: 'networkidle',
      timeout: 20000
    });

    // Take initial screenshot
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/rooms-investigation-01-initial.png',
      fullPage: true
    });

    console.log('\nWaiting for client-side rendering...');
    await page.waitForTimeout(8000); // Wait for timeout + fallback

    // Take screenshot after waiting
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/rooms-investigation-02-after-wait.png',
      fullPage: true
    });

    // Check page structure
    console.log('\n=== PAGE STRUCTURE ===');

    const pageTitle = await page.title();
    console.log(`Title: ${pageTitle}`);

    const url = page.url();
    console.log(`URL: ${url}`);

    // Check for specific elements
    const elements = {
      'Navigation': await page.locator('nav').count(),
      'Header': await page.locator('header').count(),
      'Main content': await page.locator('main').count(),
      'Room heading': await page.locator('h1:has-text("Find Your Perfect Stay")').count(),
      'Quick Search': await page.locator('text=/Quick Search/i').count(),
      'Guest selector': await page.locator('select').count(),
      'Loading indicator': await page.locator('text=/Loading rooms/i').count(),
      'Room cards': await page.locator('[class*="room"]').count(),
      'Error messages': await page.locator('text=/error|failed/i').count(),
    };

    console.log('\nElement counts:');
    Object.entries(elements).forEach(([name, count]) => {
      console.log(`  ${name}: ${count}`);
    });

    // Get page HTML for the main content area
    const mainHTML = await page.locator('main').innerHTML().catch(() => 'N/A');
    console.log(`\nMain HTML length: ${mainHTML.length} characters`);

    // Check if RoomList component loaded
    const roomListLoaded = await page.locator('text=/Available/i, text=/room/i').count() > 0;
    console.log(`RoomList appears to be loaded: ${roomListLoaded}`);

    // Check network requests
    console.log('\n=== CHECKING FOR FAILED REQUESTS ===');
    const failedRequests: string[] = [];

    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });

    await page.waitForTimeout(2000);

    if (failedRequests.length > 0) {
      console.log('Failed requests:');
      failedRequests.forEach(req => console.log(`  - ${req}`));
    } else {
      console.log('No failed requests detected');
    }

    // Final screenshot
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/rooms-investigation-03-final.png',
      fullPage: true
    });

    console.log('\n=== INVESTIGATION COMPLETE ===\n');
  });

  test('Investigate /booking page client-side hydration', async ({ page }) => {
    console.log('\n=== INVESTIGATING /booking PAGE ===\n');

    const consoleMessages: { type: string; text: string }[] = [];

    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
      console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });

    // Navigate to booking page
    console.log('\nNavigating to /booking...');
    await page.goto(`${PRODUCTION_URL_WITH_BYPASS}/booking`, {
      waitUntil: 'networkidle',
      timeout: 20000
    });

    // Take initial screenshot
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/booking-investigation-01-initial.png',
      fullPage: true
    });

    console.log('\nWaiting for client-side rendering...');
    await page.waitForTimeout(8000); // Wait for timeout + fallback

    // Take screenshot after waiting
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/booking-investigation-02-after-wait.png',
      fullPage: true
    });

    // Check page structure
    console.log('\n=== PAGE STRUCTURE ===');

    const pageTitle = await page.title();
    console.log(`Title: ${pageTitle}`);

    const url = page.url();
    console.log(`URL: ${url}`);

    // Check for specific elements
    const elements = {
      'Navigation': await page.locator('nav').count(),
      'Main content': await page.locator('main').count(),
      'Loading indicator': await page.locator('text=/Loading/i').count(),
      'Booking flow': await page.locator('text=/booking|room|guest/i').count(),
      'Error messages': await page.locator('text=/error|failed/i').count(),
      'Step indicators': await page.locator('text=/step/i').count(),
    };

    console.log('\nElement counts:');
    Object.entries(elements).forEach(([name, count]) => {
      console.log(`  ${name}: ${count}`);
    });

    // Get page HTML for the main content area
    const mainHTML = await page.locator('main').innerHTML().catch(() => 'N/A');
    console.log(`\nMain HTML length: ${mainHTML.length} characters`);

    // Final screenshot
    await page.screenshot({
      path: '/Users/davidgardiner/Desktop/repo/schiehallion/test-screenshots/booking-investigation-03-final.png',
      fullPage: true
    });

    console.log('\n=== INVESTIGATION COMPLETE ===\n');
  });
});
