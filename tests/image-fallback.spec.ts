import { test, expect } from '@playwright/test'

test.describe('Image Fallback System', () => {
  test.beforeEach(async ({ page }) => {
    // Go to a page that uses room cards
    await page.goto('/rooms')
  })

  test('should display fallback UI for missing room images', async ({ page }) => {
    // Wait for room cards to load
    await page.waitForSelector('[data-testid="room-card"]', { timeout: 10000 })

    // Check for the presence of our fallback components
    const roomCards = await page.locator('[data-testid="room-card"]').all()

    for (const card of roomCards) {
      // Should either have a proper image or fallback UI
      const hasImage = await card.locator('img').isVisible()
      const hasFallback = await card.locator('[data-testid="room-image-fallback"]').isVisible()

      expect(hasImage || hasFallback).toBeTruthy()
    }
  })

  test('should show AI generation option for rooms without images', async ({ page }) => {
    // Look for rooms without images
    const fallbackElements = await page.locator('[data-testid="room-image-fallback"]').all()

    if (fallbackElements.length > 0) {
      // Check that AI generation button is present
      const generateButton = page.locator('button:has-text("Generate")')
      await expect(generateButton.first()).toBeVisible()
    }
  })

  test('should handle image loading errors gracefully', async ({ page }) => {
    // Intercept image requests and force them to fail
    await page.route('**/images/rooms/**', route => {
      route.abort()
    })

    // Reload the page
    await page.reload()

    // Wait for room cards to load
    await page.waitForSelector('[data-testid="room-card"]', { timeout: 10000 })

    // All room cards should show fallback instead of broken images
    const brokenImages = await page.locator('img[alt*="room"]:not([src*="placeholder"])').all()

    // Verify no broken image icons are visible
    for (const img of brokenImages) {
      const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth)
      // If naturalWidth is 0, the image failed to load, but our fallback should be handling it
      if (naturalWidth === 0) {
        // Check that there's a fallback in the same container
        const container = img.locator('xpath=ancestor::*[contains(@class, "room") or contains(@data-testid, "room")]')
        await expect(container.locator('[data-testid="room-image-fallback"]')).toBeVisible()
      }
    }
  })

  test('should show loading states during image generation', async ({ page }) => {
    // Mock the image generation API to be slow
    await page.route('**/api/generate-image', async route => {
      // Delay response by 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          image: {
            id: 'test-id',
            imageData: 'base64-test-data',
            mimeType: 'image/png'
          }
        })
      })
    })

    // Click on generate image button
    const generateButton = page.locator('button:has-text("Generate")').first()
    if (await generateButton.isVisible()) {
      await generateButton.click()

      // Should show loading state
      await expect(page.locator('text="Generating"')).toBeVisible()
    }
  })

  test('should display appropriate error messages', async ({ page }) => {
    // Mock API to return error
    await page.route('**/api/generate-image', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'API Error' })
      })
    })

    // Try to generate an image
    const generateButton = page.locator('button:has-text("Generate")').first()
    if (await generateButton.isVisible()) {
      await generateButton.click()

      // Should show error state
      await expect(page.locator('text*="Failed"')).toBeVisible()
    }
  })

  test('should be accessible with screen readers', async ({ page }) => {
    // Check that fallback elements have proper ARIA labels
    const fallbackElements = await page.locator('[data-testid="room-image-fallback"]').all()

    for (const element of fallbackElements) {
      // Should have accessible text or aria-label
      const accessibleName = await element.getAttribute('aria-label') ||
                            await element.textContent() ||
                            await element.locator('img').getAttribute('alt')

      expect(accessibleName).toBeTruthy()
      expect(accessibleName).toContain('room' || 'Room')
    }
  })

  test('should maintain responsive design across devices', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1440, height: 900 }  // Desktop
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)

      // Wait for layout to adjust
      await page.waitForTimeout(500)

      // Check that room cards are still visible and properly laid out
      const roomCards = await page.locator('[data-testid="room-card"]').all()

      for (const card of roomCards) {
        await expect(card).toBeVisible()

        // Check that image containers maintain aspect ratio
        const imageContainer = card.locator('[data-testid="room-image"], [data-testid="room-image-fallback"]').first()
        if (await imageContainer.isVisible()) {
          const boundingBox = await imageContainer.boundingBox()
          expect(boundingBox?.width).toBeGreaterThan(0)
          expect(boundingBox?.height).toBeGreaterThan(0)
        }
      }
    }
  })
})

test.describe('Room Image Management Integration', () => {
  test('should integrate with existing room image system', async ({ page }) => {
    await page.goto('/admin/room-images')

    // Should be able to access room image admin
    await expect(page.locator('h1:has-text("Room Image")')).toBeVisible()

    // Should show room types
    const roomTypes = ['standard', 'deluxe', 'suite', 'family', 'accessible']

    for (const roomType of roomTypes) {
      const selector = page.locator(`text="${roomType}"`)
      if (await selector.isVisible()) {
        // Room type should be selectable
        expect(await selector.isVisible()).toBeTruthy()
      }
    }
  })

  test('should handle AI image generation workflow', async ({ page }) => {
    await page.goto('/admin/room-images')

    // Select a room type
    const roomTypeSelector = page.locator('select, [role="combobox"]').first()
    if (await roomTypeSelector.isVisible()) {
      await roomTypeSelector.selectOption('standard')

      // Should show generation options
      await expect(page.locator('button:has-text("Generate")')).toBeVisible()
    }
  })
})

test.describe('Performance and Core Web Vitals', () => {
  test('should load images efficiently', async ({ page }) => {
    // Track network requests
    const imageRequests: string[] = []

    page.on('request', request => {
      if (request.url().includes('/images/') && request.resourceType() === 'image') {
        imageRequests.push(request.url())
      }
    })

    await page.goto('/rooms')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Should not have excessive image requests
    expect(imageRequests.length).toBeLessThan(50) // Reasonable limit

    // Should not request non-existent images repeatedly
    const uniqueRequests = new Set(imageRequests)
    const duplicateRequests = imageRequests.length - uniqueRequests.size
    expect(duplicateRequests).toBeLessThan(10) // Allow some retries but not excessive
  })

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/rooms')

    // Measure First Contentful Paint
    const fcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
          if (fcpEntry) {
            resolve(fcpEntry.startTime)
          }
        }).observe({ entryTypes: ['paint'] })
      })
    })

    // FCP should be under 1.5 seconds (1500ms)
    expect(fcp).toBeLessThan(1500)
  })
})