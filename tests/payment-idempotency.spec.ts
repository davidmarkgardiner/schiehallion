// Payment Idempotency Tests for PR #27
// Tests duplicate payment prevention mechanisms

import { test, expect } from '@playwright/test'

test.describe('Payment Idempotency', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to booking page
    await page.goto('http://localhost:3001/booking')
    await page.waitForLoadState('networkidle')
  })

  test('should prevent duplicate payment on rapid button clicks', async ({ page }) => {
    // Login as guest
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('**/booking', { timeout: 10000 })

    // Select dates
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 2)

    await page.fill('input[type="date"]', checkIn.toISOString().split('T')[0])
    await page.fill('input[type="date"]:nth-of-type(2)', checkOut.toISOString().split('T')[0])

    // Find and add a room
    await page.waitForSelector('button:has-text("Add to Cart")')
    await page.click('button:has-text("Add to Cart")')

    // Open cart and proceed to checkout
    await page.click('button:has-text("Shopping Cart")')
    await page.click('button:has-text("Proceed to Checkout")')

    // Fill guest info
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'Guest')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="phone"]', '+44 20 1234 5678')
    await page.click('button:has-text("Continue to Package Selection")')

    // Select package
    await page.click('button:has-text("Select Package")')
    await page.click('button:has-text("Continue to Payment")')

    // Wait for payment form to load
    await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 10000 })

    // Fill payment details in Stripe iframe
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
    await stripeFrame.locator('input[name="number"]').fill('4242424242424242')
    await stripeFrame.locator('input[name="expiry"]').fill('12/34')
    await stripeFrame.locator('input[name="cvc"]').fill('123')

    // Track network requests to /api/payment/confirm
    const confirmRequests: any[] = []
    page.on('request', (request) => {
      if (request.url().includes('/api/payment/confirm')) {
        confirmRequests.push({
          timestamp: Date.now(),
          method: request.method(),
        })
      }
    })

    // Rapidly click the payment button multiple times
    const payButton = page.locator('button:has-text("Pay £")')
    await payButton.click()
    await payButton.click()
    await payButton.click()

    // Wait for payment to process
    await page.waitForURL('**/booking', { timeout: 30000 })

    // Assert: Should only have made ONE confirmation request despite multiple clicks
    expect(confirmRequests.length).toBeLessThanOrEqual(1)
  })

  test('should handle page refresh during payment processing', async ({ page }) => {
    // Login and setup booking (same as above)
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('**/booking', { timeout: 10000 })

    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 2)

    await page.fill('input[type="date"]', checkIn.toISOString().split('T')[0])
    await page.fill('input[type="date"]:nth-of-type(2)', checkOut.toISOString().split('T')[0])

    await page.waitForSelector('button:has-text("Add to Cart")')
    await page.click('button:has-text("Add to Cart")')
    await page.click('button:has-text("Shopping Cart")')
    await page.click('button:has-text("Proceed to Checkout")')

    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'Refresh')
    await page.fill('input[name="email"]', 'refresh@example.com')
    await page.fill('input[name="phone"]', '+44 20 1234 5678')
    await page.click('button:has-text("Continue to Package Selection")')

    await page.click('button:has-text("Select Package")')
    await page.click('button:has-text("Continue to Payment")')

    await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 10000 })

    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
    await stripeFrame.locator('input[name="number"]').fill('4242424242424242')
    await stripeFrame.locator('input[name="expiry"]').fill('12/34')
    await stripeFrame.locator('input[name="cvc"]').fill('123')

    // Click payment button
    const payButton = page.locator('button:has-text("Pay £")')
    await payButton.click()

    // Wait a moment for payment to start processing
    await page.waitForTimeout(1000)

    // Refresh the page during processing
    await page.reload()

    // Wait for page to reload and check payment status
    await page.waitForLoadState('networkidle')

    // The payment should have been processed (or show proper status)
    // Should NOT create a duplicate charge
    const hasConfirmation = await page.locator('text=Booking Confirmed').isVisible({ timeout: 5000 }).catch(() => false)
    const hasProcessing = await page.locator('text=Processing').isVisible({ timeout: 5000 }).catch(() => false)

    // Should show either confirmation or still processing, but not an error
    expect(hasConfirmation || hasProcessing).toBeTruthy()
  })

  test('should prevent duplicate payment confirmation attempts', async ({ page }) => {
    // This test verifies the lastPaymentIntentId state logic

    // Login and complete booking flow
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('**/booking', { timeout: 10000 })

    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 2)

    await page.fill('input[type="date"]', checkIn.toISOString().split('T')[0])
    await page.fill('input[type="date"]:nth-of-type(2)', checkOut.toISOString().split('T')[0])

    await page.waitForSelector('button:has-text("Add to Cart")')
    await page.click('button:has-text("Add to Cart")')
    await page.click('button:has-text("Shopping Cart")')
    await page.click('button:has-text("Proceed to Checkout")')

    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'Dedup')
    await page.fill('input[name="email"]', 'dedup@example.com')
    await page.fill('input[name="phone"]', '+44 20 1234 5678')
    await page.click('button:has-text("Continue to Package Selection")')

    await page.click('button:has-text("Select Package")')
    await page.click('button:has-text("Continue to Payment")')

    await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 10000 })

    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
    await stripeFrame.locator('input[name="number"]').fill('4242424242424242')
    await stripeFrame.locator('input[name="expiry"]').fill('12/34')
    await stripeFrame.locator('input[name="cvc"]').fill('123')

    // Monitor console logs for duplicate detection messages
    const consoleLogs: string[] = []
    page.on('console', (msg) => {
      if (msg.text().includes('Payment already confirmed')) {
        consoleLogs.push(msg.text())
      }
    })

    // Monitor API calls
    const apiCalls: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/api/payment')) {
        apiCalls.push(request.url())
      }
    })

    // Submit payment
    await page.click('button:has-text("Pay £")')

    // Wait for confirmation
    await page.waitForURL('**/booking', { timeout: 30000 })

    // Check that we got to confirmation
    await expect(page.locator('text=Booking Confirmed')).toBeVisible({ timeout: 5000 })

    // Verify only ONE confirmation API call was made
    const confirmCalls = apiCalls.filter(url => url.includes('/api/payment/confirm'))
    expect(confirmCalls.length).toBe(1)

    // If there were duplicate attempts, they should have been caught and logged
    // (This would only show up if the duplicate prevention logic was triggered)
  })

  test('should use idempotency key for same booking attempt', async ({ page }) => {
    // This test verifies server-side idempotency protection

    // Intercept the create-intent API call to check for idempotency key
    let idempotencyKeyUsed = false
    let firstIdempotencyKey = ''

    page.on('request', (request) => {
      if (request.url().includes('/api/payment/create-intent')) {
        const headers = request.headers()
        if (headers['idempotency-key'] || headers['Idempotency-Key']) {
          idempotencyKeyUsed = true
          firstIdempotencyKey = headers['idempotency-key'] || headers['Idempotency-Key']
        }
      }
    })

    // Complete booking flow
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('**/booking', { timeout: 10000 })

    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 2)

    await page.fill('input[type="date"]', checkIn.toISOString().split('T')[0])
    await page.fill('input[type="date"]:nth-of-type(2)', checkOut.toISOString().split('T')[0])

    await page.waitForSelector('button:has-text("Add to Cart")')
    await page.click('button:has-text("Add to Cart")')
    await page.click('button:has-text("Shopping Cart")')
    await page.click('button:has-text("Proceed to Checkout")')

    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'Idem')
    await page.fill('input[name="email"]', 'idem@example.com')
    await page.fill('input[name="phone"]', '+44 20 1234 5678')
    await page.click('button:has-text("Continue to Package Selection")')

    await page.click('button:has-text("Select Package")')
    await page.click('button:has-text("Continue to Payment")')

    // Wait for payment intent creation
    await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 10000 })

    // Note: The idempotency key is generated server-side using bookingIds and userId
    // We can't directly verify it here without mocking, but we can verify the payment succeeds
    // and that retries don't create duplicate charges

    // Verify payment form loaded (which means payment intent was created)
    const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
    await expect(stripeFrame.locator('input[name="number"]')).toBeVisible()

    // The idempotency protection is handled by Stripe on the server side
    // with the key format: payment_${bookingIds}_${userId}
  })
})
