import { useMemo } from 'react'
import type {
  RestaurantTable,
  ServicePeriod,
  TimeSlotAvailability,
  TableFeature,
  TableZone,
  AccessibilityFeature,
} from '@/types/restaurant'

// Lightweight hook to lazily load and memoize restaurant data
export function useRestaurantData() {
  const data = useMemo(() => {
    // Lazy import to avoid bundling large data in initial chunk
    return import('@/data/restaurant').then(module => ({
      tables: module.restaurantTables,
      periods: module.defaultServicePeriods,
      timeSlots: module.initialTimeSlots,
      tableZoneOptions: module.tableZoneOptions,
      tableFeatureOptions: module.tableFeatureOptions,
      accessibilityOptions: module.accessibilityOptions,
    }))
  }, [])

  return data
}

// Memoized selectors for specific data slices
export function useTablesByZone(tables: RestaurantTable[], zone?: TableZone) {
  return useMemo(() => {
    if (!zone) return tables
    return tables.filter(table => table.zone === zone)
  }, [tables, zone])
}

export function useAvailableSlots(slots: TimeSlotAvailability[], date: string) {
  return useMemo(() => {
    return slots.filter(slot => slot.date === date && slot.status !== 'closed')
  }, [slots, date])
}

export function useTableFeatureMap() {
  return useMemo(() => {
    return import('@/data/restaurant').then(module =>
      new Map<TableFeature, string>(
        module.tableFeatureOptions.map(option => [option.value, option.label])
      )
    )
  }, [])
}

export function useAccessibilityMap() {
  return useMemo(() => {
    return import('@/data/restaurant').then(module =>
      new Map<AccessibilityFeature, string>(
        module.accessibilityOptions.map(option => [option.value, option.label])
      )
    )
  }, [])
}