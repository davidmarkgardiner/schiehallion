'use client'

import { useState, useEffect } from 'react'
import { performanceMonitor } from '@/utils/performanceMonitor'

interface PerformanceDashboardProps {
  enabled?: boolean
}

export default function PerformanceDashboard({ enabled = process.env.NODE_ENV === 'development' }: PerformanceDashboardProps) {
  const [stats, setStats] = useState(performanceMonitor.getStats())
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      setStats(performanceMonitor.getStats())
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
      >
        📊 Perf {stats.totalImages > 0 && `(${stats.totalImages})`}
      </button>

      {/* Dashboard Panel */}
      {isVisible && (
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-4 shadow-xl max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Image Performance</h3>
            <button
              onClick={() => performanceMonitor.clear()}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Images:</span>
              <span className="text-white">{stats.totalImages}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Success Rate:</span>
              <span className={stats.totalImages > 0 ?
                ((stats.successfulLoads / stats.totalImages) * 100) >= 90 ? 'text-emerald-400' : 'text-yellow-400'
                : 'text-slate-400'
              }>
                {stats.totalImages > 0 ?
                  `${((stats.successfulLoads / stats.totalImages) * 100).toFixed(1)}%` :
                  'N/A'
                }
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Avg Load Time:</span>
              <span className={
                stats.averageLoadTime > 2000 ? 'text-red-400' :
                stats.averageLoadTime > 1000 ? 'text-yellow-400' : 'text-emerald-400'
              }>
                {stats.averageLoadTime > 0 ? `${stats.averageLoadTime.toFixed(0)}ms` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Fastest:</span>
              <span className="text-emerald-400">
                {stats.fastestLoad > 0 ? `${stats.fastestLoad.toFixed(0)}ms` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Slowest:</span>
              <span className="text-red-400">
                {stats.slowestLoad > 0 ? `${stats.slowestLoad.toFixed(0)}ms` : 'N/A'}
              </span>
            </div>

            {stats.failedLoads > 0 && (
              <div className="pt-2 border-t border-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Failed:</span>
                  <span className="text-red-400">{stats.failedLoads}</span>
                </div>
                {stats.recentFailures.length > 0 && (
                  <div className="mt-1">
                    <div className="text-slate-400 mb-1">Recent failures:</div>
                    {stats.recentFailures.slice(0, 3).map((url, i) => (
                      <div key={i} className="text-red-400 text-xs truncate">
                        {url.split('/').pop()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-700">
            <button
              onClick={() => performanceMonitor.logStats()}
              className="w-full text-xs text-slate-400 hover:text-white"
            >
              Log to Console
            </button>
          </div>
        </div>
      )}
    </div>
  )
}