// Epic 5: Shopping Cart Component
// SCHH-014: Multi-Room Shopping Cart

'use client'

import { useState } from 'react'
import { useCartStore, PACKAGE_OPTIONS } from '@/store/cartStore'
import { CartItem } from '@/types/hotel'

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
  onProceedToBooking?: () => void
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({
  isOpen,
  onClose,
  onProceedToBooking
}) => {
  const {
    getCartSummary,
    removeItem,
    updateItem,
    clearCart
  } = useCartStore()

  const [isClearing, setIsClearing] = useState(false)
  const cartSummary = getCartSummary()

  const handleClearCart = async () => {
    setIsClearing(true)
    // Add a small delay for better UX
    setTimeout(() => {
      clearCart()
      setIsClearing(false)
    }, 300)
  }

  const handlePackageChange = (itemId: string, newPackageType: keyof typeof PACKAGE_OPTIONS) => {
    updateItem(itemId, {
      packageType: newPackageType,
      packageOption: PACKAGE_OPTIONS[newPackageType]
    })
  }

  const formatPrice = (priceInPence: number): string => {
    return `£${(priceInPence / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-semibold text-white">Shopping Cart</h2>
            <p className="text-slate-400">
              {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'room' : 'rooms'} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh]">
          {cartSummary.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Your cart is empty</h3>
              <p className="text-slate-400">
                Drag rooms to your preferred dates or browse our room selection to get started.
              </p>
            </div>
          ) : (
            cartSummary.items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onPackageChange={(packageType) => handlePackageChange(item.id, packageType)}
              />
            ))
          )}
        </div>

        {/* Summary and Actions */}
        {cartSummary.items.length > 0 && (
          <>
            {/* Cart Summary */}
            <div className="border-t border-white/10 p-6 space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span>{formatPrice(cartSummary.subtotal)}</span>
              </div>

              {cartSummary.groupDiscount > 0 && (
                <div className="flex justify-between text-emerald-300">
                  <span>Group Discount ({cartSummary.items.length} rooms):</span>
                  <span>-{formatPrice(cartSummary.groupDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-300">
                <span>Taxes (10% VAT):</span>
                <span>{formatPrice(cartSummary.taxes)}</span>
              </div>

              <div className="flex justify-between text-xl font-semibold text-white border-t border-white/10 pt-3">
                <span>Total:</span>
                <span>{formatPrice(cartSummary.total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={onProceedToBooking}
                className="w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
              >
                Proceed to Booking
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleClearCart}
                  disabled={isClearing}
                  className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition disabled:opacity-50"
                >
                  {isClearing ? 'Clearing...' : 'Clear Cart'}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full border border-white/20 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Individual cart item component
interface CartItemRowProps {
  item: CartItem
  onRemove: () => void
  onPackageChange: (packageType: keyof typeof PACKAGE_OPTIONS) => void
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onRemove, onPackageChange }) => {
  const formatPrice = (priceInPence: number): string => {
    return `£${(priceInPence / 100).toFixed(2)}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-white font-medium capitalize">
            {item.room.type} Room
          </h3>
          <p className="text-emerald-300 text-sm">Room {item.room.roomNumber}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-slate-400 hover:text-red-400 transition-colors"
          title="Remove from cart"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Stay Details */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <p className="text-slate-400">Check-in</p>
          <p className="text-white">{formatDate(item.checkInDate)}</p>
        </div>
        <div>
          <p className="text-slate-400">Check-out</p>
          <p className="text-white">{formatDate(item.checkOutDate)}</p>
        </div>
        <div>
          <p className="text-slate-400">Guests</p>
          <p className="text-white">{item.guests}</p>
        </div>
        <div>
          <p className="text-slate-400">Nights</p>
          <p className="text-white">{item.numberOfNights}</p>
        </div>
      </div>

      {/* Package Selection */}
      <div className="mb-3">
        <label className="block text-sm text-slate-400 mb-2">Package</label>
        <select
          value={item.packageType}
          onChange={(e) => onPackageChange(e.target.value as keyof typeof PACKAGE_OPTIONS)}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {Object.entries(PACKAGE_OPTIONS).map(([key, option]) => (
            <option key={key} value={key}>
              {option.name} {option.priceAdjustment > 0 && `(+${formatPrice(option.priceAdjustment)}/night)`}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-slate-400">
          <span>Room ({item.numberOfNights} nights):</span>
          <span>{formatPrice(item.totalRoomCost)}</span>
        </div>
        {item.totalPackageCost > 0 && (
          <div className="flex justify-between text-slate-400">
            <span>Package ({item.numberOfNights} nights):</span>
            <span>{formatPrice(item.totalPackageCost)}</span>
          </div>
        )}
        <div className="flex justify-between text-white font-medium border-t border-white/10 pt-1">
          <span>Total:</span>
          <span>{formatPrice(item.totalCost)}</span>
        </div>
      </div>
    </div>
  )
}

export default ShoppingCart