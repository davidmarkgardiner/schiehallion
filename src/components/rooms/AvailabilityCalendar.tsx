'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { DailyAvailability, RoomType } from '@/types/hotel'
import { AvailabilityService } from '@/lib/firebase/hotel-service-mock'

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface AvailabilityCalendarProps {
  selectedDates: DateRange
  onDateRangeChange: (dates: DateRange) => void
  roomType?: RoomType
  minStay?: number
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isSelected: boolean
  isInRange: boolean
  isBlocked: boolean
  price?: number
  availability?: number
  isPeak?: boolean
}

export default function AvailabilityCalendar({ 
  selectedDates, 
  onDateRangeChange, 
  roomType,
  minStay = 1 
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availabilityData, setAvailabilityData] = useState<Record<string, DailyAvailability>>({})
  const [loading, setLoading] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  // Load availability data for current month
  useEffect(() => {
    const loadAvailabilityData = async () => {
      const startTime = Date.now()
      setLoading(true)
      setShowLoading(true)

      try {
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        // Build array of dates to fetch
        const dates: string[] = []
        const currentDate = new Date(startOfMonth)
        while (currentDate <= endOfMonth) {
          dates.push(currentDate.toISOString().split('T')[0])
          currentDate.setDate(currentDate.getDate() + 1)
        }

        // Fetch all dates in parallel for faster loading
        const results = await Promise.allSettled(
          dates.map(dateStr => AvailabilityService.getDailyAvailability(dateStr))
        )

        const data: Record<string, DailyAvailability> = {}
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            data[dates[index]] = result.value
          }
        })

        setAvailabilityData(data)
      } catch (error) {
        console.error('Failed to load availability data:', error)
      } finally {
        // Ensure loading indicator shows for at least 300ms so user sees the feedback
        const elapsed = Date.now() - startTime
        const minDelay = 300

        if (elapsed < minDelay) {
          setTimeout(() => {
            setLoading(false)
            setShowLoading(false)
          }, minDelay - elapsed)
        } else {
          setLoading(false)
          setShowLoading(false)
        }
      }
    }

    loadAvailabilityData()
  }, [currentMonth])

  // Helper functions
  const getAvailabilityCount = useCallback((availability: DailyAvailability | undefined, type?: RoomType): number => {
    if (!availability) return 0

    if (type && availability.availability[type]) {
      return availability.availability[type].availableRooms
    }

    // Return total available rooms across all types
    return Object.values(availability.availability)
      .reduce((total, typeAvail) => total + typeAvail.availableRooms, 0)
  }, [])

  const getPrice = useCallback((availability: DailyAvailability | undefined, type?: RoomType): number | undefined => {
    if (!availability) return undefined

    if (type && availability.pricing[type]) {
      return availability.pricing[type].adjustedPrice
    }

    // Return average price across all types
    const prices = Object.values(availability.pricing)
      .filter(p => p.adjustedPrice > 0)
      .map(p => p.adjustedPrice)

    if (prices.length === 0) return undefined
    return Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length)
  }, [])

  const isPeakSeason = useCallback((date: Date): boolean => {
    const month = date.getMonth()
    const day = date.getDate()

    // Summer season (June-August)
    if (month >= 5 && month <= 7) return true

    // Christmas/New Year period
    if ((month === 11 && day >= 20) || (month === 0 && day <= 5)) return true

    // Easter period (approximate)
    // This is a simplified check - in production you'd use a proper Easter calculation
    if (month === 3) return true

    return false
  }, [])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday
    const daysInMonth = lastDayOfMonth.getDate()
    
    const days: CalendarDay[] = []
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i)
      const dateStr = date.toISOString().split('T')[0]
      const availability = availabilityData[dateStr]
      
      days.push({
        date,
        isCurrentMonth: false,
        isSelected: false,
        isInRange: false,
        isBlocked: true,
        availability: getAvailabilityCount(availability, roomType),
        price: getPrice(availability, roomType),
      })
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const availability = availabilityData[dateStr]
      const isPast = date < new Date(new Date().toDateString())
      
      const isSelected = !!(selectedDates.startDate &&
        (date.toDateString() === selectedDates.startDate.toDateString() ||
         (selectedDates.endDate && date.toDateString() === selectedDates.endDate.toDateString())))

      const isInRange = !!(selectedDates.startDate && selectedDates.endDate &&
        date > selectedDates.startDate && date < selectedDates.endDate)
      
      const availabilityCount = getAvailabilityCount(availability, roomType)
      const isBlocked = isPast || availabilityCount === 0
      
      days.push({
        date,
        isCurrentMonth: true,
        isSelected,
        isInRange,
        isBlocked,
        availability: availabilityCount,
        price: getPrice(availability, roomType),
        isPeak: isPeakSeason(date),
      })
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      const dateStr = date.toISOString().split('T')[0]
      const availability = availabilityData[dateStr]
      
      days.push({
        date,
        isCurrentMonth: false,
        isSelected: false,
        isInRange: false,
        isBlocked: true,
        availability: getAvailabilityCount(availability, roomType),
        price: getPrice(availability, roomType),
      })
    }
    
    return days
  }, [currentMonth, availabilityData, selectedDates, roomType, getAvailabilityCount, getPrice, isPeakSeason])

  const handleDateClick = (date: Date, day: CalendarDay) => {
    if (day.isBlocked) return
    
    const { startDate, endDate } = selectedDates
    
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      onDateRangeChange({ startDate: date, endDate: null })
    } else if (date < startDate) {
      // Selected date is before start date, make it the new start
      onDateRangeChange({ startDate: date, endDate: null })
    } else {
      // Set end date
      const daysDiff = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (daysDiff >= minStay - 1) {
        onDateRangeChange({ startDate, endDate: date })
      }
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const formatPrice = (price: number) => {
    return `£${(price / 100).toFixed(0)}`
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="relative rounded-3xl bg-white p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-lundies-charcoal">Select Dates</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="w-10 h-10 rounded-full border-2 border-lundies-stone bg-lundies-stone/20 text-lundies-charcoal hover:bg-lundies-heather/30 transition-colors flex items-center justify-center font-bold"
          >
            ←
          </button>
          <div className="text-lg font-semibold text-lundies-charcoal min-w-[160px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="w-10 h-10 rounded-full border-2 border-lundies-stone bg-lundies-stone/20 text-lundies-charcoal hover:bg-lundies-heather/30 transition-colors flex items-center justify-center font-bold"
          >
            →
          </button>
        </div>
      </div>

      {/* Selected Date Range Display */}
      {selectedDates.startDate && (
        <div className="mb-4 p-4 rounded-2xl bg-lundies-heather/20 border border-lundies-heather/30">
          <div className="text-sm text-lundies-charcoal">
            <div className="font-medium">Selected Dates:</div>
            <div className="mt-1">
              Check-in: {selectedDates.startDate.toLocaleDateString()}
              {selectedDates.endDate && (
                <> • Check-out: {selectedDates.endDate.toLocaleDateString()}</>
              )}
              {!selectedDates.endDate && (
                <> • Select check-out date</>
              )}
            </div>
            {selectedDates.startDate && selectedDates.endDate && (
              <div className="mt-1 text-xs text-lundies-peat">
                {Math.ceil((selectedDates.endDate.getTime() - selectedDates.startDate.getTime()) / (1000 * 60 * 60 * 24))} night(s)
                {minStay > 1 && ` (Min stay: ${minStay} nights)`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={`header-${day}`} className="text-center text-sm font-semibold text-lundies-moss py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayClasses = [
            'relative h-20 rounded-xl border-2 transition-all cursor-pointer text-center p-2',
            day.isCurrentMonth ? 'border-lundies-stone/40 bg-lundies-linen/30' : 'border-lundies-stone/20 bg-lundies-stone/10',
            day.isBlocked ? 'cursor-not-allowed opacity-40' : 'hover:bg-lundies-heather/20 hover:border-lundies-heather',
            day.isSelected ? 'bg-lundies-heather/40 border-lundies-heather shadow-md' : '',
            day.isInRange ? 'bg-lundies-heather/20 border-lundies-heather/50' : '',
            !day.isCurrentMonth ? 'text-lundies-peat' : 'text-lundies-charcoal font-medium',
          ].filter(Boolean).join(' ')

          return (
            <div
              key={`${day.date.toISOString()}-${index}`}
              className={dayClasses}
              onClick={() => handleDateClick(day.date, day)}
            >
              <div className="text-base font-bold">
                {day.date.getDate()}
              </div>

              {day.isCurrentMonth && day.availability !== undefined && (
                <div className="text-xs mt-1">
                  {day.availability > 0 ? (
                    <div className={`text-green-700 ${day.isPeak ? 'font-bold' : ''}`}>
                      {day.availability} left
                    </div>
                  ) : (
                    <div className="text-red-600 font-semibold">Full</div>
                  )}
                </div>
              )}

              {day.isCurrentMonth && day.price && (
                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold ${
                  day.isPeak ? 'text-orange-600' : 'text-lundies-moss'
                }`}>
                  {formatPrice(day.price)}
                </div>
              )}

              {day.isPeak && day.isCurrentMonth && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-yellow-500 rounded-full shadow-sm"></div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t-2 border-lundies-stone/30 flex flex-wrap items-center justify-center gap-6 text-sm text-lundies-charcoal">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-lundies-heather/40 border-2 border-lundies-heather"></div>
          <span className="font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-lundies-heather/20 border-2 border-lundies-heather/50"></div>
          <span className="font-medium">In Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="font-medium">Peak Season</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-300 border-2 border-gray-400"></div>
          <span className="font-medium">Unavailable</span>
        </div>
      </div>

      {showLoading && (
        <div className="absolute inset-0 bg-lundies-charcoal/80 backdrop-blur-md rounded-3xl flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3 bg-white px-8 py-6 rounded-2xl shadow-2xl border-2 border-lundies-heather">
            <div className="w-10 h-10 border-4 border-lundies-stone/30 border-t-lundies-heather rounded-full animate-spin"></div>
            <div className="text-lundies-charcoal font-semibold text-lg">Loading availability...</div>
          </div>
        </div>
      )}
    </div>
  )
}