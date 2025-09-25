'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PersonalizationService } from '@/services/personalizationService'
import {
  ABTestVariant,
  BookingHistoryEntry,
  ConversionEvent,
  ConversionEventType,
  ConversionMetrics,
  GuestPreferenceProfile,
  HistoryInsights,
  PackageSuggestion,
  PersonalizationSettings,
  Recommendation,
  SuggestionContext
} from '@/types/personalization'

interface UsePersonalizationOptions {
  userId?: string | null
  context?: Partial<SuggestionContext>
  initialPreferences?: Partial<GuestPreferenceProfile>
  initialHistory?: BookingHistoryEntry[]
}

interface RecordConversionArgs {
  suggestionId: string
  type: ConversionEventType
  metadata?: Record<string, unknown>
}

interface UsePersonalizationResult {
  preferences: GuestPreferenceProfile
  settings: PersonalizationSettings
  history: BookingHistoryEntry[]
  historyInsights: HistoryInsights
  recommendations: Recommendation[]
  packageSuggestions: PackageSuggestion[]
  variant: ABTestVariant
  conversions: ConversionEvent[]
  conversionMetrics: ConversionMetrics
  context: SuggestionContext
  hydrated: boolean
  updatePreferences: (updates: Partial<GuestPreferenceProfile>) => void
  updateSettings: (updates: Partial<PersonalizationSettings>) => void
  ingestHistory: (entries: BookingHistoryEntry[], replace?: boolean) => void
  setContext: (updates: Partial<SuggestionContext>) => void
  recordConversion: (args: RecordConversionArgs) => void
  reset: () => void
}

