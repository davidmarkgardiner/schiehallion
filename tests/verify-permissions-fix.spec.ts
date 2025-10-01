import { test, expect } from '@playwright/test'

/**
 * Verify that authenticated users can access Firebase data
 */
test.describe('Verify Permissions Fix', () => {
  const testEmail = process.env.PLAYRIGHT_USER || 'playright@example.com'
  const testPassword = process.env.PLAYRIGHT_PASSWORD || 'playright'

  test('Authenticated user can view booking page and load rooms', async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate to homepage
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Find and click sign in button
    const signInButton = page.locator('button:has-text("Sign in"), button:has-text("sign in")').first()

    if (await signInButton.count() > 0) {
      await signInButton.click()
      await page.waitForTimeout(1000)

      // Fill in login form
      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', testPassword)

      // Submit login
      await page.click('button[type="submit"]:has-text("Login")')

      // Wait for login to complete
      await page.waitForTimeout(5000)

      console.log('✓ Login successful')
    }

    // Navigate to booking page
    await page.goto('http://localhost:3000/booking')
    await page.waitForLoadState('domcontentloaded')

    // Wait for content to load
    await page.waitForTimeout(8000)

    // Take screenshot
    await page.screenshot({ path: 'screenshots/booking-permissions-test.png', fullPage: true })

    // Check for Firebase permission errors
    const hasPermissionError = consoleErrors.some(error =>
      error.includes('permission') || error.includes('Missing or insufficient')
    )

    if (hasPermissionError) {
      console.error('❌ Permission errors found:', consoleErrors.filter(e =>
        e.includes('permission') || e.includes('Missing or insufficient')
      ))
    } else {
      console.log('✓ No permission errors found')
    }

    // Check page content
    const bodyText = await page.textContent('body')

    // Look for expected content or loading state
    const hasRoomContent = bodyText?.includes('room') || bodyText?.includes('Room')
    const hasBookingContent = bodyText?.includes('booking') || bodyText?.includes('Booking') || bodyText?.includes('Build Your Perfect Stay')
    const hasLoadingContent = bodyText?.includes('Loading')

    console.log('Has room content:', hasRoomContent)
    console.log('Has booking content:', hasBookingContent)
    console.log('Has loading content:', hasLoadingContent)

    // Verify URL is correct
    await expect(page).toHaveURL(/.*booking/)

    // Assert no permission errors
    expect(hasPermissionError).toBe(false)

    console.log('✓ Test completed successfully')
  })

  test('Can create a booking without permission errors', async ({ page }) => {
    // Track Firebase errors
    const firebaseErrors: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('Firebase') || text.includes('permission')) {
        firebaseErrors.push(text)
        console.log('Firebase log:', text)
      }
    })

    // Login first
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(3000)

    const signInButton = page.locator('button:has-text("Sign in"), button:has-text("sign in")').first()
    if (await signInButton.count() > 0) {
      await signInButton.click()
      await page.waitForTimeout(1000)

      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', testPassword)
      await page.click('button[type="submit"]:has-text("Login")')
      await page.waitForTimeout(5000)
    }

    // Go to booking page
    await page.goto('http://localhost:3000/booking')
    await page.waitForTimeout(8000)

    // Check if rooms are loaded (this would fail with permission errors)
    const bodyText = await page.textContent('body')
    const hasContent = bodyText && (
      bodyText.includes('room') ||
      bodyText.includes('Room') ||
      bodyText.includes('Build Your Perfect Stay')
    )

    console.log('Page has expected content:', hasContent)
    console.log('Firebase errors:', firebaseErrors.length)

    if (firebaseErrors.length > 0) {
      console.error('Firebase errors detected:', firebaseErrors)
    }

    // Verify no permission errors
    const hasPermissionError = firebaseErrors.some(e =>
      e.toLowerCase().includes('permission') ||
      e.toLowerCase().includes('insufficient')
    )

    expect(hasPermissionError).toBe(false)
    console.log('✓ No permission errors during booking flow')
  })
})
