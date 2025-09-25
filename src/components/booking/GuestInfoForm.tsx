// Epic 5: Guest Information Form Component
// SCHH-015: Guest Information Form

'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray, type FieldArrayPath } from 'react-hook-form'
import { GuestFormData } from '@/types/hotel'
import {
  travelPurposeOptions,
  stayGoalOptions,
  experienceInterestOptions,
  roomComfortOptions,
  budgetPreferenceOptions
} from '@/data/personalization'

interface GuestInfoFormProps {
  onSubmit: (data: GuestFormData) => void
  onBack?: () => void
  initialData?: Partial<GuestFormData>
  isLoading?: boolean
}

type FormStep = 'personal' | 'address' | 'preferences' | 'arrival' | 'emergency'

const GuestInfoForm: React.FC<GuestInfoFormProps> = ({
  onSubmit,
  onBack,
  initialData,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('personal')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    trigger,
    getValues
  } = useForm<GuestFormData>({
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        ...initialData?.personalInfo
      },
      address: {
        street: '',
        city: '',
        postcode: '',
        country: 'United Kingdom',
        ...initialData?.address
      },
      preferences: {
        specialRequests: '',
        dietaryRequirements: initialData?.preferences?.dietaryRequirements || [],
        accessibilityNeeds: initialData?.preferences?.accessibilityNeeds || [],
        marketingOptIn: initialData?.preferences?.marketingOptIn ?? false,
        tripPurpose: initialData?.preferences?.tripPurpose || 'leisure',
        stayGoals: initialData?.preferences?.stayGoals || [],
        experienceInterests: initialData?.preferences?.experienceInterests || [],
        roomComforts: initialData?.preferences?.roomComforts || [],
        stayOccasion: initialData?.preferences?.stayOccasion || '',
        personalizationOptIn: initialData?.preferences?.personalizationOptIn ?? true,
        communicationPreference: initialData?.preferences?.communicationPreference || 'email',
        budgetPreference: initialData?.preferences?.budgetPreference || 'balanced',
        ...initialData?.preferences
      },
      arrival: {
        estimatedArrivalTime: '',
        specialInstructions: '',
        ...initialData?.arrival
      },
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
        ...initialData?.emergencyContact
      }
    }
  })

  const dietaryFieldName =
    'preferences.dietaryRequirements' as FieldArrayPath<GuestFormData>
  const accessibilityFieldName =
    'preferences.accessibilityNeeds' as FieldArrayPath<GuestFormData>

  const {
    fields: dietaryFields,
    append: appendDietary,
    remove: removeDietary
  } = useFieldArray<GuestFormData, typeof dietaryFieldName>({
    control,
    name: dietaryFieldName
  })

  const {
    fields: accessibilityFields,
    append: appendAccessibility,
    remove: removeAccessibility
  } = useFieldArray<GuestFormData, typeof accessibilityFieldName>({
    control,
    name: accessibilityFieldName
  })

  const steps: { key: FormStep; title: string; description: string }[] = [
    {
      key: 'personal',
      title: 'Personal Information',
      description: 'Basic details for your reservation'
    },
    {
      key: 'address',
      title: 'Address',
      description: 'Your contact address (optional)'
    },
    {
      key: 'preferences',
      title: 'Preferences',
      description: 'Special requests and requirements'
    },
    {
      key: 'arrival',
      title: 'Arrival Details',
      description: 'Expected arrival time and instructions'
    },
    {
      key: 'emergency',
      title: 'Emergency Contact',
      description: 'Emergency contact information (optional)'
    }
  ]

  type PreferenceArrayField =
    | 'preferences.stayGoals'
    | 'preferences.experienceInterests'
    | 'preferences.roomComforts'

  const watchStayGoals = watch('preferences.stayGoals') || []
  const watchExperienceInterests = watch('preferences.experienceInterests') || []
  const watchRoomComforts = watch('preferences.roomComforts') || []
  const watchTripPurpose = watch('preferences.tripPurpose') || 'leisure'
  const watchBudgetPreference = watch('preferences.budgetPreference') || 'balanced'
  const watchPersonalizationOptIn = watch('preferences.personalizationOptIn')
  const stayGoalLimitReached = watchStayGoals.length >= 3

  const togglePreferenceValue = (field: PreferenceArrayField, value: string) => {
    const current = (watch(field) as string[] | undefined) || []
    const next = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value]
    setValue(field, next, { shouldDirty: true })
  }

  useEffect(() => {
    register('preferences.stayGoals')
    register('preferences.experienceInterests')
    register('preferences.roomComforts')
    register('preferences.tripPurpose')
    register('preferences.budgetPreference')
  }, [register])

  const currentStepIndex = steps.findIndex(step => step.key === currentStep)
  const isLastStep = currentStepIndex === steps.length - 1

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await trigger(fieldsToValidate)

    if (isValid && !isLastStep) {
      const nextStep = steps[currentStepIndex + 1]
      setCurrentStep(nextStep.key)
    } else if (isValid && isLastStep) {
      const formData = getValues()
      onSubmit(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1]
      setCurrentStep(prevStep.key)
    }
  }

  const getFieldsForStep = (step: FormStep): any[] => {
    switch (step) {
      case 'personal':
        return [
          'personalInfo.firstName' as const,
          'personalInfo.lastName' as const,
          'personalInfo.email' as const,
          'personalInfo.phone' as const
        ]
      case 'address':
        return [] // Address is optional
      case 'preferences':
        return [] // Preferences are optional
      case 'arrival':
        return [] // Arrival details are optional
      case 'emergency':
        return [] // Emergency contact is optional
      default:
        return []
    }
  }

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-free',
    'Dairy-free',
    'Nut allergy',
    'Halal',
    'Kosher',
    'Diabetic',
    'Low sodium'
  ]

  const accessibilityOptions = [
    'Wheelchair accessible',
    'Hearing loop required',
    'Visual aids needed',
    'Mobility assistance',
    'Ground floor access',
    'Large text materials',
    'Audio descriptions'
  ]

  const arrivalTimes = [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM',
    'After 9:00 PM'
  ]

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-lundies-peat mb-2">
            First Name *
          </label>
          <input
            {...register('personalInfo.firstName', {
              required: 'First name is required'
            })}
            className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
            placeholder="Enter your first name"
          />
          {errors.personalInfo?.firstName && (
            <p className="text-red-400 text-sm mt-1">{errors.personalInfo.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-lundies-peat mb-2">
            Last Name *
          </label>
          <input
            {...register('personalInfo.lastName', {
              required: 'Last name is required'
            })}
            className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
            placeholder="Enter your last name"
          />
          {errors.personalInfo?.lastName && (
            <p className="text-red-400 text-sm mt-1">{errors.personalInfo.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Email Address *
        </label>
        <input
          type="email"
          {...register('personalInfo.email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          placeholder="Enter your email address"
        />
        {errors.personalInfo?.email && (
          <p className="text-red-400 text-sm mt-1">{errors.personalInfo.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          {...register('personalInfo.phone', {
            required: 'Phone number is required'
          })}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          placeholder="Enter your phone number"
        />
        {errors.personalInfo?.phone && (
          <p className="text-red-400 text-sm mt-1">{errors.personalInfo.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Date of Birth (Optional)
        </label>
        <input
          type="date"
          {...register('personalInfo.dateOfBirth')}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal focus:outline-none focus:ring-2 focus:ring-lundies-heather"
        />
      </div>
    </div>
  )

  const renderAddress = () => (
    <div className="space-y-4">
      <p className="text-lundies-peat text-sm mb-4">
        Providing your address helps us with check-in and any postal communications.
      </p>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Street Address
        </label>
        <input
          {...register('address.street')}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          placeholder="Enter your street address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-lundies-peat mb-2">
            City
          </label>
          <input
            {...register('address.city')}
            className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
            placeholder="Enter your city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-lundies-peat mb-2">
            Postcode
          </label>
          <input
            {...register('address.postcode')}
            className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
            placeholder="Enter your postcode"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Country
        </label>
        <select
          {...register('address.country')}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal focus:outline-none focus:ring-2 focus:ring-lundies-heather"
        >
          <option value="United Kingdom">United Kingdom</option>
          <option value="Ireland">Ireland</option>
          <option value="United States">United States</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="New Zealand">New Zealand</option>
          <option value="Germany">Germany</option>
          <option value="France">France</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  )

  const renderPreferences = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-lundies-charcoal mb-2">Tailor your stay focus</h3>
        <p className="text-lundies-peat text-sm">
          Choose what this visit is all about so we can surface the right touches.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {travelPurposeOptions.map((option) => {
            const isSelected = watchTripPurpose === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('preferences.tripPurpose', option.value, { shouldDirty: true })}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  isSelected
                    ? 'border-lundies-heather bg-lundies-heather/10 text-lundies-charcoal shadow-lg shadow-lundies-heather/20'
                    : 'border-lundies-stone/60 bg-lundies-stone/20 text-lundies-peat hover:border-lundies-stone'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-lundies-charcoal">{option.label}</span>
                  {isSelected && (
                    <span className="rounded-full bg-lundies-heather px-2 py-0.5 text-xs font-semibold text-lundies-charcoal">
                      Selected
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-lundies-peat">{option.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-lundies-peat">Preferred spending style</span>
        <div className="mt-3 flex flex-wrap gap-3">
          {budgetPreferenceOptions.map((option) => {
            const isSelected = watchBudgetPreference === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue('preferences.budgetPreference', option.value, { shouldDirty: true })}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isSelected
                    ? 'border-lundies-heather bg-lundies-heather/20 text-lundies-moss'
                    : 'border-lundies-stone/60 bg-lundies-stone/20 text-lundies-peat hover:bg-lundies-stone/40'
                }`}
              >
                <span className="block font-medium">{option.label}</span>
                <span className="block text-xs text-lundies-stone">{option.tone}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-lundies-peat">Stay goals</label>
          <span className="text-xs text-lundies-stone">Pick up to three focus areas.</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {stayGoalOptions.map((option) => {
            const isSelected = watchStayGoals.includes(option.value)
            const disabled = !isSelected && stayGoalLimitReached
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (disabled) return
                  togglePreferenceValue('preferences.stayGoals', option.value)
                }}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? 'border-lundies-heather bg-lundies-heather/10 text-lundies-charcoal'
                    : disabled
                      ? 'border-lundies-stone/30 bg-lundies-stone/10 text-lundies-stone cursor-not-allowed opacity-60'
                      : 'border-lundies-stone/60 bg-lundies-stone/20 text-lundies-peat hover:border-lundies-stone'
                }`}
              >
                <span className="font-medium text-lundies-charcoal">{option.label}</span>
                <p className="mt-1 text-xs text-lundies-peat">{option.helper}</p>
              </button>
            )
          })}
        </div>
        {stayGoalLimitReached && (
          <p className="mt-2 text-xs text-amber-600">You can deselect an option to choose another focus.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">Experiences you're excited about</label>
        <div className="flex flex-wrap gap-2">
          {experienceInterestOptions.map((option) => {
            const isSelected = watchExperienceInterests.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => togglePreferenceValue('preferences.experienceInterests', option.value)}
                className={`rounded-full border px-3 py-2 text-sm transition ${
                  isSelected
                    ? 'border-lundies-heather bg-lundies-heather/20 text-lundies-moss'
                    : 'border-lundies-stone/60 bg-lundies-stone/20 text-lundies-peat hover:bg-lundies-stone/40'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">In-room comforts that matter</label>
        <div className="flex flex-wrap gap-2">
          {roomComfortOptions.map((option) => {
            const isSelected = watchRoomComforts.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => togglePreferenceValue('preferences.roomComforts', option.value)}
                className={`rounded-full border px-3 py-2 text-sm transition ${
                  isSelected
                    ? 'border-lundies-heather bg-lundies-heather/20 text-lundies-moss'
                    : 'border-lundies-stone/60 bg-lundies-stone/20 text-lundies-peat hover:bg-lundies-stone/40'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Special Requests
        </label>
        <textarea
          {...register('preferences.specialRequests')}
          rows={4}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          placeholder="Any special requests for your stay? (e.g., high floor, quiet room, early check-in)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-3">
          Dietary Requirements
        </label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {dietaryOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  const current = watch('preferences.dietaryRequirements') || []
                  const isSelected = current.includes(option)
                  if (isSelected) {
                    const index = current.indexOf(option)
                    removeDietary(index)
                  } else {
                    appendDietary(option)
                  }
                }}
                className={`
                  px-3 py-2 rounded-full text-sm border transition-colors
                  ${(watch('preferences.dietaryRequirements') || []).includes(option)
                    ? 'border-lundies-heather bg-lundies-heather/20 text-lundies-moss'
                    : 'border-lundies-stone/60 bg-lundies-stone/20 text-lundies-peat hover:bg-lundies-stone/40'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-3">
          Accessibility Needs
        </label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {accessibilityOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  const current = watch('preferences.accessibilityNeeds') || []
                  const isSelected = current.includes(option)
                  if (isSelected) {
                    const index = current.indexOf(option)
                    removeAccessibility(index)
                  } else {
                    appendAccessibility(option)
                  }
                }}
                className={`
                  px-3 py-2 rounded-full text-sm border transition-colors
                  ${(watch('preferences.accessibilityNeeds') || []).includes(option)
                    ? 'border-lundies-heather bg-lundies-heather/20 text-lundies-moss'
                    : 'border-lundies-stone/60 bg-lundies-stone/20 text-lundies-peat hover:bg-lundies-stone/40'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">Celebration or reason for visiting (optional)</label>
        <input
          {...register('preferences.stayOccasion')}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          placeholder="e.g., Anniversary weekend, client summit, family adventure"
        />
      </div>

      <div className="rounded-2xl border border-lundies-stone/60 bg-lundies-stone/40 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="personalization-opt-in"
            {...register('preferences.personalizationOptIn')}
            className="mt-1 h-4 w-4 rounded border-lundies-stone/60 bg-lundies-stone/40 text-lundies-heather focus:ring-lundies-heather focus:ring-2"
          />
          <div>
            <label htmlFor="personalization-opt-in" className="text-sm font-medium text-lundies-charcoal">
              Personalised recommendations
            </label>
            <p className="mt-1 text-xs text-lundies-peat">
              {watchPersonalizationOptIn
                ? 'We will learn from your selections and past stays to surface relevant upgrades and experiences.'
                : 'We will only store essential booking details and keep recommendations generic.'}
            </p>
          </div>
        </div>
        <p className="text-xs text-lundies-stone">Privacy-first: update or opt-out any time from your profile controls.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">How should we share itinerary updates?</label>
        <select
          {...register('preferences.communicationPreference')}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal focus:outline-none focus:ring-2 focus:ring-lundies-heather"
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="marketing-opt-in"
          {...register('preferences.marketingOptIn')}
          className="w-4 h-4 rounded border-lundies-stone/60 bg-lundies-stone/40 text-lundies-heather focus:ring-lundies-heather focus:ring-2"
        />
        <label htmlFor="marketing-opt-in" className="text-sm text-lundies-peat cursor-pointer">
          I would like to receive special offers and updates about Schiehallion Hotel
        </label>
      </div>
    </div>
  )

  const renderArrival = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Estimated Arrival Time
        </label>
        <select
          {...register('arrival.estimatedArrivalTime')}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal focus:outline-none focus:ring-2 focus:ring-lundies-heather"
        >
          <option value="">Select arrival time</option>
          {arrivalTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Special Instructions
        </label>
        <textarea
          {...register('arrival.specialInstructions')}
          rows={3}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          placeholder="Any special instructions for your arrival? (e.g., transportation needs, parking requirements)"
        />
      </div>
    </div>
  )

  const renderEmergencyContact = () => (
    <div className="space-y-4">
      <p className="text-lundies-peat text-sm mb-4">
        Emergency contact information helps us assist you better in case of any unforeseen circumstances.
      </p>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Contact Name
        </label>
        <input
          {...register('emergencyContact.name')}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          placeholder="Emergency contact name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Contact Phone
        </label>
        <input
          type="tel"
          {...register('emergencyContact.phone')}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          placeholder="Emergency contact phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-lundies-peat mb-2">
          Relationship
        </label>
        <input
          {...register('emergencyContact.relationship')}
          className="w-full rounded-xl border border-lundies-stone/60 bg-lundies-stone/40 px-4 py-3 text-lundies-charcoal placeholder-lundies-peat focus:outline-none focus:ring-2 focus:ring-lundies-heather"
          placeholder="Relationship to you (e.g., spouse, parent, sibling)"
        />
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return renderPersonalInfo()
      case 'address':
        return renderAddress()
      case 'preferences':
        return renderPreferences()
      case 'arrival':
        return renderArrival()
      case 'emergency':
        return renderEmergencyContact()
      default:
        return null
    }
  }

  const currentStepData = steps[currentStepIndex]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${index <= currentStepIndex
                  ? 'bg-lundies-heather text-lundies-charcoal'
                  : 'bg-lundies-stone/60 text-lundies-peat'
                }
              `}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="w-full bg-lundies-stone/60 rounded-full h-2">
          <div
            className="bg-lundies-heather h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-3xl border border-lundies-stone/60 bg-white/90 backdrop-blur-sm p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-lundies-charcoal mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-lundies-peat">
            {currentStepData.description}
          </p>
        </div>

        <form onSubmit={handleSubmit(() => handleNext())}>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStepIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 rounded-full border border-lundies-stone/60 text-lundies-peat hover:bg-lundies-stone/20 transition"
                >
                  Previous
                </button>
              ) : onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 rounded-full border border-lundies-stone/60 text-lundies-peat hover:bg-lundies-stone/20 transition"
                >
                  Back to Cart
                </button>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-full bg-lundies-heather text-lundies-charcoal font-semibold hover:bg-lundies-heather/80 transition disabled:opacity-50"
            >
              {isLoading
                ? 'Processing...'
                : isLastStep
                  ? 'Complete Booking'
                  : 'Next'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GuestInfoForm