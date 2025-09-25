'use client'

import { useMemo, useState } from 'react'
import type { GuestFormData, PackageType } from '@/types/hotel'
import type {
  BookingHistoryEntry,
  GuestPreferenceProfile,
  PackageSuggestion,
  SuggestionContext
} from '@/types/personalization'
import { PersonalizationService } from '@/services/personalizationService'
import { usePersonalization } from '@/hooks/usePersonalization'

interface PersonalizationPanelProps {
  userId?: string | null
  suggestionContext: SuggestionContext
  selectedPackage: PackageType
  onSelectPackage: (packageType: PackageType) => void
  guestPreferences?: GuestFormData['preferences']
  accountPreferences?: GuestPreferenceProfile
  bookingHistory?: BookingHistoryEntry[]
}

const mapGuestPreferencesToProfile = (
  preferences?: GuestFormData['preferences'],
  accountPreferences?: GuestPreferenceProfile
) => {
  const baseProfile = accountPreferences
    ? PersonalizationService.getDefaultProfile(accountPreferences)
    : PersonalizationService.getDefaultProfile()

  if (!preferences) {
    return baseProfile
  }

  const fromForm: Partial<GuestPreferenceProfile> = {
    stayGoals: preferences.stayGoals || [],
    experienceInterests: preferences.experienceInterests || [],
    roomComforts: preferences.roomComforts || [],
    dietaryPreferences: preferences.dietaryRequirements || [],
    accessibilityNeeds: preferences.accessibilityNeeds || [],
    specialOccasions: preferences.stayOccasion ? [preferences.stayOccasion] : [],
    marketingOptIn: preferences.marketingOptIn,
    personalizationOptIn: preferences.personalizationOptIn,
    travelPurpose: preferences.tripPurpose,
    budgetPreference: preferences.budgetPreference,
    preferredCommunication: preferences.communicationPreference
  }

  return PersonalizationService.mergePreferences(baseProfile, fromForm)
}

