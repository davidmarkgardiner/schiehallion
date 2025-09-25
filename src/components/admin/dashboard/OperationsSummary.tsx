import type { OperationsSummaryMetrics } from '@/types/operations'

interface OperationsSummaryProps {
  metrics: OperationsSummaryMetrics
}

const summaryCardStyles: Record<string, string> = {
  arrivalsDue: 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800/50 dark:text-indigo-200',
  departuresDue:
    'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-200',
  occupancyRate:
    'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800/50 dark:text-emerald-200',
  housekeepingCompletion:
    'bg-sky-50 border-sky-100 text-sky-700 dark:bg-sky-900/30 dark:border-sky-800/50 dark:text-sky-200',
}

export function OperationsSummary({ metrics }: OperationsSummaryProps) {
  const summaryItems = [
    {
      key: 'arrivalsDue',
      label: "Arrivals today",
      value: metrics.arrivalsDue,
      subtext: `${metrics.vipArrivals} VIP / loyalty arrivals`,
    },
    {
      key: 'departuresDue',
      label: 'Departures today',
      value: metrics.departuresDue,
      subtext: `${metrics.pendingRequests} outstanding requests`,
    },
    {
      key: 'occupancyRate',
      label: 'Occupancy',
      value: `${metrics.occupancyRate}%`,
      subtext: `${metrics.stayOvers} stay-overs in house`,
    },
    {
      key: 'housekeepingCompletion',
      label: 'Housekeeping progress',
      value: `${metrics.housekeepingCompletion}%`,
      subtext: `${metrics.roomsAvailable} rooms ready • ${metrics.roomsOutOfOrder} out of order`,
    },
  ] as const

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Daily operations snapshot</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Last updated {metrics.lastUpdated}</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live occupancy feed
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Housekeeping sync
          </span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryItems.map((item) => (
          <div
            key={item.key}
            className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              summaryCardStyles[item.key] ?? 'bg-white dark:bg-slate-900'
            }`}
          >
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">{item.subtext}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
