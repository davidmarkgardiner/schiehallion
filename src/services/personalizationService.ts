// Epic 10 Personalization Service
// Implements preference capture, historical analysis, recommendations, and dynamic package suggestions

import {
  BookingHistoryInsights,
  ConversionEvent,
  ExperimentVariant,
  GuestPreferenceProfile,
  HistoricalBookingSummary,
  PackageSuggestion,
  PersonalizationAnalytics,
  PersonalizationContextInput,
  PersonalizationSettings,
  PersonalizationState,
  Recommendation
} from '@/types/personalization'
import { PackageType, RoomType } from '@/types/hotel'

const STORAGE_PREFIX = 'sch-personalization-'

// Package price adjustments mirror PACKAGE_OPTIONS configuration
const PACKAGE_PRICE_ADJUSTMENTS: Record<PackageType, number> = {
  'room-only': 0,
  'bed-breakfast': 2500,
  'half-board': 4500
}

const DEFAULT_PREFERENCES: GuestPreferenceProfile = {
  stayPurpose: 'leisure',
  travelStyle: 'relaxed',
  pace: 'balanced',
  diningPreferences: ['local-produce'],
  desiredPerks: ['late-checkout'],
  preferredRoomFeatures: ['view', 'soaking-bath'],
  upgradeInterest: 'medium',
  specialOccasion: undefined
}

const DEFAULT_HISTORY: HistoricalBookingSummary[] = [
  {
    stayId: '2023-autumn-escape',
    checkInDate: '2023-10-14',
    nights: 3,
    guests: 2,
    roomType: 'deluxe',
    packageType: 'bed-breakfast',
    spend: 78000,
    addOns: ['late-checkout'],
    experienceTags: ['distillery-tour', 'fine-dining'],
    satisfactionScore: 4.8,
    notes: 'Enjoyed local tasting menu'
  },
  {
    stayId: '2024-spring-family',
    checkInDate: '2024-04-08',
    nights: 4,
    guests: 3,
    roomType: 'family',
    packageType: 'half-board',
    spend: 124000,
    addOns: ['river-safari', 'kids-activity-pack'],
    experienceTags: ['outdoor-adventure', 'family'],
    satisfactionScore: 4.6
  },
  {
    stayId: '2024-winter-hideaway',
    checkInDate: '2024-12-05',
    nights: 2,
    guests: 2,
    roomType: 'suite',
    packageType: 'half-board',
    spend: 99000,
    addOns: ['spa-pass'],
    experienceTags: ['wellness', 'tasting-menu'],
    satisfactionScore: 4.9,
    notes: 'Booked couples spa treatment'
  }
]

const DEFAULT_SETTINGS: PersonalizationSettings = {
  personalizationEnabled: true,
  shareAnalytics: false,
  optInForUpsells: true
}

const DEFAULT_ANALYTICS: PersonalizationAnalytics = {
  packageImpressions: 0,
  recommendationImpressions: 0,
  conversions: 0,
  lastContextKey: undefined
}

export const getDefaultPersonalizationState = (): PersonalizationState => ({
  preferences: { ...DEFAULT_PREFERENCES },
  history: [...DEFAULT_HISTORY],
  settings: { ...DEFAULT_SETTINGS },
  conversions: [],
  analytics: { ...DEFAULT_ANALYTICS },
  experimentVariant: Math.random() < 0.5 ? 'A' : 'B',
  lastUpdated: new Date().toISOString()
})

const getStorageKey = (userId?: string) => `${STORAGE_PREFIX}${userId || 'guest'}`

const mergeWithDefaults = (state?: Partial<PersonalizationState>): PersonalizationState => {
  const defaults = getDefaultPersonalizationState()

  if (!state) {
    return defaults
  }

  return {
    ...defaults,
    ...state,
    preferences: { ...defaults.preferences, ...(state.preferences || {}) },
    history: state.history && state.history.length > 0 ? state.history : defaults.history,
    settings: { ...defaults.settings, ...(state.settings || {}) },
    conversions: state.conversions || [],
    analytics: { ...defaults.analytics, ...(state.analytics || {}) },
    experimentVariant: state.experimentVariant || defaults.experimentVariant,
    lastUpdated: state.lastUpdated || defaults.lastUpdated
  }
}

