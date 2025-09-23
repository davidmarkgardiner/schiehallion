// Restaurant Service for Firebase Integration
// Handles all restaurant table management, reservations, and real-time availability

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  onSnapshot,
  runTransaction,
  QueryDocumentSnapshot,
  DocumentReference,
} from 'firebase/firestore'
import { ref, set, get, onValue, update, remove } from 'firebase/database'
import { db, rtdb } from '@/lib/firebase'
import {
  COLLECTIONS,
  RTDB_PATHS,
  type RestaurantTable,
  type ServicePeriod,
  type TimeSlotAvailability,
  type RestaurantReservation,
  type RestaurantAnalytics,
  type TableAvailabilitySnapshot,
  type FloorPlanConfig,
  type ServicePeriodOverride,
  type RestaurantWaitlist,
  type TableAvailabilityQuery,
  type TableAvailabilityResult,
  type RestaurantReservationValidation,
  type TableZone,
  type AccessibilityFeature,
  type TableFeature,
} from '@/types/hotel'

export class RestaurantService {
  // ===================================================================
  // Table Management
  // ===================================================================

  /**
   * Get all restaurant tables
   */
  static async getTables(): Promise<RestaurantTable[]> {
    const tablesRef = collection(db, COLLECTIONS.RESTAURANT_TABLES)
    const querySnapshot = await getDocs(query(tablesRef, orderBy('label')))

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RestaurantTable[]
  }

  /**
   * Get table by ID
   */
  static async getTable(tableId: string): Promise<RestaurantTable | null> {
    const tableRef = doc(db, COLLECTIONS.RESTAURANT_TABLES, tableId)
    const tableSnap = await getDoc(tableRef)

    if (!tableSnap.exists()) {
      return null
    }

    return {
      id: tableSnap.id,
      ...tableSnap.data()
    } as RestaurantTable
  }

  /**
   * Create or update table
   */
  static async saveTable(table: Omit<RestaurantTable, 'id'> | RestaurantTable): Promise<string> {
    const tableData = {
      ...table,
      updatedAt: Timestamp.now()
    }

    if ('id' in table && table.id) {
      // Update existing table
      const tableRef = doc(db, COLLECTIONS.RESTAURANT_TABLES, table.id)
      await updateDoc(tableRef, tableData)
      return table.id
    } else {
      // Create new table
      const newTableData = {
        ...tableData,
        createdAt: Timestamp.now()
      }
      const docRef = await addDoc(collection(db, COLLECTIONS.RESTAURANT_TABLES), newTableData)
      return docRef.id
    }
  }

  /**
   * Delete table
   */
  static async deleteTable(tableId: string): Promise<void> {
    const tableRef = doc(db, COLLECTIONS.RESTAURANT_TABLES, tableId)
    await deleteDoc(tableRef)
  }

  // ===================================================================
  // Service Period Management
  // ===================================================================

  /**
   * Get all service periods
   */
  static async getServicePeriods(): Promise<ServicePeriod[]> {
    const periodsRef = collection(db, COLLECTIONS.SERVICE_PERIODS)
    const querySnapshot = await getDocs(query(periodsRef, orderBy('startTime')))

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServicePeriod[]
  }

  /**
   * Save service period
   */
  static async saveServicePeriod(period: Omit<ServicePeriod, 'id'> | ServicePeriod): Promise<string> {
    const periodData = {
      ...period,
      updatedAt: Timestamp.now()
    }

    if ('id' in period && period.id) {
      const periodRef = doc(db, COLLECTIONS.SERVICE_PERIODS, period.id)
      await updateDoc(periodRef, periodData)
      return period.id
    } else {
      const newPeriodData = {
        ...periodData,
        createdAt: Timestamp.now()
      }
      const docRef = await addDoc(collection(db, COLLECTIONS.SERVICE_PERIODS), newPeriodData)
      return docRef.id
    }
  }

  // ===================================================================
  // Time Slot Availability
  // ===================================================================

