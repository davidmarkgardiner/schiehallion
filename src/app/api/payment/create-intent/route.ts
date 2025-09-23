// Epic 6: Create Payment Intent API Route
// SCHH-017: Stripe Payment Integration

import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/lib/payment-service'
import { adminAuth } from '@/lib/firebase-admin'

interface CreatePaymentIntentBody {
  amount: number
  bookingIds: string[]
  guestEmail: string
  guestName: string
  checkInDate: string
  checkOutDate: string
  description?: string
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
    const body: CreatePaymentIntentBody = await request.json()
    
    // Validate required fields
    if (!body.amount || !body.bookingIds?.length || !body.guestEmail || !body.guestName) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, bookingIds, guestEmail, guestName' },
        { status: 400 }
      )
    }

    // Validate amount is positive
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent({
      amount: body.amount,
      bookingIds: body.bookingIds,
      guestUserId: decodedToken.uid,
      guestEmail: body.guestEmail,
      guestName: body.guestName,
      checkInDate: body.checkInDate,
      checkOutDate: body.checkOutDate,
      description: body.description,
    })

    return NextResponse.json({
      success: true,
      data: paymentIntent,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
