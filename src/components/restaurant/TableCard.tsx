import { memo } from 'react'
import type { RestaurantTable, AccessibilityFeature, TableFeature } from '@/types/restaurant'

interface TableCardProps {
  table: RestaurantTable
  isSelected: boolean
  isAvailable: boolean
  isSelectable: boolean
  size: number
  onSelect: (tableId: string) => void
  onHover?: (tableId: string | null) => void
  accessibilityIcons: Record<AccessibilityFeature, { icon: string; label: string }>
  featureMap: Map<TableFeature, string>
  zoneBadgeStyles: Record<string, string>
  formatZoneLabel: (zone: string) => string
}

export const TableCard = memo(function TableCard({
  table,
  isSelected,
  isAvailable,
  isSelectable,
  size,
  onSelect,
  onHover,
  accessibilityIcons,
  zoneBadgeStyles,
  formatZoneLabel,
}: TableCardProps) {
  const className = isAvailable
    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
    : table.status === 'reserved'
    ? 'bg-rose-100 text-rose-700 border-rose-400'
    : table.status === 'held'
    ? 'bg-amber-100 text-amber-700 border-amber-400'
    : table.status === 'maintenance'
    ? 'bg-slate-200 text-slate-500 border-slate-300'
    : 'bg-slate-100 text-slate-600 border-slate-200'

  const accessibilityBadges = table.accessibility.map((key) => accessibilityIcons[key])

  return (
    <button
      type="button"
      onClick={() => isSelectable && onSelect(table.id)}
      onMouseEnter={() => onHover?.(table.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(table.id)}
      onBlur={() => onHover?.(null)}
      style={{
        width: size,
        height: size,
        transform: `translate(${table.position.x}px, ${table.position.y}px)`,
      }}
      className={`absolute flex flex-col items-center justify-center rounded-xl border-2 px-2 text-center text-sm font-semibold shadow-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${className} ${
        isSelected ? 'ring-2 ring-emerald-500' : 'ring-0'
      } ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
      aria-pressed={isSelected}
      aria-label={`${table.label}, ${formatZoneLabel(table.zone)} zone, ${table.capacity.default} seats`}
      disabled={!isSelectable}
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
})