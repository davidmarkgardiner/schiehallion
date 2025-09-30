const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const consoleMessages = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (text.includes('IntegrationError') || text.includes('clientSecret')) {
      console.log('[STRIPE ERROR]:', text);
      errors.push(text);
    }
  });

  page.on('pageerror', error => {
    console.log('[PAGE ERROR]:', error.message);
    if (error.message.includes('IntegrationError') || error.message.includes('clientSecret')) {
      errors.push(error.message);
    }
  });

  try {
    console.log('=== STRIPE PAYMENT INTEGRATION VERIFICATION ===\n');
    
    console.log('Step 1: Navigating to booking page...');
    await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const initialUrl = page.url();
    console.log('Current URL:', initialUrl);

    // Check if redirected to login
    if (initialUrl.includes('/login')) {
      console.log('\nStep 2: Logging in...');
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/verify-1-login.png' });
      
      await page.fill('input[type="email"]', 'playright@example.com');
      await page.fill('input[type="password"]', 'playright');
      await page.click('button[type="submit"]');
      
      try {
        await page.waitForNavigation({ timeout: 10000 });
      } catch (e) {
        console.log('Navigation after login may have failed, continuing...');
      }
      
      await page.waitForTimeout(3000);
      console.log('After login URL:', page.url());
      await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/verify-2-after-login.png' });
    }

    console.log('\nStep 3: Checking page content...');
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    const bodyText = await page.locator('body').textContent();
    const hasBookingContent = bodyText.includes('Book') || bodyText.includes('Room') || bodyText.includes('Check');
    console.log('Has booking-related content:', hasBookingContent);

    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/verify-3-booking-page.png' });

    console.log('\nStep 4: Checking for Stripe-related errors...');
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('\n❌ FOUND STRIPE ERRORS:');
      errors.forEach(err => console.log('  -', err));
    } else {
      console.log('✓ No Stripe integration errors detected on initial load');
    }

    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log('Errors found:', errors.length);
    console.log('Console messages captured:', consoleMessages.length);
    
    // Check for specific error patterns
    const hasIntegrationError = errors.some(e => e.includes('IntegrationError'));
    const hasClientSecretError = errors.some(e => e.includes('clientSecret'));
    
    if (hasIntegrationError) {
      console.log('\n❌ FAIL: Stripe IntegrationError still present');
    } else if (hasClientSecretError) {
      console.log('\n⚠️  WARNING: clientSecret-related issues detected');
    } else {
      console.log('\n✓ PASS: No Stripe integration errors detected');
    }

    console.log('\nScreenshots saved for review.');

  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
    await page.screenshot({ path: '/Users/davidgardiner/Desktop/repo/schiehallion/verify-error.png' });
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
})();
