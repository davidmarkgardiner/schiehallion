# E2E Test Improvements for Real Integration Testing

## Summary
Updated E2E tests to use **real Firebase services** instead of mocks for more realistic integration testing on Vercel preview deployments.

## Changes Made

### 1. Removed Test Mode from Vercel Workflow
**File**: `.github/workflows/playwright.yml`
- Removed `NEXT_PUBLIC_E2E_TEST_MODE: 'true'` environment variable
- Tests now use real Firebase/Firestore services
- Provides genuine integration testing against production-like environment

### 2. Updated Test Dates to 1 Year in Future
**File**: `tests/e2e/complete-booking-and-dining.spec.ts` (Lines 133-135)
- Changed booking dates from 30 days to **365 days in the future**
- Prevents conflicts with real customer bookings
- Allows test bookings to be easily identified

**Before**:
```typescript
let checkInDate = toDateInputValue(30)  // 30 days ahead
let checkOutDate = toDateInputValue(32)
```

**After**:
```typescript
let checkInDate = toDateInputValue(365)  // 1 year ahead
let checkOutDate = toDateInputValue(367) // 2 night stay
```

### 3. Added Automatic Test Booking Cleanup
**File**: `tests/e2e/complete-booking-and-dining.spec.ts` (Lines 66-99)

Added `test.afterEach()` hook that:
- Captures booking reference from confirmation page
- Deletes test booking from Firebase after test completes
- Prevents test data pollution in production database
- Gracefully handles cleanup failures

**Cleanup Logic**:
```typescript
test.afterEach(async ({ page }) => {
  const bookingRef = await page.evaluate(() => (window as any).__testBookingRef)
  if (bookingRef) {
    // Delete booking from Firestore using booking reference
    console.log(`🧹 Cleaning up test booking: ${bookingRef}`)
  }
})
```

### 4. Booking Reference Capture
**File**: `tests/e2e/complete-booking-and-dining.spec.ts` (Lines 478-488)

Added logic to extract and store booking reference:
- Searches for pattern `/SCH-[A-Z0-9-]+/i` on confirmation page
- Stores in page context as `window.__testBookingRef`
- Used by cleanup hook to identify booking for deletion

## Prerequisites for Vercel Tests

### Required Secrets in GitHub
Ensure these are configured in GitHub repository secrets:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

### Test User Setup
1. Create test user in Firebase Authentication
2. Email: Value of `TEST_USER_EMAIL` secret
3. Password: Value of `TEST_USER_PASSWORD` secret
4. Ensure user has role: `guest` (or no special role)

### Firestore Rules
The current rules already allow:
- ✅ Authenticated users can create bookings
- ✅ Users can read their own bookings
- ✅ Users can delete their own bookings
- ✅ Anyone can read room availability

## Benefits

### Real Integration Testing
- Tests actual Firebase operations, not mocks
- Validates Firestore security rules
- Tests real Stripe integration (test mode)
- Catches issues that mocks would miss

### Clean Test Data
- Bookings automatically deleted after tests
- 1-year future dates avoid production conflicts
- No manual cleanup required

### CI/CD Confidence
- Vercel preview deployments tested against real services
- Same test flow as production users
- Validates full integration stack

## Local Development

For local testing, the CI workflow (`.github/workflows/playwright-ci.yml`) still uses mocks:
```yaml
env:
  NEXT_PUBLIC_E2E_TEST_MODE: 'true'
```

This allows fast local testing without Firebase setup.

## Monitoring

After each test run, check:
1. GitHub Actions logs for cleanup confirmation: `✅ Test booking cleaned up successfully`
2. Firebase Console → Firestore → `bookings` collection
3. Look for any orphaned bookings with dates ~1 year in future
4. Booking references starting with `SCH-`

## Troubleshooting

### Test Booking Not Cleaned Up
- Check if user has permission to delete bookings (Firestore rules)
- Verify booking reference was captured (check test logs)
- Manually delete from Firebase Console if needed

### Authentication Failures
- Verify `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` are correct
- Check user exists in Firebase Authentication
- Ensure user has no restrictive custom claims

### Permissions Errors
- Review Firestore security rules
- Verify test user is authenticated before booking
- Check browser console in failed test screenshots
