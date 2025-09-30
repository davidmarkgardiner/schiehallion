// Epic 6: Payment Step Component for Booking Flow
// SCHH-017: Stripe Payment Integration
// SCHH-018: Payment Confirmation Flow
// SCHH-019: Payment Failure Handling

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { StripeProvider } from '@/components/providers/StripeProvider'
import { PaymentForm } from './PaymentForm'
import { PaymentIntentResponse } from '@/lib/payment-service'

interface PaymentStepProps {
  cartSummary: {
    items: any[]
    subtotal: number
    taxes: number
    total: number
    groupDiscount: number
  }
  guestInfo: {
    personalInfo: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
  }
  bookingIds: string[]
  onPaymentSuccess: (paymentIntentId: string) => void
  onPaymentError: (error: string) => void
  onBack: () => void
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  cartSummary,
  guestInfo,
  bookingIds,
  onPaymentSuccess,
  onPaymentError,
  onBack,
}) => {
  const { user } = useAuth()
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    createPaymentIntent()
  }, [])

  const createPaymentIntent = async () => {
    if (!user) {
      setError('Authentication required')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const token = await user.getIdToken()

      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: cartSummary.total / 100, // Convert pence to pounds
          bookingIds,
          guestEmail: guestInfo.personalInfo.email,
          guestName: `${guestInfo.personalInfo.firstName} ${guestInfo.personalInfo.lastName}`,
          checkInDate: cartSummary.items[0]?.checkInDate || new Date().toISOString(),
          checkOutDate: cartSummary.items[0]?.checkOutDate || new Date().toISOString(),
          description: `Hotel booking for ${cartSummary.items.length} room(s)`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment intent')
      }

      setPaymentIntent(data.data)
    } catch (err) {
      console.error('Failed to create payment intent:', err)
      const message = err instanceof Error ? err.message : 'Failed to initialize payment'
      setError(message)
      onPaymentError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Confirm payment on server
      const token = await user?.getIdToken()

      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentIntentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm payment')
      }

      onPaymentSuccess(paymentIntentId)
    } catch (err) {
      console.error('Failed to confirm payment:', err)
      const message = err instanceof Error ? err.message : 'Payment confirmation failed'
      setError(message)
      onPaymentError(message)
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    onPaymentError(errorMessage)
  }

  const handleRetryPayment = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      createPaymentIntent()
    } else {
      setError('Maximum retry attempts reached. Please contact support.')
    }
  }

  const formatPrice = (priceInPence: number): string => {
    return `£${(priceInPence / 100).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-4"></div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Preparing Payment
            </h2>
            <p className="text-slate-300">
              Setting up secure payment processing...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !paymentIntent) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold text-white mb-4">
              Payment Setup Failed
            </h2>

            <p className="text-slate-300 mb-6">{error}</p>

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 py-3 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition"
              >
                Go Back
              </button>
              {retryCount < maxRetries && (
                <button
                  onClick={handleRetryPayment}
                  className="flex-1 py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition"
                >
                  Retry ({maxRetries - retryCount} attempts left)
                </button>
              )}
            </div>

            {retryCount >= maxRetries && (
              <div className="mt-4 p-4 rounded-xl bg-amber-500/20 border border-amber-500/30">
                <p className="text-amber-300 text-sm">
                  Need help? Contact our reservations team at{' '}
                  <a href="mailto:reservations@schiehallion.co.uk" className="underline">
                    reservations@schiehallion.co.uk
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Complete Your Booking
        </h2>

        {/* Booking Summary */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium text-white">Booking Summary</h3>

          {cartSummary.items.map((item, index) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-white font-medium capitalize">
                    {item.room.type} Room - {item.room.roomNumber}
                  </h4>
                  <p className="text-slate-400 text-sm">
                    {new Date(item.checkInDate).toLocaleDateString()} - {new Date(item.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-emerald-300 font-medium">
                  {formatPrice(item.totalCost)}
                </span>
              </div>
              <div className="text-sm text-slate-400">
                {item.numberOfNights} nights • {item.guests} guests • {item.packageOption.name}
              </div>
            </div>
          ))}

          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span>{formatPrice(cartSummary.subtotal)}</span>
            </div>
            {cartSummary.groupDiscount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Group Discount:</span>
                <span>-{formatPrice(cartSummary.groupDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>VAT (10%):</span>
              <span>{formatPrice(cartSummary.taxes)}</span>
            </div>
            <div className="flex justify-between text-xl font-semibold text-white border-t border-white/10 pt-2">
              <span>Total:</span>
              <span>{formatPrice(cartSummary.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        {paymentIntent && paymentIntent.clientSecret && (
          <StripeProvider clientSecret={paymentIntent.clientSecret}>
            <PaymentForm
              clientSecret={paymentIntent.clientSecret}
              amount={cartSummary.total / 100} // Convert to pounds
              currency="gbp"
              guestEmail={guestInfo.personalInfo.email}
              guestName={`${guestInfo.personalInfo.firstName} ${guestInfo.personalInfo.lastName}`}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onProcessing={setIsProcessing}
            />
          </StripeProvider>
        )}

        {/* Back Button */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="py-3 px-6 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition disabled:opacity-50"
          >
            Back to Package Selection
          </button>
        </div>
      </div>
    </div>
  )
}