/**
 * Seed Firestore with Room Data
 *
 * This script populates the Firestore 'rooms' collection with mock room data
 * and initializes availability for the next 30 days.
 *
 * Usage: npx tsx scripts/seed-rooms.ts
 */

import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

const db = getFirestore()

// Mock room data
const mockRooms = [
  {
    id: 'room-001',
    roomNumber: '101',
    type: 'standard',
    floor: 1,
    status: 'available',
    maxOccupancy: 2,
    size: 25,
    view: 'garden',
    description: 'Comfortable standard room with garden views and modern amenities.',
    bedConfiguration: [{ type: 'queen', count: 1 }],
    features: {
      wifi: true,
      airConditioning: true,
      heating: true,
      minibar: true,
      safe: true,
      television: true,
      telephone: true,
      balcony: false,
      bathtub: true,
      shower: true,
      hairdryer: true,
      coffeeMarker: true,
      workDesk: true,
      ironingBoard: true,
      accessibleFeatures: []
    },
    images: [],
    pricing: {
      basePrice: 15000, // £150.00
      seasonalRates: {},
      weekendSurcharge: 2000,
      lastMinuteDiscount: 10,
      extendedStayDiscount: {
        minNights: 7,
        discountPercentage: 15
      }
    },
    lastMaintenance: Timestamp.fromDate(new Date('2024-01-01')),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'room-002',
    roomNumber: '102',
    type: 'deluxe',
    floor: 1,
    status: 'available',
    maxOccupancy: 3,
    size: 35,
    view: 'mountain',
    description: 'Spacious deluxe room with stunning mountain views and premium furnishings.',
    bedConfiguration: [{ type: 'king', count: 1 }],
    features: {
      wifi: true,
      airConditioning: true,
      heating: true,
      minibar: true,
      safe: true,
      television: true,
      telephone: true,
      balcony: true,
      bathtub: true,
      shower: true,
      hairdryer: true,
      coffeeMarker: true,
      workDesk: true,
      ironingBoard: true,
      accessibleFeatures: []
    },
    images: [],
    pricing: {
      basePrice: 22000, // £220.00
      seasonalRates: {},
      weekendSurcharge: 3000,
      lastMinuteDiscount: 15,
      extendedStayDiscount: {
        minNights: 5,
        discountPercentage: 12
      }
    },
    lastMaintenance: Timestamp.fromDate(new Date('2024-01-01')),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'room-003',
    roomNumber: '201',
    type: 'suite',
    floor: 2,
    status: 'available',
    maxOccupancy: 4,
    size: 55,
    view: 'mountain',
    description: 'Luxurious suite with separate living area, mountain views, and premium amenities.',
    bedConfiguration: [{ type: 'king', count: 1 }, { type: 'sofa-bed', count: 1 }],
    features: {
      wifi: true,
      airConditioning: true,
      heating: true,
      minibar: true,
      safe: true,
      television: true,
      telephone: true,
      balcony: true,
      bathtub: true,
      shower: true,
      hairdryer: true,
      coffeeMarker: true,
      workDesk: true,
      ironingBoard: true,
      accessibleFeatures: []
    },
    images: [],
    pricing: {
      basePrice: 35000, // £350.00
      seasonalRates: {},
      weekendSurcharge: 5000,
      lastMinuteDiscount: 20,
      extendedStayDiscount: {
        minNights: 4,
        discountPercentage: 18
      }
    },
    lastMaintenance: Timestamp.fromDate(new Date('2024-01-01')),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'room-004',
    roomNumber: '103',
    type: 'family',
    floor: 1,
    status: 'available',
    maxOccupancy: 5,
    size: 45,
    view: 'garden',
    description: 'Spacious family room perfect for larger groups with flexible sleeping arrangements.',
    bedConfiguration: [{ type: 'queen', count: 1 }, { type: 'single', count: 2 }],
    features: {
      wifi: true,
      airConditioning: true,
      heating: true,
      minibar: true,
      safe: true,
      television: true,
      telephone: true,
      balcony: false,
      bathtub: true,
      shower: true,
      hairdryer: true,
      coffeeMarker: true,
      workDesk: true,
      ironingBoard: true,
      accessibleFeatures: []
    },
    images: [],
    pricing: {
      basePrice: 28000, // £280.00
      seasonalRates: {},
      weekendSurcharge: 4000,
      lastMinuteDiscount: 12,
      extendedStayDiscount: {
        minNights: 5,
        discountPercentage: 15
      }
    },
    lastMaintenance: Timestamp.fromDate(new Date('2024-01-01')),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'room-005',
    roomNumber: '104',
    type: 'accessible',
    floor: 1,
    status: 'available',
    maxOccupancy: 2,
    size: 30,
    view: 'garden',
    description: 'Fully accessible room with wheelchair-friendly features and adaptive equipment.',
    bedConfiguration: [{ type: 'queen', count: 1 }],
    features: {
      wifi: true,
      airConditioning: true,
      heating: true,
      minibar: true,
      safe: true,
      television: true,
      telephone: true,
      balcony: false,
      bathtub: false,
      shower: true,
      hairdryer: true,
      coffeeMarker: true,
      workDesk: true,
      ironingBoard: true,
      accessibleFeatures: ['wheelchair-accessible', 'grab-bars', 'roll-in-shower', 'lowered-fixtures']
    },
    images: [],
    pricing: {
      basePrice: 16000, // £160.00
      seasonalRates: {},
      weekendSurcharge: 2000,
      lastMinuteDiscount: 10,
      extendedStayDiscount: {
        minNights: 7,
        discountPercentage: 15
      }
    },
    lastMaintenance: Timestamp.fromDate(new Date('2024-01-01')),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
]

async function initializeAvailability(days: number = 30) {
  console.log(`\n📅 Initializing availability for next ${days} days...`)

  const batch = db.batch()
  const today = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const availability: any = {
      standard: {
        totalRooms: 1,
        availableRooms: 1,
        bookedRooms: 0,
        maintenanceRooms: 0,
        outOfOrderRooms: 0,
        roomIds: {
          available: ['room-001'],
          booked: [],
          maintenance: [],
          outOfOrder: []
        }
      },
      deluxe: {
        totalRooms: 1,
        availableRooms: 1,
        bookedRooms: 0,
        maintenanceRooms: 0,
        outOfOrderRooms: 0,
        roomIds: {
          available: ['room-002'],
          booked: [],
          maintenance: [],
          outOfOrder: []
        }
      },
      suite: {
        totalRooms: 1,
        availableRooms: 1,
        bookedRooms: 0,
        maintenanceRooms: 0,
        outOfOrderRooms: 0,
        roomIds: {
          available: ['room-003'],
          booked: [],
          maintenance: [],
          outOfOrder: []
        }
      },
      family: {
        totalRooms: 1,
        availableRooms: 1,
        bookedRooms: 0,
        maintenanceRooms: 0,
        outOfOrderRooms: 0,
        roomIds: {
          available: ['room-004'],
          booked: [],
          maintenance: [],
          outOfOrder: []
        }
      },
      accessible: {
        totalRooms: 1,
        availableRooms: 1,
        bookedRooms: 0,
        maintenanceRooms: 0,
        outOfOrderRooms: 0,
        roomIds: {
          available: ['room-005'],
          booked: [],
          maintenance: [],
          outOfOrder: []
        }
      }
    }

    const pricing: any = {
      standard: { basePrice: 15000, adjustedPrice: 15000 },
      deluxe: { basePrice: 22000, adjustedPrice: 22000 },
      suite: { basePrice: 35000, adjustedPrice: 35000 },
      family: { basePrice: 28000, adjustedPrice: 28000 },
      accessible: { basePrice: 16000, adjustedPrice: 16000 }
    }

    const docRef = db.collection('dailyAvailability').doc(dateStr)
    batch.set(docRef, {
      date: dateStr,
      availability,
      pricing,
      lastUpdated: Timestamp.now(),
      calculatedAt: Timestamp.now()
    })
  }

  await batch.commit()
  console.log(`  ✓ Initialized availability for ${days} days`)
}

async function seedRooms() {
  console.log('🏨 Seeding Firestore with Room Data')
  console.log('=' .repeat(50))
  console.log(`Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`)

  try {
    const batch = db.batch()

    console.log(`\n📦 Creating ${mockRooms.length} rooms...`)

    for (const room of mockRooms) {
      const { id, ...roomData } = room
      const docRef = db.collection('rooms').doc(id)
      batch.set(docRef, roomData)
      console.log(`  ✓ Room ${room.roomNumber} (${room.type})`)
    }

    await batch.commit()
    console.log(`\n✅ Successfully seeded ${mockRooms.length} rooms`)

    // Initialize availability
    await initializeAvailability(30)

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Seed completed successfully!')
    console.log('\nRooms created:')
    mockRooms.forEach(room => {
      console.log(`  • ${room.roomNumber} - ${room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room - £${(room.pricing.basePrice / 100).toFixed(2)}/night`)
    })

  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

seedRooms().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})