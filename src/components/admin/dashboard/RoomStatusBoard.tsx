import { useMemo, useState } from 'react'

import type { OperationalRoom, TurnStatus } from '@/types/operations'

interface RoomStatusBoardProps {
  rooms: OperationalRoom[]
}

const statusStyles: Record<OperationalRoom['status'], string> = {
  'vacant-clean': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  'vacant-dirty': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  occupied: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200',
  'out-of-service': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  inspection: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  blocked: 'bg-slate-200 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
}

const housekeepingStyles: Record<OperationalRoom['housekeepingStatus'], string> = {
  clean: 'text-emerald-600 dark:text-emerald-300',
  'in-progress': 'text-sky-600 dark:text-sky-300',
  dirty: 'text-rose-600 dark:text-rose-300',
  inspection: 'text-indigo-600 dark:text-indigo-300',
}

const turnStatusFilters: { key: 'all' | TurnStatus; label: string }[] = [
  { key: 'all', label: 'All rooms' },
  { key: 'arrival', label: 'Arrivals' },
  { key: 'stayover', label: 'Stay-overs' },
  { key: 'departure', label: 'Departures' },
  { key: 'out-of-order', label: 'Out of order' },
]

export function RoomStatusBoard({ rooms }: RoomStatusBoardProps) {
  const [filter, setFilter] = useState<(typeof turnStatusFilters)[number]['key']>('arrival')

  const filteredRooms = useMemo(() => {
    if (filter === 'all') {
      return rooms
    }
    return rooms.filter((room) => room.turnStatus === filter)
  }, [filter, rooms])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Room status board</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Live status feed with readiness notes, priority flags, and housekeeping progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {turnStatusFilters.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold transition ${
                filter === option.key
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredRooms.map((room) => (
          <article
            key={room.id}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Room</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{room.roomNumber}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {room.type.charAt(0).toUpperCase() + room.type.slice(1)} • Floor {room.floor} • Sleeps {room.capacity}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[room.status]}`}>
                {room.status.replace('-', ' ')}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className={`font-semibold ${housekeepingStyles[room.housekeepingStatus]}`}>
                HK {room.housekeepingStatus.replace('-', ' ')}
              </span>
              {room.occupancyStatus === 'occupied' && room.occupantName && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                  In-house: {room.occupantName}
                </span>
              )}
              {room.priorityFlags?.map((flag) => (
                <span
                  key={flag}
                  className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {flag}
                </span>
              ))}
              {room.housekeepingEta && <span>{room.housekeepingEta}</span>}
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {room.readinessNote && <p>• {room.readinessNote}</p>}
              {room.nextEvent && <p>• {room.nextEvent}</p>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              {room.features.map((feature) => (
                <span key={feature} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800/60">
                  {feature}
                </span>
              ))}
              <span className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white dark:bg-slate-200 dark:text-slate-900">
                {room.upgradeLevel.charAt(0).toUpperCase() + room.upgradeLevel.slice(1)} tier
              </span>
            </div>
          </article>
        ))}
        {filteredRooms.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <p>No rooms matching the selected filter right now.</p>
            <p>Maintenance updates and housekeeping sync automatically feed this view.</p>
          </div>
        )}
      </div>
    </section>
  )
}
