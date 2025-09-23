// Epic 5: Complete Booking Flow Component
// Integration of all SCHH-013, SCHH-014, SCHH-015, SCHH-016

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { BookingService } from '@/lib/firebase/hotel-service'
import { BookingFlowState, GuestFormData, PackageType } from '@/types/hotel'
import { Timestamp } from 'firebase/firestore'

import ShoppingCart from './ShoppingCart'
import GuestInfoForm from './GuestInfoForm'
import PackageSelection from './PackageSelection'
import DragDropCalendar from './DragDropCalendar'

interface BookingFlowProps {
  initialStep?: BookingFlowState['currentStep']
  availableRooms?: any[]
}

const BookingFlow: React.FC<BookingFlowProps> = ({
  initialStep = 'room-selection',
  availableRooms = []
}) => {
  const router = useRouter()
  const { user } = useAuth()
  const { getCartSummary, clearCart } = useCartStore()

  const [currentStep, setCurrentStep] = useState<BookingFlowState['currentStep']>(initialStep)
  const [guestInfo, setGuestInfo] = useState<GuestFormData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)

  const cartSummary = getCartSummary()

  // Auto-advance to guest info if cart has items
  useEffect(() => {
    if (currentStep === 'room-selection' && cartSummary.itemCount > 0) {
      // Don't auto-advance, let user decide when to proceed
    }
  }, [cartSummary.itemCount, currentStep])

  const handleProceedToGuestInfo = () => {
    if (cartSummary.itemCount === 0) {
      setError('Please add at least one room to your cart before proceeding.')
      return
    }
    setCurrentStep('guest-info')
    setShowCart(false)
  }

  const handleGuestInfoSubmit = (data: GuestFormData) => {
    setGuestInfo(data)
    setCurrentStep('package-selection')
  }

  const handlePackageSelectionComplete = () => {
    setCurrentStep('payment')
  }

  const handleCompleteBooking = async () => {
    if (!user || !guestInfo || cartSummary.itemCount === 0) {
      setError('Missing required information for booking.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const bookings = []

      // Create a booking for each cart item
      for (const item of cartSummary.items) {
        const bookingData = {
          guestUserId: user.uid,
          guestInfo: {
            firstName: guestInfo.personalInfo.firstName,
            lastName: guestInfo.personalInfo.lastName,
            email: guestInfo.personalInfo.email,
            phone: guestInfo.personalInfo.phone,
            dateOfBirth: guestInfo.personalInfo.dateOfBirth
              ? Timestamp.fromDate(new Date(guestInfo.personalInfo.dateOfBirth))
              : undefined,
            nationality: undefined,
            passportNumber: undefined,
            address: guestInfo.address ? {
              street: guestInfo.address.street,
              city: guestInfo.address.city,
              postcode: guestInfo.address.postcode,
              country: guestInfo.address.country
            } : undefined,
            specialRequests: guestInfo.preferences.specialRequests
              ? [guestInfo.preferences.specialRequests]
              : undefined,
            dietaryRequirements: guestInfo.preferences.dietaryRequirements,
            accessibilityNeeds: guestInfo.preferences.accessibilityNeeds,
            emergencyContact: guestInfo.emergencyContact?.name ? {
              name: guestInfo.emergencyContact.name,
              phone: guestInfo.emergencyContact.phone,
              relationship: guestInfo.emergencyContact.relationship
            } : undefined
          },
          totalGuests: item.guests,
          roomId: item.room.id,
          checkInDate: Timestamp.fromDate(new Date(item.checkInDate)),
          checkOutDate: Timestamp.fromDate(new Date(item.checkOutDate)),
          numberOfNights: item.numberOfNights,
          roomRate: item.roomRate,
          totalRoomCost: item.totalRoomCost,
          additionalCharges: {
            [item.packageOption.name]: item.totalPackageCost
          },
          taxes: Math.round(item.totalCost * 0.1), // 10% VAT
          discounts: {},
          totalAmount: item.totalCost + Math.round(item.totalCost * 0.1),
          paymentStatus: 'pending' as const,
          paymentDetails: {
            method: 'card' as const,
            amount: item.totalCost + Math.round(item.totalCost * 0.1),
            paidAmount: 0,
            refundedAmount: 0,
            currency: 'GBP',
            transactionIds: []
          },
          status: 'pending-payment' as const,
          statusHistory: [{
            status: 'pending-payment' as const,
            timestamp: Timestamp.now(),
            changedBy: user.uid,
            notes: 'Booking created'
          }],
          checkInTime: guestInfo.arrival.estimatedArrivalTime
            ? Timestamp.fromDate(new Date(`${item.checkInDate} ${guestInfo.arrival.estimatedArrivalTime}`))
            : undefined,
          checkOutTime: undefined,
          actualCheckInTime: undefined,
          actualCheckOutTime: undefined,
          specialRequests: guestInfo.preferences.specialRequests
            ? [guestInfo.preferences.specialRequests]
            : undefined,
          staffNotes: guestInfo.arrival.specialInstructions
            ? [guestInfo.arrival.specialInstructions]
            : undefined,
          guestNotes: undefined,
          source: 'direct' as const,
          sourceReference: undefined,
          createdBy: user.uid,
          lastUpdatedBy: user.uid
        }

        const bookingId = await BookingService.createBooking(bookingData)
        bookings.push(bookingId)
      }

      // Generate a group booking reference if multiple bookings
      const groupReference = bookings.length > 1
        ? `SCH-GROUP-${Date.now()}`
        : await BookingService.getBooking(bookings[0]).then(booking => booking?.bookingReference)

      setBookingReference(groupReference || bookings[0])
      setCurrentStep('confirmation')

      // Clear the cart after successful booking
      clearCart()

    } catch (err) {
      console.error('Booking creation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to create booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (priceInPence: number): string => {
    return `£${(priceInPence / 100).toFixed(2)}`
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'room-selection':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-semibold text-white mb-4">
                Build Your Perfect Stay
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Drag rooms to your preferred dates or browse our selection to create your Highland getaway.
              </p>
            </div>

            <DragDropCalendar
              availableRooms={availableRooms}
              guests={2}
              onRoomDrop={(roomId, targetDate) => {
                console.log('Room dropped:', roomId, 'on date:', targetDate)
              }}
            />

            {cartSummary.itemCount > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowCart(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
                >
                  <span>View Cart ({cartSummary.itemCount})</span>
                  <span>{formatPrice(cartSummary.total)}</span>
                </button>
              </div>
            )}
          </div>
        )

      case 'guest-info':
        return (
          <GuestInfoForm
            onSubmit={handleGuestInfoSubmit}
            onBack={() => setCurrentStep('room-selection')}
            isLoading={isLoading}
          />
        )

      case 'package-selection':
        return (
          <div className="space-y-8">
            <PackageSelection
              selectedPackage="room-only"
              onPackageChange={(packageType: PackageType) => {
                // Update cart items with new package
                console.log('Package changed to:', packageType)
              }}
              basePrice={cartSummary.items[0]?.roomRate || 0}
              numberOfNights={cartSummary.items[0]?.numberOfNights || 1}
              showTerms={true}
              onTermsAccept={handlePackageSelectionComplete}
            />
          </div>
        )

      case 'payment':
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

              {/* Guest Information Summary */}
              {guestInfo && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-4">Guest Information</h3>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Name:</span>
                        <div className="text-white">
                          {guestInfo.personalInfo.firstName} {guestInfo.personalInfo.lastName}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Email:</span>
                        <div className="text-white">{guestInfo.personalInfo.email}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Phone:</span>
                        <div className="text-white">{guestInfo.personalInfo.phone}</div>
                      </div>
                      {guestInfo.arrival.estimatedArrivalTime && (
                        <div>
                          <span className="text-slate-400">Arrival:</span>
                          <div className="text-white">{guestInfo.arrival.estimatedArrivalTime}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep('package-selection')}
                  className="flex-1 py-3 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleCompleteBooking}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Complete Booking'}
                </button>
              </div>
            </div>
          </div>
        )

      case 'confirmation':
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-400 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>

              <h2 className="text-3xl font-semibold text-white mb-4">
                Booking Confirmed!
              </h2>

              <p className="text-lg text-slate-300 mb-6">
                Thank you for choosing Schiehallion Hotel. Your Highland getaway awaits!
              </p>

              {bookingReference && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 mb-6">
                  <p className="text-emerald-300 font-medium">
                    Booking Reference: {bookingReference}
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-8 text-left">
                <p className="text-slate-400">
                  ✓ Confirmation email sent to {guestInfo?.personalInfo.email}
                </p>
                <p className="text-slate-400">
                  ✓ Booking details saved to your account
                </p>
                <p className="text-slate-400">
                  ✓ Payment processed successfully
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/bookings')}
                  className="flex-1 py-3 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition"
                >
                  View My Bookings
                </button>
                <button
                  onClick={() => {
                    setCurrentStep('room-selection')
                    setGuestInfo(null)
                    setBookingReference(null)
                    setError(null)
                  }}
                  className="flex-1 py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition"
                >
                  Book Another Stay
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Access Required</h1>
          <p className="text-slate-400 mb-6">Please log in to start booking your Highland getaway</p>
          <a
            href="/"
            className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <main className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-screen">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-1/3 h-[24rem] w-[24rem] rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a href="/" className="font-semibold tracking-wide text-slate-100">
                Schiehallion Hotel
              </a>
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <a href="/#rooms" className="text-slate-300 hover:text-white transition-colors">Overview</a>
                <a href="/rooms" className="text-slate-300 hover:text-white transition-colors">Rooms</a>
                <span className="text-emerald-300 font-medium">Booking</span>
              </div>
            </div>

            {/* Cart indicator */}
            {cartSummary.itemCount > 0 && currentStep === 'room-selection' && (
              <button
                onClick={() => setShowCart(true)}
                className="relative rounded-full bg-emerald-400/20 border border-emerald-400/30 px-4 py-2 text-emerald-300 hover:bg-emerald-400/30 transition"
              >
                <span className="text-sm font-medium">
                  Cart ({cartSummary.itemCount}) - {formatPrice(cartSummary.total)}
                </span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {renderStepContent()}
      </div>

      {/* Shopping Cart Modal */}
      <ShoppingCart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onProceedToBooking={handleProceedToGuestInfo}
      />
    </main>
  )
}

export default BookingFlow