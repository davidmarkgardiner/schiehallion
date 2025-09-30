# Booking Flow Error Fixes

## Summary of Issues and Solutions

### 1. ✅ Firebase Permission Errors
**Error:** `FirebaseError: Missing or insufficient permissions`

**Root Cause:**
- Test users existed in Firebase Auth but had no Firestore user documents with `role` fields
- Security rules require role-based access for all operations

**Solution:**
Created `scripts/setup-test-users.ts` to automatically:
- Create user documents in Firestore with proper roles
- Set up 3 test users: guest, staff, and manager
- Link Auth UIDs to Firestore user documents

**How to Run:**
```bash
npx tsx scripts/setup-test-users.ts
```

---

### 2. ✅ Undefined Field Values Error
**Error:** `FirebaseError: Unsupported field value: undefined (found in field guestInfo.dateOfBirth)`

**Root Cause:**
- Firestore doesn't accept `undefined` values
- Optional fields like `dateOfBirth`, `nationality`, `address` were being set to `undefined`

**Solution:**
Added `removeUndefinedFields()` helper method in `src/lib/firebase/hotel-service.ts`:
- Recursively removes all `undefined` values from objects before writing
- Properly handles nested objects, arrays, and Firestore Timestamps
- Fields with `undefined` values are completely omitted from the document

**File Modified:**
- `src/lib/firebase/hotel-service.ts` (lines 138-153, 187)

---

### 3. ✅ Room Not Found Error
**Error:** `Error: Room not found` when creating bookings

**Root Cause:**
- Rooms only existed as mock data in code
- Firestore `rooms` collection was empty
- Availability service tried to look up rooms during booking creation

**Solution:**
Created `scripts/seed-rooms.ts` to populate Firestore with:
- 5 hotel rooms (standard, deluxe, suite, family, accessible)
- Daily availability documents for next 30 days
- Pricing information for each room type

**How to Run:**
```bash
npx tsx scripts/seed-rooms.ts
```

**Rooms Created:**
| Room # | Type | Price/Night | Max Guests | Features |
|--------|------|-------------|------------|----------|
| 101 | Standard | £150 | 2 | Garden view, Queen bed |
| 102 | Deluxe | £220 | 3 | Mountain view, King bed, Balcony |
| 201 | Suite | £350 | 4 | Mountain view, Separate living area |
| 103 | Family | £280 | 5 | Garden view, Multiple beds |
| 104 | Accessible | £160 | 2 | Wheelchair accessible, Adaptive features |

---

### 4. ✅ Security Rules Updated
**File:** `firestore.rules`

**Added Rules For:**
- `restaurantWaitlist` collection - Guests can create, staff can manage
- `restaurantReservations` collection - Guests can create, staff can manage

**Deployed:**
```bash
firebase deploy --only firestore:rules
```

---

## Complete Setup Checklist

- [x] Test users created with roles in Firestore
- [x] Firestore security rules deployed
- [x] Undefined fields cleaned before writing
- [x] Rooms seeded in Firestore
- [x] Daily availability initialized (30 days)
- [ ] Realtime Database instance created (manual step required)

---

## Scripts Created

1. **`scripts/setup-test-users.ts`**
   - Creates test users with proper roles
   - Links Firebase Auth to Firestore user documents

2. **`scripts/seed-rooms.ts`**
   - Populates rooms collection
   - Initializes availability for 30 days
   - Sets up pricing data

---

## Testing the Booking Flow

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to booking page:**
   ```
   http://localhost:3000/booking
   ```

3. **Log in with test credentials:**
   - Email: `playright@example.com`
   - Password: `playright`

4. **Complete a booking:**
   - Select dates and guest count
   - Choose a room
   - Select package (Room Only, B&B, Half Board)
   - Add to cart
   - Fill in guest information
   - Proceed to payment

5. **Expected Result:**
   - ✅ No Firebase permission errors
   - ✅ No undefined field errors
   - ✅ Room availability checks work
   - ✅ Booking created successfully in Firestore

---

## Verification Queries

Check if data exists in Firestore:

```bash
# Check users
firebase firestore:get users/ztnW1GtQjNVlcgt89lsxL3aTTVq1

# Check rooms
firebase firestore:list rooms

# Check availability
firebase firestore:list dailyAvailability
```

---

## Notes

### Remaining Manual Setup

The **Realtime Database** instance must be created manually in Firebase Console:

1. Go to: https://console.firebase.google.com/project/schiehallion-1758624306/database
2. Click "Create Database" under Realtime Database (not Firestore)
3. Choose `europe-west1` region
4. Start in "test mode" for development

**Database URL:** `https://schiehallion-1758624306-default-rtdb.europe-west1.firebasedatabase.app`

### Database Rules

Realtime Database rules are in `database.rules.json` and include:
- Availability read/write for authenticated users
- Booking locks for reservation process
- Occupancy status for staff only

---

## Related Documentation

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Complete Firebase setup guide
- [firestore.rules](./firestore.rules) - Firestore security rules
- [database.rules.json](./database.rules.json) - Realtime Database rules

---

## Error Resolution Timeline

1. **Firebase Permission Errors** → Fixed with test user setup
2. **Undefined Field Values** → Fixed with field cleaning utility
3. **Room Not Found** → Fixed with room seeding script
4. **Missing Security Rules** → Fixed with rule updates

All booking flow errors are now resolved! 🎉