// Restaurant Database Initialization Script
// Sets up default restaurant tables, service periods, and time slots in Firebase

import { Timestamp } from 'firebase/firestore'
import { RestaurantService } from '@/services/restaurantService'
import {
  restaurantTables,
  defaultServicePeriods,
  initialTimeSlots
} from '@/data/restaurant'
import type {
  RestaurantTable,
  ServicePeriod,
  TimeSlotAvailability
} from '@/types/hotel'

/**
 * Initialize restaurant database with default data
 */
export async function initializeRestaurantData(): Promise<void> {
  console.log('🍽️  Initializing restaurant database...')

  try {
    // 1. Initialize restaurant tables
    console.log('📊 Setting up restaurant tables...')
    const tablePromises = restaurantTables.map(async (tableData) => {
      const table: Omit<RestaurantTable, 'id'> = {
        ...tableData
      }

      const tableId = await RestaurantService.saveTable(table)
      console.log(`   ✅ Created table ${tableData.label} (${tableId})`)
      return tableId
    })

    const createdTableIds = await Promise.all(tablePromises)
    console.log(`✅ Created ${createdTableIds.length} restaurant tables`)

    // 2. Initialize service periods
    console.log('🕐 Setting up service periods...')
    const periodPromises = defaultServicePeriods.map(async (periodData) => {
      const period: Omit<ServicePeriod, 'id'> = {
        ...periodData
      }

      const periodId = await RestaurantService.saveServicePeriod(period)
      console.log(`   ✅ Created service period ${periodData.name} (${periodId})`)
      return periodId
    })

    const createdPeriodIds = await Promise.all(periodPromises)
    console.log(`✅ Created ${createdPeriodIds.length} service periods`)

    // 3. Initialize time slot availability
    console.log('⏰ Setting up time slot availability...')

    // Note: In a real implementation, you would want to:
    // 1. Generate time slots dynamically based on service periods
    // 2. Calculate availability based on actual table data
    // 3. Set up for multiple dates, not just the sample date

    // For now, we'll use the sample data but note this would need
    // to be replaced with dynamic generation
    console.log('   ⚠️  Using sample time slot data - replace with dynamic generation in production')

    // Sample time slots are already available in the data file
    // In production, you would generate these based on:
    // - Service periods
    // - Date ranges
    // - Table availability
    // - Business rules

    console.log('✅ Time slot initialization noted (using sample data)')

    console.log('🎉 Restaurant database initialization complete!')

    // Summary
    console.log('\n📋 Initialization Summary:')
    console.log(`   • Tables: ${createdTableIds.length} created`)
    console.log(`   • Service Periods: ${createdPeriodIds.length} created`)
    console.log(`   • Time Slots: Using sample data (${initialTimeSlots.length} slots)`)
    console.log(`   • Zones: ${Array.from(new Set(restaurantTables.map(t => t.zone))).length} defined`)
    console.log(`   • Features: ${Array.from(new Set(restaurantTables.flatMap(t => t.features))).length} types`)

  } catch (error) {
    console.error('❌ Failed to initialize restaurant database:', error)
    throw error
  }
}

/**
 * Generate time slots for a specific date and service period
 * This is a helper function for dynamic time slot generation
 */
