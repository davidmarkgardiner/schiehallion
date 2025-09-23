import { test } from '@playwright/test';

test('Simple screenshot test of booking page', async ({ page }) => {
  console.log('📸 Taking screenshot of booking page...');

  // Set longer timeout and collect console logs
  const logs: string[] = [];

  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    // Navigate to booking page with increased timeout
    await page.goto('http://localhost:3002/booking', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait a bit for any async loading
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/booking-page-screenshot.png',
      fullPage: true
    });

    // Get page title and some content
    const title = await page.title();
    const bodyText = await page.textContent('body');

    console.log(`📄 Page title: ${title}`);
    console.log(`📝 Body content length: ${bodyText?.length || 0}`);
    console.log(`📊 Console logs: ${logs.length}`);

    // Print first few console logs
    if (logs.length > 0) {
      console.log('🔍 Console messages:');
      logs.slice(0, 10).forEach((log, i) => {
        console.log(`  ${i + 1}. ${log.substring(0, 100)}...`);
      });
    }

    // Look for specific content
    if (bodyText?.includes('404')) {
      console.log('❌ Page shows 404 error');
    }
    if (bodyText?.includes('booking')) {
      console.log('✅ Page contains booking content');
    }
    if (bodyText?.includes('Loading')) {
      console.log('🔄 Page shows loading state');
    }

    console.log('✅ Screenshot saved to test-results/booking-page-screenshot.png');

  } catch (error) {
    console.log('❌ Error during test:', error);

    // Try to take screenshot anyway
    try {
      await page.screenshot({
        path: 'test-results/booking-page-error-screenshot.png'
      });
      console.log('📸 Error screenshot saved');
    } catch (screenshotError) {
      console.log('❌ Could not take error screenshot:', screenshotError);
    }
  }
});