import { test, expect } from '@playwright/test'

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL ?? 'playwright@example.com'
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'playwright'

const toDateInputValue = (offsetDays: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  const tzOffset = date.getTimezoneOffset() * 60000
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString()
  return localISOTime.split('T')[0]
}

test.describe('Schiehallion booking and dining journey', () => {
  test('authenticated guest books a room and dining table without errors', async ({ page }) => {
    const failingResponses: { url: string; status: number }[] = []
    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    page.on('response', response => {
      const status = response.status()
      if (status === 404 || status >= 500) {
        const url = response.url()
        if (
          url.includes('_devPagesManifest.json') ||
          url.endsWith('/favicon.ico') ||
          url.includes('__nextjs_original-stack-frame')
        ) {
          return
        }
        failingResponses.push({ url, status })
      }
    })

    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text())
      }
    })

    page.on('pageerror', error => {
      pageErrors.push(error.message)
    })

    // Landing on rooms anchor should load successfully
    await page.goto('/#rooms', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Tailored stays for every travel story/i })).toBeVisible()

    // Move into the booking flow
    await page.goto('/booking', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Build Your Perfect Stay/i })).toBeVisible()

    const checkInDate = toDateInputValue(7)
    const checkOutDate = toDateInputValue(9)

    await page.getByLabel('Check-in Date').fill(checkInDate)
    await page.getByLabel('Check-out Date').fill(checkOutDate)

    const addRoomButton = page.getByRole('button', { name: 'Add Room to Cart' })
    await addRoomButton.click()
    await expect(page.getByText(/Added .* room for/i)).toBeVisible()

    await page.getByRole('button', { name: /View Cart/i }).click()
    await page.getByRole('button', { name: 'Continue to Checkout' }).click()

    // If auth modal appears (non test mode), perform login
    const loginForm = page.locator('form').filter({ has: page.getByRole('button', { name: 'Login' }) }).first()
    if (await loginForm.isVisible()) {
      await loginForm.locator('input[type="email"]').fill(TEST_USER_EMAIL)
      await loginForm.locator('input[type="password"]').fill(TEST_USER_PASSWORD)
      await loginForm.getByRole('button', { name: 'Login' }).click()
      await expect(loginForm).toBeHidden()
    }

    const authModalHeading = page.getByRole('heading', { name: 'Sign in to continue booking' })
    if (await authModalHeading.isVisible()) {
      await page.getByRole('button', { name: 'Close login' }).click()
      await expect(authModalHeading).toBeHidden()
      const continueCheckout = page.getByRole('button', { name: 'Continue to Checkout' })
      if (await continueCheckout.isVisible()) {
        await continueCheckout.click()
      }
    }

    // Guest information wizard
    await expect(page.getByRole('heading', { name: 'Personal Information' })).toBeVisible()

    await page.locator('input[name="personalInfo.firstName"]').fill('Play')
    await page.locator('input[name="personalInfo.lastName"]').fill('Wright')
    await page.locator('input[name="personalInfo.email"]').fill('guest@example.com')
    await page.locator('input[name="personalInfo.phone"]').fill('+441234567890')

    const advanceStep = async (expectedHeading: RegExp | string) => {
      await page.getByRole('button', { name: /Next|Complete Booking/i }).click()
      await expect(page.getByRole('heading', { name: expectedHeading })).toBeVisible()
    }

    await advanceStep(/Address/i)
    await advanceStep(/Preferences/i)
    await advanceStep(/Arrival/i)
    await advanceStep(/Emergency Contact/i)
    await page.getByRole('button', { name: 'Complete Booking' }).click()

    // Package selection
    await expect(page.getByRole('heading', { name: 'Choose Your Package' })).toBeVisible()
    const termsCheckbox = page.getByLabel('I have read and agree to the terms and conditions above')
    await termsCheckbox.check({ force: true })
    await page.getByRole('button', { name: 'Accept Terms & Continue' }).click()

    // Payment (test mode exposes stub controls)
    const testPaymentButton = page.getByTestId('e2e-complete-test-payment')
    await expect(testPaymentButton).toBeVisible()
    await testPaymentButton.click()

    await expect(page.getByRole('heading', { name: 'Booking Confirmed!' })).toBeVisible()

    // Navigate to restaurant journey
    await page.goto('/restaurant', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /Choose your table/i })).toBeVisible()

    // Ensure an available time slot is selected (defaults to first slot)
    const slotButton = page
      .locator('section:has-text("Time Slot Management") button')
      .filter({ hasText: /available|limited/i })
      .first()
    await expect(slotButton).toBeVisible()
    await slotButton.click()

    // Select an available table on the floor plan
    const availableTable = page
      .locator('button[aria-label^="Table"]')
      .filter({ hasText: /Available/i })
      .first()
    await availableTable.waitFor({ state: 'visible' })
    await availableTable.click()

    const provideDetailsButton = page.getByRole('button', { name: 'Provide guest details' })
    if (await provideDetailsButton.isVisible()) {
      await provideDetailsButton.click()
    }

    await expect(page.getByRole('heading', { name: /Primary guest details/i })).toBeVisible()

    await page.locator('input[name="contact.firstName"]').fill('Play')
    await page.locator('input[name="contact.lastName"]').fill('Wright')
    await page.locator('input[name="contact.email"]').fill('dining.guest@example.com')
    await page.locator('input[name="contact.phone"]').fill('+441987654321')
    await page.getByLabel('I understand the arrival, dining duration, and cancellation policies above.').check({ force: true })

    await page.getByRole('button', { name: 'Confirm reservation' }).click()
    await expect(page.getByText('Reservation confirmed')).toBeVisible()

    expect(failingResponses, `Unexpected failed responses: ${JSON.stringify(failingResponses, null, 2)}`).toEqual([])
    expect(consoleErrors, `Console errors detected: ${consoleErrors.join('\n')}`).toEqual([])
    expect(pageErrors, `Page errors detected: ${pageErrors.join('\n')}`).toEqual([])
  })
})
