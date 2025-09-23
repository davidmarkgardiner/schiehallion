'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  accessibilityOptions,
  defaultServicePeriods,
  initialTimeSlots,
  restaurantTables,
  tableFeatureOptions,
  tableZoneOptions,
} from '@/data/restaurant'
import type {
  AccessibilityFeature,
  RestaurantTable,
  TableFeature,
  TableZone,
  TimeSlotAvailability,
} from '@/types/restaurant'

const FLOORPLAN_WIDTH = 680
const FLOORPLAN_HEIGHT = 480
const TABLE_SIZE = 72

const zoneBadgeStyles: Record<TableZone, string> = {
  main_dining: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200',
  window: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200',
  private: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200',
  terrace: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200',
  chef_counter: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200',
}

type ZoneBackground = {
  zone: TableZone
  style: CSSProperties
  className: string
}

const zoneBackgrounds: ZoneBackground[] = [
  {
    zone: 'window',
    style: { left: '0%', top: '0%', width: '42%', height: '48%' },
    className: 'bg-sky-200/30 dark:bg-sky-900/30 border-sky-400/60',
  },
  {
    zone: 'main_dining',
    style: { left: '38%', top: '6%', width: '54%', height: '56%' },
    className: 'bg-amber-200/30 dark:bg-amber-900/30 border-amber-400/60',
  },
  {
    zone: 'private',
    style: { left: '4%', top: '52%', width: '34%', height: '40%' },
    className: 'bg-rose-200/30 dark:bg-rose-900/30 border-rose-400/60',
  },
  {
    zone: 'terrace',
    style: { left: '38%', top: '60%', width: '34%', height: '32%' },
    className: 'bg-emerald-200/30 dark:bg-emerald-900/30 border-emerald-400/60',
  },
  {
    zone: 'chef_counter',
    style: { left: '72%', top: '58%', width: '24%', height: '28%' },
    className: 'bg-indigo-200/30 dark:bg-indigo-900/30 border-indigo-400/60',
  },
]

const slotStatusStyles = {
  available: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  limited: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  full: 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300',
}

const accessibilityIcons: Record<AccessibilityFeature, { icon: string; label: string }> = {
  wheelchair: { icon: '♿', label: 'Wheelchair accessible' },
  hearing_loop: { icon: '🦻', label: 'Hearing loop available' },
  large_print_menu: { icon: '🔍', label: 'Large print menu' },
}

function formatZoneLabel(zone: TableZone): string {
  const match = tableZoneOptions.find((option) => option.value === zone)
  return match ? match.label : zone
}

function formatTimeLabel(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(date)
}

function addMinutesToTime(time: string, duration: number): string {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes + duration, 0, 0)
  return new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit' }).format(date)
}

function formatIsoTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'just now'
  }
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date)
}

function compareTimes(a: string, b: string): number {
  return a.localeCompare(b)
}

type TableState = {
  isAvailable: boolean
  isSelectable: boolean
  isSelected: boolean
  baseStatus: RestaurantTable['status']
}

function resolveTableState(
  table: RestaurantTable,
  availableSet: Set<string>,
  selectedTableId: string | null,
): TableState {
  const isAvailable = availableSet.has(table.id)
  const baseStatus = table.status
  const isSelected = selectedTableId === table.id
  const isSelectable = isAvailable && baseStatus !== 'maintenance' && baseStatus !== 'reserved'
  return { isAvailable, baseStatus, isSelectable, isSelected }
}

const slotEventIcon: Record<'highlight' | 'warning', string> = {
  highlight: '🎉',
  warning: '⚠️',
}

interface PanState {
  pointerId: number
  startX: number
  startY: number
  baseX: number
  baseY: number
}

interface PinchState {
  pointerIds: [number, number]
  initialDistance: number
  initialZoom: number
  initialTranslateX: number
  initialTranslateY: number
  initialMidpoint: { x: number; y: number }
}

const clampZoom = (value: number): number => Math.min(Math.max(value, 0.6), 2.4)

