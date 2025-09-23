// Hotel Domain Types for Schiehallion Hotel Management System

import { Timestamp } from 'firebase/firestore'

// Room Types and Features
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'family' | 'accessible'
export type BedType = 'single' | 'double' | 'queen' | 'king' | 'twin' | 'sofa-bed'
export type RoomView = 'mountain' | 'garden' | 'courtyard' | 'street'
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out-of-order'

export interface RoomFeatures {
  wifi: boolean
  airConditioning: boolean
  heating: boolean
  minibar: boolean
  safe: boolean
  television: boolean
  telephone: boolean
  balcony: boolean
  bathtub: boolean
  shower: boolean
  hairdryer: boolean
  coffeeMarker: boolean
  workDesk: boolean
  ironingBoard: boolean
  accessibleFeatures: string[] // ['wheelchair-accessible', 'hearing-loop', 'visual-aids']
}

export interface RoomPricing {
  basePrice: number // Price per night in pence/cents
  seasonalRates: {
    [season: string]: {
      multiplier: number // 1.0 = base price, 1.5 = 50% markup
      startDate: string // YYYY-MM-DD
      endDate: string // YYYY-MM-DD
    }
  }
  weekendSurcharge: number // Additional charge for Fri-Sat nights
  lastMinuteDiscount: number // Percentage discount for bookings within 7 days
  extendedStayDiscount: {
    minNights: number
    discountPercentage: number
  }
}

// SCHH-007: Room Inventory Schema
export interface Room {
  id: string
  roomNumber: string
  type: RoomType
  floor: number
  maxOccupancy: number
  bedConfiguration: {
    type: BedType
    count: number
  }[]
  size: number // Square meters
  view: RoomView
  features: RoomFeatures
  pricing: RoomPricing
  status: RoomStatus
  description: string
  images: string[] // URLs to room photos
  lastMaintenance: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Booking Status Workflow
export type BookingStatus =
  | 'pending-payment'
  | 'confirmed'
  | 'checked-in'
  | 'checked-out'
  | 'cancelled'
  | 'no-show'

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded' | 'failed'
export type PaymentMethod = 'card' | 'cash' | 'bank-transfer' | 'online'

export interface PaymentDetails {
  method: PaymentMethod
  amount: number // Total amount in pence/cents
  paidAmount: number // Amount actually paid
  refundedAmount: number // Amount refunded
  currency: string // 'GBP', 'USD', etc.
  transactionIds: string[] // Payment gateway transaction IDs
  paymentDate?: Timestamp
  refundDate?: Timestamp
  notes?: string
}

export interface GuestInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: Timestamp
  nationality?: string
  passportNumber?: string
  address?: {
    street: string
    city: string
    postcode: string
    country: string
  }
  specialRequests?: string[]
  dietaryRequirements?: string[]
  accessibilityNeeds?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

// SCHH-008: Booking Data Model
export interface Booking {
  id: string
  bookingReference: string // Human-readable booking reference (e.g., SCH-2024-001)

  // Guest Information
  guestUserId?: string // Link to authenticated user (null for guest bookings)
  guestInfo: GuestInfo
  additionalGuests?: GuestInfo[]
  totalGuests: number

  // Room Assignment
  roomId: string
  room?: Room // Populated room data for display

  // Dates and Duration
  checkInDate: Timestamp
  checkOutDate: Timestamp
  numberOfNights: number

  // Pricing
  roomRate: number // Rate per night at time of booking
  totalRoomCost: number // roomRate * numberOfNights
  additionalCharges: {
    [service: string]: number // breakfast: 1500, parking: 500, etc.
  }
  taxes: number
  discounts: {
    [type: string]: number // early-bird: -500, loyalty: -1000, etc.
  }
  totalAmount: number

  // Payment Tracking
  paymentStatus: PaymentStatus
  paymentDetails: PaymentDetails

  // Booking Status
  status: BookingStatus
  statusHistory: {
    status: BookingStatus
    timestamp: Timestamp
    changedBy: string // userId of staff member or 'system'
    notes?: string
  }[]

  // Check-in/Check-out
  checkInTime?: Timestamp
  checkOutTime?: Timestamp
  actualCheckInTime?: Timestamp
  actualCheckOutTime?: Timestamp

  // Special Requests and Notes
  specialRequests?: string[]
  staffNotes?: string[]
  guestNotes?: string

  // Booking Channel
  source: 'direct' | 'booking.com' | 'airbnb' | 'walk-in' | 'phone' | 'email'
  sourceReference?: string // External booking reference

  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // userId or 'guest'
  lastUpdatedBy: string
}

// SCHH-009: Availability Calendar Structure
export interface DailyAvailability {
  id: string // Format: YYYY-MM-DD
  date: string // YYYY-MM-DD for easy querying

