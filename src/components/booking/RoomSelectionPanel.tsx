'use client'

import { useEffect, useMemo, useState } from 'react'
import { PackageType, Room } from '@/types/hotel'
import { PACKAGE_OPTIONS, useCartStore } from '@/store/cartStore'
import { AvailabilityService } from '@/lib/firebase/hotel-service'

interface RoomSelectionPanelProps {
  availableRooms: Room[]
  initialGuests?: number
}

const toDateInputValue = (date: Date): string => {
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().split('T')[0]
}

const calculateNights = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const diff = checkOutDate.getTime() - checkInDate.getTime()
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0
}

const formatPrice = (priceInPence: number): string => {
  return `£${(priceInPence / 100).toFixed(2)}`
}

export const RoomSelectionPanel: React.FC<RoomSelectionPanelProps> = ({
  availableRooms,
  initialGuests = 2
}) => {
  const addItem = useCartStore(state => state.addItem)

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [checkInDate, setCheckInDate] = useState<string>('')
  const [checkOutDate, setCheckOutDate] = useState<string>('')
  const [guests, setGuests] = useState<number>(initialGuests)
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('room-only')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [dateFilteredRooms, setDateFilteredRooms] = useState<Room[]>(availableRooms)

  // Filter rooms by selected dates
  useEffect(() => {
    const filterRoomsByDates = async () => {
      if (!checkInDate || !checkOutDate) {
        // No dates selected - show all rooms
        setDateFilteredRooms(availableRooms)
        return
      }

      try {
        // Get room IDs that are available for selected dates
        const availableRoomIds = await AvailabilityService.getAvailableRoomIds(checkInDate, checkOutDate)

        // Filter the available rooms to only include those that are available for the dates
        const filtered = availableRooms.filter(room => availableRoomIds.includes(room.id))
        setDateFilteredRooms(filtered)

        // If currently selected room is no longer available, clear selection
        if (selectedRoomId && !availableRoomIds.includes(selectedRoomId)) {
          setSelectedRoomId(filtered.length > 0 ? filtered[0].id : null)
        }
      } catch (error) {
        console.error('[RoomSelectionPanel] Error filtering rooms by dates:', error)
        // On error, show all rooms as fallback
        setDateFilteredRooms(availableRooms)
      }
    }

    filterRoomsByDates()
  }, [checkInDate, checkOutDate, availableRooms, selectedRoomId])

  useEffect(() => {
    if (dateFilteredRooms.length > 0) {
      setSelectedRoomId(prev => prev ?? dateFilteredRooms[0].id)
    }
  }, [dateFilteredRooms])

  const selectedRoom = useMemo(
    () => dateFilteredRooms.find(room => room.id === selectedRoomId) ?? null,
    [dateFilteredRooms, selectedRoomId]
  )

  const today = useMemo(() => toDateInputValue(new Date()), [])

  const minimumCheckout = useMemo(() => {
    if (!checkInDate) return ''
    const nextDay = new Date(checkInDate)
    nextDay.setDate(nextDay.getDate() + 1)
    return toDateInputValue(nextDay)
  }, [checkInDate])

  const numberOfNights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0
    return calculateNights(checkInDate, checkOutDate)
  }, [checkInDate, checkOutDate])

  const packageOption = PACKAGE_OPTIONS[selectedPackage]
  const roomRate = selectedRoom?.pricing.basePrice ?? 0
  const totalRoomCost = numberOfNights * roomRate
  const totalPackageCost = numberOfNights * packageOption.priceAdjustment
  const estimatedTotal = totalRoomCost + totalPackageCost
  const exceedsOccupancy = selectedRoom ? guests > selectedRoom.maxOccupancy : false

  const handleAddToCart = async () => {
    setError(null)
    setSuccessMessage(null)

    if (!selectedRoom) {
      setError('Please select a room to continue.')
      return
    }

    if (!checkInDate || !checkOutDate) {
      setError('Please choose both a check-in and check-out date.')
      return
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setError('Check-out must be after the check-in date.')
      return
    }

    if (exceedsOccupancy) {
      setError(`This room accommodates up to ${selectedRoom.maxOccupancy} guest${selectedRoom.maxOccupancy === 1 ? '' : 's'}.`)
      return
    }

    const nights = calculateNights(checkInDate, checkOutDate)

    if (nights <= 0) {
      setError('Your stay must be at least one night.')
      return
    }

    const packageDetails = PACKAGE_OPTIONS[selectedPackage]
    const totalRoom = selectedRoom.pricing.basePrice * nights
    const totalPackage = packageDetails.priceAdjustment * nights

    try {
      await addItem({
        room: selectedRoom,
        checkInDate,
        checkOutDate,
        numberOfNights: nights,
        guests,
        packageType: selectedPackage,
        packageOption: packageDetails,
        roomRate: selectedRoom.pricing.basePrice,
        packageRate: packageDetails.priceAdjustment,
        totalRoomCost: totalRoom,
        totalPackageCost: totalPackage,
        totalCost: totalRoom + totalPackage
      })

      setSuccessMessage(`Added ${selectedRoom.type} room for ${nights} night${nights > 1 ? 's' : ''} to your cart.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add room to cart. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/40 backdrop-blur-sm p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-lundies-peat">
                Check-in Date
                <input
                  type="date"
                  min={today}
                  value={checkInDate}
                  onChange={(event) => {
                    setCheckInDate(event.target.value)
                    if (checkOutDate && new Date(event.target.value) >= new Date(checkOutDate)) {
                      const nextDay = new Date(event.target.value)
                      nextDay.setDate(nextDay.getDate() + 1)
                      setCheckOutDate(toDateInputValue(nextDay))
                    }
                  }}
                  className="rounded-xl border border-lundies-stone/60 bg-white px-3 py-2 text-lundies-charcoal shadow-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-lundies-peat">
                Check-out Date
                <input
                  type="date"
                  min={minimumCheckout || today}
                  value={checkOutDate}
                  onChange={(event) => setCheckOutDate(event.target.value)}
                  className="rounded-xl border border-lundies-stone/60 bg-white px-3 py-2 text-lundies-charcoal shadow-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm text-lundies-peat">
                Guests
                <input
                  type="number"
                  min={1}
                  max={selectedRoom?.maxOccupancy ?? 6}
                  value={guests}
                  onChange={(event) => setGuests(Number(event.target.value))}
                  className="rounded-xl border border-lundies-stone/60 bg-white px-3 py-2 text-lundies-charcoal shadow-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
                />
                {selectedRoom && (
                  <span className="text-xs text-lundies-stone">
                    Max {selectedRoom.maxOccupancy} guest{selectedRoom.maxOccupancy === 1 ? '' : 's'} for this room
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-2 text-sm text-lundies-peat">
                Package
                <select
                  value={selectedPackage}
                  onChange={(event) => setSelectedPackage(event.target.value as PackageType)}
                  className="rounded-xl border border-lundies-stone/60 bg-white px-3 py-2 text-lundies-charcoal shadow-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
                >
                  {Object.entries(PACKAGE_OPTIONS).map(([key, option]) => (
                    <option key={key} value={key}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-lundies-charcoal mb-3">Choose your room</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {dateFilteredRooms.map(room => {
                const isSelected = selectedRoomId === room.id
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setSelectedRoomId(room.id)
                      setError(null)
                      setSuccessMessage(null)
                    }}
                    className={`text-left rounded-2xl border p-4 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-lundies-heather ${
                      isSelected
                        ? 'border-lundies-heather bg-lundies-heather/20 shadow-lundies-heather/40'
                        : 'border-lundies-stone/60 bg-white/70 hover:border-lundies-heather/60'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-semibold capitalize text-lundies-charcoal">
                          {room.type} Room
                        </h4>
                        <p className="text-sm text-lundies-peat">Room {room.roomNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-semibold text-lundies-charcoal">
                          {formatPrice(room.pricing.basePrice)}
                        </p>
                        <p className="text-xs text-lundies-stone">per night</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-lundies-peat">
                      <span>Max {room.maxOccupancy} guests</span>
                      <span>{room.size}m²</span>
                      <span className="capitalize">{room.view} view</span>
                      <span>Floor {room.floor}</span>
                    </div>

                    {room.features && (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {room.features.wifi && (
                          <span className="rounded-full bg-lundies-heather/20 px-2 py-1 text-lundies-moss">WiFi</span>
                        )}
                        {room.features.balcony && (
                          <span className="rounded-full bg-sky-500/20 px-2 py-1 text-sky-700">Balcony</span>
                        )}
                        {room.features.airConditioning && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-1 text-blue-700">AC</span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}

              {availableRooms.length === 0 && (
                <div className="rounded-2xl border border-dashed border-lundies-stone/60 bg-white/70 p-6 text-center text-lundies-peat">
                  No rooms are available for the selected criteria right now.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-3xl border border-lundies-stone/60 bg-white/80 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-lundies-charcoal">Your stay details</h3>

          <div className="space-y-2 text-sm text-lundies-peat">
            <div className="flex justify-between">
              <span>Check-in</span>
              <span>{checkInDate ? new Date(checkInDate).toLocaleDateString() : 'Select date'}</span>
            </div>
            <div className="flex justify-between">
              <span>Check-out</span>
              <span>{checkOutDate ? new Date(checkOutDate).toLocaleDateString() : 'Select date'}</span>
            </div>
            <div className="flex justify-between">
              <span>Nights</span>
              <span>{numberOfNights || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>Guests</span>
              <span>{guests}</span>
            </div>
            <div className="flex justify-between">
              <span>Package</span>
              <span>{packageOption.name}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-lundies-heather/20 p-4 text-sm text-lundies-charcoal">
            <div className="flex justify-between">
              <span>Room</span>
              <span>{formatPrice(totalRoomCost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Package</span>
              <span>{formatPrice(totalPackageCost)}</span>
            </div>
            <div className="mt-2 border-t border-lundies-heather/40 pt-2 text-base font-semibold">
              <div className="flex justify-between">
                <span>Estimated total</span>
                <span>{formatPrice(estimatedTotal)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-lundies-heather/60 bg-lundies-heather/30 px-4 py-3 text-sm text-lundies-charcoal">
              {successMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedRoom || availableRooms.length === 0}
            className="w-full rounded-full bg-lundies-heather px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-lundies-charcoal transition hover:bg-lundies-heather/80 disabled:cursor-not-allowed disabled:bg-lundies-stone/40 disabled:text-lundies-peat"
          >
            Add Room to Cart
          </button>

          {exceedsOccupancy && (
            <p className="text-xs text-red-600">
              Selected guest count exceeds this room's capacity.
            </p>
          )}
        </aside>
      </div>
    </div>
  )
}

export default RoomSelectionPanel
