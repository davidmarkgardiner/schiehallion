import {
  ABTestVariant,
  BookingHistoryEntry,
  ConversionEvent,
  ConversionMetrics,
  GuestPreferenceProfile,
  HistoryInsights,
  PackageSuggestion,
  PersonalizationSettings,
  Recommendation,
  SuggestionContext
} from '@/types/personalization'
import { PackageType, RoomType } from '@/types/hotel'
import { packagePsychologyAnchors } from '@/data/personalization'

const uniqueArray = (values: string[]): string[] => Array.from(new Set(values.filter(Boolean)))

const buildDefaultProfile = (overrides?: Partial<GuestPreferenceProfile>): GuestPreferenceProfile => {
  const defaults: GuestPreferenceProfile = {
    stayGoals: [],
    experienceInterests: [],
    roomComforts: [],
    dietaryPreferences: [],
    accessibilityNeeds: [],
    specialOccasions: [],
    travelPurpose: 'leisure',
    budgetPreference: 'balanced',
    marketingOptIn: true,
    personalizationOptIn: true,
    preferredCommunication: 'email',
    lastCaptured: new Date().toISOString()
  }

  if (!overrides) {
    return defaults
  }

  return {
    ...defaults,
    ...overrides,
    stayGoals: uniqueArray(overrides.stayGoals ?? defaults.stayGoals),
    experienceInterests: uniqueArray(overrides.experienceInterests ?? defaults.experienceInterests),
    roomComforts: uniqueArray(overrides.roomComforts ?? defaults.roomComforts),
    dietaryPreferences: uniqueArray(overrides.dietaryPreferences ?? defaults.dietaryPreferences),
    accessibilityNeeds: uniqueArray(overrides.accessibilityNeeds ?? defaults.accessibilityNeeds),
    specialOccasions: uniqueArray(overrides.specialOccasions ?? defaults.specialOccasions),
    travelPurpose: overrides.travelPurpose ?? defaults.travelPurpose,
    budgetPreference: overrides.budgetPreference ?? defaults.budgetPreference,
    marketingOptIn: overrides.marketingOptIn ?? defaults.marketingOptIn,
    personalizationOptIn: overrides.personalizationOptIn ?? defaults.personalizationOptIn,
    preferredCommunication: overrides.preferredCommunication ?? defaults.preferredCommunication,
    lastCaptured: overrides.lastCaptured ?? defaults.lastCaptured
  }
}

const buildDefaultSettings = (overrides?: Partial<PersonalizationSettings>): PersonalizationSettings => ({
  allowPersonalization: overrides?.allowPersonalization ?? true,
  allowMarketing: overrides?.allowMarketing ?? true,
  allowDataProcessing: overrides?.allowDataProcessing ?? true,
  optOutReason: overrides?.optOutReason,
  lastUpdated: overrides?.lastUpdated || new Date().toISOString()
})

const mergePreferences = (
  current: GuestPreferenceProfile,
  updates: Partial<GuestPreferenceProfile>
): GuestPreferenceProfile => {
  const merged = {
    ...current,
    ...updates,
    stayGoals: uniqueArray([...(current.stayGoals || []), ...(updates.stayGoals || [])]),
    experienceInterests: uniqueArray([...(current.experienceInterests || []), ...(updates.experienceInterests || [])]),
    roomComforts: uniqueArray([...(current.roomComforts || []), ...(updates.roomComforts || [])]),
    dietaryPreferences: uniqueArray([...(current.dietaryPreferences || []), ...(updates.dietaryPreferences || [])]),
    accessibilityNeeds: uniqueArray([...(current.accessibilityNeeds || []), ...(updates.accessibilityNeeds || [])]),
    specialOccasions: uniqueArray([...(current.specialOccasions || []), ...(updates.specialOccasions || [])]),
    lastCaptured: new Date().toISOString()
  }

  if (typeof updates.marketingOptIn === 'boolean') {
    merged.marketingOptIn = updates.marketingOptIn
  }

  if (typeof updates.personalizationOptIn === 'boolean') {
    merged.personalizationOptIn = updates.personalizationOptIn
  }

  if (updates.preferredCommunication) {
    merged.preferredCommunication = updates.preferredCommunication
  }

  if (updates.travelPurpose) {
    merged.travelPurpose = updates.travelPurpose
  }

  if (updates.budgetPreference) {
    merged.budgetPreference = updates.budgetPreference
  }

  return merged
}

