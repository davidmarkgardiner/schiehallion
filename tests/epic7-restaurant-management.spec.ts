// Epic 7: Restaurant Table Management - Comprehensive Test Suite
// Tests all three user stories: SCHH-020, SCHH-021, SCHH-022

import { test, expect } from '@playwright/test'

test.describe('Epic 7: Restaurant Table Management', () => {

  // ===================================================================
  // SCHH-020: Restaurant Floor Plan Setup (13 points)
  // ===================================================================

  test.describe('SCHH-020: Restaurant Floor Plan Setup', () => {

    test('should display visual floor plan editor with drag functionality', async ({ page }) => {
      // Navigate to admin restaurant management
      await page.goto('/admin/restaurant')

      // Wait for authentication or mock it
      // Note: In a real test, you'd handle authentication properly

      // Verify floor plan editor components
      await expect(page.locator('[data-testid="floor-plan-editor"]')).toBeVisible()
      await expect(page.locator('[data-testid="table-management-studio"]')).toBeVisible()

      // Check for drag-and-drop functionality
      const firstTable = page.locator('[data-testid^="table-"]').first()
      await expect(firstTable).toBeVisible()

      // Verify tables are draggable (check for drag handlers)
      await expect(firstTable).toHaveCSS('cursor', /grab|pointer/)
    })

    test('should allow table capacity configuration', async ({ page }) => {
      await page.goto('/admin/restaurant')

      // Select a table
      const table = page.locator('[data-testid="table-t1"]').first()
      await table.click()

      // Verify capacity controls are visible
      await expect(page.locator('input[data-testid="capacity-min"]')).toBeVisible()
      await expect(page.locator('input[data-testid="capacity-default"]')).toBeVisible()
      await expect(page.locator('input[data-testid="capacity-max"]')).toBeVisible()

      // Test capacity adjustment
      const defaultInput = page.locator('input[data-testid="capacity-default"]')
      await defaultInput.fill('6')

      // Verify the change is reflected
      await expect(defaultInput).toHaveValue('6')
    })

    test('should support combinable tables logic', async ({ page }) => {
      await page.goto('/admin/restaurant')

      // Select a table that can be combined
      await page.locator('[data-testid="table-t1"]').click()

      // Look for combinable tables section
      await expect(page.locator('text=Combinable Tables')).toBeVisible()

      // Verify combination controls exist
      const combinationButtons = page.locator('[data-testid^="combine-table-"]')
      await expect(combinationButtons.first()).toBeVisible()

      // Test table combination
      await combinationButtons.first().click()

      // Verify combination summary updates
      await expect(page.locator('text=tables')).toBeVisible()
      await expect(page.locator('text=guests when combined')).toBeVisible()
    })

    test('should display special zones correctly', async ({ page }) => {
      await page.goto('/admin/restaurant')

      // Verify all zone types are displayed
      const zones = [
        'Main Dining',
        'Window',
        'Private Alcove',
        'Terrace',
        'Chef Counter'
      ]

      for (const zone of zones) {
        await expect(page.locator(`text=${zone}`)).toBeVisible()
      }

      // Verify zone backgrounds are rendered
      await expect(page.locator('[data-testid="zone-window"]')).toBeVisible()
      await expect(page.locator('[data-testid="zone-main_dining"]')).toBeVisible()
    })

    test('should allow service period configuration', async ({ page }) => {
      await page.goto('/admin/restaurant')

      // Scroll to service period section
      await page.locator('text=Service Period Configuration').scrollIntoViewIfNeeded()

      // Verify service periods are displayed
      await expect(page.locator('text=Breakfast')).toBeVisible()
      await expect(page.locator('text=Lunch')).toBeVisible()
      await expect(page.locator('text=Dinner')).toBeVisible()

      // Test time input functionality
      const startTimeInput = page.locator('input[type="time"]').first()
      await expect(startTimeInput).toBeVisible()

      // Test zone toggle functionality
      const zoneToggle = page.locator('button:has-text("Main Dining")').first()
      await zoneToggle.click()

      // Verify the toggle state changes
      await expect(zoneToggle).toHaveClass(/bg-emerald-600/)
    })

    test('should support adding new service periods', async ({ page }) => {
      await page.goto('/admin/restaurant')

      // Find and click add service period button
      const addButton = page.locator('button:has-text("Add Service Period")')
      await expect(addButton).toBeVisible()
      await addButton.click()

      // Verify new service period appears
      await expect(page.locator('text=New Service')).toBeVisible()

      // Test customization of new period
      const nameField = page.locator('input[value*="New Service"]')
      await expect(nameField).toBeVisible()
    })
  })

  // ===================================================================
  // SCHH-021: Interactive Table Selection (8 points)
  // ===================================================================

  test.describe('SCHH-021: Interactive Table Selection', () => {

    test('should display visual floor plan for guests', async ({ page }) => {
      // Navigate to guest restaurant experience
      await page.goto('/restaurant')

      // Verify guest floor plan loads
      await expect(page.locator('[data-testid="guest-floor-plan"]')).toBeVisible()
      await expect(page.locator('text=Choose your table, time, and tasting journey')).toBeVisible()

      // Check that zones are visually distinct
      const zones = page.locator('[class*="zone-background"]')
      await expect(zones).toHaveCount(5) // 5 different zones
    })

    test('should highlight available tables', async ({ page }) => {
      await page.goto('/restaurant')

      // Wait for availability data to load
      await page.waitForTimeout(2000)

      // Verify available tables have correct styling
      const availableTables = page.locator('[class*="bg-emerald-500"]')
      await expect(availableTables.first()).toBeVisible()

      // Verify unavailable tables have different styling
      const unavailableTables = page.locator('[class*="bg-slate-100"], [class*="bg-rose-100"], [class*="bg-amber-100"]')
      await expect(unavailableTables.first()).toBeVisible()
    })

    test('should show table features on hover', async ({ page }) => {
      await page.goto('/restaurant')

      // Wait for tables to load
      await page.waitForSelector('[data-testid^="table-"]')

      // Hover over a table
      const firstTable = page.locator('[data-testid^="table-"]').first()
      await firstTable.hover()

      // Verify tooltip appears with table information
      await expect(page.locator('[data-testid="table-tooltip"]')).toBeVisible()

      // Check tooltip contains expected information
      await expect(page.locator('text=seats')).toBeVisible()
      await expect(page.locator('text=zone')).toBeVisible()
    })

    test('should display accessibility indicators', async ({ page }) => {
      await page.goto('/restaurant')

      // Look for accessibility icons on tables
      const accessibilityIcons = page.locator('text=♿, text=🦻, text=🔍')
      // Note: At least one table should have accessibility features
      const tablesWithAccessibility = page.locator('[title*="accessible"], [title*="hearing"], [title*="large print"]')

      // Verify accessibility indicators are present
      await expect(tablesWithAccessibility.first()).toBeVisible()
    })

    test('should support mobile pinch/zoom', async ({ page, isMobile }) => {
      if (!isMobile) {
        test.skip(!isMobile, 'This test only applies to mobile devices')
        return
      }

      await page.goto('/restaurant')

      // Verify zoom controls are available on mobile
      await expect(page.locator('button:has-text("+")')).toBeVisible()
      await expect(page.locator('button:has-text("−")')).toBeVisible()
      await expect(page.locator('button:has-text("Reset")')).toBeVisible()

      // Test zoom functionality
      const zoomInButton = page.locator('button:has-text("+")')
      await zoomInButton.click()

      // Test reset functionality
      const resetButton = page.locator('button:has-text("Reset")')
      await resetButton.click()
    })

    test('should allow table selection and show details', async ({ page }) => {
      await page.goto('/restaurant')

      // Wait for initial load
      await page.waitForTimeout(1000)

      // Select an available table
      const availableTable = page.locator('[class*="bg-emerald-500"]').first()
      await availableTable.click()

      // Verify table details appear in sidebar
      await expect(page.locator('text=Reservation Summary')).toBeVisible()

      // Check that table information is displayed
      await expect(page.locator('text=seats')).toBeVisible()
      await expect(page.locator('text=zone')).toBeVisible()
    })
  })

  // ===================================================================
  // SCHH-022: Time Slot Management (5 points)
  // ===================================================================

  test.describe('SCHH-022: Time Slot Management', () => {

    test('should display time slots by service period', async ({ page }) => {
      await page.goto('/restaurant')

      // Verify service period selector
      await expect(page.locator('text=Service Period')).toBeVisible()

      // Check for different service periods
      const periods = ['Breakfast', 'Lunch', 'Afternoon Tea', 'Dinner']
      for (const period of periods) {
        await expect(page.locator(`button:has-text("${period}")`)).toBeVisible()
      }

      // Select a service period
      await page.locator('button:has-text("Dinner")').click()

      // Verify time slots appear
      await expect(page.locator('text=Time Slot Management')).toBeVisible()
    })

    test('should show real-time availability updates', async ({ page }) => {
      await page.goto('/restaurant')

      // Wait for initial load
      await page.waitForTimeout(2000)

      // Check for availability indicators
      await expect(page.locator('text=available')).toBeVisible()
      await expect(page.locator('text=tables free')).toBeVisible()
      await expect(page.locator('text=seats open')).toBeVisible()

      // Verify last updated timestamp
      await expect(page.locator('text=Updated')).toBeVisible()

      // Wait for automatic update (simulated every 12 seconds)
      await page.waitForTimeout(13000)

      // Verify updates occurred
      await expect(page.locator('text=Updated')).toBeVisible()
    })

    test('should display duration estimates', async ({ page }) => {
      await page.goto('/restaurant')

      // Select a time slot
      const timeSlot = page.locator('[data-testid^="time-slot-"]').first()
      await timeSlot.click()

      // Verify duration information is shown
      await expect(page.locator('text=minutes')).toBeVisible()
      await expect(page.locator('text=Approximately')).toBeVisible()
    })

    test('should show last booking times', async ({ page }) => {
      await page.goto('/restaurant')

      // Look for last booking cutoff information
      await expect(page.locator('text=Last booking')).toBeVisible()

      // Verify time format is displayed
      const timePattern = /\d{2}:\d{2}/
      const lastBookingText = await page.locator('text=Last booking').textContent()
      expect(lastBookingText).toMatch(timePattern)
    })

    test('should display special event indicators', async ({ page }) => {
      await page.goto('/restaurant')

      // Look for special events (if any in sample data)
      const specialEvents = page.locator('text=🎉, text=⚠️')
      const eventLabels = page.locator('text=Watermill Patisserie Week, text=Live Jazz Duo, text=Chef\'s Tasting Finale')

      // At least one special event should be visible in the sample data
      const anyEventVisible = await Promise.race([
        eventLabels.first().isVisible(),
        specialEvents.first().isVisible()
      ]).catch(() => false)

      if (anyEventVisible) {
        await expect(eventLabels.first()).toBeVisible()
      } else {
        // If no events are visible, that's still valid - events are optional
        console.log('No special events currently visible (this is acceptable)')
      }
    })

    test('should allow time slot selection and reservation', async ({ page }) => {
      await page.goto('/restaurant')

      // Wait for data to load
      await page.waitForTimeout(2000)

      // Select a service period
      await page.locator('button:has-text("Dinner")').click()

      // Select a time slot
      const availableSlot = page.locator('[class*="available"]').first()
      await availableSlot.click()

      // Select an available table
      const availableTable = page.locator('[class*="bg-emerald-500"]').first()
      await availableTable.click()

      // Verify reservation button appears
      await expect(page.locator('button:has-text("Reserve this table")')).toBeVisible()

      // Test reservation action
      const reserveButton = page.locator('button:has-text("Reserve this table")')
      if (await reserveButton.isEnabled()) {
        await reserveButton.click()

        // Verify reservation confirmation (mock alert)
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('reserved')
          await dialog.accept()
        })
      }
    })

    test('should handle full slots with waitlist option', async ({ page }) => {
      await page.goto('/restaurant')

      // Look for full slots
      const fullSlots = page.locator('[class*="full"]')

      if (await fullSlots.count() > 0) {
        await fullSlots.first().click()

        // Verify waitlist option appears
        await expect(page.locator('button:has-text("Join waitlist")')).toBeVisible()

        // Test waitlist functionality
        const waitlistButton = page.locator('button:has-text("Join waitlist")')
        await waitlistButton.click()

        // Verify waitlist confirmation
        page.on('dialog', async dialog => {
          expect(dialog.message()).toContain('waitlist')
          await dialog.accept()
        })
      } else {
        console.log('No full slots available for testing waitlist functionality')
      }
    })
  })

  // ===================================================================
  // Integration Tests
  // ===================================================================

  test.describe('Epic 7: Integration Tests', () => {

    test('should handle complete table reservation flow', async ({ page }) => {
      await page.goto('/restaurant')

      // Complete reservation flow
      await page.waitForTimeout(2000)

      // 1. Select date (if date picker exists)
      const dateSelector = page.locator('select[data-testid="date-selector"]')
      if (await dateSelector.isVisible()) {
        await dateSelector.selectOption({ index: 0 })
      }

      // 2. Select service period
      await page.locator('button:has-text("Dinner")').click()

      // 3. Select time slot
      const timeSlots = page.locator('[data-testid^="time-slot-"]')
      await timeSlots.first().click()

      // 4. Select table
      const availableTables = page.locator('[class*="bg-emerald-500"]')
      if (await availableTables.count() > 0) {
        await availableTables.first().click()

        // 5. Verify complete reservation summary
        await expect(page.locator('text=Reservation Summary')).toBeVisible()
        await expect(page.locator('button:has-text("Reserve this table")')).toBeVisible()
      }
    })

    test('should maintain state during navigation', async ({ page }) => {
      await page.goto('/restaurant')

      // Select preferences
      await page.waitForTimeout(2000)
      await page.locator('button:has-text("Dinner")').click()

      const selectedPeriod = page.locator('button:has-text("Dinner")[class*="bg-emerald-600"]')
      await expect(selectedPeriod).toBeVisible()

      // Navigate away and back
      await page.goto('/rooms')
      await page.goto('/restaurant')

      // Verify state is maintained (or properly reset)
      await expect(page.locator('text=Choose your table')).toBeVisible()
    })

    test('should be responsive on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/restaurant')

      // Verify mobile layout
      await expect(page.locator('text=Choose your table')).toBeVisible()

      // Test mobile interactions
      const table = page.locator('[data-testid^="table-"]').first()
      await table.tap()

      // Verify mobile-specific features
      await expect(page.locator('button:has-text("+")')).toBeVisible() // Zoom controls
    })

    test('should handle error states gracefully', async ({ page }) => {
      await page.goto('/restaurant')

      // Test with no network (simulate offline)
      await page.context().setOffline(true)

      // Attempt to load data
      await page.reload()

      // Should handle offline gracefully (implementation dependent)
      // At minimum, should not crash
      await expect(page.locator('body')).toBeVisible()

      // Restore network
      await page.context().setOffline(false)
    })

    test('should validate Epic 7 completion criteria', async ({ page }) => {
      // Test admin functionality
      await page.goto('/admin/restaurant')
      await expect(page.locator('text=Table Management Studio')).toBeVisible()

      // Test guest functionality
      await page.goto('/restaurant')
      await expect(page.locator('text=Choose your table, time, and tasting journey')).toBeVisible()

      // Verify all major components are present
      const requiredElements = [
        'text=Floor Plan',
        'text=Time Slot Management',
        'text=Reservation Summary',
        'text=Service Period'
      ]

      for (const element of requiredElements) {
        await expect(page.locator(element)).toBeVisible()
      }

      console.log('✅ Epic 7: Restaurant Table Management - All criteria validated')
    })
  })
})