'use client'

import { useState, useEffect, useMemo } from 'react'
import { Room, RoomType } from '@/types/hotel'
import RoomCard from './RoomCard'
import RoomFilters, { RoomFilterState } from './RoomFilters'
import { RoomService } from '@/lib/firebase/hotel-service-mock'
import { imageCacheService } from '@/services/imageCache'

type ViewMode = 'grid' | 'list'

interface RoomListProps {
  onRoomSelect?: (room: Room) => void
  checkInDate?: string
  checkOutDate?: string
  guests?: number
  selectedRoomType?: RoomType
}

export default function RoomList({ onRoomSelect, checkInDate, checkOutDate, guests, selectedRoomType }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<RoomFilterState>({
    priceRange: [5000, 50000], // £50 to £500
    features: {},
    sortBy: 'price-low',
  })

  // Preload images for visible room types
  const preloadImagesForRooms = useMemo(() => {
    return async (roomsData: Room[]) => {
      try {
        // Get unique room types from loaded rooms
        const roomTypes = [...new Set(roomsData.map(room => room.type))];

        // Fetch and preload images for each room type
        for (const roomType of roomTypes) {
          try {
            const response = await fetch(`/api/room-images/list?roomType=${roomType}`);
            if (response.ok) {
              const { images } = await response.json();
              const imageUrls = images.map((img: any) => img.url);

              if (imageUrls.length > 0) {
                // Preload images in background
                imageCacheService.preloadRoomImages(roomType as RoomType, imageUrls);
              }
              // If no images are found, we still want to continue without error
            }
          } catch (err) {
            console.warn(`Failed to preload images for ${roomType}:`, err);
            // Continue with other room types even if one fails
          }
        }
      } catch (err) {
        console.warn('Failed to preload room images:', err);
        // Don't fail the entire preload process if there's an error
      }
    };
  }, []);

  // Load rooms data
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true)
        setError(null)

        let roomsData: Room[]

        if (checkInDate && checkOutDate) {
          // Get available rooms for specific dates
          roomsData = await RoomService.getAvailableRooms(checkInDate, checkOutDate, guests)
        } else {
          // Get all rooms
          roomsData = await RoomService.getRooms({
            status: 'available',
            maxOccupancy: guests
          })
        }

        setRooms(roomsData)

        // Preload images for the loaded rooms
        preloadImagesForRooms(roomsData);
      } catch (err) {
        console.error('Failed to load rooms:', err)
        setError('Failed to load rooms. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
  }, [checkInDate, checkOutDate, guests, preloadImagesForRooms])

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...rooms]

    // Apply filters - prioritize external selectedRoomType over internal filter
    const effectiveRoomType = selectedRoomType || filters.roomType
    if (effectiveRoomType) {
      filtered = filtered.filter(room => room.type === effectiveRoomType)
    }

    if (filters.maxOccupancy) {
      filtered = filtered.filter(room => room.maxOccupancy >= filters.maxOccupancy!)
    }

    if (filters.view) {
      filtered = filtered.filter(room => room.view === filters.view)
    }

    if (filters.bedType) {
      filtered = filtered.filter(room => 
        room.bedConfiguration.some(bed => bed.type === filters.bedType)
      )
    }

    // Price range filter
    filtered = filtered.filter(room => 
      room.pricing.basePrice >= filters.priceRange[0] &&
      room.pricing.basePrice <= filters.priceRange[1]
    )

    // Features filter
    Object.entries(filters.features).forEach(([feature, required]) => {
      if (required) {
        filtered = filtered.filter(room => 
          room.features[feature as keyof typeof room.features]
        )
      }
    })

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.pricing.basePrice - b.pricing.basePrice)
        break
      case 'price-high':
        filtered.sort((a, b) => b.pricing.basePrice - a.pricing.basePrice)
        break
      case 'size':
        filtered.sort((a, b) => b.size - a.size)
        break
      case 'rating':
        // In a real app, you'd have rating data
        filtered.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
        break
      case 'popularity':
        // In a real app, you'd have booking frequency data
        filtered.sort((a, b) => b.maxOccupancy - a.maxOccupancy)
        break
      default:
        break
    }

    setFilteredRooms(filtered)
  }, [rooms, filters, selectedRoomType])

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-300">Loading rooms...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-white">
            {filteredRooms.length} Room{filteredRooms.length !== 1 ? 's' : ''} Available
          </h2>
          {(checkInDate && checkOutDate) && (
            <div className="text-sm text-slate-300">
              {new Date(checkInDate).toLocaleDateString()} - {new Date(checkOutDate).toLocaleDateString()}
              {guests && ` • ${guests} guest${guests !== 1 ? 's' : ''}`}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <RoomFilters
            filters={filters}
            onFiltersChange={setFilters}
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
          
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-full border border-white/20 bg-white/5 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white/20 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white/20 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No rooms match your criteria</h3>
          <p className="text-slate-300 mb-6">
            Try adjusting your filters or date range to see more options.
          </p>
          <button
            onClick={() => setFilters({
              priceRange: [5000, 50000],
              features: {},
              sortBy: 'price-low',
            })}
            className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className={`${
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'space-y-6'
        }`}>
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              viewMode={viewMode}
              onSelect={onRoomSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}