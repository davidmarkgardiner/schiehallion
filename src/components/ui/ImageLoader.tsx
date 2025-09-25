'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ROOM_PLACEHOLDER, BLUR_DATA_URL } from '@/utils/createPlaceholderImage'
import LoadingSpinner from './LoadingSpinner'
import { useImagePerformanceMonitor } from '@/utils/performanceMonitor'

// Utility function for conditional classes
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface ImageLoaderProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  loading?: boolean
  priority?: boolean
  sizes?: string
  fallbackSrc?: string
}

const DEFAULT_FALLBACK = ROOM_PLACEHOLDER

export default function ImageLoader({
  src,
  alt,
  className,
  onLoad,
  onError,
  loading: externalLoading = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fallbackSrc = DEFAULT_FALLBACK
}: ImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const { trackImageLoad } = useImagePerformanceMonitor()

  // Reset states when src changes
  useEffect(() => {
    setIsLoading(true)
    setHasError(false)
    setCurrentSrc(src)

    // Start performance tracking
    const tracker = trackImageLoad(src)
    tracker.onLoadStart()
  }, [src, trackImageLoad])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)

    // Track successful load
    const tracker = trackImageLoad(currentSrc)
    tracker.onLoadEnd(true)

    onLoad?.()
  }, [onLoad, currentSrc, trackImageLoad])

  const handleError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)

    // Track failed load
    const tracker = trackImageLoad(currentSrc)
    tracker.onLoadEnd(false, 'Image failed to load')

    // Try fallback if not already using it
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setIsLoading(true)
      setHasError(false)
    } else {
      onError?.()
    }
  }, [currentSrc, fallbackSrc, onError, trackImageLoad])

  const showLoading = isLoading || externalLoading

  return (
    <div className="relative w-full h-full">
      {/* Loading skeleton */}
      {showLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size="md" color="emerald" />
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-sm">Image unavailable</div>
          </div>
        </div>
      )}

      {/* Actual image */}
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={cn(
          "object-cover transition-opacity duration-500",
          showLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        sizes={sizes}
        quality={90}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />
    </div>
  )
}