'use client'

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
  reservationDietaryOptions,
  reservationOccasionOptions,
  reservationPolicies,
} from '@/data/restaurant'
import type { ReservationFormValues } from '@/types/restaurant-reservation'

interface RestaurantReservationFormProps {
  tableLabel: string
  dateLabel: string
  timeLabel: string
  durationLabel: string
  minGuests: number
  maxGuests: number
  onSubmit: (values: ReservationFormValues) => void
  onCancel: () => void
  defaultValues?: Partial<ReservationFormValues>
}

function sanitiseOptionalField(value?: string): string | undefined {
  if (!value) {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function RestaurantReservationForm({
  tableLabel,
  dateLabel,
  timeLabel,
  durationLabel,
  minGuests,
  maxGuests,
  onSubmit,
  onCancel,
  defaultValues,
}: RestaurantReservationFormProps): JSX.Element {
  const initialPartySize = useMemo(
    () => Math.min(maxGuests, Math.max(minGuests, defaultValues?.partySize ?? minGuests)),
    [defaultValues?.partySize, maxGuests, minGuests],
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReservationFormValues>({
    defaultValues: {
      partySize: initialPartySize,
      dietaryRequirements: defaultValues?.dietaryRequirements ?? [],
      customDietaryNotes: defaultValues?.customDietaryNotes ?? '',
      occasion: defaultValues?.occasion ?? 'none',
      occasionDetails: defaultValues?.occasionDetails ?? '',
      specialRequests: defaultValues?.specialRequests ?? '',
      smsReminder: defaultValues?.smsReminder ?? true,
      marketingOptIn: defaultValues?.marketingOptIn ?? false,
      contact: {
        firstName: defaultValues?.contact?.firstName ?? '',
        lastName: defaultValues?.contact?.lastName ?? '',
        email: defaultValues?.contact?.email ?? '',
        phone: defaultValues?.contact?.phone ?? '',
      },
      acceptPolicies: defaultValues?.acceptPolicies ?? false,
    },
    mode: 'onBlur',
  })

  const occasion = watch('occasion')
  const dietaryRequirements = watch('dietaryRequirements')

  const onFormSubmit = handleSubmit((values: ReservationFormValues) => {
    const cleaned: ReservationFormValues = {
      ...values,
      customDietaryNotes: sanitiseOptionalField(values.customDietaryNotes),
      occasionDetails: sanitiseOptionalField(values.occasionDetails),
      specialRequests: sanitiseOptionalField(values.specialRequests),
    }
    onSubmit(cleaned)
  })

  const guestRange = useMemo(() => {
    const range: number[] = []
    for (let current = minGuests; current <= maxGuests; current += 1) {
      range.push(current)
    }
    return range
  }, [minGuests, maxGuests])

  const policiesList = reservationPolicies

  return (
    <form onSubmit={onFormSubmit} className="mt-6 space-y-6">
      <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:text-emerald-100">
        <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
          Reserve {tableLabel} for {dateLabel}
        </h3>
        <p className="mt-1 text-sm text-emerald-800/90 dark:text-emerald-200">
          {timeLabel} · {durationLabel}
        </p>
        <p className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-200/80">
          Share a few details so our host team can personalise your visit. Confirmation arrives instantly once submitted.
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Party size
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tables in this zone welcome between {minGuests} and {maxGuests} guests.</p>
          <div className="mt-2">
            <select
              {...register('partySize', {
                valueAsNumber: true,
                required: 'Select how many guests will be attending.',
                min: {
                  value: minGuests,
                  message: `Minimum party size is ${minGuests} guests for this table.`,
                },
                max: {
                  value: maxGuests,
                  message: `Maximum party size is ${maxGuests} guests for this table.`,
                },
              })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {guestRange.map((value) => (
                <option key={value} value={value}>
                  {value} guest{value > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            {errors.partySize && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.partySize.message}</p>
            )}
          </div>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">Dietary requirements</legend>
          <p className="text-xs text-slate-500 dark:text-slate-400">Tick all that apply so our chefs can adapt the menu.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {reservationDietaryOptions.map((option) => {
              const isSelected = dietaryRequirements.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-100'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    {...register('dietaryRequirements')}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
                  />
                  <span>
                    <span className="block font-semibold text-slate-700 dark:text-slate-100">{option.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
                  </span>
                </label>
              )
            })}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="customDietaryNotes">
              Additional dietary notes (optional)
            </label>
            <textarea
              id="customDietaryNotes"
              rows={3}
              {...register('customDietaryNotes', {
                maxLength: { value: 280, message: 'Dietary notes must be 280 characters or fewer.' },
              })}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Let us know about specific ingredients or serving preferences."
            />
            {errors.customDietaryNotes && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.customDietaryNotes.message}</p>
            )}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-slate-700 dark:text-slate-200">Special occasion</legend>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose the reason for your visit so the host team can prepare.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {reservationOccasionOptions.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  occasion === option.value
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-100'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-500'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('occasion')}
                  className="mt-1 h-4 w-4 border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
                />
                <span>
                  <span className="block font-semibold text-slate-700 dark:text-slate-100">{option.label}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.occasion && <p className="text-sm text-rose-600 dark:text-rose-300">{errors.occasion.message}</p>}
          {occasion === 'other' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="occasionDetails">
                Tell us more about the celebration
              </label>
              <textarea
                id="occasionDetails"
                rows={2}
                {...register('occasionDetails', {
                  maxLength: { value: 280, message: 'Occasion notes must be 280 characters or fewer.' },
                })}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Share any plans, surprises, or schedule details."
              />
              {errors.occasionDetails && (
                <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.occasionDetails.message}</p>
              )}
            </div>
          )}
        </fieldset>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="specialRequests">
            Special requests (optional)
          </label>
          <textarea
            id="specialRequests"
            rows={3}
            {...register('specialRequests', {
              maxLength: { value: 400, message: 'Special requests must be 400 characters or fewer.' },
            })}
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Wine pairings, seating adjustments, or anything else we can arrange."
          />
          {errors.specialRequests && (
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.specialRequests.message}</p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Primary guest details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="firstName">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              {...register('contact.firstName', {
                required: 'Enter a first name with at least two characters.',
                minLength: { value: 2, message: 'Enter a first name with at least two characters.' },
                maxLength: { value: 60, message: 'First name must be 60 characters or fewer.' },
              })}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              autoComplete="given-name"
            />
            {errors.contact?.firstName && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.contact.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="lastName">
              Surname
            </label>
            <input
              id="lastName"
              type="text"
              {...register('contact.lastName', {
                required: 'Enter a surname with at least two characters.',
                minLength: { value: 2, message: 'Enter a surname with at least two characters.' },
                maxLength: { value: 60, message: 'Surname must be 60 characters or fewer.' },
              })}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              autoComplete="family-name"
            />
            {errors.contact?.lastName && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.contact.lastName.message}</p>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              {...register('contact.email', {
                required: 'Enter an email address so we can send confirmation.',
                maxLength: { value: 120, message: 'Email address must be 120 characters or fewer.' },
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address so we can send confirmation.',
                },
              })}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              autoComplete="email"
            />
            {errors.contact?.email && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.contact.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="phone">
              Mobile number
            </label>
            <input
              id="phone"
              type="tel"
              {...register('contact.phone', {
                required: 'Enter a contact number so our host can reach you.',
                minLength: { value: 6, message: 'Enter a contact number so our host can reach you.' },
                maxLength: { value: 24, message: 'Phone numbers are limited to 24 characters.' },
              })}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              autoComplete="tel"
            />
            {errors.contact?.phone && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.contact.phone.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('smsReminder')}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
            />
            <span>
              <span className="font-semibold text-slate-700 dark:text-slate-100">Send me an SMS reminder 3 hours before arrival</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">You can reply to confirm delays or adjust arrival times.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('marketingOptIn')}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
            />
            <span>
              <span className="font-semibold text-slate-700 dark:text-slate-100">Share new tasting menus and seasonal events by email</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">1-2 messages per month, unsubscribe any time.</span>
            </span>
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Reservation policies</h3>
        <ul className="space-y-2 text-sm">
          {policiesList.map((policy) => (
            <li key={policy.title} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-slate-700 dark:text-slate-100">{policy.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{policy.description}</span>
              </span>
            </li>
          ))}
        </ul>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...register('acceptPolicies', {
                validate: (value: boolean) => value || 'Please acknowledge the reservation policies.',
              })}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
            />
            <span className="text-slate-600 dark:text-slate-300">
            I understand the arrival, dining duration, and cancellation policies above.
          </span>
        </label>
        {errors.acceptPolicies && (
          <p className="text-sm text-rose-600 dark:text-rose-300">{errors.acceptPolicies.message}</p>
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
        >
          Back to availability
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-400"
        >
          {isSubmitting ? 'Submitting…' : 'Confirm reservation'}
        </button>
      </div>
    </form>
  )
}
