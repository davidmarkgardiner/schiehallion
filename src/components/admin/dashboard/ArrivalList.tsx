import type { OperationsArrival } from '@/types/operations'

interface ArrivalListProps {
  arrivals: OperationsArrival[]
  onStatusChange: (arrivalId: string, status: OperationsArrival['status']) => void
  getRoomLabel: (roomId?: string) => string | undefined
}

const statusStyles: Record<OperationsArrival['status'], string> = {
  expected: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200',
  'checked-in': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200',
  delayed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200',
}

export function ArrivalList({ arrivals, onStatusChange, getRoomLabel }: ArrivalListProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Today&apos;s arrivals</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track check-in readiness, transport logistics, and special requests at a glance.
        </p>
      </div>
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {arrivals.map((arrival) => {
          const assignedRoom = getRoomLabel(arrival.assignedRoomId)
          const specialRequestCount = arrival.specialRequests?.length ?? 0

          return (
            <li key={arrival.id} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {arrival.guestName}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusStyles[arrival.status]}`}
                  >
                    {arrival.status === 'delayed' ? 'Delayed in transit' : arrival.status.replace('-', ' ')}
                  </span>
                  {arrival.vip && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> VIP
                    </span>
                  )}
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
                    {arrival.checkInTime}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12h20" />
                      <path d="M12 2v20" />
                    </svg>
                    {arrival.roomType.charAt(0).toUpperCase() + arrival.roomType.slice(1)} • {arrival.partySize} guests • {arrival.stayLength}
                    {' '}
                    nights
                  </span>
                  {arrival.transport && <span className="inline-flex items-center gap-2">{arrival.transport}</span>}
                  {assignedRoom && (
                    <span className="inline-flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-300">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                      </svg>
                      Assigned to room {assignedRoom}
                    </span>
                  )}
                </div>
                {arrival.notes && <p className="text-sm text-slate-500 dark:text-slate-400">{arrival.notes}</p>}
                {specialRequestCount > 0 && (
                  <div className="flex flex-wrap items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    {arrival.specialRequests?.map((request) => (
                      <span
                        key={request}
                        className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        {request}
                      </span>
                    ))}
                  </div>
                )}
                {arrival.upgradeEligible && arrival.upgradeOptions && (
                  <p className="text-xs font-medium text-sky-600 dark:text-sky-300">
                    Upgrade suggestion: {arrival.upgradeOptions.join(' or ')}
                  </p>
                )}
              </div>
              <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={() => onStatusChange(arrival.id, arrival.status === 'checked-in' ? 'expected' : 'checked-in')}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {arrival.status === 'checked-in' ? 'Undo check-in' : 'Mark checked-in'}
                </button>
                {arrival.status === 'delayed' ? (
                  <button
                    type="button"
                    onClick={() => onStatusChange(arrival.id, 'expected')}
                    className="inline-flex items-center justify-center rounded-full border border-amber-200 px-4 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/30"
                  >
                    Update ETA received
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStatusChange(arrival.id, 'delayed')}
                    className="inline-flex items-center justify-center rounded-full border border-amber-200 px-4 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/30"
                  >
                    Flag delay
                  </button>
                )}
                {specialRequestCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                    {specialRequestCount} special request{specialRequestCount > 1 ? 's' : ''}
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
