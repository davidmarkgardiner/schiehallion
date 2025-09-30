import { test, expect } from '@playwright/test'

test.describe('Booking Availability Error Investigation', () => {
  test('reproduce and diagnose availability check error', async ({ page }) => {
    const consoleMessages: string[] = []
    const errors: string[] = []

    // Capture console and error messages
    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(`[${msg.type()}] ${text}`)
      console.log(`[BROWSER ${msg.type()}]`, text)
    })

    page.on('pageerror', error => {
      errors.push(error.message)
      console.error('[PAGE ERROR]', error.message)
    })

    console.log('\n=== INVESTIGATION: Booking Availability Error ===\n')

    // Step 1: Login
    console.log('Step 1: Navigate to homepage and login')
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    await page.screenshot({ path: '/tmp/booking-error-01-homepage.png', fullPage: true })

    // Fill in login form
    await page.fill('input[type="email"]', 'playright@example.com')
    await page.fill('input[type="password"]', 'playright')
    await page.click('button:has-text("Log in"), button:has-text("Sign in"), button[type="submit"]')
    await page.waitForTimeout(3000)
    await page.screenshot({ path: '/tmp/booking-error-02-logged-in.png', fullPage: true })

    // Step 2: Navigate to booking page
    console.log('\nStep 2: Navigate to booking page')
    await page.goto('http://localhost:3000/booking', { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: '/tmp/booking-error-03-booking-page.png', fullPage: true })

    // Step 3: Try to add a room to cart
    console.log('\nStep 3: Look for room selection elements')

    // Wait for rooms to load
    await page.waitForTimeout(3000)

    // Look for date inputs first
    const checkInInput = await page.locator('input[type="date"]').first().isVisible().catch(() => false)
    console.log(`   Check-in input visible: ${checkInInput}`)

    if (checkInInput) {
      // Fill in dates
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      const checkIn = tomorrow.toISOString().split('T')[0]
      const checkOut = dayAfterTomorrow.toISOString().split('T')[0]

      console.log(`   Setting dates: ${checkIn} to ${checkOut}`)
      await page.fill('input[type="date"]', checkIn)
      await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="date"]')
        if (inputs[1]) (inputs[1] as HTMLInputElement).focus()
      })
      await page.keyboard.type(checkOut)
      await page.waitForTimeout(1000)
    }

    await page.screenshot({ path: '/tmp/booking-error-04-dates-set.png', fullPage: true })

    // Look for "Add to Cart" or room selection buttons
    const addButtons = await page.locator('button:has-text("Add to Cart"), button:has-text("Select Room"), button:has-text("Add Room")').all()
    console.log(`   Found ${addButtons.length} add buttons`)

    if (addButtons.length > 0) {
      console.log('\nStep 4: Add first room to cart')
      await addButtons[0].click()
      await page.waitForTimeout(2000)
      await page.screenshot({ path: '/tmp/booking-error-05-room-added.png', fullPage: true })

      // Look for cart button
      const cartButton = await page.locator('button:has-text("Cart"), button:has-text("View Cart")').first()
      if (await cartButton.isVisible().catch(() => false)) {
        console.log('\nStep 5: Open cart')
        await cartButton.click()
        await page.waitForTimeout(1500)
        await page.screenshot({ path: '/tmp/booking-error-06-cart-modal.png', fullPage: true })

        // Proceed to guest info
        const proceedButton = await page.locator('button:has-text("Proceed"), button:has-text("Continue")').first()
        if (await proceedButton.isVisible().catch(() => false)) {
          console.log('\nStep 6: Proceed to guest info')
          await proceedButton.click()
          await page.waitForTimeout(2000)
          await page.screenshot({ path: '/tmp/booking-error-07-guest-info.png', fullPage: true })

          // Fill guest info form
          console.log('\nStep 7: Fill guest information')
          await page.fill('input[name="firstName"], input[placeholder*="First"]', 'Test')
          await page.fill('input[name="lastName"], input[placeholder*="Last"]', 'User')
          await page.fill('input[name="email"], input[type="email"]', 'test@example.com')
          await page.fill('input[name="phone"], input[type="tel"]', '07700900123')

          await page.screenshot({ path: '/tmp/booking-error-08-info-filled.png', fullPage: true })

          // Submit guest info
          const submitGuestInfo = await page.locator('button[type="submit"], button:has-text("Continue")').last()
          if (await submitGuestInfo.isVisible().catch(() => false)) {
            console.log('\nStep 8: Submit guest info')
            await submitGuestInfo.click()
            await page.waitForTimeout(3000)
            await page.screenshot({ path: '/tmp/booking-error-09-package-selection.png', fullPage: true })

            // Look for terms checkbox and accept button
            console.log('\nStep 9: Accept terms and complete booking')
            const termsCheckbox = await page.locator('input[type="checkbox"]').last()
            if (await termsCheckbox.isVisible().catch(() => false)) {
              await termsCheckbox.check()
              await page.waitForTimeout(500)
            }

            const completeButton = await page.locator('button:has-text("Accept"), button:has-text("Confirm"), button:has-text("Complete")').last()
            if (await completeButton.isVisible().catch(() => false)) {
              console.log('\nStep 10: Clicking complete booking - THIS SHOULD TRIGGER THE ERROR')
              await completeButton.click()
              await page.waitForTimeout(5000)
              await page.screenshot({ path: '/tmp/booking-error-10-error-state.png', fullPage: true })
            }
          }
        }
      }
    } else {
      console.log('   WARNING: No add buttons found - checking page content')
      const pageContent = await page.content()
      console.log('   Page includes "room":', pageContent.toLowerCase().includes('room'))
      console.log('   Page includes "available":', pageContent.toLowerCase().includes('available'))
    }

    // Print console messages to find the error
    console.log('\n=== CONSOLE MESSAGES (Last 20) ===')
    consoleMessages.slice(-20).forEach(msg => console.log(msg))

    console.log('\n=== JAVASCRIPT ERRORS ===')
    if (errors.length > 0) {
      errors.forEach(err => console.log(err))
    } else {
      console.log('No page errors captured')
    }

    console.log('\n=== INVESTIGATION COMPLETE ===\n')
  })
})