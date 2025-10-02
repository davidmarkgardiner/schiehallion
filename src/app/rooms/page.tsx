'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SiteNavigation from '@/components/navigation/SiteNavigation'
import { useCartStore } from '@/store/cartStore'
import { Room, RoomType, PackageType } from '@/types/hotel'

// Lazy load heavy components
const RoomList = dynamic(() => import('@/components/rooms/RoomList'), {
  loading: () => <div className="text-center py-12 text-lundies-moss">Loading rooms...</div>
})
const AvailabilityCalendar = dynamic(() => import('@/components/rooms/AvailabilityCalendar'), {
  ssr: false
})
const ShoppingCart = dynamic(() => import('@/components/booking/ShoppingCart'), {
  ssr: false
})
const PerformanceDashboard = dynamic(() => import('@/components/dev/PerformanceDashboard'), {
  ssr: false
})

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

  return (
    <main className="relative overflow-hidden bg-lundies-ivory text-lundies-charcoal min-h-screen">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-lundies-heather/30 blur-[160px]" />
        <div className="absolute right-[-10%] top-1/3 h-[24rem] w-[24rem] rounded-full bg-lundies-sand/30 blur-[160px]" />
      </div>

      {/* Header */}
      <header className="border-b border-lundies-stone/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <SiteNavigation
            layout="standard"
            actionSlot={
              cartSummary.itemCount > 0 ? (
                <button
                  onClick={() => setShowCart(true)}
                  className="rounded-full border border-lundies-heather/60 bg-lundies-heather/20 px-4 py-2 text-lundies-moss transition hover:bg-lundies-heather/30"
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
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lundies-moss mb-2">Room Selection</p>
              <h1 className="text-4xl font-semibold leading-tight text-lundies-charcoal sm:text-5xl">
                Find Your Perfect Stay
              </h1>
              <p className="mt-4 text-lg text-lundies-peat max-w-2xl">
                Discover our collection of thoughtfully designed rooms and suites, each offering unique Highland views 
                and modern amenities for an unforgettable Perthshire experience.
              </p>
            </div>
            
            {/* Quick Search Controls */}
            <div className="flex-shrink-0">
              <div className="rounded-3xl border border-lundies-stone/60 bg-white/80 p-6 space-y-4 min-w-[300px]">
                <h3 className="text-lg font-semibold text-lundies-charcoal">Quick Search</h3>
                
                {/* Date Selection */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full rounded-2xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-left transition hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-lundies-heather"
                  >
                    {selectedDates.startDate ? (
                      <div>
                        <div className="text-sm text-lundies-peat">Selected Dates</div>
                        <div className="text-lundies-charcoal">
                          {selectedDates.startDate.toLocaleDateString()}
                          {selectedDates.endDate && ` - ${selectedDates.endDate.toLocaleDateString()}`}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-lundies-peat">Check-in & Check-out</div>
                        <div className="text-lundies-moss">Select your dates</div>
                      </div>
                    )}
                  </button>
                  
                  {selectedDates.startDate && (
                    <button
                      onClick={clearDates}
                      className="w-full text-sm text-lundies-moss hover:text-lundies-charcoal transition-colors"
                    >
                      Clear dates
                    </button>
                  )}
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-sm font-medium text-lundies-peat mb-2">Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    className="w-full rounded-2xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-2 text-lundies-charcoal focus:outline-none focus:ring-2 focus:ring-lundies-heather"
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
                  <label className="block text-sm font-medium text-lundies-peat mb-2">Room Type</label>
                  <select
                    value={selectedRoomType || ''}
                    onChange={(e) => setSelectedRoomType(e.target.value as RoomType || undefined)}
                    className="w-full rounded-2xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-2 text-lundies-charcoal focus:outline-none focus:ring-2 focus:ring-lundies-heather"
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative bg-white rounded-3xl shadow-2xl">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-lundies-charcoal text-white hover:bg-lundies-moss transition-colors flex items-center justify-center text-2xl font-light shadow-lg"
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
        <div className="fixed inset-0 bg-lundies-peat/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-lundies-stone/60 bg-white/95 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-lundies-charcoal">
                  {selectedRoom.type.charAt(0).toUpperCase() + selectedRoom.type.slice(1)} Room
                </h3>
                <p className="text-lundies-moss">Room {selectedRoom.roomNumber}</p>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="w-8 h-8 rounded-full bg-white/80 text-lundies-charcoal hover:bg-white transition-colors flex items-center justify-center"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-lundies-peat">{selectedRoom.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-lundies-moss">Max Guests:</span>
                    <span className="text-lundies-charcoal">{selectedRoom.maxOccupancy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lundies-moss">Size:</span>
                    <span className="text-lundies-charcoal">{selectedRoom.size}m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lundies-moss">View:</span>
                    <span className="text-lundies-charcoal capitalize">{selectedRoom.view}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-lundies-moss">Floor:</span>
                    <span className="text-lundies-charcoal">{selectedRoom.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lundies-moss">Price:</span>
                    <span className="text-lundies-moss font-semibold">
                      £{(selectedRoom.pricing.basePrice / 100).toFixed(2)}/night
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-lundies-stone/60 space-y-3">
                <button
                  onClick={() => handleAddToCart(selectedRoom)}
                  className="w-full rounded-full bg-lundies-heather px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-lundies-charcoal transition hover:bg-lundies-heather/80"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedRoom)
                    // Auto-proceed to booking after adding to cart
                    setTimeout(() => handleProceedToBooking(), 500)
                  }}
                  className="w-full rounded-full border border-lundies-heather px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-lundies-moss transition hover:bg-lundies-heather/10"
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

      {/* Performance Dashboard (dev only) */}
      <PerformanceDashboard />
    </main>
  )
}