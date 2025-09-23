// Epic 5: Drag-and-Drop Calendar Component
// SCHH-013: Drag-and-Drop Room Selection

'use client'

import { useState, useEffect, useMemo } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { DailyAvailability, Room, RoomType, PackageType } from '@/types/hotel'
import { AvailabilityService } from '@/lib/firebase/hotel-service'
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

interface DraggableRoomCardProps {
  room: Room
  index: number
  guests: number
}

const DraggableRoomCard: React.FC<DraggableRoomCardProps> = ({ room, index, guests }) => {
  const formatPrice = (priceInPence: number): string => {
    return `£${(priceInPence / 100).toFixed(2)}`
  }

  return (
    <Draggable draggableId={room.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            rounded-2xl border p-4 transition-all cursor-grab active:cursor-grabbing
            ${snapshot.isDragging
              ? 'border-emerald-400 bg-emerald-400/20 shadow-2xl shadow-emerald-400/30 scale-105'
              : 'border-white/10 bg-white/5 hover:bg-white/10'
            }
            ${snapshot.isDragging ? 'rotate-3' : ''}
          `}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-white font-medium capitalize text-sm">
                {room.type} Room
              </h3>
              <p className="text-emerald-300 text-xs">Room {room.roomNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-sm">
                {formatPrice(room.pricing.basePrice)}
              </p>
              <p className="text-slate-400 text-xs">per night</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
            <div>Max: {room.maxOccupancy}</div>
            <div>{room.size}m²</div>
            <div className="capitalize">{room.view} view</div>
            <div>Floor {room.floor}</div>
          </div>

          {/* Room features */}
          <div className="flex flex-wrap gap-1">
            {room.features.wifi && (
              <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs">
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

          {/* Drag hint */}
          {!snapshot.isDragging && (
            <div className="mt-2 text-center text-xs text-slate-500">
              Drag to calendar
            </div>
          )}
        </div>
      )}
    </Draggable>
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
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)

  const { addRoomFromDrop } = useCartStore()

  // Helper functions (defined before useMemo to avoid hoisting issues)
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

  // Load availability data for current month
  useEffect(() => {
    const loadAvailabilityData = async () => {
      setLoading(true)
      try {
        const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        const data: Record<string, DailyAvailability> = {}

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

  // Generate calendar days
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

      days.push({
        date: new Date(currentDate),
        dateString,
        isCurrentMonth: currentDate.getMonth() === month,
        isBlocked: currentDate < today,
        availability: getAvailabilityCount(availability, selectedRoomType),
        price: getPrice(availability, selectedRoomType),
        isPeak: isPeakSeason(currentDate)
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }, [currentMonth, availabilityData, selectedRoomType])

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result
    setDragOverDate(null)

    if (!destination) {
      return
    }

    const roomId = draggableId
    const targetDate = destination.droppableId.replace('date-', '')
    const room = availableRooms.find(r => r.id === roomId)

    if (!room) {
      console.error('Room not found:', roomId)
      return
    }

    // Check if the date is valid for booking
    const targetDateObj = new Date(targetDate)
    const today = new Date()

    if (targetDateObj < today) {
      alert('Cannot book rooms for past dates')
      return
    }

    // Add room to cart via drag and drop
    addRoomFromDrop({
      room,
      targetDate,
      packageType: selectedPackage,
      guests
    })

    // Call optional callback
    if (onRoomDrop) {
      onRoomDrop(roomId, targetDate)
    }
  }

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

  const formatPrice = (priceInPence: number): string => {
    return `£${(priceInPence / 100).toFixed(0)}`
  }

  const monthName = currentMonth.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Drag & Drop Booking
            </h2>
            <p className="text-slate-400">
              Drag rooms to your preferred dates
            </p>
          </div>

          {/* Package Selection */}
          <div className="text-right">
            <label className="block text-sm text-slate-400 mb-2">Package Type</label>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value as PackageType)}
              className="rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {Object.entries(PACKAGE_OPTIONS).map(([key, option]) => (
                <option key={key} value={key}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Available Rooms */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium text-white mb-4">Available Rooms</h3>

            <Droppable droppableId="available-rooms">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`
                    space-y-3 min-h-[200px] p-4 rounded-2xl border-2 border-dashed transition-colors
                    ${snapshot.isDraggingOver
                      ? 'border-emerald-400 bg-emerald-400/10'
                      : 'border-white/20'
                    }
                  `}
                >
                  {availableRooms.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400">No rooms available for selected criteria</p>
                    </div>
                  ) : (
                    availableRooms.map((room, index) => (
                      <DraggableRoomCard
                        key={room.id}
                        room={room}
                        index={index}
                        guests={guests}
                      />
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">{monthName}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  ‹
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  ›
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isDropTarget = `date-${day.dateString}` === dragOverDate

                return (
                  <Droppable key={day.dateString} droppableId={`date-${day.dateString}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          relative aspect-square p-1 text-xs transition-all cursor-pointer
                          rounded-lg border-2 border-dashed
                          ${day.isBlocked
                            ? 'border-transparent bg-slate-800/50 text-slate-600'
                            : snapshot.isDraggingOver
                              ? 'border-emerald-400 bg-emerald-400/20 scale-105'
                              : day.isCurrentMonth
                                ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
                                : 'border-transparent bg-slate-800/30 text-slate-500'
                          }
                          ${day.isPeak ? 'ring-1 ring-orange-400/30' : ''}
                        `}
                        onDragEnter={() => setDragOverDate(`date-${day.dateString}`)}
                        onDragLeave={() => setDragOverDate(null)}
                      >
                        <div className="flex flex-col h-full">
                          <div className="text-center mb-1">
                            {day.date.getDate()}
                          </div>

                          {day.isCurrentMonth && !day.isBlocked && (
                            <>
                              {day.availability !== undefined && (
                                <div className="text-center text-xs text-emerald-300">
                                  {day.availability} avail
                                </div>
                              )}
                              {day.price && (
                                <div className="text-center text-xs text-slate-400">
                                  {formatPrice(day.price)}
                                </div>
                              )}
                            </>
                          )}

                          {snapshot.isDraggingOver && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
                                <span className="text-slate-900 text-xs font-bold">+</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-400/20 border border-emerald-400"></div>
                <span className="text-slate-400">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-800 border border-slate-600"></div>
                <span className="text-slate-400">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-400/20 border border-orange-400"></div>
                <span className="text-slate-400">Peak Season</span>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
            <p className="text-slate-400 mt-2">Loading availability...</p>
          </div>
        )}
      </div>
    </DragDropContext>
  )
}

export default DragDropCalendar