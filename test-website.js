const { chromium } = require('playwright');

async function testSchiehallionWebsite() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  console.log('\n=== SCHIEHALLION HOTEL WEBSITE TESTING ===\n');

  try {
    // Monitor console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`🔴 Console Error: ${msg.text()}`);
      }
    });

    // Monitor network failures
    const networkErrors = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} ${response.url()}`);
        console.log(`🌐 Network Error: ${response.status()} ${response.url()}`);
      }
    });

    console.log('1. Testing Homepage (localhost:3000)...');

    // Navigate to homepage
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot of homepage
    await page.screenshot({ path: '/Users/david/Desktop/repo/schiehallion/homepage-test.png', fullPage: true });
    console.log('✅ Homepage screenshot saved: homepage-test.png');

    // Check if page loads correctly
    const title = await page.title();
    console.log(`📄 Page Title: ${title}`);

    // Test navigation to rooms page
    console.log('\n2. Testing Navigation to /rooms...');

    try {
      await page.goto('http://localhost:3000/rooms', { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(3000);

      // Take screenshot of rooms page
      await page.screenshot({ path: '/Users/david/Desktop/repo/schiehallion/rooms-page-test.png', fullPage: true });
      console.log('✅ Rooms page screenshot saved: rooms-page-test.png');

      const roomsTitle = await page.title();
      console.log(`📄 Rooms Page Title: ${roomsTitle}`);

      // Test Epic 4 features - look for room listings
      console.log('\n3. Testing Epic 4 Features (Room Display & Search)...');

      // Check for room listing components
      const roomListings = await page.locator('[data-testid*="room"], .room-card, .room-listing, .room-item').count();
      console.log(`🏨 Found ${roomListings} room listing elements`);

      // Check for search/filter functionality
      const searchElements = await page.locator('input[type="search"], input[placeholder*="search"], .search-input, [data-testid*="search"]').count();
      console.log(`🔍 Found ${searchElements} search elements`);

      const filterElements = await page.locator('select, .filter, [data-testid*="filter"], button[aria-label*="filter"]').count();
      console.log(`🔧 Found ${filterElements} filter elements`);

      // Check for calendar components
      const calendarElements = await page.locator('.calendar, [data-testid*="calendar"], .date-picker, .react-calendar').count();
      console.log(`📅 Found ${calendarElements} calendar elements`);

      // Check specific Epic 4 elements
      const quickSearchSection = await page.locator('text="Quick Search"').count();
      console.log(`🔍 Quick Search section: ${quickSearchSection > 0 ? 'Found' : 'Not found'}`);

      const guestSelector = await page.locator('select').count();
      console.log(`👥 Guest selectors: ${guestSelector}`);

      const dateButton = await page.locator('button:has-text("Check-in"), button:has-text("Select your dates")').count();
      console.log(`📅 Date selection buttons: ${dateButton}`);

      // Test calendar interaction
      const calendarButton = await page.locator('button').filter({ hasText: /Check-in|dates/i }).first();
      if (await calendarButton.count() > 0) {
        console.log('🧪 Testing calendar interaction...');
        await calendarButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '/Users/david/Desktop/repo/schiehallion/calendar-test.png' });
        console.log('✅ Calendar interaction screenshot saved: calendar-test.png');
      }

    } catch (error) {
      console.log(`❌ Rooms page error: ${error.message}`);
      await page.screenshot({ path: '/Users/david/Desktop/repo/schiehallion/rooms-error-test.png' });
    }

    // Test authentication flows
    console.log('\n4. Testing Authentication...');

    try {
      // Navigate back to homepage
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

      // Look for authentication elements
      const loginButtons = await page.locator('button:has-text("Login"), button:has-text("Sign In"), a:has-text("Login"), a:has-text("Sign In")').count();
      console.log(`🔐 Found ${loginButtons} login buttons`);

      const signupButtons = await page.locator('button:has-text("Sign Up"), button:has-text("Register"), a:has-text("Sign Up"), a:has-text("Register")').count();
      console.log(`📝 Found ${signupButtons} signup buttons`);

      // Test if authentication provider is available
      if (loginButtons > 0) {
        console.log('🧪 Testing login button interaction...');
        const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), a:has-text("Login"), a:has-text("Sign In")').first();
        await loginButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '/Users/david/Desktop/repo/schiehallion/auth-test.png' });
        console.log('✅ Auth interaction screenshot saved: auth-test.png');
      }
    } catch (error) {
      console.log(`❌ Auth test error: ${error.message}`);
    }

    // Test navigation functionality
    console.log('\n5. Testing Navigation...');

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    const navigationLinks = await page.locator('nav a, .navigation a, .nav-link, .menu a').count();
    console.log(`🧭 Found ${navigationLinks} navigation links`);

    // Test some common navigation paths
    const commonPaths = ['/about', '/contact', '/services', '/booking'];

    for (const path of commonPaths) {
      try {
        await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle', timeout: 5000 });
        const pathTitle = await page.title();
        console.log(`✅ ${path}: ${pathTitle}`);
      } catch (error) {
        console.log(`❌ ${path}: Not found or error`);
      }
    }

    // Final summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(`🔴 Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }

    console.log(`🌐 Network Errors: ${networkErrors.length}`);
    if (networkErrors.length > 0) {
      networkErrors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n📸 Screenshots saved:');
    console.log('  - homepage-test.png');
    console.log('  - rooms-page-test.png');
    console.log('  - auth-test.png');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: '/Users/david/Desktop/repo/schiehallion/error-test.png' });
  } finally {
    await browser.close();
  }
}

testSchiehallionWebsite().catch(console.error);