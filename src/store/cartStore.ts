// Epic 5: Shopping Cart Store with Zustand
// SCHH-014: Multi-Room Shopping Cart

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  CartItem,
  CartSummary,
  Room,
  PackageType,
  PackageOption,
  DragDropResult
} from '@/types/hotel'

interface CartState {
  items: CartItem[]

  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => Promise<void>
  removeItem: (itemId: string) => void
  updateItem: (itemId: string, updates: Partial<CartItem>) => void
  clearCart: () => void

  // Computed values
  getCartSummary: () => CartSummary
  getItemCount: () => number
  getTotalCost: () => number

  // Drag and drop support
  addRoomFromDrop: (result: DragDropResult) => void
}

// Package options configuration
export const PACKAGE_OPTIONS: Record<PackageType, PackageOption> = {
  'room-only': {
    type: 'room-only',
    name: 'Room Only',
    description: 'Accommodation only, perfect for exploring local dining',
    priceAdjustment: 0,
    includes: ['Daily housekeeping', 'WiFi', 'Access to hotel facilities']
  },
  'bed-breakfast': {
    type: 'bed-breakfast',
    name: 'Bed & Breakfast',
    description: 'Start your day with our hearty Highland breakfast',
    priceAdjustment: 2500, // £25 per night
    includes: [
      'Daily housekeeping',
      'WiFi',
      'Access to hotel facilities',
      'Full Highland breakfast'
    ],
    mealTimes: {
      breakfast: '7:00 AM - 10:00 AM'
    }
  },
  'half-board': {
    type: 'half-board',
    name: 'Half Board',
    description: 'Breakfast and dinner included for a complete Highland experience',
    priceAdjustment: 4500, // £45 per night
    includes: [
      'Daily housekeeping',
      'WiFi',
      'Access to hotel facilities',
      'Full Highland breakfast',
      'Three-course dinner'
    ],
    mealTimes: {
      breakfast: '7:00 AM - 10:00 AM',
      dinner: '6:30 PM - 9:00 PM'
    }
  }
}

// Group discount logic
const calculateGroupDiscount = (items: CartItem[]): number => {
  const totalRooms = items.length

  if (totalRooms >= 5) {
    // 15% discount for 5+ rooms
    return 0.15
  } else if (totalRooms >= 3) {
    // 10% discount for 3-4 rooms
    return 0.10
  } else if (totalRooms >= 2) {
    // 5% discount for 2 rooms
    return 0.05
  }

  return 0
}

// Tax calculation (10% VAT)
const calculateTax = (subtotal: number): number => {
  return Math.round(subtotal * 0.10)
}

