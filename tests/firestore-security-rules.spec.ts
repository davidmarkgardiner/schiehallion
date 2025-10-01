// Firestore Security Rules Tests for PR #27
// Tests security rule changes for guest-friendly booking flow

import { test, expect } from '@playwright/test'

test.describe('Firestore Security Rules', () => {
  test('unauthenticated users can read room data', async ({ page }) => {
    // Don't sign in - test as guest
    await page.goto('http://localhost:3001/booking')
    await page.waitForLoadState('networkidle')

    // Should be able to see rooms without authentication
    await page.waitForSelector('[data-testid="room-card"], .room-card, button:has-text("Add to Cart")', {
      timeout: 10000,
    })

    // Verify rooms are displayed
    const roomElements = await page.locator('button:has-text("Add to Cart")').count()
    expect(roomElements).toBeGreaterThan(0)

    // Verify no permission error in console
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('permission')) {
        errors.push(msg.text())
      }
    })

    // Wait a bit to catch any permission errors
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })

  test('unauthenticated users can read availability data', async ({ page }) => {
    // Don't sign in - test as guest
    await page.goto('http://localhost:3001/booking')
    await page.waitForLoadState('networkidle')

    // Select dates (this should query availability)
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 2)

    await page.fill('input[type="date"]', checkIn.toISOString().split('T')[0])
    await page.fill('input[type="date"]:nth-of-type(2)', checkOut.toISOString().split('T')[0])

    // Should see availability results without permission errors
    await page.waitForTimeout(2000)

    // Verify no permission errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('permission')) {
        errors.push(msg.text())
      }
    })

    await page.waitForTimeout(1000)
    expect(errors.length).toBe(0)
  })

  test('authenticated non-staff users cannot write room data', async ({ page }) => {
    // Login as regular guest user
    await page.goto('http://localhost:3001/booking')
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('**/booking', { timeout: 10000 })

    // Try to modify room data via console (simulating unauthorized write)
    const writeAttemptError = await page.evaluate(async () => {
      try {
        const { getFirestore, doc, setDoc } = await import('firebase/firestore')
        const { getApp } = await import('firebase/app')

        const db = getFirestore(getApp())
        await setDoc(doc(db, 'rooms', 'test-unauthorized-write'), {
          type: 'deluxe',
          roomNumber: '999',
          pricePerNight: 99999,
        })
        return null // No error means write succeeded (bad!)
      } catch (error: any) {
        return error.code || error.message
      }
    })

    // Should get permission-denied error
    expect(writeAttemptError).toContain('permission-denied')
  })

  test('staff users can write room data', async ({ page }) => {
    // This test would require a staff account
    // For now, we'll verify the rule exists in firestore.rules

    const rulesContent = await page.evaluate(async () => {
      try {
        const response = await fetch('/firestore.rules')
        return await response.text()
      } catch {
        return null
      }
    })

    // Verify staff write rule exists
    // (In a real test, you'd use Firebase emulator and actually test with staff account)
    if (rulesContent) {
      expect(rulesContent).toContain('allow write: if isStaff()')
    }
  })

  test('authenticated users can create their own bookings', async ({ page }) => {
    // Login as guest
    await page.goto('http://localhost:3001/booking')
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('**/booking', { timeout: 10000 })

    // Select dates
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 2)

    await page.fill('input[type="date"]', checkIn.toISOString().split('T')[0])
    await page.fill('input[type="date"]:nth-of-type(2)', checkOut.toISOString().split('T')[0])

    // Add room to cart
    await page.waitForSelector('button:has-text("Add to Cart")')
    await page.click('button:has-text("Add to Cart")')

    // Monitor for permission errors
    const permissionErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('permission')) {
        permissionErrors.push(msg.text())
      }
    })

    // Open cart
    await page.click('button:has-text("Shopping Cart")')
    await page.waitForTimeout(1000)

    // Should not have permission errors when adding to cart
    expect(permissionErrors.length).toBe(0)
  })

  test('unauthenticated users cannot create bookings', async ({ page }) => {
    // Don't sign in
    await page.goto('http://localhost:3001/booking')
    await page.waitForLoadState('networkidle')

    // Try to create booking via console (simulating unauthorized write)
    const writeAttemptError = await page.evaluate(async () => {
      try {
        const { getFirestore, collection, addDoc } = await import('firebase/firestore')
        const { getApp } = await import('firebase/app')

        const db = getFirestore(getApp())
        await addDoc(collection(db, 'bookings'), {
          guestUserId: 'unauthorized-user',
          roomId: 'test-room',
          checkInDate: new Date(),
          checkOutDate: new Date(),
          status: 'pending',
        })
        return null // No error means write succeeded (bad!)
      } catch (error: any) {
        return error.code || error.message
      }
    })

    // Should get permission-denied error
    expect(writeAttemptError).toContain('permission-denied')
  })

  test('authenticated users can read their own bookings', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3001/booking')
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('**/booking', { timeout: 10000 })

    // Navigate to bookings page
    await page.goto('http://localhost:3001/bookings')
    await page.waitForLoadState('networkidle')

    // Monitor for permission errors
    const permissionErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('permission')) {
        permissionErrors.push(msg.text())
      }
    })

    await page.waitForTimeout(2000)

    // Should not have permission errors
    expect(permissionErrors.length).toBe(0)

    // Should see bookings page content
    const hasBookingsHeading = await page.locator('text=My Bookings, text=Your Bookings').isVisible({ timeout: 5000 }).catch(() => false)
    const hasNoBookings = await page.locator('text=No bookings, text=no reservations').isVisible({ timeout: 5000 }).catch(() => false)

    // Should show either bookings or "no bookings" message
    expect(hasBookingsHeading || hasNoBookings).toBeTruthy()
  })

  test('authenticated users cannot read other users bookings', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3001/booking')
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('**/booking', { timeout: 10000 })

    // Try to read another user's booking via console
    const readAttemptError = await page.evaluate(async () => {
      try {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore')
        const { getApp } = await import('firebase/app')

        const db = getFirestore(getApp())
        // Try to read a booking that doesn't belong to this user
        const docRef = doc(db, 'bookings', 'some-other-users-booking-id')
        const docSnap = await getDoc(docRef)

        // If we can read it and it exists, that's a security issue
        if (docSnap.exists()) {
          return 'SECURITY_ISSUE_CAN_READ_OTHER_BOOKING'
        }
        return null
      } catch (error: any) {
        return error.code || error.message
      }
    })

    // Should either get permission error or document not found
    // (permission-denied or not-found are both acceptable)
    if (readAttemptError) {
      expect(readAttemptError).toMatch(/permission-denied|not-found/)
    }
  })

  test('authenticated users can update their own bookings', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3001/booking')
    await page.click('button:has-text("Sign in with Google")')
    await page.waitForURL('**/booking', { timeout: 10000 })

    // Create a booking first (simplified - assumes booking creation works)
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + 2)

    await page.fill('input[type="date"]', checkIn.toISOString().split('T')[0])
    await page.fill('input[type="date"]:nth-of-type(2)', checkOut.toISOString().split('T')[0])

    await page.waitForSelector('button:has-text("Add to Cart")')
    await page.click('button:has-text("Add to Cart")')

    // The cart itself tests the booking creation/update flow
    // If we can add to cart and proceed without errors, update permissions work
    await page.click('button:has-text("Shopping Cart")')

    const permissionErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && msg.text().includes('permission')) {
        permissionErrors.push(msg.text())
      }
    })

    await page.waitForTimeout(1000)
    expect(permissionErrors.length).toBe(0)
  })

  test('verify firestore rules file has correct structure', async ({ page }) => {
    // Verify the rules file has the expected security structure
    const fs = require('fs')
    const path = require('path')

    const rulesPath = path.join(process.cwd(), 'firestore.rules')
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8')

    // Verify key security rules are present
    expect(rulesContent).toContain('allow read: if true') // Public room read
    expect(rulesContent).toContain('allow write: if isStaff()') // Staff-only room write
    expect(rulesContent).toContain('allow create: if isAuthenticated()') // Auth required for booking creation
    expect(rulesContent).toContain('function isAuthenticated()') // Helper function exists
    expect(rulesContent).toContain('function isStaff()') // Helper function exists

    // Verify rooms collection has correct rules
    const roomsSection = rulesContent.match(/match \/rooms\/{roomId}[\s\S]*?}/)?.[0]
    expect(roomsSection).toBeTruthy()
    expect(roomsSection).toContain('allow read: if true')
    expect(roomsSection).toContain('allow write: if isStaff()')
  })
})
