export type AttractionCategory =
  | 'outdoor'
  | 'culture'
  | 'family'
  | 'food-drink'
  | 'wellness'
  | 'adventure'

export interface Attraction {
  id: string
  name: string
  description: string
  category: AttractionCategory
  coordinates: { lat: number; lng: number }
  highlights: string[]
  tags: string[]
  idealWeather: Array<'dry' | 'wet' | 'snow' | 'any' | 'cloudy'>
  recommendedDurations: {
    walk: number
    drive: number
    onSite: number
  }
  bookingUrl: string
  operatingHours: { day: string; hours: string }[]
  seasonalNote?: string
}

export interface WeatherContext {
  condition: 'sunny' | 'cloudy' | 'rain' | 'snow' | 'windy'
  temperatureCelsius?: number
}

const HOTEL_COORDINATES = {
  lat: 56.620601,
  lng: -3.86738,
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180
}

function calculateDistanceKm(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): number {
  const earthRadiusKm = 6371
  const dLat = toRadians(destination.lat - origin.lat)
  const dLon = toRadians(destination.lng - origin.lng)

  const lat1 = toRadians(origin.lat)
  const lat2 = toRadians(destination.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(earthRadiusKm * c * 10) / 10
}

export function getDistanceFromHotel(attraction: Attraction): number {
  return calculateDistanceKm(HOTEL_COORDINATES, attraction.coordinates)
}

export function getTravelMinutes(attraction: Attraction, mode: 'walk' | 'drive'): number {
  const distanceKm = getDistanceFromHotel(attraction)
  if (mode === 'walk') {
    const walkingSpeedKmh = 4.2
    return Math.round(((distanceKm / walkingSpeedKmh) * 60 + attraction.recommendedDurations.onSite) / 5) * 5
  }

  const drivingSpeedKmh = 50
  return Math.round(((distanceKm / drivingSpeedKmh) * 60 + attraction.recommendedDurations.onSite) / 5) * 5
}

export function formatOperatingHours(attraction: Attraction): string {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' })
  const entry = attraction.operatingHours.find(item => item.day.toLowerCase() === today.toLowerCase())
  if (entry) {
    return entry.hours
  }
  const weekend = attraction.operatingHours.find(item => ['saturday', 'sunday'].includes(item.day.toLowerCase()))
  return weekend ? weekend.hours : 'See partner site'
}

export const attractions: Attraction[] = [
  {
    id: 'dewars-distillery',
    name: "Dewar's Aberfeldy Distillery",
    description: 'Award-winning whisky experience with cask tastings and the immersive Whisky Lounge.',
    category: 'food-drink',
    coordinates: { lat: 56.62237, lng: -3.8578 },
    highlights: ['Cask tasting', 'Heritage exhibition', 'Local chocolate pairing'],
    tags: ['whisky', 'rainy-day', 'heritage', 'tasting'],
    idealWeather: ['wet', 'snow', 'any'],
    recommendedDurations: { walk: 20, drive: 8, onSite: 120 },
    bookingUrl: 'https://www.dewars.com/en/distilleries/aberfeldy/visit/',
    operatingHours: [
      { day: 'Monday', hours: '10:00 - 17:00' },
      { day: 'Tuesday', hours: '10:00 - 17:00' },
      { day: 'Wednesday', hours: '10:00 - 17:00' },
      { day: 'Thursday', hours: '10:00 - 17:00' },
      { day: 'Friday', hours: '10:00 - 18:00' },
      { day: 'Saturday', hours: '10:00 - 18:00' },
      { day: 'Sunday', hours: '10:00 - 17:00' },
    ],
    seasonalNote: 'Pre-book for the cask draw experience during winter weekends.',
  },
  {
    id: 'loch-tay-cruises',
    name: 'Loch Tay Safaris',
    description: 'Fast RIB boat tours uncover island stories, wildlife, and Highland folklore.',
    category: 'adventure',
    coordinates: { lat: 56.57494, lng: -3.99921 },
    highlights: ['Island folklore', 'Wildlife spotting', 'Heated cabin'],
    tags: ['boat', 'scenic', 'family', 'wildlife'],
    idealWeather: ['dry', 'cloudy'],
    recommendedDurations: { walk: 0, drive: 25, onSite: 120 },
    bookingUrl: 'https://www.lochtaysafaris.net/',
    operatingHours: [
      { day: 'Monday', hours: 'Tours 10:00 - 16:00' },
      { day: 'Friday', hours: 'Tours 10:00 - 16:00' },
      { day: 'Saturday', hours: 'Tours 09:00 - 17:00' },
      { day: 'Sunday', hours: 'Tours 09:00 - 17:00' },
    ],
    seasonalNote: 'Thermal jackets provided; best at golden hour for photography.',
  },
  {
    id: 'taymouth-e-bikes',
    name: 'Taymouth E-Bike Trails',
    description: 'Guided e-bike adventures through Kenmore, Glen Lyon, and Tay Forest Park.',
    category: 'adventure',
    coordinates: { lat: 56.58402, lng: -3.9694 },
    highlights: ['Guided rides', 'Picnic spots', 'Beginner friendly'],
    tags: ['cycling', 'outdoor', 'wellness', 'family'],
    idealWeather: ['dry', 'cloudy'],
    recommendedDurations: { walk: 0, drive: 20, onSite: 180 },
    bookingUrl: 'https://www.aberfeldy-bikeshop.co.uk/',
    operatingHours: [
      { day: 'Monday', hours: '09:30 - 17:00' },
      { day: 'Tuesday', hours: '09:30 - 17:00' },
      { day: 'Wednesday', hours: '09:30 - 17:00' },
      { day: 'Thursday', hours: '09:30 - 17:00' },
      { day: 'Friday', hours: '09:30 - 17:00' },
      { day: 'Saturday', hours: '09:00 - 17:30' },
    ],
  },
  {
    id: 'castle-menzies',
    name: 'Castle Menzies',
    description: '16th-century seat of Clan Menzies with guided tours and Jacobite history.',
    category: 'culture',
    coordinates: { lat: 56.62482, lng: -3.90235 },
    highlights: ['Clan history', 'Guided tours', 'Walled gardens'],
    tags: ['history', 'architecture', 'rainy-day'],
    idealWeather: ['any', 'wet'],
    recommendedDurations: { walk: 25, drive: 10, onSite: 90 },
    bookingUrl: 'https://www.castlemenzies.org/',
    operatingHours: [
      { day: 'Monday', hours: '10:30 - 16:30' },
      { day: 'Thursday', hours: '10:30 - 16:30' },
      { day: 'Friday', hours: '10:30 - 16:30' },
      { day: 'Saturday', hours: '10:30 - 16:30' },
      { day: 'Sunday', hours: '12:30 - 16:30' },
    ],
  },
  {
    id: 'birks-of-aberfeldy',
    name: 'Birks of Aberfeldy',
    description: 'Woodland gorge walk with waterfalls and scenic viewpoints immortalised by Robert Burns.',
    category: 'outdoor',
    coordinates: { lat: 56.62088, lng: -3.85566 },
    highlights: ['Waterfalls', 'Accessible trail', 'Autumn colours'],
    tags: ['hiking', 'photography', 'family'],
    idealWeather: ['dry', 'cloudy'],
    recommendedDurations: { walk: 15, drive: 5, onSite: 120 },
    bookingUrl: 'https://www.walkhighlands.co.uk/perthshire/birks-of-aberfeldy.shtml',
    operatingHours: [
      { day: 'Monday', hours: 'Open all day' },
      { day: 'Tuesday', hours: 'Open all day' },
      { day: 'Wednesday', hours: 'Open all day' },
      { day: 'Thursday', hours: 'Open all day' },
      { day: 'Friday', hours: 'Open all day' },
      { day: 'Saturday', hours: 'Open all day' },
      { day: 'Sunday', hours: 'Open all day' },
    ],
  },
  {
    id: 'highland-safaris',
    name: 'Highland Safaris & Red Deer Centre',
    description: 'Land Rover safaris to 3,000ft viewpoints, with red deer encounters and gold panning.',
    category: 'family',
    coordinates: { lat: 56.58246, lng: -3.95702 },
    highlights: ['Mountain viewpoints', 'Red deer experience', 'Gold panning'],
    tags: ['family', 'wildlife', 'adventure'],
    idealWeather: ['any'],
    recommendedDurations: { walk: 0, drive: 20, onSite: 150 },
    bookingUrl: 'https://www.highlandsafaris.net/',
    operatingHours: [
      { day: 'Monday', hours: '09:00 - 17:00' },
      { day: 'Tuesday', hours: '09:00 - 17:00' },
      { day: 'Wednesday', hours: '09:00 - 17:00' },
      { day: 'Thursday', hours: '09:00 - 17:00' },
      { day: 'Friday', hours: '09:00 - 17:00' },
      { day: 'Saturday', hours: '09:00 - 17:00' },
      { day: 'Sunday', hours: '09:00 - 17:00' },
    ],
  },
  {
    id: 'aberfeldy-watermill',
    name: 'The Watermill Bookshop & Gallery',
    description: 'Award-winning bookshop housed in a converted oatmeal mill with café and art gallery.',
    category: 'culture',
    coordinates: { lat: 56.62023, lng: -3.86244 },
    highlights: ['Independent books', 'Exhibitions', 'Coffee & cakes'],
    tags: ['rainy-day', 'culture', 'food'],
    idealWeather: ['wet', 'snow', 'any'],
    recommendedDurations: { walk: 5, drive: 2, onSite: 90 },
    bookingUrl: 'https://www.aberfeldywatermill.com/',
    operatingHours: [
      { day: 'Monday', hours: '10:00 - 17:00' },
      { day: 'Tuesday', hours: '10:00 - 17:00' },
      { day: 'Wednesday', hours: '10:00 - 17:00' },
      { day: 'Thursday', hours: '10:00 - 17:00' },
      { day: 'Friday', hours: '10:00 - 17:00' },
      { day: 'Saturday', hours: '09:30 - 17:30' },
      { day: 'Sunday', hours: '11:00 - 16:30' },
    ],
  },
  {
    id: 'wellness-spa',
    name: 'Moness Spa Rituals',
    description: 'Thermal suite, outdoor hot tub, and Highland-inspired treatments minutes from the hotel.',
    category: 'wellness',
    coordinates: { lat: 56.62043, lng: -3.86134 },
    highlights: ['Thermal suite', 'Outdoor hot tub', 'Gaelic-inspired treatments'],
    tags: ['wellness', 'rainy-day', 'relaxation'],
    idealWeather: ['wet', 'snow', 'any'],
    recommendedDurations: { walk: 6, drive: 2, onSite: 120 },
    bookingUrl: 'https://www.moness.com/spa',
    operatingHours: [
      { day: 'Monday', hours: '10:00 - 18:00' },
      { day: 'Tuesday', hours: '10:00 - 18:00' },
      { day: 'Wednesday', hours: '10:00 - 18:00' },
      { day: 'Thursday', hours: '10:00 - 18:00' },
      { day: 'Friday', hours: '10:00 - 19:00' },
      { day: 'Saturday', hours: '09:00 - 19:00' },
      { day: 'Sunday', hours: '09:00 - 18:00' },
    ],
  },
]

const WEATHER_TAGS: Record<WeatherContext['condition'], Array<'dry' | 'wet' | 'snow' | 'any'>> = {
  sunny: ['dry', 'any'],
  cloudy: ['dry', 'any'],
  rain: ['wet', 'any'],
  snow: ['snow', 'any'],
  windy: ['any', 'dry'],
}

export interface AttractionMatchOptions {
  interests?: string[]
  weather?: WeatherContext
  limit?: number
}

function scoreAttraction(attraction: Attraction, interests: string[], weather?: WeatherContext): number {
  let score = 0
  if (interests.length) {
    score += interests.filter(interest => attraction.tags.includes(interest)).length * 2
  }

  if (weather) {
    const allowedConditions = WEATHER_TAGS[weather.condition]
    if (attraction.idealWeather.some(condition => allowedConditions.includes(condition))) {
      score += 1
    }
    if (weather.condition === 'sunny' && attraction.category === 'outdoor') {
      score += 1
    }
    if (weather.condition === 'rain' && attraction.tags.includes('rainy-day')) {
      score += 2
    }
  }

  return score
}

export function getAttractions(options: AttractionMatchOptions = {}): Attraction[] {
  const { interests = [], weather, limit = 3 } = options
  const scored = attractions
    .map(attraction => ({
      attraction,
      score: scoreAttraction(attraction, interests, weather),
    }))
    .filter(item => item.score > 0 || interests.length === 0)
    .sort((a, b) => b.score - a.score || getDistanceFromHotel(a.attraction) - getDistanceFromHotel(b.attraction))

  return scored.slice(0, limit).map(item => item.attraction)
}

export function getSuggestedInterestsFromMessage(message: string): string[] {
  const lower = message.toLowerCase()
  const interestMap: Record<string, string> = {
    hike: 'hiking',
    hiking: 'hiking',
    walk: 'hiking',
    whisky: 'whisky',
    distillery: 'whisky',
    museum: 'history',
    castle: 'history',
    family: 'family',
    kids: 'family',
    spa: 'wellness',
    relax: 'wellness',
    bike: 'cycling',
    cycle: 'cycling',
    cycling: 'cycling',
    food: 'food',
    rain: 'rainy-day',
    rainy: 'rainy-day',
    photography: 'photography',
    wildlife: 'wildlife',
    boat: 'boat',
  }

  const interests = new Set<string>()
  for (const [keyword, tag] of Object.entries(interestMap)) {
    if (lower.includes(keyword)) {
      interests.add(tag)
    }
  }

  return Array.from(interests)
}

export function getWeatherContextFromMessage(message: string): WeatherContext | undefined {
  const lower = message.toLowerCase()
  if (lower.includes('rain') || lower.includes('wet')) {
    return { condition: 'rain' }
  }
  if (lower.includes('snow')) {
    return { condition: 'snow' }
  }
  if (lower.includes('wind')) {
    return { condition: 'windy' }
  }
  if (lower.includes('sun') || lower.includes('clear')) {
    return { condition: 'sunny' }
  }
  return undefined
}
