'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { Room, RoomType } from '@/types/hotel'
import OptimizedRoomCard from './OptimizedRoomCard'
import RoomFilters, { RoomFilterState } from './RoomFilters'
import { RoomService } from '@/lib/firebase/hotel-service-mock'
import { imageCacheService } from '@/services/imageCache'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RoomCardSkeleton } from "@/components/ui/room-card-skeleton"
import { cn } from "@/lib/utils"

type ViewMode = 'grid' | 'list'

interface OptimizedRoomListProps {
  onRoomSelect?: (room: Room) => void
  checkInDate?: string
  checkOutDate?: string
  guests?: number
  selectedRoomType?: RoomType
}

export default function OptimizedRoomList({
  onRoomSelect,
  checkInDate,
  checkOutDate,
  guests,
  selectedRoomType
}: OptimizedRoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 }) // For virtual scrolling
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

        // Fetch and preload images for each room type in parallel
        const preloadPromises = roomTypes.map(async (roomType) => {
          try {
            const response = await fetch(`/api/room-images/list?roomType=${roomType}`);
            if (response.ok) {
              const { images } = await response.json();
              const imageUrls = images.map((img: any) => img.url);

              if (imageUrls.length > 0) {
                // Preload images in background
                return imageCacheService.preloadRoomImages(roomType as RoomType, imageUrls);
              }
            }
          } catch (err) {
            console.warn(`Failed to preload images for ${roomType}:`, err);
          }
        });

        await Promise.allSettled(preloadPromises);
      } catch (err) {
        console.warn('Failed to preload room images:', err);
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
  const sortedAndFilteredRooms = useMemo(() => {
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

    return filtered
  }, [rooms, filters, selectedRoomType])

  // Update visible range for virtual scrolling
  useEffect(() => {
    setVisibleRange({ start: 0, end: Math.min(20, sortedAndFilteredRooms.length) })
  }, [sortedAndFilteredRooms.length])

  // Get visible rooms for rendering
  const visibleRooms = useMemo(() => {
    return sortedAndFilteredRooms.slice(visibleRange.start, visibleRange.end)
  }, [sortedAndFilteredRooms, visibleRange])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-24 bg-white/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Room cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <RoomCardSkeleton key={i} viewMode="grid" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
        <AlertDescription className="text-red-200">
          {error}
          <Button
            onClick={() => window.location.reload()}
            className="ml-4 bg-red-500 hover:bg-red-600 text-white"
            size="sm"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const handleLoadMore = () => {
    if (visibleRange.end < sortedAndFilteredRooms.length) {
      setVisibleRange(prev => ({
        ...prev,
        end: Math.min(prev.end + 20, sortedAndFilteredRooms.length)
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-white">
            {sortedAndFilteredRooms.length} Room{sortedAndFilteredRooms.length !== 1 ? 's' : ''} Available
          </h2>
          {(checkInDate && checkOutDate) && (
            <Badge variant="outline" className="border-emerald-400/30 bg-emerald-400/10 text-emerald-100">
              {new Date(checkInDate).toLocaleDateString()} - {new Date(checkOutDate).toLocaleDateString()}
              {guests && ` • ${guests} guest${guests !== 1 ? 's' : ''}`}
            </Badge>
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
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
            <TabsList className="bg-white/5 border border-white/20">
              <TabsTrigger value="grid" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                List
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Results */}
      {sortedAndFilteredRooms.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">No rooms match your criteria</h3>
          <p className="text-slate-300 mb-6">
            Try adjusting your filters or date range to see more options.
          </p>
          <Button
            onClick={() => setFilters({
              priceRange: [5000, 50000],
              features: {},
              sortBy: 'price-low',
            })}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950"
          >
            Clear All Filters
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[80vh]">
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-6'
          )}>
            <Suspense fallback={<RoomCardSkeleton viewMode={viewMode} />}>
              {visibleRooms.map((room, index) => (
                <OptimizedRoomCard
                  key={room.id}
                  room={room}
                  viewMode={viewMode}
                  onSelect={onRoomSelect}
                  priority={index < 3} // Prioritize first 3 images
                />
              ))}
            </Suspense>
          </div>

          {/* Load More Button */}
          {visibleRange.end < sortedAndFilteredRooms.length && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20"
              >
                Load More ({sortedAndFilteredRooms.length - visibleRange.end} remaining)
              </Button>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  )
}