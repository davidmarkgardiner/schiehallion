// Epic 5: Package Selection Interface Component
// SCHH-016: Package Selection Interface

'use client'

import { useState } from 'react'
import { PackageType, PackageOption } from '@/types/hotel'
import { PACKAGE_OPTIONS } from '@/store/cartStore'

interface PackageSelectionProps {
  selectedPackage: PackageType
  onPackageChange: (packageType: PackageType) => void
  basePrice: number // Base room price per night
  numberOfNights: number
  showTerms?: boolean
  onTermsAccept?: () => void
}

const PackageSelection: React.FC<PackageSelectionProps> = ({
  selectedPackage,
  onPackageChange,
  basePrice,
  numberOfNights,
  showTerms = false,
  onTermsAccept
}) => {
  const [showMenuPreview, setShowMenuPreview] = useState<PackageType | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const formatPrice = (priceInPence: number): string => {
    return `£${(priceInPence / 100).toFixed(2)}`
  }

  const calculatePackageTotal = (packageOption: PackageOption): number => {
    return (basePrice + packageOption.priceAdjustment) * numberOfNights
  }

  const getPackageSavings = (packageOption: PackageOption): number => {
    // Calculate estimated savings compared to ordering meals separately
    if (packageOption.type === 'bed-breakfast') {
      return 500 * numberOfNights // £5 savings per night
    } else if (packageOption.type === 'half-board') {
      return 1200 * numberOfNights // £12 savings per night
    }
    return 0
  }

  const menuPreviewData: Record<PackageType, { title: string; items: string[] } | null> = {
    'room-only': null,
    'bed-breakfast': {
      title: 'Highland Breakfast Menu',
      items: [
        'Traditional Scottish porridge with honey',
        'Full Highland breakfast with black pudding',
        'Smoked salmon and scrambled eggs',
        'Fresh fruit and yogurt selection',
        'Artisan breads and preserves',
        'Scottish bacon and Cumberland sausage',
        'Grilled tomatoes and mushrooms',
        'Fresh orange juice and coffee/tea'
      ]
    },
    'half-board': {
      title: 'Three-Course Dinner Menu (Sample)',
      items: [
        'Starter: Highland game terrine with oatcakes',
        'Starter: Cullen skink soup',
        'Main: Locally sourced venison with root vegetables',
        'Main: Fresh caught salmon with herb crust',
        'Main: Highland beef with whisky sauce',
        'Dessert: Traditional cranachan',
        'Dessert: Sticky toffee pudding',
        'Selection of Scottish cheeses'
      ]
    }
  }

  const PackageCard: React.FC<{
    packageOption: PackageOption,
    isSelected: boolean,
    onClick: () => void
  }> = ({ packageOption, isSelected, onClick }) => {
    const total = calculatePackageTotal(packageOption)
    const savings = getPackageSavings(packageOption)
    const hasMenu = packageOption.mealTimes && Object.keys(packageOption.mealTimes).length > 0

    return (
      <div
        className={`
          relative cursor-pointer rounded-2xl border-2 p-6 transition-all hover:scale-105
          ${isSelected
            ? 'border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-400/20'
            : 'border-white/20 bg-white/5 hover:border-white/30'
          }
        `}
        onClick={onClick}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Package header */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-slate-950 mb-2">
            {packageOption.name}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {packageOption.description}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-emerald-300">
              {formatPrice(total)}
            </span>
            <span className="text-slate-400 text-sm">
              total ({numberOfNights} nights)
            </span>
          </div>

          {packageOption.priceAdjustment > 0 && (
            <div className="text-sm text-slate-400">
              {formatPrice(basePrice)} room + {formatPrice(packageOption.priceAdjustment)}/night package
            </div>
          )}

          {savings > 0 && (
            <div className="text-sm text-emerald-300 font-medium">
              Save {formatPrice(savings)} vs. ordering separately
            </div>
          )}
        </div>

        {/* Includes */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Includes:</h4>
          <ul className="space-y-1">
            {packageOption.includes.map((item, index) => (
              <li key={`${packageOption.type}-include-${index}`} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-emerald-400 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Meal times */}
        {packageOption.mealTimes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Meal Times:</h4>
            <div className="space-y-1">
              {Object.entries(packageOption.mealTimes).map(([meal, time]) => (
                <div key={meal} className="flex justify-between text-sm">
                  <span className="text-slate-400 capitalize">{meal}:</span>
                  <span className="text-slate-950">{time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu preview button */}
        {hasMenu && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenuPreview(packageOption.type)
            }}
            className="w-full mt-4 py-2 text-sm text-emerald-300 hover:text-emerald-200 transition-colors border-t border-white/10 pt-4"
          >
            View sample menu →
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-slate-950 mb-2">
          Choose Your Package
        </h2>
        <p className="text-slate-400">
          Select the dining package that best suits your Highland experience
        </p>
      </div>

      {/* Package options */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.values(PACKAGE_OPTIONS).map((packageOption) => (
          <PackageCard
            key={packageOption.type}
            packageOption={packageOption}
            isSelected={selectedPackage === packageOption.type}
            onClick={() => onPackageChange(packageOption.type)}
          />
        ))}
      </div>

      {/* Terms and conditions */}
      {showTerms && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold text-slate-950 mb-4">
            Terms & Conditions
          </h3>

          <div className="space-y-3 text-sm text-slate-400 max-h-40 overflow-y-auto">
            <p>
              <strong className="text-slate-300">Booking Terms:</strong> All bookings are subject to availability and confirmation.
              Room rates include VAT at the current rate.
            </p>

            <p>
              <strong className="text-slate-300">Cancellation Policy:</strong> Free cancellation up to 48 hours before arrival.
              Cancellations within 48 hours may incur a charge equivalent to one night's stay.
            </p>

            <p>
              <strong className="text-slate-300">Package Terms:</strong> Meal packages are non-transferable and must be used during your stay.
              Dietary requirements should be notified at least 24 hours in advance.
            </p>

            <p>
              <strong className="text-slate-300">Check-in/Check-out:</strong> Check-in from 3:00 PM, check-out by 11:00 AM.
              Early check-in and late check-out may be available subject to availability and additional charges.
            </p>

            <p>
              <strong className="text-slate-300">Payment:</strong> Payment is required at the time of booking.
              We accept major credit cards and bank transfers.
            </p>
          </div>

          <div className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              id="terms-checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-black/30 text-emerald-400 focus:ring-emerald-400 focus:ring-2"
            />
            <label htmlFor="terms-checkbox" className="text-sm text-slate-300 cursor-pointer">
              I have read and agree to the terms and conditions above
            </label>
          </div>

          {onTermsAccept && (
            <button
              onClick={onTermsAccept}
              disabled={!termsAccepted}
              className="w-full mt-4 py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Accept Terms & Continue
            </button>
          )}
        </div>
      )}

      {/* Menu preview modal */}
      {showMenuPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full max-h-[80vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-950">
                {menuPreviewData[showMenuPreview]?.title}
              </h3>
              <button
                onClick={() => setShowMenuPreview(null)}
                className="w-8 h-8 rounded-full bg-white/10 text-slate-950 hover:bg-white/20 transition-colors flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-4">
              Sample menu items - our chefs create seasonal menus featuring the finest Highland ingredients.
            </p>

            <ul className="space-y-2">
              {menuPreviewData[showMenuPreview]?.items.map((item: string, index: number) => (
                <li key={`${showMenuPreview}-item-${index}`} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  {item}
                </li>
              )) || []}
            </ul>

            <div className="mt-6">
              <button
                onClick={() => setShowMenuPreview(null)}
                className="w-full py-3 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PackageSelection