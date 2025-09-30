# Firebase Setup & Permission Fix

## Issue Resolved
Firebase permission errors: `Missing or insufficient permissions` when users interact with the application.

## Root Cause
1. Test users existed in Firebase Auth but had no corresponding documents in Firestore with `role` fields
2. Firestore security rules require role-based access control (RBAC)
3. Missing security rules for restaurant features (waitlist, reservations)

## Solution Applied

### 1. Created Test User Setup Script
**Location:** `scripts/setup-test-users.ts`

This script automatically:
- Creates/updates test users in Firebase Auth
- Creates corresponding Firestore documents with proper roles
- Sets up 3 test users:
  - `playright@example.com` (guest role) - UID: ztnW1GtQjNVlcgt89lsxL3aTTVq1
  - `staff@example.com` (staff role) - UID: Xvdb5bxmZIMDotQH85myWrBc3yC3
  - `manager@example.com` (manager role) - UID: nJNuVp42piZqxKeb5UXNa44Alm23

**Run the script:**
```bash
npx tsx scripts/setup-test-users.ts
```

### 2. Updated Firestore Security Rules
**Location:** `firestore.rules`

Added rules for:
- `restaurantWaitlist` collection - guests can create, staff can manage
- `restaurantReservations` collection - guests can create, staff can manage

**Deploy rules:**
```bash
firebase deploy --only firestore:rules
```

### 3. User Document Structure
Each user document in `/users/{uid}` contains:
```json
{
  "email": "user@example.com",
  "role": "guest|staff|manager|admin",
  "displayName": "User Name",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "emailVerified": true
}
```

## Database Seeding

### Seed Rooms and Availability
**Location:** `scripts/seed-rooms.ts`

This script:
- Creates 5 hotel rooms in Firestore (standard, deluxe, suite, family, accessible)
- Initializes daily availability for the next 30 days
- Sets up pricing for each room type

**Run the script:**
```bash
npx tsx scripts/seed-rooms.ts
```

**Rooms created:**
- Room 101 - Standard Room - £150.00/night
- Room 102 - Deluxe Room - £220.00/night
- Room 201 - Suite Room - £350.00/night
- Room 103 - Family Room - £280.00/night
- Room 104 - Accessible Room - £160.00/night

## Remaining Setup Needed

### Realtime Database Instance
The Realtime Database instance still needs to be created manually:

1. Go to: https://console.firebase.google.com/project/schiehallion-1758624306/database
2. Click "Create Database" (under Realtime Database, not Firestore)
3. Choose `europe-west1` location (to match .env.local URL)
4. Start in "test mode" for development

**Current database URL:** `https://schiehallion-1758624306-default-rtdb.europe-west1.firebasedatabase.app`

## Test Credentials

From `.env.local`:
- **Guest:** playright@example.com / playright
- **Staff:** staff@example.com / (set password in .env.local)
- **Manager:** manager@example.com / (set password in .env.local)

## Permission Matrix

| Action | Guest | Staff | Manager | Admin |
|--------|-------|-------|---------|-------|
| Read own profile | ✓ | ✓ | ✓ | ✓ |
| Read guest profiles | ✗ | ✓ | ✓ | ✓ |
| Read all profiles | ✗ | ✗ | ✓ | ✓ |
| Create bookings | ✓ | ✓ | ✓ | ✓ |
| Read own bookings | ✓ | ✓ | ✓ | ✓ |
| Read all bookings | ✗ | ✓ | ✓ | ✓ |
| Manage bookings | ✗ | ✓ | ✓ | ✓ |
| Manage rooms | ✗ | ✗ | ✓ | ✓ |
| View analytics | ✗ | ✗ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✗ | ✓ |

## Verification

After setup, test the booking flow:
```bash
npm run dev
```

Navigate to http://localhost:3000/booking and log in with test credentials. You should no longer see Firebase permission errors in the console.

## Adding New Test Users

To add more test users, either:

1. **Run the script again** after adding entries to the `testUsers` array in `scripts/setup-test-users.ts`
2. **Manually create in Firebase Console:**
   - Add user in Authentication
   - Create document in Firestore: `/users/{uid}` with required fields

## Notes

- The waitlist form (terms and conditions) is currently UI-only and doesn't persist to Firebase
- To enable waitlist persistence, implement the `onSubmit` callback in `/src/app/restaurant/page.tsx`
- All Firebase operations require authentication
- Security rules are now deployed and active