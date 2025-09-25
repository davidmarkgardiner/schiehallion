'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { getAuditLogs, getStaffUsers } from '@/lib/db'
import { AuditLog, UserProfile } from '@/types/auth'
import { OperationsSummary } from '@/components/admin/dashboard/OperationsSummary'
import { ArrivalList } from '@/components/admin/dashboard/ArrivalList'
import { DepartureList } from '@/components/admin/dashboard/DepartureList'
import { RoomAssignmentBoard } from '@/components/admin/dashboard/RoomAssignmentBoard'
import { RoomStatusBoard } from '@/components/admin/dashboard/RoomStatusBoard'
import { HousekeepingBoard } from '@/components/admin/dashboard/HousekeepingBoard'
import {
  housekeepingTasks as housekeepingSeed,
  housekeepingTeam,
  operationalRooms as roomsSeed,
  operationsArrivals as arrivalsSeed,
  operationsDepartures as departuresSeed,
} from '@/data/operations'
import type {
  AssignmentFeedback,
  HousekeepingTask,
  HousekeepingWorkflowStatus,
  OperationalRoom,
  OperationsArrival,
  OperationsDeparture,
  OperationsSummaryMetrics,
} from '@/types/operations'

export default function AdminDashboard() {
  const { user, userProfile, logout } = useAuth()
  const router = useRouter()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [staffUsers, setStaffUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [arrivals, setArrivals] = useState<OperationsArrival[]>(() => arrivalsSeed.map((arrival) => ({ ...arrival })))
  const [departures, setDepartures] = useState<OperationsDeparture[]>(() =>
    departuresSeed.map((departure) => ({ ...departure })),
  )
  const [rooms, setRooms] = useState<OperationalRoom[]>(() => roomsSeed.map((room) => ({ ...room })))
  const [housekeeping, setHousekeeping] = useState<HousekeepingTask[]>(() =>
    housekeepingSeed.map((task) => ({ ...task })),
  )
  const [assignmentFeedback, setAssignmentFeedback] = useState<AssignmentFeedback | null>(null)

  useEffect(() => {
    // Check if user is logged in and has staff privileges
    if (!user) {
      router.push('/admin/login')
      return
    }

    if (!userProfile || !['staff', 'manager', 'admin'].includes(userProfile.role)) {
      router.push('/')
      return
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Load audit logs (admin only)
        if (userProfile?.role === 'admin') {
          const logs = await getAuditLogs(undefined, 20)
          setAuditLogs(logs)
        }

        // Load staff users (manager and admin)
        if (userProfile?.role === 'manager' || userProfile?.role === 'admin') {
          const staff = await getStaffUsers()
          setStaffUsers(staff)
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user, userProfile, router])

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  const roomLookup = useMemo(() => {
    const map = new Map<string, OperationalRoom>()
    rooms.forEach((room) => map.set(room.id, room))
    return map
  }, [rooms])

  const getRoomLabel = (roomId?: string) => {
    if (!roomId) {
      return undefined
    }
    return roomLookup.get(roomId)?.roomNumber
  }

  const summaryMetrics = useMemo<OperationsSummaryMetrics>(() => {
    const arrivalsDue = arrivals.filter((arrival) => arrival.status !== 'checked-in').length
    const departuresDue = departures.filter((departure) => departure.status !== 'checked-out').length
    const vipArrivals = arrivals.filter((arrival) => arrival.vip && arrival.status !== 'checked-in').length
    const pendingRequests = arrivals.reduce((total, arrival) => total + (arrival.specialRequests?.length ?? 0), 0)
    const roomsAvailable = rooms.filter((room) => room.status === 'vacant-clean' && room.housekeepingStatus === 'clean').length
    const roomsOutOfOrder = rooms.filter((room) => room.turnStatus === 'out-of-order' || room.status === 'out-of-service').length
    const stayOvers = rooms.filter((room) => room.turnStatus === 'stayover').length
    const occupiedRooms = rooms.filter((room) => room.occupancyStatus === 'occupied').length
    const occupancyRate = rooms.length === 0 ? 0 : Math.round((occupiedRooms / rooms.length) * 100)
    const housekeepingCompletion =
      housekeeping.length === 0
        ? 0
        : Math.round(
            (housekeeping.filter((task) => task.status === 'completed').length / housekeeping.length) * 100,
          )

    return {
      arrivalsDue,
      departuresDue,
      vipArrivals,
      pendingRequests,
      roomsAvailable,
      roomsOutOfOrder,
      stayOvers,
      occupancyRate,
      housekeepingCompletion,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  }, [arrivals, departures, rooms, housekeeping])

  const handleArrivalStatusChange = (arrivalId: string, status: OperationsArrival['status']) => {
    let updatedArrival: OperationsArrival | undefined
    setArrivals((current) =>
      current.map((arrival) => {
        if (arrival.id === arrivalId) {
          updatedArrival = { ...arrival, status }
          return updatedArrival
        }
        return arrival
      }),
    )

    if (!updatedArrival?.assignedRoomId) {
      return
    }

    setRooms((current) =>
      current.map((room) => {
        if (room.id !== updatedArrival?.assignedRoomId) {
          return room
        }

        if (status === 'checked-in') {
          return {
            ...room,
            status: 'occupied',
            occupancyStatus: 'occupied',
            occupantName: updatedArrival!.guestName,
            turnStatus: 'stayover',
          }
        }

        return {
          ...room,
          status: 'vacant-clean',
          occupancyStatus: 'vacant',
          occupantName: undefined,
          turnStatus: 'arrival',
        }
      }),
    )
  }

  const handleDepartureStatusChange = (departureId: string, status: OperationsDeparture['status']) => {
    let updatedDeparture: OperationsDeparture | undefined
    setDepartures((current) =>
      current.map((departure) => {
        if (departure.id === departureId) {
          updatedDeparture = {
            ...departure,
            status,
            housekeepingStatus:
              status === 'processing'
                ? 'in-progress'
                : status === 'checked-out'
                ? 'dirty'
                : departure.housekeepingStatus,
          }
          return updatedDeparture
        }
        return departure
      }),
    )

    if (!updatedDeparture) {
      return
    }

    setRooms((current) =>
      current.map((room) => {
        if (room.roomNumber !== updatedDeparture!.roomNumber) {
          return room
        }

        if (status === 'checked-out') {
          return {
            ...room,
            status: 'vacant-dirty',
            housekeepingStatus: 'dirty',
            occupancyStatus: 'vacant',
            occupantName: undefined,
            turnStatus: 'departure',
            nextEvent: 'Awaiting housekeeping',
          }
        }

        if (status === 'processing') {
          return {
            ...room,
            status: 'vacant-dirty',
            housekeepingStatus: 'in-progress',
            turnStatus: 'departure',
          }
        }

        if (status === 'in-house' || status === 'late-checkout') {
          return {
            ...room,
            status: 'occupied',
            occupancyStatus: 'occupied',
            occupantName: updatedDeparture!.guestName,
            turnStatus: 'departure',
          }
        }

        return room
      }),
    )

    if (status === 'checked-out' || status === 'processing') {
      setHousekeeping((current) =>
        current.map((task) => {
          if (task.roomNumber !== updatedDeparture!.roomNumber) {
            return task
          }
          const nextStatus: HousekeepingWorkflowStatus = status === 'processing' ? 'in-progress' : 'pending'
          return {
            ...task,
            status: nextStatus,
            lastUpdated: new Date().toISOString(),
          }
        }),
      )
    }
  }

  const handleAssignment = (guestId: string, roomId: string) => {
    const guest = arrivals.find((arrival) => arrival.id === guestId)
    const room = rooms.find((item) => item.id === roomId)

    if (!guest || !room) {
      setAssignmentFeedback({ type: 'error', message: 'Unable to locate guest or room record.' })
      return
    }

    if (guest.partySize > room.capacity) {
      setAssignmentFeedback({ type: 'error', message: 'Capacity conflict — choose a larger room.' })
      return
    }

    if (room.housekeepingStatus !== 'clean' || room.status !== 'vacant-clean') {
      setAssignmentFeedback({ type: 'error', message: `Room ${room.roomNumber} is not ready for assignment.` })
      return
    }

    const conflict = arrivals.find((arrival) => arrival.assignedRoomId === roomId && arrival.id !== guestId)
    if (conflict) {
      setAssignmentFeedback({
        type: 'error',
        message: `Room ${room.roomNumber} is already allocated to ${conflict.guestName}.`,
      })
      return
    }

    const previousRoomId = guest.assignedRoomId

    setArrivals((current) =>
      current.map((arrival) => (arrival.id === guestId ? { ...arrival, assignedRoomId: roomId } : arrival)),
    )

    setRooms((current) =>
      current.map((item) => {
        if (item.id === roomId) {
          const priorityFlags = guest.vip
            ? Array.from(new Set([...(item.priorityFlags ?? []), 'VIP arrival']))
            : item.priorityFlags
          return {
            ...item,
            nextEvent: `Arrival ${guest.guestName} at ${guest.checkInTime}`,
            priorityFlags,
          }
        }

        if (previousRoomId && item.id === previousRoomId) {
          const filteredFlags =
            guest.vip && item.priorityFlags
              ? item.priorityFlags.filter((flag) => flag !== 'VIP arrival')
              : item.priorityFlags
          return {
            ...item,
            priorityFlags: filteredFlags && filteredFlags.length > 0 ? filteredFlags : undefined,
            nextEvent: undefined,
          }
        }

        return item
      }),
    )

    setAssignmentFeedback({
      type: 'success',
      message: `Assigned ${guest.guestName} to room ${room.roomNumber}.`,
    })
  }

  const handleReleaseAssignment = (guestId: string) => {
    const guest = arrivals.find((arrival) => arrival.id === guestId)
    if (!guest?.assignedRoomId) {
      setAssignmentFeedback({ type: 'error', message: 'Guest does not currently have a room assignment.' })
      return
    }

    if (guest.status === 'checked-in') {
      setAssignmentFeedback({ type: 'error', message: 'Guest already checked in — room cannot be released.' })
      return
    }

    const roomId = guest.assignedRoomId

    setArrivals((current) =>
      current.map((arrival) => (arrival.id === guestId ? { ...arrival, assignedRoomId: undefined } : arrival)),
    )

    setRooms((current) =>
      current.map((room) => {
        if (room.id !== roomId) {
          return room
        }

        const filteredFlags =
          guest.vip && room.priorityFlags
            ? room.priorityFlags.filter((flag) => flag !== 'VIP arrival')
            : room.priorityFlags

        return {
          ...room,
          priorityFlags: filteredFlags && filteredFlags.length > 0 ? filteredFlags : undefined,
          nextEvent: undefined,
        }
      }),
    )

    const label = getRoomLabel(roomId)
    setAssignmentFeedback({
      type: 'success',
      message: `Room ${label ?? roomId} released for reassignment.`,
    })
  }

  const handleHousekeepingStatusChange = (taskId: string, status: HousekeepingWorkflowStatus) => {
    const targetTask = housekeeping.find((task) => task.id === taskId)

    setHousekeeping((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              lastUpdated: new Date().toISOString(),
            }
          : task,
      ),
    )

    if (!targetTask) {
      return
    }

    setRooms((current) =>
      current.map((room) => {
        if (room.roomNumber !== targetTask.roomNumber) {
          return room
        }

        if (status === 'completed') {
          return {
            ...room,
            housekeepingStatus: 'clean',
            status: room.occupancyStatus === 'occupied' ? 'occupied' : 'vacant-clean',
            housekeepingEta: 'Ready now',
          }
        }

        if (status === 'in-progress') {
          return {
            ...room,
            housekeepingStatus: 'in-progress',
          }
        }

        if (status === 'pending') {
          return {
            ...room,
            housekeepingStatus: 'dirty',
          }
        }

        if (status === 'inspecting') {
          return {
            ...room,
            housekeepingStatus: 'inspection',
          }
        }

        return room
      }),
    )
  }

  const handleHousekeepingReassign = (taskId: string, teamMember: string) => {
    setHousekeeping((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              assignedTo: teamMember,
              lastUpdated: new Date().toISOString(),
            }
          : task,
      ),
    )
  }

  if (loading || !user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <span className="ml-4 px-2 py-1 text-xs font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                {userProfile.role.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {userProfile.profile?.firstName || user.email}
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <OperationsSummary metrics={summaryMetrics} />
          <div className="grid gap-6 xl:grid-cols-2">
            <ArrivalList arrivals={arrivals} onStatusChange={handleArrivalStatusChange} getRoomLabel={getRoomLabel} />
            <DepartureList departures={departures} onStatusChange={handleDepartureStatusChange} />
          </div>
          <RoomAssignmentBoard
            guests={arrivals}
            rooms={rooms}
            onAssign={handleAssignment}
            onRelease={handleReleaseAssignment}
            getRoomLabel={(roomId) => getRoomLabel(roomId)}
            feedback={assignmentFeedback}
          />
          <RoomStatusBoard rooms={rooms} />
          <HousekeepingBoard
            tasks={housekeeping}
            onStatusChange={handleHousekeepingStatusChange}
            onReassign={handleHousekeepingReassign}
            team={housekeepingTeam}
          />
          {(userProfile.role === 'manager' || userProfile.role === 'admin') && (
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Staff management</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  View active staff accounts and their recent access details.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Last login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    {staffUsers.map((staff) => (
                      <tr key={staff.uid}>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {staff.profile?.firstName || 'N/A'} {staff.profile?.lastName || ''}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{staff.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              staff.role === 'admin'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                                : staff.role === 'manager'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                            }`}
                          >
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {staff.lastLogin ? new Date(staff.lastLogin).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {userProfile.role === 'admin' && (
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent audit activity</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Latest privileged actions across the admin console.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-6 py-3 text-left">Timestamp</th>
                      <th className="px-6 py-3 text-left">User</th>
                      <th className="px-6 py-3 text-left">Action</th>
                      <th className="px-6 py-3 text-left">Resource</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-sm dark:divide-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                          {log.timestamp?.toLocaleString() ?? '—'}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                          {log.userId.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-200">{log.action}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{log.resource}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}