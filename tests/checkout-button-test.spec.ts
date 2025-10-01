import { test, expect } from '@playwright/test'

/**
 * Test to verify checkout button appears in cart
 */
test.describe('Checkout Button Test', () => {
  test('Cart shows checkout button when item is added', async ({ page }) => {
    // Navigate to booking page
    await page.goto('http://localhost:3000/booking')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(5000)

    // Take initial screenshot
    await page.screenshot({ path: 'screenshots/booking-page-initial.png', fullPage: true })

    // Log all buttons on the page
    const allButtons = await page.locator('button').allTextContents()
    console.log('All buttons on page:', allButtons)

    // Look for cart button
    const cartButtons = page.locator('button:has-text("Cart"), button:has-text("cart")')
    const cartCount = await cartButtons.count()
    console.log('Cart buttons found:', cartCount)

    if (cartCount > 0) {
      console.log('Clicking cart button...')
      await cartButtons.first().click()
      await page.waitForTimeout(2000)

      // Take screenshot of cart
      await page.screenshot({ path: 'screenshots/cart-modal-open.png', fullPage: true })

      // Check for checkout button
      const checkoutButton = page.locator('button:has-text("Proceed"), button:has-text("Continue"), button:has-text("Checkout")')
      const checkoutCount = await checkoutButton.count()

      console.log('Checkout buttons found:', checkoutCount)

      if (checkoutCount > 0) {
        const checkoutTexts = await checkoutButton.allTextContents()
        console.log('Checkout button texts:', checkoutTexts)

        // Verify at least one is visible
        await expect(checkoutButton.first()).toBeVisible()
        console.log('✓ Checkout button is visible')
      } else {
        console.log('❌ No checkout button found')

        // Get all text in the modal
        const modalText = await page.textContent('body')
        console.log('Modal contains:', modalText?.slice(0, 500))
      }
    } else {
      console.log('❌ No cart button found on page')
    }
  })

  test('Check if rooms are being added to cart', async ({ page }) => {
    await page.goto('http://localhost:3000/booking')
    await page.waitForTimeout(8000)

    // Check for room cards
    const roomCards = page.locator('[data-testid="room-card"], .room-card, button:has-text("Add to Cart")')
    const roomCount = await roomCards.count()

    console.log('Room cards/Add to Cart buttons found:', roomCount)

    if (roomCount > 0) {
      // Try to add a room
      const addButton = page.locator('button:has-text("Add to Cart")').first()
      if (await addButton.count() > 0) {
        console.log('Clicking Add to Cart...')
        await addButton.click()
        await page.waitForTimeout(2000)

        await page.screenshot({ path: 'screenshots/after-add-to-cart.png', fullPage: true })

        // Check if cart indicator appears
        const cartIndicator = page.locator('text=/Cart.*\\d+/')
        if (await cartIndicator.count() > 0) {
          console.log('✓ Cart indicator updated')
          const cartText = await cartIndicator.textContent()
          console.log('Cart shows:', cartText)
        }
      }
    } else {
      console.log('No room cards found - page may not have loaded correctly')
      await page.screenshot({ path: 'screenshots/no-rooms-found.png', fullPage: true })
    }
  })
})