// Generate unique cart item ID
const generateCartItemId = (): string => {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Calculate number of nights between dates
const calculateNights = (checkIn: string, checkOut: string): number => {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime()
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (itemData) => {
        // Check availability before adding to cart
        const { AvailabilityService } = await import('@/lib/firebase/hotel-service')

        const isAvailable = await AvailabilityService.checkRoomAvailability(
          itemData.room.id,
          itemData.checkInDate,
          itemData.checkOutDate
        )

        if (!isAvailable) {
          throw new Error('This room is not available for your selected dates. Please choose different dates or view alternative rooms.')
        }

        const id = generateCartItemId()
        const packageOption = PACKAGE_OPTIONS[itemData.packageType]
        const numberOfNights = calculateNights(itemData.checkInDate, itemData.checkOutDate)

        const totalRoomCost = itemData.roomRate * numberOfNights
        const totalPackageCost = packageOption.priceAdjustment * numberOfNights
        const totalCost = totalRoomCost + totalPackageCost

        const newItem: CartItem = {
          ...itemData,
          id,
          numberOfNights,
          packageOption,
          packageRate: packageOption.priceAdjustment,
          totalRoomCost,
          totalPackageCost,
          totalCost,
          addedAt: new Date()
        }

        set((state) => ({
          items: [...state.items, newItem]
        }))
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId)
        }))
      },

      updateItem: (itemId, updates) => {
        set((state) => ({
          items: state.items.map(item => {
            if (item.id === itemId) {
              const updatedItem = { ...item, ...updates }

              // Recalculate costs if relevant fields changed
              if (updates.checkInDate || updates.checkOutDate || updates.roomRate || updates.packageType) {
                const numberOfNights = calculateNights(
                  updatedItem.checkInDate,
                  updatedItem.checkOutDate
                )
                const packageOption = PACKAGE_OPTIONS[updatedItem.packageType]
                const totalRoomCost = updatedItem.roomRate * numberOfNights
                const totalPackageCost = packageOption.priceAdjustment * numberOfNights

                return {
                  ...updatedItem,
                  numberOfNights,
                  packageOption,
                  packageRate: packageOption.priceAdjustment,
                  totalRoomCost,
                  totalPackageCost,
                  totalCost: totalRoomCost + totalPackageCost
                }
              }

              return updatedItem
            }
            return item
          })
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getCartSummary: (): CartSummary => {
        const items = get().items
        const subtotal = items.reduce((sum, item) => sum + item.totalCost, 0)
        const groupDiscountRate = calculateGroupDiscount(items)
        const groupDiscount = Math.round(subtotal * groupDiscountRate)
        const discountedSubtotal = subtotal - groupDiscount
        const taxes = calculateTax(discountedSubtotal)
        const total = discountedSubtotal + taxes

        return {
          items,
          subtotal,
          groupDiscount,
          taxes,
          total,
          itemCount: items.length
        }
      },

      getItemCount: () => {
        return get().items.length
      },

      getTotalCost: () => {
        return get().getCartSummary().total
      },

      addRoomFromDrop: (result: DragDropResult) => {
        const { room, targetDate, packageType, guests } = result

        // Calculate check-out date (1 night stay by default)
        const checkInDate = new Date(targetDate)
        const checkOutDate = new Date(checkInDate)
        checkOutDate.setDate(checkOutDate.getDate() + 1)
        const numberOfNights = 1
        const packageOption = PACKAGE_OPTIONS[packageType]
        const totalRoomCost = room.pricing.basePrice * numberOfNights
        const totalPackageCost = packageOption.priceAdjustment * numberOfNights

        const itemData = {
          room,
          checkInDate: targetDate,
          checkOutDate: checkOutDate.toISOString().split('T')[0],
          numberOfNights,
          guests,
          packageType,
          packageOption,
          roomRate: room.pricing.basePrice,
          packageRate: packageOption.priceAdjustment,
          totalRoomCost,
          totalPackageCost,
          totalCost: totalRoomCost + totalPackageCost
        }

        get().addItem(itemData)
      }
    }),
    {
      name: 'schiehallion-cart-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          const memoryStorage: Record<string, string> = {}
          return {
            getItem: (name: string) => memoryStorage[name] ?? null,
            setItem: (name: string, value: string) => {
              memoryStorage[name] = value
            },
            removeItem: (name: string) => {
              delete memoryStorage[name]
            },
            clear: () => {
              Object.keys(memoryStorage).forEach(key => delete memoryStorage[key])
            },
            key: (index: number) => Object.keys(memoryStorage)[index] ?? null,
            get length() {
              return Object.keys(memoryStorage).length
            }
          } as Storage
        }

        return window.sessionStorage
      }),
      partialize: (state) => ({
        items: state.items.map(item => ({
          ...item,
          // Convert Date objects to strings for storage
          addedAt: item.addedAt.toISOString()
        }))
      }),
      onRehydrateStorage: () => (state) => {
        // Convert stored date strings back to Date objects
        if (state?.items) {
          state.items = state.items.map(item => ({
            ...item,
            addedAt: new Date(item.addedAt)
          }))
        }
      }
    }
  )
)

export default useCartStore
