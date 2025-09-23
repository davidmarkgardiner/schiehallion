'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { Room } from '@/types/hotel'
import { useActiveRoomImages } from '@/hooks/useRoomImages'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RoomImageGallery } from "@/components/ui/room-image-gallery"
import { RoomCardSkeleton } from "@/components/ui/room-card-skeleton"
import { cn } from "@/lib/utils"

interface OptimizedRoomCardProps {
  room: Room
  viewMode: 'grid' | 'list'
  onSelect?: (room: Room) => void
  priority?: boolean
  loading?: boolean
}

const OptimizedRoomCard = memo(function OptimizedRoomCard({
  room,
  viewMode,
  onSelect,
  priority = false,
  loading = false
}: OptimizedRoomCardProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const { imagesByRoomType, hasImages: hasGeneratedImages, isLoading: imagesLoading } = useActiveRoomImages()

  // Combine original room images with AI-generated images
  const allImages = useMemo(() => {
    const originalImages = room.images || []
    const generatedImages = imagesByRoomType[room.type] || []
    return [...originalImages, ...generatedImages].filter(img => !failedImages.has(img))
  }, [room.images, room.type, imagesByRoomType, failedImages])

  const handleImageError = useCallback((failedUrl: string) => {
    setFailedImages(prev => new Set(prev).add(failedUrl))
  }, [])

  const formatPrice = useCallback((price: number | undefined) => {
    if (price === undefined || price === null) {
      return '£0.00'
    }
    return `£${(price / 100).toFixed(2)}`
  }, [])

  const getRoomTypeDisplay = useCallback((type: string) => {
    const typeMap: Record<string, string> = {
      standard: 'Standard Room',
      deluxe: 'Deluxe Room',
      suite: 'Suite',
      family: 'Family Room',
      accessible: 'Accessible Room'
    }
    return typeMap[type] || type
  }, [])

  const getBedDisplay = useCallback(() => {
    if (!room.bedConfiguration || room.bedConfiguration.length === 0) {
      return 'Not specified'
    }
    return room.bedConfiguration
      .map(bed => `${bed.count} ${bed.type.replace('-', ' ')}`)
      .join(', ')
  }, [room.bedConfiguration])

  const getKeyFeatures = useCallback((): string[] => {
    const features: string[] = []
    if (!room.features) return features

    if (room.features.wifi) features.push('WiFi')
    if (room.features.balcony) features.push('Balcony')
    if (room.features.airConditioning) features.push('AC')
    if (room.features.bathtub) features.push('Bathtub')
    if (room.features.minibar) features.push('Minibar')
    return features.slice(0, 4)
  }, [room.features])

  // Show loading state
  if (loading || imagesLoading) {
    return <RoomCardSkeleton viewMode={viewMode} />
  }

  const cardContent = (
    <>
      {/* Image Gallery */}
      <div className={cn(
        "relative rounded-2xl overflow-hidden bg-slate-800",
        viewMode === 'list' ? "md:w-80 h-48" : "h-48 mb-4"
      )}>
        <RoomImageGallery
          images={allImages}
          alt={`${room.roomNumber} - ${room.type}`}
          variant={viewMode}
          hasAIImages={hasGeneratedImages(room.type)}
          priority={priority}
          onImageError={handleImageError}
        />
      </div>

      {/* Room Details */}
      <div className={cn(
        "space-y-4",
        viewMode === 'list' ? "flex-1" : ""
      )}>
        <div className={cn(
          "flex justify-between gap-2",
          viewMode === 'list' ? "flex-col sm:flex-row sm:items-start" : "items-end"
        )}>
          <div>
            <h3 className={cn(
              "font-semibold text-white",
              viewMode === 'list' ? "text-2xl" : "text-xl"
            )}>
              {getRoomTypeDisplay(room.type)}
            </h3>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">
              Room {room.roomNumber} • {viewMode === 'list' ? `Floor ${room.floor} • ` : ''}{room.view} view
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-white">{formatPrice(room.pricing?.basePrice)}</div>
            <div className="text-sm text-slate-300">per night</div>
          </div>
        </div>

        {viewMode === 'list' && (
          <p className="text-sm text-slate-200 line-clamp-2">{room.description}</p>
        )}

        {viewMode === 'list' ? (
          // List view detailed layout
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-2">
                <span className="font-medium text-slate-300">Occupancy</span>
                <span className="text-white">{room.maxOccupancy} guests</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-2">
                <span className="font-medium text-slate-300">Beds</span>
                <span className="text-white">{getBedDisplay()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-2">
                <span className="font-medium text-slate-300">Size</span>
                <span className="text-white">{room.size}m²</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-2">
                <span className="font-medium text-slate-300">Status</span>
                <Badge variant={room.status === 'available' ? 'default' : 'secondary'}
                       className={cn(
                         "capitalize",
                         room.status === 'available' ? 'bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30' : 'bg-yellow-400/20 text-yellow-300'
                       )}>
                  {room.status}
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          // Grid view compact layout
          <div className="text-right text-sm text-slate-300">
            <div>Max {room.maxOccupancy} guests</div>
            <div>{room.size}m²</div>
          </div>
        )}

        {viewMode === 'grid' && (
          <p className="text-sm text-slate-200 line-clamp-2">{room.description}</p>
        )}

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2">
          {getKeyFeatures().map((feature) => (
            <Badge
              key={feature}
              variant="outline"
              className="border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20"
            >
              {feature}
            </Badge>
          ))}
        </div>

        {/* Select button */}
        {onSelect && (
          <Button
            onClick={() => onSelect(room)}
            className={cn(
              "rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold uppercase tracking-[0.2em] transition-colors",
              viewMode === 'list' ? "w-full sm:w-auto px-6 py-3 text-sm" : "w-full px-6 py-3 text-sm"
            )}
          >
            Select Room
          </Button>
        )}
      </div>
    </>
  )

  return (
    <Card className={cn(
      "rounded-3xl border border-white/10 bg-white/5 shadow-lg hover:bg-white/10 transition-colors",
      "group hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
    )}>
      <CardContent className={cn(
        "p-6",
        viewMode === 'list' ? "flex flex-col md:flex-row gap-6" : "space-y-4"
      )}>
        {cardContent}
      </CardContent>
    </Card>
  )
})

export default OptimizedRoomCard