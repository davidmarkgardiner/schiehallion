'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { DailyAvailability, Room, RoomType, PackageType } from '@/types/hotel'
import { AvailabilityService as FirebaseAvailabilityService } from '@/lib/firebase/hotel-service'
import { AvailabilityService as MockAvailabilityService } from '@/lib/firebase/hotel-service-mock'
import { useCartStore, PACKAGE_OPTIONS } from '@/store/cartStore'

interface DragDropCalendarProps {
  availableRooms: Room[]
  selectedRoomType?: RoomType
  guests: number
  onRoomDrop?: (roomId: string, targetDate: string) => void
}

interface CalendarDay {
  date: Date
  dateString: string
  isCurrentMonth: boolean
  isBlocked: boolean
  availability?: number
  price?: number
  isPeak?: boolean
}

interface RoomCardProps {
  room: Room
  isSelected: boolean
  onSelect: () => void
}

type FeedbackType = 'info' | 'success' | 'error'

const formatCurrency = (priceInPence: number): string => {
  return `£${(priceInPence / 100).toFixed(2)}`
}

const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  })
}

const RoomCard: React.FC<RoomCardProps> = ({ room, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        w-full text-left rounded-2xl border p-4 transition-all
        ${isSelected
          ? 'border-lundies-heather bg-lundies-heather/20 shadow-2xl shadow-lundies-heather/30'
          : 'border-white/10 bg-white/5 hover:bg-white/10'}
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-white font-medium capitalize text-sm">
            {room.type} Room
          </h3>
          <p className="text-lundies-heather text-xs">Room {room.roomNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-white font-semibold text-sm">
            {formatCurrency(room.pricing.basePrice)}
          </p>
          <p className="text-lundies-stone text-xs">per night</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-lundies-stone mb-2">
        <div>Max: {room.maxOccupancy}</div>
        <div>{room.size}m²</div>
        <div className="capitalize">{room.view} view</div>
        <div>Floor {room.floor}</div>
      </div>

      <div className="flex flex-wrap gap-1">
        {room.features.wifi && (
          <span className="px-2 py-1 rounded-full bg-lundies-heather/20 text-lundies-heather text-xs">
            WiFi
          </span>
        )}
        {room.features.balcony && (
          <span className="px-2 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs">
            Balcony
          </span>
        )}
        {room.features.airConditioning && (
          <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
            AC
          </span>
        )}
      </div>

      <div className="mt-2 text-center text-xs text-lundies-stone">
        {isSelected ? 'Selected' : 'Click to choose this room'}
      </div>
    </button>
  )
}

const DragDropCalendar: React.FC<DragDropCalendarProps> = ({
  availableRooms,
  selectedRoomType,
  guests,
  onRoomDrop
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availabilityData, setAvailabilityData] = useState<Record<string, DailyAvailability>>({})
  const [loading, setLoading] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('room-only')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [hoverDate, setHoverDate] = useState<string | null>(null)
  const [selectedDates, setSelectedDates] = useState<{ checkIn: string | null; checkOut: string | null }>({
    checkIn: null,
    checkOut: null
  })
  const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null)

  const { addItem } = useCartStore()

  type AvailabilityClient = Pick<typeof FirebaseAvailabilityService, 'getDailyAvailability'>

  const fetchAvailabilityForMonth = async (service: AvailabilityClient) => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    const data: Record<string, DailyAvailability> = {}

    const currentDate = new Date(startOfMonth)
    while (currentDate <= endOfMonth) {
      const dateStr = currentDate.toISOString().split('T')[0]
      try {
        const dayAvailability = await service.getDailyAvailability(dateStr)
        if (dayAvailability) {
          data[dateStr] = dayAvailability
        }
      } catch (error) {
        console.warn(`Failed to load availability for ${dateStr}:`, error)
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return data
  }

  const hasUsableAvailability = (data: Record<string, DailyAvailability>) => {
    if (Object.keys(data).length === 0) return false

    return Object.values(data).some(day =>
      Object.values(day.availability || {}).some(typeAvail => typeAvail.availableRooms > 0)
    )
  }

  const getAvailabilityCount = (availability: DailyAvailability | undefined, type?: RoomType): number => {
    if (!availability) return 0

    if (type && availability.availability[type]) {
      return availability.availability[type].availableRooms
    }

    return Object.values(availability.availability)
      .reduce((total, typeAvail) => total + typeAvail.availableRooms, 0)
  }

  const getPrice = (availability: DailyAvailability | undefined, type?: RoomType): number | undefined => {
    if (!availability) return undefined

    if (type && availability.pricing[type]) {
      return availability.pricing[type].adjustedPrice
    }

    const prices = Object.values(availability.pricing)
      .filter(p => p.adjustedPrice > 0)
      .map(p => p.adjustedPrice)

    if (prices.length === 0) return undefined
    return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
  }

  const isPeakSeason = (date: Date): boolean => {
    const month = date.getMonth()
    return month >= 5 && month <= 8 // June to September
  }

  useEffect(() => {
    const loadAvailabilityData = async () => {
      setLoading(true)
      try {
        const primaryData = await fetchAvailabilityForMonth(FirebaseAvailabilityService)

        if (hasUsableAvailability(primaryData)) {
          setAvailabilityData(primaryData)
        } else {
          const fallbackData = await fetchAvailabilityForMonth(MockAvailabilityService)
          setAvailabilityData(fallbackData)
        }
      } catch (error) {
        console.error('Failed to load availability data:', error)
        try {
          const fallbackData = await fetchAvailabilityForMonth(MockAvailabilityService)
          setAvailabilityData(fallbackData)
        } catch (mockError) {
          console.error('Failed to load mock availability data:', mockError)
          setAvailabilityData({})
        }
      } finally {
        setLoading(false)
      }
    }

    loadAvailabilityData()
  }, [currentMonth])

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)
    const startOfCalendar = new Date(startOfMonth)
    startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay())

    const days: CalendarDay[] = []
    const currentDate = new Date(startOfCalendar)

    for (let i = 0; i < 42; i++) {
      const dateString = currentDate.toISOString().split('T')[0]
      const availability = availabilityData[dateString]
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const comparisonDate = new Date(currentDate)
      comparisonDate.setHours(0, 0, 0, 0)

      days.push({
        date: new Date(currentDate),
        dateString,
        isCurrentMonth: currentDate.getMonth() === month,
        isBlocked: comparisonDate < today,
        availability: getAvailabilityCount(availability, selectedRoomType),
        price: getPrice(availability, selectedRoomType),
        isPeak: isPeakSeason(currentDate)
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }, [currentMonth, availabilityData, selectedRoomType])

  const selectedRoom = useMemo(
    () => availableRooms.find(room => room.id === selectedRoomId) || null,
    [availableRooms, selectedRoomId]
  )

  const selectionRangeEnd = useMemo(() => {
    if (!selectedDates.checkIn) return null
    if (selectedDates.checkOut) return selectedDates.checkOut
    if (hoverDate && new Date(hoverDate) > new Date(selectedDates.checkIn)) {
      return hoverDate
    }
    return null
  }, [selectedDates, hoverDate])

  const getDaySelectionState = useCallback(
    (day: CalendarDay) => {
      const { dateString } = day
      const isStart = selectedDates.checkIn === dateString
      const isEnd = selectedDates.checkOut === dateString

      let isInRange = false
      if (selectedDates.checkIn && selectionRangeEnd) {
        const start = new Date(selectedDates.checkIn)
        const end = new Date(selectionRangeEnd)
        const current = new Date(dateString)
        isInRange = current > start && current < end
      }

      return { isStart, isEnd, isInRange }
    },
    [selectedDates, selectionRangeEnd]
  )

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  const resetDateSelection = () => {
    setSelectedDates({ checkIn: null, checkOut: null })
    setHoverDate(null)
  }

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(prev => (prev === roomId ? null : roomId))
    resetDateSelection()
    setFeedback(null)
  }

  const handleDayClick = (day: CalendarDay) => {
    if (day.isBlocked || !day.isCurrentMonth) {
      return
    }

    if (!selectedRoom) {
      setFeedback({
        type: 'error',
        message: 'Select a room before choosing your stay dates.'
      })
      return
    }

    const clickedDate = day.dateString

    if (!selectedDates.checkIn || selectedDates.checkOut) {
      setSelectedDates({ checkIn: clickedDate, checkOut: null })
      setFeedback({
        type: 'info',
        message: `Check-in set to ${formatDisplayDate(clickedDate)}. Now pick your check-out date.`
      })
      return
    }

    const checkInDate = selectedDates.checkIn
    if (!checkInDate) {
      return
    }

    const checkIn = new Date(checkInDate)
    const checkOut = new Date(clickedDate)

    if (checkOut <= checkIn) {
      setSelectedDates({ checkIn: clickedDate, checkOut: null })
      setFeedback({
        type: 'info',
        message: `Check-in updated to ${formatDisplayDate(clickedDate)}. Choose a later date for check-out.`
      })
      return
    }

    const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24))
    const packageOption = PACKAGE_OPTIONS[selectedPackage]
    const totalRoomCost = selectedRoom.pricing.basePrice * numberOfNights
    const totalPackageCost = packageOption.priceAdjustment * numberOfNights
    const totalCost = totalRoomCost + totalPackageCost

    addItem({
      room: selectedRoom,
      checkInDate,
      checkOutDate: clickedDate,
      numberOfNights,
      guests,
      packageType: selectedPackage,
      packageOption,
      roomRate: selectedRoom.pricing.basePrice,
      packageRate: packageOption.priceAdjustment,
      totalRoomCost,
      totalPackageCost,
      totalCost
    })

    setSelectedDates({ checkIn: null, checkOut: null })
    setHoverDate(null)
    setFeedback({
      type: 'success',
      message: `Room ${selectedRoom.roomNumber} added for ${formatDisplayDate(checkInDate)} to ${formatDisplayDate(clickedDate)}.`
    })

    if (onRoomDrop) {
      onRoomDrop(selectedRoom.id, checkInDate)
    }
  }

  const helperMessage = useMemo(() => {
    if (feedback) {
      return feedback
    }

    if (!selectedRoom) {
      return {
        type: 'info' as FeedbackType,
        message: 'Select a room to begin planning your stay.'
      }
    }

    if (!selectedDates.checkIn) {
      return {
        type: 'info' as FeedbackType,
        message: `Choose your check-in date for Room ${selectedRoom.roomNumber}.`
      }
    }

    return {
      type: 'info' as FeedbackType,
      message: 'Now pick your check-out date to complete your stay.'
    }
  }, [feedback, selectedRoom, selectedDates.checkIn])

  const monthName = currentMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  })

  const messageStyles: Record<FeedbackType, string> = {
    info: 'border-white/20 bg-white/5 text-lundies-stone',
    success: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
    error: 'border-rose-400/60 bg-rose-500/10 text-rose-100'
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-lundies-charcoal/80 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6 flex-col gap-4 lg:flex-row">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Room &amp; Date Selection
          </h2>
          <p className="text-lundies-stone">
            Choose a room and then click your desired check-in and check-out dates.
          </p>
        </div>

        <div className="text-right w-full lg:w-auto">
          <label className="block text-sm text-lundies-stone mb-2">Package Type</label>
          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value as PackageType)}
            className="w-full lg:w-auto rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          >
            {Object.entries(PACKAGE_OPTIONS).map(([key, option]) => (
              <option key={key} value={key}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${messageStyles[helperMessage.type]}`}>
        <div className="flex items-start justify-between gap-4">
          <span>{helperMessage.message}</span>
          {selectedDates.checkIn && (
            <button
              type="button"
              onClick={resetDateSelection}
              className="text-xs uppercase tracking-[0.2em] text-lundies-heather hover:text-lundies-heather/80"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-medium text-white mb-4">Available Rooms</h3>
          <div className="space-y-3 min-h-[200px] p-4 rounded-2xl border-2 border-dashed border-white/20">
            {availableRooms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lundies-stone">No rooms available for selected criteria</p>
              </div>
            ) : (
              availableRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={selectedRoomId === room.id}
                  onSelect={() => handleRoomSelect(room.id)}
                />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">{monthName}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={`header-${day}`} className="text-center text-xs font-medium text-lundies-stone py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const { isStart, isEnd, isInRange } = getDaySelectionState(day)
              const isDisabled = day.isBlocked || !day.isCurrentMonth
              const classes = [
                'relative aspect-square p-1 text-xs transition-all rounded-lg border-2',
                day.isPeak ? 'ring-1 ring-orange-400/30' : '',
                isDisabled
                  ? 'border-transparent bg-lundies-charcoal/50 text-lundies-stone cursor-not-allowed'
                  : 'border-white/10 bg-white/5 text-white hover:bg-white/10 cursor-pointer'
              ]

              if (isStart || isEnd) {
                classes.push('border-lundies-heather bg-lundies-heather/30 text-white')
              } else if (isInRange) {
                classes.push('border-lundies-heather/40 bg-lundies-heather/10 text-white')
              }

              return (
                <div
                  key={day.dateString}
                  className={classes.filter(Boolean).join(' ')}
                  onClick={() => handleDayClick(day)}
                  onMouseEnter={() => {
                    if (!isDisabled) {
                      setHoverDate(day.dateString)
                    }
                  }}
                  onMouseLeave={() => setHoverDate(null)}
                  role="button"
                  tabIndex={isDisabled ? -1 : 0}
                  onKeyDown={(event) => {
                    if (!isDisabled && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault()
                      handleDayClick(day)
                    }
                  }}
                >
                  <div className="flex flex-col h-full">
                    <div className="text-center mb-1">
                      {day.date.getDate()}
                    </div>

                    {day.isCurrentMonth && !day.isBlocked && (
                      <>
                        {day.availability !== undefined && (
                          <div className="text-center text-xs text-lundies-heather">
                            {day.availability} avail
                          </div>
                        )}
                        {day.price && (
                          <div className="text-center text-xs text-lundies-stone">
                            {formatCurrency(day.price)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-lundies-heather/20 border border-lundies-heather"></div>
              <span className="text-lundies-stone">Selected stay</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-lundies-charcoal border border-lundies-stone"></div>
              <span className="text-lundies-stone">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-400/20 border border-orange-400"></div>
              <span className="text-lundies-stone">Peak Season</span>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-lundies-heather"></div>
          <p className="text-lundies-stone mt-2">Loading availability...</p>
        </div>
      )}
    </div>
  )
}

export default DragDropCalendar
