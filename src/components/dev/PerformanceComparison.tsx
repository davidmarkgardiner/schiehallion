'use client'

import { useState, useEffect } from 'react'

interface PerformanceEntry {
  name: string
  startTime: number
  duration?: number
}

export function usePerformanceComparison(componentName: string) {
  const [entries, setEntries] = useState<PerformanceEntry[]>([])

  const measurePerformance = (taskName: string, task: () => Promise<void> | void) => {
    const entry: PerformanceEntry = {
      name: `${componentName}-${taskName}`,
      startTime: performance.now()
    }

    const start = performance.now()

    if (task instanceof Promise) {
      return task.then(() => {
        const duration = performance.now() - start
        entry.duration = duration
        setEntries(prev => [...prev, entry])

        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚡ ${entry.name}: ${duration.toFixed(2)}ms`)
        }
      })
    } else {
      task()
      const duration = performance.now() - start
      entry.duration = duration
      setEntries(prev => [...prev, entry])

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${entry.name}: ${duration.toFixed(2)}ms`)
      }
    }
  }

  const getAverageTime = (taskName: string): number => {
    const relevantEntries = entries.filter(e =>
      e.name.includes(taskName) && e.duration !== undefined
    )

    if (relevantEntries.length === 0) return 0

    const total = relevantEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
    return total / relevantEntries.length
  }

  const getTotalTime = (): number => {
    return entries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
  }

  return {
    measurePerformance,
    getAverageTime,
    getTotalTime,
    entries: entries.filter(e => e.duration !== undefined)
  }
}

// Simple performance comparison display for development
export default function PerformanceComparison({
  measurements,
  title = "Performance Metrics"
}: {
  measurements: { name: string; time: number }[]
  title?: string
}) {
  if (process.env.NODE_ENV !== 'development' || measurements.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 text-xs z-50 max-w-xs">
      <h4 className="text-white font-semibold mb-2">{title}</h4>
      <div className="space-y-1">
        {measurements.map((measurement, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-slate-400">{measurement.name}:</span>
            <span className={
              measurement.time > 1000 ? 'text-red-400' :
              measurement.time > 500 ? 'text-yellow-400' : 'text-emerald-400'
            }>
              {measurement.time.toFixed(1)}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}