// Firebase Hotel Operations Service
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  runTransaction,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore'
import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  push,
  child,
  serverTimestamp as rtdbServerTimestamp
} from 'firebase/database'
import { db, rtdb } from '../firebase'
import {
  Room,
  Booking,
  DailyAvailability,
  RoomType,
  BookingStatus,
  AvailabilityQuery,
  AvailabilityResult,
  COLLECTIONS,
  RTDB_PATHS,
  RealtimeAvailability
} from '../../types/hotel'

// SCHH-007: Room Inventory Service
export class RoomService {
  private static collectionRef = collection(db, COLLECTIONS.ROOMS)

  // Create a new room
  static async createRoom(roomData: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const room: Omit<Room, 'id'> = {
      ...roomData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

    const docRef = await addDoc(this.collectionRef, room)
    return docRef.id
  }

  // Get room by ID
  static async getRoom(roomId: string): Promise<Room | null> {
    const docRef = doc(db, COLLECTIONS.ROOMS, roomId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Room
    }
    return null
  }

  // Get all rooms with optional filtering
  static async getRooms(filters?: {
    type?: RoomType
    floor?: number
    status?: Room['status']
    maxOccupancy?: number
  }): Promise<Room[]> {
    let constraints: QueryConstraint[] = [orderBy('roomNumber')]

    if (filters?.type) {
      constraints.push(where('type', '==', filters.type))
    }
    if (filters?.floor) {
      constraints.push(where('floor', '==', filters.floor))
    }
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status))
    }
    if (filters?.maxOccupancy) {
      constraints.push(where('maxOccupancy', '>=', filters.maxOccupancy))
    }

    const q = query(this.collectionRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Room))
  }

  // Update room
  static async updateRoom(roomId: string, updates: Partial<Room>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ROOMS, roomId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    })
  }

  // Delete room
  static async deleteRoom(roomId: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.ROOMS, roomId)
    await deleteDoc(docRef)
  }

  // Get available rooms for specific dates
  static async getAvailableRooms(checkIn: string, checkOut: string, guests?: number): Promise<Room[]> {
    const allRooms = await this.getRooms({
      status: 'available',
      maxOccupancy: guests
    })

    // Check availability against bookings
    const availableRoomIds = await AvailabilityService.getAvailableRoomIds(checkIn, checkOut)

    return allRooms.filter(room => availableRoomIds.includes(room.id))
  }
}

// SCHH-008: Booking Service
export class BookingService {
  private static collectionRef = collection(db, COLLECTIONS.BOOKINGS)

  // Helper to remove undefined values from nested objects
  private static removeUndefinedFields<T extends Record<string, any>>(obj: T): T {
    const cleaned: any = {}
    for (const key in obj) {
      const value = obj[key]
      if (value === undefined) {
        continue // Skip undefined fields
      }
      // Skip Date and Timestamp objects (pass through without recursion)
      if (value instanceof Date || value instanceof Timestamp) {
        cleaned[key] = value
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = this.removeUndefinedFields(value)
      } else {
        cleaned[key] = value
      }
    }
    return cleaned as T
  }

