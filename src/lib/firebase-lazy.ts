// Lazy-loaded Firebase utilities for better code splitting
// Import Firebase modules only when needed to reduce initial bundle size

/**
 * Lazy load Firestore operations
 * Use this for non-critical Firestore queries that don't need to be in the initial bundle
 */
export async function lazyFirestore() {
  const { collection, doc, getDoc, getDocs, query, where, orderBy, limit } = await import('firebase/firestore')
  return { collection, doc, getDoc, getDocs, query, where, orderBy, limit }
}

/**
 * Lazy load Firestore write operations
 * Admin/manager operations that can be code-split
 */
export async function lazyFirestoreWrite() {
  const { addDoc, updateDoc, deleteDoc, writeBatch, runTransaction } = await import('firebase/firestore')
  return { addDoc, updateDoc, deleteDoc, writeBatch, runTransaction }
}

/**
 * Lazy load Realtime Database
 * Only load when real-time features are actually used
 */
export async function lazyRealtimeDB() {
  const { ref, set, get, onValue, update, remove, off } = await import('firebase/database')
  return { ref, set, get, onValue, update, remove, off }
}

/**
 * Lazy load admin services
 * Heavy services like BookingService and RoomService for admin pages only
 */
export async function lazyAdminServices() {
  const { BookingService, RoomService, AvailabilityService } = await import('./firebase/hotel-service')
  return { BookingService, RoomService, AvailabilityService }
}

/**
 * Lazy load restaurant services
 * Only needed on restaurant-specific pages
 */
export async function lazyRestaurantService() {
  const { RestaurantService } = await import('@/services/restaurantService')
  return { RestaurantService }
}
