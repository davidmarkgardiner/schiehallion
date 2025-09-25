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
    className: 'bg-lundies-heather/15 border-lundies-heather/50',
  },
  {
    zone: 'main_dining',
    style: { left: '38%', top: '6%', width: '54%', height: '56%' },
    className: 'bg-lundies-sand/20 border-lundies-sand/60',
  },
  {
    zone: 'private',
    style: { left: '4%', top: '52%', width: '34%', height: '40%' },
    className: 'bg-lundies-peat/15 border-lundies-peat/50',
  },
  {
    zone: 'terrace',
    style: { left: '38%', top: '60%', width: '34%', height: '32%' },
    className: 'bg-lundies-heather/20 border-lundies-heather/50',
  },
  {
    zone: 'chef_counter',
    style: { left: '72%', top: '58%', width: '24%', height: '28%' },
    className: 'bg-lundies-stone/30 border-lundies-stone/60',
  },
]

const zoneBadgeStyles: Record<TableZone, string> = {
  main_dining: 'bg-lundies-sand/30 text-lundies-sand',
  window: 'bg-lundies-heather/30 text-lundies-heather',
  private: 'bg-lundies-peat/25 text-lundies-peat',
  terrace: 'bg-lundies-heather/25 text-lundies-heather',
  chef_counter: 'bg-lundies-stone/40 text-lundies-stone',
}

