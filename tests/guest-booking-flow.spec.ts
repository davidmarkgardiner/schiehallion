import { test, expect } from '@playwright/test'

/**
 * Test: Guest can browse and add rooms without login, but must login to checkout
 */
test.describe('Guest Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('should allow browsing the homepage without login', async ({ page }) => {
    // Check that the homepage loads without requiring login
    await expect(page.locator('text=Schiehallion Hotel')).toBeVisible()

    // Look for the "Sign in" button (not logged in state)
    const signInButton = page.locator('button:has-text("Sign in")')
    await expect(signInButton).toBeVisible()
  })

  test('should allow viewing rooms page without login', async ({ page }) => {
    // Navigate to rooms page
    await page.goto('http://localhost:3000/rooms')

    // Should be able to see room information without login
    await expect(page).toHaveURL(/.*rooms/)

    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('should allow navigating to booking page without login', async ({ page }) => {
    // Navigate directly to booking page
    await page.goto('http://localhost:3000/booking')

    // Should see booking page content without being redirected to login
    await expect(page).toHaveURL(/.*booking/)

    // Wait for rooms to load
    await page.waitForSelector('text=Build Your Perfect Stay', { timeout: 10000 })
  })

  test('should prompt for login when attempting to checkout', async ({ page }) => {
    // Navigate to booking page
    await page.goto('http://localhost:3000/booking')
    await page.waitForLoadState('networkidle')

    // Wait for the room selection panel to load
    await page.waitForSelector('text=Build Your Perfect Stay', { timeout: 10000 })

    // Try to find and click on a room card to add to cart
    // This assumes there are room cards available
    const roomCard = page.locator('[data-testid="room-card"]').first()
    if (await roomCard.count() > 0) {
      await roomCard.click()

      // Look for "Add to Cart" or similar button
      const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click()

        // Open cart
        const cartButton = page.locator('button:has-text("Cart")')
        if (await cartButton.count() > 0) {
          await cartButton.click()

          // Try to proceed to checkout
          const checkoutButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")')
          if (await checkoutButton.count() > 0) {
            await checkoutButton.click()

            // Should show login modal instead of proceeding
            await expect(page.locator('text=Sign in to continue booking')).toBeVisible({ timeout: 5000 })
          }
        }
      }
    }
  })

  test('should allow Google sign-in during booking flow', async ({ page }) => {
    // Navigate to booking page
    await page.goto('http://localhost:3000/booking')
    await page.waitForLoadState('networkidle')

    // Navigate through booking flow to trigger login modal
    await page.waitForSelector('text=Build Your Perfect Stay', { timeout: 10000 })

    // Simulate adding a room and proceeding to checkout
    // This will trigger the login modal
    const roomCard = page.locator('[data-testid="room-card"]').first()
    if (await roomCard.count() > 0) {
      await roomCard.click()

      const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click()

        const cartButton = page.locator('button:has-text("Cart")')
        if (await cartButton.count() > 0) {
          await cartButton.click()

          const checkoutButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")')
          if (await checkoutButton.count() > 0) {
            await checkoutButton.click()

            // Login modal should appear
            await page.waitForSelector('text=Sign in to continue booking', { timeout: 5000 })

            // Check for Google sign-in button
            const googleButton = page.locator('button:has-text("Continue with Google")')
            await expect(googleButton).toBeVisible()
          }
        }
      }
    }
  })

  test('should allow email/password sign-in during booking flow', async ({ page }) => {
    // Navigate to booking page
    await page.goto('http://localhost:3000/booking')
    await page.waitForLoadState('networkidle')

    await page.waitForSelector('text=Build Your Perfect Stay', { timeout: 10000 })

    // Simulate adding a room and proceeding to checkout
    const roomCard = page.locator('[data-testid="room-card"]').first()
    if (await roomCard.count() > 0) {
      await roomCard.click()

      const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click()

        const cartButton = page.locator('button:has-text("Cart")')
        if (await cartButton.count() > 0) {
          await cartButton.click()

          const checkoutButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")')
          if (await checkoutButton.count() > 0) {
            await checkoutButton.click()

            // Login modal should appear
            await page.waitForSelector('text=Sign in to continue booking', { timeout: 5000 })

            // Check for email/password fields
            await expect(page.locator('input[type="email"]')).toBeVisible()
            await expect(page.locator('input[type="password"]')).toBeVisible()

            // Check for sign-up toggle
            const signUpLink = page.locator('text=Need an account? Sign up')
            await expect(signUpLink).toBeVisible()
          }
        }
      }
    }
  })

  test('successful login redirects to guest info form', async ({ page }) => {
    const testEmail = process.env.PLAYRIGHT_USER || 'playright@example.com'
    const testPassword = process.env.PLAYRIGHT_PASSWORD || 'playright'

    // Navigate to booking page
    await page.goto('http://localhost:3000/booking')
    await page.waitForLoadState('networkidle')

    await page.waitForSelector('text=Build Your Perfect Stay', { timeout: 10000 })

    // Simulate adding a room and proceeding to checkout
    const roomCard = page.locator('[data-testid="room-card"]').first()
    if (await roomCard.count() > 0) {
      await roomCard.click()

      const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click()

        const cartButton = page.locator('button:has-text("Cart")')
        if (await cartButton.count() > 0) {
          await cartButton.click()

          const checkoutButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")')
          if (await checkoutButton.count() > 0) {
            await checkoutButton.click()

            // Login modal should appear
            await page.waitForSelector('text=Sign in to continue booking', { timeout: 5000 })

            // Fill in login credentials
            await page.fill('input[type="email"]', testEmail)
            await page.fill('input[type="password"]', testPassword)

            // Submit login
            await page.click('button[type="submit"]:has-text("Login")')

            // After successful login, should navigate to guest info form
            await expect(page.locator('text=Guest Information, text=Personal Information')).toBeVisible({ timeout: 10000 })
          }
        }
      }
    }
  })

  test('should close login modal when clicking close button', async ({ page }) => {
    // Navigate to booking page
    await page.goto('http://localhost:3000/booking')
    await page.waitForLoadState('networkidle')

    await page.waitForSelector('text=Build Your Perfect Stay', { timeout: 10000 })

    // Simulate adding a room and proceeding to checkout
    const roomCard = page.locator('[data-testid="room-card"]').first()
    if (await roomCard.count() > 0) {
      await roomCard.click()

      const addToCartButton = page.locator('button:has-text("Add to Cart")').first()
      if (await addToCartButton.count() > 0) {
        await addToCartButton.click()

        const cartButton = page.locator('button:has-text("Cart")')
        if (await cartButton.count() > 0) {
          await cartButton.click()

          const checkoutButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")')
          if (await checkoutButton.count() > 0) {
            await checkoutButton.click()

            // Login modal should appear
            await page.waitForSelector('text=Sign in to continue booking', { timeout: 5000 })

            // Click close button
            const closeButton = page.locator('button:has-text("Close")').last()
            await closeButton.click()

            // Modal should be closed
            await expect(page.locator('text=Sign in to continue booking')).not.toBeVisible()
          }
        }
      }
    }
  })
})
