import type { RoomType } from './hotel'

export type ArrivalStatus = 'expected' | 'delayed' | 'checked-in'
export type DepartureStatus = 'due' | 'packing' | 'checked-out'
export type ArrivalConfidence = 'on-time' | 'delayed' | 'unknown'
export type TaskPriority = 'low' | 'medium' | 'high'
export type FrontDeskRoomStatus =
  | 'vacant-clean'
  | 'vacant-dirty'
  | 'pre-arrival'
  | 'in-house'
  | 'due-out'
  | 'out-of-service'
export type HousekeepingState = 'clean' | 'dirty' | 'in-progress' | 'inspection' | 'out-of-service'
export type HousekeepingStage = 'scheduled' | 'in-progress' | 'inspection' | 'completed'
export type MobileSyncState = 'pending' | 'sent' | 'online'
export type TimelineStatus = 'done' | 'in-progress' | 'upcoming'

export interface ArrivalRecord {
  id: string
  guestName: string
  confirmation: string
  roomType: RoomType
  guests: number
  nights: number
  checkInTime: string
  status: ArrivalStatus
  etaConfidence: ArrivalConfidence
  assignedRoom?: string
  vip?: boolean
  loyaltyTier?: string
  transport?: string
  specialRequests: string[]
  requiresAccessible?: boolean
  upgradePreference?: RoomType
  upgradeEligible?: boolean
  notes?: string
}

export interface DepartureRecord {
  id: string
  guestName: string
  roomNumber: string
  departureTime: string
  status: DepartureStatus
  balance: number
  lateCheckout?: boolean
  notes?: string[]
  processed: boolean
  housekeepingRequired: boolean
}

export interface RoomOperationsStatus {
  id: string
  roomNumber: string
  type: RoomType
  floor: number
  status: FrontDeskRoomStatus
  housekeepingStatus: HousekeepingState
  capacity: number
  isAccessible?: boolean
  assignedGuest?: string
  departureDueAt?: string
  maintenanceNote?: string
  blockers?: string[]
  tags?: string[]
}

export interface HousekeepingTask {
  id: string
  roomNumber: string
  assignedTo: string
  status: HousekeepingStage
  priority: TaskPriority
  startMinutes?: number
  targetMinutes?: number
  lastUpdateMinutes: number
  notes?: string
  requiresInspection: boolean
  mobileSync: MobileSyncState
  isRush?: boolean
}

export interface DailyOperationsPulse {
  date: string
  occupancy: number
  arrivalsDue: number
  departuresDue: number
  roomsReady: number
  roomsDirty: number
  roomsOutOfOrder: number
  vipArrivals: number
  loyaltyArrivals: number
  airportTransfers: number
  upgradesSuggested: number
}

export interface OperationsTimelineItem {
  id: string
  label: string
  time: string
  owner: string
  status: TimelineStatus
}
