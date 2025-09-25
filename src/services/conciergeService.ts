import {
  attractions,
  getAttractions,
  getDistanceFromHotel,
  getSuggestedInterestsFromMessage,
  getTravelMinutes,
  getWeatherContextFromMessage,
  formatOperatingHours,
} from '@/data/attractions'
import { findMenuMatches, getActiveDailySpecials, getPairingsForItems, menuItems, DietaryTag } from '@/data/restaurantMenu'
import { parseStayRequest, formatStayRange } from '@/lib/naturalLanguageDates'
import { ConciergeTranslationKey, t } from '@/lib/conciergeI18n'
import { RoomService } from '@/lib/firebase/hotel-service-mock'
import { ConciergeContext, ConciergeIntent, ConciergeReply, SupportedLanguage } from '@/types/concierge'
import type { Room } from '@/types/hotel'

const BOOKING_KEYWORDS = [
  'book',
  'booking',
  'availability',
  'room',
  'suite',
  'stay',
  'night',
  'check-in',
  'check in',
  'check-out',
  'check out',
]

const DINING_KEYWORDS = [
  'menu',
  'dining',
  'restaurant',
  'vegan',
  'vegetarian',
  'gluten',
  'allergy',
  'allergen',
  'dairy',
  'nut',
  'wine',
  'bar',
]

const ATTRACTION_KEYWORDS = [
  'things to do',
  'activities',
  'what can i do',
  'hike',
  'walk',
  'tour',
  'whisky',
  'castle',
  'kids',
  'family',
  'weather',
  'rainy',
  'spa',
  'wellness',
  'outdoor',
  'cycling',
  'bike',
  'boat',
  'adventure',
]

const FALLBACK_QUICK_REPLIES: Array<{ id: string; labelKey: ConciergeTranslationKey; prompt: string }> = [
  { id: 'qr-attractions', labelKey: 'quick.attractions', prompt: 'What can I do nearby today?' },
  { id: 'qr-booking', labelKey: 'quick.booking', prompt: 'Check availability for next weekend for two guests.' },
  { id: 'qr-dining', labelKey: 'quick.dining', prompt: 'Show me gluten-free dinner options.' },
]

const ROOM_TYPE_LABELS: Record<string, string> = {
  standard: 'Standard room',
  deluxe: 'Deluxe room',
  suite: 'Suite',
  family: 'Family room',
  accessible: 'Accessible room',
}

function detectIntent(message: string): ConciergeIntent {
  const lower = message.toLowerCase()

  if (BOOKING_KEYWORDS.some(keyword => lower.includes(keyword))) {
    return 'booking'
  }

  if (DINING_KEYWORDS.some(keyword => lower.includes(keyword))) {
    return 'restaurant'
  }

  if (ATTRACTION_KEYWORDS.some(keyword => lower.includes(keyword))) {
    return 'attractions'
  }

  return 'general'
}

function getQuickReplies(language: SupportedLanguage) {
  return FALLBACK_QUICK_REPLIES.map(item => ({
    id: item.id,
    label: t(language, item.labelKey),
    prompt: item.prompt,
  }))
}

function formatRoomLine(room: Room, language: SupportedLanguage): string {
  const roomLabel = ROOM_TYPE_LABELS[room.type] || `Room ${room.roomNumber}`
  const guests = room.maxOccupancy
  const price = (room.pricing.basePrice / 100).toFixed(2)
  return t(language, 'booking.roomLine', {
    room: `${roomLabel}`,
    guests: String(guests),
    price,
  })
}

function buildBookingReply(message: string, language: SupportedLanguage): Promise<ConciergeReply> {
  const parsed = parseStayRequest(message)

  if (!parsed.checkIn || !parsed.checkOut) {
    return Promise.resolve({
      message: t(language, 'booking.askDates'),
      followUps: [t(language, 'booking.followUp')],
    })
  }

  const checkInIso = parsed.checkIn.toISOString().split('T')[0]
  const checkOutIso = parsed.checkOut.toISOString().split('T')[0]
  const guests = parsed.guests || 2

  return RoomService.getAvailableRooms(checkInIso, checkOutIso, guests)
    .then(rooms => {
      if (!rooms.length) {
        return {
          message: t(language, 'booking.noAvailability'),
          followUps: [t(language, 'booking.followUp')],
          quickReplies: getQuickReplies(language),
        }
      }

      const range = formatStayRange(parsed.checkIn!, parsed.checkOut!)
      const details = rooms.slice(0, 3).map(room => formatRoomLine(room, language))

      const actionUrl = `/booking?checkIn=${checkInIso}&checkOut=${checkOutIso}&guests=${guests}`

      return {
        message: t(language, 'booking.summary', {
          checkIn: range.checkIn,
          checkOut: range.checkOut,
          nights: String(parsed.nights || 1),
        }),
        details,
        actions: [
          {
            label: t(language, 'booking.action'),
            url: actionUrl,
          },
        ],
        followUps: [t(language, 'booking.followUp')],
        contextUpdates: {
          lastIntent: 'booking',
          lastStaySummary: {
            checkIn: range.checkIn,
            checkOut: range.checkOut,
            nights: parsed.nights || 1,
            guests,
          },
        },
      }
    })
}