export function generateTimeSlots(
  date: string,
  servicePeriod: ServicePeriod,
  tables: RestaurantTable[]
): TimeSlotAvailability[] {
  const timeSlots: TimeSlotAvailability[] = []

  // Parse start and end times
  const [startHour, startMinute] = servicePeriod.startTime.split(':').map(Number)
  const [endHour, endMinute] = servicePeriod.endTime.split(':').map(Number)
  const [lastSeatingHour, lastSeatingMinute] = servicePeriod.lastSeatingTime.split(':').map(Number)

  // Create time slots every 30 minutes until last seating
  let currentHour = startHour
  let currentMinute = startMinute
  let slotIndex = 0

  const lastSeatingTime = lastSeatingHour * 60 + lastSeatingMinute

  while (true) {
    const currentTime = currentHour * 60 + currentMinute

    if (currentTime > lastSeatingTime) {
      break
    }

    const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`

    // Calculate available tables (initially all tables available)
    const availableTableIds = tables
      .filter(table => table.status === 'available')
      .map(table => table.id)

    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity.default, 0)
    const capacityAvailable = availableTableIds.reduce((sum, tableId) => {
      const table = tables.find(t => t.id === tableId)
      return sum + (table?.capacity.default || 0)
    }, 0)

    // Determine slot status based on availability
    const ratio = availableTableIds.length / tables.length
    const status = ratio === 0 ? 'full' : ratio <= 0.3 ? 'limited' : 'available'

    const timeSlot: TimeSlotAvailability = {
      id: `${servicePeriod.id}-${date}-${timeString.replace(':', '')}`,
      periodId: servicePeriod.id,
      date,
      time: timeString,
      durationMinutes: servicePeriod.defaultDurationMinutes,
      availableTableIds,
      totalTables: tables.length,
      totalCapacity,
      capacityAvailable,
      status,
      lastUpdated: new Date().toISOString(),
      lastBookingCutoff: calculateCutoffTime(timeString, 15) // 15 minutes before
    }

    timeSlots.push(timeSlot)

    // Move to next slot (30 minutes)
    currentMinute += 30
    if (currentMinute >= 60) {
      currentHour += 1
      currentMinute -= 60
    }

    slotIndex++
  }

  return timeSlots
}

/**
 * Calculate cutoff time (time before slot when bookings close)
 */
function calculateCutoffTime(timeString: string, minutesBefore: number): string {
  const [hour, minute] = timeString.split(':').map(Number)
  let cutoffMinute = minute - minutesBefore
  let cutoffHour = hour

  if (cutoffMinute < 0) {
    cutoffMinute += 60
    cutoffHour -= 1
  }

  if (cutoffHour < 0) {
    cutoffHour = 23
  }

  return `${String(cutoffHour).padStart(2, '0')}:${String(cutoffMinute).padStart(2, '0')}`
}

/**
 * Generate time slots for multiple dates
 */
export function generateTimeSlotsForDateRange(
  startDate: string,
  endDate: string,
  servicePeriods: ServicePeriod[],
  tables: RestaurantTable[]
): TimeSlotAvailability[] {
  const allTimeSlots: TimeSlotAvailability[] = []

  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0]

    for (const period of servicePeriods) {
      const dayOfWeek = date.getDay()

      // Business rules: skip certain periods on certain days
      if (period.id === 'breakfast' && dayOfWeek === 0) {
        // No breakfast service on Sundays (example rule)
        continue
      }

      const slotsForDay = generateTimeSlots(dateString, period, tables)
      allTimeSlots.push(...slotsForDay)
    }
  }

  return allTimeSlots
}

/**
 * Main function to set up restaurant data for production
 */
export async function setupRestaurantForProduction(
  startDate: string,
  endDate: string
): Promise<void> {
  console.log('🚀 Setting up restaurant for production...')

  try {
    // Initialize base data
    await initializeRestaurantData()

    // Get the created data
    const tables = await RestaurantService.getTables()
    const servicePeriods = await RestaurantService.getServicePeriods()

    // Generate time slots for the date range
    console.log(`📅 Generating time slots from ${startDate} to ${endDate}...`)
    const timeSlots = generateTimeSlotsForDateRange(startDate, endDate, servicePeriods, tables)

    console.log(`✅ Generated ${timeSlots.length} time slots for production`)

    // Note: In a real implementation, you would save these to the database
    // For now, we'll just log the count

    console.log('🎉 Restaurant production setup complete!')

  } catch (error) {
    console.error('❌ Failed to setup restaurant for production:', error)
    throw error
  }
}

// Export for use in scripts or admin functions
export {
  initializeRestaurantData as default
}