export const loadPersonalizationState = (userId?: string): PersonalizationState => {
  if (typeof window === 'undefined') {
    return getDefaultPersonalizationState()
  }

  const key = getStorageKey(userId)
  const stored = window.localStorage.getItem(key)

  if (!stored) {
    const defaults = getDefaultPersonalizationState()
    window.localStorage.setItem(key, JSON.stringify(defaults))
    return defaults
  }

  try {
    const parsed = JSON.parse(stored) as Partial<PersonalizationState>
    return mergeWithDefaults(parsed)
  } catch (error) {
    console.error('Failed to parse personalization state, resetting to defaults:', error)
    const defaults = getDefaultPersonalizationState()
    window.localStorage.setItem(key, JSON.stringify(defaults))
    return defaults
  }
}

export const savePersonalizationState = (
  state: PersonalizationState,
  userId?: string
) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(state))
}

export const analyzeBookingHistory = (
  history: HistoricalBookingSummary[]
): BookingHistoryInsights => {
  if (history.length === 0) {
    return {
      totalStays: 0,
      averageNights: 0,
      averageSpend: 0,
      favouritePackage: undefined,
      favouriteRoomType: undefined,
      topAddOns: [],
      loyaltySegment: 'new',
      lastStayDate: undefined,
      seasonalAffinity: { spring: 0, summer: 0, autumn: 0, winter: 0 }
    }
  }

  const totalStays = history.length
  const totalNights = history.reduce((sum, stay) => sum + stay.nights, 0)
  const totalSpend = history.reduce((sum, stay) => sum + stay.spend, 0)

  const packageCounts: Record<string, number> = {}
  const roomCounts: Record<string, number> = {}
  const addOnCounts: Record<string, number> = {}
  const seasonalAffinity: Record<'spring' | 'summer' | 'autumn' | 'winter', number> = {
    spring: 0,
    summer: 0,
    autumn: 0,
    winter: 0
  }

  let lastStayDate = history[0].checkInDate

  history.forEach(stay => {
    packageCounts[stay.packageType] = (packageCounts[stay.packageType] || 0) + 1
    roomCounts[stay.roomType] = (roomCounts[stay.roomType] || 0) + 1
    stay.addOns.forEach(addOn => {
      addOnCounts[addOn] = (addOnCounts[addOn] || 0) + 1
    })

    const stayDate = new Date(stay.checkInDate)
    if (stayDate.toISOString() > new Date(lastStayDate).toISOString()) {
      lastStayDate = stay.checkInDate
    }

    const month = stayDate.getUTCMonth() + 1
    if (month >= 3 && month <= 5) {
      seasonalAffinity.spring += 1
    } else if (month >= 6 && month <= 8) {
      seasonalAffinity.summer += 1
    } else if (month >= 9 && month <= 11) {
      seasonalAffinity.autumn += 1
    } else {
      seasonalAffinity.winter += 1
    }
  })

  const favouritePackage = Object.entries(packageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as PackageType | undefined
  const favouriteRoomType = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as RoomType | undefined
  const topAddOns = Object.entries(addOnCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([addOn]) => addOn)

  const loyaltySegment: BookingHistoryInsights['loyaltySegment'] =
    totalStays >= 6 ? 'champion' : totalStays >= 2 ? 'returning' : 'new'

  return {
    totalStays,
    averageNights: Math.round((totalNights / totalStays) * 10) / 10,
    averageSpend: Math.round(totalSpend / totalStays),
    favouritePackage,
    favouriteRoomType,
    topAddOns,
    loyaltySegment,
    lastStayDate,
    seasonalAffinity
  }
}

interface RecommendationInput {
  preferences: GuestPreferenceProfile;
  insights: BookingHistoryInsights;
  context?: PersonalizationContextInput;
}

export const generateRecommendations = ({
  preferences,
  insights,
  context
}: RecommendationInput): Recommendation[] => {
  const recommendations: Recommendation[] = []

  if (preferences.stayPurpose === 'celebration' || preferences.specialOccasion) {
    recommendations.push({
      id: 'celebration-suite-upgrade',
      title: 'Toast the Occasion in Our Loft Suite',
      description: 'Private check-in, skyline views, and a chilled bottle of champagne on arrival.',
      category: 'room',
      reason: 'You highlighted a celebration and previously enjoyed premium suites.',
      confidence: 0.82,
      actionLabel: 'Preview Loft Suite'
    })
  }

  if (preferences.diningPreferences.includes('local-produce') || insights.favouritePackage === 'half-board') {
    recommendations.push({
      id: 'chef-table',
      title: 'Chef’s Table Tasting Journey',
      description: 'Seven-course seasonal menu featuring Perthshire producers and sommelier pairings.',
      category: 'dining',
      reason: 'Guests who book Half Board and love local produce rate this 4.9/5.',
      confidence: 0.76,
      actionLabel: 'Reserve a Table'
    })
  }

  if (preferences.desiredPerks.includes('spa-access')) {
    recommendations.push({
      id: 'spa-retreat',
      title: 'Highland Wellness Ritual',
      description: 'Thermal suite access, 60-minute massage, and post-treatment herbal elixirs.',
      category: 'service',
      reason: 'You previously booked spa passes—lock in your favourite slot now.',
      confidence: 0.71,
      actionLabel: 'View Spa Availability'
    })
  }

  if ((context?.nights || insights.averageNights) >= 3 && preferences.travelStyle === 'adventure') {
    recommendations.push({
      id: 'river-adventure',
      title: 'River Tay Adventure Pack',
      description: 'Guided paddleboarding plus picnic hamper curated by our kitchen team.',
      category: 'experience',
      reason: 'Longer stays with an adventurous pace lean into outdoor thrills.',
      confidence: 0.69,
      actionLabel: 'Add to itinerary'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'late-checkout',
      title: 'Complimentary Late Checkout Pending Availability',
      description: 'Ease into departure day with a 1 PM checkout window.',
      category: 'service',
      reason: 'We noticed you enjoy slower departures—reserve your slot early.',
      confidence: 0.55,
      actionLabel: 'Request Late Checkout'
    })
  }

  return recommendations
}

interface PackageSuggestionInput {
  preferences: GuestPreferenceProfile;
  insights: BookingHistoryInsights;
  context?: PersonalizationContextInput;
  variant: ExperimentVariant;
}

const calculateStayValue = (baseRate: number, nights: number, package: PackageType) => {
  return (baseRate + PACKAGE_PRICE_ADJUSTMENTS[package]) * nights
}

export const generatePackageSuggestions = ({
  preferences,
  insights,
  context,
  variant
}: PackageSuggestionInput): PackageSuggestion[] => {
  const suggestions: PackageSuggestion[] = []

  const nights = context?.nights || insights.averageNights || 2
  const baseRate = context?.baseRate || 18500
  const currentPackage = context?.packageType || insights.favouritePackage || 'room-only'

  const addSuggestion = (
    suggestion: Omit<PackageSuggestion, 'variant'>
  ) => suggestions.push({ ...suggestion, variant })

  if (
    currentPackage !== 'half-board' &&
    (preferences.diningPreferences.includes('chef-experiences') || insights.favouritePackage === 'half-board')
  ) {
    const currentValue = calculateStayValue(baseRate, nights, currentPackage)
    const targetValue = calculateStayValue(baseRate, nights, 'half-board')
    const anchorPrice = variant === 'A' ? targetValue + 12000 : targetValue + 8000
    const perceivedSavings = anchorPrice - targetValue

    addSuggestion({
      id: 'half-board-upgrade',
      title: 'Upgrade to Highland Half Board',
      description: 'Breakfast feasts and nightly three-course dinners waiting after each adventure.',
      targetPackage: 'half-board',
      anchorPrice,
      currentPrice: targetValue,
      perceivedSavings,
      urgencyMessage:
        variant === 'B'
          ? 'Only 3 dining packages remain for your selected dates.'
          : 'Guests saved an average £' + (perceivedSavings / 100).toFixed(0) + ' last month.',
      badges: ['Chef Curated', 'Best Value'],
      reasons: [
        'Leverages your love for local tasting menus.',
        `Boosts average spend from £${(currentValue / 100).toFixed(0)} to £${(targetValue / 100).toFixed(0)}.`
      ],
      projectedValue: targetValue - currentValue
    })
  }

  if (
    currentPackage === 'room-only' &&
    !preferences.diningPreferences.includes('light-bites') &&
    preferences.pace !== 'packed'
  ) {
    const currentValue = calculateStayValue(baseRate, nights, currentPackage)
    const targetValue = calculateStayValue(baseRate, nights, 'bed-breakfast')
    const anchorPrice = targetValue + (variant === 'A' ? 5000 : 3500)

    addSuggestion({
      id: 'bed-breakfast-offer',
      title: 'Bed & Breakfast Kickstart',
      description: 'Freshly baked pastries, locally roasted coffee, and bespoke breakfast boards.',
      targetPackage: 'bed-breakfast',
      anchorPrice,
      currentPrice: targetValue,
      perceivedSavings: anchorPrice - targetValue,
      urgencyMessage:
        variant === 'B'
          ? 'Morning slots sell out fast—lock breakfast in now.'
          : 'Add breakfast now and save versus walk-up pricing.',
      badges: ['Guest Favourite'],
      reasons: [
        'Pairs with your balanced travel pace for slow Highland mornings.',
        'Returning guests rate the breakfast spread 4.9/5.'
      ],
      projectedValue: targetValue - currentValue
    })
  }

  if (preferences.desiredPerks.includes('late-checkout') && currentPackage !== 'half-board') {
    const upgradeValue = Math.max(1500 * nights, 4000)
    const anchorPrice = upgradeValue + (variant === 'A' ? 2000 : 1500)

    addSuggestion({
      id: 'late-checkout-bundle',
      title: 'Slow Departure Bundle',
      description: '1 PM checkout plus fireside hot chocolates for a gentle goodbye.',
      targetPackage: currentPackage,
      anchorPrice,
      currentPrice: upgradeValue,
      perceivedSavings: anchorPrice - upgradeValue,
      urgencyMessage: variant === 'B' ? 'Limited late checkout slots available.' : 'Secure your slot while availability lasts.',
      badges: ['Guest Comfort'],
      reasons: [
        'You typically request late checkout—bundle and save now.',
        'Keeps your personalised pace without surprise fees at checkout.'
      ],
      projectedValue: upgradeValue
    })
  }

  if (suggestions.length === 0) {
    const upgradeValue = calculateStayValue(baseRate, nights, currentPackage)
    addSuggestion({
      id: 'stay-curation',
      title: 'Curated Stay Check-in Call',
      description: 'Our team fine-tunes your itinerary and unlocks discreet perks before arrival.',
      targetPackage: currentPackage,
      anchorPrice: upgradeValue + 6000,
      currentPrice: upgradeValue + 3000,
      perceivedSavings: 3000,
      urgencyMessage: 'We hold just two planning calls per arrival day—reserve yours now.',
      badges: ['Concierge'],
      reasons: ['Ensures your preferences inform every touchpoint of the stay.'],
      projectedValue: 3000
    })
  }

  return suggestions
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const buildConversionEvent = (
  suggestionId: string,
  variant: ExperimentVariant,
  context?: PersonalizationContextInput,
  valueCaptured?: number
): ConversionEvent => ({
  id: generateId(),
  suggestionId,
  action: 'accepted',
  valueCaptured,
  variant,
  timestamp: new Date().toISOString(),
  context
})
