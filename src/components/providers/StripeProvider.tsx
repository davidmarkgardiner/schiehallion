// Epic 6: Stripe Provider Component
// SCHH-017: Stripe Elements Integration

'use client'

import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe'
import { ReactNode, useEffect, useState } from 'react'
import type { Stripe } from '@stripe/stripe-js'

interface StripeProviderProps {
  children: ReactNode
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

  useEffect(() => {
    // Initialize Stripe only on the client-side
    setStripePromise(getStripe())
  }, [])

  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-lundies-heather"></div>
        <span className="ml-2 text-lundies-stone">Loading payment system...</span>
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#8fa089', // lundies-heather
            colorBackground: '#1f1b16', // lundies-charcoal
            colorText: '#f5f1eb', // lundies-ivory
            colorDanger: '#EF4444', // red-500
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '12px',
          },
          rules: {
            '.Input': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f5f1eb',
            },
            '.Input:focus': {
              border: '1px solid #8fa089',
              boxShadow: '0 0 0 1px #8fa089',
            },
            '.Label': {
              color: '#d6cec3',
              fontSize: '14px',
              fontWeight: '500',
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  )
}
