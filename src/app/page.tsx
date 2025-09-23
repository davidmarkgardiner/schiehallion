'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import LoginForm from '@/components/LoginForm'
import UserProfile from '@/components/UserProfile'
import FirestoreDemo from '@/components/FirestoreDemo'
import GuestRegistration from '@/components/GuestRegistration'

export default function Home() {
  const { user, userProfile } = useAuth()
  const [showGuestRegistration, setShowGuestRegistration] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🔥 Firebase Hello World
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            A complete Next.js template with Firebase Authentication and Firestore
          </p>
        </div>

        <div className="mb-8 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left mx-auto">
          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-white/50 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h3 className="mb-3 text-xl font-semibold">🔐 Authentication</h3>
            <p className="m-0 max-w-[30ch] text-sm opacity-70">
              Sign up and login functionality with Firebase Auth.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-white/50 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h3 className="mb-3 text-xl font-semibold">🗄️ Database</h3>
            <p className="m-0 max-w-[30ch] text-sm opacity-70">
              Store and retrieve data with Firestore.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-white/50 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h3 className="mb-3 text-xl font-semibold">⚡ Real-time</h3>
            <p className="m-0 max-w-[30ch] text-sm opacity-70">
              Real-time updates and synchronization.
            </p>
          </div>

          <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-white/50 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30">
            <h3 className="mb-3 text-xl font-semibold">🚀 Deploy</h3>
            <p className="m-0 max-w-[30ch] text-sm opacity-70">
              Deploy easily to Firebase Hosting.
            </p>
          </div>
        </div>

        {/* Authentication Section */}
        {!user ? (
          <div className="space-y-6">
            {showGuestRegistration ? (
              <div>
                <GuestRegistration />
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowGuestRegistration(false)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    ← Back to login
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <LoginForm />
                <div className="text-center mt-6">
                  <div className="border-t pt-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      Making a booking? You can:
                    </p>
                    <button
                      onClick={() => setShowGuestRegistration(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Book as Guest or Create Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <UserProfile />
            {userProfile?.role === 'guest' && (
              <div className="max-w-md mx-auto mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-300 mb-2">
                  🏨 Welcome, Guest!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                  You can now make bookings and manage your reservations.
                </p>
                <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                  Make a Booking
                </button>
              </div>
            )}
            <FirestoreDemo />
          </>
        )}

        {/* Status Section */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Firebase connected and ready!
          </div>
        </div>
      </div>
    </main>
  )
}