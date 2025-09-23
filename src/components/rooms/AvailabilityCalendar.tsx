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

  // Load availability data for current month
  useEffect(() => {
    const loadAvailabilityData = async () => {
      setLoading(true)
      try {
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        const data: Record<string, DailyAvailability> = {}
        
        // Load availability for each day of the month
        const currentDate = new Date(startOfMonth)
        while (currentDate <= endOfMonth) {
          const dateStr = currentDate.toISOString().split('T')[0]
          try {
            const dayAvailability = await AvailabilityService.getDailyAvailability(dateStr)
            if (dayAvailability) {
              data[dateStr] = dayAvailability
            }
          } catch (error) {
            console.warn(`Failed to load availability for ${dateStr}:`, error)
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
        
        setAvailabilityData(data)
      } catch (error) {
        console.error('Failed to load availability data:', error)
      } finally {
        setLoading(false)
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Select Dates</h3>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="w-8 h-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            ←
          </button>
          <div className="text-lg font-medium text-white min-w-[140px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="w-8 h-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            →
          </button>
        </div>
      </div>

      {/* Selected Date Range Display */}
      {selectedDates.startDate && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-400/10 border border-emerald-400/20">
          <div className="text-sm text-emerald-100">
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
              <div className="mt-1 text-xs text-emerald-200">
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
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayClasses = [
            'relative h-16 rounded-lg border transition-all cursor-pointer text-center p-1',
            day.isCurrentMonth ? 'border-white/10' : 'border-white/5',
            day.isBlocked ? 'cursor-not-allowed opacity-50' : 'hover:bg-white/10',
            day.isSelected ? 'bg-emerald-400/20 border-emerald-400/40' : '',
            day.isInRange ? 'bg-emerald-400/10' : '',
            !day.isCurrentMonth ? 'text-slate-500' : 'text-white',
          ].filter(Boolean).join(' ')

          return (
            <div
              key={index}
              className={dayClasses}
              onClick={() => handleDateClick(day.date, day)}
            >
              <div className="text-sm font-medium">
                {day.date.getDate()}
              </div>
              
              {day.isCurrentMonth && day.availability !== undefined && (
                <div className="text-xs mt-1">
                  {day.availability > 0 ? (
                    <div className={`text-emerald-300 ${day.isPeak ? 'font-bold' : ''}`}>
                      {day.availability} left
                    </div>
                  ) : (
                    <div className="text-red-300">Full</div>
                  )}
                </div>
              )}
              
              {day.isCurrentMonth && day.price && (
                <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-xs ${
                  day.isPeak ? 'text-yellow-300 font-bold' : 'text-slate-300'
                }`}>
                  {formatPrice(day.price)}
                </div>
              )}

              {day.isPeak && day.isCurrentMonth && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400/40"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-400/10"></div>
          <span>In Range</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span>Peak Season</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-600"></div>
          <span>Unavailable</span>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <div className="text-white">Loading availability...</div>
        </div>
      )}
    </div>
  )
}