const { chromium } = require('playwright');

async function debugRoomsPage() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log('CONSOLE:', msg.type(), msg.text());
  });

  // Listen for network requests
  page.on('request', request => {
    if (request.url().includes('image') || request.url().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      console.log('IMAGE REQUEST:', request.url());
    }
  });

  // Listen for network responses
  page.on('response', response => {
    if (response.url().includes('image') || response.url().match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      console.log('IMAGE RESPONSE:', response.url(), 'Status:', response.status());
    }
    if (response.status() >= 400) {
      console.log('FAILED REQUEST:', response.url(), 'Status:', response.status());
    }
  });

  // Listen for page errors
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.message);
  });

  try {
    console.log('Navigating to home page first...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

    console.log('Taking home page screenshot...');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/home-page.png', fullPage: true });

    // Check for login form on home page
    const loginForm = await page.locator('form').count();
    if (loginForm > 0) {
      console.log('Found login form - creating test account...');

      // Switch to signup mode first
      const signupToggle = page.locator('text=Need an account? Sign up');
      if (await signupToggle.count() > 0) {
        await signupToggle.click();
        await page.waitForTimeout(1000);
      }

      // Fill signup form
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      if (await emailInput.count() > 0) {
        console.log('Signing up with test credentials...');
        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');

        const submitBtn = page.locator('button[type="submit"]');
        if (await submitBtn.count() > 0) {
          try {
            await submitBtn.click();
            await page.waitForLoadState('networkidle', { timeout: 15000 });
            console.log('Signup completed');

            // Wait for Firebase auth to initialize
            await page.waitForTimeout(3000);

            // Check if we're now on the main authenticated page
            const isAuthenticated = await page.locator('text=Highland hospitality reimagined').count();
            if (isAuthenticated > 0) {
              console.log('Authentication successful - on main page');
            }

          } catch (error) {
            console.log('Signup failed, trying login instead:', error.message);

            // Switch back to login mode
            const loginToggle = page.locator('text=Already have an account? Login');
            if (await loginToggle.count() > 0) {
              await loginToggle.click();
              await page.waitForTimeout(1000);
            }

            await emailInput.fill('test@example.com');
            await passwordInput.fill('password123');
            await submitBtn.click();
            await page.waitForLoadState('networkidle', { timeout: 15000 });
            console.log('Login completed');

            // Wait for Firebase auth to initialize
            await page.waitForTimeout(3000);
          }
        }
      }
    }

    // Wait for authentication to stabilize
    console.log('Waiting for authentication to stabilize...');
    await page.waitForTimeout(3000);

    // Navigate to rooms page
    console.log('Navigating to rooms page...');
    await page.goto('http://localhost:3001/rooms', { waitUntil: 'networkidle' });

    console.log('Taking rooms page screenshot...');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/rooms-page.png', fullPage: true });

    // Check if we're still seeing access required
    const stillAccessRequired = await page.locator('text=Access Required').count();
    if (stillAccessRequired > 0) {
      console.log('Still seeing access required, checking authentication state...');

      // Check localStorage for Firebase auth
      const authState = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const firebaseKeys = keys.filter(key => key.includes('firebase'));
        return firebaseKeys.map(key => ({ key, value: localStorage.getItem(key) }));
      });
      console.log('Firebase auth state:', JSON.stringify(authState, null, 2));

      // Try refreshing the page to see if auth loads
      console.log('Refreshing page to check auth persistence...');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(5000);

      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/rooms-after-refresh.png', fullPage: true });
    }

    // Wait for any lazy loading and check for loading states
    console.log('Waiting for content to load...');
    await page.waitForTimeout(5000);

    // Look for any loading indicators
    const loadingElements = await page.$$eval('[class*="loading"], [class*="skeleton"], [class*="shimmer"], .animate-pulse',
      elements => elements.map(el => ({
        className: el.className,
        tagName: el.tagName,
        textContent: el.textContent.slice(0, 100),
        display: window.getComputedStyle(el).display
      }))
    );
    console.log('Loading elements found:', JSON.stringify(loadingElements, null, 2));

    console.log('Checking for image elements...');
    const images = await page.$$eval('img', imgs =>
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        loading: img.loading,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        width: img.width,
        height: img.height,
        display: window.getComputedStyle(img).display,
        visibility: window.getComputedStyle(img).visibility
      }))
    );

    console.log('Found images:', JSON.stringify(images, null, 2));

    // Check for room elements and their state
    const roomElements = await page.$$eval('[class*="room"], [data-testid*="room"], article',
      elements => elements.map(el => ({
        className: el.className,
        tagName: el.tagName,
        hasImages: el.querySelectorAll('img').length,
        textContent: el.textContent.slice(0, 100),
        display: window.getComputedStyle(el).display
      }))
    );
    console.log('Room elements found:', JSON.stringify(roomElements, null, 2));

    // Check for any error messages
    const errorMessages = await page.$$eval('[class*="error"], .text-red-500, [role="alert"]',
      elements => elements.map(el => ({
        className: el.className,
        textContent: el.textContent,
        display: window.getComputedStyle(el).display
      }))
    );
    console.log('Error messages found:', JSON.stringify(errorMessages, null, 2));

    // Check for any network failures
    const failedRequests = await page.evaluate(() => {
      return window.performance.getEntriesByType('navigation').concat(
        window.performance.getEntriesByType('resource')
      ).filter(entry => entry.responseStart === 0).map(entry => ({
        name: entry.name,
        type: entry.initiatorType
      }));
    });
    console.log('Failed network requests:', JSON.stringify(failedRequests, null, 2));

    // Take final screenshot
    console.log('Taking final screenshot...');
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/rooms-final.png', fullPage: true });

    console.log('Debug complete!');

  } catch (error) {
    console.error('Error during debugging:', error);
  } finally {
    await browser.close();
  }
}

debugRoomsPage();