export function PersonalizationPanel({
  userId,
  suggestionContext,
  selectedPackage,
  onSelectPackage,
  guestPreferences,
  accountPreferences,
  bookingHistory
}: PersonalizationPanelProps) {
  const initialProfile = useMemo(
    () => mapGuestPreferencesToProfile(guestPreferences, accountPreferences),
    [accountPreferences, guestPreferences]
  )

  const {
    preferences,
    settings,
    recommendations,
    packageSuggestions,
    historyInsights,
    conversionMetrics,
    updateSettings,
    recordConversion,
    variant,
    hydrated
  } = usePersonalization({
    userId,
    context: suggestionContext,
    initialPreferences: initialProfile,
    initialHistory: bookingHistory
  })

  const [showUpgrades, setShowUpgrades] = useState(false)

  const handleApplySuggestion = (suggestion: PackageSuggestion) => {
    onSelectPackage(suggestion.packageType)
    recordConversion({
      suggestionId: suggestion.id,
      type: 'accepted',
      metadata: { packageType: suggestion.packageType }
    })
  }

  const handleToggleSuggestions = () => {
    setShowUpgrades(prev => {
      const next = !prev
      recordConversion({
        suggestionId: 'package-suggestions',
        type: 'interaction',
        metadata: { open: next }
      })
      if (!prev && packageSuggestions.length) {
        recordConversion({
          suggestionId: 'package-suggestions',
          type: 'view',
          metadata: { count: packageSuggestions.length }
        })
      }
      return next
    })
  }

  const insightCards = [
    {
      label: 'Total stays',
      value: historyInsights.totalStays || '—'
    },
    {
      label: 'Avg nights',
      value: historyInsights.averageNights || '—'
    },
    {
      label: 'Loyalty score',
      value: historyInsights.loyaltyScore ? `${Math.round(historyInsights.loyaltyScore * 100)}%` : '—'
    }
  ]

  return (
    <aside className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Personalised journey</h3>
          <p className="text-sm text-slate-400">
            Smart recommendations learn from your captured preferences and booking context.
          </p>
        </div>
        <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          {variant === 'value-focus' ? 'Value experiment' : 'Experience experiment'}
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => updateSettings({ allowPersonalization: !settings.allowPersonalization })}
            className={`relative h-6 w-10 rounded-full transition ${
              settings.allowPersonalization ? 'bg-emerald-400/80' : 'bg-white/10'
            }`}
            aria-pressed={settings.allowPersonalization}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                settings.allowPersonalization ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
          <div>
            <p className="text-sm font-medium text-white">Personalisation {settings.allowPersonalization ? 'enabled' : 'paused'}</p>
            <p className="text-xs text-slate-400">
              {settings.allowPersonalization
                ? 'We use your preferences to surface packages, upgrades, and experiences that match your stay goals.'
                : 'Only essential booking details are stored. Turn this back on at any time to regain tailored insights.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Captured signals</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {preferences.stayGoals.map(goal => (
            <span key={`goal-${goal}`} className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-emerald-200">
              {goal.replace('-', ' ')}
            </span>
          ))}
          {preferences.experienceInterests.map(experience => (
            <span key={`exp-${experience}`} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-slate-300">
              {experience.replace('-', ' ')}
            </span>
          ))}
          {preferences.roomComforts.map(comfort => (
            <span key={`comfort-${comfort}`} className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-slate-300">
              {comfort.replace('-', ' ')}
            </span>
          ))}
          {preferences.specialOccasions.map(occasion => (
            <span key={`occasion-${occasion}`} className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-amber-200">
              {occasion}
            </span>
          ))}
          {!preferences.stayGoals.length && !preferences.experienceInterests.length && (
            <span className="text-xs text-slate-500">Complete the preferences step to unlock more tailored insights.</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        {insightCards.map(card => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-black/30 p-3">
            <p className="text-lg font-semibold text-white">{card.value}</p>
            <p className="text-slate-400">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Recommended for this stay</h4>
        {settings.allowPersonalization ? (
          recommendations.length ? (
            <ul className="space-y-3 text-sm">
              {recommendations.map(recommendation => (
                <li
                  key={recommendation.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{recommendation.title}</p>
                      <p className="text-xs text-slate-400">{recommendation.description}</p>
                    </div>
                    <span className="text-xs text-emerald-300">
                      {(recommendation.confidence * 100).toFixed(0)}% match
                    </span>
                  </div>
                  {recommendation.supportingInsight && (
                    <p className="mt-2 text-xs text-slate-500">{recommendation.supportingInsight}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              We are learning from your preferences. Pick a few stay goals to unlock smart recommendations.
            </p>
          )
        ) : (
          <p className="text-xs text-slate-500">Enable personalisation to receive tailored recommendations.</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Upgrade ideas</h4>
          <button
            type="button"
            onClick={handleToggleSuggestions}
            className="text-xs font-medium text-emerald-300 hover:text-emerald-200"
          >
            {showUpgrades ? 'Hide suggestions' : 'Show suggestions'}
          </button>
        </div>

        {showUpgrades && settings.allowPersonalization && (
          <div className="space-y-3">
            {packageSuggestions.length ? (
              packageSuggestions.map((suggestion) => {
                const isActive = suggestion.packageType === selectedPackage
                return (
                  <div
                    key={suggestion.id}
                    className={`rounded-2xl border p-4 transition ${
                      isActive
                        ? 'border-emerald-400/60 bg-emerald-400/10 shadow-lg shadow-emerald-400/10'
                        : 'border-white/10 bg-black/30 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{suggestion.headline}</p>
                        <p className="text-xs text-slate-400">{suggestion.subheading}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-xs text-slate-400">
                        <span>{suggestion.anchorPrice}</span>
                        <span className="font-medium text-emerald-300">{suggestion.valueMessage}</span>
                      </div>
                    </div>
                    {suggestion.urgencyMessage && (
                      <p className="mt-2 text-xs text-amber-300">{suggestion.urgencyMessage}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-400">
                      {suggestion.badges.map(badge => (
                        <span key={`${suggestion.id}-${badge}`} className="rounded-full border border-white/15 px-2 py-1">
                          {badge}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4 text-xs">
                      <span className="text-slate-500">Confidence {Math.round(suggestion.confidence * 100)}%</span>
                      <button
                        type="button"
                        onClick={() => handleApplySuggestion(suggestion)}
                        className="rounded-full border border-emerald-400 px-4 py-2 font-medium text-emerald-200 hover:bg-emerald-400/10"
                      >
                        {isActive ? 'Already selected' : 'Apply upgrade'}
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-slate-500">No upgrade suggestions available yet for this stay profile.</p>
            )}
          </div>
        )}

        {showUpgrades && !settings.allowPersonalization && (
          <p className="text-xs text-slate-500">Enable personalisation to activate upgrade suggestions.</p>
        )}
      </div>

      {conversionMetrics.totalEvents > 0 && (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-slate-400">
          <p className="font-medium text-slate-300">Experiment telemetry</p>
          <p className="mt-1">
            {conversionMetrics.accepted} accepts · {conversionMetrics.interacted} interactions · acceptance rate{' '}
            {Math.round(conversionMetrics.acceptanceRate * 100)}%
          </p>
        </div>
      )}

      {!hydrated && (
        <p className="text-xs text-slate-500">Loading your preference profile…</p>
      )}
    </aside>
  )
}
