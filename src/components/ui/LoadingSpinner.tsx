'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'emerald' | 'white' | 'slate'
  className?: string
}

export default function LoadingSpinner({
  size = 'md',
  color = 'emerald',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4'
  }

  const colorClasses = {
    emerald: 'border-emerald-400/30 border-t-emerald-400',
    white: 'border-white/30 border-t-white',
    slate: 'border-slate-400/30 border-t-slate-400'
  }

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}