const clampTranslation = (value: number, zoom: number, axisSize: number): number => {
  const limit = axisSize * Math.max(zoom - 1, 0) * 0.5 + 120
  if (limit <= 0) {
    return 0
  }
  return Math.min(Math.max(value, -limit), limit)
}

export default function RestaurantGuestExperience() {
  const [timeSlots, setTimeSlots] = useState<TimeSlotAvailability[]>(initialTimeSlots)
  const [selectedDate, setSelectedDate] = useState<string>(initialTimeSlots[0]?.date ?? '')
  const [activePeriodId, setActivePeriodId] = useState<string>(() => {
    const firstPeriodWithSlots = defaultServicePeriods.find((period) =>
      initialTimeSlots.some((slot) => slot.periodId === period.id),
    )
    return firstPeriodWithSlots?.id ?? defaultServicePeriods[0]?.id ?? ''
  })
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [hoveredTableId, setHoveredTableId] = useState<string | null>(null)

  const tables = restaurantTables
  const tableMap = useMemo(() => new Map<string, RestaurantTable>(tables.map((table) => [table.id, table])), [tables])
  const featureMap = useMemo(
    () => new Map<TableFeature, string>(tableFeatureOptions.map((option) => [option.value, option.label])),
    [],
  )
  const accessibilityMap = useMemo(
    () => new Map<AccessibilityFeature, string>(accessibilityOptions.map((option) => [option.value, option.label])),
    [],
  )

  const availableDates = useMemo(
    () => Array.from(new Set(timeSlots.map((slot) => slot.date))).sort(),
    [timeSlots],
  )

  useEffect(() => {
    if (!availableDates.includes(selectedDate) && availableDates.length > 0) {
      setSelectedDate(availableDates[0])
    }
  }, [availableDates, selectedDate])

  const periodsForDate = useMemo(
    () =>
      defaultServicePeriods.filter((period) =>
        timeSlots.some((slot) => slot.date === selectedDate && slot.periodId === period.id),
      ),
    [selectedDate, timeSlots],
  )

  useEffect(() => {
    if (!periodsForDate.some((period) => period.id === activePeriodId) && periodsForDate.length > 0) {
      setActivePeriodId(periodsForDate[0].id)
    }
  }, [activePeriodId, periodsForDate])

  const slotsForPeriod = useMemo(() => {
    return timeSlots
      .filter((slot) => slot.date === selectedDate && slot.periodId === activePeriodId)
      .sort((a, b) => compareTimes(a.time, b.time))
  }, [activePeriodId, selectedDate, timeSlots])

  useEffect(() => {
    if (slotsForPeriod.length === 0) {
      setSelectedSlotId(null)
      return
    }

    setSelectedSlotId((previous) => {
      if (!previous) {
        return slotsForPeriod[0].id
      }
      const stillExists = slotsForPeriod.some((slot) => slot.id === previous)
      return stillExists ? previous : slotsForPeriod[0].id
    })
  }, [slotsForPeriod])

  const selectedSlot = useMemo(
    () => slotsForPeriod.find((slot) => slot.id === selectedSlotId) ?? null,
    [selectedSlotId, slotsForPeriod],
  )

  useEffect(() => {
    if (!selectedSlot) {
      setSelectedTableId(null)
      return
    }

    const availableTables = selectedSlot.availableTableIds
    if (availableTables.length === 0) {
      setSelectedTableId(null)
      return
    }

    setSelectedTableId((previous) => {
      if (previous && availableTables.includes(previous)) {
        return previous
      }
      return availableTables[0]
    })
  }, [selectedSlot])

  const tableCapacityMap = useMemo(() => {
    const map = new Map<string, number>()
    tables.forEach((table) => {
      map.set(table.id, table.capacity.default)
    })
    return map
  }, [tables])

  useEffect(() => {
    const candidateTables = tables.filter((table) => table.status !== 'maintenance')
    const candidateIds = candidateTables.map((table) => table.id)

    const interval = window.setInterval(() => {
      setTimeSlots((previous) =>
        previous.map((slot) => {
          const availableSet = new Set(slot.availableTableIds)
          const action = Math.random()

          if (availableSet.size > 0 && action > 0.65) {
            const ids = Array.from(availableSet)
            const removalIndex = Math.floor(Math.random() * ids.length)
            availableSet.delete(ids[removalIndex])
          } else if (action < 0.35 && availableSet.size < slot.totalTables) {
            const pool = candidateIds.filter((id) => !availableSet.has(id))
            if (pool.length > 0) {
              const addition = pool[Math.floor(Math.random() * pool.length)]
              availableSet.add(addition)
            }
          }

          const availableTableIds = Array.from(availableSet)
          const capacityAvailable = availableTableIds.reduce(
            (total, id) => total + (tableCapacityMap.get(id) ?? 0),
            0,
          )
          const ratio = availableTableIds.length / slot.totalTables
          const status =
            availableTableIds.length === 0
              ? 'full'
              : ratio <= 0.3
              ? 'limited'
              : ('available' as TimeSlotAvailability['status'])

          return {
            ...slot,
            availableTableIds,
            capacityAvailable,
            status,
            lastUpdated: new Date().toISOString(),
          }
        }),
      )
    }, 12000)

    return () => {
      window.clearInterval(interval)
    }
  }, [tableCapacityMap, tables])

  const availableSet = useMemo(() => new Set(selectedSlot?.availableTableIds ?? []), [selectedSlot])
  const selectedTable = selectedTableId ? tableMap.get(selectedTableId) ?? null : null
  const hoveredTable = hoveredTableId ? tableMap.get(hoveredTableId) ?? null : null
  const activePeriod = defaultServicePeriods.find((period) => period.id === activePeriodId) ?? null

  const slotIsFull = selectedSlot?.status === 'full'
  const tableIsAvailable = selectedSlot ? availableSet.has(selectedTable?.id ?? '') : false
  const canReserve = Boolean(selectedSlot && selectedTable && tableIsAvailable && !slotIsFull)

  const viewportRef = useRef({ zoom: 0.95, translateX: 0, translateY: 0 })
  const [viewport, setViewport] = useState(viewportRef.current)
  const pointerPositions = useRef(new Map<number, { x: number; y: number }>())
  const panStateRef = useRef<PanState | null>(null)
  const pinchStateRef = useRef<PinchState | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const updateViewport = (updates: Partial<typeof viewportRef.current>) => {
    viewportRef.current = { ...viewportRef.current, ...updates }
    setViewport(viewportRef.current)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointerPositions.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointerPositions.current.size === 1) {
      panStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        baseX: viewportRef.current.translateX,
        baseY: viewportRef.current.translateY,
      }
      pinchStateRef.current = null
    } else if (pointerPositions.current.size === 2) {
      const ids = Array.from(pointerPositions.current.keys()) as [number, number]
      const first = pointerPositions.current.get(ids[0])
      const second = pointerPositions.current.get(ids[1])
      if (first && second) {
        const distance = Math.hypot(second.x - first.x, second.y - first.y)
        const midpoint = { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 }
        pinchStateRef.current = {
          pointerIds: ids,
          initialDistance: distance,
          initialZoom: viewportRef.current.zoom,
          initialTranslateX: viewportRef.current.translateX,
          initialTranslateY: viewportRef.current.translateY,
          initialMidpoint: midpoint,
        }
        panStateRef.current = null
      }
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerPositions.current.has(event.pointerId)) {
      return
    }

    pointerPositions.current.set(event.pointerId, { x: event.clientX, y: event.clientY })

    const pinchState = pinchStateRef.current
    if (pinchState) {
      const positions = pinchState.pointerIds
        .map((id) => pointerPositions.current.get(id))
        .filter((value): value is { x: number; y: number } => Boolean(value))
      if (positions.length === 2) {
        const distance = Math.hypot(positions[1].x - positions[0].x, positions[1].y - positions[0].y)
        const midpoint = { x: (positions[0].x + positions[1].x) / 2, y: (positions[0].y + positions[1].y) / 2 }
        const scaleFactor = distance / pinchState.initialDistance
        const nextZoom = clampZoom(pinchState.initialZoom * scaleFactor)
        const nextTranslateX = clampTranslation(
          pinchState.initialTranslateX + (midpoint.x - pinchState.initialMidpoint.x),
          nextZoom,
          FLOORPLAN_WIDTH,
        )
        const nextTranslateY = clampTranslation(
          pinchState.initialTranslateY + (midpoint.y - pinchState.initialMidpoint.y),
          nextZoom,
          FLOORPLAN_HEIGHT,
        )
        updateViewport({ zoom: nextZoom, translateX: nextTranslateX, translateY: nextTranslateY })
      }
      return
    }

    const panState = panStateRef.current
    if (panState && panState.pointerId === event.pointerId) {
      const deltaX = event.clientX - panState.startX
      const deltaY = event.clientY - panState.startY
      const nextTranslateX = clampTranslation(
        panState.baseX + deltaX,
        viewportRef.current.zoom,
        FLOORPLAN_WIDTH,
      )
      const nextTranslateY = clampTranslation(
        panState.baseY + deltaY,
        viewportRef.current.zoom,
        FLOORPLAN_HEIGHT,
      )
      updateViewport({ translateX: nextTranslateX, translateY: nextTranslateY })
    }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerPositions.current.delete(event.pointerId)

    if (pinchStateRef.current?.pointerIds.includes(event.pointerId)) {
      pinchStateRef.current = null
      if (pointerPositions.current.size === 1) {
        const remainingEntry = pointerPositions.current.entries().next()
        if (!remainingEntry.done) {
          const [remainingId, position] = remainingEntry.value
          panStateRef.current = {
            pointerId: remainingId,
            startX: position.x,
            startY: position.y,
            baseX: viewportRef.current.translateX,
            baseY: viewportRef.current.translateY,
          }
        }
      }
    }

    if (panStateRef.current?.pointerId === event.pointerId) {
      panStateRef.current = null
    }

    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    pointerPositions.current.delete(event.pointerId)
    if (panStateRef.current?.pointerId === event.pointerId) {
      panStateRef.current = null
    }
    if (pinchStateRef.current?.pointerIds.includes(event.pointerId)) {
      pinchStateRef.current = null
    }
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const adjustZoom = (delta: number) => {
    const nextZoom = clampZoom(viewportRef.current.zoom + delta)
    updateViewport({
      zoom: nextZoom,
      translateX: clampTranslation(viewportRef.current.translateX, nextZoom, FLOORPLAN_WIDTH),
      translateY: clampTranslation(viewportRef.current.translateY, nextZoom, FLOORPLAN_HEIGHT),
    })
  }

  const resetViewport = () => {
    viewportRef.current = { zoom: 0.95, translateX: 0, translateY: 0 }
    setViewport(viewportRef.current)
    pointerPositions.current.clear()
    panStateRef.current = null
    pinchStateRef.current = null
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6">
        <header className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">The Schiehallion Kitchen</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white md:text-4xl">
                Choose your table, time, and tasting journey
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                View the live floor plan, highlight accessibility-friendly options, and secure a time that suits your plans.
                Availability updates every few seconds as bookings flow through concierge, website, and partner channels.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" /> Available
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" /> Held
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" /> Reserved
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-4">
              <label className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Dining Date</span>
                <select
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Service Period</span>
                <div className="flex flex-wrap gap-2">
                  {periodsForDate.map((period) => (
                    <button
                      type="button"
                      key={period.id}
                      onClick={() => setActivePeriodId(period.id)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                        period.id === activePeriodId
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'border border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {period.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {activePeriod && (
              <div className="max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                <p className="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Chef Notes</p>
                <p className="mt-1 leading-relaxed">{activePeriod.notes}</p>
                <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Zones open: {activePeriod.zonesOpen.map((zone) => formatZoneLabel(zone)).join(', ')}
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" /> Available tables
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-slate-300" /> Unavailable this slot
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-indigo-500" /> Accessibility icons
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => adjustZoom(-0.15)}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustZoom(0.15)}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={resetViewport}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div
                ref={containerRef}
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner dark:border-slate-800 dark:bg-slate-950"
                style={{ touchAction: 'none' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              >
                <div
                  className="relative"
                  style={{
                    width: FLOORPLAN_WIDTH,
                    height: FLOORPLAN_HEIGHT,
                    transform: `translate(${viewport.translateX}px, ${viewport.translateY}px) scale(${viewport.zoom})`,
                    transformOrigin: 'center center',
                    backgroundImage:
                      'linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                >
                  <div className="absolute inset-0">
                    {zoneBackgrounds.map((item) => (
                      <div
                        key={item.zone}
                        className={`absolute rounded-xl border ${item.className}`}
                        style={item.style}
                      >
                        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
                          {formatZoneLabel(item.zone)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {tables.map((table) => {
                          const state = resolveTableState(table, availableSet, selectedTableId)
                          const accessibilityBadges = table.accessibility.map((key) => accessibilityIcons[key])
                          const className = state.isAvailable
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : table.status === 'reserved'
                            ? 'bg-rose-100 text-rose-700 border-rose-400'
                            : table.status === 'held'
                            ? 'bg-amber-100 text-amber-700 border-amber-400'
                            : table.status === 'maintenance'
                            ? 'bg-slate-200 text-slate-500 border-slate-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'

                          return (
                            <button
                              key={table.id}
                              type="button"
                              onClick={() => state.isSelectable && setSelectedTableId(table.id)}
                              onMouseEnter={() => setHoveredTableId(table.id)}
                              onMouseLeave={() => setHoveredTableId((current) => (current === table.id ? null : current))}
                              onFocus={() => setHoveredTableId(table.id)}
                              onBlur={() => setHoveredTableId((current) => (current === table.id ? null : current))}
                              style={{
                                width: TABLE_SIZE,
                                height: TABLE_SIZE,
                                transform: `translate(${table.position.x}px, ${table.position.y}px)`,
                              }}
                              className={`absolute flex flex-col items-center justify-center rounded-xl border-2 px-2 text-center text-sm font-semibold shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${className} ${
                                state.isSelected ? 'ring-2 ring-emerald-500' : 'ring-0'
                              } ${state.isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
                              aria-pressed={state.isSelected}
                              aria-label={`${table.label}, ${formatZoneLabel(table.zone)} zone, ${table.capacity.default} seats`}
                              disabled={!state.isSelectable}
                            >
                              <span className="text-base font-bold">{table.label}</span>
                              <span className="text-xs font-medium">{table.capacity.default} seats</span>
                              <span
                                className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${zoneBadgeStyles[table.zone]}`}
                              >
                                {formatZoneLabel(table.zone)}
                              </span>
                              {accessibilityBadges.length > 0 && (
                                <div className="mt-1 flex gap-1 text-[11px] text-indigo-600 dark:text-indigo-200">
                                  {accessibilityBadges.map((item) => (
                                    <span key={`${table.id}-${item.label}`} title={item.label} aria-label={item.label}>
                                      {item.icon}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </button>
                          )
                        })}

                  {hoveredTable && (
                    <div className="pointer-events-none absolute bottom-4 left-4 max-w-[260px] rounded-xl border border-slate-200 bg-white/95 p-4 text-xs text-slate-600 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{hoveredTable.label}</p>
                      <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {formatZoneLabel(hoveredTable.zone)} · Default {hoveredTable.capacity.default} seats
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {hoveredTable.features.map((feature) => (
                          <span
                            key={`${hoveredTable.id}-${feature}`}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                          >
                            {featureMap.get(feature) ?? feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Reservation Summary</h2>
              {selectedSlot ? (
                <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {formatTimeLabel(selectedSlot.time)} · {addMinutesToTime(selectedSlot.time, selectedSlot.durationMinutes)}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Approximately {selectedSlot.durationMinutes} minutes · Last booking {selectedSlot.lastBookingCutoff}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Availability updates live — {selectedSlot.availableTableIds.length} of {selectedSlot.totalTables} tables · {selectedSlot.capacityAvailable} seats ready.
                    </p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Live refresh {formatIsoTime(selectedSlot.lastUpdated)}
                    </p>
                    {selectedSlot.specialEvent && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-200">
                        <span className="text-lg" aria-hidden="true">
                          {slotEventIcon[selectedSlot.specialEvent.tone]}
                        </span>
                        <div>
                          <p className="font-semibold">{selectedSlot.specialEvent.label}</p>
                          {selectedSlot.specialEvent.description && <p>{selectedSlot.specialEvent.description}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedTable ? (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">{selectedTable.label}</p>
                          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {formatZoneLabel(selectedTable.zone)} · Seats {selectedTable.capacity.min}–{selectedTable.capacity.max}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                            tableIsAvailable
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                          }`}
                        >
                          {tableIsAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {selectedTable.features.map((feature) => (
                          <span
                            key={`${selectedTable.id}-${feature}`}
                            className="rounded-full bg-white px-2 py-0.5 text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-200"
                          >
                            {featureMap.get(feature) ?? feature}
                          </span>
                        ))}
                      </div>
                      {selectedTable.accessibility.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-[11px] text-indigo-600 dark:text-indigo-200">
                          {selectedTable.accessibility.map((item) => (
                            <span
                              key={`${selectedTable.id}-${item}`}
                              className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 dark:bg-indigo-900/40"
                            >
                              <span aria-hidden="true">{accessibilityIcons[item].icon}</span>
                              <span>{accessibilityMap.get(item)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      {selectedTable.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{selectedTable.notes}</p>
                      )}
                      {selectedTable.combinableWith.length > 0 && (
                        <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          Can combine with {selectedTable.combinableWith.map((id) => tableMap.get(id)?.label ?? id).join(', ')}
                        </p>
                      )}

                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          type="button"
                          disabled={!canReserve}
                          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            canReserve
                              ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-500'
                              : 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                          onClick={() => {
                            if (canReserve && selectedSlot && selectedTable) {
                              window.alert(`Table ${selectedTable.label} reserved for ${formatTimeLabel(selectedSlot.time)}!`)
                            }
                          }}
                        >
                          {canReserve ? 'Reserve this table' : slotIsFull ? 'Slot full — join waitlist' : 'Select highlighted table'}
                        </button>
                        {slotIsFull && (
                          <button
                            type="button"
                            className="rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                            onClick={() => window.alert('Added to waitlist — our host will confirm shortly.')}
                          >
                            Join waitlist
                          </button>
                        )}
                      </div>
                      {!tableIsAvailable && !slotIsFull && (
                        <p className="text-xs text-amber-600 dark:text-amber-300">
                          This table is linked to another reservation right now. Choose any table highlighted in emerald to proceed.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tap a table on the plan to view features and availability.</p>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No slots available for this service. Try another date or period.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Time Slot Management</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Live availability by service. Select a slot to reveal matching tables and estimated dining duration.
              </p>
              <div className="mt-4 space-y-3">
                {slotsForPeriod.map((slot) => {
                  const statusClass = slotStatusStyles[slot.status]
                  const isActive = slot.id === selectedSlotId
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/60 dark:border-emerald-400 dark:bg-emerald-900/40'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">
                            {formatTimeLabel(slot.time)} · {addMinutesToTime(slot.time, slot.durationMinutes)}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {slot.durationMinutes} min experience · Last booking {slot.lastBookingCutoff}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
                          {slot.status}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-3">
                        <span>{slot.availableTableIds.length} tables free</span>
                        <span>{slot.capacityAvailable} seats open</span>
                        <span>Updated {formatIsoTime(slot.lastUpdated)}</span>
                      </div>
                      {slot.specialEvent && (
                        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">
                          {slotEventIcon[slot.specialEvent.tone]} {slot.specialEvent.label}
                        </p>
                      )}
                    </button>
                  )
                })}
                {slotsForPeriod.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No slots released yet for this period. Check back shortly or choose another service.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
