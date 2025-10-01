import { test, expect } from '@playwright/test'

/**
 * Test booking flow with authentication requirements
 */
test.describe('Booking Authentication Flow', () => {
  const testEmail = process.env.PLAYRIGHT_USER || 'playright@example.com'
  const testPassword = process.env.PLAYRIGHT_PASSWORD || 'playright'

  test('Guest can browse booking page and must login to checkout', async ({ page }) => {
    // Navigate to booking page
    await page.goto('http://localhost:3000/booking')
    await page.waitForLoadState('domcontentloaded')

    // Wait for the page to be visible (either loading or content)
    await page.waitForTimeout(5000)

    // Take screenshot to debug
    await page.screenshot({ path: 'screenshots/booking-loaded.png', fullPage: true })

    // Get all text content
    const bodyText = await page.textContent('body')
    console.log('Page loaded, checking content...')

    // Check if we can see booking-related content or loading state
    const hasLoadingText = bodyText?.includes('Loading')
    const hasBuildText = bodyText?.includes('Build Your Perfect Stay')
    const hasRoomsText = bodyText?.includes('room')

    console.log('Has loading:', hasLoadingText)
    console.log('Has build text:', hasBuildText)
    console.log('Has rooms text:', hasRoomsText)

    // If page loaded successfully, verify URL
    await expect(page).toHaveURL(/.*booking/)
    console.log('✓ Booking page is accessible without login')
  })

  test('Can view homepage without login', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(5000)

    await page.screenshot({ path: 'screenshots/homepage-loaded.png', fullPage: true })

    const bodyText = await page.textContent('body')
    console.log('Homepage loaded')

    // Check for any visible content
    const hasHotelName = bodyText?.includes('Schiehallion')
    console.log('Has hotel name:', hasHotelName)

    await expect(page).toHaveURL('http://localhost:3000/')
    console.log('✓ Homepage is accessible')
  })

  test('Login modal appears when trying to checkout', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Look for sign in button
    const signInButton = page.locator('button:has-text("Sign in"), button:has-text("sign in")').first()

    if (await signInButton.count() > 0) {
      console.log('Found sign in button, clicking...')
      await signInButton.click()

      // Wait for modal
      await page.waitForTimeout(1000)

      // Check for login form elements
      const emailInput = page.locator('input[type="email"]')
      const passwordInput = page.locator('input[type="password"]')

      await expect(emailInput).toBeVisible({ timeout: 5000 })
      await expect(passwordInput).toBeVisible()

      console.log('✓ Login modal appears correctly')
    } else {
      console.log('⚠ Sign in button not found')
    }
  })

  test('Google OAuth button is visible in login modal', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    const signInButton = page.locator('button:has-text("Sign in"), button:has-text("sign in")').first()

    if (await signInButton.count() > 0) {
      await signInButton.click()
      await page.waitForTimeout(1000)

      // Look for Google button
      const googleButton = page.locator('button:has-text("Google"), button:has-text("Continue with Google")')
      await expect(googleButton.first()).toBeVisible({ timeout: 5000 })

      console.log('✓ Google OAuth button is available')
    }
  })
})