  // Create a new booking with availability check
  static async createBooking(bookingData: Omit<Booking, 'id' | 'bookingReference' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Verify user is authenticated
      const { auth } = await import('@/lib/firebase')
      const currentUser = auth.currentUser
      console.log('[BookingService] Current user:', currentUser?.uid, currentUser?.email)

      if (!currentUser) {
        throw new Error('User must be authenticated to create a booking')
      }

      // Get fresh auth token
      const token = await currentUser.getIdToken(true)
      console.log('[BookingService] Got fresh auth token:', token?.substring(0, 20) + '...')

      // Check availability BEFORE starting transaction
      console.log('[BookingService] Checking room availability...', { roomId: bookingData.roomId })
      const isAvailable = await AvailabilityService.checkRoomAvailability(
        bookingData.roomId,
        this.formatDate(bookingData.checkInDate.toDate()),
        this.formatDate(bookingData.checkOutDate.toDate())
      )

      if (!isAvailable) {
        throw new Error('Room is not available for selected dates')
      }

      console.log('[BookingService] Room is available, creating booking...')

      return await runTransaction(db, async (transaction) => {
        // Generate booking reference
        const bookingReference = await this.generateBookingReference()

        // Create booking (remove undefined fields)
        const bookingRaw: Omit<Booking, 'id'> = {
          ...bookingData,
          bookingReference,
          statusHistory: [{
            status: bookingData.status,
            timestamp: Timestamp.now(),
            changedBy: bookingData.createdBy,
            notes: 'Booking created'
          }],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        }

        // Clean undefined values before writing to Firestore
        const booking = this.removeUndefinedFields(bookingRaw)

        const docRef = doc(this.collectionRef)
        transaction.set(docRef, booking)

        // Update availability
        await AvailabilityService.updateAvailabilityForBooking(
          bookingData.roomId,
          this.formatDate(bookingData.checkInDate.toDate()),
          this.formatDate(bookingData.checkOutDate.toDate()),
          'book'
        )

        console.log('[BookingService] Booking created successfully:', docRef.id)
        return docRef.id
      })
    } catch (error) {
      console.error('[BookingService] Error creating booking:', error)
      throw error
    }
  }

  // Get booking by ID
  static async getBooking(bookingId: string): Promise<Booking | null> {
    const docRef = doc(db, COLLECTIONS.BOOKINGS, bookingId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Booking
    }
    return null
  }

  // Get bookings with filtering
  static async getBookings(filters?: {
    guestUserId?: string
    guestEmail?: string
    status?: BookingStatus
    roomId?: string
    dateRange?: { start: string; end: string }
    limit?: number
  }): Promise<Booking[]> {
    let constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')]

    if (filters?.guestUserId) {
      constraints.push(where('guestUserId', '==', filters.guestUserId))
    }
    if (filters?.guestEmail) {
      constraints.push(where('guestInfo.email', '==', filters.guestEmail))
    }
    if (filters?.status) {
      constraints.push(where('status', '==', filters.status))
    }
    if (filters?.roomId) {
      constraints.push(where('roomId', '==', filters.roomId))
    }
    if (filters?.limit) {
      constraints.push(limit(filters.limit))
    }

    const q = query(this.collectionRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking))
  }

  // Update booking status
  static async updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    changedBy: string,
    notes?: string
  ): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BOOKINGS, bookingId)
    const booking = await this.getBooking(bookingId)

    if (!booking) {
      throw new Error('Booking not found')
    }

    const statusUpdate = {
      status: newStatus,
      timestamp: Timestamp.now(),
      changedBy,
      notes
    }

    await updateDoc(docRef, {
      status: newStatus,
      statusHistory: [...booking.statusHistory, statusUpdate],
      updatedAt: Timestamp.now(),
      lastUpdatedBy: changedBy
    })
  }

  // Cancel booking
  static async cancelBooking(bookingId: string, cancelledBy: string, reason?: string): Promise<void> {
    const booking = await this.getBooking(bookingId)
    if (!booking) {
      throw new Error('Booking not found')
    }

    await this.updateBookingStatus(bookingId, 'cancelled', cancelledBy, reason)

    // Free up availability
    await AvailabilityService.updateAvailabilityForBooking(
      booking.roomId,
      this.formatDate(booking.checkInDate.toDate()),
      this.formatDate(booking.checkOutDate.toDate()),
      'cancel'
    )
  }

  // Generate unique booking reference
  private static async generateBookingReference(): Promise<string> {
    const year = new Date().getFullYear()
    const timestamp = Date.now().toString().slice(-6)
    return `SCH-${year}-${timestamp}`
  }

  // Helper method to format dates
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]
  }
}

// SCHH-009: Availability Service
export class AvailabilityService {
  private static firestoreCollectionRef = collection(db, COLLECTIONS.DAILY_AVAILABILITY)
  private static rtdbRef = ref(rtdb, RTDB_PATHS.AVAILABILITY)

