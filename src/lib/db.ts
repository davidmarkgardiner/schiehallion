import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore'
import { db } from './firebase'
import { UserProfile, UserRole, AuditLog } from '@/types/auth'

// User profile operations
export const createUserProfile = async (
  uid: string,
  email: string,
  role: UserRole = 'guest',
  additionalData?: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  const userData: Omit<UserProfile, 'uid'> = {
    email,
    role,
    profile: additionalData?.profile || {},
    createdAt: new Date(),
    lastLogin: new Date(),
    isEmailVerified: false,
    ...(role !== 'guest' && {
      staffInfo: {
        employeeId: '',
        department: '',
        permissions: [],
        twoFactorEnabled: false,
        ...additionalData?.staffInfo
      }
    })
  }

  await setDoc(userRef, userData)
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    const data = userSnap.data()
    return {
      uid,
      ...data,
      // Convert Firestore Timestamps to JavaScript Dates
      createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
      lastLogin: data.lastLogin?.toDate?.() || data.lastLogin || new Date()
    } as UserProfile
  }

  return null
}

export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, updates)
}

export const updateLastLogin = async (uid: string): Promise<void> => {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    lastLogin: new Date()
  })
}

// Audit logging
export const logAuditEvent = async (
  userId: string,
  action: string,
  resource: string,
  details: any = {},
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  const auditData: any = {
    userId,
    action,
    resource,
    timestamp: new Date(),
    details: details || {}
  }

  // Only add optional fields if they have values
  if (ipAddress) {
    auditData.ipAddress = ipAddress
  }
  if (userAgent) {
    auditData.userAgent = userAgent
  }

  await addDoc(collection(db, 'auditLogs'), auditData)
}

// Get audit logs (admin only)
export const getAuditLogs = async (
  userId?: string,
  limitCount: number = 50
): Promise<AuditLog[]> => {
  let q = query(
    collection(db, 'auditLogs'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  )

  if (userId) {
    q = query(
      collection(db, 'auditLogs'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
  }

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as AuditLog))
}

// Staff management
export const getStaffUsers = async (): Promise<UserProfile[]> => {
  const q = query(
    collection(db, 'users'),
    where('role', 'in', ['staff', 'manager', 'admin'])
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  } as UserProfile))
}

// Guest booking operations
export const createGuestBooking = async (
  guestEmail: string,
  bookingDetails: any,
  guestUserId?: string
): Promise<string> => {
  const bookingData = {
    guestEmail,
    guestUserId: guestUserId || null,
    bookingDetails,
    createdAt: new Date(),
    status: 'pending'
  }

  const docRef = await addDoc(collection(db, 'guestBookings'), bookingData)
  return docRef.id
}