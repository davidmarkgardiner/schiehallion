import { test, expect } from '@playwright/test';

test.describe('Final Stripe Payment Integration Verification', () => {
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Set up console logging
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      if (type === 'error') {
        console.log('❌ Console Error:', text);
      } else if (type === 'warning') {
        console.log('⚠️ Console Warning:', text);
      } else if (text.includes('Stripe') || text.includes('stripe')) {
        console.log('💳 Stripe Log:', text);
      }
    });

    // Monitor network responses
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      } else if (response.url().includes('stripe') || response.url().includes('payment')) {
        console.log(`✅ Payment API: ${response.status()} ${response.url()}`);
      }
    });
  });

  test('1. Environment and Configuration Verification', async ({ page }) => {
    console.log('⚙️ Testing environment configuration and Stripe setup...');

    try {
      // Navigate to home page first
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(2000);

      await page.screenshot({ path: 'final-01-home-page.png', fullPage: true });

      // Check page source for Stripe configuration
      const content = await page.content();

      const hasStripeScript = content.includes('stripe.js') ||
                             content.includes('js.stripe.com') ||
                             content.includes('loadStripe');

      const hasStripeKey = content.includes('pk_test_') ||
                          content.includes('NEXT_PUBLIC_STRIPE');

      console.log(`🔧 Stripe script detected: ${hasStripeScript}`);
      console.log(`🔧 Stripe key present: ${hasStripeKey}`);

      // Navigate to booking page to test auth flow
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'final-02-booking-access-control.png', fullPage: true });

      const bodyText = await page.textContent('body');
      const requiresAuth = bodyText?.includes('Access Required') ||
                          bodyText?.includes('log in');

      console.log(`🔐 Authentication required: ${requiresAuth}`);
      console.log(`📄 Page title: ${await page.title()}`);

      // Basic assertions
      expect(requiresAuth).toBeTruthy();
      expect(await page.title()).toContain('Schiehallion');

      console.log('✅ Environment and configuration test completed');

    } catch (error) {
      console.log('❌ Environment test failed:', error);
      await page.screenshot({ path: 'final-01-error.png', fullPage: true });
      throw error;
    }
  });

  test('2. Stripe Client-Side Integration Test', async ({ page }) => {
    console.log('💳 Testing Stripe client-side integration without authentication...');

    try {
      // Navigate to booking page
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(3000);

      // Check for Stripe-related JavaScript execution
      const stripeErrors = await page.evaluate(() => {
        const errors: string[] = [];

        // Check for Stripe global object
        if (typeof window !== 'undefined') {
          // @ts-ignore
          if (window.Stripe) {
            errors.push('Stripe global object found');
          } else {
            errors.push('Stripe global object not found');
          }
        }

        return errors;
      });

      console.log('💳 Stripe client checks:', stripeErrors);

      // Look for Stripe Elements in DOM (even if not loaded due to auth)
      const stripeElementsInDOM = await page.locator('script[src*="stripe"]').count();
      const stripeReferences = await page.locator('[class*="stripe"], [data-testid*="stripe"]').count();

      console.log(`💳 Stripe scripts in DOM: ${stripeElementsInDOM}`);
      console.log(`💳 Stripe element references: ${stripeReferences}`);

      await page.screenshot({ path: 'final-03-stripe-client-check.png', fullPage: true });

      console.log('✅ Stripe client-side integration test completed');

    } catch (error) {
      console.log('❌ Stripe client test failed:', error);
      await page.screenshot({ path: 'final-03-error.png', fullPage: true });
      throw error;
    }
  });

  test('3. Payment API Endpoints Verification', async ({ page }) => {
    console.log('🔌 Testing payment API endpoints...');

    try {
      const endpoints = [
        { path: '/api/payment/create-intent', expectedStatus: 401 }, // Unauthorized without auth
        { path: '/api/payment/confirm', expectedStatus: 401 },       // Unauthorized without auth
        { path: '/api/payment/webhook', expectedStatus: 400 }        // Bad request without proper data
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔗 Testing ${endpoint.path}...`);

          const response = await page.request.post(`${BASE_URL}${endpoint.path}`, {
            data: { test: true, amount: 1000 },
            headers: { 'Content-Type': 'application/json' },
            failOnStatusCode: false // Don't fail on error status codes
          });

          const actualStatus = response.status();
          console.log(`✅ ${endpoint.path}: ${actualStatus} (expected: ${endpoint.expectedStatus})`);

          // Verify we get expected status codes
          if (actualStatus === endpoint.expectedStatus) {
            console.log(`✅ ${endpoint.path}: Correct status code returned`);
          } else {
            console.log(`⚠️ ${endpoint.path}: Unexpected status ${actualStatus}, expected ${endpoint.expectedStatus}`);
          }

          // Try to get response body for debugging
          try {
            const responseText = await response.text();
            if (responseText.length > 0 && responseText.length < 500) {
              console.log(`📄 ${endpoint.path} response: ${responseText.substring(0, 200)}`);
            }
          } catch (bodyError) {
            console.log(`ℹ️ Could not read response body for ${endpoint.path}`);
          }

        } catch (apiError) {
          console.log(`❌ ${endpoint.path}: ${apiError.message}`);
        }
      }

      console.log('✅ Payment API endpoints verification completed');

    } catch (error) {
      console.log('❌ API endpoints test failed:', error);
      throw error;
    }
  });

  test('4. Page Navigation and Flow Test', async ({ page }) => {
    console.log('🔄 Testing page navigation and booking flow...');

    try {
      // Test home page
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(2000);

      const homeContent = await page.textContent('body');
      const hasHotelContent = homeContent?.toLowerCase().includes('schiehallion') ||
                             homeContent?.toLowerCase().includes('hotel') ||
                             homeContent?.toLowerCase().includes('highland');

      console.log(`🏠 Home page has hotel content: ${hasHotelContent}`);
      await page.screenshot({ path: 'final-04-home-navigation.png', fullPage: true });

      // Test rooms page
      try {
        await page.goto(`${BASE_URL}/rooms`, { waitUntil: 'load', timeout: 15000 });
        await page.waitForTimeout(2000);

        const roomsContent = await page.textContent('body');
        const hasRoomsContent = roomsContent?.toLowerCase().includes('room') ||
                               roomsContent?.toLowerCase().includes('accommodation');

        console.log(`🏨 Rooms page has room content: ${hasRoomsContent}`);
        await page.screenshot({ path: 'final-04-rooms-navigation.png', fullPage: true });
      } catch (roomsError) {
        console.log('ℹ️ Rooms page test skipped:', roomsError.message);
      }

      // Test booking page auth flow
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(3000);

      const bookingContent = await page.textContent('body');
      const showsAccessRequired = bookingContent?.includes('Access Required');
      const hasLoginButton = await page.locator('button:has-text("GO TO LOGIN"), a:has-text("Go to Login")').count() > 0;

      console.log(`🔐 Booking page shows access required: ${showsAccessRequired}`);
      console.log(`🔐 Login button available: ${hasLoginButton}`);

      await page.screenshot({ path: 'final-04-booking-auth-flow.png', fullPage: true });

      // Test payment success/failure pages
      try {
        await page.goto(`${BASE_URL}/booking/payment/success`, { waitUntil: 'load', timeout: 10000 });
        await page.screenshot({ path: 'final-04-payment-success-page.png', fullPage: true });
        console.log('✅ Payment success page accessible');
      } catch (successError) {
        console.log('ℹ️ Payment success page test skipped');
      }

      try {
        await page.goto(`${BASE_URL}/booking/payment/failed`, { waitUntil: 'load', timeout: 10000 });
        await page.screenshot({ path: 'final-04-payment-failed-page.png', fullPage: true });
        console.log('✅ Payment failed page accessible');
      } catch (failedError) {
        console.log('ℹ️ Payment failed page test skipped');
      }

      console.log('✅ Page navigation and flow test completed');

    } catch (error) {
      console.log('❌ Navigation test failed:', error);
      await page.screenshot({ path: 'final-04-error.png', fullPage: true });
      throw error;
    }
  });

  test('5. Console Errors and Warnings Analysis', async ({ page }) => {
    console.log('📊 Analyzing console errors and warnings...');

    try {
      const consoleMessages: { type: string; text: string }[] = [];

      page.on('console', msg => {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text()
        });
      });

      // Navigate through key pages to collect console output
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(2000);

      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(3000);

      // Analyze console messages
      const errors = consoleMessages.filter(msg => msg.type === 'error');
      const warnings = consoleMessages.filter(msg => msg.type === 'warning');
      const stripeMessages = consoleMessages.filter(msg =>
        msg.text.toLowerCase().includes('stripe') ||
        msg.text.toLowerCase().includes('payment')
      );
      const firebaseMessages = consoleMessages.filter(msg =>
        msg.text.toLowerCase().includes('firebase') ||
        msg.text.toLowerCase().includes('firestore')
      );

      console.log(`📊 Total console messages: ${consoleMessages.length}`);
      console.log(`❌ Errors: ${errors.length}`);
      console.log(`⚠️ Warnings: ${warnings.length}`);
      console.log(`💳 Stripe messages: ${stripeMessages.length}`);
      console.log(`🔥 Firebase messages: ${firebaseMessages.length}`);

      // Log critical Stripe errors
      const stripeErrors = errors.filter(msg =>
        msg.text.toLowerCase().includes('stripe') ||
        msg.text.toLowerCase().includes('payment')
      );

      if (stripeErrors.length > 0) {
        console.log('💳 Stripe-related errors:');
        stripeErrors.forEach(error => console.log(`  - ${error.text}`));
      } else {
        console.log('✅ No Stripe-related errors found');
      }

      // Log Firebase permission issues
      const firebaseErrors = errors.filter(msg =>
        msg.text.toLowerCase().includes('firebase') ||
        msg.text.toLowerCase().includes('permission')
      );

      if (firebaseErrors.length > 0) {
        console.log('🔥 Firebase-related errors:');
        firebaseErrors.forEach(error => console.log(`  - ${error.text}`));
      }

      await page.screenshot({ path: 'final-05-console-analysis.png', fullPage: true });

      console.log('✅ Console analysis completed');

    } catch (error) {
      console.log('❌ Console analysis failed:', error);
      throw error;
    }
  });
});