  // Room availability by type
  availability: {
    [roomType in RoomType]: {
      totalRooms: number
      availableRooms: number
      bookedRooms: number
      maintenanceRooms: number
      outOfOrderRooms: number
      roomIds: {
        available: string[]
        booked: string[]
        maintenance: string[]
        outOfOrder: string[]
      }
    }
  }

  // Pricing for the day
  pricing: {
    [roomType in RoomType]: {
      basePrice: number
      adjustedPrice: number // After seasonal/demand adjustments
      minimumStay?: number // Minimum nights required
    }
  }

  // Special conditions
  specialEvents?: string[] // ['conference', 'wedding', 'festival']
  restrictions?: {
    minimumStay?: number
    maximumStay?: number
    checkInAllowed: boolean
    checkOutAllowed: boolean
  }

  // Metadata
  lastUpdated: Timestamp
  calculatedAt: Timestamp // When availability was last calculated
}

// Real-time Database Structure for SCHH-009
export interface RealtimeAvailability {
  [date: string]: { // YYYY-MM-DD
    [roomType: string]: {
      available: number
      booked: number
      lastUpdated: number // Unix timestamp
    }
  }
}

// Booking Analytics and Reports
export interface BookingAnalytics {
  date: string // YYYY-MM-DD
  occupancyRate: number // Percentage
  averageDailyRate: number // ADR
  revenuePerAvailableRoom: number // RevPAR
  totalRevenue: number
  totalBookings: number
  newBookings: number
  cancellations: number
  noShows: number
  walkIns: number
  bookingsBySource: {
    [source: string]: number
  }
  roomTypePerformance: {
    [roomType: string]: {
      occupancyRate: number
      averageRate: number
      revenue: number
    }
  }
}

// Validation and Utility Types
export interface BookingValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface AvailabilityQuery {
  checkIn: string // YYYY-MM-DD
  checkOut: string // YYYY-MM-DD
  guests: number
  roomType?: RoomType
}

export interface AvailabilityResult {
  available: boolean
  rooms: Room[]
  pricing: {
    roomType: RoomType
    totalCost: number
    nightly: number[]
    taxes: number
    fees: number
  }[]
  restrictions?: {
    minimumStay?: number
    maximumStay?: number
  }
}

// Firebase Firestore Collection Names
export const COLLECTIONS = {
  ROOMS: 'rooms',
  BOOKINGS: 'bookings',
  DAILY_AVAILABILITY: 'dailyAvailability',
  BOOKING_ANALYTICS: 'bookingAnalytics',
  USERS: 'users',
  AUDIT_LOGS: 'auditLogs'
} as const

// Epic 5: Booking Flow Types

// Package types for SCHH-016
export type PackageType = 'room-only' | 'bed-breakfast' | 'half-board'

export interface PackageOption {
  type: PackageType
  name: string
  description: string
  priceAdjustment: number // Additional cost per night in pence/cents
  includes: string[]
  mealTimes?: {
    breakfast?: string
    lunch?: string
    dinner?: string
  }
}

// Shopping cart types for SCHH-014
export interface CartItem {
  id: string
  room: Room
  checkInDate: string // YYYY-MM-DD
  checkOutDate: string // YYYY-MM-DD
  numberOfNights: number
  guests: number
  packageType: PackageType
  packageOption: PackageOption
  roomRate: number // Rate per night at time of adding to cart
  packageRate: number // Package cost per night
  totalRoomCost: number // roomRate * numberOfNights
  totalPackageCost: number // packageRate * numberOfNights
  totalCost: number // totalRoomCost + totalPackageCost
  addedAt: Date
}

export interface CartSummary {
  items: CartItem[]
  subtotal: number
  groupDiscount: number
  taxes: number
  total: number
  itemCount: number
}

// Guest information form types for SCHH-015
export interface GuestFormData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth?: string
  }
  address?: {
    street: string
    city: string
    postcode: string
    country: string
  }
  preferences: {
    specialRequests?: string
    dietaryRequirements: string[]
    accessibilityNeeds: string[]
    marketingOptIn: boolean
  }
  arrival: {
    estimatedArrivalTime?: string
    specialInstructions?: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

// Drag and drop types for SCHH-013
export interface DragDropResult {
  room: Room
  targetDate: string
  packageType: PackageType
  guests: number
}

// Booking flow state
export interface BookingFlowState {
  currentStep: 'room-selection' | 'guest-info' | 'package-selection' | 'payment' | 'confirmation'
  cart: CartSummary
  guestInfo?: GuestFormData
  paymentMethod?: string
  bookingReference?: string
}

// Firebase Realtime Database Paths
export const RTDB_PATHS = {
  AVAILABILITY: 'availability',
  BOOKING_LOCKS: 'bookingLocks', // Temporary locks during booking process
  OCCUPANCY_STATUS: 'occupancyStatus'
} as const