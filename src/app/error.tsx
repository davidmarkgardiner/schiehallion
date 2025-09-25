'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 mb-6">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="block w-full rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/10"
          >
            Back to Home
          </Link>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-slate-400 cursor-pointer mb-2">Error Details</summary>
            <pre className="text-xs text-red-400 bg-black/30 p-3 rounded overflow-x-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </main>
  )
}