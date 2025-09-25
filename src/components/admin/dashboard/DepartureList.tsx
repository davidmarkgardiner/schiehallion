import type { OperationsDeparture } from '@/types/operations'

interface DepartureListProps {
  departures: OperationsDeparture[]
  onStatusChange: (departureId: string, status: OperationsDeparture['status']) => void
}

const departureStatusStyles: Record<OperationsDeparture['status'], string> = {
  'in-house': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  'checked-out': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  'late-checkout': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
}

const housekeepingStatusStyles: Record<OperationsDeparture['housekeepingStatus'], string> = {
  clean: 'text-emerald-600 dark:text-emerald-300',
  'in-progress': 'text-sky-600 dark:text-sky-300',
  dirty: 'text-rose-600 dark:text-rose-300',
}

export function DepartureList({ departures, onStatusChange }: DepartureListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Departures &amp; folios</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Confirm balances, coordinate transportation, and release rooms for housekeeping.
        </p>
      </div>
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {departures.map((departure) => {
          const isCheckedOut = departure.status === 'checked-out'
          const hasBalance = departure.balanceDue > 0

          return (
            <li key={departure.id} className="flex flex-col gap-3 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {departure.guestName}
                  </p>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Room {departure.roomNumber}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${departureStatusStyles[departure.status]}`}
                  >
                    {departure.status.replace('-', ' ')}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${housekeepingStatusStyles[departure.housekeepingStatus]}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" /> HK {departure.housekeepingStatus.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 8v4l3 3" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                    Checkout {departure.checkoutTime}
                  </span>
                  {departure.transportation && <span className="inline-flex items-center gap-2">{departure.transportation}</span>}
                  <span
                    className={`inline-flex items-center gap-1 ${hasBalance ? 'text-rose-600 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 1v22" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    {hasBalance
                      ? `Balance £${(departure.balanceDue / 100).toFixed(2)}`
                      : 'No balance remaining'}
                  </span>
                </div>
                {departure.notes && <p className="text-sm text-slate-500 dark:text-slate-400">{departure.notes}</p>}
              </div>
              <div className="flex flex-shrink-0 flex-col gap-2 lg:items-end">
                <button
                  type="button"
                  onClick={() => onStatusChange(departure.id, isCheckedOut ? 'processing' : 'checked-out')}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 ${
                    isCheckedOut
                      ? 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isCheckedOut ? 'Reopen folio' : 'Complete checkout'}
                </button>
                {!isCheckedOut && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(departure.id, 'processing')}
                    className="inline-flex items-center justify-center rounded-full border border-sky-200 px-4 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 dark:border-sky-800 dark:text-sky-200 dark:hover:bg-sky-900/30"
                  >
                    Send to housekeeping queue
                  </button>
                )}
                {hasBalance && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                    Action needed: outstanding balance
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
