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
  preferenceProfile?: GuestPreferenceProfileSnapshot
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

  // Personalisation metadata
  packageType?: PackageType
  roomType?: RoomType
  personalizationSnapshot?: GuestPreferenceProfileSnapshot

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
  AUDIT_LOGS: 'auditLogs',
  // Restaurant Collections
  RESTAURANT_TABLES: 'restaurantTables',
  SERVICE_PERIODS: 'servicePeriods',
  TABLE_RESERVATIONS: 'tableReservations',
  TIME_SLOT_AVAILABILITY: 'timeSlotAvailability',
  RESTAURANT_ANALYTICS: 'restaurantAnalytics'
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

export type TravelPurposeOption = 'leisure' | 'business' | 'celebration' | 'family'
export type BudgetPreferenceOption = 'value' | 'balanced' | 'premium'
export type CommunicationPreferenceOption = 'email' | 'sms' | 'whatsapp'

export interface GuestPreferenceFormValues {
  specialRequests?: string
  dietaryRequirements: string[]
  accessibilityNeeds: string[]
  marketingOptIn: boolean
  tripPurpose?: TravelPurposeOption
  stayGoals: string[]
  experienceInterests: string[]
  roomComforts: string[]
  stayOccasion?: string
  personalizationOptIn: boolean
  communicationPreference: CommunicationPreferenceOption
  budgetPreference: BudgetPreferenceOption
}

export type GuestPreferenceProfileSnapshot = Omit<
  GuestPreferenceFormValues,
  'specialRequests' | 'dietaryRequirements' | 'accessibilityNeeds'
> & {
  capturedAt?: string
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
  preferences: GuestPreferenceFormValues
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
  OCCUPANCY_STATUS: 'occupancyStatus',
  // Restaurant Real-time Paths
  TABLE_AVAILABILITY: 'tableAvailability',
  TABLE_STATUS: 'tableStatus',
  RESERVATION_LOCKS: 'reservationLocks'
} as const

// ===================================================================
// Epic 7: Restaurant Table Management Types
// ===================================================================

// Import restaurant types
import type {
  RestaurantTable,
  ServicePeriod,
  TimeSlotAvailability,
  TableZone,
  TableFeature,
  AccessibilityFeature,
  TableStatus,
  SlotStatus,
  SlotSpecialEvent,
  RestaurantTablePosition
} from './restaurant'

// Re-export restaurant types
export type {
  RestaurantTable,
  ServicePeriod,
  TimeSlotAvailability,
  TableZone,
  TableFeature,
  AccessibilityFeature,
  TableStatus,
  SlotStatus,
  SlotSpecialEvent,
  RestaurantTablePosition
}

// Restaurant Reservation Types
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no-show'

export type PartyType = 'regular' | 'celebration' | 'business' | 'anniversary' | 'birthday'

export interface RestaurantGuest {
  firstName: string
  lastName: string
  email: string
  phone: string
  dietaryRequirements?: string[]
  accessibilityNeeds?: AccessibilityFeature[]
  specialRequests?: string
}

export interface RestaurantReservation {
  id: string
  reservationReference: string // Human-readable (e.g., RST-2024-001)

  // Guest Information
  guestUserId?: string // Link to authenticated user
  primaryGuest: RestaurantGuest
  additionalGuests?: RestaurantGuest[]
  partySize: number
  partyType?: PartyType

  // Table Assignment
  tableIds: string[] // Support for combined tables
  servicePeriodId: string
  timeSlotId: string

  // Timing
  reservationDate: Timestamp // Date of the reservation
  reservationTime: string // HH:mm
  durationMinutes: number
  estimatedEndTime: string // HH:mm

  // Status and Tracking
  status: ReservationStatus
  statusHistory: {
    status: ReservationStatus
    timestamp: Timestamp
    changedBy: string
    notes?: string
  }[]

  // Service Information
  seatedTime?: Timestamp
  actualEndTime?: Timestamp

  // Special Requirements
  specialRequests?: string[]
  celebrationNotes?: string
  staffNotes?: string[]

