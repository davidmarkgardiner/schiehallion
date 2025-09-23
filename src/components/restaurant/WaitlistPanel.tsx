'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { waitlistNotificationOptions } from '@/data/restaurant'
import type {
  AlternativeSlotSuggestion,
  WaitlistFormValues,
  WaitlistJoinRecord,
} from '@/types/restaurant-reservation'

interface WaitlistPanelProps {
  queuePosition: number
  estimatedWaitMinutes: number
  acceptanceMinutes: number
  alternativeSlots: AlternativeSlotSuggestion[]
  minGuests: number
  maxGuests: number
  defaultPartySize: number
  onSelectAlternative: (slotId: string) => void
  onSubmit?: (record: WaitlistJoinRecord) => void
}

function sanitiseNotes(value?: string): string | undefined {
  if (!value) {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function WaitlistPanel({
  queuePosition,
  estimatedWaitMinutes,
  acceptanceMinutes,
  alternativeSlots,
  minGuests,
  maxGuests,
  defaultPartySize,
  onSelectAlternative,
  onSubmit,
}: WaitlistPanelProps): JSX.Element {
  const [submittedRecord, setSubmittedRecord] = useState<WaitlistJoinRecord | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WaitlistFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      partySize: defaultPartySize,
      notificationPreference: 'both',
      notes: '',
      acceptTerms: false,
    },
    mode: 'onBlur',
  })

  const onFormSubmit = handleSubmit((values: WaitlistFormValues) => {
    const record: WaitlistJoinRecord = {
      submittedAt: new Date().toISOString(),
      queuePosition,
      formValues: {
        ...values,
        notes: sanitiseNotes(values.notes),
      },
    }
    setSubmittedRecord(record)
    onSubmit?.(record)
  })

  const handleJoinAnother = (): void => {
    reset({
      fullName: '',
      email: '',
      phone: '',
      partySize: defaultPartySize,
      notificationPreference: 'both',
      notes: '',
      acceptTerms: false,
    })
    setSubmittedRecord(null)
  }

  if (submittedRecord) {
    const { formValues } = submittedRecord
    return (
      <div className="mt-6 space-y-5 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-6 text-sm text-emerald-800 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-900/20 dark:text-emerald-100">
        <header className="space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-200">
            Waitlist spot secured
          </div>
          <p className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
            Thanks {formValues.fullName.split(' ')[0] || formValues.fullName}, you’re number {queuePosition} in line.
          </p>
          <p className="text-xs text-emerald-700/90 dark:text-emerald-100/80">
            We’ll notify you via {formValues.notificationPreference === 'both' ? 'email and SMS' : formValues.notificationPreference}.
            Once a table opens you’ll have {acceptanceMinutes} minutes to confirm before we contact the next guest.
          </p>
        </header>
        <dl className="grid gap-3 rounded-xl border border-emerald-200 bg-white/90 p-4 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-100 md:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">Party size</dt>
            <dd className="mt-1 text-sm">{formValues.partySize} guest{formValues.partySize > 1 ? 's' : ''}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">Estimated wait</dt>
            <dd className="mt-1 text-sm">Approximately {estimatedWaitMinutes} minutes</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">Contact</dt>
            <dd className="mt-1 text-sm space-y-1">
              <p>{formValues.email}</p>
              <p>{formValues.phone}</p>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-200">Notes</dt>
            <dd className="mt-1 text-sm">{formValues.notes ?? 'No additional notes provided.'}</dd>
          </div>
        </dl>
        <section className="space-y-2 text-xs text-emerald-700/90 dark:text-emerald-100/80">
          <p>
            Our host desk monitors the list continuously. Expect an update as soon as the current guests depart or a cancellation arrives.
            If your plans change, please remove yourself via the confirmation link so we can assist other diners.
          </p>
          <button
            type="button"
            onClick={handleJoinAnother}
            className="inline-flex items-center justify-center rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
          >
            Join with different details
          </button>
        </section>
      </div>
    )
  }

  const guestRange = useMemo(() => {
    const range: number[] = []
    for (let current = minGuests; current <= maxGuests; current += 1) {
      range.push(current)
    }
    return range
  }, [minGuests, maxGuests])

  return (
    <div className="mt-6 space-y-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-100">
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
          Fully booked · Join waitlist
        </div>
        <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
          Position {queuePosition} · Estimated wait {estimatedWaitMinutes} minutes
        </h3>
        <p className="text-xs text-amber-700/90 dark:text-amber-200/80">
          We’ll hold your place and notify you automatically. Once contacted you’ll have {acceptanceMinutes} minutes to accept before we offer the table to the next guest.
        </p>
      </header>

      <form onSubmit={onFormSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-amber-900 dark:text-amber-100" htmlFor="waitlist-fullName">
            Full name
          </label>
          <input
            id="waitlist-fullName"
            type="text"
            {...register('fullName', {
              required: 'Enter the name we should call when your table is ready.',
              minLength: { value: 2, message: 'Enter the name we should call when your table is ready.' },
              maxLength: { value: 120, message: 'Name must be 120 characters or fewer.' },
            })}
            className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-50"
            placeholder="Who should we call?"
          />
          {errors.fullName && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.fullName.message}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100" htmlFor="waitlist-email">
              Email address
            </label>
            <input
              id="waitlist-email"
              type="email"
              {...register('email', {
                required: 'Enter a valid email so we can send confirmation.',
                maxLength: { value: 120, message: 'Email must be 120 characters or fewer.' },
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email so we can send confirmation.',
                },
              })}
              className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-50"
              placeholder="guest@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-900 dark:text-amber-100" htmlFor="waitlist-phone">
              Mobile number
            </label>
            <input
              id="waitlist-phone"
              type="tel"
              {...register('phone', {
                required: 'Enter a contact number we can text or call.',
                minLength: { value: 6, message: 'Enter a contact number we can text or call.' },
                maxLength: { value: 24, message: 'Phone numbers are limited to 24 characters.' },
              })}
              className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-50"
              placeholder="We’ll send SMS alerts here"
            />
            {errors.phone && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.phone.message}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-900 dark:text-amber-100" htmlFor="waitlist-partySize">
            Party size
          </label>
          <p className="text-xs text-amber-700/90 dark:text-amber-200/80">
            We can seat parties between {minGuests} and {maxGuests} guests when a table frees up.
          </p>
          <select
            id="waitlist-partySize"
            {...register('partySize', {
              valueAsNumber: true,
              required: 'Let us know how many guests are waiting.',
              min: { value: minGuests, message: `We can only waitlist parties of ${minGuests} or more.` },
              max: { value: maxGuests, message: `The maximum party size for this waitlist is ${maxGuests}.` },
            })}
            className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-50"
          >
            {guestRange.map((value) => (
              <option key={value} value={value}>
                {value} guest{value > 1 ? 's' : ''}
              </option>
            ))}
          </select>
          {errors.partySize && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.partySize.message}</p>}
        </div>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-amber-900 dark:text-amber-100">How should we notify you?</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {waitlistNotificationOptions.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-700 transition hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:border-emerald-500"
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('notificationPreference', {
                    required: 'Select how we should notify you.',
                  })}
                  className="mt-1 h-4 w-4 border-amber-300 text-emerald-600 focus:ring-emerald-500 dark:border-amber-400 dark:bg-amber-950"
                />
                <span>
                  <span className="block font-semibold text-amber-900 dark:text-amber-100">{option.label}</span>
                  <span className="text-xs text-amber-700/90 dark:text-amber-200/80">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
          {errors.notificationPreference && (
            <p className="text-sm text-rose-600 dark:text-rose-300">{errors.notificationPreference.message}</p>
          )}
        </fieldset>
        <div>
          <label className="block text-sm font-medium text-amber-900 dark:text-amber-100" htmlFor="waitlist-notes">
            Notes for the host (optional)
          </label>
          <textarea
            id="waitlist-notes"
            rows={3}
            {...register('notes', {
              maxLength: { value: 240, message: 'Notes must be 240 characters or fewer.' },
            })}
            className="mt-2 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-amber-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-amber-500/40 dark:bg-amber-950/50 dark:text-amber-50"
            placeholder="Share accessibility needs or timing preferences."
          />
          {errors.notes && <p className="mt-1 text-sm text-rose-600 dark:text-rose-300">{errors.notes.message}</p>}
        </div>
        <section className="space-y-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-xs text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-semibold text-amber-900 dark:text-amber-100">Waitlist essentials</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Notifications are automatic — confirm within {acceptanceMinutes} minutes to secure the table.</li>
            <li>Missed responses move the booking to the next guest but you remain on standby.</li>
            <li>The host desk suggests the alternative slots below if your plans are flexible.</li>
          </ul>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              {...register('acceptTerms', {
                validate: (value: boolean) => value || 'Please agree to the waitlist terms.',
              })}
              className="mt-1 h-4 w-4 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500 dark:border-amber-400 dark:bg-amber-950"
            />
            <span>I understand the waitlist terms and will confirm promptly when contacted.</span>
          </label>
          {errors.acceptTerms && <p className="text-sm text-rose-600 dark:text-rose-300">{errors.acceptTerms.message}</p>}
        </section>
        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isSubmitting ? 'Adding to waitlist…' : 'Join the waitlist'}
          </button>
          <div className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-xs text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-semibold text-amber-900 dark:text-amber-100">Alternative times with availability</p>
            {alternativeSlots.length === 0 ? (
              <p className="mt-2">We’ll email you other dates as soon as new tables open.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {alternativeSlots.map((slot) => (
                  <li key={slot.id} className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">{slot.label}</p>
                      <p className="text-xs text-amber-700/90 dark:text-amber-200/80">Status: {slot.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectAlternative(slot.id)}
                      className="rounded-lg border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
                    >
                      Switch to this time
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
