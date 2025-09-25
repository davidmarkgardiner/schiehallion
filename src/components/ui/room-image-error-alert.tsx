'use client'

import * as React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertCircle, Wand2, RefreshCw, Camera, Zap } from "lucide-react"

interface RoomImageErrorAlertProps {
  variant?: 'inline' | 'card' | 'minimal'
  roomType?: string
  roomNumber?: string
  errorType?: 'missing' | 'failed' | 'generating' | 'no-ai'
  showActions?: boolean
  onGenerateImage?: () => void
  onRefresh?: () => void
  className?: string
  isGenerating?: boolean
}

export function RoomImageErrorAlert({
  variant = 'inline',
  roomType,
  roomNumber,
  errorType = 'missing',
  showActions = true,
  onGenerateImage,
  onRefresh,
  className,
  isGenerating = false
}: RoomImageErrorAlertProps) {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'missing':
        return {
          icon: Camera,
          title: 'Images Coming Soon',
          description: 'Professional room images are being prepared for this space.',
          actionText: 'Generate AI Preview',
          actionIcon: Wand2,
          variant: 'default' as const,
          badgeText: 'Preview Available',
          badgeVariant: 'secondary' as const
        }

      case 'failed':
        return {
          icon: AlertCircle,
          title: 'Unable to Load Images',
          description: 'There was an issue loading the room images. Please try again.',
          actionText: 'Retry Loading',
          actionIcon: RefreshCw,
          variant: 'destructive' as const,
          badgeText: 'Retry Available',
          badgeVariant: 'destructive' as const
        }

      case 'generating':
        return {
          icon: Zap,
          title: 'AI Images Generating',
          description: 'Creating beautiful room visuals using artificial intelligence...',
          actionText: 'Generating...',
          actionIcon: Zap,
          variant: 'default' as const,
          badgeText: 'AI Processing',
          badgeVariant: 'default' as const
        }

      case 'no-ai':
        return {
          icon: Camera,
          title: 'Standard Images Only',
          description: 'This room uses traditional photography. AI enhancement available.',
          actionText: 'Add AI Images',
          actionIcon: Wand2,
          variant: 'default' as const,
          badgeText: 'AI Available',
          badgeVariant: 'outline' as const
        }

      default:
        return {
          icon: Camera,
          title: 'Image Status Unknown',
          description: 'Room image status could not be determined.',
          actionText: 'Check Status',
          actionIcon: RefreshCw,
          variant: 'default' as const,
          badgeText: 'Check Available',
          badgeVariant: 'outline' as const
        }
    }
  }

  const config = getErrorConfig()
  const Icon = config.icon

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-slate-400", className)}>
        <Icon className="w-4 h-4" />
        <span>{config.title}</span>
        {showActions && onGenerateImage && (
          <button
            onClick={onGenerateImage}
            disabled={isGenerating}
            className="text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={cn("border-white/10 bg-white/5", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-slate-400" />
              <CardTitle className="text-sm text-white">{config.title}</CardTitle>
            </div>
            <Badge variant={config.badgeVariant} className="text-xs">
              {config.badgeText}
            </Badge>
          </div>
          <CardDescription className="text-slate-300">
            {config.description}
            {roomNumber && ` Room ${roomNumber}`}
            {roomType && ` (${roomType})`}
          </CardDescription>
        </CardHeader>
        {showActions && (onGenerateImage || onRefresh) && (
          <CardContent className="pt-0">
            <div className="flex gap-2">
              {onGenerateImage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onGenerateImage}
                  disabled={isGenerating}
                  className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <config.actionIcon className="w-3 h-3 mr-2" />
                      {config.actionText}
                    </>
                  )}
                </Button>
              )}
              {onRefresh && errorType === 'failed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRefresh}
                  className="border-slate-500/20 text-slate-400 hover:bg-slate-500/10"
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Retry
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  // Default inline variant
  return (
    <Alert variant={config.variant} className={cn("border-white/10 bg-white/5", className)}>
      <Icon className="h-4 w-4" />
      <div className="flex-1">
        <AlertTitle className="text-sm text-white">
          {config.title}
          {roomNumber && ` - Room ${roomNumber}`}
        </AlertTitle>
        <AlertDescription className="text-slate-300">
          {config.description}
          {roomType && ` This ${roomType} room will have professional images soon.`}
        </AlertDescription>
      </div>
      {showActions && (onGenerateImage || onRefresh) && (
        <div className="flex gap-2 ml-4">
          {onGenerateImage && (
            <button
              onClick={onGenerateImage}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <config.actionIcon className="w-3 h-3" />
                  {config.actionText}
                </>
              )}
            </button>
          )}
          {onRefresh && errorType === 'failed' && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-500/10 border border-slate-500/20 rounded hover:bg-slate-500/20 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      )}
    </Alert>
  )
}

export default RoomImageErrorAlert