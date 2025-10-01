import { test, expect } from '@playwright/test'

/**
 * Debug Firebase permissions error with authenticated user
 */
test.describe('Debug Permissions', () => {
  const testEmail = process.env.PLAYRIGHT_USER || 'playright@example.com'
  const testPassword = process.env.PLAYRIGHT_PASSWORD || 'playright'

  test('Login and access booking page to check permissions', async ({ page }) => {
    // Set up console logging
    page.on('console', msg => {
      const text = msg.text()
      console.log('Browser console:', text)
    })

    // Set up error logging
    page.on('pageerror', error => {
      console.error('Page error:', error.message)
    })

    // Navigate to homepage
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    // Look for and click sign in button
    const signInButton = page.locator('button:has-text("Sign in"), button:has-text("sign in")').first()
    if (await signInButton.count() > 0) {
      console.log('Clicking sign in button...')
      await signInButton.click()
      await page.waitForTimeout(1000)

      // Fill in credentials
      await page.fill('input[type="email"]', testEmail)
      await page.fill('input[type="password"]', testPassword)

      // Submit login
      await page.click('button[type="submit"]:has-text("Login")')
      console.log('Login submitted')

      // Wait for login to complete
      await page.waitForTimeout(5000)

      console.log('Login complete, checking auth state...')
    }

    // Now navigate to booking page
    console.log('Navigating to booking page...')
    await page.goto('http://localhost:3000/booking')
    await page.waitForLoadState('domcontentloaded')

    // Wait for page to load
    await page.waitForTimeout(5000)

    // Check console for errors
    console.log('Waiting to capture any Firebase errors...')
    await page.waitForTimeout(3000)

    // Take screenshot
    await page.screenshot({ path: 'screenshots/booking-authenticated-debug.png', fullPage: true })

    const bodyText = await page.textContent('body')
    console.log('Page loaded with text:', bodyText?.slice(0, 300))

    // Check for error messages in the page
    const errorText = await page.locator('text=Error, text=error, text=Permission').textContent().catch(() => null)
    if (errorText) {
      console.error('Found error in page:', errorText)
    }
  })
})
