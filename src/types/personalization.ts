import { PackageType, RoomType } from './hotel'

export type TravelPurpose = 'leisure' | 'business' | 'celebration' | 'family'
export type BudgetPreference = 'value' | 'balanced' | 'premium'
export type RecommendationCategory = 'room' | 'dining' | 'experience' | 'wellness' | 'service'

export interface GuestPreferenceProfile {
  stayGoals: string[]
  experienceInterests: string[]
  roomComforts: string[]
  dietaryPreferences: string[]
  accessibilityNeeds: string[]
  specialOccasions: string[]
  travelPurpose: TravelPurpose
  budgetPreference: BudgetPreference
  marketingOptIn: boolean
  personalizationOptIn: boolean
  preferredCommunication: 'email' | 'sms' | 'whatsapp'
  lastCaptured: string
}

export interface PersonalizationSettings {
  allowPersonalization: boolean
  allowMarketing: boolean
  allowDataProcessing: boolean
  optOutReason?: string
  lastUpdated: string
}

export interface BookingHistoryEntry {
  bookingId: string
  checkInDate: string
  nights: number
  roomType: RoomType
  packageType: PackageType
  spend: number
  travelPurpose: TravelPurpose
  addOns: string[]
  occupancy: number
  wasUpsold: boolean
}

export interface HistoryInsights {
  totalStays: number
  averageNights: number
  topRoomTypes: RoomType[]
  favouritePackages: PackageType[]
  totalSpend: number
  lastStayDate?: string
  loyaltyScore: number
  addOnAffinity: string[]
  staySpacingDays?: number
}

export interface Recommendation {
  id: string
  title: string
  description: string
  tags: string[]
  confidence: number // 0 to 1
  category: RecommendationCategory
  supportingInsight?: string
}

export interface SuggestionContext {
  stayLength: number
  travelPurpose: TravelPurpose
  companions: number
  budgetSensitivity: BudgetPreference
  stayOccasion?: string
  isReturningGuest: boolean
  checkInMonth?: number
  wantsLateCheckout?: boolean
}

export type ABTestVariant = 'value-focus' | 'experience-focus'

export interface PackageSuggestion {
  id: string
  packageType: PackageType
  headline: string
  subheading: string
  anchorPrice: string
  priceAdjustment: string
  valueMessage: string
  urgencyMessage?: string
  confidence: number
  variant: ABTestVariant
  badges: string[]
}

export type ConversionEventType = 'view' | 'interaction' | 'accepted'

export interface ConversionEvent {
  id: string
  suggestionId: string
  type: ConversionEventType
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface ConversionMetrics {
  totalEvents: number
  accepted: number
  viewed: number
  interacted: number
  acceptanceRate: number
  lastInteraction?: number
}
