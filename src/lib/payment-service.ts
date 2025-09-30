// Epic 6: Payment Service for Stripe Integration
// SCHH-017: Payment Intent Creation and Processing
// SCHH-018: Payment Confirmation Flow
// SCHH-019: Payment Failure Handling

import { getStripeServer, formatAmountForStripe, PaymentMetadata, convertStripeStatus } from './stripe'
import { BookingService } from './firebase/hotel-service'
import Stripe from 'stripe'

export interface CreatePaymentIntentRequest {
  amount: number // in pounds
  currency?: string
  bookingIds: string[]
  guestUserId: string
  guestEmail: string
  guestName: string
  checkInDate: string
  checkOutDate: string
  description?: string
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  status: string
}

export interface PaymentConfirmation {
  paymentIntentId: string
  status: 'succeeded' | 'failed' | 'requires_action'
  bookingIds: string[]
  amount: number
  errorMessage?: string
}

export class PaymentService {
  /**
   * Create a payment intent for hotel booking
   */
  static async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    try {
      // Get the Stripe instance with proper error handling
      const stripe = getStripeServer()

      const amount = formatAmountForStripe(request.amount)

      const metadata: Record<string, string> = {
        bookingIds: request.bookingIds.join(','),
        guestUserId: request.guestUserId,
        totalRooms: request.bookingIds.length.toString(),
        checkInDate: request.checkInDate,
        checkOutDate: request.checkOutDate,
        guestEmail: request.guestEmail,
        guestName: request.guestName,
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: request.currency || 'gbp',
        payment_method_types: ['card'],
        capture_method: 'automatic',
        confirmation_method: 'automatic',
        metadata,
        description: request.description || `Hotel booking for ${request.guestName}`,
        receipt_email: request.guestEmail,
        // Enable 3D Secure (SCA) for EU compliance
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
      })

      if (!paymentIntent.client_secret) {
        throw new Error('Failed to create payment intent: client_secret is missing')
      }

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }
    } catch (error) {
      console.error('Failed to create payment intent:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create payment intent'
      )
    }
  }

  /**
   * Retrieve payment intent status
   */
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const stripe = getStripeServer()
      return await stripe.paymentIntents.retrieve(paymentIntentId)
    } catch (error) {
      console.error('Failed to retrieve payment intent:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to retrieve payment intent'
      )
    }
  }

  /**
   * Confirm payment and update booking status
   */
  static async confirmPayment(
    paymentIntentId: string
  ): Promise<PaymentConfirmation> {
    try {
      const paymentIntent = await this.getPaymentIntent(paymentIntentId)

      if (!paymentIntent.metadata) {
        throw new Error('Payment intent missing metadata')
      }

      const bookingIds = paymentIntent.metadata.bookingIds.split(',')
      const status = convertStripeStatus(paymentIntent.status)

      if (paymentIntent.status === 'succeeded') {
        // Update booking payment status
        await this.updateBookingPaymentStatus(bookingIds, {
          status: 'completed',
          paymentIntentId,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          paidAt: new Date(),
        })
      } else if (paymentIntent.status === 'canceled') {
        // Update booking to failed payment
        await this.updateBookingPaymentStatus(bookingIds, {
          status: 'failed',
          paymentIntentId,
          failureReason: 'Payment failed',
          failedAt: new Date(),
        })
      }

      return {
        paymentIntentId,
        status: status as 'succeeded' | 'failed' | 'requires_action',
        bookingIds,
        amount: paymentIntent.amount / 100, // Convert back to pounds
        errorMessage: status === 'failed' ? 'Payment failed' : undefined,
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to confirm payment'
      )
    }
  }

  /**
   * Handle failed payment and provide retry options
   */
  static async handleFailedPayment(
    paymentIntentId: string,
    bookingIds: string[]
  ): Promise<{ retryUrl?: string; supportContact: string; roomHoldExpiry: Date }> {
    try {
      // Hold rooms for 15 minutes
      const roomHoldExpiry = new Date(Date.now() + 15 * 60 * 1000)

      // Update booking status to payment-failed with hold
      await this.updateBookingPaymentStatus(bookingIds, {
        status: 'payment-failed',
        paymentIntentId,
        failureReason: 'Payment processing failed',
        failedAt: new Date(),
        roomHoldExpiry,
      })

      return {
        retryUrl: `/booking/payment/retry?payment_intent=${paymentIntentId}`,
        supportContact: 'reservations@schiehallion.co.uk',
        roomHoldExpiry,
      }
    } catch (error) {
      console.error('Failed to handle payment failure:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to handle payment failure'
      )
    }
  }

  /**
   * Process refund for booking cancellation
   */
  static async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const stripe = getStripeServer()

      const refundParams: any = {
        payment_intent: paymentIntentId,
        metadata: {
          refundedAt: new Date().toISOString(),
        },
      }

      if (amount) {
        refundParams.amount = formatAmountForStripe(amount)
      }

      if (reason) {
        refundParams.reason = reason as 'duplicate' | 'fraudulent' | 'requested_by_customer'
      }

      const refund = await stripe.refunds.create(refundParams)

      return refund
    } catch (error) {
      console.error('Failed to process refund:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to process refund'
      )
    }
  }

  /**
   * Update booking payment status in database
   */
  private static async updateBookingPaymentStatus(
    bookingIds: string[],
    paymentUpdate: {
      status: string
      paymentIntentId?: string
      amount?: number
      currency?: string
      paidAt?: Date
      failureReason?: string
      failedAt?: Date
      roomHoldExpiry?: Date
    }
  ): Promise<void> {
    try {
      // Note: This method currently logs payment updates but doesn't persist them
      // to avoid Firebase permissions issues when called from server-side API routes.
      // Payment status updates should be handled via webhooks which have proper admin access.

      const bookingStatus = paymentUpdate.status === 'completed' ? 'confirmed' :
                           paymentUpdate.status === 'failed' ? 'cancelled' : 'pending'

      console.log('Payment status update needed:', {
        bookingIds,
        paymentStatus: paymentUpdate.status,
        bookingStatus,
        paymentIntentId: paymentUpdate.paymentIntentId
      })

      // TODO: Implement admin SDK-based update or handle via webhook
      // For now, bookings remain in 'pending-payment' status until webhook processes them
    } catch (error) {
      console.error('Failed to update booking payment status:', error)
      throw error
    }
  }

  /**
   * Generate payment receipt data
   */
  static async generateReceipt(
    paymentIntentId: string
  ): Promise<{
    receiptNumber: string
    paymentDetails: any
    bookingDetails: any[]
    totalAmount: number
    currency: string
    paidAt: Date
  }> {
    try {
      const paymentIntent = await this.getPaymentIntent(paymentIntentId)

      if (!paymentIntent.metadata) {
        throw new Error('Payment intent missing metadata')
      }

      const bookingIds = paymentIntent.metadata.bookingIds.split(',')
      const bookingDetails = await Promise.all(
        bookingIds.map(id => BookingService.getBooking(id))
      )

      return {
        receiptNumber: `SCH-${paymentIntentId.slice(-8).toUpperCase()}`,
        paymentDetails: {
          paymentIntentId,
          method: 'card',
          // Note: charges data available after successful payment
          last4: undefined,
          brand: undefined,
        },
        bookingDetails: bookingDetails.filter(Boolean),
        totalAmount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        paidAt: new Date(paymentIntent.created * 1000),
      }
    } catch (error) {
      console.error('Failed to generate receipt:', error)
      throw new Error(
        error instanceof Error ? error.message : 'Failed to generate receipt'
      )
    }
  }
}