'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { BookingService } from '@/lib/firebase/hotel-service'
import type { Booking } from '@/types/hotel'

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login?redirect=/bookings')
      return
    }

    const loadBookings = async () => {
      try {
        setLoading(true)
        const userBookings = await BookingService.getBookingsByUserId(user.uid)
        setBookings(userBookings)
      } catch (err) {
        console.error('Error loading bookings:', err)
        setError('Failed to load your bookings. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [user, authLoading, router])

  const formatDate = (date: any): string => {
    const d = date?.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'text-green-700 bg-green-50'
      case 'pending':
        return 'text-yellow-700 bg-yellow-50'
      case 'cancelled':
        return 'text-red-700 bg-red-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lundies-mist via-white to-lundies-stone/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-lundies-heather border-t-transparent animate-spin" />
          <p className="text-lundies-peat">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lundies-mist via-white to-lundies-stone/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-lundies-charcoal mb-2">My Bookings</h1>
          <p className="text-lundies-peat">View and manage your reservations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-3xl border border-lundies-stone/60">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lundies-stone/40 flex items-center justify-center">
              <svg className="w-8 h-8 text-lundies-peat" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-lundies-charcoal mb-2">No bookings yet</h3>
            <p className="text-lundies-peat mb-6">Start planning your stay at Schiehallion</p>
            <button
              onClick={() => router.push('/booking')}
              className="px-6 py-3 rounded-full bg-lundies-heather text-lundies-charcoal font-semibold hover:bg-lundies-heather/80 transition"
            >
              Make a Booking
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/60 backdrop-blur-sm rounded-3xl border border-lundies-stone/60 p-6 hover:bg-white/80 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-lundies-charcoal">
                        {booking.roomType}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1 text-lundies-peat">
                      <p>
                        <span className="font-medium">Check-in:</span> {formatDate(booking.checkInDate)}
                      </p>
                      <p>
                        <span className="font-medium">Check-out:</span> {formatDate(booking.checkOutDate)}
                      </p>
                      <p>
                        <span className="font-medium">Guests:</span> {booking.numberOfGuests}
                      </p>
                      {booking.bookingReference && (
                        <p className="text-sm">
                          <span className="font-medium">Reference:</span> {booking.bookingReference}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold text-lundies-charcoal">
                      £{(booking.totalCost / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-lundies-peat">
                      {booking.paymentStatus === 'completed' ? 'Paid' : 'Payment pending'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-full border border-lundies-stone/70 text-lundies-charcoal hover:bg-white/70 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
