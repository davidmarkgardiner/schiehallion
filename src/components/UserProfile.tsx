'use client'

import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'

export default function UserProfile() {
  const { user, userProfile, logout, hasPermission, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: userProfile?.profile?.firstName || '',
    lastName: userProfile?.profile?.lastName || '',
    phone: userProfile?.profile?.phone || ''
  })
  const [loading, setLoading] = useState(false)

  if (!user || !userProfile) return null

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      await updateProfile({
        profile: {
          ...userProfile?.profile,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone
        }
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setProfileData({
      firstName: userProfile?.profile?.firstName || '',
      lastName: userProfile?.profile?.lastName || '',
      phone: userProfile?.profile?.phone || ''
    })
    setIsEditing(false)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800" data-testid="user-profile">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Welcome!</h2>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          userProfile.role === 'admin' ? 'bg-red-100 text-red-800' :
          userProfile.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
          userProfile.role === 'staff' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {userProfile.role.toUpperCase()}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <span className="font-medium">Email:</span> {user.email}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <span className="font-medium">Name:</span> {userProfile?.profile?.firstName} {userProfile?.profile?.lastName}
            </div>
            <div>
              <span className="font-medium">Phone:</span> {userProfile?.profile?.phone || 'Not provided'}
            </div>
            <div>
              <span className="font-medium">Member Since:</span> {userProfile.createdAt?.toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Last Login:</span> {userProfile.lastLogin?.toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Verified:</span> {user.emailVerified ? 'Yes' : 'No'}
            </div>
          </>
        )}
      </div>

      {/* Role-specific actions */}
      {hasPermission('VIEW_ALL_BOOKINGS') && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Staff Actions</h3>
          <div className="space-y-2">
            <a
              href="/admin/dashboard"
              className="block text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
            >
              → Access Admin Dashboard
            </a>
            {hasPermission('VIEW_REPORTS') && (
              <a
                href="/admin/reports"
                className="block text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
              >
                → View Reports
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2">
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Profile
          </button>
        )}

        <button
          onClick={logout}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  )
}