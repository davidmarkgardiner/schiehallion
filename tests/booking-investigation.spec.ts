import { test, expect } from '@playwright/test'

test.describe('Booking Flow Error Investigation', () => {
  test('investigate booking flow and availability check', async ({ page }) => {
    // Enable console logging to capture errors
    const consoleMessages: string[] = []
    const errors: string[] = []

    page.on('console', msg => {
      const text = msg.text()
      consoleMessages.push(`[${msg.type()}] ${text}`)
      console.log(`[BROWSER ${msg.type()}]`, text)
    })

    page.on('pageerror', error => {
      errors.push(error.message)
      console.error('[PAGE ERROR]', error.message)
    })

    console.log('\n=== Starting Booking Flow Investigation ===\n')

    // Navigate to the booking page
    console.log('1. Navigating to booking page...')
    await page.goto('http://localhost:3000/booking', { waitUntil: 'networkidle' })
    await page.screenshot({ path: '/tmp/booking-01-initial.png', fullPage: true })

    // Check if we need to login
    const loginForm = await page.locator('input[type="email"]').first().isVisible().catch(() => false)

    if (loginForm) {
      console.log('2. Login required, attempting to login...')
      await page.fill('input[type="email"]', 'playright@example.com')
      await page.fill('input[type="password"]', 'playright')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(3000)
      await page.screenshot({ path: '/tmp/booking-02-after-login.png', fullPage: true })
    }

    // Wait for room selection panel to load
    console.log('3. Waiting for room selection panel...')
    await page.waitForSelector('[class*="room"]', { timeout: 10000 }).catch(() => null)
    await page.screenshot({ path: '/tmp/booking-03-rooms-loaded.png', fullPage: true })

    // Try to add a room to cart
    console.log('4. Looking for room cards...')

    // Look for any "Add to Cart" or similar buttons
    const addToCartButtons = await page.locator('button:has-text("Add to Cart"), button:has-text("Select"), button:has-text("Book")').all()
    console.log(`   Found ${addToCartButtons.length} potential room selection buttons`)

    if (addToCartButtons.length > 0) {
      console.log('5. Clicking first room selection button...')
      await addToCartButtons[0].click()
      await page.waitForTimeout(2000)
      await page.screenshot({ path: '/tmp/booking-04-room-selected.png', fullPage: true })

      // Look for cart or checkout button
      const cartButton = await page.locator('button:has-text("Cart"), button:has-text("View Cart"), button:has-text("Checkout")').first()
      if (await cartButton.isVisible().catch(() => false)) {
        console.log('6. Opening cart...')
        await cartButton.click()
        await page.waitForTimeout(1000)
        await page.screenshot({ path: '/tmp/booking-05-cart-opened.png', fullPage: true })

        // Proceed to guest info
        const proceedButton = await page.locator('button:has-text("Proceed"), button:has-text("Continue"), button:has-text("Next")').first()
        if (await proceedButton.isVisible().catch(() => false)) {
          console.log('7. Proceeding to guest info...')
          await proceedButton.click()
          await page.waitForTimeout(2000)
          await page.screenshot({ path: '/tmp/booking-06-guest-info.png', fullPage: true })

          // Fill in guest info
          console.log('8. Filling guest info form...')
          await page.fill('input[name="firstName"], input[placeholder*="First"]', 'Test')
          await page.fill('input[name="lastName"], input[placeholder*="Last"]', 'User')
          await page.fill('input[name="email"], input[type="email"]', 'test@example.com')
          await page.fill('input[name="phone"], input[type="tel"]', '07700900000')
          await page.screenshot({ path: '/tmp/booking-07-guest-info-filled.png', fullPage: true })

          // Submit guest info
          const submitButton = await page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Next")').last()
          if (await submitButton.isVisible().catch(() => false)) {
            console.log('9. Submitting guest info...')
            await submitButton.click()
            await page.waitForTimeout(3000)
            await page.screenshot({ path: '/tmp/booking-08-after-guest-info.png', fullPage: true })

            // Look for package selection
            console.log('10. Looking for package selection...')
            const packageButtons = await page.locator('button:has-text("Room Only"), button:has-text("Breakfast"), button:has-text("Half Board")').all()
            console.log(`    Found ${packageButtons.length} package buttons`)

            if (packageButtons.length > 0) {
              console.log('11. Selecting package...')
              await packageButtons[0].click()
              await page.waitForTimeout(1000)
              await page.screenshot({ path: '/tmp/booking-09-package-selected.png', fullPage: true })

              // Look for terms acceptance or final booking button
              const termsCheckbox = await page.locator('input[type="checkbox"]').last()
              if (await termsCheckbox.isVisible().catch(() => false)) {
                console.log('12. Accepting terms...')
                await termsCheckbox.check()
                await page.waitForTimeout(500)
              }

              const bookButton = await page.locator('button:has-text("Confirm"), button:has-text("Book"), button:has-text("Complete")').last()
              if (await bookButton.isVisible().catch(() => false)) {
                console.log('13. Clicking final booking button...')
                console.log('    This should trigger the availability check error...')
                await bookButton.click()
                await page.waitForTimeout(3000)
                await page.screenshot({ path: '/tmp/booking-10-booking-attempted.png', fullPage: true })
              }
            }
          }
        }
      }
    }

    // Capture final state
    console.log('\n=== Console Messages ===')
    consoleMessages.forEach(msg => console.log(msg))

    console.log('\n=== Errors ===')
    if (errors.length > 0) {
      errors.forEach(err => console.log(err))
    } else {
      console.log('No page errors captured')
    }

    console.log('\n=== Investigation Complete ===\n')
  })
})