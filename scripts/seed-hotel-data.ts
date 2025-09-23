#!/usr/bin/env tsx
// Hotel Data Seeding Script for Schiehallion
// Run with: npx tsx scripts/seed-hotel-data.ts

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, doc, writeBatch, Timestamp } from 'firebase/firestore'
import { getDatabase, ref, set } from 'firebase/database'
import dotenv from 'dotenv'
import { Room, RoomType, RoomFeatures, RoomPricing, DailyAvailability, COLLECTIONS } from '../src/types/hotel'

// Load environment variables
dotenv.config()

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
let rtdb: any = null

// Initialize Realtime Database only if URL is provided
try {
  if (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) {
    rtdb = getDatabase(app)
  } else {
    console.warn('⚠️ NEXT_PUBLIC_FIREBASE_DATABASE_URL not set - skipping Realtime Database operations')
  }
} catch (error) {
  console.warn('⚠️ Failed to initialize Realtime Database:', error)
}

// Sample room data based on Schiehallion Hotel in Scotland
const generateSampleRooms = (): Omit<Room, 'id' | 'createdAt' | 'updatedAt'>[] => {
  const baseFeatures: RoomFeatures = {
    wifi: true,
    airConditioning: false, // Highland Scotland doesn't typically need AC
    heating: true,
    minibar: false,
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
  }

  const basePricing: RoomPricing = {
    basePrice: 12000, // £120.00 per night
    seasonalRates: {
      'summer': {
        multiplier: 1.5,
        startDate: '2024-06-01',
        endDate: '2024-08-31'
      },
      'winter': {
        multiplier: 0.8,
        startDate: '2024-12-01',
        endDate: '2024-02-28'
      }
    },
    weekendSurcharge: 2000, // £20 extra for weekends
    lastMinuteDiscount: 10, // 10% discount
    extendedStayDiscount: {
      minNights: 7,
      discountPercentage: 15
    }
  }

  const rooms: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>[] = []

  // Standard Rooms (Floors 1-2)
  for (let floor = 1; floor <= 2; floor++) {
    for (let roomNum = 1; roomNum <= 8; roomNum++) {
      const roomNumber = `${floor}0${roomNum}`
      rooms.push({
        roomNumber,
        type: 'standard' as RoomType,
        floor,
        maxOccupancy: 2,
        bedConfiguration: [{ type: 'double', count: 1 }],
        size: 20, // 20 sqm
        view: roomNum <= 4 ? 'mountain' : 'garden',
        features: baseFeatures,
        pricing: basePricing,
        status: 'available',
        description: `Comfortable standard room with ${roomNum <= 4 ? 'mountain' : 'garden'} views. Features traditional Scottish décor with modern amenities.`,
        images: [
          '/images/rooms/standard-room-1.jpg',
          '/images/rooms/standard-room-2.jpg'
        ],
        lastMaintenance: Timestamp.fromDate(new Date('2024-01-15'))
      })
    }
  }

  // Deluxe Rooms (Floor 3)
  for (let roomNum = 1; roomNum <= 6; roomNum++) {
    const roomNumber = `30${roomNum}`
    rooms.push({
      roomNumber,
      type: 'deluxe' as RoomType,
      floor: 3,
      maxOccupancy: 3,
      bedConfiguration: [{ type: 'king', count: 1 }],
      size: 30, // 30 sqm
      view: 'mountain',
      features: {
        ...baseFeatures,
        minibar: true,
        balcony: true
      },
      pricing: {
        ...basePricing,
        basePrice: 18000, // £180.00 per night
      },
      status: 'available',
      description: 'Spacious deluxe room with stunning mountain views and private balcony. Includes complimentary minibar and premium bedding.',
      images: [
        '/images/rooms/deluxe-room-1.jpg',
        '/images/rooms/deluxe-room-2.jpg',
        '/images/rooms/deluxe-balcony.jpg'
      ],
      lastMaintenance: Timestamp.fromDate(new Date('2024-02-01'))
    })
  }

  // Family Rooms (Floor 2)
  for (let roomNum = 9; roomNum <= 12; roomNum++) {
    const roomNumber = `2${roomNum}`
    rooms.push({
      roomNumber,
      type: 'family' as RoomType,
      floor: 2,
      maxOccupancy: 4,
      bedConfiguration: [
        { type: 'king', count: 1 },
        { type: 'twin', count: 2 }
      ],
      size: 35, // 35 sqm
      view: 'garden',
      features: {
        ...baseFeatures,
        minibar: true
      },
      pricing: {
        ...basePricing,
        basePrice: 25000, // £250.00 per night
      },
      status: 'available',
      description: 'Perfect for families, featuring a king bed and twin beds with garden views. Includes family-friendly amenities and extra space.',
      images: [
        '/images/rooms/family-room-1.jpg',
        '/images/rooms/family-room-2.jpg'
      ],
      lastMaintenance: Timestamp.fromDate(new Date('2024-01-20'))
    })
  }

  // Suites (Floor 4)
  for (let roomNum = 1; roomNum <= 3; roomNum++) {
    const roomNumber = `40${roomNum}`
    rooms.push({
      roomNumber,
      type: 'suite' as RoomType,
      floor: 4,
      maxOccupancy: 4,
      bedConfiguration: [{ type: 'king', count: 1 }],
      size: 50, // 50 sqm
      view: 'mountain',
      features: {
        ...baseFeatures,
        minibar: true,
        balcony: true,
        bathtub: true
      },
      pricing: {
        ...basePricing,
        basePrice: 35000, // £350.00 per night
      },
      status: 'available',
      description: 'Luxurious suite with separate living area, mountain views, and premium amenities. Perfect for special occasions.',
      images: [
        '/images/rooms/suite-bedroom.jpg',
        '/images/rooms/suite-living.jpg',
        '/images/rooms/suite-balcony.jpg'
      ],
      lastMaintenance: Timestamp.fromDate(new Date('2024-02-10'))
    })
  }

  // Accessible Rooms (Floor 1)
  for (let roomNum = 9; roomNum <= 10; roomNum++) {
    const roomNumber = `1${roomNum}`
    rooms.push({
      roomNumber,
      type: 'accessible' as RoomType,
      floor: 1,
      maxOccupancy: 2,
      bedConfiguration: [{ type: 'king', count: 1 }],
      size: 25, // 25 sqm
      view: 'garden',
      features: {
        ...baseFeatures,
        accessibleFeatures: [
          'wheelchair-accessible',
          'roll-in-shower',
          'grab-bars',
          'lowered-fixtures',
          'accessible-bathroom'
        ]
      },
      pricing: basePricing,
      status: 'available',
      description: 'Fully accessible room with wheelchair-friendly features, roll-in shower, and lowered fixtures. All modern amenities included.',
      images: [
        '/images/rooms/accessible-room-1.jpg',
        '/images/rooms/accessible-bathroom.jpg'
      ],
      lastMaintenance: Timestamp.fromDate(new Date('2024-01-25'))
    })
  }

  return rooms
}

