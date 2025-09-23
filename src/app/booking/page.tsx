// Epic 5: Booking Page
// Complete booking flow implementation

'use client'

import { useState, useEffect } from 'react'
import { RoomService } from '@/lib/firebase/hotel-service'
import { RoomService as MockRoomService } from '@/lib/firebase/hotel-service-mock'
import { Room } from '@/types/hotel'
import BookingFlow from '@/components/booking/BookingFlow'

export default function BookingPage() {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAvailableRooms = async () => {
      setLoading(true)
      try {
        const rooms = await RoomService.getRooms({
          status: 'available'
        })
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
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-4"></div>
          <p className="text-slate-400">Loading available rooms...</p>
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