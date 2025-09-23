'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SiteNavigation from '@/components/navigation/SiteNavigation'
import RoomList from '@/components/rooms/RoomList'
import AvailabilityCalendar from '@/components/rooms/AvailabilityCalendar'
import ShoppingCart from '@/components/booking/ShoppingCart'
import { useCartStore } from '@/store/cartStore'
import { Room, RoomType, PackageType } from '@/types/hotel'

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

export default function RoomsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { getCartSummary, addItem } = useCartStore()
  const [selectedDates, setSelectedDates] = useState<DateRange>({
    startDate: null,
    endDate: null
  })
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | undefined>()
  const [guests, setGuests] = useState(2)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [showCart, setShowCart] = useState(false)

  const cartSummary = getCartSummary()

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room)
  }

  const handleAddToCart = (room: Room) => {
    if (!selectedDates.startDate || !selectedDates.endDate) {
      alert('Please select check-in and check-out dates first')
      return
    }

    const checkInDate = formatDateForAPI(selectedDates.startDate)
    const checkOutDate = formatDateForAPI(selectedDates.endDate)
    const startDate = new Date(checkInDate)
    const endDate = new Date(checkOutDate)
    const numberOfNights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
    const packageType: PackageType = 'room-only'
    const packageOption = { type: packageType, name: 'Room Only', description: 'Accommodation only', priceAdjustment: 0, includes: ['Daily housekeeping', 'WiFi'] }
    const totalRoomCost = room.pricing.basePrice * numberOfNights
    const totalPackageCost = 0

    addItem({
      room,
      checkInDate,
      checkOutDate,
      numberOfNights,
      guests,
      packageType,
      packageOption,
      roomRate: room.pricing.basePrice,
      packageRate: 0,
      totalRoomCost,
      totalPackageCost,
      totalCost: totalRoomCost + totalPackageCost
    })

    setSelectedRoom(null)
    setShowCart(true)
  }

  const handleProceedToBooking = () => {
    router.push('/booking')
  }

  const formatPrice = (priceInPence: number): string => {
    return `£${(priceInPence / 100).toFixed(2)}`
  }

  const clearDates = () => {
    setSelectedDates({ startDate: null, endDate: null })
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-slate-950 mb-2">Access Required</h1>
          <p className="text-slate-400 mb-6">Please log in to view rooms and make bookings</p>
          <Link
            href="/"
            className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
          >
            Go to Login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-screen">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-1/3 h-[24rem] w-[24rem] rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <SiteNavigation
            layout="standard"
            actionSlot={
              cartSummary.itemCount > 0 ? (
                <button
                  onClick={() => setShowCart(true)}
                  className="rounded-full border border-emerald-400/30 bg-emerald-400/20 px-4 py-2 text-emerald-300 transition hover:bg-emerald-400/30"
                >
                  <span className="text-sm font-medium">
                    Cart ({cartSummary.itemCount}) - {formatPrice(cartSummary.total)}
                  </span>
                </button>
              ) : null
            }
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300 mb-2">Room Selection</p>
              <h1 className="text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                Find Your Perfect Stay
              </h1>
              <p className="mt-4 text-lg text-slate-300 max-w-2xl">
                Discover our collection of thoughtfully designed rooms and suites, each offering unique Highland views 
                and modern amenities for an unforgettable Perthshire experience.
              </p>
            </div>
            
            {/* Quick Search Controls */}
            <div className="flex-shrink-0">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 min-w-[300px]">
                <h3 className="text-lg font-semibold text-slate-950">Quick Search</h3>
                
                {/* Date Selection */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-3 text-left transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {selectedDates.startDate ? (
                      <div>
                        <div className="text-sm text-slate-300">Selected Dates</div>
                        <div className="text-slate-950">
                          {selectedDates.startDate.toLocaleDateString()}
                          {selectedDates.endDate && ` - ${selectedDates.endDate.toLocaleDateString()}`}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-slate-300">Check-in & Check-out</div>
                        <div className="text-slate-400">Select your dates</div>
                      </div>
                    )}
                  </button>
                  
                  {selectedDates.startDate && (
                    <button
                      onClick={clearDates}
                      className="w-full text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      Clear dates
                    </button>
                  )}
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5+ Guests</option>
                  </select>
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Room Type</label>
                  <select
                    value={selectedRoomType || ''}
                    onChange={(e) => setSelectedRoomType(e.target.value as RoomType || undefined)}
                    className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="">All Room Types</option>
                    <option value="standard">Standard Room</option>
                    <option value="deluxe">Deluxe Room</option>
                    <option value="suite">Suite</option>
                    <option value="family">Family Room</option>
                    <option value="accessible">Accessible Room</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Modal */}
        {showCalendar && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 text-slate-950 hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  ×
                </button>
                <AvailabilityCalendar
                  selectedDates={selectedDates}
                  onDateRangeChange={(dates) => {
                    setSelectedDates(dates)
                    if (dates.startDate && dates.endDate) {
                      setShowCalendar(false)
                    }
                  }}
                  roomType={selectedRoomType}
                />
              </div>
            </div>
          </div>
        )}

        {/* Room List */}
        <RoomList
          onRoomSelect={handleRoomSelect}
          checkInDate={selectedDates.startDate ? formatDateForAPI(selectedDates.startDate) : undefined}
          checkOutDate={selectedDates.endDate ? formatDateForAPI(selectedDates.endDate) : undefined}
          guests={guests}
          selectedRoomType={selectedRoomType}
        />
      </div>

      {/* Selected Room Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-slate-950">
                  {selectedRoom.type.charAt(0).toUpperCase() + selectedRoom.type.slice(1)} Room
                </h3>
                <p className="text-emerald-300">Room {selectedRoom.roomNumber}</p>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-950 hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-300">{selectedRoom.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Guests:</span>
                    <span className="text-slate-950">{selectedRoom.maxOccupancy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Size:</span>
                    <span className="text-slate-950">{selectedRoom.size}m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">View:</span>
                    <span className="text-slate-950 capitalize">{selectedRoom.view}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Floor:</span>
                    <span className="text-slate-950">{selectedRoom.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Price:</span>
                    <span className="text-emerald-300 font-semibold">
                      £{(selectedRoom.pricing.basePrice / 100).toFixed(2)}/night
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10 space-y-3">
                <button
                  onClick={() => handleAddToCart(selectedRoom)}
                  className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedRoom)
                    // Auto-proceed to booking after adding to cart
                    setTimeout(() => handleProceedToBooking(), 500)
                  }}
                  className="w-full rounded-full border border-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300 transition hover:bg-emerald-400/10"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Modal */}
      <ShoppingCart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onProceedToBooking={handleProceedToBooking}
      />
    </main>
  )
}