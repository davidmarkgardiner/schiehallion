// Epic 6: Stripe Configuration and Client Setup
// SCHH-017: Stripe Payment Integration

import { loadStripe, Stripe } from '@stripe/stripe-js'
import StripeLib from 'stripe'

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set')
      throw new Error('Stripe publishable key is missing. Please check your environment configuration.')
    }

    if (!publishableKey.startsWith('pk_')) {
      console.error('Invalid Stripe publishable key format:', publishableKey.substring(0, 10) + '...')
      throw new Error('Invalid Stripe publishable key format. Must start with "pk_".')
    }

    console.log('Initializing Stripe with key:', publishableKey.substring(0, 20) + '...')
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Server-side Stripe instance
const secretKey = process.env.STRIPE_SECRET_KEY

if (typeof window === 'undefined' && secretKey && !secretKey.startsWith('sk_')) {
  console.error('Invalid Stripe secret key format. Must start with "sk_".')
}

// Only create Stripe instance if we have a secret key
let stripeInstance: StripeLib | null = null

export const getStripeServer = (): StripeLib => {
  if (!stripeInstance) {
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set. Cannot initialize server-side Stripe.')
    }

    stripeInstance = new StripeLib(secretKey, {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    })
  }
  return stripeInstance
}

// Legacy export for backward compatibility - only use this in server-side code where key is guaranteed
export const stripe = (() => {
  // Only create instance on server side and when secret key is available
  if (typeof window !== 'undefined') {
    return null // Client side should not use this
  }

  if (!secretKey) {
    return null // No secret key available
  }

  return new StripeLib(secretKey, {
    apiVersion: '2025-08-27.basil',
    typescript: true,
  })
})()

// Stripe webhook configuration
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

// Payment configuration
export const PAYMENT_CONFIG = {
  currency: 'gbp',
  paymentMethods: ['card'],
  captureMethod: 'automatic' as const,
  confirmationMethod: 'automatic' as const,
  // Enable 3D Secure for compliance
  setupFutureUsage: 'off_session' as const,
} as const

// Helper function to format amounts for Stripe (convert pounds to pence)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100)
}

// Helper function to format amounts for display (convert pence to pounds)
export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100
}

// Payment intent metadata structure
export interface PaymentMetadata {
  bookingIds: string
  guestUserId: string
  totalRooms: string
  checkInDate: string
  checkOutDate: string
  guestEmail: string
  guestName: string
}

// Error types for payment processing
export interface StripeError {
  type: string
  code?: string
  message: string
  param?: string
}

export const isStripeError = (error: any): error is StripeError => {
  return error && typeof error.type === 'string'
}

// Payment status types
export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'requires_action'
  | 'requires_payment_method'

// Convert Stripe payment intent status to our payment status
export const convertStripeStatus = (stripeStatus: string): PaymentStatus => {
  switch (stripeStatus) {
    case 'succeeded':
      return 'succeeded'
    case 'processing':
      return 'processing'
    case 'requires_payment_method':
      return 'requires_payment_method'
    case 'requires_confirmation':
    case 'requires_action':
      return 'requires_action'
    case 'canceled':
      return 'canceled'
    default:
      return 'failed'
  }
}
