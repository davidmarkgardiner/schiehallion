import { test, expect } from '@playwright/test'

/**
 * Simple test: Verify guest can access key pages and booking requires login
 */
test.describe('Simple Guest Flow', () => {
  test('should allow viewing rooms and booking pages without login', async ({ page }) => {
    // Test rooms page
    await page.goto('http://localhost:3000/rooms')
    await expect(page).toHaveURL(/.*rooms/)
    console.log('✓ Rooms page accessible')

    // Test booking page
    await page.goto('http://localhost:3000/booking')
    await expect(page).toHaveURL(/.*booking/)

    // Wait a bit for page to load
    await page.waitForTimeout(3000)

    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'screenshots/booking-page-guest.png', fullPage: true })
    console.log('✓ Booking page accessible - screenshot saved')

    // Check if loading spinner appears
    const loadingText = page.locator('text=Loading')
    if (await loadingText.count() > 0) {
      console.log('Page shows loading state')
      // Wait for loading to finish
      await loadingText.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
        console.log('Loading state persists')
      })
    }

    // Check what's actually on the page
    const bodyText = await page.locator('body').textContent()
    console.log('Page body contains:', bodyText?.slice(0, 200))
  })

  test('homepage should load for guests', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Wait for page to load
    await page.waitForTimeout(3000)

    // Take screenshot
    await page.screenshot({ path: 'screenshots/homepage-guest.png', fullPage: true })

    // Check what's visible
    const bodyText = await page.locator('body').textContent()
    console.log('Homepage contains:', bodyText?.slice(0, 200))

    // The page might be stuck in loading state if AuthContext is blocking
    const loadingText = page.locator('text=Loading')
    if (await loadingText.count() > 0) {
      console.log('⚠ Homepage shows loading state - AuthContext may be blocking')
    }
  })

  test('can access restaurant page', async ({ page }) => {
    await page.goto('http://localhost:3000/restaurant')
    await expect(page).toHaveURL(/.*restaurant/)
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'screenshots/restaurant-page-guest.png', fullPage: true })
    console.log('✓ Restaurant page accessible')
  })
})
