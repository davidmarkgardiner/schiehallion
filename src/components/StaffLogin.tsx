'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function StaffLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const { login, user, userProfile, logout } = useAuth()
  const router = useRouter()

  const handleSessionTimeout = useCallback(async () => {
    setError('Session expired for security. Please log in again.')
    await logout()
    router.push('/admin/login')
  }, [logout, router])

  // Session timeout management (30 minutes for staff)
  useEffect(() => {
    if (user && userProfile && ['staff', 'manager', 'admin'].includes(userProfile.role)) {
      const timeout = setTimeout(() => {
        handleSessionTimeout()
      }, 30 * 60 * 1000)

      return () => {
        clearTimeout(timeout)
      }
    }
    return undefined
  }, [handleSessionTimeout, user, userProfile])

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lundies-ivory via-lundies-linen to-lundies-stone dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-lundies-stone/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80">
          <div className="mb-6 space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lundies-linen/80">
              <svg className="h-6 w-6 text-lundies-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-lundies-charcoal dark:text-neutral-50">Two-Factor Authentication</h2>
            <p className="mt-2 text-sm text-lundies-peat/80 dark:text-neutral-300">
              Enter the 6-digit code sent to your device
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-lundies-peat/30 bg-lundies-peat/10 p-3 text-lundies-peat dark:border-neutral-600 dark:bg-neutral-800">
              {error}
            </div>
          )}

          <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
            <div>
              <label htmlFor="twoFactorCode" className="mb-1 block text-sm font-medium text-lundies-charcoal dark:text-neutral-100">
                Verification Code
              </label>
              <input
                type="text"
                id="twoFactorCode"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-lg border border-lundies-stone/50 px-3 py-2 text-center text-lg tracking-widest text-lundies-charcoal focus:outline-none focus:ring-2 focus:ring-lundies-moss dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || twoFactorCode.length !== 6}
              className="w-full rounded-lg bg-lundies-moss px-4 py-2 font-medium text-white transition hover:bg-lundies-heather focus:outline-none focus:ring-2 focus:ring-lundies-moss disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={resendTwoFactorCode}
              className="text-sm font-medium text-lundies-moss hover:text-lundies-heather"
            >
              Didn&apos;t receive a code? Resend
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setShowTwoFactor(false)
                setTwoFactorCode('')
                setError('')
              }}
              className="text-sm text-lundies-peat hover:text-lundies-charcoal"
            >
              ← Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-lundies-ivory via-lundies-linen to-lundies-stone dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-lundies-stone/60 bg-white/80 p-6 shadow-lg backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-6 space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lundies-linen/80">
            <svg className="h-6 w-6 text-lundies-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-lundies-charcoal dark:text-neutral-50">Staff Portal</h2>
          <p className="text-sm text-lundies-peat/80 dark:text-neutral-300">
            Secure access for hotel staff and management
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-lundies-peat/30 bg-lundies-peat/10 p-3 text-lundies-peat dark:border-neutral-600 dark:bg-neutral-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-lundies-charcoal dark:text-neutral-100">
              Staff Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-lundies-stone/50 px-3 py-2 text-lundies-charcoal focus:outline-none focus:ring-2 focus:ring-lundies-moss dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              placeholder="staff@hotel.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-lundies-charcoal dark:text-neutral-100">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-lundies-stone/50 px-3 py-2 text-lundies-charcoal focus:outline-none focus:ring-2 focus:ring-lundies-moss dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-lundies-moss px-4 py-2 font-medium text-white transition hover:bg-lundies-heather focus:outline-none focus:ring-2 focus:ring-lundies-moss disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-lundies-peat/80 dark:text-neutral-300">
            <svg className="h-4 w-4 text-lundies-moss" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secured with 2FA</span>
          </div>
        </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm font-medium text-lundies-moss hover:text-lundies-heather">
              ← Back to main site
            </Link>
          </div>

        {/* Demo credentials info */}
        <div className="mt-6 rounded-xl border border-lundies-stone/60 bg-lundies-linen/80 p-3 text-sm text-lundies-peat dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200">
          <p className="font-medium text-lundies-charcoal dark:text-neutral-100">Demo Credentials:</p>
            <p>Use any email with &lsquo;staff&rsquo;, &lsquo;manager&rsquo;, or &lsquo;admin&rsquo; to trigger 2FA</p>
          <p>2FA Code: 123456 (for demo)</p>
        </div>
      </div>
    </div>
  )
}