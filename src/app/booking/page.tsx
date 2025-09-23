// Epic 5: Booking Page
// Complete booking flow implementation

'use client'

import { useState, useEffect } from 'react'
import { RoomService } from '@/lib/firebase/hotel-service'
import { Room } from '@/types/hotel'
import BookingFlow from '@/components/booking/BookingFlow'

export default function BookingPage() {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAvailableRooms = async () => {
      try {
        const rooms = await RoomService.getRooms({
          status: 'available'
        })
        setAvailableRooms(rooms)
      } catch (error) {
        console.error('Failed to load available rooms:', error)
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

  return (
    <BookingFlow
      initialStep="room-selection"
      availableRooms={availableRooms}
    />
  )
}