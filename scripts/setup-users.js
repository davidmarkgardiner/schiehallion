#!/usr/bin/env node

/**
 * Firebase User Setup Script
 * Creates admin and test users for the Schiehallion Firebase project
 */

const admin = require("firebase-admin");
require("dotenv").config({ path: ".env.local" });

// Initialize Firebase Admin SDK with default credentials
try {
  admin.initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // This will use Application Default Credentials (ADC)
    // Make sure you're logged in with Firebase CLI: firebase login
  });
  console.log("🔥 Firebase Admin SDK initialized");
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:", error.message);
  process.exit(1);
}

const auth = admin.auth();
const firestore = admin.firestore();

async function createUser(email, password, displayName, isAdmin = false) {
  try {
    console.log(`🔄 Creating user: ${email}`);

    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(email);
      console.log(`✅ User ${email} already exists (UID: ${existingUser.uid})`);
      return existingUser;
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
      // User doesn't exist, continue with creation
    }

    // Create the user
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true,
    });

    console.log(
      `✅ Successfully created user: ${email} (UID: ${userRecord.uid})`,
    );

    // Create user profile document in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isAdmin: isAdmin,
      role: isAdmin ? "admin" : "user",
    };

    await firestore.collection("users").doc(userRecord.uid).set(userProfile);
    console.log(`✅ Created user profile document for ${email}`);

    // Set custom claims for admin user
    if (isAdmin) {
      await auth.setCustomUserClaims(userRecord.uid, {
        admin: true,
        role: "admin",
      });
      console.log(`✅ Set admin claims for ${email}`);
    }

    return userRecord;
  } catch (error) {
    console.error(`❌ Error creating user ${email}:`, error.message);
    throw error;
  }
}

async function setupUsers() {
  console.log("🚀 Starting Firebase user setup...");
  console.log(`📋 Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

  try {
    // Create admin user
    const adminEmail =
      process.env.GITHUB_OWNER || "davidmarkgardiner@gmail.com";
    await createUser(
      adminEmail,
      "temporaryPassword123!", // Admin should reset this
      "David Gardiner",
      true,
    );

    // Create test user for Playwright
    const testEmail = process.env.PLAYRIGHT_USER || "playright@example.com";
    const testPassword = process.env.PLAYRIGHT_PASSWORD || "playright";
    await createUser(testEmail, testPassword, "Playwright Test User", false);

    console.log("🎉 User setup completed successfully!");
    console.log("\n📝 Summary:");
    console.log(`✅ Admin user: ${adminEmail}`);
    console.log(`   - Password: temporaryPassword123! (please change this)`);
    console.log(`   - Has admin privileges`);
    console.log(`✅ Test user: ${testEmail}`);
    console.log(`   - Password: ${testPassword}`);
    console.log(`   - For Playwright testing`);
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  } finally {
    // Clean up
    process.exit(0);
  }
}

// Run the setup
setupUsers();
