// Epic 6: Stripe Webhook Handler
// SCHH-018: Payment Confirmation Flow
// SCHH-019: Payment Failure Handling

import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { PaymentService } from '@/lib/payment-service'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json(
      { error: 'Webhook configuration error' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        
        // Confirm payment and update bookings
        await PaymentService.confirmPayment(paymentIntent.id)
        
        // TODO: Send confirmation email
        // TODO: Generate PDF receipt
        // TODO: Send calendar invite
        
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment failed:', paymentIntent.id)
        
        if (paymentIntent.metadata) {
          const bookingIds = paymentIntent.metadata.bookingIds.split(',')
          await PaymentService.handleFailedPayment(paymentIntent.id, bookingIds)
        }
        
        break
      }

      case 'payment_intent.requires_action': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment requires action (3D Secure):', paymentIntent.id)
        
        // Payment is waiting for 3D Secure authentication
        // Client will handle this via Stripe Elements
        
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment canceled:', paymentIntent.id)
        
        if (paymentIntent.metadata) {
          const bookingIds = paymentIntent.metadata.bookingIds.split(',')
          await PaymentService.handleFailedPayment(paymentIntent.id, bookingIds)
        }
        
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        console.log('Dispute created:', dispute.id)
        
        // TODO: Handle dispute notification
        // TODO: Send alert to admin
        
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
