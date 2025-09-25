'use client'

// Hook orchestrating the personalization engine logic for Epic 10

import { useEffect, useMemo, useState } from 'react'
import {
  BookingHistoryInsights,
  ConversionEvent,
  GuestPreferenceProfile,
  PackageSuggestion,
  PersonalizationAnalytics,
  PersonalizationContextInput,
  PersonalizationSettings,
  Recommendation
} from '@/types/personalization'
import {
  analyzeBookingHistory,
  buildConversionEvent,
  generatePackageSuggestions,
  generateRecommendations,
  getDefaultPersonalizationState,
  loadPersonalizationState,
  savePersonalizationState
} from '@/services/personalizationService'

interface UsePersonalizationEngineResult {
  loading: boolean
  preferences: GuestPreferenceProfile
  updatePreferences: (updates: Partial<GuestPreferenceProfile>) => void
  privacySettings: PersonalizationSettings
  updatePrivacySettings: (updates: Partial<PersonalizationSettings>) => void
  toggleOptOut: (enabled: boolean) => void
  historyInsights: BookingHistoryInsights
  recommendations: Recommendation[]
  packageSuggestions: PackageSuggestion[]
  analytics: PersonalizationAnalytics
  conversions: ConversionEvent[]
  experimentVariant: 'A' | 'B'
  recordConversion: (payload: {
    suggestionId: string
    valueCaptured?: number
    context?: PersonalizationContextInput
  }) => void
  resetPersonalization: () => void
}

export const usePersonalizationEngine = (
  userId?: string,
  stayContext?: PersonalizationContextInput
): UsePersonalizationEngineResult => {
  const [state, setState] = useState(() => getDefaultPersonalizationState())
  const [loading, setLoading] = useState(true)

  const stayContextKey = useMemo(
    () => JSON.stringify(stayContext || {}),
    [stayContext]
  )

  useEffect(() => {
    const loaded = loadPersonalizationState(userId)
    setState(loaded)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (!loading) {
      savePersonalizationState(state, userId)
    }
  }, [state, userId, loading])

  const historyInsights = useMemo(
    () => analyzeBookingHistory(state.history),
    [state.history]
  )

  const recommendations = useMemo(() => {
    if (!state.settings.personalizationEnabled) {
      return []
    }

    return generateRecommendations({
      preferences: state.preferences,
      insights: historyInsights,
      context: stayContext
    })
  }, [historyInsights, state.preferences, state.settings.personalizationEnabled, stayContextKey])

  const packageSuggestions = useMemo(() => {
    if (!state.settings.personalizationEnabled || !state.settings.optInForUpsells) {
      return []
    }

    return generatePackageSuggestions({
      preferences: state.preferences,
      insights: historyInsights,
      context: stayContext,
      variant: state.experimentVariant
    })
  }, [historyInsights, state.experimentVariant, state.preferences, state.settings, stayContextKey, stayContext])

  useEffect(() => {
    if (!state.settings.personalizationEnabled) return

    if (state.analytics.lastContextKey === stayContextKey) {
      return
    }

    setState(prev => ({
      ...prev,
      analytics: {
        packageImpressions: prev.analytics.packageImpressions + packageSuggestions.length,
        recommendationImpressions: prev.analytics.recommendationImpressions + recommendations.length,
        conversions: prev.analytics.conversions,
        lastContextKey: stayContextKey
      }
    }))
  }, [packageSuggestions.length, recommendations.length, stayContextKey, state.analytics.lastContextKey, state.settings.personalizationEnabled])

  const updatePreferences = (updates: Partial<GuestPreferenceProfile>) => {
    setState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates },
      lastUpdated: new Date().toISOString()
    }))
  }

  const updatePrivacySettings = (updates: Partial<PersonalizationSettings>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
        optedOutAt:
          updates.personalizationEnabled === false
            ? new Date().toISOString()
            : updates.personalizationEnabled === true
            ? undefined
            : prev.settings.optedOutAt
      },
      lastUpdated: new Date().toISOString()
    }))
  }

  const toggleOptOut = (enabled: boolean) => {
    updatePrivacySettings({ personalizationEnabled: enabled })
  }

  const recordConversion: UsePersonalizationEngineResult['recordConversion'] = ({
    suggestionId,
    valueCaptured,
    context
  }) => {
    setState(prev => {
      const event = buildConversionEvent(
        suggestionId,
        prev.experimentVariant,
        context,
        valueCaptured
      )

      return {
        ...prev,
        conversions: [...prev.conversions, event],
        analytics: {
          ...prev.analytics,
          conversions: prev.analytics.conversions + 1
        },
        lastUpdated: new Date().toISOString()
      }
    })
  }

  const resetPersonalization = () => {
    const fresh = getDefaultPersonalizationState()
    setState(fresh)
    setLoading(false)
  }

  return {
    loading,
    preferences: state.preferences,
    updatePreferences,
    privacySettings: state.settings,
    updatePrivacySettings,
    toggleOptOut,
    historyInsights,
    recommendations,
    packageSuggestions,
    analytics: state.analytics,
    conversions: state.conversions,
    experimentVariant: state.experimentVariant,
    recordConversion,
    resetPersonalization
  }
}

export default usePersonalizationEngine
