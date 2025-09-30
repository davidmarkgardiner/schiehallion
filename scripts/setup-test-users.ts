/**
 * Setup Test Users in Firestore
 *
 * This script creates test user documents with proper roles in Firestore
 * to resolve Firebase permission errors during testing.
 *
 * Usage: npx tsx scripts/setup-test-users.ts
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

const auth = getAuth()
const db = getFirestore()

interface TestUser {
  email: string
  password: string
  role: 'guest' | 'staff' | 'manager' | 'admin'
  displayName: string
}

const testUsers: TestUser[] = [
  {
    email: process.env.PLAYRIGHT_USER || 'playright@example.com',
    password: process.env.PLAYRIGHT_PASSWORD || 'playright',
    role: 'guest',
    displayName: 'Playwright Test User',
  },
  {
    email: process.env.STAFF_USER || 'staff@example.com',
    password: process.env.STAFF_PASSWORD || 'staffpassword',
    role: 'staff',
    displayName: 'Staff Test User',
  },
  {
    email: process.env.MANAGER_USER || 'manager@example.com',
    password: process.env.MANAGER_PASSWORD || 'managerpassword',
    role: 'manager',
    displayName: 'Manager Test User',
  },
]

async function setupTestUser(testUser: TestUser) {
  try {
    console.log(`\n🔧 Setting up user: ${testUser.email}`)

    // Try to get existing user
    let user
    try {
      user = await auth.getUserByEmail(testUser.email)
      console.log(`  ✓ User already exists in Auth: ${user.uid}`)
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create user in Firebase Auth
        user = await auth.createUser({
          email: testUser.email,
          password: testUser.password,
          displayName: testUser.displayName,
          emailVerified: true,
        })
        console.log(`  ✓ Created user in Auth: ${user.uid}`)
      } else {
        throw error
      }
    }

    // Create/update user document in Firestore
    const userDocRef = db.collection('users').doc(user.uid)
    const userDoc = await userDocRef.get()

    const userData = {
      email: testUser.email,
      role: testUser.role,
      displayName: testUser.displayName,
      createdAt: userDoc.exists ? (userDoc.data()?.createdAt || new Date()) : new Date(),
      updatedAt: new Date(),
      emailVerified: true,
    }

    await userDocRef.set(userData, { merge: true })
    console.log(`  ✓ Created/updated Firestore document with role: ${testUser.role}`)

    return { success: true, uid: user.uid, email: testUser.email, role: testUser.role }
  } catch (error: any) {
    console.error(`  ✗ Error setting up ${testUser.email}:`, error.message)
    return { success: false, email: testUser.email, error: error.message }
  }
}

async function main() {
  console.log('🚀 Firebase Test User Setup')
  console.log('=' .repeat(50))
  console.log(`Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`)

  const results = []

  for (const testUser of testUsers) {
    const result = await setupTestUser(testUser)
    results.push(result)
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log('='.repeat(50))

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log(`\n✓ Successfully set up: ${successful.length}/${results.length} users`)
  successful.forEach((r) => {
    console.log(`  • ${r.email} (${r.role}) - UID: ${r.uid}`)
  })

  if (failed.length > 0) {
    console.log(`\n✗ Failed: ${failed.length}/${results.length} users`)
    failed.forEach((r) => {
      console.log(`  • ${r.email}: ${r.error}`)
    })
  }

  console.log('\n✅ Setup complete!')
  console.log('\nNote: You may need to set GOOGLE_APPLICATION_CREDENTIALS')
  console.log('or authenticate with: firebase login')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})