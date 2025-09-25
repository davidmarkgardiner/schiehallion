'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAuditLogs, getStaffUsers } from '@/lib/db'
import type { AuditLog, UserProfile } from '@/types/auth'
import type {
  ArrivalRecord,
  DepartureRecord,
  FrontDeskRoomStatus,
  HousekeepingStage,
  HousekeepingState,
  HousekeepingTask,
  MobileSyncState,
  OperationsTimelineItem,
  RoomOperationsStatus,
  TaskPriority,
  TimelineStatus,
} from '@/types/operations'
import {
  dailyOperationsPulse,
  housekeepingSchedule,
  operationsRooms,
  operationsTimeline,
  todaysArrivals,
  todaysDepartures,
} from '@/data/operations'
import type { RoomType } from '@/types/hotel'

const roomTypePriority: RoomType[] = ['standard', 'accessible', 'deluxe', 'family', 'suite']

const roomStatusStyles: Record<FrontDeskRoomStatus, string> = {
  'vacant-clean': 'border border-emerald-400/60 bg-emerald-50/60 dark:border-emerald-600/40 dark:bg-emerald-900/20',
  'vacant-dirty': 'border border-amber-400/60 bg-amber-50/60 dark:border-amber-600/40 dark:bg-amber-900/20',
  'pre-arrival': 'border border-indigo-400/60 bg-indigo-50/60 dark:border-indigo-600/40 dark:bg-indigo-900/20',
  'in-house': 'border border-sky-400/60 bg-sky-50/60 dark:border-sky-600/40 dark:bg-sky-900/20',
  'due-out': 'border border-rose-400/60 bg-rose-50/60 dark:border-rose-600/40 dark:bg-rose-900/20',
  'out-of-service': 'border border-slate-400/60 bg-slate-100/60 dark:border-slate-500/40 dark:bg-slate-800/30',
}

const roomStatusLabels: Record<FrontDeskRoomStatus, string> = {
  'vacant-clean': 'Vacant · Clean',
  'vacant-dirty': 'Vacant · Dirty',
  'pre-arrival': 'Pre-arrival',
  'in-house': 'In House',
  'due-out': 'Due Out',
  'out-of-service': 'Out of Service',
}

const housekeepingStateStyles: Record<HousekeepingState, string> = {
  clean: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200',
  dirty: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200',
  'in-progress': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200',
  inspection: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200',
  'out-of-service': 'bg-slate-200 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200',
}

const priorityStyles: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-200',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-200',
}

const mobileSyncStyles: Record<MobileSyncState, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200',
  sent: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200',
  online: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200',
}

const timelineStatusStyles: Record<TimelineStatus, string> = {
  done: 'text-emerald-600 dark:text-emerald-300',
  'in-progress': 'text-indigo-600 dark:text-indigo-300',
  upcoming: 'text-slate-500 dark:text-slate-400',
}

const timelineDotStyles: Record<TimelineStatus, string> = {
  done: 'bg-emerald-500',
  'in-progress': 'bg-indigo-500 animate-pulse',
  upcoming: 'bg-slate-400',
}

const housekeepingColumns: { status: HousekeepingStage; title: string; description: string }[] = [
  { status: 'scheduled', title: 'Scheduled', description: 'Queued and awaiting room release' },
  { status: 'in-progress', title: 'In Progress', description: 'Currently being serviced' },
  { status: 'inspection', title: 'Inspection', description: 'Supervisor checks and sign-off' },
  { status: 'completed', title: 'Completed', description: 'Ready for next arrival' },
]

const roomFilterOptions: { value: 'all' | FrontDeskRoomStatus; label: string }[] = [
  { value: 'all', label: 'All rooms' },
  { value: 'vacant-clean', label: 'Vacant clean' },
  { value: 'pre-arrival', label: 'Pre-arrival' },
  { value: 'vacant-dirty', label: 'Vacant dirty' },
  { value: 'due-out', label: 'Due out' },
  { value: 'in-house', label: 'In house' },
  { value: 'out-of-service', label: 'Out of service' },
]

const priorityOrder: TaskPriority[] = ['high', 'medium', 'low']

const toTitleCase = (value: string): string =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(value / 100)