export const usePersonalization = (options: UsePersonalizationOptions = {}): UsePersonalizationResult => {
  const storageKey = options.userId ? `schh-personalization::${options.userId}` : 'schh-personalization::guest'

  const [preferences, setPreferences] = useState<GuestPreferenceProfile>(() =>
    PersonalizationService.getDefaultProfile(options.initialPreferences)
  )
  const [settings, setSettings] = useState<PersonalizationSettings>(() =>
    PersonalizationService.getDefaultSettings({
      allowMarketing: options.initialPreferences?.marketingOptIn,
      allowPersonalization: options.initialPreferences?.personalizationOptIn
    })
  )
  const [history, setHistory] = useState<BookingHistoryEntry[]>(options.initialHistory || [])
  const [variant, setVariant] = useState<ABTestVariant>('value-focus')
  const [conversions, setConversions] = useState<ConversionEvent[]>([])
  const [context, setContextState] = useState<SuggestionContext>(() =>
    PersonalizationService.createSuggestionContext(options.context)
  )
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || hydrated) {
      return
    }

    try {
      const stored = window.localStorage.getItem(storageKey)

      if (stored) {
        const parsed = JSON.parse(stored)

        if (parsed.preferences) {
          setPreferences(PersonalizationService.getDefaultProfile(parsed.preferences))
        }

        if (parsed.settings) {
          setSettings(PersonalizationService.getDefaultSettings(parsed.settings))
        }

        if (Array.isArray(parsed.history)) {
          setHistory(parsed.history)
        }

        if (Array.isArray(parsed.conversions)) {
          setConversions(parsed.conversions)
        }

        if (parsed.variant) {
          setVariant(parsed.variant as ABTestVariant)
        } else {
          setVariant(current => PersonalizationService.assignVariant(options.userId, current))
        }
      } else {
        setVariant(current => PersonalizationService.assignVariant(options.userId, current))
      }
    } catch (error) {
      console.warn('Unable to hydrate personalization state', error)
    } finally {
      setHydrated(true)
    }
  }, [hydrated, options.userId, storageKey])

  useEffect(() => {
    if (!hydrated || typeof window === 'undefined') {
      return
    }

    const payload = JSON.stringify({
      preferences,
      settings,
      history,
      conversions,
      variant
    })

    window.localStorage.setItem(storageKey, payload)
  }, [preferences, settings, history, conversions, variant, hydrated, storageKey])

  useEffect(() => {
    if (!hydrated || !options.initialPreferences) {
      return
    }

    const initialPreferences = options.initialPreferences

    setPreferences(prev => PersonalizationService.mergePreferences(prev, initialPreferences))

    if (typeof initialPreferences.marketingOptIn === 'boolean') {
      const allowMarketing = initialPreferences.marketingOptIn
      setSettings(prev => ({
        ...prev,
        allowMarketing
      }))
    }

    if (typeof initialPreferences.personalizationOptIn === 'boolean') {
      const allowPersonalization = initialPreferences.personalizationOptIn
      setSettings(prev => ({
        ...prev,
        allowPersonalization
      }))
    }
  }, [hydrated, options.initialPreferences])

  useEffect(() => {
    if (!options.initialHistory || !options.initialHistory.length) {
      return
    }

    setHistory(prev => {
      const existingIds = new Set(prev.map(entry => entry.bookingId))
      const merged = [...prev]
      options.initialHistory!.forEach(entry => {
        if (!existingIds.has(entry.bookingId)) {
          merged.push(entry)
        }
      })
      return merged
    })
  }, [options.initialHistory])

  useEffect(() => {
    if (!options.context) {
      return
    }

    setContextState(prev =>
      PersonalizationService.createSuggestionContext({
        ...prev,
        ...options.context
      })
    )
  }, [options.context])

  const historyInsights = useMemo<HistoryInsights>(
    () => PersonalizationService.analyseBookingHistory(history),
    [history]
  )

  const recommendations = useMemo<Recommendation[]>(() => {
    if (!settings.allowPersonalization) {
      return []
    }

    return PersonalizationService.generateRecommendations(
      preferences,
      history,
      historyInsights,
      context
    )
  }, [context, history, historyInsights, preferences, settings.allowPersonalization])

  const packageSuggestions = useMemo<PackageSuggestion[]>(() => {
    if (!settings.allowPersonalization) {
      return []
    }

    return PersonalizationService.generatePackageSuggestions(
      context,
      preferences,
      historyInsights,
      variant
    )
  }, [context, historyInsights, preferences, settings.allowPersonalization, variant])

  const conversionMetrics = useMemo<ConversionMetrics>(
    () => PersonalizationService.calculateConversionMetrics(conversions),
    [conversions]
  )

  const updatePreferences = useCallback((updates: Partial<GuestPreferenceProfile>) => {
    setPreferences(prev => PersonalizationService.mergePreferences(prev, updates))
  }, [])

  const updateSettings = useCallback((updates: Partial<PersonalizationSettings>) => {
    if (typeof updates.allowPersonalization === 'boolean') {
      const allowPersonalization = updates.allowPersonalization
      setPreferences(prev => ({
        ...prev,
        personalizationOptIn: allowPersonalization
      }))
    }

    if (typeof updates.allowMarketing === 'boolean') {
      const allowMarketing = updates.allowMarketing
      setPreferences(prev => ({
        ...prev,
        marketingOptIn: allowMarketing
      }))
    }

    setSettings(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString()
    }))
  }, [])

  const ingestHistory = useCallback((entries: BookingHistoryEntry[], replace: boolean = false) => {
    setHistory(prev => {
      if (replace) {
        return entries
      }

      const existingIds = new Set(prev.map(entry => entry.bookingId))
      const merged = [...prev]
      entries.forEach(entry => {
        if (!existingIds.has(entry.bookingId)) {
          merged.push(entry)
        }
      })
      return merged
    })
  }, [])

  const setContext = useCallback((updates: Partial<SuggestionContext>) => {
    setContextState(prev => PersonalizationService.createSuggestionContext({ ...prev, ...updates }))
  }, [])

  const recordConversion = useCallback(
    ({ suggestionId, type, metadata }: RecordConversionArgs) => {
      if (!settings.allowPersonalization) {
        return
      }

      const conversion: ConversionEvent = {
        id: `${suggestionId}-${Date.now()}`,
        suggestionId,
        type,
        timestamp: Date.now(),
        metadata
      }

      setConversions(prev => PersonalizationService.recordConversion(prev, conversion))
    },
    [settings.allowPersonalization]
  )

  const reset = useCallback(() => {
    setPreferences(PersonalizationService.getDefaultProfile())
    setSettings(PersonalizationService.getDefaultSettings())
    setHistory([])
    setConversions([])
    setContextState(PersonalizationService.createSuggestionContext(options.context))
    setVariant(PersonalizationService.assignVariant(options.userId))

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey)
    }
  }, [options.context, options.userId, storageKey])

  return {
    preferences,
    settings,
    history,
    historyInsights,
    recommendations,
    packageSuggestions,
    variant,
    conversions,
    conversionMetrics,
    context,
    hydrated,
    updatePreferences,
    updateSettings,
    ingestHistory,
    setContext,
    recordConversion,
    reset
  }
}
