import { reservationDietaryOptions, reservationOccasionOptions, reservationPolicies } from '@/data/restaurant'
import type { ReservationConfirmationRecord } from '@/types/restaurant-reservation'

interface RestaurantReservationConfirmationProps {
  record: ReservationConfirmationRecord
  tableLabel: string
  dateLabel: string
  timeLabel: string
  durationLabel: string
  zoneLabel: string
  onBookAnother?: () => void
}

function formatGuestName(record: ReservationConfirmationRecord): string {
  const { firstName, lastName } = record.formValues.contact
  return `${firstName} ${lastName}`.trim()
}

const dietaryLabelLookup = new Map(reservationDietaryOptions.map((option) => [option.value, option.label]))
const occasionLabelLookup = new Map(reservationOccasionOptions.map((option) => [option.value, option.label]))

export function RestaurantReservationConfirmation({
  record,
  tableLabel,
  dateLabel,
  timeLabel,
  durationLabel,
  zoneLabel,
  onBookAnother,
}: RestaurantReservationConfirmationProps): JSX.Element {
  const guestName = formatGuestName(record)
  const {
    partySize,
    dietaryRequirements,
    customDietaryNotes,
    occasion,
    occasionDetails,
    specialRequests,
    smsReminder,
    marketingOptIn,
  } = record.formValues
  const contact = record.formValues.contact
  const modificationLink = `https://theschiehallion.example/reservations/${record.reference}`

  return (
    <div className="mt-6 space-y-6 rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-950/20">
      <header className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
          Reservation confirmed
        </div>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Thank you, {guestName}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We have held <span className="font-semibold text-slate-900 dark:text-white">{tableLabel}</span> in the {zoneLabel} zone on {dateLabel}.
          Your booking reference is <span className="font-semibold">{record.reference}</span>.
        </p>
      </header>

      <section className="grid gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 md:grid-cols-2">
        <div>
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">Reservation details</h4>
          <dl className="mt-3 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <dt className="font-medium text-slate-700 dark:text-slate-200">Date & time</dt>
              <dd className="text-right text-slate-600 dark:text-slate-300">
                {dateLabel}
                <br />
                {timeLabel} · {durationLabel}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="font-medium text-slate-700 dark:text-slate-200">Party size</dt>
              <dd className="text-right text-slate-600 dark:text-slate-300">{partySize} guest{partySize > 1 ? 's' : ''}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="font-medium text-slate-700 dark:text-slate-200">SMS reminder</dt>
              <dd className="text-right text-slate-600 dark:text-slate-300">
                {smsReminder
                  ? 'Enabled — we’ll text you 3 hours before arrival.'
                  : 'Not enabled — you can opt-in using the link below.'}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="font-medium text-slate-700 dark:text-slate-200">Update online</dt>
              <dd className="text-right text-slate-600 dark:text-slate-300">
                <a
                  href={modificationLink}
                  className="text-emerald-600 underline decoration-emerald-400 hover:text-emerald-500"
                  target="_blank"
                  rel="noreferrer"
                >
                  Manage reservation
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">Guest communications</h4>
          <ul className="mt-3 space-y-2">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-slate-700 dark:text-slate-100">Email confirmation sent</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{contact.email}</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-slate-700 dark:text-slate-100">Host team contact</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">We may call {contact.phone} if we need any clarifications.</span>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-slate-700 dark:text-slate-100">Marketing preferences</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {marketingOptIn
                    ? 'Subscribed to seasonal menus and exclusive events.'
                    : 'Opted out — we’ll only be in touch about this reservation.'}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">Dining notes</h4>
        <dl className="mt-3 space-y-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Dietary requirements</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {dietaryRequirements.length === 0 ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300">None provided</span>
              ) : (
                dietaryRequirements.map((requirement) => {
                  const label = dietaryLabelLookup.get(requirement) ?? requirement.replace(/_/g, ' ')
                  return (
                    <span
                      key={requirement}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                    >
                      {label}
                    </span>
                  )
                })
              )}
            </dd>
            {customDietaryNotes && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{customDietaryNotes}</p>
            )}
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Occasion</dt>
            <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {occasion === 'none'
                ? 'Standard dining experience'
                : occasionLabelLookup.get(occasion) ?? occasion.replace(/_/g, ' ')}
            </dd>
            {occasionDetails && <p className="text-xs text-slate-500 dark:text-slate-400">{occasionDetails}</p>}
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Special requests</dt>
            <dd className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {specialRequests ? specialRequests : 'No extra requests submitted'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">Cancellation policy</h4>
        <ul className="space-y-2">
          {reservationPolicies.map((policy) => (
            <li key={policy.title} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
              <span>
                <span className="block font-semibold text-slate-700 dark:text-slate-100">{policy.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{policy.description}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Need to adjust plans? Visit the link above or email{' '}
          <a href="mailto:host@theschiehallion.example" className="text-emerald-600 underline decoration-emerald-400 hover:text-emerald-500">
            host@theschiehallion.example
          </a>{' '}
          so we can assist.
        </p>
      </section>

      <footer className="flex flex-col gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-100">See you soon, {guestName.split(' ')[0] || guestName}!</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">The host desk is available daily from 08:00 to 22:00 for adjustments.</p>
        </div>
        {onBookAnother && (
          <button
            type="button"
            onClick={onBookAnother}
            className="inline-flex items-center justify-center rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
          >
            Make another reservation
          </button>
        )}
      </footer>
    </div>
  )
}
