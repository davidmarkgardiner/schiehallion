import { memo, useMemo } from 'react'
import { TableCard } from './TableCard'
import type { RestaurantTable, AccessibilityFeature, TableFeature, TableZone } from '@/types/restaurant'

interface ZoneBackground {
  zone: TableZone
  style: React.CSSProperties
  className: string
}

interface FloorPlanProps {
  tables: RestaurantTable[]
  selectedTableId: string | null
  availableTableIds: string[]
  hoveredTableId?: string | null
  width: number
  height: number
  tableSize: number
  onTableSelect: (tableId: string) => void
  onTableHover?: (tableId: string | null) => void
  zoneBackgrounds: ZoneBackground[]
  zoneBadgeStyles: Record<string, string>
  accessibilityIcons: Record<AccessibilityFeature, { icon: string; label: string }>
  featureMap: Map<TableFeature, string>
  formatZoneLabel: (zone: string) => string
}

export const FloorPlan = memo(function FloorPlan({
  tables,
  selectedTableId,
  availableTableIds,
  hoveredTableId,
  width,
  height,
  tableSize,
  onTableSelect,
  onTableHover,
  zoneBackgrounds,
  zoneBadgeStyles,
  accessibilityIcons,
  featureMap,
  formatZoneLabel,
}: FloorPlanProps) {
  const availableSet = useMemo(() => new Set(availableTableIds), [availableTableIds])

  const resolveTableState = useMemo(() => {
    return (table: RestaurantTable) => {
      const isAvailable = availableSet.has(table.id)
      const isSelected = selectedTableId === table.id
      const isSelectable = isAvailable && table.status !== 'maintenance' && table.status !== 'reserved'
      return { isAvailable, isSelected, isSelectable }
    }
  }, [availableSet, selectedTableId])

  return (
    <div
      className="relative"
      style={{
        width,
        height,
        backgroundImage:
          'linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      {/* Zone backgrounds */}
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

      {/* Tables */}
      {tables.map((table) => {
        const state = resolveTableState(table)
        return (
          <TableCard
            key={table.id}
            table={table}
            isSelected={state.isSelected}
            isAvailable={state.isAvailable}
            isSelectable={state.isSelectable}
            size={tableSize}
            onSelect={onTableSelect}
            onHover={onTableHover}
            accessibilityIcons={accessibilityIcons}
            featureMap={featureMap}
            zoneBadgeStyles={zoneBadgeStyles}
            formatZoneLabel={formatZoneLabel}
          />
        )
      })}

      {/* Hovered table tooltip */}
      {hoveredTableId && (
        <TableTooltip
          table={tables.find(t => t.id === hoveredTableId)!}
          featureMap={featureMap}
          formatZoneLabel={formatZoneLabel}
        />
      )}
    </div>
  )
})

interface TableTooltipProps {
  table: RestaurantTable
  featureMap: Map<TableFeature, string>
  formatZoneLabel: (zone: string) => string
}

const TableTooltip = memo(function TableTooltip({
  table,
  featureMap,
  formatZoneLabel,
}: TableTooltipProps) {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 max-w-[260px] rounded-xl border border-slate-200 bg-white/95 p-4 text-xs text-slate-600 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-300">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-950">{table.label}</p>
      <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {formatZoneLabel(table.zone)} · Default {table.capacity.default} seats
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {table.features.map((feature) => (
          <span
            key={`${table.id}-${feature}`}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200"
          >
            {featureMap.get(feature) ?? feature}
          </span>
        ))}
      </div>
    </div>
  )
})