'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Room } from '@/types/hotel'

interface RoomCardProps {
  room: Room
  viewMode: 'grid' | 'list'
  onSelect?: (room: Room) => void
}

export default function RoomCard({ room, viewMode, onSelect }: RoomCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  const nextImage = () => {
    if (room.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % room.images.length)
    }
  }

  const prevImage = () => {
    if (room.images && room.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + room.images.length) % room.images.length)
    }
  }

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
      <div className="flex flex-col md:flex-row gap-6 rounded-3xl border border-lundies-stone/60 bg-white/90 p-6 shadow-lg hover:bg-white transition-colors">
        {/* Image Gallery */}
        <div className="relative md:w-80 h-48 rounded-2xl overflow-hidden bg-lundies-stone/60">
          {room.images && room.images.length > 0 && !imageError ? (
            <>
              <Image
                src={room.images[currentImageIndex]}
                alt={`${room.roomNumber} - ${room.type}`}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
              {room.images && room.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-lundies-peat/30 text-lundies-charcoal hover:bg-lundies-peat/50 transition-colors flex items-center justify-center"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-lundies-peat/30 text-lundies-charcoal hover:bg-lundies-peat/50 transition-colors flex items-center justify-center"
                  >
                    →
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {room.images && room.images.map((_, index) => (
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
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lundies-moss">
              <div className="text-center">
                <div className="text-4xl mb-2">🏨</div>
                <div className="text-sm">Room {room.roomNumber}</div>
              </div>
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h3 className="text-2xl font-semibold text-lundies-charcoal">{getRoomTypeDisplay(room.type)}</h3>
              <p className="text-sm uppercase tracking-[0.25em] text-lundies-moss">
                Room {room.roomNumber} • Floor {room.floor} • {room.view} view
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-lundies-charcoal">{formatPrice(room.pricing?.basePrice)}</div>
              <div className="text-sm text-lundies-peat">per night</div>
            </div>
          </div>

          <p className="text-sm text-lundies-peat line-clamp-2">{room.description}</p>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-lundies-stone/40 px-4 py-2">
                <span className="font-medium text-lundies-peat">Occupancy</span>
                <span className="text-lundies-charcoal">{room.maxOccupancy} guests</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-lundies-stone/40 px-4 py-2">
                <span className="font-medium text-lundies-peat">Beds</span>
                <span className="text-lundies-charcoal">{getBedDisplay()}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-lundies-stone/40 px-4 py-2">
                <span className="font-medium text-lundies-peat">Size</span>
                <span className="text-lundies-charcoal">{room.size}m²</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-lundies-stone/40 px-4 py-2">
                <span className="font-medium text-lundies-peat">Status</span>
                <span className={`capitalize ${
                  room.status === 'available' ? 'text-lundies-moss' : 'text-yellow-300'
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
                className="rounded-full bg-lundies-heather/20 text-lundies-moss px-3 py-1 text-xs"
              >
                {feature}
              </span>
            ))}
          </div>

          {onSelect && (
            <button
              onClick={() => onSelect(room)}
              className="w-full sm:w-auto rounded-full bg-lundies-heather px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-lundies-charcoal transition hover:bg-lundies-heather/80"
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
    <div className="rounded-3xl border border-lundies-stone/60 bg-white/90 p-6 shadow-lg hover:bg-white transition-colors">
      {/* Image Gallery */}
      <div className="relative h-48 rounded-2xl overflow-hidden bg-lundies-stone/60 mb-4">
        {room.images && room.images.length > 0 && !imageError ? (
          <>
            <Image
              src={room.images[currentImageIndex]}
              alt={`${room.roomNumber} - ${room.type}`}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
            {room.images && room.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-lundies-peat/30 text-lundies-charcoal hover:bg-lundies-peat/50 transition-colors flex items-center justify-center"
                >
                  ←
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-lundies-peat/30 text-lundies-charcoal hover:bg-lundies-peat/50 transition-colors flex items-center justify-center"
                >
                  →
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {room.images && room.images.map((_, index) => (
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
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lundies-moss">
            <div className="text-center">
              <div className="text-4xl mb-2">🏨</div>
              <div className="text-sm">Room {room.roomNumber}</div>
            </div>
          </div>
        )}
      </div>

      {/* Room Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-lundies-charcoal">{getRoomTypeDisplay(room.type)}</h3>
          <p className="text-sm uppercase tracking-[0.25em] text-lundies-moss">
            Room {room.roomNumber} • {room.view} view
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-semibold text-lundies-charcoal">{formatPrice(room.pricing?.basePrice)}</div>
            <div className="text-sm text-lundies-peat">per night</div>
          </div>
          <div className="text-right text-sm text-lundies-peat">
            <div>Max {room.maxOccupancy} guests</div>
            <div>{room.size}m²</div>
          </div>
        </div>

        <p className="text-sm text-lundies-peat line-clamp-2">{room.description}</p>

        <div className="flex flex-wrap gap-2">
          {getKeyFeatures().map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-lundies-heather/20 text-lundies-moss px-3 py-1 text-xs"
            >
              {feature}
            </span>
          ))}
        </div>

        {onSelect && (
          <button
            onClick={() => onSelect(room)}
            className="w-full rounded-full bg-lundies-heather px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-lundies-charcoal transition hover:bg-lundies-heather/80"
          >
            Select Room
          </button>
        )}
      </div>
    </div>
  )
}