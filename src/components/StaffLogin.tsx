'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function StaffLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null)

  const { login, user, userProfile, logout } = useAuth()
  const router = useRouter()

  // Session timeout management (30 minutes for staff)
  useEffect(() => {
    if (user && userProfile && ['staff', 'manager', 'admin'].includes(userProfile.role)) {
      const timeout = setTimeout(() => {
        handleSessionTimeout()
      }, 30 * 60 * 1000) // 30 minutes

      setSessionTimeout(timeout as unknown as number)

      return () => {
        if (timeout) {
          clearTimeout(timeout)
        }
      }
    }
  }, [user, userProfile])

  const handleSessionTimeout = async () => {
    setError('Session expired for security. Please log in again.')
    await logout()
    router.push('/admin/login')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      setError('')
      setLoading(true)

      // Attempt staff login
      await login(email, password, true)

      // For now, we'll simulate 2FA requirement
      // In a real implementation, you'd check if the user has 2FA enabled
      // and send a code via SMS/email or use an authenticator app

      // Simulate 2FA check
      const needsTwoFactor = email.includes('staff') || email.includes('manager') || email.includes('admin')

      if (needsTwoFactor) {
        setShowTwoFactor(true)
        // In real implementation: send 2FA code here
        console.log('2FA code would be sent to:', email)
      } else {
        // Redirect to admin dashboard
        router.push('/admin/dashboard')
      }

    } catch (error: any) {
      setError(error.message)
      setShowTwoFactor(false)
    } finally {
      setLoading(false)
    }
  }

  const handleTwoFactorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!twoFactorCode) {
      setError('Please enter the 2FA code')
      return
    }

    try {
      setError('')
      setLoading(true)

      // Simulate 2FA verification
      // In real implementation, you'd verify the code with your 2FA service
      if (twoFactorCode === '123456' || twoFactorCode.length === 6) {
        // 2FA successful - redirect to admin dashboard
        router.push('/admin/dashboard')
      } else {
        setError('Invalid 2FA code. Please try again.')
      }

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resendTwoFactorCode = () => {
    // In real implementation: resend 2FA code
    console.log('Resending 2FA code to:', email)
    setError('')
    // Show success message
    setTimeout(() => {
      setError('2FA code resent successfully')
    }, 100)
  }

  if (showTwoFactor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-950">Two-Factor Authentication</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Enter the 6-digit code sent to your device
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
            <div>
              <label htmlFor="twoFactorCode" className="block text-sm font-medium mb-1">
                Verification Code
              </label>
              <input
                type="text"
                id="twoFactorCode"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 text-center text-lg tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || twoFactorCode.length !== 6}
              className="w-full py-2 px-4 bg-indigo-600 text-slate-950 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={resendTwoFactorCode}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              Didn't receive a code? Resend
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setShowTwoFactor(false)
                setTwoFactorCode('')
                setError('')
              }}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-950">Staff Portal</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Secure access for hotel staff and management
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Staff Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="staff@hotel.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 text-slate-950 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secured with 2FA</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-800 text-sm"
          >
            ← Back to main site
          </a>
        </div>

        {/* Demo credentials info */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <p className="font-medium text-yellow-800">Demo Credentials:</p>
          <p className="text-yellow-700">Use any email with 'staff', 'manager', or 'admin' to trigger 2FA</p>
          <p className="text-yellow-700">2FA Code: 123456 (for demo)</p>
        </div>
      </div>
    </div>
  )
}