import { useMemo, useState } from 'react'
import type { DragEvent } from 'react'

import type { AssignmentFeedback, OperationalRoom, OperationsArrival } from '@/types/operations'

interface RoomAssignmentBoardProps {
  guests: OperationsArrival[]
  rooms: OperationalRoom[]
  onAssign: (guestId: string, roomId: string) => void
  onRelease: (guestId: string) => void
  getRoomLabel: (roomId: string) => string | undefined
  feedback?: AssignmentFeedback | null
}

const badgeStyles: Record<OperationalRoom['housekeepingStatus'], string> = {
  clean: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  'in-progress': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  dirty: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
  inspection: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200',
}

export function RoomAssignmentBoard({ guests, rooms, onAssign, onRelease, getRoomLabel, feedback }: RoomAssignmentBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const guestById = useMemo(() => {
    const map = new Map<string, OperationsArrival>()
    guests.forEach((guest) => map.set(guest.id, guest))
    return map
  }, [guests])

  const roomAssignments = useMemo(() => {
    const assignment = new Map<string, OperationsArrival>()
    guests.forEach((guest) => {
      if (guest.assignedRoomId) {
        assignment.set(guest.assignedRoomId, guest)
      }
    })
    return assignment
  }, [guests])

  const unassignedGuests = useMemo(
    () => guests.filter((guest) => !guest.assignedRoomId && guest.status !== 'checked-in'),
    [guests],
  )

  const assignedGuests = useMemo(
    () => guests.filter((guest) => guest.assignedRoomId),
    [guests],
  )

  const handleDrop = (event: DragEvent<HTMLDivElement>, roomId: string) => {
    event.preventDefault()
    const guestId = event.dataTransfer.getData('text/plain')
    if (!guestId) {
      return
    }
    onAssign(guestId, roomId)
    setDraggingId(null)
  }

  const handleDragStart = (event: DragEvent<HTMLDivElement>, guestId: string) => {
    event.dataTransfer.setData('text/plain', guestId)
    event.dataTransfer.effectAllowed = 'move'
    setDraggingId(guestId)
  }

  const handleDragEnd = () => {
    setDraggingId(null)
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Drag-and-drop room assignment</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Match arrivals to ready rooms. Conflicts and upgrade opportunities surface automatically.
            </p>
          </div>
          <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Needs attention
            </span>
          </div>
        </div>
        {feedback && (
          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold ${
              feedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr,1.5fr]">
        <div className="space-y-5">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Guests awaiting assignment
            </h4>
            <div className="mt-3 space-y-3">
              {unassignedGuests.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  All expected arrivals are currently matched to rooms.
                </div>
              )}
              {unassignedGuests.map((guest) => (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={(event) => handleDragStart(event, guest.id)}
                  onDragEnd={handleDragEnd}
                  className={`cursor-grab rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 ${
                    draggingId === guest.id ? 'ring-2 ring-indigo-400' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{guest.guestName}</p>
                    {guest.vip && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                        VIP
                      </span>
                    )}
                    <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-semibold text-white dark:bg-slate-200 dark:text-slate-900">
                      {guest.roomType}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {guest.partySize} guests • {guest.stayLength} nights • ETA {guest.checkInTime}
                  </p>
                  {guest.specialRequests && (
                    <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {guest.specialRequests.map((request) => (
                        <span key={request} className="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                          {request}
                        </span>
                      ))}
                    </div>
                  )}
                  {guest.upgradeEligible && guest.upgradeOptions && (
                    <p className="mt-2 text-xs font-medium text-sky-600 dark:text-sky-300">
                      Upgrade suggestion: {guest.upgradeOptions.join(' or ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Assigned arrivals
            </h4>
            <div className="mt-3 space-y-3">
              {assignedGuests.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No arrivals have been matched yet.
                </div>
              )}
              {assignedGuests.map((guest) => (
                <div key={guest.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm shadow-sm dark:border-emerald-800/60 dark:bg-emerald-900/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">{guest.guestName}</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Assigned to room {getRoomLabel(guest.assignedRoomId ?? '') ?? guest.assignedRoomId}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRelease(guest.id)}
                      className="inline-flex items-center rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                    >
                      Release room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => {
            const assignedGuest = roomAssignments.get(room.id)
            const isDroppable = room.status === 'vacant-clean' && room.housekeepingStatus === 'clean'
            const capacityWarning = assignedGuest ? false : draggingId !== null && guestById.get(draggingId)?.partySize > room.capacity

            return (
              <div
                key={room.id}
                onDragOver={(event) => {
                  if (isDroppable) {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                  }
                }}
                onDrop={(event) => handleDrop(event, room.id)}
                className={`relative min-h-[160px] rounded-2xl border p-4 shadow-sm transition ${
                  isDroppable
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                } ${draggingId && isDroppable ? 'ring-2 ring-indigo-400' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Room {room.roomNumber}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {room.type} • Sleeps {room.capacity}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[room.housekeepingStatus]}`}>
                    {room.housekeepingStatus.replace('-', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{room.readinessNote}</p>
                {assignedGuest ? (
                  <div className="mt-3 rounded-2xl border border-emerald-200 bg-white p-3 text-xs shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{assignedGuest.guestName}</p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {assignedGuest.partySize} guests • {assignedGuest.stayLength} nights
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 dark:border-slate-600 dark:text-slate-400">
                    {isDroppable ? 'Drag a guest here to assign the room.' : 'Room not ready for assignment.'}
                  </div>
                )}
                {!isDroppable && !assignedGuest && (
                  <p className="mt-3 text-[11px] font-semibold text-amber-600 dark:text-amber-300">
                    {room.housekeepingStatus !== 'clean'
                      ? 'Awaiting housekeeping clearance.'
                      : 'Room is blocked until maintenance completes.'}
                  </p>
                )}
                {capacityWarning && (
                  <p className="mt-2 text-[11px] font-semibold text-rose-600 dark:text-rose-300">
                    Capacity alert: guest party exceeds room maximum.
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
