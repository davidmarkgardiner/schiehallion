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
import DragDropCalendar from './DragDropCalendar'
import { PaymentStep } from '@/components/payment/PaymentStep'
import { PersonalizationPanel } from './PersonalizationPanel'

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
        createdBookingIds.push(bookingId)
      }

      setBookingIds(createdBookingIds)
      await refreshBookingHistory()
      setCurrentStep('payment')
    } catch (err) {
      console.error('Booking creation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to create booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (paymentIntentIdReceived: string) => {
    setPaymentIntentId(paymentIntentIdReceived)

    // Generate a group booking reference if multiple bookings
    const groupReference = bookingIds.length > 1
      ? `SCH-GROUP-${Date.now()}`
      : await BookingService.getBooking(bookingIds[0]).then(booking => booking?.bookingReference)

    setBookingReference(groupReference || bookingIds[0])
    setCurrentStep('confirmation')

    // Clear the cart after successful payment
    clearCart()
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
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div className="space-y-8">
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