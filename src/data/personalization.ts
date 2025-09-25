import { PackageType } from '@/types/hotel'
import { BudgetPreference, TravelPurpose } from '@/types/personalization'

export const travelPurposeOptions: { value: TravelPurpose; label: string; description: string }[] = [
  { value: 'leisure', label: 'Leisure escape', description: 'Relaxing break to recharge and explore' },
  { value: 'business', label: 'Business trip', description: 'Work-first stay with productivity in mind' },
  { value: 'celebration', label: 'Celebration', description: 'Marking a special moment or milestone' },
  { value: 'family', label: 'Family adventure', description: 'Travelling with little ones or extended family' }
]

export const stayGoalOptions: { value: string; label: string; helper: string }[] = [
  { value: 'wellness', label: 'Wellness reset', helper: 'Spa rituals, sunrise yoga, slow mornings' },
  { value: 'gastronomy', label: 'Culinary journey', helper: 'Chef tastings, wine pairings, kitchen tours' },
  { value: 'outdoor-adventure', label: 'Outdoor adventure', helper: 'River kayaking, Munro hikes, bike trails' },
  { value: 'slow-travel', label: 'Slow travel', helper: 'Local artisans, galleries, heritage walks' },
  { value: 'remote-work', label: 'Remote work', helper: 'Desk-ready rooms, quiet zones, espresso fuel' }
]

export const experienceInterestOptions: { value: string; label: string }[] = [
  { value: 'distillery', label: 'Distillery tours & tastings' },
  { value: 'river-adventures', label: 'River & loch adventures' },
  { value: 'culinary-classes', label: 'Cooking classes & chef tables' },
  { value: 'wellness-rituals', label: 'Spa & wellness rituals' },
  { value: 'history-culture', label: 'History & culture' },
  { value: 'night-sky', label: 'Night sky & astronomy' }
]

export const roomComfortOptions: { value: string; label: string }[] = [
  { value: 'tub-soak', label: 'Deep soaking tub' },
  { value: 'telescope', label: 'In-room telescope' },
  { value: 'workspace', label: 'Dedicated workspace' },
  { value: 'family-zone', label: 'Family-friendly layout' },
  { value: 'concierge', label: 'Private concierge touch' },
  { value: 'view-premium', label: 'Premium Highland view' }
]

export const budgetPreferenceOptions: { value: BudgetPreference; label: string; tone: string }[] = [
  { value: 'value', label: 'Value seeker', tone: 'Smart savings and bundled perks' },
  { value: 'balanced', label: 'Balanced spender', tone: 'Best mix of comfort and value' },
  { value: 'premium', label: 'Premium indulgence', tone: 'Top-tier touches and exclusivity' }
]

export const packagePsychologyAnchors: Record<PackageType, { anchor: string; framing: string }> = {
  'room-only': {
    anchor: 'Standard nightly rate £185',
    framing: 'Baseline price for comparison before add-ons'
  },
  'bed-breakfast': {
    anchor: 'Continental breakfast £32pp',
    framing: 'Breakfast bundle saves compared to pay-as-you-go'
  },
  'half-board': {
    anchor: 'Three-course dinner £58pp',
    framing: 'Dinner package keeps evenings effortless and curated'
  }
}
