// Epic 6: Payment Form Component with Stripe Elements
// SCHH-017: Stripe Payment Integration
// SCHH-018: Payment Confirmation Flow
// SCHH-019: Payment Failure Handling

'use client'

import { useState, useEffect } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
  AddressElement,
} from '@stripe/react-stripe-js'
import { useAuth } from '@/context/AuthContext'

interface PaymentFormProps {
  clientSecret: string
  amount: number
  currency: string
  guestEmail: string
  guestName: string
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  onProcessing: (isProcessing: boolean) => void
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  amount,
  currency,
  guestEmail,
  guestName,
  onSuccess,
  onError,
  onProcessing,
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!stripe) return

    // Check if payment already succeeded
    const paymentIntentId = clientSecret.split('_secret_')[0]
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      }
    })
  }, [stripe, clientSecret, onSuccess])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet. Please try again.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    onProcessing(true)

    try {
      // Confirm payment with Stripe
      // Note: setup_future_usage removed - must be set during PaymentIntent creation, not confirmation
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/payment/success`,
          receipt_email: guestEmail,
          payment_method_data: {
            billing_details: {
              email: guestEmail,
              name: guestName,
            },
          },
        },
        redirect: 'if_required',
      })

      if (error) {
        // Payment failed or requires action
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message || 'Payment failed')
          onError(error.message || 'Payment failed')
        } else {
          setErrorMessage('An unexpected error occurred.')
          onError('An unexpected error occurred.')
        }
      } else if (paymentIntent) {
        // Payment succeeded
        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent.id)
        } else if (paymentIntent.status === 'requires_action') {
          // 3D Secure authentication required
          // Stripe will handle this automatically
          setErrorMessage('Please complete the authentication and try again.')
        } else {
          setErrorMessage('Payment is being processed. Please wait.')
        }
      }
    } catch (err) {
      console.error('Payment error:', err)
      const message = err instanceof Error ? err.message : 'Payment processing failed'
      setErrorMessage(message)
      onError(message)
    } finally {
      setIsLoading(false)
      onProcessing(false)
    }
  }

  const formatPrice = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-300">Total Amount:</span>
          <span className="text-xl font-semibold text-white">
            {formatPrice(amount, currency)}
          </span>
        </div>
        <div className="text-sm text-slate-400">
          Guest: {guestName} • {guestEmail}
        </div>
      </div>

      {/* Payment Element */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Payment Details
          </label>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <PaymentElement
              options={{
                layout: 'tabs',
                fields: {
                  billingDetails: {
                    email: 'never', // We already have this
                    name: 'never',  // We already have this
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Billing Address
          </label>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <AddressElement
              options={{
                mode: 'billing',
                allowedCountries: ['GB', 'IE', 'US', 'CA', 'AU'],
                fields: {
                  phone: 'always',
                },
                validation: {
                  phone: {
                    required: 'always',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-red-300 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>Your payment is secured by 256-bit SSL encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>PCI DSS compliant payment processing</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className="w-full py-4 rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
            Processing Payment...
          </div>
        ) : (
          `Pay ${formatPrice(amount, currency)}`
        )}
      </button>
    </form>
  )
}