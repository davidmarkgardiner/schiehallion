import type { RoomType } from './hotel'

export type ArrivalStatus = 'expected' | 'checked-in' | 'delayed'
export type DepartureStatus = 'in-house' | 'processing' | 'checked-out' | 'late-checkout'
export type RoomOperationalStatus =
  | 'vacant-clean'
  | 'vacant-dirty'
  | 'occupied'
  | 'out-of-service'
  | 'inspection'
  | 'blocked'
export type TurnStatus = 'arrival' | 'stayover' | 'departure' | 'out-of-order'
export type HousekeepingWorkflowStatus = 'pending' | 'in-progress' | 'completed' | 'inspecting'

export interface OperationsSummaryMetrics {
  occupancyRate: number
  arrivalsDue: number
  departuresDue: number
  stayOvers: number
  roomsAvailable: number
  vipArrivals: number
  pendingRequests: number
  roomsOutOfOrder: number
  housekeepingCompletion: number
  lastUpdated: string
}

export interface OperationsArrival {
  id: string
  guestName: string
  partySize: number
  roomType: RoomType
  checkInTime: string
  status: ArrivalStatus
  stayLength: number
  vip: boolean
  transport?: string
  specialRequests?: string[]
  notes?: string
  upgradeEligible?: boolean
  upgradeOptions?: string[]
  assignedRoomId?: string
}

export interface OperationsDeparture {
  id: string
  guestName: string
  roomNumber: string
  checkoutTime: string
  status: DepartureStatus
  balanceDue: number
  transportation?: string
  housekeepingStatus: 'clean' | 'dirty' | 'in-progress'
  notes?: string
}

export interface OperationalRoom {
  id: string
  roomNumber: string
  type: RoomType
  floor: number
  status: RoomOperationalStatus
  turnStatus: TurnStatus
  housekeepingStatus: 'clean' | 'in-progress' | 'dirty' | 'inspection'
  occupancyStatus: 'vacant' | 'occupied' | 'blocked'
  occupantName?: string
  capacity: number
  features: string[]
  readinessNote?: string
  nextEvent?: string
  priorityFlags?: string[]
  upgradeLevel: 'standard' | 'deluxe' | 'suite' | 'signature'
  housekeepingEta?: string
}

export interface HousekeepingTask {
  id: string
  roomNumber: string
  status: HousekeepingWorkflowStatus
  priority: 'low' | 'medium' | 'high'
  assignedTo: string
  startTime: string
  estimatedDuration: number
  lastUpdated: string
  notes?: string
  mobileDevice: 'iOS' | 'Android'
}

export interface AssignmentFeedback {
  type: 'success' | 'error'
  message: string
}
