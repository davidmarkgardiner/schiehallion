// Epic 6: Payment Success Page
// SCHH-018: Payment Confirmation Flow

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { PaymentService } from '@/lib/payment-service'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const paymentIntentId = searchParams?.get('payment_intent')
  const redirectStatus = searchParams?.get('redirect_status')

  useEffect(() => {
    if (!paymentIntentId) {
      setError('No payment information found')
      setLoading(false)
      return
    }

    confirmPayment()
  }, [paymentIntentId])

  const confirmPayment = async () => {
    if (!user || !paymentIntentId) return

    try {
      setLoading(true)
      
      const token = await user.getIdToken()
      
      // Confirm payment on server
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentIntentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm payment')
      }

      if (data.data.status === 'succeeded') {
        // Generate receipt
        const receipt = await PaymentService.generateReceipt(paymentIntentId)
        setPaymentDetails({
          ...data.data,
          receipt,
        })
      } else {
        setError('Payment was not successful')
      }
    } catch (err) {
      console.error('Payment confirmation failed:', err)
      setError(err instanceof Error ? err.message : 'Payment confirmation failed')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (amount: number): string => {
    return `£${amount.toFixed(2)}`
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-slate-950 mb-2">Access Required</h1>
          <p className="text-slate-400 mb-6">Please log in to view your payment confirmation</p>
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-4"></div>
          <p className="text-slate-400">Confirming your payment...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>

            <h1 className="text-3xl font-semibold text-slate-950 mb-4">
              Payment Confirmation Failed
            </h1>

            <p className="text-lg text-slate-300 mb-6">{error}</p>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/bookings')}
                className="flex-1 py-3 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push('/booking')}
                className="flex-1 py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition"
              >
                Book Again
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-1/3 h-[24rem] w-[24rem] rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-400 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          <h1 className="text-4xl font-semibold text-slate-950 mb-4">
            Payment Successful!
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Thank you for choosing Schiehallion Hotel. Your Highland getaway is confirmed!
          </p>
        </div>

        {paymentDetails && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Booking Confirmation */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-slate-950 mb-6">Booking Confirmation</h2>

              {paymentDetails.receipt && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                    <div className="text-center">
                      <p className="text-emerald-300 font-medium mb-2">
                        Receipt Number: {paymentDetails.receipt.receiptNumber}
                      </p>
                      <p className="text-slate-300 text-sm">
                        Paid on {paymentDetails.receipt.paidAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Booking Details */}
                  {paymentDetails.receipt.bookingDetails.map((booking: any, index: number) => (
                    <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-slate-950 font-medium">
                            {booking.roomId} - Room {booking.roomNumber || 'TBD'}
                          </h4>
                          <p className="text-slate-400 text-sm">
                            {booking.checkInDate.toDate().toLocaleDateString()} - {booking.checkOutDate.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-emerald-300 font-medium">
                          {formatPrice(booking.totalAmount / 100)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {booking.numberOfNights} nights • {booking.totalGuests} guests
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-xl font-semibold text-slate-950">
                      <span>Total Paid:</span>
                      <span>{formatPrice(paymentDetails.receipt.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* What's Next */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8">
              <h2 className="text-2xl font-semibold text-slate-950 mb-6">What's Next?</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-slate-950 font-medium">Confirmation Email</h3>
                    <p className="text-slate-400 text-sm">
                      Sent to {user.email} with your booking details and receipt
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-slate-950 font-medium">Calendar Invite</h3>
                    <p className="text-slate-400 text-sm">
                      Add your stay dates to your calendar with hotel details
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-slate-950 font-medium">Pre-Arrival Contact</h3>
                    <p className="text-slate-400 text-sm">
                      We'll contact you 48 hours before arrival to confirm details
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-xl bg-blue-500/20 border border-blue-500/30">
                <h4 className="text-emerald-300 font-medium mb-2">Need to make changes?</h4>
                <p className="text-emerald-200 text-sm mb-3">
                  Contact us at least 48 hours before your arrival for any modifications.
                </p>
                <a
                  href="mailto:reservations@schiehallion.co.uk"
                  className="text-emerald-300 text-sm underline"
                >
                  reservations@schiehallion.co.uk
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => router.push('/bookings')}
            className="py-3 px-6 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push('/booking')}
            className="py-3 px-6 rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition"
          >
            Book Another Stay
          </button>
        </div>
      </div>
    </main>
  )
}
