import { test, expect } from '@playwright/test';

test.describe('Stripe Payment Visual Verification', () => {
  const BASE_URL = 'http://localhost:3002';

  test('Visual verification of booking page with Stripe integration', async ({ page }) => {
    console.log('🎨 Running visual verification of booking page...');

    // Collect console messages for analysis
    const consoleMessages: string[] = [];
    const errors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(`[${msg.type()}] ${text}`);

      if (msg.type() === 'error') {
        errors.push(text);
        console.log('❌ Console Error:', text);
      }
    });

    // Navigate to booking page
    await page.goto(`${BASE_URL}/booking`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for page to load completely
    await page.waitForTimeout(5000);

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/stripe-booking-page-full.png',
      fullPage: true
    });

    // Get page content for analysis
    const pageContent = await page.textContent('body');
    const hasContent = pageContent && pageContent.length > 100;

    console.log('📊 Page Analysis:');
    console.log(`  - Page has content: ${hasContent}`);
    console.log(`  - Content length: ${pageContent?.length || 0} characters`);
    console.log(`  - Console messages: ${consoleMessages.length}`);
    console.log(`  - Errors found: ${errors.length}`);

    // Check for specific elements
    const elementsToCheck = [
      { selector: 'button', description: 'buttons' },
      { selector: 'input', description: 'input fields' },
      { selector: 'form', description: 'forms' },
      { selector: 'iframe', description: 'iframes (potential Stripe elements)' },
      { selector: '[class*="stripe"], [id*="stripe"]', description: 'Stripe-related elements' },
      { selector: '.error, [class*="error"]', description: 'error elements' },
    ];

    console.log('\n📋 Element Count Analysis:');
    for (const element of elementsToCheck) {
      try {
        const count = await page.locator(element.selector).count();
        console.log(`  - ${element.description}: ${count}`);
      } catch (e) {
        console.log(`  - ${element.description}: Error counting - ${e}`);
      }
    }

    // Check for key text content
    const textChecks = [
      'stripe',
      'payment',
      'booking',
      'room',
      'card',
      'error',
      'loading'
    ];

    console.log('\n🔍 Text Content Analysis:');
    for (const text of textChecks) {
      const hasText = pageContent?.toLowerCase().includes(text.toLowerCase()) || false;
      console.log(`  - Contains "${text}": ${hasText}`);
    }

    // Take viewport screenshot
    await page.screenshot({
      path: 'test-results/stripe-booking-page-viewport.png'
    });

    // Try to scroll and capture different sections
    try {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'test-results/stripe-booking-page-scrolled.png'
      });
    } catch (scrollError) {
      console.log('ℹ️ Scroll capture skipped:', scrollError);
    }

    // Print error summary
    if (errors.length > 0) {
      console.log('\n❌ Errors Found:');
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.substring(0, 100)}...`);
      });
    } else {
      console.log('\n✅ No JavaScript errors detected');
    }

    // Print console messages summary
    console.log(`\n📝 Console Summary: ${consoleMessages.length} total messages`);
    const messageTypes = consoleMessages.reduce((acc, msg) => {
      const type = msg.split(']')[0].replace('[', '');
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(messageTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    console.log('\n✅ Visual verification completed');
    console.log('📸 Screenshots saved:');
    console.log('  - test-results/stripe-booking-page-full.png');
    console.log('  - test-results/stripe-booking-page-viewport.png');
    console.log('  - test-results/stripe-booking-page-scrolled.png');
  });

  test('Test payment success and failure pages', async ({ page }) => {
    console.log('🎯 Testing payment result pages...');

    // Test success page
    try {
      await page.goto(`${BASE_URL}/booking/payment/success`, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      await page.screenshot({
        path: 'test-results/stripe-success-page.png',
        fullPage: true
      });

      const successContent = await page.textContent('body');
      console.log('✅ Success page loaded');
      console.log(`  - Content length: ${successContent?.length || 0}`);
      console.log(`  - Contains "success": ${successContent?.toLowerCase().includes('success') || false}`);

    } catch (successError) {
      console.log('❌ Success page error:', successError);
      await page.screenshot({
        path: 'test-results/stripe-success-page-error.png'
      });
    }

    // Test failure page
    try {
      await page.goto(`${BASE_URL}/booking/payment/failed`, {
        waitUntil: 'networkidle',
        timeout: 15000
      });

      await page.screenshot({
        path: 'test-results/stripe-failure-page.png',
        fullPage: true
      });

      const failureContent = await page.textContent('body');
      console.log('✅ Failure page loaded');
      console.log(`  - Content length: ${failureContent?.length || 0}`);
      console.log(`  - Contains "failed": ${failureContent?.toLowerCase().includes('failed') || false}`);

    } catch (failureError) {
      console.log('❌ Failure page error:', failureError);
      await page.screenshot({
        path: 'test-results/stripe-failure-page-error.png'
      });
    }

    console.log('✅ Payment result pages test completed');
  });

  test('Test API endpoints accessibility', async ({ page }) => {
    console.log('🔌 Testing API endpoints...');

    const endpoints = [
      '/api/payment/create-intent',
      '/api/payment/confirm',
      '/api/payment/webhook'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await page.request.post(`${BASE_URL}${endpoint}`, {
          data: { test: true },
          timeout: 10000
        });

        console.log(`📡 ${endpoint}: ${response.status()} ${response.statusText()}`);

        if (response.status() !== 404) {
          try {
            const text = await response.text();
            console.log(`  Response preview: ${text.substring(0, 100)}...`);
          } catch (textError) {
            console.log('  Response text not available');
          }
        }

      } catch (apiError) {
        console.log(`❌ ${endpoint}: ${apiError}`);
      }
    }

    console.log('✅ API endpoints test completed');
  });
});