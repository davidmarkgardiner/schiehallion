'use client'

import * as React from "react"
import { useState, useCallback, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { cn } from "@/lib/utils"
import { ImageIcon, Wand2, AlertCircle, Camera } from "lucide-react"

interface ImageFallbackProps {
  src?: string
  alt: string
  className?: string
  aspectRatio?: number
  fallbackType?: 'room' | 'placeholder' | 'error'
  roomType?: string
  roomNumber?: string
  onGenerateImage?: () => void
  showGenerateOption?: boolean
  priority?: boolean
  sizes?: string
}

export function ImageFallback({
  src,
  alt,
  className,
  aspectRatio = 16 / 9,
  fallbackType = 'room',
  roomType,
  roomNumber,
  onGenerateImage,
  showGenerateOption = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: ImageFallbackProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error' | 'no-src'>(() => {
    // If no src is provided, immediately go to no-src state
    return src ? 'loading' : 'no-src'
  })
  const [retryCount, setRetryCount] = useState(0)
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (src) {
      setImageState('loading')
      setRetryCount(0)
      // Clear any existing timeout
      if (retryTimeout) {
        clearTimeout(retryTimeout)
        setRetryTimeout(null)
      }
    } else {
      setImageState('no-src')
    }
  }, [src, retryTimeout])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [retryTimeout])

  const handleImageLoad = useCallback(() => {
    setImageState('loaded')
  }, [])

  const handleImageError = useCallback(() => {
    const maxRetries = 2
    if (retryCount < maxRetries && src) {
      // Implement exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, retryCount) * 1000
      const timeout = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setImageState('loading')
        setRetryTimeout(null)
      }, delay)
      setRetryTimeout(timeout)
    } else {
      setImageState('error')
    }
  }, [retryCount, src])

  const renderFallbackContent = () => {
    switch (fallbackType) {
      case 'room':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-400" />
              </div>
              {roomType && (
                <Badge
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 text-xs bg-slate-600 text-slate-200"
                >
                  {roomType}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">
                {roomNumber ? `Room ${roomNumber}` : 'Room Image'}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Image coming soon. Our team is preparing beautiful visuals for this room.
              </p>
            </div>

            {showGenerateOption && onGenerateImage && (
              <div className="space-y-2">
                <button
                  onClick={onGenerateImage}
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-emerald-200 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  <Wand2 className="w-3 h-3" />
                  Generate AI Image
                </button>
                <p className="text-xs text-slate-500">
                  Create a professional room image using AI
                </p>
              </div>
            )}
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-300">Failed to Load</h4>
              <p className="text-xs text-red-400/80 max-w-xs">
                Unable to load the image. Please try again later.
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
              <Camera className="w-8 h-8 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300">No Image Available</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                A placeholder image will be available soon.
              </p>
            </div>
          </div>
        )
    }
  }

  const showSkeletonOverlay = imageState === 'loading' && !!src
  const shouldRenderImage = !!src && imageState !== 'error'

  if (!shouldRenderImage) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg", className)}>
        <AspectRatio ratio={aspectRatio}>
          <Card className="w-full h-full border-white/10 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-0 h-full" role="img" aria-label={alt}>
              {renderFallbackContent()}
            </CardContent>
          </Card>
        </AspectRatio>
      </div>
    )
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <AspectRatio ratio={aspectRatio}>
        <>
          <Image
            key={src}
            src={src}
            alt={alt}
            fill
            className="object-cover transition-opacity duration-500"
            onLoad={handleImageLoad}
            onError={handleImageError}
            priority={priority}
            sizes={sizes}
            quality={90}
          />
          {showSkeletonOverlay && (
            <div
              className="absolute inset-0"
              aria-label="Loading image"
              role="status"
              aria-live="polite"
            >
              <Skeleton className="w-full h-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"
                    aria-hidden="true"
                  />
                </div>
              </Skeleton>
            </div>
          )}
        </>
      </AspectRatio>
    </div>
  )
}

// Enhanced Room Image component specifically for room cards
interface RoomImageProps extends Omit<ImageFallbackProps, 'fallbackType'> {
  hasAIImages?: boolean
  isAIEnhanced?: boolean
  onGenerateRoom?: () => void
}

export function RoomImage({
  hasAIImages = false,
  isAIEnhanced = false,
  onGenerateRoom,
  ...props
}: RoomImageProps) {
  return (
    <div className="relative">
      <ImageFallback
        {...props}
        fallbackType="room"
        onGenerateImage={onGenerateRoom}
        showGenerateOption={!hasAIImages}
      />

      {/* AI Enhanced Badge */}
      {isAIEnhanced && (
        <Badge
          className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium"
        >
          AI Enhanced
        </Badge>
      )}

      {/* Loading AI Images indicator */}
      {!hasAIImages && !props.src && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            AI Available
          </Badge>
        </div>
      )}
    </div>
  )
}

export default ImageFallback