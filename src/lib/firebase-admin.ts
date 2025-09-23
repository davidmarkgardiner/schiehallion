// Firebase Admin SDK Configuration
// Required for server-side operations in API routes

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  // In production, use service account key
  // For development, we'll use the default project config
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  } else {
    // Development fallback - uses Application Default Credentials
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  }
}

// Export admin services
export const adminAuth = getAuth()
export const adminDb = getFirestore()

export default { auth: adminAuth, db: adminDb }
