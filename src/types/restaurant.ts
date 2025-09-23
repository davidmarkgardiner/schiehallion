// Restaurant module domain types for Schiehallion Hotel

export type TableZone = 'main_dining' | 'window' | 'private' | 'terrace' | 'chef_counter'

export type TableFeature =
  | 'window_view'
  | 'booth'
  | 'high_top'
  | 'fireplace_nearby'
  | 'romantic_pairing'
  | 'tech_enabled'
  | 'outdoor'
  | 'near_stage'

export type AccessibilityFeature = 'wheelchair' | 'hearing_loop' | 'large_print_menu'

export type TableStatus = 'available' | 'held' | 'reserved' | 'maintenance'

export interface RestaurantTablePosition {
  x: number
  y: number
}

export interface RestaurantTable {
  id: string
  label: string
  capacity: {
    min: number
    default: number
    max: number
  }
  zone: TableZone
  position: RestaurantTablePosition
  rotation?: number
  combinableWith: string[]
  features: TableFeature[]
  accessibility: AccessibilityFeature[]
  status: TableStatus
  notes?: string
}

export interface ServicePeriod {
  id: string
  name: string
  startTime: string // HH:mm
  endTime: string // HH:mm
  lastSeatingTime: string // HH:mm
  defaultDurationMinutes: number
  turnaroundBufferMinutes: number
  maxPartySize: number
  zonesOpen: TableZone[]
  notes?: string
}

export type SlotStatus = 'available' | 'limited' | 'full' | 'closed'

export interface SlotSpecialEvent {
  label: string
  description?: string
  tone: 'highlight' | 'warning'
}

export interface TimeSlotAvailability {
  id: string
  periodId: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  durationMinutes: number
  availableTableIds: string[]
  totalTables: number
  totalCapacity: number
  capacityAvailable: number
  status: SlotStatus
  lastUpdated: string
  lastBookingCutoff: string // HH:mm
  specialEvent?: SlotSpecialEvent
  notes?: string
}