  /**
   * Get time slots for a specific date and service period
   */
  static async getTimeSlots(date: string, servicePeriodId?: string): Promise<TimeSlotAvailability[]> {
    let q = query(
      collection(db, COLLECTIONS.TIME_SLOT_AVAILABILITY),
      where('date', '==', date),
      orderBy('time')
    )

    if (servicePeriodId) {
      q = query(q, where('periodId', '==', servicePeriodId))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as TimeSlotAvailability[]
  }

  /**
   * Update time slot availability
   */
  static async updateTimeSlotAvailability(
    timeSlotId: string,
    availableTableIds: string[],
    capacityAvailable: number
  ): Promise<void> {
    const slotRef = doc(db, COLLECTIONS.TIME_SLOT_AVAILABILITY, timeSlotId)
    await updateDoc(slotRef, {
      availableTableIds,
      capacityAvailable,
      lastUpdated: new Date().toISOString()
    })

    // Update real-time database for live updates
    const rtdbRef = ref(rtdb, `${RTDB_PATHS.TABLE_AVAILABILITY}/${timeSlotId}`)
    await set(rtdbRef, {
      availableTableIds,
      capacityAvailable,
      lastUpdated: Date.now()
    })
  }

  /**
   * Subscribe to real-time table availability updates
   */
  static subscribeToTableAvailability(
    date: string,
    callback: (availability: TableAvailabilitySnapshot) => void
  ): () => void {
    const rtdbRef = ref(rtdb, `${RTDB_PATHS.TABLE_AVAILABILITY}/${date}`)

    return onValue(rtdbRef, (snapshot) => {
      const data = snapshot.val() || {}
      callback(data)
    })
  }

  // ===================================================================
  // Reservation Management
  // ===================================================================

  /**
   * Create a new restaurant reservation
   */
  static async createReservation(
    reservationData: Omit<RestaurantReservation, 'id' | 'reservationReference' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    return await runTransaction(db, async (transaction) => {
      // Generate reservation reference
      const reservationReference = await this.generateReservationReference()

      // Check table availability
      const availability = await this.checkTableAvailability({
        date: reservationData.reservationDate.toDate().toISOString().split('T')[0],
        servicePeriodId: reservationData.servicePeriodId,
        partySize: reservationData.partySize
      })

      if (!availability.available) {
        throw new Error('Tables are no longer available for this time slot')
      }

      // Create reservation document
      const reservationRef = doc(collection(db, COLLECTIONS.TABLE_RESERVATIONS))
      const newReservation: RestaurantReservation = {
        ...reservationData,
        id: reservationRef.id,
        reservationReference,
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          timestamp: Timestamp.now(),
          changedBy: reservationData.createdBy,
          notes: 'Reservation created'
        }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      transaction.set(reservationRef, newReservation)

      // Update table availability
      const timeSlotRef = doc(db, COLLECTIONS.TIME_SLOT_AVAILABILITY, reservationData.timeSlotId)
      const timeSlotDoc = await transaction.get(timeSlotRef)

      if (timeSlotDoc.exists()) {
        const timeSlotData = timeSlotDoc.data() as TimeSlotAvailability
        const updatedAvailableTableIds = timeSlotData.availableTableIds.filter(
          id => !reservationData.tableIds.includes(id)
        )

        transaction.update(timeSlotRef, {
          availableTableIds: updatedAvailableTableIds,
          lastUpdated: new Date().toISOString()
        })
      }

      return reservationRef.id
    })
  }

  /**
   * Update reservation status
   */
  static async updateReservationStatus(
    reservationId: string,
    newStatus: RestaurantReservation['status'],
    notes?: string,
    updatedBy?: string
  ): Promise<void> {
    const reservationRef = doc(db, COLLECTIONS.TABLE_RESERVATIONS, reservationId)
    const reservationDoc = await getDoc(reservationRef)

    if (!reservationDoc.exists()) {
      throw new Error('Reservation not found')
    }

    const reservation = reservationDoc.data() as RestaurantReservation
    const statusUpdate = {
      status: newStatus,
      timestamp: Timestamp.now(),
      changedBy: updatedBy || 'system',
      notes
    }

    await updateDoc(reservationRef, {
      status: newStatus,
      statusHistory: [...reservation.statusHistory, statusUpdate],
      updatedAt: Timestamp.now(),
      lastUpdatedBy: updatedBy || 'system'
    })

    // If cancelled, release tables back to availability
    if (newStatus === 'cancelled') {
      await this.releaseTablesFromReservation(reservation)
    }
  }

  /**
   * Get reservations for a specific date
   */
  static async getReservations(
    date: string,
    servicePeriodId?: string
  ): Promise<RestaurantReservation[]> {
    const startOfDay = new Date(date + 'T00:00:00.000Z')
    const endOfDay = new Date(date + 'T23:59:59.999Z')

    let q = query(
      collection(db, COLLECTIONS.TABLE_RESERVATIONS),
      where('reservationDate', '>=', Timestamp.fromDate(startOfDay)),
      where('reservationDate', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('reservationDate'),
      orderBy('reservationTime')
    )

    if (servicePeriodId) {
      q = query(q, where('servicePeriodId', '==', servicePeriodId))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RestaurantReservation[]
  }

  // ===================================================================
  // Availability Checking
  // ===================================================================

  /**
   * Check table availability for a specific query
   */
  static async checkTableAvailability(
    query: TableAvailabilityQuery
  ): Promise<TableAvailabilityResult> {
    const timeSlots = await this.getTimeSlots(query.date, query.servicePeriodId)
    const tables = await this.getTables()

    const availableTimeSlots = timeSlots
      .filter(slot => {
        const availableCapacity = slot.availableTableIds.reduce((total, tableId) => {
          const table = tables.find(t => t.id === tableId)
          return total + (table?.capacity.default || 0)
        }, 0)
        return availableCapacity >= query.partySize
      })
      .map(slot => {
        const availableTables = tables.filter(table =>
          slot.availableTableIds.includes(table.id) &&
          this.matchesRequirements(table, query)
        )

        return {
          id: slot.id,
          time: slot.time,
          availableTables,
          combinedTableOptions: this.findCombinedTableOptions(
            availableTables,
            query.partySize
          )
        }
      })

    return {
      available: availableTimeSlots.length > 0,
      timeSlots: availableTimeSlots,
      alternativeDates: [], // TODO: Implement alternative date suggestions
      waitlistOption: availableTimeSlots.length === 0 ? {
        estimatedWaitTime: 30,
        position: 1
      } : undefined
    }
  }

  /**
   * Check if table matches requirements
   */
  private static matchesRequirements(
    table: RestaurantTable,
    query: TableAvailabilityQuery
  ): boolean {
    // Check capacity
    if (table.capacity.max < query.partySize) {
      return false
    }

    // Check accessibility needs
    if (query.accessibilityNeeds) {
      const hasAllAccessibilityFeatures = query.accessibilityNeeds.every(
        feature => table.accessibility.includes(feature)
      )
      if (!hasAllAccessibilityFeatures) {
        return false
      }
    }

    // Check table feature preferences (optional)
    if (query.tableFeaturePreferences) {
      const hasPreferredFeatures = query.tableFeaturePreferences.some(
        feature => table.features.includes(feature)
      )
      // This is a preference, not a requirement, so we don't reject
    }

    return true
  }

  /**
   * Find combined table options for larger parties
   */
  private static findCombinedTableOptions(
    availableTables: RestaurantTable[],
    partySize: number
  ): { tableIds: string[]; totalCapacity: number; zones: TableZone[] }[] {
    const options: { tableIds: string[]; totalCapacity: number; zones: TableZone[] }[] = []

    // Find combinable tables
    for (const table of availableTables) {
      if (table.combinableWith.length > 0) {
        const combinableInAvailable = table.combinableWith.filter(id =>
          availableTables.some(t => t.id === id)
        )

        for (const combinableId of combinableInAvailable) {
          const combinableTable = availableTables.find(t => t.id === combinableId)
          if (combinableTable) {
            const totalCapacity = table.capacity.default + combinableTable.capacity.default
            if (totalCapacity >= partySize) {
              options.push({
                tableIds: [table.id, combinableTable.id],
                totalCapacity,
                zones: [table.zone, combinableTable.zone]
              })
            }
          }
        }
      }
    }

    return options
  }

  // ===================================================================
  // Utility Functions
  // ===================================================================

  /**
   * Generate unique reservation reference
   */
  private static async generateReservationReference(): Promise<string> {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    // Count reservations for today to generate sequence
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const todayReservations = await getDocs(
      query(
        collection(db, COLLECTIONS.TABLE_RESERVATIONS),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<', Timestamp.fromDate(endOfDay))
      )
    )

    const sequence = String(todayReservations.size + 1).padStart(3, '0')
    return `RST-${year}${month}${day}-${sequence}`
  }

  /**
   * Release tables back to availability when reservation is cancelled
   */
  private static async releaseTablesFromReservation(
    reservation: RestaurantReservation
  ): Promise<void> {
    const timeSlotRef = doc(db, COLLECTIONS.TIME_SLOT_AVAILABILITY, reservation.timeSlotId)
    const timeSlotDoc = await getDoc(timeSlotRef)

    if (timeSlotDoc.exists()) {
      const timeSlotData = timeSlotDoc.data() as TimeSlotAvailability
      const updatedAvailableTableIds = [
        ...timeSlotData.availableTableIds,
        ...reservation.tableIds
      ]

      await updateDoc(timeSlotRef, {
        availableTableIds: updatedAvailableTableIds,
        lastUpdated: new Date().toISOString()
      })

      // Update real-time database
      const rtdbRef = ref(rtdb, `${RTDB_PATHS.TABLE_AVAILABILITY}/${reservation.timeSlotId}`)
      await update(rtdbRef, {
        availableTableIds: updatedAvailableTableIds,
        lastUpdated: Date.now()
      })
    }
  }

  // ===================================================================
  // Analytics
  // ===================================================================

  /**
   * Get restaurant analytics for a specific date and period
   */
  static async getRestaurantAnalytics(
    date: string,
    servicePeriodId: string
  ): Promise<RestaurantAnalytics | null> {
    const analyticsRef = doc(db, COLLECTIONS.RESTAURANT_ANALYTICS, `${date}-${servicePeriodId}`)
    const analyticsDoc = await getDoc(analyticsRef)

    if (!analyticsDoc.exists()) {
      return null
    }

    return analyticsDoc.data() as RestaurantAnalytics
  }

  /**
   * Calculate and store analytics for a date/period
   */
  static async calculateAnalytics(date: string, servicePeriodId: string): Promise<RestaurantAnalytics> {
    const reservations = await this.getReservations(date, servicePeriodId)
    const tables = await this.getTables()

    const analytics: RestaurantAnalytics = {
      date,
      servicePeriodId,
      totalReservations: reservations.length,
      walkedReservations: reservations.filter(r => r.status === 'completed').length,
      cancelledReservations: reservations.filter(r => r.status === 'cancelled').length,
      noShowReservations: reservations.filter(r => r.status === 'no-show').length,
      tableUtilizationRate: this.calculateTableUtilization(reservations, tables),
      averagePartySize: reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length || 0,
      turnoverRate: reservations.length / tables.length,
      averageServiceDuration: reservations
        .filter(r => r.seatedTime && r.actualEndTime)
        .reduce((sum, r) => {
          const duration = r.actualEndTime!.toMillis() - r.seatedTime!.toMillis()
          return sum + (duration / (1000 * 60)) // Convert to minutes
        }, 0) / reservations.length || 0,
      onTimeSeatingRate: 0, // TODO: Calculate based on reservation vs actual seating times
      averageWaitTime: 0, // TODO: Calculate from waitlist data
      guestsByType: {
        regular: reservations.filter(r => !r.partyType || r.partyType === 'regular').length,
        celebration: reservations.filter(r => r.partyType === 'celebration').length,
        business: reservations.filter(r => r.partyType === 'business').length,
        anniversary: reservations.filter(r => r.partyType === 'anniversary').length,
        birthday: reservations.filter(r => r.partyType === 'birthday').length,
      }
    }

    // Store analytics
    const analyticsRef = doc(db, COLLECTIONS.RESTAURANT_ANALYTICS, `${date}-${servicePeriodId}`)
    await updateDoc(analyticsRef, analytics as any)

    return analytics
  }

  /**
   * Calculate table utilization rate
   */
  private static calculateTableUtilization(
    reservations: RestaurantReservation[],
    tables: RestaurantTable[]
  ): number {
    const totalTableHours = tables.length * 4 // Assuming 4-hour service period
    const usedTableHours = reservations.reduce((sum, reservation) => {
      return sum + (reservation.tableIds.length * (reservation.durationMinutes / 60))
    }, 0)

    return totalTableHours > 0 ? (usedTableHours / totalTableHours) * 100 : 0
  }

  // ===================================================================
  // Real-time Status Updates
  // ===================================================================

  /**
   * Subscribe to table status changes
   */
  static subscribeToTableStatus(
    callback: (tables: RestaurantTable[]) => void
  ): () => void {
    const tablesRef = collection(db, COLLECTIONS.RESTAURANT_TABLES)

    return onSnapshot(tablesRef, (snapshot) => {
      const tables = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RestaurantTable[]

      callback(tables)
    })
  }

  /**
   * Update table status in real-time
   */
  static async updateTableStatus(
    tableId: string,
    status: RestaurantTable['status']
  ): Promise<void> {
    const tableRef = doc(db, COLLECTIONS.RESTAURANT_TABLES, tableId)
    await updateDoc(tableRef, {
      status,
      updatedAt: Timestamp.now()
    })

    // Update real-time database
    const rtdbRef = ref(rtdb, `${RTDB_PATHS.TABLE_STATUS}/${tableId}`)
    await set(rtdbRef, {
      status,
      lastUpdated: Date.now()
    })
  }
}

// Export for easier imports
export default RestaurantService