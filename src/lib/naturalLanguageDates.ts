function addDays(date: Date, amount: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function addWeeks(date: Date, amount: number): Date {
  return addDays(date, amount * 7)
}

function nextDay(date: Date, targetDay: number): Date {
  const result = new Date(date)
  const currentDay = result.getDay()
  const delta = (targetDay + 7 - currentDay) % 7 || 7
  result.setDate(result.getDate() + delta)
  return result
}

function parseIsoDate(value: string): Date {
  return new Date(value)
}

function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export interface ParsedStayRequest {
  checkIn?: Date
  checkOut?: Date
  nights?: number
  guests?: number
}

const MONTH_VARIANTS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const RELATIVE_KEYWORDS: Record<string, (base: Date) => Date> = {
  today: base => base,
  tonight: base => base,
  tomorrow: base => addDays(base, 1),
  weekend: base => {
    const saturday = nextDay(base, 6)
    return saturday
  },
  'next weekend': base => addWeeks(nextDay(base, 6), 1),
  'this weekend': base => nextDay(base, 6),
  'next week': base => addWeeks(base, 1),
}

const GUEST_PATTERNS = [
  /(\d+)\s?(guests|people|adults)/i,
  /(party of|for)\s?(\d+)/i,
]

const NIGHT_PATTERNS = [
  /(\d+)\s?(night|nights)/i,
  /(\d+)\s?(evening|evenings)/i,
]

const RANGE_PATTERNS = [
  /(from|starting)\s+([a-z0-9\s]+)\s+(to|until|through)\s+([a-z0-9\s]+)/i,
  /([0-9]{1,2} [a-z]+)\s*(?:-|to)\s*([0-9]{1,2} [a-z]+)/i,
]

function normalise(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

function parseMonthDate(fragment: string, baseYear: number): Date | undefined {
  const clean = fragment.replace(/(st|nd|rd|th)/g, '')
  const parts = clean.split(' ')
  if (parts.length < 2) return undefined

  const day = parseInt(parts[0], 10)
  const monthName = parts[1]
  const monthIndex = MONTH_VARIANTS.indexOf(monthName.toLowerCase())

  if (Number.isNaN(day) || monthIndex === -1) return undefined

  const candidate = new Date(baseYear, monthIndex, day)
  if (candidate < new Date()) {
    candidate.setFullYear(baseYear + 1)
  }
  return candidate
}

function parseWeekday(fragment: string, baseDate: Date): Date | undefined {
  const weekdayIndex = WEEKDAYS.indexOf(fragment.toLowerCase())
  if (weekdayIndex === -1) return undefined
  return nextDay(baseDate, weekdayIndex)
}

function parseExplicitDate(fragment: string, baseDate: Date): Date | undefined {
  const normalised = normalise(fragment)

  if (MONTH_VARIANTS.some(month => normalised.includes(month))) {
    const parsed = parseMonthDate(normalised, baseDate.getFullYear())
    if (parsed) return parsed
  }

  if (/\d{4}-\d{2}-\d{2}/.test(normalised)) {
    try {
      const isoDate = parseIsoDate(normalised)
      if (!Number.isNaN(isoDate.getTime())) {
        return isoDate
      }
    } catch (error) {
      console.warn('Failed to parse ISO date', error)
    }
  }

  for (const weekday of WEEKDAYS) {
    if (normalised.includes(weekday)) {
      const parsedWeekday = parseWeekday(weekday, baseDate)
      if (parsedWeekday) return parsedWeekday
    }
  }

  return undefined
}

function applyNightsToRange(range: ParsedStayRequest): ParsedStayRequest {
  const { checkIn, nights } = range
  if (checkIn && nights && nights > 0) {
    range.checkOut = addDays(checkIn, nights)
  }
  return range
}

export function parseStayRequest(input: string, baseDate: Date = new Date()): ParsedStayRequest {
  const request: ParsedStayRequest = {}
  const message = normalise(input)

  for (const pattern of GUEST_PATTERNS) {
    const match = message.match(pattern)
    if (match) {
      const guests = parseInt(match[1] || match[2], 10)
      if (!Number.isNaN(guests)) {
        request.guests = guests
        break
      }
    }
  }

  for (const pattern of NIGHT_PATTERNS) {
    const match = message.match(pattern)
    if (match) {
      const nights = parseInt(match[1], 10)
      if (!Number.isNaN(nights)) {
        request.nights = nights
        break
      }
    }
  }

  for (const [keyword, resolver] of Object.entries(RELATIVE_KEYWORDS)) {
    if (message.includes(keyword)) {
      const derived = resolver(baseDate)
      request.checkIn = derived
      break
    }
  }

  for (const pattern of RANGE_PATTERNS) {
    const match = message.match(pattern)
    if (match) {
      const startFragment = match[2]
      const endFragment = match[4]
      const startDate = parseExplicitDate(startFragment, baseDate)
      const endDate = parseExplicitDate(endFragment, baseDate)
      if (startDate) {
        request.checkIn = startDate
      }
      if (endDate) {
        request.checkOut = endDate
      }
      break
    }
  }

  if (!request.checkIn) {
    const explicitDate = parseExplicitDate(message, baseDate)
    if (explicitDate) {
      request.checkIn = explicitDate
    }
  }

  if (request.checkIn && !request.checkOut) {
    if (request.nights) {
      request.checkOut = addDays(request.checkIn, request.nights)
    } else if (message.includes('weekend') && !message.includes('next weekend')) {
      request.checkOut = addDays(request.checkIn, 2)
    } else {
      request.checkOut = addDays(request.checkIn, 1)
    }
  }

  if (!request.nights && request.checkIn && request.checkOut) {
    const nights = Math.max(1, Math.round((request.checkOut.getTime() - request.checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    request.nights = nights
  }

  return applyNightsToRange(request)
}

export function formatStayRange(checkIn: Date, checkOut: Date): { checkIn: string; checkOut: string } {
  return {
    checkIn: formatDateForDisplay(checkIn),
    checkOut: formatDateForDisplay(checkOut),
  }
}
