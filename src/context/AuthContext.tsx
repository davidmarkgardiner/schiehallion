'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, hasPermission, type Permission } from '@/lib/firebase'
import { UserProfile, UserRole } from '@/types/auth'
import { createUserProfile, getUserProfile, updateUserProfile, updateLastLogin, logAuditEvent } from '@/lib/db'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signup: (email: string, password: string, role?: UserRole) => Promise<void>
  signupGuest: (email: string, password: string, profileData?: Partial<UserProfile>) => Promise<void>
  login: (email: string, password: string, isStaffLogin?: boolean) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: Permission) => boolean
  isRole: (role: UserRole) => boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const signup = async (email: string, password: string, role: UserRole = 'guest') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await createUserProfile(userCredential.user.uid, email, role)

    // Log the signup event
    await logAuditEvent(
      userCredential.user.uid,
      'USER_SIGNUP',
      'auth',
      { email, role }
    )
  }

  const signupGuest = async (email: string, password: string, profileData?: Partial<UserProfile>) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await createUserProfile(userCredential.user.uid, email, 'guest', profileData)

    // Log the guest signup event
    await logAuditEvent(
      userCredential.user.uid,
      'GUEST_SIGNUP',
      'auth',
      { email, hasProfile: !!profileData }
    )
  }

  const login = async (email: string, password: string, isStaffLogin: boolean = false) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const uid = userCredential.user.uid

    // Get user profile to check role
    const profile = await getUserProfile(uid)

    // If this is a staff login, verify the user has staff role
    if (isStaffLogin && profile && !['staff', 'manager', 'admin'].includes(profile.role)) {
      await signOut(auth)
      throw new Error('Access denied: Staff credentials required')
    }

    // Update last login time
    await updateLastLogin(uid)

    // Log the login event
    await logAuditEvent(
      uid,
      isStaffLogin ? 'STAFF_LOGIN' : 'USER_LOGIN',
      'auth',
      { email, isStaffLogin }
    )
  }

  const loginWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider)
    const uid = userCredential.user.uid
    const email = userCredential.user.email || ''

    // Check if user profile exists, create if not
    let profile = await getUserProfile(uid)
    if (!profile) {
      await createUserProfile(uid, email, 'guest')
      profile = await getUserProfile(uid)
    }

    // Update last login time
    await updateLastLogin(uid)

    // Log the Google login event
    await logAuditEvent(
      uid,
      'GOOGLE_LOGIN',
      'auth',
      { email }
    )
  }

  const logout = async () => {
    if (user && userProfile) {
      // Log the logout event
      await logAuditEvent(
        user.uid,
        userProfile.role === 'guest' ? 'USER_LOGOUT' : 'STAFF_LOGOUT',
        'auth',
        { email: user.email }
      )
    }

    await signOut(auth)
  }

  const checkPermission = (permission: Permission): boolean => {
    if (!userProfile) return false
    return hasPermission(userProfile.role, permission)
  }

  const isRole = (role: UserRole): boolean => {
    return userProfile?.role === role
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) throw new Error('No user logged in')

    await updateUserProfile(user.uid, updates)

    // Refresh user profile
    const updatedProfile = await getUserProfile(user.uid)
    setUserProfile(updatedProfile)

    // Log the profile update
    await logAuditEvent(
      user.uid,
      'PROFILE_UPDATE',
      'user_profile',
      { updates }
    )
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Load user profile
        try {
          const profile = await getUserProfile(user.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error loading user profile:', error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    signup,
    signupGuest,
    login,
    loginWithGoogle,
    logout,
    hasPermission: checkPermission,
    isRole,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}