function resolveDietaryTags(message: string): DietaryTag[] {
  const lower = message.toLowerCase()
  const tags: DietaryTag[] = []
  if (lower.includes('vegan')) tags.push('vegan')
  if (lower.includes('vegetarian')) tags.push('vegetarian')
  if (lower.includes('gluten')) tags.push('gluten-free')
  if (lower.includes('dairy-free') || lower.includes('lactose')) tags.push('dairy-free')
  if (lower.includes('nut')) tags.push('nut-free')
  if (lower.includes('halal')) tags.push('halal')
  if (lower.includes('pescatarian') || lower.includes('fish')) tags.push('pescatarian')
  return Array.from(new Set(tags))
}

function buildRestaurantReply(message: string, language: SupportedLanguage): ConciergeReply {
  const tags = resolveDietaryTags(message)
  const includeAlcohol = !message.toLowerCase().includes('no alcohol')
  const matches = tags.length ? findMenuMatches(tags, includeAlcohol) : menuItems.filter(item => item.course !== 'bar')

  if (!matches.length) {
    return {
      message: t(language, 'restaurant.noMatch'),
      followUps: [t(language, 'restaurant.followUp')],
      quickReplies: getQuickReplies(language),
    }
  }

  const headline = t(language, 'restaurant.intro')
  const summaries = matches.slice(0, 3).map(item => {
    const price = (item.price / 100).toFixed(2)
    const dietary = item.dietary.map(tag => tag.replace('-', ' ')).join(', ')
    return `${item.name} · £${price} · ${dietary}`
  })

  const pairings = getPairingsForItems(matches.slice(0, 3))
  const followUps = [t(language, 'restaurant.followUp')]
  if (pairings.length) {
    followUps.push(t(language, 'restaurant.pairing', { pairing: pairings[0] }))
  }

  const specials = getActiveDailySpecials().map(special => `${special.name} · £${(special.price / 100).toFixed(2)}`)
  const details = [...summaries]
  if (specials.length) {
    details.push(t(language, 'restaurant.special', { special: specials[0] }))
  }

  return {
    message: headline,
    details,
    followUps,
    actions: [
      {
        label: t(language, 'restaurant.action'),
        url: '/restaurant',
      },
    ],
    contextUpdates: {
      lastIntent: 'restaurant',
      lastCuisineFocus: tags.join(', '),
    },
  }
}

function buildAttractionReply(message: string, language: SupportedLanguage): ConciergeReply {
  const interests = getSuggestedInterestsFromMessage(message)
  const weather = getWeatherContextFromMessage(message)
  const results = getAttractions({ interests, weather, limit: 3 })

  if (!results.length) {
    const topPicks = attractions.slice(0, 3)
    return {
      message: t(language, 'attractions.noMatch'),
      details: topPicks.map(attraction => {
        const distance = getDistanceFromHotel(attraction)
        return `${attraction.name} · ${distance} km`
      }),
      followUps: [t(language, 'attractions.followUp')],
      quickReplies: getQuickReplies(language),
    }
  }

  const details = results.map(attraction => {
    const distance = getDistanceFromHotel(attraction)
    const travel = getTravelMinutes(attraction, 'drive')
    const highlights = attraction.highlights.slice(0, 2).join(' / ')
    return t(language, 'attractions.detail', {
      name: attraction.name,
      distance: distance.toFixed(1),
      duration: String(travel),
      highlights,
    })
  })

  const hours = results.map(attraction => t(language, 'attractions.hours', { hours: formatOperatingHours(attraction) }))
  const actions = results.map(attraction => ({
    label: t(language, 'attractions.link'),
    url: attraction.bookingUrl,
  }))

  return {
    message: t(language, 'attractions.intro'),
    details: [...details, ...hours],
    actions,
    followUps: [t(language, 'attractions.followUp')],
    contextUpdates: {
      lastIntent: 'attractions',
      lastAttractionInterests: interests,
    },
  }
}

function buildGeneralReply(language: SupportedLanguage): ConciergeReply {
  return {
    message: t(language, 'general.fallback'),
    followUps: [t(language, 'general.helpOptions')],
    quickReplies: getQuickReplies(language),
  }
}

export async function processConciergeMessage(
  message: string,
  options: { language: SupportedLanguage; context?: ConciergeContext }
): Promise<{ reply: ConciergeReply; context: ConciergeContext }> {
  const language = options.language
  const currentContext: ConciergeContext = options.context || { language }
  const intent = detectIntent(message)

  let reply: ConciergeReply
  switch (intent) {
    case 'booking':
      reply = await buildBookingReply(message, language)
      break
    case 'restaurant':
      reply = buildRestaurantReply(message, language)
      break
    case 'attractions':
      reply = buildAttractionReply(message, language)
      break
    default:
      reply = buildGeneralReply(language)
      break
  }

  const updatedContext: ConciergeContext = {
    ...currentContext,
    language,
    lastIntent: intent,
    ...reply.contextUpdates,
  }

  return { reply, context: updatedContext }
}

export function getWelcomeMessages(language: SupportedLanguage) {
  return [
    t(language, 'welcome.greeting'),
    t(language, 'welcome.capabilities'),
    t(language, 'welcome.prompt'),
  ]
}

export function getInputPlaceholder(language: SupportedLanguage) {
  return t(language, 'input.placeholder')
}

export function getQuickReplyTemplates(language: SupportedLanguage) {
  return getQuickReplies(language)
}
