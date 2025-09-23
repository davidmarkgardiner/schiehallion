import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { cn } from "@/lib/utils"

interface RoomImageSkeletonProps {
  className?: string
  variant?: 'grid' | 'list'
  showControls?: boolean
}

export function RoomImageSkeleton({
  className,
  variant = 'grid',
  showControls = true
}: RoomImageSkeletonProps) {
  return (
    <div className={cn("relative rounded-2xl overflow-hidden bg-slate-800", className)}>
      <AspectRatio ratio={16 / 9} className="bg-slate-800">
        {/* Main image skeleton with shimmer effect */}
        <Skeleton className="w-full h-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/20 to-transparent animate-pulse" />
        </Skeleton>

        {/* Navigation controls skeleton */}
        {showControls && (
          <>
            <Skeleton className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full" />
            <Skeleton className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full" />

            {/* Dot indicators skeleton */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="w-2 h-2 rounded-full" />
              ))}
            </div>
          </>
        )}

        {/* AI Enhanced badge skeleton */}
        <Skeleton className="absolute top-2 left-2 w-20 h-6 rounded-full" />

        {/* Loading indicator in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </AspectRatio>
    </div>
  )
}