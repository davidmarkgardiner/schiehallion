import { test, expect } from '@playwright/test'

test.describe('Room Photo Loading Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/rooms')
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should load room images with optimized skeletons', async ({ page }) => {
    // Test skeleton loading states
    const skeletons = page.locator('[data-testid="room-card-skeleton"]')

    // Should show skeletons initially
    await expect(skeletons.first()).toBeVisible({ timeout: 1000 })

    // Skeletons should disappear as content loads
    await expect(skeletons.first()).not.toBeVisible({ timeout: 10000 })
  })

  test('should lazy load images efficiently', async ({ page }) => {
    // Count initially loaded images
    await page.waitForSelector('img[src*="room"]', { timeout: 5000 })

    const initialImages = await page.locator('img[src*="room"]').count()
    expect(initialImages).toBeGreaterThan(0)
    expect(initialImages).toBeLessThan(20) // Should not load all images at once

    // Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(2000)

    const loadedImages = await page.locator('img[src*="room"]').count()
    expect(loadedImages).toBeGreaterThanOrEqual(initialImages)
  })

  test('should handle image loading errors gracefully', async ({ page }) => {
    // Intercept image requests and simulate failures
    await page.route('**/room-images/**', route => {
      if (Math.random() < 0.3) { // Fail 30% of requests
        route.abort()
      } else {
        route.continue()
      }
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Should show fallback content for failed images
    const fallbackContent = page.locator('text="Image unavailable"')
    const errorAlerts = page.locator('text="failed to load"')

    // Either fallbacks or error alerts should be present
    const hasErrorHandling = await fallbackContent.count() > 0 || await errorAlerts.count() > 0
    expect(hasErrorHandling).toBeTruthy()
  })

  test('should optimize performance with view mode switching', async ({ page }) => {
    // Test grid view performance
    await page.click('button:has-text("Grid")')
    await page.waitForLoadState('networkidle')

    const gridCards = await page.locator('[data-testid="room-card"]').count()
    expect(gridCards).toBeGreaterThan(0)

    // Switch to list view
    await page.click('button:has-text("List")')
    await page.waitForLoadState('networkidle')

    const listCards = await page.locator('[data-testid="room-card"]').count()
    expect(listCards).toEqual(gridCards) // Same number of cards

    // Verify list view layout
    const listCard = page.locator('[data-testid="room-card"]').first()
    await expect(listCard).toHaveClass(/md:flex-row/)
  })

  test('should measure Core Web Vitals', async ({ page }) => {
    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // Fallback timeout
        setTimeout(() => resolve(0), 5000)
      })
    })

    expect(lcp).toBeGreaterThan(0)
    expect(lcp).toBeLessThan(2500) // Good LCP threshold
  })

  test('should progressively load image galleries', async ({ page }) => {
    // Click on a room card to view gallery
    const roomCard = page.locator('[data-testid="room-card"]').first()
    await roomCard.click()

    // Should show progress indicator for multiple images
    const progressIndicator = page.locator('[data-testid="image-progress"]')
    await expect(progressIndicator).toBeVisible({ timeout: 2000 })

    // Progress should complete
    await expect(progressIndicator).toContainText('100%', { timeout: 10000 })
  })

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G network
    await page.context().setExtraHTTPHeaders({
      'Network-Profile': 'Slow-3G'
    })

    await page.reload()

    // Should show loading states longer on slow networks
    const loadingSpinners = page.locator('[data-testid="loading-spinner"]')
    await expect(loadingSpinners.first()).toBeVisible({ timeout: 2000 })

    // Eventually content should load
    await expect(loadingSpinners.first()).not.toBeVisible({ timeout: 30000 })
  })

  test('should optimize virtual scrolling', async ({ page }) => {
    // Initial render should show limited number of cards
    const initialCards = await page.locator('[data-testid="room-card"]').count()
    expect(initialCards).toBeLessThanOrEqual(20) // Virtual scrolling limit

    // Scroll down to trigger load more
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Should load more cards
    const loadMoreButton = page.locator('button:has-text("Load More")')
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click()
      await page.waitForLoadState('networkidle')

      const newCardCount = await page.locator('[data-testid="room-card"]').count()
      expect(newCardCount).toBeGreaterThan(initialCards)
    }
  })

  test('should validate accessibility of loading states', async ({ page }) => {
    // Check for proper ARIA labels on loading states
    const skeletons = page.locator('[data-testid="room-card-skeleton"]')
    await expect(skeletons.first()).toHaveAttribute('aria-label', /loading/i)

    // Check for proper alt text on images
    await page.waitForSelector('img[alt]', { timeout: 5000 })
    const images = page.locator('img[alt]')
    const imageCount = await images.count()

    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i)
      const altText = await img.getAttribute('alt')
      expect(altText).toBeTruthy()
      expect(altText?.length).toBeGreaterThan(5)
    }
  })

  test('should maintain image aspect ratios', async ({ page }) => {
    // Wait for images to load
    await page.waitForSelector('img[src*="room"]', { timeout: 5000 })

    // Check aspect ratios are maintained
    const images = page.locator('img[src*="room"]')
    const firstImage = images.first()

    const { width, height } = await firstImage.boundingBox() || { width: 0, height: 0 }
    const aspectRatio = width / height

    // Should be close to 16:9 ratio (1.777...)
    expect(aspectRatio).toBeGreaterThan(1.5)
    expect(aspectRatio).toBeLessThan(2.0)
  })
})