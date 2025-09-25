'use client'

import { useMemo } from 'react'
import { PackageType } from '@/types/hotel'
import {
  PersonalizationContextInput,
  PackageSuggestion,
  Recommendation
} from '@/types/personalization'
import { usePersonalizationEngine } from '@/hooks/usePersonalizationEngine'

interface PersonalizationEnginePanelProps {
  userId?: string
  stayContext?: PersonalizationContextInput
  currentPackage: PackageType
  onPackageSelect: (packageType: PackageType) => void
}

const formatPrice = (value: number): string => {
  return `£${(value / 100).toFixed(2)}`
}

const toggleValue = (values: string[], value: string): string[] => {
  return values.includes(value) ? values.filter(item => item !== value) : [...values, value]
}

const PersonalizationEnginePanel: React.FC<PersonalizationEnginePanelProps> = ({
  userId,
  stayContext,
  currentPackage,
  onPackageSelect
}) => {
  const {
    loading,
    preferences,
    updatePreferences,
    privacySettings,
    updatePrivacySettings,
    toggleOptOut,
    historyInsights,
    recommendations,
    packageSuggestions,
    analytics,
    conversions,
    experimentVariant,
    recordConversion
  } = usePersonalizationEngine(userId, { ...stayContext, packageType: currentPackage })

  const conversionRate = useMemo(() => {
    if (analytics.packageImpressions === 0) return 0
    return Math.round((analytics.conversions / analytics.packageImpressions) * 100)
  }, [analytics.conversions, analytics.packageImpressions])

  const handleSuggestionClick = (suggestion: PackageSuggestion) => {
    onPackageSelect(suggestion.targetPackage)
    recordConversion({
      suggestionId: suggestion.id,
      valueCaptured: suggestion.projectedValue,
      context: stayContext
    })
  }

  const renderRecommendations = (items: Recommendation[]) => {
    if (items.length === 0) {
      return (
        <p className="text-sm text-slate-400">
          We&apos;ll surface tailored ideas once you update your preferences.
        </p>
      )
    }

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                <p className="text-sm text-slate-300 mt-1">{item.description}</p>
                <p className="text-xs text-emerald-300 mt-2">
                  {item.reason}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {(item.confidence * 100).toFixed(0)}% match
                </span>
                {item.actionLabel && (
                  <p className="mt-2 text-xs text-slate-400">{item.actionLabel}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderPackageSuggestions = (items: PackageSuggestion[]) => {
    return (
      <div className="space-y-4">
        {items.map((suggestion) => (
          <div
            key={suggestion.id}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {suggestion.badges.map((badge) => (
                    <span
                      key={`${suggestion.id}-${badge}`}
                      className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-emerald-200"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
                <h4 className="mt-3 text-lg font-semibold text-white">{suggestion.title}</h4>
                <p className="mt-2 text-sm text-slate-200">{suggestion.description}</p>
                <ul className="mt-3 space-y-1 text-xs text-emerald-200">
                  {suggestion.reasons.map((reason) => (
                    <li key={`${suggestion.id}-${reason}`}>• {reason}</li>
                  ))}
                </ul>
              </div>
              <div className="text-right min-w-[140px]">
                <div className="text-xs text-slate-400 line-through">
                  {formatPrice(suggestion.anchorPrice)}
                </div>
                <div className="text-2xl font-bold text-emerald-300">
                  {formatPrice(suggestion.currentPrice)}
                </div>
                <div className="text-xs text-emerald-200">
                  Save {formatPrice(suggestion.perceivedSavings)}
                </div>
                {suggestion.urgencyMessage && (
                  <p className="mt-3 text-xs text-amber-300">{suggestion.urgencyMessage}</p>
                )}
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="mt-4 w-full rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Apply suggestion
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-sm text-slate-400">
        Loading personalised insights…
      </div>
    )
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Personalise your stay</h3>
          <p className="text-sm text-slate-300">
            Tailored suggestions based on your previous stays and preferences.
          </p>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-slate-300">
          Variant {experimentVariant}
        </span>
      </header>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-4">
        <div>
          <p className="text-sm font-medium text-white">Privacy controls</p>
          <p className="text-xs text-slate-400">
            Adjust how we tailor recommendations. Opt out any time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleOptOut(!privacySettings.personalizationEnabled)}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            privacySettings.personalizationEnabled
              ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
        >
          {privacySettings.personalizationEnabled ? 'Disable' : 'Enable'} personalisation
        </button>
      </div>

      {!privacySettings.personalizationEnabled ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-300">
          <p className="mb-3">You&apos;ve opted out of personalised upgrades.</p>
          <p className="text-xs text-slate-400">
            Toggle the switch above to resume tailored recommendations. Your stored preferences remain private.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
                Guest preferences
              </h4>
              <p className="text-xs text-slate-400">
                Update these to refine future recommendations.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  Stay purpose
                  <select
                    value={preferences.stayPurpose}
                    onChange={(event) => updatePreferences({ stayPurpose: event.target.value as typeof preferences.stayPurpose })}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
                  >
                    <option value="leisure">Leisure escape</option>
                    <option value="business">Business trip</option>
                    <option value="celebration">Celebration</option>
                    <option value="family">Family gathering</option>
                  </select>
                </label>

                <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  Travel style
                  <select
                    value={preferences.travelStyle}
                    onChange={(event) => updatePreferences({ travelStyle: event.target.value as typeof preferences.travelStyle })}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
                  >
                    <option value="relaxed">Relaxed</option>
                    <option value="adventure">Adventure-led</option>
                    <option value="business-ready">Business ready</option>
                    <option value="luxury">Luxury-focused</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  Preferred pace
                  <select
                    value={preferences.pace}
                    onChange={(event) => updatePreferences({ pace: event.target.value as typeof preferences.pace })}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
                  >
                    <option value="slow">Unhurried</option>
                    <option value="balanced">Balanced</option>
                    <option value="packed">Action-packed</option>
                  </select>
                </label>

                <label className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  Special occasion
                  <input
                    type="text"
                    value={preferences.specialOccasion || ''}
                    onChange={(event) => updatePreferences({ specialOccasion: event.target.value || undefined })}
                    placeholder="Birthday, anniversary, etc."
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900/80 px-3 py-2 text-sm text-white"
                  />
                </label>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  Dining focus
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: 'local-produce', label: 'Local produce' },
                    { value: 'chef-experiences', label: 'Chef experiences' },
                    { value: 'plant-forward', label: 'Plant forward' },
                    { value: 'light-bites', label: 'Light bites' }
                  ].map(({ value, label }) => {
                    const active = preferences.diningPreferences.includes(value)
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updatePreferences({ diningPreferences: toggleValue(preferences.diningPreferences, value) })}
                        className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                          active
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
                  Desired perks
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { value: 'late-checkout', label: 'Late checkout' },
                    { value: 'room-upgrade', label: 'Room upgrades' },
                    { value: 'spa-access', label: 'Spa access' },
                    { value: 'experience-credit', label: 'Experience credit' }
                  ].map(({ value, label }) => {
                    const active = preferences.desiredPerks.includes(value)
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updatePreferences({ desiredPerks: toggleValue(preferences.desiredPerks, value) })}
                        className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                          active
                            ? 'bg-emerald-400 text-slate-950'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Your stay insights
            </h4>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Total stays</p>
                <p className="text-lg font-semibold text-white">{historyInsights.totalStays}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Typical stay length</p>
                <p className="text-lg font-semibold text-white">{historyInsights.averageNights} nights</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Favourite package</p>
                <p className="text-lg font-semibold text-white">
                  {historyInsights.favouritePackage ? historyInsights.favouritePackage.replace('-', ' ') : 'Exploring'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Average spend</p>
                <p className="text-lg font-semibold text-white">{formatPrice(historyInsights.averageSpend)}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Smart recommendations
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Context-aware ideas blending your preferences with guest trends.
            </p>
            {renderRecommendations(recommendations)}
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Package optimisation
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Tested messaging variant {experimentVariant} with pricing psychology cues.
            </p>
            {renderPackageSuggestions(packageSuggestions)}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <h4 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
              Conversion tracking
            </h4>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">Upsell views</p>
                <p className="text-lg font-semibold text-white">{analytics.packageImpressions}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Acceptances</p>
                <p className="text-lg font-semibold text-white">{analytics.conversions}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Conversion rate</p>
                <p className="text-lg font-semibold text-white">{conversionRate}%</p>
              </div>
            </div>

            {conversions.length > 0 && (
              <div className="mt-4 space-y-2 text-xs text-slate-400">
                {conversions.slice(-3).reverse().map((conversion) => (
                  <div key={conversion.id}>
                    Accepted {conversion.suggestionId} • {new Date(conversion.timestamp).toLocaleString()}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={privacySettings.shareAnalytics}
                onChange={(event) => updatePrivacySettings({ shareAnalytics: event.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-slate-900"
              />
              Share anonymised performance data to improve suggestions
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={privacySettings.optInForUpsells}
                onChange={(event) => updatePrivacySettings({ optInForUpsells: event.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-slate-900"
              />
              Show upgrade offers in booking flow
            </label>
          </div>
        </div>
      )}
    </section>
  )
}

export default PersonalizationEnginePanel