const formatDuration = (minutes: number): string => {
  const absolute = Math.abs(Math.round(minutes))
  const hours = Math.floor(absolute / 60)
  const mins = absolute % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

const formatRelativeMinutes = (difference: number): string => {
  if (difference === 0) {
    return 'Just now'
  }
  return difference > 0 ? `${formatDuration(difference)} ago` : `In ${formatDuration(Math.abs(difference))}`
}

const formatAuditTimestamp = (value: unknown): string => {
  if (!value) {
    return '—'
  }

  if (value instanceof Date) {
    return value.toLocaleString()
  }

  if (typeof value === 'string') {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
  }

  if (typeof value === 'object' && value && 'toDate' in (value as Record<string, unknown>)) {
    try {
      const date = (value as { toDate: () => Date }).toDate()
      return date.toLocaleString()
    } catch (error) {
      console.warn('Unable to parse audit log timestamp', error)
    }
  }

  return '—'
}

const getNowMinutes = (): number => {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

const sortTasksForColumn = (tasks: HousekeepingTask[]): HousekeepingTask[] =>
  [...tasks].sort((a, b) => {
    const priorityComparison = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    if (priorityComparison !== 0) {
      return priorityComparison
    }
    const targetA = a.targetMinutes ?? Number.MAX_SAFE_INTEGER
    const targetB = b.targetMinutes ?? Number.MAX_SAFE_INTEGER
    return targetA - targetB
  })

const timelineSorter = (items: OperationsTimelineItem[]): OperationsTimelineItem[] =>
  [...items].sort((a, b) => a.time.localeCompare(b.time))

export default function AdminDashboard() {
  const { user, userProfile, logout } = useAuth()
  const router = useRouter()

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [staffUsers, setStaffUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  const [arrivals, setArrivals] = useState<ArrivalRecord[]>(todaysArrivals)
  const [departures, setDepartures] = useState<DepartureRecord[]>(todaysDepartures)
  const [rooms, setRooms] = useState<RoomOperationsStatus[]>(operationsRooms)
  const [tasks, setTasks] = useState<HousekeepingTask[]>(housekeepingSchedule)
  const [assignmentAlert, setAssignmentAlert] = useState<string | null>(null)
  const [draggedArrivalId, setDraggedArrivalId] = useState<string | null>(null)
  const [dropPreview, setDropPreview] = useState<{ roomNumber: string; invalid: boolean } | null>(null)
  const [roomFilter, setRoomFilter] = useState<'all' | FrontDeskRoomStatus>('all')
  const [clockTick, setClockTick] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setClockTick(Date.now()), 60000)
    return () => clearInterval(timer)
  }, [])

  const nowMinutes = useMemo(() => {
    const now = new Date(clockTick)
    return now.getHours() * 60 + now.getMinutes()
  }, [clockTick])

  useEffect(() => {
    if (user === null) {
      router.push('/admin/login')
      return
    }

    if (userProfile && !['staff', 'manager', 'admin'].includes(userProfile.role)) {
      router.push('/')
    }
  }, [router, user, userProfile])

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      if (userProfile?.role === 'admin') {
        const logs = await getAuditLogs(undefined, 20)
        setAuditLogs(logs)
      }

      if (userProfile?.role === 'manager' || userProfile?.role === 'admin') {
        const staff = await getStaffUsers()
        setStaffUsers(staff)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [userProfile])

  useEffect(() => {
    if (!user || !userProfile) {
      return
    }

    loadDashboardData()
  }, [user, userProfile, loadDashboardData])

  useEffect(() => {
    if (!assignmentAlert) {
      return
    }

    const timeout = setTimeout(() => setAssignmentAlert(null), 6000)
    return () => clearTimeout(timeout)
  }, [assignmentAlert])

  const sortedArrivals = useMemo(
    () => [...arrivals].sort((a, b) => a.checkInTime.localeCompare(b.checkInTime)),
    [arrivals],
  )
  const sortedDepartures = useMemo(
    () => [...departures].sort((a, b) => a.departureTime.localeCompare(b.departureTime)),
    [departures],
  )

  const assignmentCandidates = useMemo(
    () => sortedArrivals.filter((arrival) => arrival.status !== 'checked-in'),
    [sortedArrivals],
  )

  const unassignedArrivals = useMemo(
    () => assignmentCandidates.filter((arrival) => !arrival.assignedRoom),
    [assignmentCandidates],
  )

  const preAssignedArrivals = useMemo(
    () => assignmentCandidates.filter((arrival) => arrival.assignedRoom),
    [assignmentCandidates],
  )

  const operationsSummary = useMemo(() => {
    const totalRooms = rooms.length
    const inHouse = rooms.filter((room) => room.status === 'in-house').length
    const roomsAvailable = rooms.filter((room) => room.status === 'vacant-clean').length
    const preArrival = rooms.filter((room) => room.status === 'pre-arrival').length
    const dueOut = rooms.filter((room) => room.status === 'due-out').length
    const outOfService = rooms.filter((room) => room.status === 'out-of-service').length

    const occupancy = totalRooms > 0 ? Math.round((inHouse / totalRooms) * 100) : 0
    const pendingArrivals = arrivals.filter((arrival) => arrival.status !== 'checked-in').length
    const checkedInArrivals = arrivals.filter((arrival) => arrival.status === 'checked-in').length
    const vipArrivals = arrivals.filter((arrival) => arrival.vip).length
    const loyaltyArrivals = arrivals.filter((arrival) => arrival.loyaltyTier).length
    const specialRequests = arrivals.reduce((total, arrival) => total + arrival.specialRequests.length, 0)
    const departuresPending = departures.filter((departure) => !departure.processed).length
    const departuresComplete = departures.filter((departure) => departure.processed).length
    const housekeepingActive = tasks.filter((task) => task.status !== 'completed').length
    const rushTasks = tasks.filter((task) => task.isRush && task.status !== 'completed').length

    return {
      totalRooms,
      inHouse,
      roomsAvailable,
      preArrival,
      dueOut,
      outOfService,
      occupancy,
      pendingArrivals,
      checkedInArrivals,
      vipArrivals,
      loyaltyArrivals,
      specialRequests,
      departuresPending,
      departuresComplete,
      housekeepingActive,
      rushTasks,
    }
  }, [rooms, arrivals, departures, tasks])

  const filteredRooms = useMemo(() => {
    const list = rooms.filter((room) => (roomFilter === 'all' ? true : room.status === roomFilter))
    return [...list].sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true, sensitivity: 'base' }))
  }, [rooms, roomFilter])

  const getUpgradeSuggestionForArrival = useCallback(
    (arrival: ArrivalRecord): string | null => {
      if (!arrival.upgradeEligible) {
        return null
      }

      const arrivalRank = roomTypePriority.indexOf(arrival.roomType)
      const eligibleRooms = rooms.filter(
        (room) =>
          !room.assignedGuest &&
          ['vacant-clean', 'vacant-dirty'].includes(room.status) &&
          roomTypePriority.indexOf(room.type) > arrivalRank,
      )

      if (eligibleRooms.length === 0) {
        return null
      }

      const preferred = arrival.upgradePreference
        ? eligibleRooms.find((room) => room.type === arrival.upgradePreference)
        : undefined

      const candidate =
        preferred ??
        [...eligibleRooms].sort(
          (a, b) => roomTypePriority.indexOf(a.type) - roomTypePriority.indexOf(b.type),
        )[0]

      if (!candidate) {
        return null
      }

      return `${toTitleCase(candidate.type)} ${candidate.roomNumber} available`
    },
    [rooms],
  )

  const evaluateAssignment = useCallback(
    (arrival: ArrivalRecord, room: RoomOperationsStatus) => {
      const conflicts: string[] = []
      const warnings: string[] = []

      if (room.status === 'in-house') {
        conflicts.push('Room is currently occupied')
      }
      if (room.status === 'due-out') {
        conflicts.push('Guest has not departed yet')
      }
      if (room.status === 'out-of-service' || room.housekeepingStatus === 'out-of-service') {
        conflicts.push('Room is marked out of service')
      }
      if (room.assignedGuest && room.assignedGuest !== arrival.guestName) {
        conflicts.push(`Room already assigned to ${room.assignedGuest}`)
      }
      if (arrival.requiresAccessible && !room.isAccessible) {
        conflicts.push('Accessible room required for guest')
      }
      if (room.capacity < arrival.guests) {
        conflicts.push(`Room sleeps ${room.capacity}, reservation requires ${arrival.guests}`)
      }
      if (room.housekeepingStatus === 'dirty') {
        warnings.push('Room flagged dirty — housekeeping notified to rush clean.')
      }
      if (room.blockers && room.blockers.length > 0) {
        warnings.push(`Current blockers: ${room.blockers.join(', ')}`)
      }

      return { conflicts, warnings }
    },
    [],
  )

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, arrivalId: string) => {
    event.dataTransfer.setData('text/plain', arrivalId)
    event.dataTransfer.effectAllowed = 'move'
    setDraggedArrivalId(arrivalId)
  }

  const handleDragEnd = () => {
    setDraggedArrivalId(null)
    setDropPreview(null)
  }

  const handleRoomDragEnter = (roomNumber: string) => {
    if (!draggedArrivalId) {
      setDropPreview({ roomNumber, invalid: false })
      return
    }

    const arrival = arrivals.find((item) => item.id === draggedArrivalId)
    const room = rooms.find((item) => item.roomNumber === roomNumber)

    if (!arrival || !room) {
      setDropPreview(null)
      return
    }

    const { conflicts } = evaluateAssignment(arrival, room)
    setDropPreview({ roomNumber, invalid: conflicts.length > 0 })
  }

  const handleRoomDragLeave = (roomNumber: string) => {
    setDropPreview((current) => {
      if (current?.roomNumber === roomNumber) {
        return null
      }
      return current
    })
  }

  const handleRoomDrop = (event: React.DragEvent<HTMLDivElement>, roomNumber: string) => {
    event.preventDefault()

    const arrivalId = draggedArrivalId || event.dataTransfer.getData('text/plain')
    if (!arrivalId) {
      return
    }

    const arrival = arrivals.find((item) => item.id === arrivalId)
    const room = rooms.find((item) => item.roomNumber === roomNumber)

    if (!arrival || !room) {
      return
    }

    const { conflicts, warnings } = evaluateAssignment(arrival, room)

    if (conflicts.length > 0) {
      setAssignmentAlert(`Cannot assign ${arrival.guestName} to room ${roomNumber}: ${conflicts.join('; ')}`)
      setDropPreview(null)
      setDraggedArrivalId(null)
      return
    }

    setRooms((previous) =>
      previous.map((item) => {
        if (item.roomNumber === roomNumber) {
          const nextStatus: FrontDeskRoomStatus =
            item.status === 'vacant-clean' || item.status === 'vacant-dirty'
              ? 'pre-arrival'
              : item.status
          const nextHousekeeping: HousekeepingState =
            item.housekeepingStatus === 'clean' ? 'inspection' : item.housekeepingStatus

          return {
            ...item,
            status: nextStatus,
            housekeepingStatus: nextHousekeeping,
            assignedGuest: arrival.guestName,
            blockers: item.blockers?.filter((blocker) => blocker !== 'Awaiting housekeeping release'),
          }
        }

        if (arrival.assignedRoom && item.roomNumber === arrival.assignedRoom && item.roomNumber !== roomNumber) {
          const fallback: FrontDeskRoomStatus =
            item.housekeepingStatus === 'dirty' ? 'vacant-dirty' : 'vacant-clean'

          return {
            ...item,
            assignedGuest: undefined,
            status: item.status === 'pre-arrival' ? fallback : item.status,
          }
        }

        return item
      }),
    )

    setArrivals((previous) =>
      previous.map((item) =>
        item.id === arrivalId
          ? {
              ...item,
              assignedRoom: roomNumber,
            }
          : item,
      ),
    )

    if (room.housekeepingStatus === 'dirty' || room.status === 'vacant-dirty') {
      const now = getNowMinutes()
      setTasks((previous) =>
        previous.map((task) =>
          task.roomNumber === roomNumber
            ? {
                ...task,
                priority: 'high',
                status: task.status === 'completed' ? task.status : 'scheduled',
                isRush: true,
                lastUpdateMinutes: now,
              }
            : task,
        ),
      )
    }

    let message = `Assigned ${arrival.guestName} to room ${roomNumber}.`
    if (warnings.length > 0) {
      message += ` ${warnings.join(' ')}`
    }
    setAssignmentAlert(message)
    setDropPreview(null)
    setDraggedArrivalId(null)
  }

  const handleArrivalCheckIn = (arrivalId: string) => {
    const arrival = arrivals.find((item) => item.id === arrivalId)
    if (!arrival) {
      return
    }

    setArrivals((previous) =>
      previous.map((item) => (item.id === arrivalId ? { ...item, status: 'checked-in' } : item)),
    )

    if (arrival.assignedRoom) {
      setRooms((previous) =>
        previous.map((room) =>
          room.roomNumber === arrival.assignedRoom
            ? {
                ...room,
                status: 'in-house',
                housekeepingStatus: 'in-progress',
                assignedGuest: arrival.guestName,
              }
            : room,
        ),
      )
    }

    setAssignmentAlert(`${arrival.guestName} checked in successfully.`)
  }

  const handleArrivalUnassign = (arrivalId: string) => {
    const arrival = arrivals.find((item) => item.id === arrivalId)
    if (!arrival?.assignedRoom) {
      return
    }

    const roomNumber = arrival.assignedRoom

    setArrivals((previous) =>
      previous.map((item) =>
        item.id === arrivalId
          ? {
              ...item,
              assignedRoom: undefined,
            }
          : item,
      ),
    )

    setRooms((previous) =>
      previous.map((room) => {
        if (room.roomNumber !== roomNumber) {
          return room
        }

        const fallback: FrontDeskRoomStatus =
          room.housekeepingStatus === 'dirty' ? 'vacant-dirty' : 'vacant-clean'

        return {
          ...room,
          assignedGuest: undefined,
          status: room.status === 'pre-arrival' ? fallback : room.status,
        }
      }),
    )

    setAssignmentAlert(`Removed room assignment for ${arrival.guestName}.`)
  }

  const handleDepartureProcessed = (departureId: string) => {
    const departure = departures.find((item) => item.id === departureId)
    if (!departure) {
      return
    }

    const hasUpcomingArrival = arrivals.some(
      (arrival) => arrival.assignedRoom === departure.roomNumber && arrival.status !== 'checked-in',
    )

    setDepartures((previous) =>
      previous.map((item) =>
        item.id === departureId
          ? {
              ...item,
              status: 'checked-out',
              processed: true,
            }
          : item,
      ),
    )

    setRooms((previous) =>
      previous.map((room) => {
        if (room.roomNumber !== departure.roomNumber) {
          return room
        }

        const nextStatus: FrontDeskRoomStatus = hasUpcomingArrival ? 'pre-arrival' : 'vacant-dirty'
        const nextGuest = hasUpcomingArrival ? room.assignedGuest : undefined

        return {
          ...room,
          status: nextStatus,
          housekeepingStatus: 'dirty',
          assignedGuest: nextGuest,
        }
      }),
    )

    const now = getNowMinutes()
    setTasks((previous) =>
      previous.map((task) =>
        task.roomNumber === departure.roomNumber
          ? {
              ...task,
              priority: 'high',
              status: task.status === 'completed' ? task.status : 'scheduled',
              isRush: true,
              lastUpdateMinutes: now,
            }
          : task,
      ),
    )

    setAssignmentAlert(`Departure processed for ${departure.guestName}. Housekeeping notified.`)
  }

  const handleDepartureExtend = (departureId: string) => {
    const departure = departures.find((item) => item.id === departureId)
    if (!departure) {
      return
    }

    const newTime = departure.lateCheckout ? '13:00' : '12:00'

    setDepartures((previous) =>
      previous.map((item) =>
        item.id === departureId
          ? {
              ...item,
              lateCheckout: true,
              departureTime: newTime,
              notes: [...(item.notes ?? []), `Late checkout extended to ${newTime}`],
            }
          : item,
      ),
    )

    setRooms((previous) =>
      previous.map((room) =>
        room.roomNumber === departure.roomNumber
          ? {
              ...room,
              departureDueAt: newTime,
              status: 'due-out',
            }
          : room,
      ),
    )

    setAssignmentAlert(`Late checkout extended for ${departure.guestName} to ${newTime}.`)
  }

  const startHousekeepingTask = (taskId: string) => {
    const now = getNowMinutes()
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'in-progress',
              startMinutes: now,
              lastUpdateMinutes: now,
            }
          : task,
      ),
    )
  }

  const sendTaskToInspection = (taskId: string) => {
    const now = getNowMinutes()
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'inspection',
              lastUpdateMinutes: now,
            }
          : task,
      ),
    )
  }

  const completeHousekeepingTask = (taskId: string) => {
    const now = getNowMinutes()
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: 'completed',
              lastUpdateMinutes: now,
              mobileSync: task.mobileSync === 'pending' ? 'sent' : task.mobileSync,
            }
          : task,
      ),
    )
  }

  const pushTaskToMobile = (taskId: string) => {
    const now = getNowMinutes()
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              mobileSync: 'sent',
              lastUpdateMinutes: now,
            }
          : task,
      ),
    )
    setAssignmentAlert('Task pushed to mobile devices.')
  }

  const escalateTaskPriority = (taskId: string) => {
    const now = getNowMinutes()
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              priority: 'high',
              isRush: true,
              lastUpdateMinutes: now,
            }
          : task,
      ),
    )
  }

  const getTaskElapsed = (task: HousekeepingTask): string => {
    if (!task.startMinutes) {
      return task.status === 'scheduled' ? 'Not started' : '—'
    }
    const diff = nowMinutes - task.startMinutes
    if (diff <= 0) {
      return 'Just started'
    }
    return formatDuration(diff)
  }

  const getTaskRemaining = (task: HousekeepingTask): string | null => {
    if (!task.targetMinutes) {
      return null
    }
    const diff = task.targetMinutes - nowMinutes
    if (diff >= 0) {
      return `${formatDuration(diff)} remaining`
    }
    return `Overdue by ${formatDuration(Math.abs(diff))}`
  }

  const getTimelineItems = useMemo(() => timelineSorter(operationsTimeline), [])

  const mobileFeed = useMemo(() => {
    const activeTasks = tasks.filter((task) => task.status !== 'completed').slice(0, 5)
    return [...activeTasks].sort((a, b) => b.lastUpdateMinutes - a.lastUpdateMinutes)
  }, [tasks])

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Preparing operations dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-300">Operations · Phase 5</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Operations Command Centre</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Monitor today&apos;s arrivals, departures, and housekeeping readiness at a glance.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {operationsSummary.occupancy}% occupancy
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {operationsSummary.inHouse} rooms in-house · {operationsSummary.roomsAvailable} ready for arrival
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                {userProfile.role.toUpperCase()}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-8">
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-5 shadow dark:bg-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Arrivals</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {operationsSummary.pendingArrivals} / {dailyOperationsPulse.arrivalsDue}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {operationsSummary.checkedInArrivals} already checked in · {operationsSummary.vipArrivals} VIP arrivals today
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow dark:bg-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Departures</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {operationsSummary.departuresComplete} / {dailyOperationsPulse.departuresDue}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {operationsSummary.departuresPending} remaining · {operationsSummary.specialRequests} special requests
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow dark:bg-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Rooms Ready</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {operationsSummary.roomsAvailable}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {operationsSummary.preArrival} pre-arrival · {operationsSummary.outOfService} out of service
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow dark:bg-gray-800">
                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Housekeeping</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
                  {operationsSummary.housekeepingActive}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {operationsSummary.rushTasks} rush tasks escalated to mobile teams
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Operations timeline</h2>
              <div className="mt-4 space-y-4">
                {getTimelineItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <span
                      className={`mt-1 inline-flex h-3.5 w-3.5 flex-shrink-0 rounded-full ${timelineDotStyles[item.status]}`}
                    />
                    <div className="flex-1">
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                        <p className={`text-sm font-semibold ${timelineStatusStyles[item.status]}`}>{item.label}</p>
                        <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{item.time}</span>
                          <span>{item.owner}</span>
                        </div>
                      </div>
                      {item.status === 'in-progress' && (
                        <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-300">
                          Team on it — live updates flowing from mobile app.
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s pulse</h2>
            <dl className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center justify-between">
                <dt>Occupancy forecast</dt>
                <dd className="font-semibold text-gray-900 dark:text-white">{Math.round(dailyOperationsPulse.occupancy * 100)}%</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>VIP arrivals</dt>
                <dd className="font-semibold text-indigo-600 dark:text-indigo-300">{dailyOperationsPulse.vipArrivals}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Loyalty guests</dt>
                <dd>{dailyOperationsPulse.loyaltyArrivals}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Airport transfers today</dt>
                <dd>{dailyOperationsPulse.airportTransfers}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Upgrades suggested</dt>
                <dd>{dailyOperationsPulse.upgradesSuggested}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Rooms out of order</dt>
                <dd>{dailyOperationsPulse.roomsOutOfOrder}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Dirty rooms awaiting release</dt>
                <dd>{dailyOperationsPulse.roomsDirty}</dd>
              </div>
              <div className="mt-5 rounded-xl bg-indigo-50 p-4 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">
                <p className="font-semibold">Heads up</p>
                <p className="mt-1">
                  Highland Tours arrive at 15:00 with split rooms. Ensure adjoining rooms 410 / 411 are prioritised once departures clear.
                </p>
              </div>
            </dl>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-5">
          <div className="space-y-4 xl:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today&apos;s arrivals</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">Drag guests to assign rooms below</span>
            </div>
            <div className="space-y-3">
              {sortedArrivals.map((arrival) => {
                const upgradeSuggestion = getUpgradeSuggestionForArrival(arrival)
                return (
                  <div
                    key={arrival.id}
                    draggable
                    onDragStart={(event) => handleDragStart(event, arrival.id)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-2xl border border-transparent bg-white p-5 shadow transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 ${
                      draggedArrivalId === arrival.id ? 'opacity-75 ring-2 ring-indigo-400' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{arrival.guestName}</p>
                          {arrival.vip && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
                              VIP
                            </span>
                          )}
                          {arrival.loyaltyTier && (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                              {arrival.loyaltyTier}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {arrival.checkInTime} check-in · {toTitleCase(arrival.roomType)} · {arrival.guests} guest
                          {arrival.guests > 1 ? 's' : ''} · {arrival.nights} night{arrival.nights > 1 ? 's' : ''}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {arrival.assignedRoom ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
                              Assigned · {arrival.assignedRoom}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              Awaiting assignment
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${
                              arrival.etaConfidence === 'on-time'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200'
                                : arrival.etaConfidence === 'delayed'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            ETA {arrival.etaConfidence.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          {arrival.status !== 'checked-in' && (
                            <button
                              onClick={() => handleArrivalCheckIn(arrival.id)}
                              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
                            >
                              Check in
                            </button>
                          )}
                          {arrival.assignedRoom && (
                            <button
                              onClick={() => handleArrivalUnassign(arrival.id)}
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Unassign
                            </button>
                          )}
                        </div>
                        {arrival.transport && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{arrival.transport}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {arrival.specialRequests.map((request) => (
                        <span
                          key={request}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"
                        >
                          {request}
                        </span>
                      ))}
                    </div>
                    {upgradeSuggestion && (
                      <div className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">
                        <p className="font-semibold">Upgrade opportunity</p>
                        <p>{upgradeSuggestion}</p>
                      </div>
                    )}
                    {arrival.notes && (
                      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{arrival.notes}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="space-y-4 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Departures & checkout</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">Mark rooms clean-ready to release</span>
            </div>
            <div className="space-y-3">
              {sortedDepartures.map((departure) => (
                <div key={departure.id} className="rounded-2xl bg-white p-5 shadow transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{departure.guestName}</p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            departure.status === 'checked-out'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                              : departure.status === 'packing'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {toTitleCase(departure.status)}
                        </span>
                        {departure.lateCheckout && (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                            Late checkout
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Room {departure.roomNumber} · Due {departure.departureTime}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Balance {formatCurrency(departure.balance)}
                        </span>
                        {departure.housekeepingRequired && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                            Housekeeping follow-up
                          </span>
                        )}
                      </div>
                      {departure.notes && departure.notes.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                          {departure.notes.map((note) => (
                            <li key={note}>• {note}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {!departure.processed && (
                          <button
                            onClick={() => handleDepartureProcessed(departure.id)}
                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                          >
                            Complete checkout
                          </button>
                        )}
                        {!departure.processed && (
                          <button
                            onClick={() => handleDepartureExtend(departure.id)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Extend
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Room assignment board</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Visual drag-and-drop board with live housekeeping context.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {roomFilterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRoomFilter(option.value)}
                  className={`rounded-full px-3 py-1 font-medium transition ${
                    roomFilter === option.value
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {assignmentAlert && (
            <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
              {assignmentAlert}
            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-[minmax(260px,320px),1fr]">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Unassigned arrivals</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{unassignedArrivals.length} waiting</span>
                </div>
                <div className="mt-2 space-y-3">
                  {unassignedArrivals.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                      All arrivals have pre-assigned rooms.
                    </p>
                  )}
                  {unassignedArrivals.map((arrival) => (
                    <div
                      key={arrival.id}
                      draggable
                      onDragStart={(event) => handleDragStart(event, arrival.id)}
                      onDragEnd={handleDragEnd}
                      className={`rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-xs shadow-sm transition hover:-translate-y-0.5 dark:border-slate-600 dark:bg-gray-900 ${
                        draggedArrivalId === arrival.id ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 dark:text-white">{arrival.guestName}</p>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">{arrival.checkInTime}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{toTitleCase(arrival.roomType)} · {arrival.guests} guest{arrival.guests > 1 ? 's' : ''}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {arrival.specialRequests.slice(0, 2).map((request) => (
                          <span key={request} className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                            {request}
                          </span>
                        ))}
                        {arrival.specialRequests.length > 2 && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            +{arrival.specialRequests.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Pre-assigned & awaiting arrival</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{preAssignedArrivals.length} queued</span>
                </div>
                <div className="mt-2 space-y-2">
                  {preAssignedArrivals.map((arrival) => (
                    <div
                      key={arrival.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 dark:text-white">{arrival.guestName}</span>
                        <span>{arrival.assignedRoom}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Arrives {arrival.checkInTime}</p>
                    </div>
                  ))}
                  {preAssignedArrivals.length === 0 && (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                      No pre-assigned arrivals yet.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Room status board</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Drop guests onto rooms to create assignments. Conflicts are blocked automatically.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredRooms.map((room) => {
                  const dropState = dropPreview?.roomNumber === room.roomNumber ? (dropPreview.invalid ? 'ring-2 ring-rose-500' : 'ring-2 ring-indigo-500') : ''
                  return (
                    <div
                      key={room.id}
                      onDragOver={(event) => event.preventDefault()}
                      onDragEnter={() => handleRoomDragEnter(room.roomNumber)}
                      onDragLeave={() => handleRoomDragLeave(room.roomNumber)}
                      onDrop={(event) => handleRoomDrop(event, room.roomNumber)}
                      className={`rounded-2xl p-4 transition ${roomStatusStyles[room.status]} ${dropState}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Room {room.roomNumber}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{toTitleCase(room.type)} · Sleeps {room.capacity}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          room.status === 'in-house'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'
                            : room.status === 'vacant-clean'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                              : room.status === 'vacant-dirty'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                                : room.status === 'pre-arrival'
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200'
                                  : room.status === 'due-out'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}>{roomStatusLabels[room.status]}</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className={`rounded-full px-2 py-0.5 font-medium ${housekeepingStateStyles[room.housekeepingStatus]}`}>
                          HK · {toTitleCase(room.housekeepingStatus)}
                        </span>
                        {room.departureDueAt && <span>Due out {room.departureDueAt}</span>}
                        {room.isAccessible && <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">Accessible</span>}
                      </div>
                      {room.assignedGuest && (
                        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Assigned to {room.assignedGuest}</p>
                      )}
                      {room.tags && room.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {room.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800/70">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {room.maintenanceNote && (
                        <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">{room.maintenanceNote}</p>
                      )}
                      {room.blockers && room.blockers.length > 0 && (
                        <ul className="mt-2 space-y-1 text-[11px] text-amber-700 dark:text-amber-300">
                          {room.blockers.map((blocker) => (
                            <li key={blocker}>• {blocker}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assignments automatically trigger rush cleaning for dirty rooms and surface conflicts such as accessibility or capacity issues.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Housekeeping mission control</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track cleaning progress, priorities, and inspection sign-off with mobile sync.</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tasks.filter((task) => task.status === 'scheduled').length} scheduled · {tasks.filter((task) => task.status === 'in-progress').length} in progress · {tasks.filter((task) => task.status === 'completed').length} completed
            </p>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[2fr,1fr]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {housekeepingColumns.map((column) => {
                const columnTasks = sortTasksForColumn(tasks.filter((task) => task.status === column.status))
                return (
                  <div key={column.status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/20">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{column.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{column.description}</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-sm dark:border-slate-700 dark:bg-gray-900 ${task.isRush ? 'ring-1 ring-rose-400/70' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">Room {task.roomNumber}</p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">Assigned to {task.assignedTo}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${priorityStyles[task.priority]}`}>
                              {toTitleCase(task.priority)}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                            <span>Elapsed: {getTaskElapsed(task)}</span>
                            {getTaskRemaining(task) && <span>{getTaskRemaining(task)}</span>}
                            <span>Updated {formatRelativeMinutes(nowMinutes - task.lastUpdateMinutes)}</span>
                          </div>
                          {task.notes && <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">{task.notes}</p>}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {task.status === 'scheduled' && (
                              <>
                                <button
                                  onClick={() => startHousekeepingTask(task.id)}
                                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                                >
                                  Start task
                                </button>
                                {task.mobileSync !== 'sent' && (
                                  <button
                                    onClick={() => pushTaskToMobile(task.id)}
                                    className="rounded-md border border-indigo-300 px-3 py-1.5 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-200 dark:hover:bg-indigo-900/40"
                                  >
                                    Send to mobile
                                  </button>
                                )}
                                {!task.isRush && (
                                  <button
                                    onClick={() => escalateTaskPriority(task.id)}
                                    className="rounded-md border border-rose-300 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/40"
                                  >
                                    Flag as rush
                                  </button>
                                )}
                              </>
                            )}
                            {task.status === 'in-progress' && (
                              <>
                                {task.requiresInspection ? (
                                  <button
                                    onClick={() => sendTaskToInspection(task.id)}
                                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700"
                                  >
                                    Move to inspection
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => completeHousekeepingTask(task.id)}
                                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                                  >
                                    Mark complete
                                  </button>
                                )}
                                {!task.isRush && (
                                  <button
                                    onClick={() => escalateTaskPriority(task.id)}
                                    className="rounded-md border border-rose-300 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/40"
                                  >
                                    Escalate
                                  </button>
                                )}
                              </>
                            )}
                            {task.status === 'inspection' && (
                              <button
                                onClick={() => completeHousekeepingTask(task.id)}
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                              >
                                Sign off
                              </button>
                            )}
                            {task.status === 'completed' && (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                                Completed {formatRelativeMinutes(nowMinutes - task.lastUpdateMinutes)}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                            <span className={`rounded-full px-2 py-0.5 font-medium ${mobileSyncStyles[task.mobileSync]}`}>
                              Mobile · {task.mobileSync === 'online' ? 'Synced' : task.mobileSync === 'sent' ? 'Pushed' : 'Pending'}
                            </span>
                            {task.requiresInspection && <span className="text-indigo-600 dark:text-indigo-300">Inspection required</span>}
                          </div>
                        </div>
                      ))}
                      {columnTasks.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-500 dark:border-slate-600 dark:bg-gray-900/30 dark:text-slate-300">
                          No tasks in this stage.
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/30">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Mobile dispatch feed</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Preview of what the housekeeping mobile app surfaces to teams.</p>
              <div className="mt-4 rounded-[2rem] border border-slate-300 bg-white p-4 shadow-inner dark:border-slate-600 dark:bg-gray-950/60">
                <div className="space-y-4">
                  {mobileFeed.map((task) => (
                    <div key={`mobile-${task.id}`} className="rounded-xl bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Room {task.roomNumber}</span>
                        <span>{toTitleCase(task.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px]">{task.assignedTo} · {task.priority === 'high' ? 'Rush' : toTitleCase(task.priority)}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Updated {formatRelativeMinutes(nowMinutes - task.lastUpdateMinutes)}</p>
                      {task.notes && <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{task.notes}</p>}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-full bg-slate-200 py-1 text-center text-[10px] uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  Live sync
                </div>
              </div>
            </div>
          </div>
        </section>

        {(userProfile.role === 'manager' || userProfile.role === 'admin') && (
          <section className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Staff roster & access</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of staff accounts with role-based access and last activity.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Last login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {staffUsers.map((staff) => {
                    const name = `${staff.profile?.firstName ?? ''} ${staff.profile?.lastName ?? ''}`.trim() || staff.email
                    return (
                      <tr key={staff.uid} className="bg-white dark:bg-gray-900/60">
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{name}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{staff.email}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            staff.role === 'admin'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                              : staff.role === 'manager'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                          }`}
                          >
                            {toTitleCase(staff.role)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatAuditTimestamp(staff.lastLogin ?? '')}</td>
                      </tr>
                    )
                  })}
                  {staffUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No staff profiles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {userProfile.role === 'admin' && (
          <section className="rounded-2xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent audit trail</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Latest security events across the platform for compliance review.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Timestamp</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Action</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Resource</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="bg-white dark:bg-gray-900/60">
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{formatAuditTimestamp(log.timestamp)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{log.userId?.slice?.(0, 8) ?? '—'}…</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{log.action}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{log.resource}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No audit entries recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
