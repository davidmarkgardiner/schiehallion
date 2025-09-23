'use client'

import { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import { Room } from '@/types/hotel'
import { useActiveRoomImages } from '@/hooks/useRoomImages'
import { RoomImage } from '@/components/ui/image-fallback'
import { RoomImageErrorAlert } from '@/components/ui/room-image-error-alert'
import { Badge } from '@/components/ui/badge'

interface RoomCardProps {
  room: Room
  viewMode: 'grid' | 'list'
  onSelect?: (room: Room) => void
}

export default function RoomCard({ room, viewMode, onSelect }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const { imagesByRoomType, hasImages: hasGeneratedImages, isLoading: imagesLoading, error: imagesError } = useActiveRoomImages()

  // Combine original room images with AI-generated images
  const allImages = useMemo(() => {
    const originalImages = room.images || []
    const generatedImages = imagesByRoomType[room.type] || []
    return [...originalImages, ...generatedImages]
  }, [room.images, room.type, imagesByRoomType])

  const nextImage = useCallback(() => {
    if (allImages && allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
      setImageLoading(true)
    }
  }, [allImages])

  const prevImage = useCallback(() => {
    if (allImages && allImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
      setImageLoading(true)
    }
  }, [allImages])

  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
  }, [])

  const handleImageError = useCallback(() => {
    const currentImage = allImages?.[currentImageIndex]
    if (currentImage) {
      setFailedImages(prev => new Set(prev).add(currentImage))
    }
    setImageError(true)
    setImageLoading(false)
  }, [allImages, currentImageIndex])

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) {
      return '£0.00'
    }
    return `£${(price / 100).toFixed(2)}`
  }

  const getRoomTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      standard: 'Standard Room',
      deluxe: 'Deluxe Room',
      suite: 'Suite',
      family: 'Family Room',
      accessible: 'Accessible Room'
    }
    return typeMap[type] || type
  }

  const getBedDisplay = () => {
    if (!room.bedConfiguration || room.bedConfiguration.length === 0) {
      return 'Not specified'
    }
    return room.bedConfiguration
      .map(bed => `${bed.count} ${bed.type.replace('-', ' ')}`)
      .join(', ')
  }

  const handleGenerateImage = useCallback(async () => {
    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'room',
          prompt: `A beautiful ${room.type} hotel room with ${getBedDisplay()}, ${room.view} view, featuring luxury amenities and comfortable furnishings. The room should feel welcoming and spacious.`,
          style: 'photorealistic',
          size: 'landscape'
        })
      })

      if (response.ok) {
        const data = await response.json()
        // TODO: Save the generated image and refresh the room images
        console.log('Generated image:', data)
      } else {
        console.error('Failed to generate image:', response.statusText)
      }
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setIsGeneratingImage(false)
    }
  }, [room.type, room.view])

  const getKeyFeatures = (): string[] => {
    const features: string[] = []
    if (!room.features) return features

    if (room.features.wifi) features.push('WiFi')
    if (room.features.balcony) features.push('Balcony')
    if (room.features.airConditioning) features.push('AC')
    if (room.features.bathtub) features.push('Bathtub')
    if (room.features.minibar) features.push('Minibar')
    return features.slice(0, 4)
  }

  if (viewMode === 'list') {
    return (
      <div className="flex flex-col md:flex-row gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg hover:bg-white/10 transition-colors">
        {/* Image Gallery */}
        <div className="relative md:w-80 h-48">
          {allImages && allImages.length > 0 && !imageError ? (
            <div className="relative w-full h-full">
              <RoomImage
                src={allImages[currentImageIndex]}
                alt={`${room.roomNumber} - ${room.type}`}
                roomType={room.type}
                roomNumber={room.roomNumber}
                hasAIImages={hasGeneratedImages(room.type)}
                isAIEnhanced={hasGeneratedImages(room.type)}
                onGenerateRoom={handleGenerateImage}
                aspectRatio={16 / 9}
                className="w-full h-full"
                priority={currentImageIndex === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {allImages && allImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center z-10"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center z-10"
                  >
                    →
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                    {allImages && allImages.map((_, index) => (
                      <div
                        key={`${room.id}-image-${index}`}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <RoomImage
              src={undefined}
              alt={`${room.roomNumber} - ${room.type}`}
              roomType={room.type}
              roomNumber={room.roomNumber}
              hasAIImages={hasGeneratedImages(room.type)}
              isAIEnhanced={false}
              onGenerateRoom={handleGenerateImage}
              aspectRatio={16 / 9}
              className="w-full h-full"
            />
          )}

          {/* Error Alert for Failed Images */}
          {(imagesError || (allImages.length === 0 && !imagesLoading)) && (
            <div className="absolute bottom-2 left-2 right-2 z-20">
              <RoomImageErrorAlert
                variant="minimal"
                roomType={room.type}
                roomNumber={room.roomNumber}
                errorType={imagesError ? 'failed' : 'missing'}
                onGenerateImage={handleGenerateImage}
                isGenerating={isGeneratingImage}
              />
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h3 className="text-2xl font-semibold text-white">{getRoomTypeDisplay(room.type)}</h3>
              <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">
                Room {room.roomNumber} • Floor {room.floor} • {room.view} view
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-white">{formatPrice(room.pricing?.basePrice)}</div>
              <div className="text-sm text-slate-300">per night</div>
            </div>
          </div>

          <p className="text-sm text-slate-200 line-clamp-2">{room.description}</p>

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
                <span className={`capitalize ${
                  room.status === 'available' ? 'text-emerald-300' : 'text-yellow-300'
                }`}>
                  {room.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {getKeyFeatures().map((feature) => (
              <span
                key={feature}
                className="rounded-full bg-emerald-400/10 text-emerald-100 px-3 py-1 text-xs"
              >
                {feature}
              </span>
            ))}
          </div>

          {onSelect && (
            <button
              onClick={() => onSelect(room)}
              className="w-full sm:w-auto rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
            >
              Select Room
            </button>
          )}
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg hover:bg-white/10 transition-colors">
      {/* Image Gallery */}
      <div className="relative h-48 mb-4">
        {allImages && allImages.length > 0 && !imageError ? (
          <div className="relative w-full h-full">
            <RoomImage
              src={allImages[currentImageIndex]}
              alt={`${room.roomNumber} - ${room.type}`}
              roomType={room.type}
              roomNumber={room.roomNumber}
              hasAIImages={hasGeneratedImages(room.type)}
              isAIEnhanced={hasGeneratedImages(room.type)}
              onGenerateRoom={handleGenerateImage}
              aspectRatio={16 / 9}
              className="w-full h-full"
              priority={currentImageIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {allImages && allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center z-10"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors flex items-center justify-center z-10"
                >
                  →
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {allImages && allImages.map((_, index) => (
                    <div
                      key={`${room.id}-image-${index}`}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <RoomImage
            src={undefined}
            alt={`${room.roomNumber} - ${room.type}`}
            roomType={room.type}
            roomNumber={room.roomNumber}
            hasAIImages={hasGeneratedImages(room.type)}
            isAIEnhanced={false}
            onGenerateRoom={handleGenerateImage}
            aspectRatio={16 / 9}
            className="w-full h-full"
          />
        )}

        {/* Error Alert for Failed Images */}
        {(imagesError || (allImages.length === 0 && !imagesLoading)) && (
          <div className="absolute bottom-2 left-2 right-2 z-20">
            <RoomImageErrorAlert
              variant="minimal"
              roomType={room.type}
              roomNumber={room.roomNumber}
              errorType={imagesError ? 'failed' : 'missing'}
              onGenerateImage={handleGenerateImage}
              isGenerating={isGeneratingImage}
            />
          </div>
        )}
      </div>

      {/* Room Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{getRoomTypeDisplay(room.type)}</h3>
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">
            Room {room.roomNumber} • {room.view} view
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-semibold text-white">{formatPrice(room.pricing?.basePrice)}</div>
            <div className="text-sm text-slate-300">per night</div>
          </div>
          <div className="text-right text-sm text-slate-300">
            <div>Max {room.maxOccupancy} guests</div>
            <div>{room.size}m²</div>
          </div>
        </div>

        <p className="text-sm text-slate-200 line-clamp-2">{room.description}</p>

        <div className="flex flex-wrap gap-2">
          {getKeyFeatures().map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-emerald-400/10 text-emerald-100 px-3 py-1 text-xs"
            >
              {feature}
            </span>
          ))}
        </div>

        {onSelect && (
          <button
            onClick={() => onSelect(room)}
            className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
          >
            Select Room
          </button>
        )}
      </div>
    </div>
  )
}