// Generate availability for the next 90 days
const generateAvailabilityData = (rooms: Room[]): DailyAvailability[] => {
  const availabilityData: DailyAvailability[] = []
  const startDate = new Date()

  for (let i = 0; i < 90; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)
    const dateStr = currentDate.toISOString().split('T')[0]

    // Group rooms by type
    const roomsByType: { [key in RoomType]: Room[] } = {
      standard: [],
      deluxe: [],
      suite: [],
      family: [],
      accessible: []
    }

    rooms.forEach(room => {
      roomsByType[room.type].push(room)
    })

    // Create availability structure
    const availability: DailyAvailability['availability'] = {} as any
    Object.entries(roomsByType).forEach(([type, typeRooms]) => {
      availability[type as RoomType] = {
        totalRooms: typeRooms.length,
        availableRooms: typeRooms.length,
        bookedRooms: 0,
        maintenanceRooms: 0,
        outOfOrderRooms: 0,
        roomIds: {
          available: typeRooms.map(room => room.id),
          booked: [],
          maintenance: [],
          outOfOrder: []
        }
      }
    })

    // Create pricing structure
    const pricing: DailyAvailability['pricing'] = {} as any
    Object.entries(roomsByType).forEach(([type, typeRooms]) => {
      if (typeRooms.length > 0) {
        let basePrice = typeRooms[0].pricing.basePrice

        // Apply seasonal pricing
        const isWeekend = currentDate.getDay() === 5 || currentDate.getDay() === 6
        const isSummer = currentDate.getMonth() >= 5 && currentDate.getMonth() <= 7

        let adjustedPrice = basePrice
        if (isSummer) {
          adjustedPrice = Math.round(basePrice * 1.5) // Summer rate
        }
        if (isWeekend) {
          adjustedPrice += typeRooms[0].pricing.weekendSurcharge
        }

        pricing[type as RoomType] = {
          basePrice,
          adjustedPrice
        }
      }
    })

    availabilityData.push({
      id: dateStr,
      date: dateStr,
      availability,
      pricing,
      lastUpdated: Timestamp.now(),
      calculatedAt: Timestamp.now()
    })
  }

  return availabilityData
}

