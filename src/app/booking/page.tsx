// Epic 5: Booking Page
// Complete booking flow implementation

'use client'

import { useState, useEffect } from 'react'
import { RoomService } from '@/lib/firebase/hotel-service'
import { RoomService as MockRoomService } from '@/lib/firebase/hotel-service-mock'
import { Room } from '@/types/hotel'
import BookingFlow from '@/components/booking/BookingFlow'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'

export default function BookingPage() {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const { items } = useCartStore()

  useEffect(() => {
    const loadAvailableRooms = async () => {
      setLoading(true)
      try {
        console.log('[BookingPage] Loading available rooms')

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Firebase query timeout')), 5000)
        )

        const rooms = await Promise.race([
          RoomService.getRooms({ status: 'available' }),
          timeoutPromise
        ])

        if (rooms.length > 0) {
          setAvailableRooms(rooms)
          return
        }
        // Fallback to mock data when no live data is available
        const mockRooms = await MockRoomService.getRooms({
          status: 'available'
        })
        setAvailableRooms(mockRooms)
      } catch (error) {
        console.error('Failed to load available rooms:', error)
        try {
          const mockRooms = await MockRoomService.getRooms({
            status: 'available'
          })
          setAvailableRooms(mockRooms)
        } catch (mockError) {
          console.error('Failed to load mock rooms:', mockError)
          setAvailableRooms([])
        }
      } finally {
        setLoading(false)
      }
    }

    loadAvailableRooms()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-lundies-charcoal to-lundies-peat flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-lundies-heather mb-4"></div>
          <p className="text-lundies-stone">Loading available rooms...</p>
        </div>
      </main>
    )
  }

  // If cart has items, skip room selection and go straight to guest info
  const initialStep = items.length > 0 ? 'guest-info' : 'room-selection'

  return (
    <BookingFlow
      initialStep={initialStep}
      availableRooms={availableRooms}
    />
  )
}