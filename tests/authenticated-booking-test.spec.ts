import { test, expect } from '@playwright/test';

test.describe('Authenticated Booking and Stripe Integration Test', () => {
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      } else if (msg.type() === 'warning') {
        console.log('⚠️ Console Warning:', msg.text());
      }
    });

    // Monitor network responses
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      }
    });
  });

  test('Complete Authentication and Booking Flow Test', async ({ page }) => {
    console.log('🔐 Testing complete authentication and booking flow...');

    try {
      // 1. Navigate to booking page (should show login requirement)
      console.log('1️⃣ Accessing booking page...');
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(2000);

      // Take screenshot of access control page
      await page.screenshot({ path: 'auth-booking-01-access-control.png', fullPage: true });

      // Verify we see the access control screen
      const accessText = await page.textContent('body');
      const hasAccessRequired = accessText?.includes('Access Required') || accessText?.includes('log in');
      console.log('✅ Access control is working:', hasAccessRequired);

      // 2. Click the login button
      console.log('2️⃣ Clicking login button...');
      const loginButton = await page.locator('button:has-text("GO TO LOGIN")');
      if (await loginButton.count() > 0) {
        await loginButton.click();
        await page.waitForTimeout(2000);

        // Take screenshot of what happens after clicking login
        await page.screenshot({ path: 'auth-booking-02-after-login-click.png', fullPage: true });

        const currentUrl = page.url();
        console.log('📍 Current URL after login click:', currentUrl);
      } else {
        console.log('⚠️ Login button not found, might already be on login page');
      }

      // 3. Check if we're on a login page or if login modal appeared
      await page.waitForTimeout(2000);
      const currentContent = await page.textContent('body');
      const hasLoginForm = currentContent?.includes('email') ||
                          currentContent?.includes('password') ||
                          currentContent?.includes('Email') ||
                          currentContent?.includes('Password') ||
                          currentContent?.includes('Sign in') ||
                          currentContent?.includes('Login');

      console.log('🔐 Login form detected:', hasLoginForm);

      if (hasLoginForm) {
        // Try to find login form elements
        const emailInputs = await page.locator('input[type="email"], input[name*="email"]').count();
        const passwordInputs = await page.locator('input[type="password"], input[name*="password"]').count();
        const loginButtons = await page.locator('button:has-text("Sign"), button:has-text("Login"), button[type="submit"]').count();

        console.log(`📧 Email inputs: ${emailInputs}, 🔒 Password inputs: ${passwordInputs}, 🔘 Login buttons: ${loginButtons}`);

        // Take screenshot of login form
        await page.screenshot({ path: 'auth-booking-03-login-form.png', fullPage: true });

        // 4. Attempt to fill login form with test credentials
        if (emailInputs > 0 && passwordInputs > 0) {
          try {
            console.log('4️⃣ Attempting to fill login form...');

            await page.fill('input[type="email"], input[name*="email"]', 'test@example.com');
            await page.fill('input[type="password"], input[name*="password"]', 'testpassword123');

            await page.screenshot({ path: 'auth-booking-04-form-filled.png', fullPage: true });

            // Try to submit the form
            const submitButton = await page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Login")').first();
            if (await submitButton.count() > 0) {
              await submitButton.click();
              await page.waitForTimeout(3000);

              await page.screenshot({ path: 'auth-booking-05-after-login-attempt.png', fullPage: true });

              const postLoginUrl = page.url();
              console.log('📍 URL after login attempt:', postLoginUrl);
            }
          } catch (loginError) {
            console.log('⚠️ Login form interaction failed:', loginError);
          }
        }
      }

      // 5. Check if we can access booking page now or if we need to try alternative approach
      console.log('5️⃣ Checking if booking page is now accessible...');

      // Try navigating to booking page again
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(3000);

      const finalContent = await page.textContent('body');
      const stillRequiresAuth = finalContent?.includes('Access Required');

      if (!stillRequiresAuth) {
        console.log('✅ Successfully accessed booking page!');

        // Take screenshot of actual booking page
        await page.screenshot({ path: 'auth-booking-06-booking-page-success.png', fullPage: true });

        // 6. Test Stripe Elements if we're on the booking page
        console.log('6️⃣ Testing Stripe Elements on authenticated booking page...');

        // Look for Stripe elements
        const stripeIframes = await page.locator('iframe[name*="stripe"]').count();
        const stripeElements = await page.locator('.StripeElement').count();

        console.log(`💳 Stripe iframes found: ${stripeIframes}`);
        console.log(`💳 Stripe elements found: ${stripeElements}`);

        // Check for payment-related content
        const hasPaymentContent = finalContent?.includes('payment') ||
                                 finalContent?.includes('Payment') ||
                                 finalContent?.includes('card') ||
                                 finalContent?.includes('total');

        console.log(`💳 Has payment content: ${hasPaymentContent}`);

        // Look for booking form elements
        const forms = await page.locator('form').count();
        const inputs = await page.locator('input').count();
        const buttons = await page.locator('button').count();

        console.log(`📋 Forms: ${forms}, Inputs: ${inputs}, Buttons: ${buttons}`);

        await page.screenshot({ path: 'auth-booking-07-stripe-elements-check.png', fullPage: true });

      } else {
        console.log('⚠️ Still requires authentication - testing may need different credentials or approach');
        await page.screenshot({ path: 'auth-booking-06-still-requires-auth.png', fullPage: true });
      }

      console.log('✅ Authentication and booking flow test completed');

    } catch (error) {
      console.log('❌ Test failed:', error);
      await page.screenshot({ path: 'auth-booking-error.png', fullPage: true });
      throw error;
    }
  });

  test('Direct API Endpoints Test', async ({ page }) => {
    console.log('🔌 Testing payment API endpoints directly...');

    try {
      // Test the payment API endpoints
      const endpoints = [
        { path: '/api/payment/create-intent', method: 'POST' },
        { path: '/api/payment/confirm', method: 'POST' },
        { path: '/api/payment/webhook', method: 'POST' }
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔗 Testing ${endpoint.method} ${endpoint.path}...`);

          const response = await page.request.post(`${BASE_URL}${endpoint.path}`, {
            data: { test: true, amount: 1000 },
            headers: { 'Content-Type': 'application/json' }
          });

          console.log(`✅ ${endpoint.path}: ${response.status()} ${response.statusText()}`);

          if (response.status() === 200) {
            const responseBody = await response.text();
            console.log(`📄 Response sample: ${responseBody.substring(0, 200)}...`);
          }

        } catch (apiError) {
          console.log(`❌ ${endpoint.path}: ${apiError.message}`);
        }
      }

      console.log('✅ API endpoints test completed');

    } catch (error) {
      console.log('❌ API test failed:', error);
      throw error;
    }
  });

  test('Environment Variables and Configuration Test', async ({ page }) => {
    console.log('⚙️ Testing environment configuration...');

    try {
      // Navigate to a page that might expose environment info
      await page.goto(`${BASE_URL}/`, { waitUntil: 'load', timeout: 15000 });

      // Check page source for environment hints
      const content = await page.content();

      const hasNextPublic = content.includes('NEXT_PUBLIC');
      const hasStripeRef = content.includes('stripe') || content.includes('Stripe');
      const hasFirebaseRef = content.includes('firebase') || content.includes('Firebase');

      console.log(`🔧 Has NEXT_PUBLIC variables: ${hasNextPublic}`);
      console.log(`🔧 Has Stripe references: ${hasStripeRef}`);
      console.log(`🔧 Has Firebase references: ${hasFirebaseRef}`);

      // Test if we can access the booking page source
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'load', timeout: 15000 });
      const bookingSource = await page.content();

      const hasStripeElements = bookingSource.includes('StripeElement') ||
                               bookingSource.includes('stripe-js') ||
                               bookingSource.includes('pk_test_');

      console.log(`💳 Booking page has Stripe code: ${hasStripeElements}`);

      await page.screenshot({ path: 'environment-config-check.png', fullPage: true });

      console.log('✅ Environment configuration test completed');

    } catch (error) {
      console.log('❌ Environment test failed:', error);
      throw error;
    }
  });
});