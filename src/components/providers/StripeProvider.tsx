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
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-400"></div>
        <span className="ml-2 text-slate-300">Loading payment system...</span>
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
            colorPrimary: '#10B981', // emerald-500
            colorBackground: '#0F172A', // slate-900
            colorText: '#F1F5F9', // slate-100
            colorDanger: '#EF4444', // red-500
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '12px',
          },
          rules: {
            '.Input': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#F1F5F9',
            },
            '.Input:focus': {
              border: '1px solid #10B981',
              boxShadow: '0 0 0 1px #10B981',
            },
            '.Label': {
              color: '#CBD5E1',
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
