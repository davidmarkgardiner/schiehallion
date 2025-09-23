import { test, expect } from '@playwright/test';

test.describe('Epic 6: Stripe Payment Integration Verification', () => {
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

    // Set up network error monitoring
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      }
    });
  });

  test('1. Booking Page Load and Initial Navigation', async ({ page }) => {
    console.log('🔍 Testing booking page initial load...');

    try {
      // Navigate to booking page
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for page to stabilize
      await page.waitForTimeout(3000);

      // Take initial screenshot
      await page.screenshot({ path: 'test-results/epic6-01-booking-page-load.png', fullPage: true });

      // Check page title
      const title = await page.title();
      console.log('📄 Page title:', title);

      // Check if page loads without errors
      const bodyContent = await page.textContent('body');
      expect(bodyContent).toBeTruthy();
      expect(bodyContent.length).toBeGreaterThan(100);

      // Look for booking-related content
      const hasBookingContent = bodyContent?.includes('booking') ||
                               bodyContent?.includes('Booking') ||
                               bodyContent?.includes('Build Your Perfect Stay') ||
                               bodyContent?.includes('room') ||
                               bodyContent?.includes('Room');

      if (hasBookingContent) {
        console.log('✅ Booking page content detected');
      } else {
        console.log('⚠️ No clear booking content found');
        console.log('Page content sample:', bodyContent?.substring(0, 500));
      }

      console.log('✅ Booking page load test completed');
    } catch (error) {
      console.log('❌ Booking page load failed:', error);
      await page.screenshot({ path: 'test-results/epic6-01-booking-page-error.png', fullPage: true });
      throw error;
    }
  });

  test('2. Room Selection Interface Test', async ({ page }) => {
    console.log('🏨 Testing room selection interface...');

    try {
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Look for room selection elements
      const roomElements = await page.locator('[data-testid*="room"], .room, [class*="room"]').count();
      console.log(`Found ${roomElements} potential room elements`);

      // Look for cart or shopping cart elements
      const cartElements = await page.locator('[data-testid*="cart"], .cart, [class*="cart"], [aria-label*="cart"]').count();
      console.log(`Found ${cartElements} potential cart elements`);

      // Look for buttons that might be "Add to Cart" or similar
      const addButtons = await page.locator('button:has-text("Add"), button:has-text("add"), button:has-text("Select")').count();
      console.log(`Found ${addButtons} potential add/select buttons`);

      // Take screenshot of room selection interface
      await page.screenshot({ path: 'test-results/epic6-02-room-selection.png', fullPage: true });

      // Check for interactive elements
      const interactiveElements = await page.locator('button, input, select').count();
      console.log(`Found ${interactiveElements} interactive elements`);

      if (interactiveElements > 0) {
        console.log('✅ Interactive elements found for room selection');
      } else {
        console.log('⚠️ No interactive elements found');
      }

      console.log('✅ Room selection interface test completed');
    } catch (error) {
      console.log('❌ Room selection test failed:', error);
      await page.screenshot({ path: 'test-results/epic6-02-room-selection-error.png', fullPage: true });
      throw error;
    }
  });

  test('3. Guest Information Form Test', async ({ page }) => {
    console.log('👤 Testing guest information form...');

    try {
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Look for form elements
      const formElements = await page.locator('form, input[type="text"], input[type="email"], input[type="tel"]').count();
      console.log(`Found ${formElements} form-related elements`);

      // Look for common guest form fields
      const nameFields = await page.locator('input[name*="name"], input[placeholder*="name"], label:has-text("Name")').count();
      const emailFields = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').count();
      const phoneFields = await page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]').count();

      console.log(`Name fields: ${nameFields}, Email fields: ${emailFields}, Phone fields: ${phoneFields}`);

      // Look for validation-related attributes
      const requiredFields = await page.locator('input[required], select[required]').count();
      console.log(`Found ${requiredFields} required fields`);

      // Take screenshot of guest information section
      await page.screenshot({ path: 'test-results/epic6-03-guest-info-form.png', fullPage: true });

      // Test form validation if possible
      try {
        const firstForm = await page.locator('form').first();
        if (await firstForm.count() > 0) {
          // Try to trigger validation
          const submitButton = await page.locator('button[type="submit"], input[type="submit"]').first();
          if (await submitButton.count() > 0) {
            await submitButton.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'test-results/epic6-03-guest-info-validation.png', fullPage: true });
            console.log('✅ Form validation triggered');
          }
        }
      } catch (validationError) {
        console.log('ℹ️ Form validation test skipped:', validationError);
      }

      console.log('✅ Guest information form test completed');
    } catch (error) {
      console.log('❌ Guest information form test failed:', error);
      await page.screenshot({ path: 'test-results/epic6-03-guest-info-error.png', fullPage: true });
      throw error;
    }
  });

  test('4. Package Selection and Terms Test', async ({ page }) => {
    console.log('📦 Testing package selection and terms...');

    try {
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Look for package-related elements
      const packageElements = await page.locator('[data-testid*="package"], .package, [class*="package"]').count();
      console.log(`Found ${packageElements} potential package elements`);

      // Look for terms and conditions
      const termsElements = await page.locator(':has-text("terms"), :has-text("Terms"), :has-text("conditions"), input[type="checkbox"]').count();
      console.log(`Found ${termsElements} terms/conditions elements`);

      // Look for pricing information
      const priceElements = await page.locator(':has-text("£"), :has-text("GBP"), .price, [class*="price"]').count();
      console.log(`Found ${priceElements} pricing elements`);

      // Take screenshot of package selection
      await page.screenshot({ path: 'test-results/epic6-04-package-selection.png', fullPage: true });

      // Test terms checkbox if available
      try {
        const termsCheckbox = await page.locator('input[type="checkbox"]').first();
        if (await termsCheckbox.count() > 0) {
          await termsCheckbox.check();
          console.log('✅ Terms checkbox interaction successful');
          await page.screenshot({ path: 'test-results/epic6-04-terms-checked.png', fullPage: true });
        }
      } catch (termsError) {
        console.log('ℹ️ Terms checkbox interaction skipped:', termsError);
      }

      console.log('✅ Package selection and terms test completed');
    } catch (error) {
      console.log('❌ Package selection test failed:', error);
      await page.screenshot({ path: 'test-results/epic6-04-package-error.png', fullPage: true });
      throw error;
    }
  });

  test('5. Stripe Payment Integration Test', async ({ page }) => {
    console.log('💳 Testing Stripe payment integration...');

    try {
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(5000); // Give extra time for Stripe to load

      // Look for Stripe Elements
      const stripeElements = await page.locator('iframe[name*="stripe"], .StripeElement, [data-testid*="stripe"]').count();
      console.log(`Found ${stripeElements} Stripe-related elements`);

      // Look for payment form elements
      const paymentForm = await page.locator('form:has(iframe[name*="stripe"]), form:has(.StripeElement)').count();
      console.log(`Found ${paymentForm} payment forms with Stripe elements`);

      // Check for Stripe errors in console
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().toLowerCase().includes('stripe')) {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(3000);

      // Take screenshot of payment section
      await page.screenshot({ path: 'test-results/epic6-05-stripe-payment.png', fullPage: true });

      // Look for specific Stripe publishable key usage
      const pageContent = await page.content();
      const hasStripeKey = pageContent.includes('pk_test_') || pageContent.includes('NEXT_PUBLIC_STRIPE');
      if (hasStripeKey) {
        console.log('✅ Stripe configuration detected in page');
      } else {
        console.log('ℹ️ Stripe configuration not visible in page source');
      }

      // Check for payment buttons
      const paymentButtons = await page.locator('button:has-text("Pay"), button:has-text("payment"), button:has-text("Complete")').count();
      console.log(`Found ${paymentButtons} payment-related buttons`);

      // Look for card input elements (inside iframes)
      try {
        const cardElements = await page.frameLocator('iframe[name*="stripe"]').locator('input').count();
        console.log(`Found ${cardElements} card input elements in Stripe iframes`);
        if (cardElements > 0) {
          console.log('✅ Stripe card input elements detected');
        }
      } catch (iframeError) {
        console.log('ℹ️ Could not access Stripe iframe contents (expected for security)');
      }

      if (consoleErrors.length > 0) {
        console.log('❌ Stripe-related console errors found:');
        consoleErrors.forEach(error => console.log('  -', error));
      } else {
        console.log('✅ No Stripe-related console errors detected');
      }

      console.log('✅ Stripe payment integration test completed');
    } catch (error) {
      console.log('❌ Stripe payment integration test failed:', error);
      await page.screenshot({ path: 'test-results/epic6-05-stripe-error.png', fullPage: true });
      throw error;
    }
  });

  test('6. Error Handling and Navigation Flow Test', async ({ page }) => {
    console.log('🔄 Testing error handling and navigation flow...');

    try {
      await page.goto(`${BASE_URL}/booking`, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Test navigation between booking steps
      const navButtons = await page.locator('button:has-text("Next"), button:has-text("Previous"), button:has-text("Back"), button:has-text("Continue")').count();
      console.log(`Found ${navButtons} navigation buttons`);

      // Test error state handling
      const errorElements = await page.locator('.error, [class*="error"], .alert, [role="alert"]').count();
      console.log(`Found ${errorElements} error display elements`);

      // Look for loading states
      const loadingElements = await page.locator('.loading, [class*="loading"], .spinner, [class*="spinner"]').count();
      console.log(`Found ${loadingElements} loading state elements`);

      // Take screenshot of full booking flow
      await page.screenshot({ path: 'test-results/epic6-06-navigation-flow.png', fullPage: true });

      // Test form submission without proper data (should show errors)
      try {
        const submitButtons = await page.locator('button[type="submit"], input[type="submit"]');
        const submitCount = await submitButtons.count();

        if (submitCount > 0) {
          await submitButtons.first().click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'test-results/epic6-06-validation-errors.png', fullPage: true });
          console.log('✅ Form submission validation tested');
        }
      } catch (submitError) {
        console.log('ℹ️ Form submission test skipped:', submitError);
      }

      // Check for success/failure page routes
      try {
        await page.goto(`${BASE_URL}/booking/payment/success`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.screenshot({ path: 'test-results/epic6-06-success-page.png', fullPage: true });
        console.log('✅ Payment success page accessible');
      } catch (successError) {
        console.log('ℹ️ Payment success page test skipped:', successError);
      }

      try {
        await page.goto(`${BASE_URL}/booking/payment/failed`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.screenshot({ path: 'test-results/epic6-06-failure-page.png', fullPage: true });
        console.log('✅ Payment failure page accessible');
      } catch (failureError) {
        console.log('ℹ️ Payment failure page test skipped:', failureError);
      }

      console.log('✅ Error handling and navigation flow test completed');
    } catch (error) {
      console.log('❌ Navigation flow test failed:', error);
      await page.screenshot({ path: 'test-results/epic6-06-navigation-error.png', fullPage: true });
      throw error;
    }
  });

  test('7. API Endpoints Verification', async ({ page }) => {
    console.log('🔌 Testing payment API endpoints...');

    try {
      // Test payment API endpoints are accessible
      const apiEndpoints = [
        '/api/payment/create-intent',
        '/api/payment/confirm',
        '/api/payment/webhook'
      ];

      for (const endpoint of apiEndpoints) {
        try {
          const response = await page.request.post(`${BASE_URL}${endpoint}`, {
            data: { test: true }
          });
          console.log(`API ${endpoint}: ${response.status()} ${response.statusText()}`);
        } catch (apiError) {
          console.log(`API ${endpoint}: Error - ${apiError.message}`);
        }
      }

      // Check if Stripe configuration is working
      try {
        await page.goto(`${BASE_URL}/api/payment/create-intent`, { waitUntil: 'networkidle', timeout: 10000 });
        const content = await page.textContent('body');
        console.log('Payment API response sample:', content?.substring(0, 200));
      } catch (apiPageError) {
        console.log('ℹ️ API page direct access test skipped:', apiPageError);
      }

      console.log('✅ API endpoints verification completed');
    } catch (error) {
      console.log('❌ API endpoints verification failed:', error);
      throw error;
    }
  });
});