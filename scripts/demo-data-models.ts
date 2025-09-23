#!/usr/bin/env tsx
// Demo script to showcase Epic 3 data models
// Run with: npx tsx scripts/demo-data-models.ts

import { Room, Booking, DailyAvailability, RoomType, BookingStatus, GuestInfo } from '../src/types/hotel'
import { Timestamp } from 'firebase/firestore'

console.log('🏨 Epic 3: Data Models & Database Schema Demo')
console.log('============================================\n')

// SCHH-007: Room Inventory Schema Demo
console.log('📋 SCHH-007: Room Inventory Schema (3 points)')
console.log('----------------------------------------------')

const sampleRoom: Room = {
  id: 'room_101',
  roomNumber: '101',
  type: 'deluxe' as RoomType,
  floor: 1,
  maxOccupancy: 3,
  bedConfiguration: [{ type: 'king', count: 1 }],
  size: 30,
  view: 'mountain',
  features: {
    wifi: true,
    airConditioning: false,
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
  pricing: {
    basePrice: 18000, // £180.00 per night
    seasonalRates: {
      'summer': {
        multiplier: 1.5,
        startDate: '2024-06-01',
        endDate: '2024-08-31'
      }
    },
    weekendSurcharge: 2000,
    lastMinuteDiscount: 10,
    extendedStayDiscount: {
      minNights: 7,
      discountPercentage: 15
    }
  },
  status: 'available',
  description: 'Spacious deluxe room with stunning mountain views and private balcony.',
  images: ['/images/rooms/deluxe-room-1.jpg'],
  lastMaintenance: Timestamp.now(),
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}

console.log('✅ Sample Room Data:')
console.log(`   • Room ${sampleRoom.roomNumber} (${sampleRoom.type})`)
console.log(`   • Max occupancy: ${sampleRoom.maxOccupancy} guests`)
console.log(`   • Base price: £${sampleRoom.pricing.basePrice / 100}`)
console.log(`   • Features: ${Object.keys(sampleRoom.features).filter(key => sampleRoom.features[key as keyof typeof sampleRoom.features] === true).length} amenities`)
console.log(`   • View: ${sampleRoom.view}`)

// SCHH-008: Booking Data Model Demo
console.log('\n📋 SCHH-008: Booking Data Model (5 points)')
console.log('-------------------------------------------')

const sampleGuest: GuestInfo = {
  firstName: 'Sarah',
  lastName: 'MacLeod',
  email: 'sarah.macleod@example.com',
  phone: '+44 7700 123456',
  address: {
    street: '42 Castle Street',
    city: 'Edinburgh',
    postcode: 'EH1 2NE',
    country: 'Scotland'
  },
  specialRequests: ['Late check-in', 'Mountain view room'],
  dietaryRequirements: ['Vegetarian']
}

const sampleBooking: Booking = {
  id: 'booking_2024_001',
  bookingReference: 'SCH-2024-001',
  guestUserId: 'user_sarah_123',
  guestInfo: sampleGuest,
  totalGuests: 2,
  roomId: 'room_101',
  checkInDate: Timestamp.fromDate(new Date('2024-07-15')),
  checkOutDate: Timestamp.fromDate(new Date('2024-07-18')),
  numberOfNights: 3,
  roomRate: 18000,
  totalRoomCost: 54000,
  additionalCharges: {
    breakfast: 1500,
    parking: 500
  },
  taxes: 5600,
  discounts: {},
  totalAmount: 61600,
  paymentStatus: 'pending',
  paymentDetails: {
    method: 'card',
    amount: 61600,
    paidAmount: 0,
    refundedAmount: 0,
    currency: 'GBP',
    transactionIds: []
  },
  status: 'pending-payment' as BookingStatus,
  statusHistory: [{
    status: 'pending-payment' as BookingStatus,
    timestamp: Timestamp.now(),
    changedBy: 'user_sarah_123',
    notes: 'Booking created'
  }],
  specialRequests: ['Late check-in requested'],
  source: 'direct',
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
  createdBy: 'user_sarah_123',
  lastUpdatedBy: 'user_sarah_123'
}

console.log('✅ Sample Booking Data:')
console.log(`   • Booking: ${sampleBooking.bookingReference}`)
console.log(`   • Guest: ${sampleBooking.guestInfo.firstName} ${sampleBooking.guestInfo.lastName}`)
console.log(`   • Dates: ${sampleBooking.checkInDate.toDate().toDateString()} - ${sampleBooking.checkOutDate.toDate().toDateString()}`)
console.log(`   • Total cost: £${sampleBooking.totalAmount / 100}`)
console.log(`   • Status: ${sampleBooking.status}`)
console.log(`   • Room: ${sampleBooking.roomId}`)

// SCHH-009: Availability Calendar Demo
console.log('\n📋 SCHH-009: Availability Calendar Structure (8 points)')
console.log('------------------------------------------------------')

const sampleAvailability: DailyAvailability = {
  id: '2024-07-15',
  date: '2024-07-15',
  availability: {
    standard: {
      totalRooms: 16,
      availableRooms: 14,
      bookedRooms: 2,
      maintenanceRooms: 0,
      outOfOrderRooms: 0,
      roomIds: {
        available: ['room_101', 'room_102', 'room_103'],
        booked: ['room_104', 'room_105'],
        maintenance: [],
        outOfOrder: []
      }
    },
    deluxe: {
      totalRooms: 6,
      availableRooms: 5,
      bookedRooms: 1,
      maintenanceRooms: 0,
      outOfOrderRooms: 0,
      roomIds: {
        available: ['room_301', 'room_302', 'room_303', 'room_304'],
        booked: ['room_305'],
        maintenance: [],
        outOfOrder: []
      }
    },
    suite: {
      totalRooms: 3,
      availableRooms: 3,
      bookedRooms: 0,
      maintenanceRooms: 0,
      outOfOrderRooms: 0,
      roomIds: {
        available: ['room_401', 'room_402', 'room_403'],
        booked: [],
        maintenance: [],
        outOfOrder: []
      }
    },
    family: {
      totalRooms: 4,
      availableRooms: 3,
      bookedRooms: 1,
      maintenanceRooms: 0,
      outOfOrderRooms: 0,
      roomIds: {
        available: ['room_209', 'room_210', 'room_211'],
        booked: ['room_212'],
        maintenance: [],
        outOfOrder: []
      }
    },
    accessible: {
      totalRooms: 2,
      availableRooms: 2,
      bookedRooms: 0,
      maintenanceRooms: 0,
      outOfOrderRooms: 0,
      roomIds: {
        available: ['room_109', 'room_110'],
        booked: [],
        maintenance: [],
        outOfOrder: []
      }
    }
  },
  pricing: {
    standard: {
      basePrice: 12000,
      adjustedPrice: 15000 // Summer rate applied
    },
    deluxe: {
      basePrice: 18000,
      adjustedPrice: 22500
    },
    suite: {
      basePrice: 35000,
      adjustedPrice: 43750
    },
    family: {
      basePrice: 25000,
      adjustedPrice: 31250
    },
    accessible: {
      basePrice: 12000,
      adjustedPrice: 15000
    }
  },
  lastUpdated: Timestamp.now(),
  calculatedAt: Timestamp.now()
}

console.log('✅ Sample Availability Data for 2024-07-15:')
console.log(`   • Standard rooms: ${sampleAvailability.availability.standard.availableRooms}/${sampleAvailability.availability.standard.totalRooms} available`)
console.log(`   • Deluxe rooms: ${sampleAvailability.availability.deluxe.availableRooms}/${sampleAvailability.availability.deluxe.totalRooms} available`)
console.log(`   • Suite rooms: ${sampleAvailability.availability.suite.availableRooms}/${sampleAvailability.availability.suite.totalRooms} available`)
console.log(`   • Family rooms: ${sampleAvailability.availability.family.availableRooms}/${sampleAvailability.availability.family.totalRooms} available`)
console.log(`   • Accessible rooms: ${sampleAvailability.availability.accessible.availableRooms}/${sampleAvailability.availability.accessible.totalRooms} available`)

// Summary
console.log('\n🎯 Epic 3 Implementation Summary')
console.log('=================================')
console.log('✅ SCHH-007: Room Inventory Schema (3 points)')
console.log('   • Comprehensive room data model with pricing, features, and availability')
console.log('   • Support for 5 room types with detailed amenity tracking')
console.log('   • Flexible pricing structure with seasonal rates and discounts')

console.log('\n✅ SCHH-008: Booking Data Model (5 points)')
console.log('   • Complete guest information capture')
console.log('   • Payment tracking with multiple methods and statuses')
console.log('   • Status workflow with audit trail')
console.log('   • Support for special requests and dietary requirements')

console.log('\n✅ SCHH-009: Availability Calendar Structure (8 points)')
console.log('   • Daily availability documents for efficient date-range queries')
console.log('   • Real-time tracking of room status by type')
console.log('   • Dynamic pricing based on demand and seasons')
console.log('   • Support for maintenance and out-of-order room tracking')

console.log('\n🏨 Total Story Points Delivered: 16 points')
console.log('Ready for frontend implementation and hotel operations!')

console.log('\n📁 Files Created:')
console.log('   • /src/types/hotel.ts - Type definitions')
console.log('   • /src/lib/firebase/hotel-service.ts - Business logic')
console.log('   • /firestore.rules - Security rules')
console.log('   • /firestore.indexes.json - Database indexes')
console.log('   • /database.rules.json - Real-time DB rules')
console.log('   • /scripts/seed-hotel-data.ts - Sample data')

console.log('\n🚀 Next Steps:')
console.log('   1. npm run seed-hotel-data - Populate database')
console.log('   2. npm run deploy-firestore - Deploy rules and indexes')
console.log('   3. Implement booking UI components')
console.log('   4. Connect real-time availability to frontend')
console.log('   5. Add payment processing integration')

export { sampleRoom, sampleBooking, sampleAvailability }