  // Check if a specific room is available for date range
  static async checkRoomAvailability(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const dates = this.getDateRange(checkIn, checkOut)

    for (const date of dates) {
      const availability = await this.getDailyAvailability(date)
      if (!availability) {
        console.warn(`[AvailabilityService] No availability document found for date: ${date}`)
        // Auto-initialize missing availability for this date
        await this.initializeDailyAvailability(date)
        const retryAvailability = await this.getDailyAvailability(date)
        if (!retryAvailability) return false

        // Continue with the retry
        const roomData = await RoomService.getRoom(roomId)
        if (!roomData) return false

        const typeAvailability = retryAvailability.availability[roomData.type]
        if (!typeAvailability || !typeAvailability.roomIds.available.includes(roomId)) {
          return false
        }
        continue
      }

      // Check if room is available in any room type
      const roomData = await RoomService.getRoom(roomId)
      if (!roomData) return false

      const typeAvailability = availability.availability[roomData.type]
      if (!typeAvailability || !typeAvailability.roomIds.available.includes(roomId)) {
        return false
      }
    }

    return true
  }

  // Get available room IDs for date range
  static async getAvailableRoomIds(checkIn: string, checkOut: string): Promise<string[]> {
    const dates = this.getDateRange(checkIn, checkOut)
    let availableRoomIds: string[] = []

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i]
      const availability = await this.getDailyAvailability(date)

      if (!availability) continue

      const dayAvailableRooms: string[] = []
      Object.values(availability.availability).forEach(typeAvail => {
        dayAvailableRooms.push(...typeAvail.roomIds.available)
      })

