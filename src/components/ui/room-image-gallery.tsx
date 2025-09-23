'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { RoomImageSkeleton } from "./room-image-skeleton"
import { ROOM_PLACEHOLDER, BLUR_DATA_URL } from '@/utils/createPlaceholderImage'

interface RoomImageGalleryProps {
  images: string[]
  alt: string
  className?: string
  variant?: 'grid' | 'list'
  showBadges?: boolean
  hasAIImages?: boolean
  priority?: boolean
  onImageError?: (failedUrl: string) => void
}

export function RoomImageGallery({
  images,
  alt,
  className,
  variant = 'grid',
  showBadges = true,
  hasAIImages = false,
  priority = false,
  onImageError
}: RoomImageGalleryProps) {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  // Calculate loading progress
  useEffect(() => {
    if (images.length === 0) {
      setLoadingProgress(100)
      setIsLoading(false)
      return
    }

    const totalImages = images.length
    const loadedCount = loadedImages.size
    const failedCount = failedImages.size
    const progress = ((loadedCount + failedCount) / totalImages) * 100

    setLoadingProgress(progress)
    setIsLoading(progress < 100)
  }, [images.length, loadedImages.size, failedImages.size])

  const handleImageLoad = useCallback((imageUrl: string) => {
    setLoadedImages(prev => new Set(prev).add(imageUrl))
  }, [])

  const handleImageError = useCallback((imageUrl: string) => {
    setFailedImages(prev => new Set(prev).add(imageUrl))
    onImageError?.(imageUrl)
  }, [onImageError])

  // Filter out failed images for display
  const validImages = images.filter(img => !failedImages.has(img))

  if (images.length === 0 || validImages.length === 0) {
    return (
      <div className={cn("relative rounded-2xl overflow-hidden bg-slate-800", className)}>
        <AspectRatio ratio={16 / 9}>
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🏨</div>
              <div className="text-sm">No images available</div>
              {failedImages.size > 0 && (
                <div className="text-xs text-red-400 mt-1">
                  {failedImages.size} image{failedImages.size !== 1 ? 's' : ''} failed to load
                </div>
              )}
            </div>
          </div>
        </AspectRatio>
      </div>
    )
  }

  if (validImages.length === 1) {
    // Single image - no carousel needed
    return (
      <div className={cn("relative rounded-2xl overflow-hidden", className)}>
        <AspectRatio ratio={16 / 9}>
          {/* Loading progress */}
          {isLoading && (
            <div className="absolute inset-0 z-10">
              <RoomImageSkeleton showControls={false} />
              <div className="absolute bottom-2 left-2 right-2">
                <Progress value={loadingProgress} className="h-1" />
              </div>
            </div>
          )}

          {/* Main image */}
          <Image
            src={validImages[0]}
            alt={alt}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              isLoading && !loadedImages.has(validImages[0]) ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => handleImageLoad(validImages[0])}
            onError={() => handleImageError(validImages[0])}
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={90}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />

          {/* AI Enhanced Badge */}
          {showBadges && hasAIImages && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
            >
              AI Enhanced
            </Badge>
          )}
        </AspectRatio>
      </div>
    )
  }

  // Multiple images - use carousel
  return (
    <div className={cn("relative rounded-2xl overflow-hidden", className)}>
      {/* Loading progress */}
      {isLoading && (
        <div className="absolute top-2 right-2 z-20 min-w-16">
          <Progress value={loadingProgress} className="h-2 bg-black/30" />
          <div className="text-xs text-white/80 text-center mt-1">
            {Math.round(loadingProgress)}%
          </div>
        </div>
      )}

      <Carousel className="w-full h-full">
        <CarouselContent>
          {validImages.map((imageUrl, index) => (
            <CarouselItem key={imageUrl}>
              <AspectRatio ratio={16 / 9}>
                <Image
                  src={imageUrl}
                  alt={`${alt} - Image ${index + 1}`}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-500",
                    isLoading && !loadedImages.has(imageUrl) ? "opacity-0" : "opacity-100"
                  )}
                  onLoad={() => handleImageLoad(imageUrl)}
                  onError={() => handleImageError(imageUrl)}
                  priority={priority && index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={90}
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              </AspectRatio>
            </CarouselItem>
          ))}
        </CarouselContent>

        {validImages.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white hover:bg-black/70 border-0" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white hover:bg-black/70 border-0" />
          </>
        )}

        {/* AI Enhanced Badge */}
        {showBadges && hasAIImages && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 z-10"
          >
            AI Enhanced
          </Badge>
        )}

        {/* Image counter */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {validImages.length} photo{validImages.length !== 1 ? 's' : ''}
        </div>
      </Carousel>

      {/* Error alert for failed images */}
      {failedImages.size > 0 && (
        <Alert className="absolute bottom-2 right-2 w-auto bg-red-500/20 border-red-500/50">
          <AlertDescription className="text-xs text-red-200">
            {failedImages.size} failed to load
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}