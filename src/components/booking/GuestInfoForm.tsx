// Epic 5: Guest Information Form Component
// SCHH-015: Guest Information Form

'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { GuestFormData } from '@/types/hotel'

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
        marketingOptIn: false,
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

  const {
    fields: dietaryFields,
    append: appendDietary,
    remove: removeDietary
  } = useFieldArray({
    control,
    name: 'preferences.dietaryRequirements' as const
  })

  const {
    fields: accessibilityFields,
    append: appendAccessibility,
    remove: removeAccessibility
  } = useFieldArray({
    control,
    name: 'preferences.accessibilityNeeds' as const
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
          <label className="block text-sm font-medium text-slate-300 mb-2">
            First Name *
          </label>
          <input
            {...register('personalInfo.firstName', {
              required: 'First name is required'
            })}
            className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Enter your first name"
          />
          {errors.personalInfo?.firstName && (
            <p className="text-red-400 text-sm mt-1">{errors.personalInfo.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Last Name *
          </label>
          <input
            {...register('personalInfo.lastName', {
              required: 'Last name is required'
            })}
            className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Enter your last name"
          />
          {errors.personalInfo?.lastName && (
            <p className="text-red-400 text-sm mt-1">{errors.personalInfo.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
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
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Enter your email address"
        />
        {errors.personalInfo?.email && (
          <p className="text-red-400 text-sm mt-1">{errors.personalInfo.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          {...register('personalInfo.phone', {
            required: 'Phone number is required'
          })}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Enter your phone number"
        />
        {errors.personalInfo?.phone && (
          <p className="text-red-400 text-sm mt-1">{errors.personalInfo.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Date of Birth (Optional)
        </label>
        <input
          type="date"
          {...register('personalInfo.dateOfBirth')}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>
    </div>
  )

  const renderAddress = () => (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm mb-4">
        Providing your address helps us with check-in and any postal communications.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Street Address
        </label>
        <input
          {...register('address.street')}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Enter your street address"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            City
          </label>
          <input
            {...register('address.city')}
            className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Enter your city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Postcode
          </label>
          <input
            {...register('address.postcode')}
            className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Enter your postcode"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Country
        </label>
        <select
          {...register('address.country')}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Special Requests
        </label>
        <textarea
          {...register('preferences.specialRequests')}
          rows={4}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Any special requests for your stay? (e.g., high floor, quiet room, early check-in)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
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
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                    : 'border-white/20 bg-white/5 text-slate-300 hover:bg-white/10'
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
        <label className="block text-sm font-medium text-slate-300 mb-3">
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
                    ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                    : 'border-white/20 bg-white/5 text-slate-300 hover:bg-white/10'
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="marketing-opt-in"
          {...register('preferences.marketingOptIn')}
          className="w-4 h-4 rounded border-white/20 bg-black/30 text-emerald-400 focus:ring-emerald-400 focus:ring-2"
        />
        <label htmlFor="marketing-opt-in" className="text-sm text-slate-300 cursor-pointer">
          I would like to receive special offers and updates about Schiehallion Hotel
        </label>
      </div>
    </div>
  )

  const renderArrival = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Estimated Arrival Time
        </label>
        <select
          {...register('arrival.estimatedArrivalTime')}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Special Instructions
        </label>
        <textarea
          {...register('arrival.specialInstructions')}
          rows={3}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Any special instructions for your arrival? (e.g., transportation needs, parking requirements)"
        />
      </div>
    </div>
  )

  const renderEmergencyContact = () => (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm mb-4">
        Emergency contact information helps us assist you better in case of any unforeseen circumstances.
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Contact Name
        </label>
        <input
          {...register('emergencyContact.name')}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Emergency contact name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Contact Phone
        </label>
        <input
          type="tel"
          {...register('emergencyContact.phone')}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          placeholder="Emergency contact phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Relationship
        </label>
        <input
          {...register('emergencyContact.relationship')}
          className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
                  ? 'bg-emerald-400 text-slate-900'
                  : 'bg-slate-700 text-slate-400'
                }
              `}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-sm p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-slate-400">
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
                  className="px-6 py-3 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition"
                >
                  Previous
                </button>
              ) : onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 transition"
                >
                  Back to Cart
                </button>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold hover:bg-emerald-300 transition disabled:opacity-50"
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