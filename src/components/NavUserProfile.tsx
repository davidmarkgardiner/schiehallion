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
      case 'admin':
        return 'bg-rose-100 text-rose-800'
      case 'manager':
        return 'bg-amber-100 text-amber-800'
      case 'staff':
        return 'bg-sky-100 text-sky-800'
      default:
        return 'bg-lundies-heather/40 text-lundies-charcoal'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-lundies-stone/60 bg-white/60 px-3 py-1.5 text-sm text-lundies-charcoal shadow-sm transition hover:bg-white/80"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lundies-heather text-xs font-semibold text-lundies-charcoal">
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
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-lundies-stone/60 bg-white/95 p-4 shadow-xl backdrop-blur-sm">
          {/* Header */}
          <div className="mb-4 border-b border-lundies-stone/60 pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-lundies-charcoal">Profile</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(userProfile.role)}`}>
                {userProfile.role.toUpperCase()}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-4 space-y-2 text-sm">
            <div className="text-lundies-peat">
              <span className="font-medium text-lundies-charcoal">Email:</span> {user.email}
            </div>
            {userProfile?.profile?.firstName && (
              <div className="text-lundies-peat">
                <span className="font-medium text-lundies-charcoal">Name:</span> {userProfile.profile.firstName} {userProfile.profile.lastName}
              </div>
            )}
            <div className="text-lundies-peat">
              <span className="font-medium text-lundies-charcoal">Verified:</span> {user.emailVerified ? 'Yes' : 'No'}
            </div>
            <div className="text-lundies-peat">
              <span className="font-medium text-lundies-charcoal">Member Since:</span> {userProfile.createdAt?.toLocaleDateString()}
            </div>
          </div>

          {/* Staff Actions */}
          {hasPermission('VIEW_ALL_BOOKINGS') && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-lundies-moss">Staff Actions</h4>
              <div className="space-y-1">
                <a
                  href="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-lundies-charcoal transition hover:bg-lundies-stone/40"
                >
                  → Access Admin Dashboard
                </a>
                {hasPermission('VIEW_REPORTS') && (
                  <a
                    href="/admin/reports"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-lundies-charcoal transition hover:bg-lundies-stone/40"
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
              className="w-full rounded-lg bg-lundies-moss px-4 py-2 text-sm font-medium text-lundies-charcoal transition hover:bg-lundies-moss/80"
            >
              Edit Profile
            </button>
            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="w-full rounded-lg bg-lundies-peat px-4 py-2 text-sm font-medium text-lundies-charcoal transition hover:bg-lundies-peat/80"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}