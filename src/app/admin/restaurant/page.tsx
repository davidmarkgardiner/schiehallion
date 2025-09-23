'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  accessibilityOptions,
  defaultServicePeriods,
  restaurantTables,
  tableFeatureOptions,
  tableZoneOptions,
} from '@/data/restaurant'
import type {
  AccessibilityFeature,
  RestaurantTable,
  ServicePeriod,
  TableFeature,
  TableZone,
} from '@/types/restaurant'

const FLOORPLAN_WIDTH = 680
const FLOORPLAN_HEIGHT = 480
const TABLE_SIZE = 72

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

const zoneBadgeStyles: Record<TableZone, string> = {
  main_dining: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200',
  window: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200',
  private: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200',
  terrace: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200',
  chef_counter: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200',
}

const tableStatusStyles: Record<RestaurantTable['status'], string> = {
  available: 'border-emerald-500/70 bg-white/80 dark:bg-slate-900/80',
  held: 'border-amber-500/70 bg-amber-50/80 dark:bg-amber-900/40',
  reserved: 'border-rose-500/70 bg-rose-50/80 dark:bg-rose-900/40',
  maintenance: 'border-slate-400/70 bg-slate-100/70 dark:bg-slate-800/60',
}

function normaliseCapacity(capacity: RestaurantTable['capacity']): RestaurantTable['capacity'] {
  const min = Math.max(1, capacity.min)
  const defaultValue = Math.max(min, capacity.default)
  const max = Math.max(defaultValue, capacity.max)
  return { min, default: defaultValue, max }
}

function formatZoneLabel(zone: TableZone): string {
  const match = tableZoneOptions.find((option) => option.value === zone)
  return match ? match.label : zone
}

