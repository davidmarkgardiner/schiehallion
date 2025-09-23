// Epic 6: Payment Failed Page
// SCHH-019: Payment Failure Handling

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function PaymentFailedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [roomHoldTime, setRoomHoldTime] = useState<number>(15 * 60) // 15 minutes in seconds
  const [retryAttempts, setRetryAttempts] = useState(0)
  const maxRetryAttempts = 3

  const paymentIntentId = searchParams?.get('payment_intent')
  const errorMessage = searchParams?.get('error') || 'Payment was declined'

  useEffect(() => {
    // Start countdown timer for room hold
    if (roomHoldTime > 0) {
      const timer = setInterval(() => {
        setRoomHoldTime(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [roomHoldTime])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleRetryPayment = () => {
    if (retryAttempts < maxRetryAttempts && paymentIntentId) {
      setRetryAttempts(prev => prev + 1)
      router.push(`/booking/payment/retry?payment_intent=${paymentIntentId}&attempt=${retryAttempts + 1}`)
    }
  }

  const handleNewBooking = () => {
    router.push('/booking')
  }

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Payment Issue - Booking Assistance Required')
    const body = encodeURIComponent(
      `Hello,\n\nI encountered an issue with my payment for booking reference: ${paymentIntentId || 'N/A'}\n\nError: ${errorMessage}\n\nPlease assist me with completing my reservation.\n\nThank you.`
    )
    window.location.href = `mailto:reservations@schiehallion.co.uk?subject=${subject}&body=${body}`
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-slate-950 mb-2">Access Required</h1>
          <p className="text-slate-400 mb-6">Please log in to view payment information</p>
          <a
            href="/"
            className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-red-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-1/3 h-[24rem] w-[24rem] rounded-full bg-orange-500/10 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto py-8">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 border-2 border-red-500/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-4xl font-semibold text-slate-950 mb-4">
            Payment Failed
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-2">
            We couldn't process your payment, but don't worry - your rooms are still held for you.
          </p>

          {roomHoldTime > 0 ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
              <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-amber-300 font-medium">
                Rooms held for: {formatTime(roomHoldTime)}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30">
              <span className="text-red-300 font-medium">
                Room hold has expired
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Error Details */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8">
            <h2 className="text-2xl font-semibold text-slate-950 mb-6">What Happened?</h2>

            <div className="space-y-4">
              <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-4">
                <h3 className="text-red-300 font-medium mb-2">Payment Error</h3>
                <p className="text-red-200 text-sm">{errorMessage}</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-slate-950 font-medium">Common reasons for payment failure:</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-1">•</span>
                    <span>Insufficient funds in your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-1">•</span>
                    <span>Card expired or details entered incorrectly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-1">•</span>
                    <span>Bank declined the transaction for security reasons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500 mt-1">•</span>
                    <span>Network or technical issue during processing</span>
                  </li>
                </ul>
              </div>
            </div>

            {paymentIntentId && (
              <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-white/10">
                <h4 className="text-slate-300 font-medium mb-2">Reference Number</h4>
                <p className="text-slate-400 text-sm font-mono">{paymentIntentId}</p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8">
            <h2 className="text-2xl font-semibold text-slate-950 mb-6">Next Steps</h2>

            <div className="space-y-4">
              {/* Retry Payment */}
              {roomHoldTime > 0 && retryAttempts < maxRetryAttempts && (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <h3 className="text-emerald-300 font-medium mb-2">Option 1: Try Again</h3>
                  <p className="text-emerald-200 text-sm mb-4">
                    Check your payment details and try again. Your rooms are still reserved.
                  </p>
                  <button
                    onClick={handleRetryPayment}
                    className="w-full py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition"
                  >
                    Retry Payment ({maxRetryAttempts - retryAttempts} attempts left)
                  </button>
                </div>
              )}

              {/* Alternative Payment */}
              <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <h3 className="text-emerald-300 font-medium mb-2">Option 2: Use Different Payment Method</h3>
                <p className="text-emerald-200 text-sm mb-4">
                  Try a different card or payment method to complete your booking.
                </p>
                <button
                  onClick={() => router.push('/booking/payment')}
                  className="w-full py-3 rounded-full bg-blue-400 text-slate-950 font-semibold hover:bg-blue-300 transition"
                >
                  Change Payment Method
                </button>
              </div>

              {/* Contact Support */}
              <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/30">
                <h3 className="text-amber-300 font-medium mb-2">Option 3: Contact Support</h3>
                <p className="text-amber-200 text-sm mb-4">
                  Our reservations team can help process your booking manually or resolve payment issues.
                </p>
                <button
                  onClick={handleContactSupport}
                  className="w-full py-3 rounded-full bg-amber-400 text-slate-950 font-semibold hover:bg-amber-300 transition"
                >
                  Email Reservations Team
                </button>
              </div>

              {/* New Booking */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={handleNewBooking}
                  className="w-full py-3 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition"
                >
                  Start New Booking
                </button>
              </div>
            </div>

            {/* Support Contact Info */}
            <div className="mt-8 p-4 rounded-xl bg-slate-800/50 border border-white/10">
              <h4 className="text-slate-950 font-medium mb-3">Need Immediate Help?</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a href="mailto:reservations@schiehallion.co.uk" className="text-slate-300 hover:text-slate-950">
                    reservations@schiehallion.co.uk
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-slate-300">+44 1887 820 000</span>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Available 24/7 for booking assistance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
