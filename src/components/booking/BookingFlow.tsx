// Epic 5: Complete Booking Flow Component
// Integration of all SCHH-013, SCHH-014, SCHH-015, SCHH-016

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCartStore } from '@/store/cartStore'
import { BookingService } from '@/lib/firebase/hotel-service'
import {
  Booking,
  BookingFlowState,
  GuestFormData,
  GuestPreferenceProfileSnapshot,
  PackageType
} from '@/types/hotel'
import type { BookingHistoryEntry, SuggestionContext, TravelPurpose } from '@/types/personalization'
import { Timestamp } from 'firebase/firestore'

import ShoppingCart from './ShoppingCart'
import GuestInfoForm from './GuestInfoForm'
import PackageSelection from './PackageSelection'
import RoomSelectionPanel from './RoomSelectionPanel'
import { PaymentStep } from '@/components/payment/PaymentStep'
import { PersonalizationPanel } from './PersonalizationPanel'
import LoginForm from '@/components/LoginForm'

interface BookingFlowProps {
  initialStep?: BookingFlowState['currentStep']
  availableRooms?: any[]
}

const BookingFlow: React.FC<BookingFlowProps> = ({
  initialStep = 'room-selection',
  availableRooms = []
}) => {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const { getCartSummary, clearCart, items, updateItem } = useCartStore()

  const [currentStep, setCurrentStep] = useState<BookingFlowState['currentStep']>(initialStep)
  const [guestInfo, setGuestInfo] = useState<GuestFormData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingReference, setBookingReference] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [bookingIds, setBookingIds] = useState<string[]>([])
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('room-only')
  const [bookingHistory, setBookingHistory] = useState<BookingHistoryEntry[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)

  const sanitizeList = (values?: string[]): string[] =>
    (values || []).map(value => value.trim()).filter(Boolean)

  const buildPreferenceSnapshot = (
    preferences: GuestFormData['preferences']
  ): GuestPreferenceProfileSnapshot => ({
    tripPurpose: preferences.tripPurpose,
    stayGoals: sanitizeList(preferences.stayGoals),
    experienceInterests: sanitizeList(preferences.experienceInterests),
    roomComforts: sanitizeList(preferences.roomComforts),
    stayOccasion: preferences.stayOccasion?.trim() || undefined,
    personalizationOptIn: preferences.personalizationOptIn,
    marketingOptIn: preferences.marketingOptIn,
    communicationPreference: preferences.communicationPreference,
    budgetPreference: preferences.budgetPreference,
    capturedAt: new Date().toISOString()
  })

  const derivePackageType = useCallback((booking: Booking): PackageType => {
    if (booking.packageType) {
      return booking.packageType
    }

    const additionalChargeLabels = Object.keys(booking.additionalCharges || {}).map(label =>
      label.toLowerCase()
    )

    if (additionalChargeLabels.some(label => label.includes('half') || label.includes('dinner'))) {
      return 'half-board'
    }

    if (additionalChargeLabels.some(label => label.includes('breakfast'))) {
      return 'bed-breakfast'
    }

    return 'room-only'
  }, [])

  const transformBookingToHistoryEntry = useCallback(
    (booking: Booking): BookingHistoryEntry => {
      const packageType = derivePackageType(booking)
      const addOns = Object.keys(booking.additionalCharges || {})
      const checkInDate = booking.checkInDate instanceof Timestamp
        ? booking.checkInDate.toDate().toISOString()
        : new Date(String(booking.checkInDate)).toISOString()

      const travelPurpose =
        booking.personalizationSnapshot?.tripPurpose ||
        booking.guestInfo.preferenceProfile?.tripPurpose ||
        'leisure'

      return {
        bookingId: booking.id,
        checkInDate,
        nights: booking.numberOfNights,
        roomType: booking.roomType || booking.room?.type || 'standard',
        packageType,
        spend: booking.totalAmount,
        travelPurpose: travelPurpose as TravelPurpose,
        addOns,
        occupancy: booking.totalGuests,
        wasUpsold: packageType !== 'room-only' || addOns.length > 0
      }
    },
    [derivePackageType]
  )

  const refreshBookingHistory = useCallback(async () => {
    if (!user?.uid) {
      setBookingHistory([])
      return
    }

    try {
      const bookings = await BookingService.getBookings({ guestUserId: user.uid })

      const uniqueEntries = bookings
        .map(transformBookingToHistoryEntry)
        .reduce<BookingHistoryEntry[]>((acc, entry) => {
          if (!acc.some(existing => existing.bookingId === entry.bookingId)) {
            acc.push(entry)
          }
          return acc
        }, [])

      setBookingHistory(uniqueEntries)
    } catch (historyError) {
      console.warn('Failed to load booking history for personalization', historyError)
    }
  }, [transformBookingToHistoryEntry, user?.uid])

  const cartSummary = getCartSummary()

  useEffect(() => {
    if (items.length && items[0].packageType !== selectedPackage) {
      setSelectedPackage(items[0].packageType)
    }
  }, [items, selectedPackage])

  useEffect(() => {
    refreshBookingHistory()
  }, [refreshBookingHistory])

  // Auto-close login modal and proceed after user logs in
  useEffect(() => {
    if (user && showLoginModal) {
      setShowLoginModal(false)
      setCurrentStep('guest-info')
      setShowCart(false)
    }
  }, [user, showLoginModal])

  const suggestionContext = useMemo<SuggestionContext>(() => {
    const firstItem = items[0]
    const accountPreferences = userProfile?.preferences
    const totalGuests = items.reduce((sum, item) => sum + item.guests, 0)
    const formStayOccasion = guestInfo?.preferences.stayOccasion?.trim()
    const stayOccasion = formStayOccasion || accountPreferences?.specialOccasions?.[0]?.trim()
    const wantsLateCheckout = guestInfo?.preferences.specialRequests
      ? guestInfo.preferences.specialRequests.toLowerCase().includes('late check')
      : false

    const travelPurpose =
      guestInfo?.preferences.tripPurpose || accountPreferences?.travelPurpose || 'leisure'
    const budgetSensitivity =
      guestInfo?.preferences.budgetPreference ||
      accountPreferences?.budgetPreference ||
      'balanced'

    return {
      stayLength: firstItem?.numberOfNights || 1,
      travelPurpose,
      companions: totalGuests || 1,
      budgetSensitivity,
      stayOccasion: stayOccasion || undefined,
      isReturningGuest: Boolean(user?.uid && (bookingHistory.length > 0 || accountPreferences || guestInfo)),
      checkInMonth: firstItem?.checkInDate
        ? new Date(firstItem.checkInDate).getMonth() + 1
        : undefined,
      wantsLateCheckout
    }
  }, [
    bookingHistory.length,
    guestInfo,
    items,
    user,
    userProfile?.preferences
  ])

  // Auto-advance to guest info if cart has items
  useEffect(() => {
    if (currentStep === 'room-selection' && cartSummary.itemCount > 0) {
      // Don't auto-advance, let user decide when to proceed
    }
  }, [cartSummary.itemCount, currentStep])

  const handlePackageChange = (packageType: PackageType) => {
    setSelectedPackage(packageType)
    if (items.length) {
      updateItem(items[0].id, { packageType })
    }
  }

  const handleProceedToGuestInfo = () => {
    if (cartSummary.itemCount === 0) {
      setError('Please add at least one room to your cart before proceeding.')
      return
    }

    // Require login before proceeding to guest info
    if (!user) {
      setShowLoginModal(true)
      return
    }

    setCurrentStep('guest-info')
    setShowCart(false)
  }

  const handleGuestInfoSubmit = (data: GuestFormData) => {
    setGuestInfo(data)
    setCurrentStep('package-selection')
  }

  const handlePackageSelectionComplete = async () => {
    // Create bookings before payment
    if (!user || !guestInfo || cartSummary.itemCount === 0) {
      setError('Missing required information for booking.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const createdBookingIds = []
      const preferenceSnapshot = buildPreferenceSnapshot(guestInfo.preferences)

      // Create bookings in pending-payment status
      for (const item of cartSummary.items) {
        const shouldStoreSnapshot = guestInfo.preferences.personalizationOptIn
        const bookingPreferenceSnapshot: GuestPreferenceProfileSnapshot | undefined = shouldStoreSnapshot
          ? { ...preferenceSnapshot }
          : undefined

        const bookingData = {
          guestUserId: user.uid,
          guestInfo: {
            firstName: guestInfo.personalInfo.firstName,
            lastName: guestInfo.personalInfo.lastName,
            email: guestInfo.personalInfo.email,
            phone: guestInfo.personalInfo.phone,
            dateOfBirth: guestInfo.personalInfo.dateOfBirth
              ? (() => {
                  const date = new Date(guestInfo.personalInfo.dateOfBirth)
                  return isNaN(date.getTime()) ? undefined : Timestamp.fromDate(date)
                })()
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
            } : undefined,
            ...(bookingPreferenceSnapshot && { preferenceProfile: bookingPreferenceSnapshot })
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
          packageType: item.packageType,
          roomType: item.room.type,
          ...(bookingPreferenceSnapshot && { personalizationSnapshot: bookingPreferenceSnapshot }),
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
            notes: 'Booking created, awaiting payment'
          }],
          checkInTime: guestInfo.arrival.estimatedArrivalTime
            ? (() => {
                const date = new Date(`${item.checkInDate} ${guestInfo.arrival.estimatedArrivalTime}`)
                return isNaN(date.getTime()) ? undefined : Timestamp.fromDate(date)
              })()
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
        createdBookingIds.push(bookingId)
      }

      setBookingIds(createdBookingIds)
      await refreshBookingHistory()
      setCurrentStep('payment')
    } catch (err) {
      console.error('Booking creation failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking. Please try again.'
      setError(errorMessage)

      // If it's an availability error, navigate back to room selection
      if (errorMessage.includes('not available')) {
        setTimeout(() => {
          setCurrentStep('room-selection')
          setError('The selected room is no longer available. Please choose another room or different dates.')
        }, 3000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentIdReceived: string) => {
    console.log('BookingFlow: handlePaymentSuccess called with:', paymentIntentIdReceived)
    console.log('BookingFlow: bookingIds:', bookingIds)

    setPaymentIntentId(paymentIntentIdReceived)

    // Generate a group booking reference if multiple bookings
    const groupReference = bookingIds.length > 1
      ? `SCH-GROUP-${Date.now()}`
      : `SCH-${bookingIds[0].substring(0, 8).toUpperCase()}`

    console.log('BookingFlow: setting booking reference:', groupReference)
    setBookingReference(groupReference)

    console.log('BookingFlow: changing step to confirmation')
    setCurrentStep('confirmation')

    // Clear the cart after successful payment
    console.log('BookingFlow: clearing cart')
    clearCart()
    console.log('BookingFlow: payment success handler completed')
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
    // Optionally redirect to error page
    router.push(`/booking/payment/failed?error=${encodeURIComponent(errorMessage)}&payment_intent=${paymentIntentId || ''}`)
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
              <h1 className="text-4xl font-semibold text-lundies-charcoal mb-4">
                Build Your Perfect Stay
              </h1>
              <p className="text-lg text-lundies-peat max-w-2xl mx-auto">
                Select a room, choose your travel dates, and add everything to your cart with a single click.
              </p>
            </div>

            <RoomSelectionPanel
              availableRooms={availableRooms}
              initialGuests={2}
            />

            {cartSummary.itemCount > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setShowCart(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-lundies-heather px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-lundies-charcoal transition hover:bg-lundies-heather/80"
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
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="space-y-8">
              {error && (
                <div className="rounded-xl border border-red-300 bg-red-50 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium text-red-900">{error}</p>
                      {error.includes('not available') && (
                        <p className="text-sm text-red-700 mt-1">
                          Redirecting you to room selection in a moment...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <PackageSelection
                selectedPackage={selectedPackage}
                onPackageChange={handlePackageChange}
                basePrice={items[0]?.roomRate || cartSummary.items[0]?.roomRate || 0}
                numberOfNights={items[0]?.numberOfNights || cartSummary.items[0]?.numberOfNights || 1}
                showTerms={true}
                onTermsAccept={handlePackageSelectionComplete}
              />
            </div>
            <PersonalizationPanel
              userId={user?.uid}
              suggestionContext={suggestionContext}
              selectedPackage={selectedPackage}
              onSelectPackage={handlePackageChange}
              guestPreferences={guestInfo?.preferences}
              accountPreferences={userProfile?.preferences || undefined}
              bookingHistory={bookingHistory}
            />
          </div>
        )

      case 'payment':
        return (
          <PaymentStep
            cartSummary={cartSummary}
            guestInfo={guestInfo!}
            bookingIds={bookingIds}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onBack={() => setCurrentStep('package-selection')}
          />
        )

      case 'confirmation':
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="rounded-3xl border border-lundies-stone/60 bg-white/90 backdrop-blur-sm p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-lundies-heather flex items-center justify-center">
                <svg className="w-8 h-8 text-lundies-charcoal" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>

              <h2 className="text-3xl font-semibold text-lundies-charcoal mb-4">
                Booking Confirmed!
              </h2>

              <p className="text-lg text-lundies-peat mb-6">
                Thank you for choosing Schiehallion Hotel. Your Highland getaway awaits!
              </p>

              {bookingReference && (
                <div className="rounded-xl border border-lundies-heather/40 bg-lundies-heather/20 p-4 mb-6">
                  <p className="text-lundies-moss font-medium">
                    Booking Reference: {bookingReference}
                  </p>
                </div>
              )}

              <div className="space-y-4 mb-8 text-left">
                <p className="text-lundies-stone">
                  ✓ Confirmation email sent to {guestInfo?.personalInfo.email}
                </p>
                <p className="text-lundies-stone">
                  ✓ Booking details saved to your account
                </p>
                <p className="text-lundies-stone">
                  ✓ Payment processed successfully
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/bookings')}
                  className="flex-1 py-3 rounded-full border border-lundies-stone/70 text-lundies-charcoal hover:bg-white/70 transition"
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
                  className="flex-1 py-3 rounded-full bg-lundies-heather text-lundies-charcoal font-semibold hover:bg-lundies-heather/80 transition"
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

  return (
    <main className="relative overflow-hidden bg-lundies-ivory text-lundies-charcoal min-h-screen">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-lundies-heather/30 blur-[160px]" />
        <div className="absolute right-[-10%] top-1/3 h-[24rem] w-[24rem] rounded-full bg-lundies-sand/40 blur-[180px]" />
      </div>

      {/* Header */}
      <header className="border-b border-lundies-stone/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a href="/" className="font-semibold tracking-wide text-lundies-charcoal">
                Schiehallion Hotel
              </a>
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <a href="/#rooms" className="text-lundies-peat hover:text-lundies-charcoal transition-colors">Overview</a>
                <a href="/rooms" className="text-lundies-peat hover:text-lundies-charcoal transition-colors">Rooms</a>
                <span className="text-lundies-moss font-medium">Booking</span>
              </div>
            </div>

            {/* Cart indicator */}
            {cartSummary.itemCount > 0 && currentStep === 'room-selection' && (
              <button
                onClick={() => setShowCart(true)}
                className="relative rounded-full bg-lundies-heather/20 border border-lundies-heather/40 px-4 py-2 text-lundies-moss hover:bg-lundies-heather/30 transition"
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

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-lundies-stone/60 bg-white/95 p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="absolute right-4 top-4 rounded-full border border-lundies-stone/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-lundies-charcoal transition hover:bg-lundies-stone/30"
              aria-label="Close login"
            >
              Close
            </button>
            <div className="text-center">
              <h2 className="text-2xl text-lundies-charcoal">Sign in to continue booking</h2>
              <p className="mt-2 text-sm text-lundies-peat">Please sign in or create an account to proceed with your booking.</p>
            </div>
            <LoginForm />
          </div>
        </div>
      )}
    </main>
  )
}

export default BookingFlow