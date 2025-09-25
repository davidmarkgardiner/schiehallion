'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAuditLogs, getStaffUsers } from '@/lib/db'
import { AuditLog, UserProfile } from '@/types/auth'

export default function AdminDashboard() {
  const { user, userProfile, logout } = useAuth()
  const router = useRouter()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [staffUsers, setStaffUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

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

    loadDashboardData()
  }, [user, userProfile, router])

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

  const handleLogout = async () => {
    await logout()
    router.push('/admin/login')
  }

  if (loading || !user || !userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lundies-ivory via-lundies-linen to-lundies-stone dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-lundies-moss"></div>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-lundies-peat/70 dark:text-neutral-300/80">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lundies-ivory via-lundies-linen to-lundies-stone text-lundies-charcoal dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
      {/* Header */}
      <header className="border-b border-lundies-stone/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-lundies-charcoal dark:text-neutral-50">
                Admin Dashboard
              </h1>
              <span className="rounded-full bg-lundies-linen/90 px-3 py-1 text-xs font-semibold tracking-[0.3em] text-lundies-peat">
                {userProfile.role.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-lundies-peat/80 dark:text-neutral-300">
                Welcome, {userProfile.profile.firstName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-lundies-peat/30 px-4 py-2 text-sm font-semibold text-lundies-peat transition hover:bg-lundies-peat/10 focus:outline-none focus:ring-2 focus:ring-lundies-peat/40"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <button
            onClick={() => router.push('/admin/image-generation')}
            className="group rounded-3xl border border-lundies-stone/60 bg-white/80 p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:bg-lundies-ivory/80 dark:border-neutral-700 dark:bg-neutral-900/70 dark:hover:bg-neutral-800"
          >
            <div className="mb-2 flex items-center justify-between text-lundies-charcoal dark:text-neutral-100">
              <div className="text-2xl">🎨</div>
              <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-lundies-charcoal dark:text-neutral-100">AI Image Studio</h3>
            <p className="text-sm text-lundies-peat/80 dark:text-neutral-300">Curate brand-safe imagery across rooms and dining.</p>
          </button>

          <button
            onClick={() => router.push('/admin/restaurant')}
            className="group rounded-3xl border border-lundies-stone/60 bg-white/80 p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:bg-lundies-ivory/80 dark:border-neutral-700 dark:bg-neutral-900/70 dark:hover:bg-neutral-800"
          >
            <div className="mb-2 flex items-center justify-between text-lundies-charcoal dark:text-neutral-100">
              <div className="text-2xl">🍽️</div>
              <svg className="h-5 w-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-lundies-charcoal dark:text-neutral-100">Restaurant</h3>
            <p className="text-sm text-lundies-peat/80 dark:text-neutral-300">Manage reservations, availability and table layouts.</p>
          </button>

          <div className="rounded-3xl border border-lundies-stone/40 bg-white/60 p-4 text-left shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="mb-2 flex items-center justify-between text-lundies-charcoal dark:text-neutral-100">
              <div className="text-2xl">🏨</div>
              <div className="rounded-full bg-lundies-linen/90 px-2 py-1 text-xs font-semibold tracking-[0.25em] text-lundies-peat">Coming Soon</div>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-lundies-charcoal dark:text-neutral-100">Room Management</h3>
            <p className="text-sm text-lundies-peat/80 dark:text-neutral-300">Handle bookings, assignments and availability.</p>
          </div>

          <div className="rounded-3xl border border-lundies-stone/40 bg-white/60 p-4 text-left shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="mb-2 flex items-center justify-between text-lundies-charcoal dark:text-neutral-100">
              <div className="text-2xl">📊</div>
              <div className="rounded-full bg-lundies-linen/90 px-2 py-1 text-xs font-semibold tracking-[0.25em] text-lundies-peat">Coming Soon</div>
            </div>
            <h3 className="mb-1 text-lg font-semibold text-lundies-charcoal dark:text-neutral-100">Analytics</h3>
            <p className="text-sm text-lundies-peat/80 dark:text-neutral-300">View upcoming performance dashboards & insights.</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="overflow-hidden rounded-3xl border border-lundies-stone/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-lundies-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium uppercase tracking-[0.25em] text-lundies-peat/70 dark:text-neutral-300/80">
                      Active Staff
                    </dt>
                    <dd className="text-lg font-semibold text-lundies-charcoal dark:text-neutral-100">
                      {staffUsers.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-lundies-stone/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-lundies-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h8a2 2 0 002-2V7a2 2 0 00-2-2h-2m0 0V3a2 2 0 10-4 0v2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium uppercase tracking-[0.25em] text-lundies-peat/70 dark:text-neutral-300/80">
                      Recent Actions
                    </dt>
                    <dd className="text-lg font-semibold text-lundies-charcoal dark:text-neutral-100">
                      {auditLogs.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-lundies-stone/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-lundies-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium uppercase tracking-[0.25em] text-lundies-peat/70 dark:text-neutral-300/80">
                      Session Active
                    </dt>
                    <dd className="text-lg font-semibold text-lundies-charcoal dark:text-neutral-100">
                      30 min
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Management */}
        {(userProfile.role === 'manager' || userProfile.role === 'admin') && (
          <div className="mb-8 rounded-3xl border border-lundies-stone/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="mb-4 text-lg font-semibold uppercase tracking-[0.3em] text-lundies-peat/80 dark:text-neutral-200">
                Staff Management
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-lundies-stone/40 dark:divide-neutral-700">
                  <thead className="bg-lundies-linen/80 text-lundies-peat dark:bg-neutral-900/70 dark:text-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                        Last Login
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lundies-stone/30 bg-white/70 text-lundies-charcoal dark:divide-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-100">
                    {staffUsers.map((staff) => (
                      <tr key={staff.uid}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          {staff.profile.firstName} {staff.profile.lastName}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-lundies-peat/80 dark:text-neutral-300">
                          {staff.email}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
                              staff.role === 'admin'
                                ? 'bg-lundies-peat/15 text-lundies-peat'
                                : staff.role === 'manager'
                                  ? 'bg-lundies-sand/40 text-lundies-peat'
                                  : 'bg-lundies-heather/20 text-lundies-moss'
                            }`}
                          >
                            {staff.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-lundies-peat/80 dark:text-neutral-300">
                          {staff.lastLogin?.toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Audit Logs */}
        {userProfile.role === 'admin' && (
          <div className="rounded-3xl border border-lundies-stone/60 bg-white/80 shadow-sm backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/70">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="mb-4 text-lg font-semibold uppercase tracking-[0.3em] text-lundies-peat/80 dark:text-neutral-200">
                Recent Audit Logs
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-lundies-stone/40 dark:divide-neutral-700">
                  <thead className="bg-lundies-linen/80 text-lundies-peat dark:bg-neutral-900/70 dark:text-neutral-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em]">
                        Resource
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lundies-stone/30 bg-white/70 text-lundies-charcoal dark:divide-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-lundies-peat/80 dark:text-neutral-300">
                          {log.timestamp?.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          {log.userId.slice(0, 8)}...
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                          {log.action}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-lundies-peat/80 dark:text-neutral-300">
                          {log.resource}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}