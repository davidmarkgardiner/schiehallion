'use client'

import { useAuth } from '@/context/AuthContext'
import { useState, useRef, useEffect } from 'react'

export default function NavUserProfile() {
  const { user, userProfile, logout, hasPermission } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user || !userProfile) return null

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      case 'manager': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'staff': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white transition hover:border-white hover:bg-white/10"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-xs font-semibold text-slate-950">
          {user.email?.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block">
          {userProfile?.profile?.firstName || user.email?.split('@')[0]}
        </span>
        <span className={`hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold rounded-full ${getRoleBadgeColor(userProfile.role)}`}>
          {userProfile.role.toUpperCase()}
        </span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-xl backdrop-blur-sm z-50">
          {/* Header */}
          <div className="mb-4 border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Profile</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(userProfile.role)}`}>
                {userProfile.role.toUpperCase()}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-4 space-y-2 text-sm">
            <div className="text-slate-300">
              <span className="font-medium text-white">Email:</span> {user.email}
            </div>
            {userProfile?.profile?.firstName && (
              <div className="text-slate-300">
                <span className="font-medium text-white">Name:</span> {userProfile.profile.firstName} {userProfile.profile.lastName}
              </div>
            )}
            <div className="text-slate-300">
              <span className="font-medium text-white">Verified:</span> {user.emailVerified ? 'Yes' : 'No'}
            </div>
            <div className="text-slate-300">
              <span className="font-medium text-white">Member Since:</span> {userProfile.createdAt?.toLocaleDateString()}
            </div>
          </div>

          {/* Staff Actions */}
          {hasPermission('VIEW_ALL_BOOKINGS') && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-emerald-300">Staff Actions</h4>
              <div className="space-y-1">
                <a
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  → Access Admin Dashboard
                </a>
                {hasPermission('VIEW_REPORTS') && (
                  <a
                    href="/admin/reports"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    → View Reports
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: Open profile edit modal
              }}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}