async function seedHotelData() {
  console.log('🏨 Starting hotel data seeding for Schiehallion...')

  try {
    // Generate sample rooms
    const roomsData = generateSampleRooms()
    console.log(`📝 Generated ${roomsData.length} sample rooms`)

    // Create rooms in Firestore
    console.log('🔥 Creating rooms in Firestore...')
    const roomsBatch = writeBatch(db)
    const createdRooms: Room[] = []

    roomsData.forEach((roomData, index) => {
      const roomId = `room_${roomData.roomNumber}`
      const roomRef = doc(collection(db, COLLECTIONS.ROOMS), roomId)

      const room: Room = {
        id: roomId,
        ...roomData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      createdRooms.push(room)
      roomsBatch.set(roomRef, room)
    })

    await roomsBatch.commit()
    console.log('✅ Rooms created successfully')

    // Generate and create availability data
    console.log('📅 Generating availability data...')
    const availabilityData = generateAvailabilityData(createdRooms)

    console.log('🔥 Creating availability data in Firestore...')
    const availabilityBatch = writeBatch(db)

    availabilityData.forEach(availability => {
      const availRef = doc(collection(db, COLLECTIONS.DAILY_AVAILABILITY), availability.id)
      availabilityBatch.set(availRef, availability)
    })

    await availabilityBatch.commit()
    console.log('✅ Availability data created successfully')

    // Seed Real-time Database with initial availability
    console.log('⚡ Setting up Real-time Database availability...')
    const rtdbData: { [date: string]: any } = {}

    availabilityData.forEach(availability => {
      rtdbData[availability.date] = {}
      Object.entries(availability.availability).forEach(([roomType, typeAvail]) => {
        rtdbData[availability.date][roomType] = {
          available: typeAvail.availableRooms,
          booked: typeAvail.bookedRooms,
          lastUpdated: Date.now()
        }
      })
    })

    if (rtdb) {
      try {
        await set(ref(rtdb, 'availability'), rtdbData)
        console.log('✅ Real-time Database seeded successfully')
      } catch (error) {
        console.warn('⚠️ Failed to seed Realtime Database:', error)
      }
    } else {
      console.log('⚠️ Skipping Realtime Database seeding - not configured')
    }

    // Summary
    console.log('\n🎉 Hotel data seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   • ${createdRooms.length} rooms created`)
    console.log(`   • ${availabilityData.length} days of availability data`)

    // Room type breakdown
    const roomCounts: { [key: string]: number } = {}
    createdRooms.forEach(room => {
      roomCounts[room.type] = (roomCounts[room.type] || 0) + 1
    })

    console.log('   • Room types:')
    Object.entries(roomCounts).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count} rooms`)
    })

    console.log('\n🔗 Next steps:')
    console.log('   1. Start dev server: npm run dev')
    console.log('   2. Visit rooms page: http://localhost:3002/rooms')
    console.log('   3. Test Epic 4: npx playwright test tests/epic4-room-display-search.spec.ts')
    console.log('   4. Deploy rules: firebase deploy --only firestore:rules,firestore:indexes')

    if (!rtdb) {
      console.log('\n⚠️ Note: Realtime Database not configured - some real-time features disabled')
      console.log('   To enable: Set NEXT_PUBLIC_FIREBASE_DATABASE_URL in .env.local')
    }

  } catch (error) {
    console.error('❌ Error seeding hotel data:', error)
    process.exit(1)
  }
}

// Run the seeding function
if (require.main === module) {
  seedHotelData()
    .then(() => {
      console.log('✅ Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

export { seedHotelData }