  // Source and Channel
  source: 'direct' | 'phone' | 'walk-in' | 'hotel-guest' | 'partner'
  sourceReference?: string

  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  lastUpdatedBy: string
}

// Restaurant Analytics
export interface RestaurantAnalytics {
  date: string // YYYY-MM-DD
  servicePeriodId: string

  // Reservation Metrics
  totalReservations: number
  walkedReservations: number
  cancelledReservations: number
  noShowReservations: number

  // Table Utilization
  tableUtilizationRate: number // Percentage
  averagePartySize: number
  turnoverRate: number // Tables per service period

  // Timing Metrics
  averageServiceDuration: number // Minutes
  onTimeSeatingRate: number // Percentage
  averageWaitTime: number // Minutes

  // Revenue Metrics (if integrated with POS)
  averageSpendPerPerson?: number
  totalRevenue?: number

  // Guest Demographics
  guestsByType: {
    [partyType in PartyType]: number
  }

  // Special Events Impact
  specialEventMetrics?: {
    eventName: string
    reservationIncrease: number
    averagePartyIncrease: number
  }
}

// Table Availability Snapshot for Real-time Updates
export interface TableAvailabilitySnapshot {
  [date: string]: { // YYYY-MM-DD
    [timeSlotId: string]: {
      availableTableIds: string[]
      reservedTableIds: string[]
      heldTableIds: string[]
      capacityAvailable: number
      lastUpdated: number // Unix timestamp
    }
  }
}

// Floor Plan Configuration for Admin
export interface FloorPlanConfig {
  id: string
  name: string
  version: number
  isActive: boolean

  // Layout Settings
  width: number
  height: number
  backgroundImage?: string

  // Zone Definitions
  zones: {
    [zone in TableZone]: {
      bounds: {
        x: number
        y: number
        width: number
        height: number
      }
      color: string
      isActive: boolean
    }
  }

  // Metadata
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  notes?: string
}

// Service Period Override for Special Events
export interface ServicePeriodOverride {
  id: string
  servicePeriodId: string
  date: string // YYYY-MM-DD

  // Override Settings
  name?: string
  startTime?: string
  endTime?: string
  lastSeatingTime?: string
  maxPartySize?: number
  zonesOpen?: TableZone[]

  // Special Event Info
  eventName: string
  eventDescription?: string
  specialInstructions?: string

  // Capacity Adjustments
  capacityMultiplier?: number // 1.0 = normal, 1.2 = 20% increase
  reservedTables?: string[] // Tables held for VIP/events

  createdAt: Timestamp
  createdBy: string
}

// Waitlist Management
export interface RestaurantWaitlist {
  id: string
  date: string // YYYY-MM-DD
  servicePeriodId: string
  preferredTimeSlotId?: string

  // Guest Information
  guestInfo: RestaurantGuest
  partySize: number
  flexibleTiming: boolean // Whether guest accepts other time slots
  maxWaitTime: number // Minutes willing to wait

  // Status
  status: 'active' | 'notified' | 'seated' | 'cancelled' | 'expired'
  priority: number // Higher = more priority

  // Tracking
  notificationsSent: number
  lastNotifiedAt?: Timestamp
  estimatedWaitTime?: number // Minutes

  createdAt: Timestamp
  updatedAt: Timestamp
}

// Restaurant Validation Types
export interface RestaurantReservationValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions?: string[]
}

export interface TableAvailabilityQuery {
  date: string // YYYY-MM-DD
  servicePeriodId: string
  partySize: number
  preferredTime?: string // HH:mm
  accessibilityNeeds?: AccessibilityFeature[]
  tableFeaturePreferences?: TableFeature[]
}

export interface TableAvailabilityResult {
  available: boolean
  timeSlots: {
    id: string
    time: string
    availableTables: RestaurantTable[]
    combinedTableOptions?: {
      tableIds: string[]
      totalCapacity: number
      zones: TableZone[]
    }[]
    waitTime?: number // If no immediate availability
  }[]
  alternativeDates?: string[] // If no availability on requested date
  waitlistOption?: {
    estimatedWaitTime: number
    position: number
  }
}