      if (i === 0) {
        availableRoomIds = dayAvailableRooms
      } else {
        // Keep only rooms available on all dates
        availableRoomIds = availableRoomIds.filter(roomId =>
          dayAvailableRooms.includes(roomId)
        )
      }
    }

    return availableRoomIds
  }

  // Get daily availability document
  static async getDailyAvailability(date: string): Promise<DailyAvailability | null> {
    const docRef = doc(db, COLLECTIONS.DAILY_AVAILABILITY, date)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DailyAvailability
    }
    return null
  }

  // Update availability for a booking action
  static async updateAvailabilityForBooking(
    roomId: string,
    checkIn: string,
    checkOut: string,
    action: 'book' | 'cancel'
  ): Promise<void> {
    const room = await RoomService.getRoom(roomId)
    if (!room) throw new Error('Room not found')

    const dates = this.getDateRange(checkIn, checkOut)
    const batch = writeBatch(db)

    // Update Firestore availability documents
    for (const date of dates) {
      const docRef = doc(db, COLLECTIONS.DAILY_AVAILABILITY, date)
      const availability = await this.getDailyAvailability(date)

      if (availability) {
        const roomTypeAvail = availability.availability[room.type]

        if (action === 'book') {
          // Move room from available to booked
          roomTypeAvail.availableRooms = Math.max(0, roomTypeAvail.availableRooms - 1)
          roomTypeAvail.bookedRooms += 1
          roomTypeAvail.roomIds.available = roomTypeAvail.roomIds.available.filter(id => id !== roomId)
          roomTypeAvail.roomIds.booked.push(roomId)
        } else if (action === 'cancel') {
          // Move room from booked to available
          roomTypeAvail.availableRooms += 1
          roomTypeAvail.bookedRooms = Math.max(0, roomTypeAvail.bookedRooms - 1)
          roomTypeAvail.roomIds.booked = roomTypeAvail.roomIds.booked.filter(id => id !== roomId)
          roomTypeAvail.roomIds.available.push(roomId)
        }

        batch.update(docRef, {
          availability: availability.availability,
          lastUpdated: Timestamp.now()
        })
      }
    }

    await batch.commit()

    // Update Real-time Database
    await this.updateRealtimeAvailability(room.type, dates, action === 'book' ? -1 : 1)
  }

  // Update real-time availability in RTDB
  private static async updateRealtimeAvailability(
    roomType: RoomType,
    dates: string[],
    change: number
  ): Promise<void> {
    const updates: { [path: string]: any } = {}

    for (const date of dates) {
      updates[`${date}/${roomType}/available`] = {
        '.sv': { increment: change }
      }
      updates[`${date}/${roomType}/booked`] = {
        '.sv': { increment: -change }
      }
      updates[`${date}/${roomType}/lastUpdated`] = Date.now()
    }

    await update(this.rtdbRef, updates)
  }

  // Initialize daily availability documents
  static async initializeDailyAvailability(date: string): Promise<void> {
    const rooms = await RoomService.getRooms({ status: 'available' })
    const roomsByType: { [key in RoomType]: Room[] } = {
      standard: [],
      deluxe: [],
      suite: [],
      family: [],
      accessible: []
    }

    // Group rooms by type
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

    // Create pricing structure (simplified - would be more complex in real implementation)
    const pricing: DailyAvailability['pricing'] = {} as any
    Object.entries(roomsByType).forEach(([type, typeRooms]) => {
      if (typeRooms.length > 0) {
        pricing[type as RoomType] = {
          basePrice: typeRooms[0].pricing.basePrice,
          adjustedPrice: typeRooms[0].pricing.basePrice
        }
      }
    })

    const dailyAvailability: Omit<DailyAvailability, 'id'> = {
      date,
      availability,
      pricing,
      lastUpdated: Timestamp.now(),
      calculatedAt: Timestamp.now()
    }

    // Save to Firestore
    const docRef = doc(db, COLLECTIONS.DAILY_AVAILABILITY, date)
    await updateDoc(docRef, dailyAvailability)

    // Update Real-time Database
    const rtdbUpdate: { [key: string]: any } = {}
    Object.entries(availability).forEach(([type, typeAvail]) => {
      rtdbUpdate[`${date}/${type}`] = {
        available: typeAvail.availableRooms,
        booked: typeAvail.bookedRooms,
        lastUpdated: Date.now()
      }
    })
    await update(this.rtdbRef, rtdbUpdate)
  }

  // Subscribe to real-time availability updates
  static subscribeToAvailability(
    dateRange: { start: string; end: string },
    callback: (availability: RealtimeAvailability) => void
  ): () => void {
    const availabilityRef = this.rtdbRef

    const unsubscribe = onValue(availabilityRef, (snapshot) => {
      const data = snapshot.val() || {}

      // Filter to requested date range
      const filteredData: RealtimeAvailability = {}
      const dates = this.getDateRange(dateRange.start, dateRange.end)

      dates.forEach(date => {
        if (data[date]) {
          filteredData[date] = data[date]
        }
      })

      callback(filteredData)
    })

    return () => off(availabilityRef, 'value', unsubscribe)
  }

  // Utility method to get date range
  private static getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = []
    const currentDate = new Date(startDate)
    const end = new Date(endDate)

    while (currentDate < end) {
      dates.push(currentDate.toISOString().split('T')[0])
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates
  }

  // Search for available rooms with pricing
  static async searchAvailability(query: AvailabilityQuery): Promise<AvailabilityResult> {
    const { checkIn, checkOut, guests, roomType } = query

    // Get available rooms
    let availableRooms = await RoomService.getAvailableRooms(checkIn, checkOut, guests)

    // Filter by room type if specified
    if (roomType) {
      availableRooms = availableRooms.filter(room => room.type === roomType)
    }

    // Calculate pricing for each room type
    const pricingByType: { [key in RoomType]?: AvailabilityResult['pricing'][0] } = {}
    const dates = this.getDateRange(checkIn, checkOut)

    for (const room of availableRooms) {
      if (!pricingByType[room.type]) {
        const nightly: number[] = []
        let totalCost = 0

        for (const date of dates) {
          const availability = await this.getDailyAvailability(date)
          const dayPrice = availability?.pricing[room.type]?.adjustedPrice || room.pricing.basePrice
          nightly.push(dayPrice)
          totalCost += dayPrice
        }

        pricingByType[room.type] = {
          roomType: room.type,
          totalCost,
          nightly,
          taxes: Math.round(totalCost * 0.1), // 10% tax example
          fees: 0
        }
      }
    }

    return {
      available: availableRooms.length > 0,
      rooms: availableRooms,
      pricing: Object.values(pricingByType) as AvailabilityResult['pricing']
    }
  }
}