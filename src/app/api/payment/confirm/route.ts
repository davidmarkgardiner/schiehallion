// Epic 6: Confirm Payment API Route
// SCHH-018: Payment Confirmation Flow

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'
import { adminAuth } from '@/lib/firebase-admin'

interface ConfirmPaymentBody {
  paymentIntentId: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decodedToken
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: ConfirmPaymentBody = await request.json()
    
    // Validate required fields
    if (!body.paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required field: paymentIntentId' },
        { status: 400 }
      )
    }

    // Confirm payment
    const confirmation = await PaymentService.confirmPayment(body.paymentIntentId)

    return NextResponse.json({
      success: true,
      data: confirmation,
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      {
        error: 'Failed to confirm payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decodedToken
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get payment intent ID from query params
    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('payment_intent_id')
    
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing payment_intent_id parameter' },
        { status: 400 }
      )
    }

    // Get payment intent status
    const paymentIntent = await PaymentService.getPaymentIntent(paymentIntentId)

    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      },
    })
  } catch (error) {
    console.error('Get payment intent error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get payment intent',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
