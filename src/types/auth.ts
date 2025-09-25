import type { GuestPreferenceProfile, PersonalizationSettings } from './personalization'

export type UserRole = 'guest' | 'staff' | 'manager' | 'admin'

export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  profile: {
    firstName?: string
    lastName?: string
    phone?: string
    dateOfBirth?: Date
    address?: string
  }
  createdAt: Date
  lastLogin: Date
  isEmailVerified: boolean
  staffInfo?: {
    employeeId?: string
    department?: string
    permissions?: string[]
    twoFactorEnabled: boolean
  }
  preferences?: GuestPreferenceProfile
  personalization?: PersonalizationSettings
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: Date
  details: any
  ipAddress?: string
  userAgent?: string
}

export interface GuestBooking {
  id: string
  guestEmail: string
  guestUserId?: string // null if guest checkout
  bookingDetails: any
  createdAt: Date
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}