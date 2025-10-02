import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
}

// Initialize Firebase
let firebase_app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase Auth and get a reference to the service
export const auth = getAuth(firebase_app)

// Initialize Firebase Firestore and get a reference to the service
export const db = getFirestore(firebase_app)

// Initialize Firebase Realtime Database and get a reference to the service
export const rtdb = getDatabase(firebase_app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

// Role definitions
export type UserRole = 'guest' | 'staff' | 'manager' | 'admin'

// Permission matrix
export const PERMISSIONS = {
  // Guest permissions
  MAKE_BOOKING: ['guest', 'staff', 'manager', 'admin'],
  VIEW_OWN_BOOKINGS: ['guest', 'staff', 'manager', 'admin'],

  // Staff permissions
  VIEW_ALL_BOOKINGS: ['staff', 'manager', 'admin'],
  MANAGE_BOOKINGS: ['staff', 'manager', 'admin'],
  VIEW_GUEST_PROFILES: ['staff', 'manager', 'admin'],

  // Manager permissions
  MANAGE_STAFF: ['manager', 'admin'],
  VIEW_REPORTS: ['manager', 'admin'],
  MANAGE_ROOMS: ['manager', 'admin'],
  MANAGE_AVAILABILITY: ['manager', 'admin'],
  VIEW_ANALYTICS: ['manager', 'admin'],

  // Admin permissions
  MANAGE_SYSTEM: ['admin'],
  VIEW_AUDIT_LOGS: ['admin'],
  MANAGE_USERS: ['admin']
} as const

export type Permission = keyof typeof PERMISSIONS

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(userRole)
}

export default firebase_app