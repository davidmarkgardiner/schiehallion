'use client'

import { createContext, useContext, useState } from 'react'
import { UserProfile, UserRole } from '@/types/auth'

// Mock user for testing Epic 4 features
const mockUser = {
  uid: 'test-user-123',
  email: 'test@schiehallion.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    creationTime: new Date().toISOString(),
    lastSignInTime: new Date().toISOString(),
  },
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({})
}

const mockUserProfile: UserProfile = {
  uid: 'test-user-123',
  email: 'test@schiehallion.com',
  displayName: 'Test User',
  role: 'guest',
  createdAt: new Date(),
  lastLoginAt: new Date(),
  preferences: {
    language: 'en',
    currency: 'GBP',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  }
}

interface AuthContextType {
  user: any | null
  userProfile: UserProfile | null
  loading: boolean
  signup: (email: string, password: string, role?: UserRole) => Promise<void>
  signupGuest: (email: string, password: string, profileData?: Partial<UserProfile>) => Promise<void>
  login: (email: string, password: string, isStaffLogin?: boolean) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  isRole: (role: UserRole) => boolean
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(mockUser)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(mockUserProfile)
  const [loading, setLoading] = useState(false)

  const signup = async (email: string, password: string, role: UserRole = 'guest') => {
    console.log('Mock signup:', email, role)
  }

  const signupGuest = async (email: string, password: string, profileData?: Partial<UserProfile>) => {
    console.log('Mock guest signup:', email)
  }

  const login = async (email: string, password: string, isStaffLogin: boolean = false) => {
    console.log('Mock login:', email, isStaffLogin)
    setUser(mockUser)
    setUserProfile(mockUserProfile)
  }

  const loginWithGoogle = async () => {
    console.log('Mock Google login')
    setUser(mockUser)
    setUserProfile(mockUserProfile)
  }

  const logout = async () => {
    console.log('Mock logout')
    // Don't actually log out for testing
  }

  const hasPermission = (permission: string): boolean => {
    return true // Allow all permissions for testing
  }

  const isRole = (role: UserRole): boolean => {
    return userProfile?.role === role
  }

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    console.log('Mock profile update:', updates)
  }

  const value = {
    user,
    userProfile,
    loading,
    signup,
    signupGuest,
    login,
    loginWithGoogle,
    logout,
    hasPermission,
    isRole,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}