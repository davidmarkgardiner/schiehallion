'use client'

import { useState } from 'react'
import { RoomType, RoomView, BedType } from '@/types/hotel'

export interface RoomFilterState {
  roomType?: RoomType
  maxOccupancy?: number
  priceRange: [number, number]
  view?: RoomView
  bedType?: BedType
  features: {
    wifi?: boolean
    airConditioning?: boolean
    balcony?: boolean
    bathtub?: boolean
    minibar?: boolean
    safe?: boolean
  }
  sortBy: 'price-low' | 'price-high' | 'rating' | 'popularity' | 'size'
}

interface RoomFiltersProps {
  filters: RoomFilterState
  onFiltersChange: (filters: RoomFilterState) => void
  isOpen: boolean
  onToggle: () => void
}

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: 'standard', label: 'Standard Room' },
  { value: 'deluxe', label: 'Deluxe Room' },
  { value: 'suite', label: 'Suite' },
  { value: 'family', label: 'Family Room' },
  { value: 'accessible', label: 'Accessible Room' },
]

const ROOM_VIEWS: { value: RoomView; label: string }[] = [
  { value: 'mountain', label: 'Mountain View' },
  { value: 'garden', label: 'Garden View' },
  { value: 'courtyard', label: 'Courtyard View' },
  { value: 'street', label: 'Street View' },
]

const BED_TYPES: { value: BedType; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'queen', label: 'Queen' },
  { value: 'king', label: 'King' },
  { value: 'twin', label: 'Twin' },
  { value: 'sofa-bed', label: 'Sofa Bed' },
]

const SORT_OPTIONS: { value: RoomFilterState['sortBy']; label: string }[] = [
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'size', label: 'Size' },
]

export default function RoomFilters({ filters, onFiltersChange, isOpen, onToggle }: RoomFiltersProps) {
  const updateFilter = (key: keyof RoomFilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const updateFeature = (feature: keyof RoomFilterState['features'], value: boolean) => {
    onFiltersChange({
      ...filters,
      features: {
        ...filters.features,
        [feature]: value,
      },
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [5000, 50000], // £50 to £500
      features: {},
      sortBy: 'price-low',
    })
  }

  const formatPrice = (price: number) => {
    return `£${(price / 100).toFixed(0)}`
  }

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 rounded-full border border-lundies-stone/60 bg-white/80 px-4 py-2 text-sm font-medium text-lundies-charcoal transition hover:bg-white/70"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {isOpen && (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 rounded-3xl border border-lundies-stone/60 bg-white/95 backdrop-blur-sm p-6 shadow-xl z-50">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-lundies-charcoal">Filter Rooms</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-lundies-moss hover:text-lundies-moss transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-lundies-peat mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as RoomFilterState['sortBy'])}
                className="w-full rounded-2xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-2 text-lundies-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-lundies-peat mb-2">Room Type</label>
              <select
                value={filters.roomType || ''}
                onChange={(e) => updateFilter('roomType', e.target.value || undefined)}
                className="w-full rounded-2xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-2 text-lundies-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
              >
                <option value="">Any Type</option>
                {ROOM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Occupancy */}
            <div>
              <label className="block text-sm font-medium text-lundies-peat mb-2">Guests</label>
              <select
                value={filters.maxOccupancy || ''}
                onChange={(e) => updateFilter('maxOccupancy', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full rounded-2xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-2 text-lundies-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
              >
                <option value="">Any Number</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-lundies-peat mb-2">
                Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="1000"
                  value={filters.priceRange[0]}
                  onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                  className="w-full h-2 bg-lundies-stone/60 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="5000"
                  max="50000"
                  step="1000"
                  value={filters.priceRange[1]}
                  onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-lundies-stone/60 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* View */}
            <div>
              <label className="block text-sm font-medium text-lundies-peat mb-2">View</label>
              <select
                value={filters.view || ''}
                onChange={(e) => updateFilter('view', e.target.value || undefined)}
                className="w-full rounded-2xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-2 text-lundies-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
              >
                <option value="">Any View</option>
                {ROOM_VIEWS.map(view => (
                  <option key={view.value} value={view.value}>
                    {view.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bed Type */}
            <div>
              <label className="block text-sm font-medium text-lundies-peat mb-2">Bed Type</label>
              <select
                value={filters.bedType || ''}
                onChange={(e) => updateFilter('bedType', e.target.value || undefined)}
                className="w-full rounded-2xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-2 text-lundies-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
              >
                <option value="">Any Bed</option>
                {BED_TYPES.map(bed => (
                  <option key={bed.value} value={bed.value}>
                    {bed.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-lundies-peat mb-3">Features</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'wifi' as const, label: 'WiFi' },
                  { key: 'airConditioning' as const, label: 'AC' },
                  { key: 'balcony' as const, label: 'Balcony' },
                  { key: 'bathtub' as const, label: 'Bathtub' },
                  { key: 'minibar' as const, label: 'Minibar' },
                  { key: 'safe' as const, label: 'Safe' },
                ].map(feature => (
                  <label key={feature.key} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.features[feature.key] || false}
                      onChange={(e) => updateFeature(feature.key, e.target.checked)}
                      className="rounded border-lundies-stone/60 bg-lundies-stone/40 text-lundies-moss focus:ring-2 focus:ring-lundies-heather"
                    />
                    <span className="text-lundies-peat">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}