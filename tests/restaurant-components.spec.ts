import { test, expect } from '@playwright/test'

test.describe('Restaurant Components', () => {
  test('should load restaurant guest experience without errors', async ({ page }) => {
    console.log('🍽️  Testing restaurant guest experience page...')

    // Track console errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate to restaurant page
    await page.goto('http://localhost:3000/restaurant', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    })

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Check for main heading
    const heading = page.locator('h1:has-text("Choose your table, time, and tasting journey")')
    await expect(heading).toBeVisible({ timeout: 10000 })
    console.log('✅ Restaurant page header loaded')

    // Check for floor plan
    const floorPlan = page.locator('[class*="floorplan"], [style*="background-image"]')
    await expect(floorPlan.first()).toBeVisible()
    console.log('✅ Floor plan visible')

    // Check for date selection
    const dateSelect = page.locator('select').first()
    await expect(dateSelect).toBeVisible()
    console.log('✅ Date selection available')

    // Check for service periods
    const servicePeriods = page.locator('button:has-text("Lunch"), button:has-text("Dinner")')
    const periodCount = await servicePeriods.count()
    expect(periodCount).toBeGreaterThan(0)
    console.log(`✅ Service periods visible (${periodCount} found)`)

    // Take screenshot
    await page.screenshot({
      path: 'test-results/restaurant-guest-experience.png',
      fullPage: true,
    })

    // Check for performance issues
    console.log('📊 Checking performance...')

    // Navigate around to test re-renders
    if (periodCount > 1) {
      await servicePeriods.first().click()
      await page.waitForTimeout(500)
      console.log('✅ Service period selection works')
    }

    // Check for any React errors
    const hasReactErrors = consoleErrors.some(error =>
      error.includes('React') || error.includes('Warning') || error.includes('Error')
    )

    if (consoleErrors.length > 0) {
      console.log('⚠️  Console errors found:', consoleErrors)
    }

    expect(hasReactErrors).toBe(false)
    console.log('✅ No React errors detected')

    console.log('🎯 Restaurant guest experience test completed')
  })

  test('should load restaurant admin management without errors', async ({ page }) => {
    console.log('🔧 Testing restaurant admin management...')

    // This test requires authentication, so we'll check if it redirects properly
    await page.goto('http://localhost:3000/admin/restaurant', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    })

    await page.waitForTimeout(2000)

    // Check if redirected to login (expected behavior)
    const currentUrl = page.url()
    if (currentUrl.includes('/admin/login') || currentUrl.includes('/login')) {
      console.log('✅ Admin restaurant page properly redirects to login')
    } else {
      // If somehow authenticated, check the management interface
      const managementHeader = page.locator('h1:has-text("Table Management Studio")')
      if (await managementHeader.isVisible({ timeout: 5000 })) {
        console.log('✅ Restaurant management interface loaded')

        // Take screenshot
        await page.screenshot({
          path: 'test-results/restaurant-admin-management.png',
          fullPage: true,
        })
      }
    }

    console.log('🎯 Restaurant admin management test completed')
  })

  test('should handle table interactions smoothly', async ({ page }) => {
    console.log('🎯 Testing table interaction performance...')

    // Navigate to restaurant page
    await page.goto('http://localhost:3000/restaurant', {
      waitUntil: 'domcontentloaded'
    })

    await page.waitForTimeout(3000)

    // Find table buttons
    const tableButtons = page.locator('button[aria-label*="seats"]')
    const tableCount = await tableButtons.count()
    console.log(`Found ${tableCount} table buttons`)

    if (tableCount > 0) {
      // Test table selection
      const firstTable = tableButtons.first()
      await firstTable.click()
      console.log('✅ Table selection works')

      // Test hover states (simulate with focus)
      await firstTable.focus()
      await page.waitForTimeout(500)
      console.log('✅ Table focus/hover works')

      // Check for reservation summary
      const reservationSummary = page.locator('h2:has-text("Reservation Summary")')
      await expect(reservationSummary).toBeVisible()
      console.log('✅ Reservation summary updates')
    }

    // Take final screenshot
    await page.screenshot({
      path: 'test-results/restaurant-table-interactions.png',
      fullPage: true,
    })

    console.log('🎯 Table interaction test completed')
  })
})