const analyseBookingHistory = (history: BookingHistoryEntry[]): HistoryInsights => {
  if (!history.length) {
    return {
      totalStays: 0,
      averageNights: 0,
      topRoomTypes: [],
      favouritePackages: [],
      totalSpend: 0,
      loyaltyScore: 0,
      addOnAffinity: []
    }
  }

  const totalStays = history.length
  const totalNights = history.reduce((sum, stay) => sum + stay.nights, 0)
  const totalSpend = history.reduce((sum, stay) => sum + stay.spend, 0)

  const roomTypeCount = history.reduce<Record<string, number>>((acc, stay) => {
    acc[stay.roomType] = (acc[stay.roomType] || 0) + 1
    return acc
  }, {})

  const packageCount = history.reduce<Record<PackageType, number>>((acc, stay) => {
    acc[stay.packageType] = (acc[stay.packageType] || 0) + 1
    return acc
  }, {} as Record<PackageType, number>)

  const addOnFrequency = history.reduce<Record<string, number>>((acc, stay) => {
    stay.addOns.forEach(addOn => {
      acc[addOn] = (acc[addOn] || 0) + 1
    })
    return acc
  }, {})

  const topRoomTypes = Object.entries(roomTypeCount)
    .sort((a, b) => b[1] - a[1])
    .map(([room]) => room as RoomType)

  const favouritePackages = Object.entries(packageCount)
    .sort((a, b) => b[1] - a[1])
    .map(([pkg]) => pkg as PackageType)

  const addOnAffinity = Object.entries(addOnFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(([addOn]) => addOn)

  const sortedHistory = [...history].sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime())
  const lastStayDate = sortedHistory[0]?.checkInDate
  let staySpacingDays: number | undefined

  if (sortedHistory.length > 1) {
    const lastDate = new Date(sortedHistory[0].checkInDate)
    const previousDate = new Date(sortedHistory[1].checkInDate)
    staySpacingDays = Math.round((lastDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  const loyaltyScore = Math.min(1, (totalStays * 0.15) + (totalNights * 0.02))

  return {
    totalStays,
    averageNights: Math.round((totalNights / totalStays) * 10) / 10,
    topRoomTypes,
    favouritePackages,
    totalSpend,
    lastStayDate,
    loyaltyScore,
    addOnAffinity,
    staySpacingDays
  }
}

const generateRecommendations = (
  profile: GuestPreferenceProfile,
  history: BookingHistoryEntry[],
  insights: HistoryInsights,
  context: SuggestionContext,
  limit = 4
): Recommendation[] => {
  if (!profile.personalizationOptIn) {
    return []
  }

  const recommendations: Recommendation[] = []

  if (profile.stayGoals.includes('wellness') || profile.experienceInterests.includes('wellness-rituals')) {
    recommendations.push({
      id: 'wellness-suite',
      title: 'Reserve a wellness ritual',
      description: 'Pair your stay with a Highland botanicals massage and guided breathwork session.',
      tags: ['wellness', 'spa'],
      confidence: 0.85,
      category: 'wellness',
      supportingInsight: 'Wellness goals selected'
    })
  }

  if (profile.experienceInterests.includes('distillery') || insights.addOnAffinity.includes('distillery-tour')) {
    recommendations.push({
      id: 'distillery-evening',
      title: 'Dewar\'s candlelit tasting',
      description: 'Exclusive after-hours tasting with our partner distillery, complete with chauffeur.',
      tags: ['spirits', 'evening'],
      confidence: 0.78,
      category: 'experience',
      supportingInsight: 'Previous interest in distillery experiences'
    })
  }

  if (context.stayLength >= 3 || insights.averageNights >= 3) {
    recommendations.push({
      id: 'third-night-upgrade',
      title: 'Complimentary late checkout',
      description: 'Extend your Highlands escape with a 2pm checkout and hot tub slot on departure day.',
      tags: ['comfort', 'late-checkout'],
      confidence: 0.72,
      category: 'service',
      supportingInsight: 'Longer stay pattern detected'
    })
  }

  if (profile.roomComforts.includes('telescope') || profile.specialOccasions.length > 0) {
    recommendations.push({
      id: 'loft-upgrade',
      title: 'Upgrade to the Schiehallion Loft',
      description: 'Panoramic loft suite with in-room telescope, handcrafted welcome cocktails, and private concierge.',
      tags: ['upgrade', 'romance'],
      confidence: context.budgetSensitivity === 'premium' ? 0.88 : 0.66,
      category: 'room',
      supportingInsight: 'Interest in premium comforts'
    })
  }

  if (profile.travelPurpose === 'family') {
    recommendations.push({
      id: 'family-explorer-pack',
      title: 'Family explorer bundle',
      description: 'Adventure maps, nature scavenger hunts, and kids\' evening hot chocolate ritual.',
      tags: ['family', 'outdoors'],
      confidence: 0.8,
      category: 'experience',
      supportingInsight: 'Family travel purpose selected'
    })
  }

  if (profile.travelPurpose === 'business') {
    recommendations.push({
      id: 'business-lounge-pass',
      title: 'Productivity lounge access',
      description: 'Guaranteed quiet workspace, espresso bar, and same-day pressing on arrival.',
      tags: ['business', 'workspace'],
      confidence: 0.74,
      category: 'service',
      supportingInsight: 'Business trip preference captured'
    })
  }

  return recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit)
}

const createSuggestionContext = (partial?: Partial<SuggestionContext>): SuggestionContext => ({
  stayLength: partial?.stayLength ?? 2,
  travelPurpose: partial?.travelPurpose ?? 'leisure',
  companions: partial?.companions ?? 2,
  budgetSensitivity: partial?.budgetSensitivity ?? 'balanced',
  stayOccasion: partial?.stayOccasion,
  isReturningGuest: partial?.isReturningGuest ?? false,
  checkInMonth: partial?.checkInMonth,
  wantsLateCheckout: partial?.wantsLateCheckout ?? false
})

const generatePackageSuggestions = (
  context: SuggestionContext,
  profile: GuestPreferenceProfile,
  insights: HistoryInsights,
  variant: ABTestVariant
): PackageSuggestion[] => {
  if (!profile.personalizationOptIn) {
    return []
  }

  const suggestions: PackageSuggestion[] = []

  const anchors = packagePsychologyAnchors

  const addSuggestion = (
    packageType: PackageType,
    headline: string,
    subheading: string,
    valueMessage: string,
    confidence: number,
    badges: string[],
    urgencyMessage?: string
  ) => {
    suggestions.push({
      id: `${packageType}-${variant}`,
      packageType,
      headline,
      subheading,
      anchorPrice: anchors[packageType].anchor,
      priceAdjustment: variant === 'value-focus' ? 'Bundle & save' : 'Curated experience',
      valueMessage,
      urgencyMessage,
      confidence,
      variant,
      badges
    })
  }

  if (context.stayLength >= 2 && (variant === 'value-focus' || profile.budgetPreference !== 'premium')) {
    addSuggestion(
      'bed-breakfast',
      'Wake up to Highland breakfasts',
      'Fresh pastries, Glen Lyon coffee, and a reserved table each morning.',
      'Save £18 per guest across your stay versus daily ordering.',
      0.82,
      ['Guest favourite', 'Best value'],
      context.isReturningGuest ? 'Loyalty bonus: welcome pastries included' : undefined
    )
  }

  if (
    profile.experienceInterests.includes('culinary-classes') ||
    profile.stayGoals.includes('gastronomy') ||
    variant === 'experience-focus'
  ) {
    addSuggestion(
      'half-board',
      'Chef\'s table evenings',
      'Tasting menu, sommelier pairings, and reserved dining window.',
      'Secure the signature menu for £34 less than booking courses separately.',
      0.88,
      ['Limited release', 'Chef recommended'],
      insights.loyaltyScore > 0.4 ? 'Priority seating held until 48h before arrival' : undefined
    )
  }

  if (profile.travelPurpose === 'business' && context.stayLength === 1) {
    addSuggestion(
      'room-only',
      'Keep it streamlined',
      'Flexible check-in/out with productivity lounge access included.',
      'Room-only keeps things expensable while still unlocking perks.',
      0.7,
      ['Business ready']
    )
  }

  if (profile.travelPurpose === 'celebration' || profile.specialOccasions.length > 0) {
    addSuggestion(
      'half-board',
      'Celebration dinner for two',
      'Champagne arrival, dessert trio, and keepsake photo by the fireside.',
      'Upgrade this stay for an extra £54/night and unlock signature touches.',
      0.84,
      ['Romance pick'],
      'Limited to five celebration tables nightly'
    )
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

const assignVariant = (userId?: string | null, existing?: ABTestVariant): ABTestVariant => {
  if (existing) return existing
  if (userId) {
    const hash = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return hash % 2 === 0 ? 'value-focus' : 'experience-focus'
  }
  return Math.random() > 0.5 ? 'value-focus' : 'experience-focus'
}

const recordConversion = (events: ConversionEvent[], event: ConversionEvent): ConversionEvent[] => {
  return [...events, event]
}

const calculateConversionMetrics = (events: ConversionEvent[]): ConversionMetrics => {
  if (!events.length) {
    return {
      totalEvents: 0,
      accepted: 0,
      viewed: 0,
      interacted: 0,
      acceptanceRate: 0
    }
  }

  const accepted = events.filter(event => event.type === 'accepted').length
  const viewed = events.filter(event => event.type === 'view').length
  const interacted = events.filter(event => event.type === 'interaction').length
  const totalEvents = events.length

  return {
    totalEvents,
    accepted,
    viewed,
    interacted,
    acceptanceRate: accepted ? Math.round((accepted / totalEvents) * 100) / 100 : 0,
    lastInteraction: Math.max(...events.map(event => event.timestamp))
  }
}

export const PersonalizationService = {
  getDefaultProfile: buildDefaultProfile,
  getDefaultSettings: buildDefaultSettings,
  mergePreferences,
  analyseBookingHistory,
  generateRecommendations,
  createSuggestionContext,
  generatePackageSuggestions,
  assignVariant,
  recordConversion,
  calculateConversionMetrics
}
