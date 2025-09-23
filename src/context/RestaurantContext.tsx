'use client'

import { createContext, useContext, useCallback, useMemo, useReducer, ReactNode } from 'react'
import type {
  RestaurantTable,
  ServicePeriod,
  TimeSlotAvailability,
  TableZone,
} from '@/types/restaurant'

interface RestaurantState {
  tables: RestaurantTable[]
  periods: ServicePeriod[]
  timeSlots: TimeSlotAvailability[]
  selectedTableId: string | null
  selectedDate: string
  activePeriodId: string
  selectedSlotId: string | null
  loading: boolean
}

type RestaurantAction =
  | { type: 'SET_TABLES'; payload: RestaurantTable[] }
  | { type: 'UPDATE_TABLE'; payload: { id: string; updates: Partial<RestaurantTable> } }
  | { type: 'SET_PERIODS'; payload: ServicePeriod[] }
  | { type: 'UPDATE_PERIOD'; payload: { id: string; updates: Partial<ServicePeriod> } }
  | { type: 'SET_TIME_SLOTS'; payload: TimeSlotAvailability[] }
  | { type: 'UPDATE_TIME_SLOT'; payload: { id: string; updates: Partial<TimeSlotAvailability> } }
  | { type: 'SET_SELECTED_TABLE'; payload: string | null }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_ACTIVE_PERIOD'; payload: string }
  | { type: 'SET_SELECTED_SLOT'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }

interface RestaurantContextType extends RestaurantState {
  // Table actions
  updateTable: (id: string, updates: Partial<RestaurantTable>) => void
  selectTable: (id: string | null) => void

  // Period actions
  updatePeriod: (id: string, updates: Partial<ServicePeriod>) => void

  // Selection actions
  setSelectedDate: (date: string) => void
  setActivePeriod: (id: string) => void
  setSelectedSlot: (id: string | null) => void

  // Computed values
  selectedTable: RestaurantTable | null
  availableDates: string[]
  periodsForDate: ServicePeriod[]
  slotsForPeriod: TimeSlotAvailability[]
  selectedSlot: TimeSlotAvailability | null
}

const RestaurantContext = createContext<RestaurantContextType | null>(null)

function restaurantReducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  switch (action.type) {
    case 'SET_TABLES':
      return { ...state, tables: action.payload }

    case 'UPDATE_TABLE':
      return {
        ...state,
        tables: state.tables.map(table =>
          table.id === action.payload.id
            ? { ...table, ...action.payload.updates }
            : table
        )
      }

    case 'SET_PERIODS':
      return { ...state, periods: action.payload }

    case 'UPDATE_PERIOD':
      return {
        ...state,
        periods: state.periods.map(period =>
          period.id === action.payload.id
            ? { ...period, ...action.payload.updates }
            : period
        )
      }

    case 'SET_TIME_SLOTS':
      return { ...state, timeSlots: action.payload }

    case 'UPDATE_TIME_SLOT':
      return {
        ...state,
        timeSlots: state.timeSlots.map(slot =>
          slot.id === action.payload.id
            ? { ...slot, ...action.payload.updates }
            : slot
        )
      }

    case 'SET_SELECTED_TABLE':
      return { ...state, selectedTableId: action.payload }

    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }

    case 'SET_ACTIVE_PERIOD':
      return { ...state, activePeriodId: action.payload }

    case 'SET_SELECTED_SLOT':
      return { ...state, selectedSlotId: action.payload }

    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    default:
      return state
  }
}

interface RestaurantProviderProps {
  children: ReactNode
  initialData?: {
    tables?: RestaurantTable[]
    periods?: ServicePeriod[]
    timeSlots?: TimeSlotAvailability[]
  }
}

export function RestaurantProvider({ children, initialData }: RestaurantProviderProps) {
  const initialState: RestaurantState = {
    tables: initialData?.tables || [],
    periods: initialData?.periods || [],
    timeSlots: initialData?.timeSlots || [],
    selectedTableId: null,
    selectedDate: '',
    activePeriodId: '',
    selectedSlotId: null,
    loading: true,
  }

  const [state, dispatch] = useReducer(restaurantReducer, initialState)

  // Actions
  const updateTable = useCallback((id: string, updates: Partial<RestaurantTable>) => {
    dispatch({ type: 'UPDATE_TABLE', payload: { id, updates } })
  }, [])

  const selectTable = useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_TABLE', payload: id })
  }, [])

  const updatePeriod = useCallback((id: string, updates: Partial<ServicePeriod>) => {
    dispatch({ type: 'UPDATE_PERIOD', payload: { id, updates } })
  }, [])

  const setSelectedDate = useCallback((date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
  }, [])

  const setActivePeriod = useCallback((id: string) => {
    dispatch({ type: 'SET_ACTIVE_PERIOD', payload: id })
  }, [])

  const setSelectedSlot = useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_SLOT', payload: id })
  }, [])

  // Computed values with memoization
  const selectedTable = useMemo(
    () => state.tables.find(table => table.id === state.selectedTableId) ?? null,
    [state.tables, state.selectedTableId]
  )

  const availableDates = useMemo(
    () => Array.from(new Set(state.timeSlots.map(slot => slot.date))).sort(),
    [state.timeSlots]
  )

  const periodsForDate = useMemo(
    () => state.periods.filter(period =>
      state.timeSlots.some(slot => slot.date === state.selectedDate && slot.periodId === period.id)
    ),
    [state.periods, state.timeSlots, state.selectedDate]
  )

  const slotsForPeriod = useMemo(
    () => state.timeSlots
      .filter(slot => slot.date === state.selectedDate && slot.periodId === state.activePeriodId)
      .sort((a, b) => a.time.localeCompare(b.time)),
    [state.timeSlots, state.selectedDate, state.activePeriodId]
  )

  const selectedSlot = useMemo(
    () => slotsForPeriod.find(slot => slot.id === state.selectedSlotId) ?? null,
    [slotsForPeriod, state.selectedSlotId]
  )

  const contextValue: RestaurantContextType = {
    ...state,
    updateTable,
    selectTable,
    updatePeriod,
    setSelectedDate,
    setActivePeriod,
    setSelectedSlot,
    selectedTable,
    availableDates,
    periodsForDate,
    slotsForPeriod,
    selectedSlot,
  }

  return (
    <RestaurantContext.Provider value={contextValue}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurant() {
  const context = useContext(RestaurantContext)
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider')
  }
  return context
}