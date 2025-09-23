// Epic 5: Booking Page
// Complete booking flow implementation

'use client'

import { useState, useEffect } from 'react'
import { RoomService as LiveRoomService } from '@/lib/firebase/hotel-service'
import { RoomService as MockRoomService } from '@/lib/firebase/hotel-service-mock'
import { Room } from '@/types/hotel'
import BookingFlow from '@/components/booking/BookingFlow'

export default function BookingPage() {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAvailableRooms = async () => {
      try {
        setError(null)
        const rooms = await LiveRoomService.getRooms({
          status: 'available'
        })
        if (!rooms.length) {
          throw new Error('No rooms returned from live service')
        }
        setAvailableRooms(rooms)
        setIsUsingFallbackData(false)
      } catch (error) {
        console.warn('Failed to load live room data, attempting fallback mock data:', error)

        try {
          const mockRooms = await MockRoomService.getRooms({
            status: 'available'
          })

          if (!mockRooms.length) {
            throw new Error('No mock rooms available')
          }

          setAvailableRooms(mockRooms)
          setIsUsingFallbackData(true)
        } catch (mockError) {
          console.error('Failed to load fallback room data:', mockError)
          setError("We're having trouble loading room availability right now. Please try again shortly.")
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

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 px-4">
          <h1 className="text-3xl font-semibold text-white">Availability Unavailable</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <BookingFlow
      initialStep="room-selection"
      availableRooms={availableRooms}
      isUsingMockData={isUsingFallbackData}
    />
  )
}