export default function RestaurantManagementStudio() {
  const { user, userProfile } = useAuth()
  const router = useRouter()

  const [tables, setTables] = useState<RestaurantTable[]>(restaurantTables)
  const [periods, setPeriods] = useState<ServicePeriod[]>(defaultServicePeriods)
  const [selectedTableId, setSelectedTableId] = useState<string>(restaurantTables[0]?.id ?? '')
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const floorplanRef = useRef<HTMLDivElement | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  useEffect(() => {
    if (!user) {
      router.push('/admin/login')
      return
    }

    if (!userProfile || !['manager', 'admin'].includes(userProfile.role)) {
      router.push('/')
    }
  }, [router, user, userProfile])

  useEffect(() => {
    if (!selectedTableId && tables.length > 0) {
      setSelectedTableId(tables[0].id)
    }
  }, [selectedTableId, tables])

  const selectedTable = useMemo(
    () => tables.find((table) => table.id === selectedTableId) ?? null,
    [selectedTableId, tables],
  )

  const combinationSummary = useMemo(() => {
    if (!selectedTable) {
      return { seats: 0, tables: 0 }
    }

    const comboTables = tables.filter((table) => selectedTable.combinableWith.includes(table.id))
    const seats = comboTables.reduce((total, table) => total + table.capacity.default, selectedTable.capacity.default)

    return {
      seats,
      tables: comboTables.length + 1,
    }
  }, [selectedTable, tables])

  const handleTablePositionStart = (tableId: string, clientX: number, clientY: number, pointerId: number) => {
    const container = floorplanRef.current
    const table = tables.find((item) => item.id === tableId)
    if (!container || !table) {
      return
    }

    const bounds = container.getBoundingClientRect()
    dragOffsetRef.current = {
      x: clientX - bounds.left - table.position.x,
      y: clientY - bounds.top - table.position.y,
    }
    pointerIdRef.current = pointerId
    setDraggingId(tableId)
  }

  const handleTablePositionMove = (event: React.PointerEvent<HTMLDivElement>, tableId: string) => {
    if (pointerIdRef.current !== event.pointerId || draggingId !== tableId) {
      return
    }

    const container = floorplanRef.current
    if (!container) {
      return
    }

    event.preventDefault()

    const bounds = container.getBoundingClientRect()
    const proposedX = event.clientX - bounds.left - dragOffsetRef.current.x
    const proposedY = event.clientY - bounds.top - dragOffsetRef.current.y

    const clampedX = Math.min(Math.max(0, proposedX), FLOORPLAN_WIDTH - TABLE_SIZE)
    const clampedY = Math.min(Math.max(0, proposedY), FLOORPLAN_HEIGHT - TABLE_SIZE)

    setTables((previous) =>
      previous.map((table) =>
        table.id === tableId ? { ...table, position: { x: clampedX, y: clampedY } } : table,
      ),
    )
  }

  const handleTablePositionEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === event.pointerId) {
      pointerIdRef.current = null
      dragOffsetRef.current = { x: 0, y: 0 }
      setDraggingId(null)
    }
  }

  const updateSelectedTable = (updater: (table: RestaurantTable) => RestaurantTable) => {
    if (!selectedTableId) {
      return
    }

    setTables((previous) => previous.map((table) => (table.id === selectedTableId ? updater(table) : table)))
  }

  const handleCapacityChange = (field: keyof RestaurantTable['capacity'], value: number) => {
    updateSelectedTable((table) => {
      const updatedCapacity = normaliseCapacity({ ...table.capacity, [field]: value })
      return { ...table, capacity: updatedCapacity }
    })
  }

  const toggleTableFeature = (feature: TableFeature) => {
    updateSelectedTable((table) => {
      const hasFeature = table.features.includes(feature)
      const features = hasFeature
        ? table.features.filter((item) => item !== feature)
        : [...table.features, feature]
      return { ...table, features }
    })
  }

  const toggleAccessibility = (option: AccessibilityFeature) => {
    updateSelectedTable((table) => {
      const hasOption = table.accessibility.includes(option)
      const accessibility = hasOption
        ? table.accessibility.filter((item) => item !== option)
        : [...table.accessibility, option]
      return { ...table, accessibility }
    })
  }

  const toggleCombination = (targetId: string) => {
    if (!selectedTableId || selectedTableId === targetId) {
      return
    }

    setTables((previous) =>
      previous.map((table) => {
        if (table.id === selectedTableId) {
          const has = table.combinableWith.includes(targetId)
          const combinableWith = has
            ? table.combinableWith.filter((item) => item !== targetId)
            : [...table.combinableWith, targetId]
          return { ...table, combinableWith }
        }

        if (table.id === targetId) {
          const has = table.combinableWith.includes(selectedTableId)
          const combinableWith = has
            ? table.combinableWith.filter((item) => item !== selectedTableId)
            : [...table.combinableWith, selectedTableId]
          return { ...table, combinableWith }
        }

        return table
      }),
    )
  }

  const handleZoneChange = (zone: TableZone) => {
    updateSelectedTable((table) => ({ ...table, zone }))
  }

  const handleStatusChange = (status: RestaurantTable['status']) => {
    updateSelectedTable((table) => ({ ...table, status }))
  }

  const handleNotesChange = (notes: string) => {
    updateSelectedTable((table) => ({ ...table, notes }))
  }

  const updateServicePeriod = (periodId: string, changes: Partial<ServicePeriod>) => {
    setPeriods((previous) => previous.map((period) => (period.id === periodId ? { ...period, ...changes } : period)))
  }

  const toggleServiceZone = (periodId: string, zone: TableZone) => {
    setPeriods((previous) =>
      previous.map((period) => {
        if (period.id !== periodId) {
          return period
        }
        const hasZone = period.zonesOpen.includes(zone)
        const zonesOpen = hasZone
          ? period.zonesOpen.filter((item) => item !== zone)
          : [...period.zonesOpen, zone]
        return { ...period, zonesOpen }
      }),
    )
  }

  const addServicePeriod = () => {
    const index = periods.length + 1
    const newPeriod: ServicePeriod = {
      id: `custom-${index}`,
      name: `New Service ${index}`,
      startTime: '17:00',
      endTime: '19:00',
      lastSeatingTime: '18:30',
      defaultDurationMinutes: 90,
      turnaroundBufferMinutes: 20,
      maxPartySize: 8,
      zonesOpen: ['main_dining'],
      notes: 'Custom service period configured by manager.',
    }

    setPeriods((previous) => [...previous, newPeriod])
  }

  const resetLayout = () => {
    setTables(restaurantTables)
    setPeriods(defaultServicePeriods)
    setSelectedTableId(restaurantTables[0]?.id ?? '')
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6">
        <header className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">Restaurant Module</p>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-950">
                Table Management Studio
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetLayout}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={addServicePeriod}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-emerald-500"
              >
                Add Service Period
              </button>
            </div>
          </div>
          <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
            Drag tables to rearrange the floor plan, configure capacity rules, and map service periods to guest-facing
            experiences. Every change syncs with live availability and the guest table selector.
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-950">Floor Plan Editor</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Visualise the dining room, highlight zones, and drag tables into new positions.
                  </p>
                </div>
                <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-amber-500" /> Held
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-rose-500" /> Reserved
                  </span>
                </div>
              </div>

              <div
                ref={floorplanRef}
                className="relative mx-auto flex max-w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner dark:border-slate-800 dark:bg-slate-950"
                style={{
                  width: FLOORPLAN_WIDTH,
                  height: FLOORPLAN_HEIGHT,
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
                  const isSelected = table.id === selectedTableId
                  return (
                    <div
                      key={table.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTableId(table.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedTableId(table.id)
                        }
                      }}
                      onPointerDown={(event) => {
                        event.preventDefault()
                        ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
                        handleTablePositionStart(table.id, event.clientX, event.clientY, event.pointerId)
                        setSelectedTableId(table.id)
                      }}
                      onPointerMove={(event) => handleTablePositionMove(event, table.id)}
                      onPointerUp={(event) => {
                        ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)
                        handleTablePositionEnd(event)
                      }}
                      onPointerCancel={(event) => handleTablePositionEnd(event)}
                      style={{
                        width: TABLE_SIZE,
                        height: TABLE_SIZE,
                        transform: `translate(${table.position.x}px, ${table.position.y}px)`,
                      }}
                      className={`absolute flex flex-col items-center justify-center rounded-xl border-2 px-2 text-center text-sm font-semibold text-slate-700 shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-slate-100 ${tableStatusStyles[table.status]} ${
                        isSelected ? 'ring-2 ring-emerald-500' : 'ring-0'
                      } ${draggingId === table.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      <span className="text-base font-bold">{table.label}</span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {table.capacity.default} seats
                      </span>
                      <span
                        className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${zoneBadgeStyles[table.zone]}`}
                      >
                        {formatZoneLabel(table.zone)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-950">Table Configuration</h2>
              {selectedTable ? (
                <div className="mt-4 space-y-6 text-sm text-slate-600 dark:text-slate-300">
                  <div className="grid gap-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Table Label
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-slate-900 dark:text-slate-950">{selectedTable.label}</span>
                      <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                        ID: {selectedTable.id}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {(['min', 'default', 'max'] as const).map((key) => (
                      <label key={key} className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {key === 'min' && 'Minimum'}
                          {key === 'default' && 'Default'}
                          {key === 'max' && 'Maximum'}
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={selectedTable.capacity[key]}
                          onChange={(event) => handleCapacityChange(key, Number(event.target.value))}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Zone
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {tableZoneOptions.map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => handleZoneChange(option.value)}
                          className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 ${
                            selectedTable.zone === option.value
                              ? 'border-emerald-500 bg-emerald-50/60 dark:border-emerald-400 dark:bg-emerald-900/40'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {option.label}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Status
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(['available', 'held', 'reserved', 'maintenance'] as const).map((status) => (
                        <button
                          type="button"
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                            selectedTable.status === status
                              ? 'bg-emerald-600 text-slate-950 shadow'
                              : 'border border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-500 dark:border-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Features
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {tableFeatureOptions.map((option) => {
                        const active = selectedTable.features.includes(option.value)
                        return (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => toggleTableFeature(option.value)}
                            className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 ${
                              active
                                ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-200'
                                : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {option.label}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Accessibility
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {accessibilityOptions.map((option) => {
                        const active = selectedTable.accessibility.includes(option.value)
                        return (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => toggleAccessibility(option.value)}
                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                              active
                                ? 'bg-sky-600 text-slate-950 shadow-sm'
                                : 'border border-slate-300 text-slate-500 hover:border-sky-400 hover:text-sky-600 dark:border-slate-700 dark:text-slate-400'
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Accessibility badges display on the guest floor plan and feed the concierge assistant for pre-arrival
                      planning.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Combinable Tables
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {tables
                        .filter((table) => table.id !== selectedTable.id)
                        .map((table) => {
                          const combined = selectedTable.combinableWith.includes(table.id)
                          return (
                            <button
                              type="button"
                              key={table.id}
                              onClick={() => toggleCombination(table.id)}
                              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 ${
                                combined
                                  ? 'border-emerald-500 bg-emerald-50/60 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/40'
                                  : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{table.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Default {table.capacity.default} seats · {formatZoneLabel(table.zone)} zone
                                </p>
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                {combined ? 'Linked' : 'Link'}
                              </span>
                            </button>
                          )
                        })}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {combinationSummary.tables} tables · {combinationSummary.seats} guests when combined with current configuration.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Notes for Team Briefing
                    </span>
                    <textarea
                      value={selectedTable.notes ?? ''}
                      onChange={(event) => handleNotesChange(event.target.value)}
                      rows={3}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="Capture service notes, celebration cues, or pairing suggestions for staff."
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Select a table to configure settings.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-950">Service Period Configuration</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Control opening times, seating duration, and which zones are offered to guests for each service.
              </p>
              <div className="mt-4 space-y-5">
                {periods.map((period) => (
                  <div
                    key={period.id}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-400 dark:border-slate-800 dark:hover:border-emerald-500/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{period.name}</h3>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Last booking {period.lastSeatingTime} · Max party {period.maxPartySize}
                        </p>
                      </div>
                      <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{period.startTime}</span>
                        <span aria-hidden="true">—</span>
                        <span>{period.endTime}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Start Time
                        </span>
                        <input
                          type="time"
                          value={period.startTime}
                          onChange={(event) => updateServicePeriod(period.id, { startTime: event.target.value })}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          End Time
                        </span>
                        <input
                          type="time"
                          value={period.endTime}
                          onChange={(event) => updateServicePeriod(period.id, { endTime: event.target.value })}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Default Duration (minutes)
                        </span>
                        <input
                          type="number"
                          min={30}
                          value={period.defaultDurationMinutes}
                          onChange={(event) =>
                            updateServicePeriod(period.id, { defaultDurationMinutes: Number(event.target.value) })
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Turnaround Buffer (minutes)
                        </span>
                        <input
                          type="number"
                          min={10}
                          value={period.turnaroundBufferMinutes}
                          onChange={(event) =>
                            updateServicePeriod(period.id, { turnaroundBufferMinutes: Number(event.target.value) })
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Last Seating
                        </span>
                        <input
                          type="time"
                          value={period.lastSeatingTime}
                          onChange={(event) => updateServicePeriod(period.id, { lastSeatingTime: event.target.value })}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Maximum Party Size
                        </span>
                        <input
                          type="number"
                          min={2}
                          value={period.maxPartySize}
                          onChange={(event) => updateServicePeriod(period.id, { maxPartySize: Number(event.target.value) })}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        />
                      </label>
                    </div>

                    <div className="mt-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Zones Available
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {tableZoneOptions.map((zone) => {
                          const active = period.zonesOpen.includes(zone.value)
                          return (
                            <button
                              type="button"
                              key={`${period.id}-${zone.value}`}
                              onClick={() => toggleServiceZone(period.id, zone.value)}
                              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                active
                                  ? 'bg-emerald-600 text-slate-950 shadow-sm'
                                  : 'border border-slate-300 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400'
                              }`}
                            >
                              {zone.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <textarea
                      value={period.notes ?? ''}
                      onChange={(event) => updateServicePeriod(period.id, { notes: event.target.value })}
                      rows={3}
                      className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      placeholder="Brief front-of-house on menu focus, live entertainment, or partner promotions."
                    />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}
