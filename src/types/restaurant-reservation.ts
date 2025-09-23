export type ReservationOccasion =
  | 'none'
  | 'birthday'
  | 'anniversary'
  | 'engagement'
  | 'honeymoon'
  | 'business'
  | 'other'

export type ReservationDietaryRequirement =
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'dairy_free'
  | 'nut_allergy'
  | 'halal'
  | 'kosher'
  | 'low_sodium'
  | 'pregnancy_friendly'

export interface ReservationPolicy {
  title: string
  description: string
}

export interface ReservationFormContactDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface ReservationFormValues {
  partySize: number
  dietaryRequirements: ReservationDietaryRequirement[]
  customDietaryNotes?: string
  occasion: ReservationOccasion
  occasionDetails?: string
  specialRequests?: string
  smsReminder: boolean
  marketingOptIn: boolean
  contact: ReservationFormContactDetails
  acceptPolicies: boolean
}

export interface ReservationConfirmationRecord {
  reference: string
  submittedAt: string
  formValues: ReservationFormValues
}

export type WaitlistNotificationPreference = 'email' | 'sms' | 'both'

export interface WaitlistFormValues {
  fullName: string
  email: string
  phone: string
  partySize: number
  notificationPreference: WaitlistNotificationPreference
  notes?: string
  acceptTerms: boolean
}

export interface WaitlistJoinRecord {
  submittedAt: string
  queuePosition: number
  formValues: WaitlistFormValues
}

export interface AlternativeSlotSuggestion {
  id: string
  label: string
  status: 'available' | 'limited'
  date: string
  time: string
}