const tableStatusStyles: Record<RestaurantTable['status'], string> = {
  available: 'border-lundies-heather bg-lundies-heather/20 text-lundies-charcoal',
  held: 'border-lundies-sand bg-lundies-sand/20 text-lundies-sand',
  reserved: 'border-lundies-peat bg-lundies-peat/20 text-lundies-peat',
  maintenance: 'border-lundies-stone bg-lundies-stone/30 text-lundies-stone',
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
    <div className="min-h-screen bg-lundies-linen/80 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-lundies-stone/60 bg-white/95 p-8 shadow-lg shadow-lundies-stone/30">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-lundies-peat">Restaurant Module</p>
              <h1 className="text-3xl font-semibold text-lundies-charcoal">
                Table Management Studio
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetLayout}
                className="rounded-lg border border-lundies-stone/60 px-4 py-2 text-sm font-medium text-lundies-peat transition hover:border-lundies-heather hover:bg-white/70 hover:text-lundies-heather"
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                onClick={addServicePeriod}
                className="rounded-lg bg-lundies-heather px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-lundies-heather/90"
              >
                Add Service Period
              </button>
            </div>
          </div>
          <p className="max-w-3xl text-sm text-lundies-peat">
            Drag tables to rearrange the floor plan, configure capacity rules, and map service periods to guest-facing
            experiences. Every change syncs with live availability and the guest table selector.
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <section>
              <div className="rounded-3xl border border-lundies-stone/60 bg-white/95 p-6 shadow-lg shadow-lundies-stone/30">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-lundies-charcoal">Floor Plan Editor</h2>
                  <p className="text-sm text-lundies-peat">
                    Visualise the dining room, highlight zones, and drag tables into new positions.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-lundies-peat">
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-lundies-heather" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-lundies-sand" /> Held
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-lundies-peat" /> Reserved
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded-full bg-lundies-stone" /> Maintenance
                  </span>
                </div>
              </div>

                <div
                  ref={floorplanRef}
                  className="relative mx-auto flex max-w-full items-center justify-center overflow-hidden rounded-3xl border border-lundies-stone/60 bg-lundies-linen/70 shadow-inner"
                  style={{
                    width: FLOORPLAN_WIDTH,
                    height: FLOORPLAN_HEIGHT,
                    backgroundImage:
                      'linear-gradient(to right, rgba(214, 206, 195, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(214, 206, 195, 0.2) 1px, transparent 1px)',
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
                      <span className="absolute left-2 top-2 rounded-full border border-lundies-stone/50 bg-white/90 px-2 py-1 text-xs font-medium text-lundies-peat shadow-sm">
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
                      className={`absolute flex flex-col items-center justify-center rounded-xl border-2 px-2 text-center text-sm font-semibold text-lundies-charcoal shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-lundies-heather ${tableStatusStyles[table.status]} ${
                        isSelected ? 'ring-2 ring-lundies-heather' : 'ring-0'
                      } ${draggingId === table.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                      <span className="text-base font-bold">{table.label}</span>
                      <span className="text-xs font-medium text-lundies-peat">
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
              <div className="rounded-3xl border border-lundies-stone/60 bg-white/95 p-6 shadow-lg shadow-lundies-stone/30">
              <h2 className="text-xl font-semibold text-lundies-charcoal">Table Configuration</h2>
              {selectedTable ? (
                <div className="mt-4 space-y-6 text-sm text-lundies-peat">
                  <div className="grid gap-3">
                    <label className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                      Table Label
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-lundies-charcoal">{selectedTable.label}</span>
                      <span className="rounded-full border border-lundies-stone/60 px-2 py-0.5 text-xs text-lundies-peat">
                        ID: {selectedTable.id}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {(['min', 'default', 'max'] as const).map((key) => (
                      <label key={key} className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                          {key === 'min' && 'Minimum'}
                          {key === 'default' && 'Default'}
                          {key === 'max' && 'Maximum'}
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={selectedTable.capacity[key]}
                          onChange={(event) => handleCapacityChange(key, Number(event.target.value))}
                          className="rounded-lg border border-lundies-stone/60 px-3 py-2 text-sm text-lundies-charcoal shadow-sm focus:border-lundies-heather focus:outline-none focus:ring-1 focus:ring-lundies-heather"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                      Zone
                    </span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {tableZoneOptions.map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => handleZoneChange(option.value)}
                          className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition ${
                            selectedTable.zone === option.value
                              ? 'border-lundies-heather bg-lundies-heather/20 shadow-inner'
                              : 'border-lundies-stone/60 bg-white/95 hover:border-lundies-heather hover:bg-lundies-heather/15'
                          }`}
                        >
                          <span
                            className={`text-sm font-semibold ${
                              selectedTable.zone === option.value
                                ? 'text-lundies-heather'
                                : 'text-lundies-charcoal'
                            }`}
                          >
                            {option.label}
                          </span>
                          <span className="text-xs text-lundies-peat">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
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
                              ? 'bg-lundies-heather text-white shadow'
                              : 'border border-lundies-stone/60 text-lundies-peat hover:border-lundies-heather hover:text-lundies-heather'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
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
                            className={`flex flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition hover:border-lundies-heather hover:bg-lundies-heather/15 ${
                              active
                                ? 'border-lundies-heather bg-lundies-heather/20 text-lundies-heather'
                                : 'border-lundies-stone/60 bg-white/95 text-lundies-peat hover:border-lundies-heather hover:bg-lundies-heather/10'
                            }`}
                          >
                            <span
                              className={`text-sm font-semibold ${
                                active ? 'text-lundies-heather' : 'text-lundies-charcoal'
                              }`}
                            >
                              {option.label}
                            </span>
                            <span className="text-xs text-lundies-peat">{option.description}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
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
                                ? 'bg-lundies-heather text-white shadow-sm'
                                : 'border border-lundies-stone/60 text-lundies-peat hover:border-lundies-heather hover:text-lundies-heather'
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-lundies-peat">
                      Accessibility badges display on the guest floor plan and feed the concierge assistant for pre-arrival
                      planning.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
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
                              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                                combined
                                  ? 'border-lundies-heather bg-lundies-heather/20 text-lundies-heather shadow-inner'
                                  : 'border-lundies-stone/60 bg-white/95 text-lundies-peat hover:border-lundies-heather hover:bg-lundies-heather/10'
                              }`}
                            >
                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    combined ? 'text-lundies-heather' : 'text-lundies-charcoal'
                                  }`}
                                >
                                  {table.label}
                                </p>
                                <p className="text-xs text-lundies-peat">
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
                    <p className="text-xs text-lundies-peat">
                      {combinationSummary.tables} tables · {combinationSummary.seats} guests when combined with current configuration.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                      Notes for Team Briefing
                    </span>
                    <textarea
                      value={selectedTable.notes ?? ''}
                      onChange={(event) => handleNotesChange(event.target.value)}
                      rows={3}
                      className="rounded-xl border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal shadow-sm focus:border-lundies-heather focus:outline-none focus:ring-1 focus:ring-lundies-heather"
                      placeholder="Capture service notes, celebration cues, or pairing suggestions for staff."
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-lundies-peat">Select a table to configure settings.</p>
              )}
            </div>

            <div className="rounded-3xl border border-lundies-stone/60 bg-white/95 p-6 shadow-lg shadow-lundies-stone/30">
              <h2 className="text-xl font-semibold text-lundies-charcoal">Service Period Configuration</h2>
              <p className="mt-1 text-sm text-lundies-peat">
                Control opening times, seating duration, and which zones are offered to guests for each service.
              </p>
              <div className="mt-4 space-y-5">
                  {periods.map((period) => (
                    <div
                      key={period.id}
                      className="rounded-2xl border border-lundies-stone/60 bg-white/95 p-4 transition hover:border-lundies-heather hover:shadow-md"
                    >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                          <h3 className="text-lg font-semibold text-lundies-charcoal">{period.name}</h3>
                        <p className="text-xs uppercase tracking-wide text-lundies-peat">
                          Last booking {period.lastSeatingTime} · Max party {period.maxPartySize}
                        </p>
                      </div>
                      <div className="flex gap-2 text-xs text-lundies-peat">
                        <span>{period.startTime}</span>
                        <span aria-hidden="true">—</span>
                        <span>{period.endTime}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                          Start Time
                        </span>
                        <input
                          type="time"
                          value={period.startTime}
                          onChange={(event) => updateServicePeriod(period.id, { startTime: event.target.value })}
                            className="rounded-lg border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none focus:ring-1 focus:ring-lundies-heather"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                          End Time
                        </span>
                        <input
                          type="time"
                          value={period.endTime}
                          onChange={(event) => updateServicePeriod(period.id, { endTime: event.target.value })}
                            className="rounded-lg border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none focus:ring-1 focus:ring-lundies-heather"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                          Default Duration (minutes)
                        </span>
                        <input
                          type="number"
                          min={30}
                          value={period.defaultDurationMinutes}
                          onChange={(event) =>
                            updateServicePeriod(period.id, { defaultDurationMinutes: Number(event.target.value) })
                          }
                          className="rounded-lg border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none focus:ring-1 focus:ring-lundies-heather"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                          Turnaround Buffer (minutes)
                        </span>
                        <input
                          type="number"
                          min={10}
                          value={period.turnaroundBufferMinutes}
                          onChange={(event) =>
                            updateServicePeriod(period.id, { turnaroundBufferMinutes: Number(event.target.value) })
                          }
                          className="rounded-lg border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none focus:ring-1 focus:ring-lundies-heather"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                          Last Seating
                        </span>
                        <input
                          type="time"
                          value={period.lastSeatingTime}
                          onChange={(event) => updateServicePeriod(period.id, { lastSeatingTime: event.target.value })}
                          className="rounded-lg border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none focus:ring-1 focus:ring-lundies-heather"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
                          Maximum Party Size
                        </span>
                        <input
                          type="number"
                          min={2}
                          value={period.maxPartySize}
                          onChange={(event) => updateServicePeriod(period.id, { maxPartySize: Number(event.target.value) })}
                          className="rounded-lg border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none focus:ring-1 focus:ring-lundies-heather"
                        />
                      </label>
                    </div>

                    <div className="mt-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-lundies-peat">
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
                                  ? 'bg-lundies-heather text-white shadow-sm'
                                  : 'border border-lundies-stone/60 text-lundies-peat hover:border-lundies-heather hover:text-lundies-heather'
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
                      className="mt-3 w-full rounded-xl border border-lundies-stone/60 bg-white/95 px-3 py-2 text-sm text-lundies-charcoal shadow-sm focus:border-lundies-heather focus:outline-none focus:ring-1 focus:ring-lundies-heather"
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
