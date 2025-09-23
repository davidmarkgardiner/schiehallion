import { test, expect } from '@playwright/test';

test.describe('Simple Booking Page Verification', () => {
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Set up console logging to capture all errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      } else if (msg.type() === 'warning') {
        console.log('⚠️ Console Warning:', msg.text());
      } else if (msg.type() === 'log') {
        console.log('ℹ️ Console Log:', msg.text());
      }
    });

    // Monitor network responses
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      }
    });
  });

  test('Basic Booking Page Load Test', async ({ page }) => {
    console.log('🔍 Testing basic booking page access...');

    try {
      // Navigate to booking page with reduced timeout
      await page.goto(`${BASE_URL}/booking`, {
        waitUntil: 'load',
        timeout: 15000
      });

      // Wait a moment for dynamic content
      await page.waitForTimeout(2000);

      // Take screenshot
      await page.screenshot({
        path: 'booking-page-basic.png',
        fullPage: true
      });

      // Get page title
      const title = await page.title();
      console.log('📄 Page title:', title);

      // Check if page has content
      const bodyText = await page.textContent('body');
      const hasContent = bodyText && bodyText.trim().length > 100;

      console.log('📝 Page content length:', bodyText?.length || 0);
      console.log('✅ Has substantial content:', hasContent);

      // Look for key booking elements
      const hasBookingKeywords = bodyText?.toLowerCase().includes('booking') ||
                                bodyText?.toLowerCase().includes('room') ||
                                bodyText?.toLowerCase().includes('guest');

      console.log('🏨 Has booking-related content:', hasBookingKeywords);

      // Check for forms
      const formCount = await page.locator('form').count();
      const inputCount = await page.locator('input').count();
      const buttonCount = await page.locator('button').count();

      console.log(`📋 Forms: ${formCount}, Inputs: ${inputCount}, Buttons: ${buttonCount}`);

      // Basic assertions
      expect(hasContent).toBeTruthy();
      expect(title).toBeTruthy();

    } catch (error) {
      console.log('❌ Test failed:', error);
      await page.screenshot({
        path: 'booking-page-error.png',
        fullPage: true
      });
      throw error;
    }
  });

  test('Stripe Elements Detection Test', async ({ page }) => {
    console.log('💳 Testing Stripe Elements detection...');

    try {
      await page.goto(`${BASE_URL}/booking`, {
        waitUntil: 'load',
        timeout: 15000
      });

      // Wait longer for Stripe to potentially load
      await page.waitForTimeout(5000);

      // Look for Stripe-related elements
      const stripeIframes = await page.locator('iframe[name*="stripe"]').count();
      const stripeElements = await page.locator('.StripeElement').count();
      const stripeContainers = await page.locator('[data-testid*="stripe"]').count();

      console.log(`💳 Stripe iframes: ${stripeIframes}`);
      console.log(`💳 Stripe elements: ${stripeElements}`);
      console.log(`💳 Stripe containers: ${stripeContainers}`);

      // Check page source for Stripe configuration
      const content = await page.content();
      const hasStripeScript = content.includes('stripe') || content.includes('Stripe');
      const hasStripeKey = content.includes('pk_test_') || content.includes('STRIPE');

      console.log(`💳 Has Stripe in source: ${hasStripeScript}`);
      console.log(`💳 Has Stripe key: ${hasStripeKey}`);

      await page.screenshot({
        path: 'stripe-elements-check.png',
        fullPage: true
      });

    } catch (error) {
      console.log('❌ Stripe test failed:', error);
      await page.screenshot({
        path: 'stripe-elements-error.png',
        fullPage: true
      });
      throw error;
    }
  });
});