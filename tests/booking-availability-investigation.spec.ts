import { test, expect } from '@playwright/test'

const TEST_USER = {
  email: 'playright@example.com',
  password: 'playright'
}

test.describe('Booking Flow Availability Error Investigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('investigate when availability error appears in booking flow', async ({ page }) => {
    console.log('=== STEP 1: LOGIN ===')

    // Login
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')

    // Wait for login to complete
    await page.waitForURL('**/', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    console.log('✓ Login successful')
    await page.screenshot({ path: '/tmp/01-after-login.png', fullPage: true })

    console.log('\n=== STEP 2: NAVIGATE TO BOOKING PAGE ===')

    // Navigate to booking page
    await page.goto('/booking')
    await page.waitForLoadState('networkidle')

    console.log('✓ On booking page')
    await page.screenshot({ path: '/tmp/02-booking-page.png', fullPage: true })

    console.log('\n=== STEP 3: SELECT DATES AND ROOM ===')

    // Set check-in date (tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const checkInDate = tomorrow.toISOString().split('T')[0]

    // Set check-out date (day after tomorrow)
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 2)
    const checkOutDate = dayAfter.toISOString().split('T')[0]

    console.log(`Check-in: ${checkInDate}, Check-out: ${checkOutDate}`)

    // Fill in dates
    const checkInInput = page.locator('input[type="date"]').first()
    const checkOutInput = page.locator('input[type="date"]').nth(1)

    await checkInInput.fill(checkInDate)
    await checkOutInput.fill(checkOutDate)

    await page.screenshot({ path: '/tmp/03-dates-selected.png', fullPage: true })

    // Click "Add to Cart" on first available room
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
    await addToCartButton.waitFor({ state: 'visible', timeout: 5000 })
    await addToCartButton.click()

    console.log('✓ Room added to cart')
    await page.screenshot({ path: '/tmp/04-room-in-cart.png', fullPage: true })

    console.log('\n=== STEP 4: VIEW CART ===')

    // Click "View Cart" button
    const viewCartButton = page.locator('button:has-text("View Cart")').first()
    await viewCartButton.waitFor({ state: 'visible', timeout: 5000 })
    await viewCartButton.click()

    await page.waitForTimeout(1000)
    console.log('✓ Cart opened')
    await page.screenshot({ path: '/tmp/05-cart-modal.png', fullPage: true })

    console.log('\n=== STEP 5: PROCEED TO GUEST INFO ===')

    // Click proceed button in cart
    const proceedButton = page.locator('button:has-text("Proceed")').first()
    await proceedButton.waitFor({ state: 'visible', timeout: 5000 })
    await proceedButton.click()

    await page.waitForTimeout(1000)
    console.log('✓ On guest info page')
    await page.screenshot({ path: '/tmp/06-guest-info-form.png', fullPage: true })

    console.log('\n=== STEP 6: FILL GUEST INFORMATION ===')

    // Fill personal information
    await page.fill('input[name="firstName"]', 'Test')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[name="phone"]', '+44 123 456 7890')

    // Fill address
    await page.fill('input[name="street"]', '123 Test Street')
    await page.fill('input[name="city"]', 'Edinburgh')
    await page.fill('input[name="postcode"]', 'EH1 1AA')
    await page.fill('input[name="country"]', 'United Kingdom')

    console.log('✓ Guest info filled')
    await page.screenshot({ path: '/tmp/07-guest-info-filled.png', fullPage: true })

    // Submit guest info form
    const submitGuestInfoButton = page.locator('button[type="submit"], button:has-text("Continue")').first()
    await submitGuestInfoButton.click()

    await page.waitForTimeout(2000)
    console.log('✓ Guest info submitted')
    await page.screenshot({ path: '/tmp/08-after-guest-info.png', fullPage: true })

    console.log('\n=== STEP 7: PACKAGE SELECTION ===')

    // Wait for package selection page
    await page.waitForSelector('text="Room Only"', { timeout: 5000 })
    console.log('✓ On package selection page')
    await page.screenshot({ path: '/tmp/09-package-selection.png', fullPage: true })

    // Check for any error messages at this point
    const errorsBefore = await page.locator('text=/error|not available|unavailable/i').allTextContents()
    if (errorsBefore.length > 0) {
      console.log('⚠ ERRORS FOUND BEFORE PAYMENT:', errorsBefore)
    }

    console.log('\n=== STEP 8: PROCEED TO PAYMENT ===')

    // Look for terms acceptance or proceed button
    const acceptTermsCheckbox = page.locator('input[type="checkbox"]').first()
    if (await acceptTermsCheckbox.isVisible()) {
      await acceptTermsCheckbox.check()
      console.log('✓ Terms accepted')
    }

    // Click proceed/continue button
    const proceedToPaymentButton = page.locator('button:has-text("Proceed"), button:has-text("Continue"), button:has-text("Accept")').first()
    await proceedToPaymentButton.waitFor({ state: 'visible', timeout: 5000 })

    console.log('About to click proceed to payment...')
    await page.screenshot({ path: '/tmp/10-before-payment-click.png', fullPage: true })

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('BROWSER ERROR:', msg.text())
      }
    })

    await proceedToPaymentButton.click()

    // Wait a bit for the booking creation to happen
    await page.waitForTimeout(3000)

    console.log('\n=== CHECKING FOR ERRORS ===')
    await page.screenshot({ path: '/tmp/11-after-payment-click.png', fullPage: true })

    // Check for error messages
    const errorMessages = await page.locator('text=/error|not available|unavailable|failed/i').allTextContents()
    if (errorMessages.length > 0) {
      console.log('⚠ ERRORS FOUND:', errorMessages)
    }

    // Check if we're on payment page or if there's an error
    const onPaymentPage = await page.locator('text=/payment|card/i').count() > 0
    const hasError = await page.locator('text=/error|not available|failed/i').count() > 0

    console.log('\n=== FINAL STATE ===')
    console.log('On payment page:', onPaymentPage)
    console.log('Has error:', hasError)

    if (hasError) {
      console.log('❌ AVAILABILITY ERROR APPEARED AT PAYMENT STEP')
      console.log('This confirms the UX issue - error should appear earlier!')
    } else if (onPaymentPage) {
      console.log('✓ Successfully reached payment page')
    }

    await page.screenshot({ path: '/tmp/12-final-state.png', fullPage: true })
  })
})