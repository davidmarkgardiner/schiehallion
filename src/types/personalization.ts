// Epic 10: Personalization Engine Domain Types
// Covers SCHH-030 (Guest Preference Learning) and SCHH-031 (Dynamic Package Suggestions)

import { PackageType, RoomType } from '@/types/hotel'

export type ExperimentVariant = 'A' | 'B'

export interface GuestPreferenceProfile {
  stayPurpose: 'leisure' | 'business' | 'celebration' | 'family';
  travelStyle: 'relaxed' | 'adventure' | 'business-ready' | 'luxury';
  pace: 'slow' | 'balanced' | 'packed';
  diningPreferences: string[];
  desiredPerks: string[];
  preferredRoomFeatures: string[];
  upgradeInterest: 'low' | 'medium' | 'high';
  specialOccasion?: string;
}

export interface HistoricalBookingSummary {
  stayId: string;
  checkInDate: string; // ISO date string
  nights: number;
  guests: number;
  roomType: RoomType;
  packageType: PackageType;
  spend: number; // stored in minor currency unit (pence)
  addOns: string[];
  experienceTags: string[];
  satisfactionScore: number; // 0 - 5 scale
  notes?: string;
}

export interface BookingHistoryInsights {
  totalStays: number;
  averageNights: number;
  averageSpend: number;
  favouritePackage?: PackageType;
  favouriteRoomType?: RoomType;
  topAddOns: string[];
  loyaltySegment: 'new' | 'returning' | 'champion';
  lastStayDate?: string;
  seasonalAffinity: Record<'spring' | 'summer' | 'autumn' | 'winter', number>;
}

export interface PersonalizationSettings {
  personalizationEnabled: boolean;
  shareAnalytics: boolean;
  optInForUpsells: boolean;
  optedOutAt?: string;
}

export interface PersonalizationAnalytics {
  packageImpressions: number;
  recommendationImpressions: number;
  conversions: number;
  lastContextKey?: string;
}

export interface ConversionEvent {
  id: string;
  suggestionId: string;
  action: 'accepted' | 'dismissed';
  valueCaptured?: number;
  variant: ExperimentVariant;
  timestamp: string;
  context?: PersonalizationContextInput;
}

export interface PersonalizationState {
  preferences: GuestPreferenceProfile;
  history: HistoricalBookingSummary[];
  settings: PersonalizationSettings;
  conversions: ConversionEvent[];
  analytics: PersonalizationAnalytics;
  experimentVariant: ExperimentVariant;
  lastUpdated: string;
}

export interface PersonalizationContextInput {
  checkInDate?: string | null;
  nights?: number;
  guests?: number;
  packageType?: PackageType;
  baseRate?: number;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'room' | 'dining' | 'experience' | 'service';
  reason: string;
  confidence: number; // 0-1 score
  actionLabel?: string;
}

export interface PackageSuggestion {
  id: string;
  title: string;
  description: string;
  targetPackage: PackageType;
  anchorPrice: number;
  currentPrice: number;
  perceivedSavings: number;
  urgencyMessage?: string;
  badges: string[];
  reasons: string[];
  projectedValue: number;
  variant: ExperimentVariant;
}
