import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { RoomImageSkeleton } from "./room-image-skeleton"
import { cn } from "@/lib/utils"

interface RoomCardSkeletonProps {
  viewMode: 'grid' | 'list'
  className?: string
}

export function RoomCardSkeleton({ viewMode, className }: RoomCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <Card className={cn("rounded-3xl border border-white/10 bg-white/5", className)}>
        <CardContent className="flex flex-col md:flex-row gap-6 p-6">
          {/* Image section skeleton */}
          <div className="md:w-80">
            <RoomImageSkeleton variant="list" className="h-48" />
          </div>

          {/* Content section skeleton */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-8 w-20 ml-auto" />
                <Skeleton className="h-4 w-16 ml-auto" />
              </div>
            </div>

            {/* Description */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />

            {/* Details grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full rounded-2xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full rounded-2xl" />
              </div>
            </div>

            {/* Feature badges */}
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded-full" />
              ))}
            </div>

            {/* Button */}
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view skeleton
  return (
    <Card className={cn("rounded-3xl border border-white/10 bg-white/5", className)}>
      <CardContent className="p-6 space-y-4">
        {/* Image skeleton */}
        <RoomImageSkeleton variant="grid" className="h-48" />

        {/* Content skeleton */}
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>

          {/* Price and details */}
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Description */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-12 rounded-full" />
            ))}
          </div>

          {/* Button */}
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}