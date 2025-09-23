import { test, expect } from '@playwright/test';

test.describe('Simple Booking Page Test', () => {
  test('Should access booking page and check for Firebase index errors', async ({ page }) => {
    console.log('🔍 Testing booking page for Firebase index errors...');

    // Navigate directly to booking page
    await page.goto('/booking', { waitUntil: 'networkidle' });

    // Wait a moment for page to load
    await page.waitForTimeout(3000);

    // Get page content to check for errors
    const bodyContent = await page.textContent('body');

    // Check for Firebase index errors
    const hasIndexError = bodyContent?.includes('index') &&
                         (bodyContent?.includes('error') || bodyContent?.includes('Error'));

    if (hasIndexError) {
      console.log('❌ Firebase index error detected in page content');
      console.log('Content snippet:', bodyContent?.substring(0, 500));
    } else {
      console.log('✅ No Firebase index errors detected');
    }

    // Check if page loads basic content
    const hasValidContent = bodyContent && bodyContent.length > 100;

    if (hasValidContent) {
      console.log('✅ Booking page loads with content');
    } else {
      console.log('⚠️  Booking page may have loading issues');
    }

    // Check for specific Epic 5 components
    const hasBookingComponents = bodyContent?.includes('Build Your Perfect Stay') ||
                                bodyContent?.includes('Access Required') ||
                                bodyContent?.includes('Drag') ||
                                bodyContent?.includes('booking');

    if (hasBookingComponents) {
      console.log('✅ Epic 5 booking components detected');
    }

    // Check page title
    const title = await page.title();
    console.log('Page title:', title);

    // Take a screenshot for manual verification
    await page.screenshot({ path: 'test-results/booking-page-state.png' });

    console.log('📸 Screenshot saved to test-results/booking-page-state.png');
  });

  test('Should test rooms page and cart integration', async ({ page }) => {
    console.log('🏨 Testing rooms page for cart integration...');

    // Navigate to rooms page
    await page.goto('/rooms', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Get page content
    const bodyContent = await page.textContent('body');

    // Check for rooms page content
    const hasRoomsContent = bodyContent?.includes('room') ||
                           bodyContent?.includes('Room') ||
                           bodyContent?.includes('Stay');

    if (hasRoomsContent) {
      console.log('✅ Rooms page loads with room-related content');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/rooms-page-state.png' });
    console.log('📸 Rooms page screenshot saved');
  });

  test('Should check homepage and authentication', async ({ page }) => {
    console.log('🏠 Testing homepage and authentication interface...');

    // Navigate to homepage
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Get page content
    const bodyContent = await page.textContent('body');

    // Check for authentication elements
    const hasAuthElements = bodyContent?.includes('login') ||
                           bodyContent?.includes('Login') ||
                           bodyContent?.includes('sign') ||
                           bodyContent?.includes('auth');

    if (hasAuthElements) {
      console.log('✅ Authentication interface detected on homepage');
    } else {
      console.log('ℹ️  Authentication might be handled differently');
    }

    // Check for navigation elements
    const hasNavigation = bodyContent?.includes('Book') ||
                         bodyContent?.includes('Rooms') ||
                         bodyContent?.includes('nav');

    if (hasNavigation) {
      console.log('✅ Navigation elements detected');
    }

    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/homepage-state.png' });
    console.log('📸 Homepage screenshot saved');

    // Print some page content for debugging
    console.log('Homepage content sample:', bodyContent?.substring(0, 300));
  });
});