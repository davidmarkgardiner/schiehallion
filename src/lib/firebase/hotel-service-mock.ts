// Mock Hotel Operations Service for Testing
// @ts-nocheck
import { Room, DailyAvailability, RoomType } from '../../types/hotel'
import { Timestamp } from 'firebase/firestore'

// Create a mock Timestamp function
const createMockTimestamp = (date: Date): Timestamp => ({
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: 0,
  toDate: () => date,
  toMillis: () => date.getTime(),
  isEqual: (other: Timestamp) => date.getTime() === other.toMillis(),
} as Timestamp)

// Mock room data for testing Epic 4
const mockRooms: Room[] = [
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
    images: [
      '/images/rooms/standard-101-1.jpg',
      '/images/rooms/standard-101-2.jpg',
      '/images/rooms/standard-101-3.jpg'
    ],
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
    lastMaintenance: createMockTimestamp(new Date('2024-01-01')),
    createdAt: createMockTimestamp(new Date('2024-01-01')),
    updatedAt: createMockTimestamp(new Date('2024-01-01'))
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
    images: [
      '/images/rooms/deluxe-102-1.jpg',
      '/images/rooms/deluxe-102-2.jpg',
      '/images/rooms/deluxe-102-3.jpg',
      '/images/rooms/deluxe-102-4.jpg'
    ],
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
    lastMaintenance: createMockTimestamp(new Date('2024-01-01')),
    createdAt: createMockTimestamp(new Date('2024-01-01')),
    updatedAt: createMockTimestamp(new Date('2024-01-01'))
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
    images: [
      '/images/rooms/suite-201-1.jpg',
      '/images/rooms/suite-201-2.jpg',
      '/images/rooms/suite-201-3.jpg',
      '/images/rooms/suite-201-4.jpg',
      '/images/rooms/suite-201-5.jpg'
    ],
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
    lastMaintenance: createMockTimestamp(new Date('2024-01-01')),
    createdAt: createMockTimestamp(new Date('2024-01-01')),
    updatedAt: createMockTimestamp(new Date('2024-01-01'))
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
    description: 'Family-friendly room with multiple beds and spacious layout.',
    bedConfiguration: [{ type: 'queen', count: 1 }, { type: 'twin', count: 2 }],
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
    images: [
      '/images/rooms/family-103-1.jpg',
      '/images/rooms/family-103-2.jpg',
      '/images/rooms/family-103-3.jpg'
    ],
    pricing: {
      basePrice: 28000, // £280.00
      seasonalRates: {},
      weekendSurcharge: 4000,
      lastMinuteDiscount: 12,
      extendedStayDiscount: {
        minNights: 6,
        discountPercentage: 15
      }
    },
    lastMaintenance: createMockTimestamp(new Date('2024-01-01')),
    createdAt: createMockTimestamp(new Date('2024-01-01')),
    updatedAt: createMockTimestamp(new Date('2024-01-01'))
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
    description: 'Fully accessible room with wheelchair access and adapted facilities.',
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
      accessibleFeatures: ['wheelchair-accessible', 'hearing-loop', 'visual-aids']
    },
    images: [
      '/images/rooms/accessible-104-1.jpg',
      '/images/rooms/accessible-104-2.jpg'
    ],
    pricing: {
      basePrice: 16000, // £160.00
      seasonalRates: {},
      weekendSurcharge: 2500,
      lastMinuteDiscount: 8,
      extendedStayDiscount: {
        minNights: 7,
        discountPercentage: 10
      }
    },
    lastMaintenance: createMockTimestamp(new Date('2024-01-01')),
    createdAt: createMockTimestamp(new Date('2024-01-01')),
    updatedAt: createMockTimestamp(new Date('2024-01-01'))
  }
]

// Mock availability data
const mockDailyAvailability: DailyAvailability = {
  id: '2024-01-15',
  date: '2024-01-15',
  availability: {
    standard: {
      totalRooms: 5,
      availableRooms: 4,
      bookedRooms: 1,
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
      totalRooms: 3,
      availableRooms: 3,
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
      totalRooms: 2,
      availableRooms: 2,
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
      totalRooms: 3,
      availableRooms: 3,
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
      totalRooms: 2,
      availableRooms: 2,
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
  },
  pricing: {
    standard: { basePrice: 15000, adjustedPrice: 15000 },
    deluxe: { basePrice: 22000, adjustedPrice: 22000 },
    suite: { basePrice: 35000, adjustedPrice: 35000 },
    family: { basePrice: 28000, adjustedPrice: 28000 },
    accessible: { basePrice: 16000, adjustedPrice: 16000 }
  },
  lastUpdated: createMockTimestamp(new Date()),
  calculatedAt: createMockTimestamp(new Date())
}

// Mock Room Service
export class RoomService {
  static async createRoom(): Promise<string> {
    return 'mock-room-id'
  }

  static async getRoom(roomId: string): Promise<Room | null> {
    return mockRooms.find(room => room.id === roomId) || null
  }

  static async getRooms(filters?: {
    type?: RoomType
    floor?: number
    status?: Room['status']
    maxOccupancy?: number
  }): Promise<Room[]> {
    let filtered = [...mockRooms]

    if (filters?.type) {
      filtered = filtered.filter(room => room.type === filters.type)
    }
    if (filters?.floor) {
      filtered = filtered.filter(room => room.floor === filters.floor)
    }
    if (filters?.status) {
      filtered = filtered.filter(room => room.status === filters.status)
    }
    if (filters?.maxOccupancy) {
      filtered = filtered.filter(room => room.maxOccupancy >= filters.maxOccupancy!)
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return filtered
  }

  static async updateRoom(): Promise<void> {
    // Mock implementation
  }

  static async deleteRoom(): Promise<void> {
    // Mock implementation
  }

  static async getAvailableRooms(checkIn: string, checkOut: string, guests?: number): Promise<Room[]> {
    let available = [...mockRooms]

    if (guests) {
      available = available.filter(room => room.maxOccupancy >= guests)
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return available
  }
}

// Mock Booking Service
export class BookingService {
  static async createBooking(): Promise<string> {
    return 'mock-booking-id'
  }

  static async getBooking(): Promise<any> {
    return null
  }

  static async getBookings(): Promise<any[]> {
    return []
  }

  static async updateBookingStatus(): Promise<void> {
    // Mock implementation
  }

  static async cancelBooking(): Promise<void> {
    // Mock implementation
  }
}

// Mock Availability Service
export class AvailabilityService {
  static async checkRoomAvailability(): Promise<boolean> {
    return true
  }

  static async getAvailableRoomIds(): Promise<string[]> {
    return mockRooms.map(room => room.id)
  }

  static async getDailyAvailability(date: string): Promise<DailyAvailability | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Return mock data with the requested date
    return {
      ...mockDailyAvailability,
      id: date,
      date: date
    }
  }

  static async updateAvailabilityForBooking(): Promise<void> {
    // Mock implementation
  }

  static async initializeDailyAvailability(): Promise<void> {
    // Mock implementation
  }

  static subscribeToAvailability(): () => void {
    return () => {}
  }

  static async searchAvailability(): Promise<any> {
    return {
      available: true,
      rooms: mockRooms,
      pricing: []
    }
  }
}