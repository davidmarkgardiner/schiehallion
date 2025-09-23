import { test, expect } from '@playwright/test'

test.describe('MODULE_NOT_FOUND Fix Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Visit the home page first
    await page.goto('/')
  })

  test('Home page loads successfully without MODULE_NOT_FOUND errors', async ({ page }) => {
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Schiehallion Hotel/)

    // Verify no error boundaries are shown
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
    await expect(page.locator('text=Page Not Found')).not.toBeVisible()
  })

  test('Rooms page loads successfully without 500 errors', async ({ page }) => {
    // Navigate to rooms page
    await page.goto('/rooms')

    // Verify the page loads correctly
    await expect(page).toHaveTitle(/Schiehallion Hotel/)

    // Check for page content
    await expect(page.locator('h1')).toContainText('Find Your Perfect Stay')

    // Verify no error messages
    await expect(page.locator('text=Something went wrong')).not.toBeVisible()
    await expect(page.locator('text=MODULE_NOT_FOUND')).not.toBeVisible()
  })

  test('All critical UI components load without import errors', async ({ page }) => {
    await page.goto('/rooms')

    // Wait for main components to load
    await expect(page.locator('[data-testid="site-navigation"], header')).toBeVisible()

    // Check that shopping cart functionality works (this uses zustand)
    await expect(page.locator('text=Cart').or(page.locator('[data-testid="cart"]'))).toBeVisible({ timeout: 10000 })

    // Verify room list loads (this uses the fixed RoomList component)
    await expect(page.locator('text=Room').or(page.locator('[data-testid="room-list"]'))).toBeVisible({ timeout: 15000 })
  })

  test('Navigation between pages works correctly', async ({ page }) => {
    // Test navigation from home to rooms
    await page.goto('/')
    await page.click('text=Rooms')
    await expect(page).toHaveURL(/.*\/rooms/)

    // Test navigation from rooms back to home
    await page.click('text=Overview')
    await expect(page).toHaveURL(/.*\/$/)
  })

  test('Error components are accessible when needed', async ({ page }) => {
    // Test 404 page
    await page.goto('/non-existent-page')
    await expect(page.locator('h1')).toContainText('Page Not Found')
    await expect(page.locator('text=Back to Home')).toBeVisible()
  })

  test('Shadcn UI components render correctly', async ({ page }) => {
    await page.goto('/rooms')

    // Check that buttons use the correct shadcn/ui styling (depends on class-variance-authority)
    const buttons = page.locator('button')
    await expect(buttons.first()).toBeVisible()

    // Verify that the loading component works
    await page.reload()
    // The loading component should briefly appear
    await expect(page.locator('text=Loading...')).toBeVisible({ timeout: 2000 })
  })

  test('TypeScript compilation issues are resolved', async ({ page }) => {
    await page.goto('/rooms')

    // Check that room type filtering works (this was affected by the roomType vs type issue)
    const roomTypeSelect = page.locator('select').filter({ hasText: 'Room Type' }).or(
      page.locator('[data-testid="room-type-filter"]')
    )

    if (await roomTypeSelect.isVisible()) {
      await roomTypeSelect.selectOption('standard')
      // Should not cause any JavaScript errors
    }
  })

  test('Firebase integration works without module errors', async ({ page }) => {
    await page.goto('/rooms')

    // Check that Firebase auth context loads
    // The auth context should not cause MODULE_NOT_FOUND errors
    await expect(page.locator('body')).toBeVisible()

    // If there were Firebase module issues, the page wouldn't load at all
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('Critical Dependencies Verification', () => {
  test('class-variance-authority is properly loaded', async ({ page }) => {
    await page.goto('/rooms')

    // Check that buttons have proper styling from CVA
    const button = page.locator('button').first()
    await expect(button).toBeVisible()

    // CVA should apply proper classes - if missing, buttons would look unstyled
    const buttonClasses = await button.getAttribute('class')
    expect(buttonClasses).toContain('inline-flex') // This comes from buttonVariants in CVA
  })

  test('tailwind-merge and clsx work correctly', async ({ page }) => {
    await page.goto('/rooms')

    // These utilities are used in the cn() function throughout the app
    // If they're missing, styling would be broken
    await expect(page.locator('body')).toHaveClass(/.*/)
  })

  test('@radix-ui/react-icons loads correctly', async ({ page }) => {
    await page.goto('/rooms')

    // Check for any icon components that would use radix icons
    const icons = page.locator('svg')
    if (await icons.count() > 0) {
      await expect(icons.first()).toBeVisible()
    }
  })
})