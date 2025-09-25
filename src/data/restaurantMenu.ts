export type DietaryTag =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'pescatarian'
  | 'halal'
  | 'contains-alcohol'

export interface MenuItem {
  id: string
  name: string
  description: string
  course: 'breakfast' | 'starter' | 'main' | 'dessert' | 'bar' | 'kids'
  price: number
  dietary: DietaryTag[]
  allergens: string[]
  highlights?: string[]
  winePairing?: string
  availablePeriods: ('breakfast' | 'lunch' | 'dinner' | 'late-night')[]
  isDailySpecial?: boolean
}

export interface DailySpecial {
  id: string
  name: string
  description: string
  dietary: DietaryTag[]
  allergens: string[]
  price: number
  availableOn: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>
  pairingSuggestion?: string
}

export const menuItems: MenuItem[] = [
  {
    id: 'heather-porridge',
    name: 'Heather Honey Porridge',
    description: 'Scottish oats with heather honey, brambles, and toasted hazelnut crumb.',
    course: 'breakfast',
    price: 850,
    dietary: ['vegetarian'],
    allergens: ['gluten', 'nuts', 'dairy'],
    availablePeriods: ['breakfast'],
    highlights: ['Locally milled oats', 'Honey from Highland apiaries'],
  },
  {
    id: 'smoked-salmon-benedict',
    name: 'Smoked Salmon Benedict',
    description: 'Gluten-free oatcake base, Highland smoked salmon, poached egg, citrus hollandaise.',
    course: 'breakfast',
    price: 1250,
    dietary: ['pescatarian', 'gluten-free'],
    allergens: ['fish', 'eggs', 'dairy'],
    availablePeriods: ['breakfast'],
    highlights: ['GF oatcake', 'Cold-smoked salmon from Dunkeld'],
  },
  {
    id: 'foraged-mushroom-broth',
    name: 'Foraged Mushroom Broth',
    description: 'Wild mushrooms, Douglas fir oil, pickled chanterelles, seaweed crisp.',
    course: 'starter',
    price: 950,
    dietary: ['vegan'],
    allergens: ['mushrooms'],
    availablePeriods: ['lunch', 'dinner'],
    winePairing: 'Light Jura Chardonnay',
  },
  {
    id: 'perthshire-venison',
    name: 'Perthshire Venison Loin',
    description: 'Herb-crusted venison, charred celeriac, bramble jus, chocolate malt crumb.',
    course: 'main',
    price: 2650,
    dietary: ['contains-alcohol'],
    allergens: ['sulphites'],
    availablePeriods: ['dinner'],
    winePairing: 'Northern Rhône Syrah',
  },
  {
    id: 'gaelic-sea-trout',
    name: 'Gaelic Sea Trout',
    description: 'Seared trout, sea vegetables, fennel pollen, whisky beurre blanc.',
    course: 'main',
    price: 2450,
    dietary: ['pescatarian'],
    allergens: ['fish', 'dairy'],
    availablePeriods: ['lunch', 'dinner'],
    winePairing: 'Assyrtiko, Santorini',
  },
  {
    id: 'heritage-beetroot-tarte',
    name: 'Heritage Beetroot Tarte Tatin',
    description: 'Roasted beetroot, smoked almond praline, vegan crème fraîche.',
    course: 'main',
    price: 1950,
    dietary: ['vegan'],
    allergens: ['nuts'],
    availablePeriods: ['dinner'],
    winePairing: 'Pinot Noir, Central Otago',
  },
  {
    id: 'gluten-free-sticky-toffee',
    name: 'Barley-Free Sticky Toffee Pudding',
    description: 'Date sponge, whisky caramel, Perthshire cream, toasted oats.',
    course: 'dessert',
    price: 850,
    dietary: ['vegetarian'],
    allergens: ['dairy', 'eggs'],
    availablePeriods: ['lunch', 'dinner'],
    winePairing: 'PX Sherry',
  },
  {
    id: 'kids-bothy-burger',
    name: 'Kids Bothy Burger',
    description: 'Grass-fed beef slider, brioche, cheddar, carrot fries, apple slaw.',
    course: 'kids',
    price: 950,
    dietary: ['nut-free'],
    allergens: ['gluten', 'dairy'],
    availablePeriods: ['lunch', 'dinner'],
  },
  {
    id: 'wild-garlic-gnocchi',
    name: 'Wild Garlic Gnocchi',
    description: 'Potato gnocchi, nettle pesto, pickled girolles, toasted seeds.',
    course: 'main',
    price: 2100,
    dietary: ['vegetarian'],
    allergens: ['dairy', 'seeds'],
    availablePeriods: ['dinner'],
    winePairing: 'Verdejo, Rueda',
  },
  {
    id: 'cairngorm-old-fashioned',
    name: 'Cairngorm Old Fashioned',
    description: '12-year single malt, heather syrup, smoked bitters, orange oils.',
    course: 'bar',
    price: 1150,
    dietary: ['contains-alcohol'],
    allergens: [],
    availablePeriods: ['late-night', 'dinner'],
  },
]

export const dailySpecials: DailySpecial[] = [
  {
    id: 'lobster-supper-club',
    name: 'Loch Etive Lobster Supper',
    description: 'Charcoal-grilled lobster, kelp butter, Isle of Mull cheddar gratin.',
    dietary: ['pescatarian'],
    allergens: ['shellfish', 'dairy'],
    price: 3200,
    availableOn: ['friday', 'saturday'],
    pairingSuggestion: 'Champagne Blanc de Blancs',
  },
  {
    id: 'gaelic-vegan-feast',
    name: 'Gaelic Garden Feast',
    description: 'Seasonal garden vegetables, oat-smoked carrots, herbal broth.',
    dietary: ['vegan'],
    allergens: [],
    price: 2400,
    availableOn: ['wednesday', 'thursday'],
    pairingSuggestion: 'Organic Grüner Veltliner',
  },
  {
    id: 'sunday-supper',
    name: 'Sunday Bothy Roast',
    description: 'Highland beef, roasted roots, bone-marrow gravy, gluten-free Yorkshire.',
    dietary: ['gluten-free'],
    allergens: ['dairy'],
    price: 2650,
    availableOn: ['sunday'],
    pairingSuggestion: 'Bordeaux blend',
  },
]

export function findMenuMatches(tags: DietaryTag[], includeAlcohol = true): MenuItem[] {
  return menuItems.filter(item => {
    const meetsDiet = tags.every(tag => item.dietary.includes(tag))
    const respectsAlcohol = includeAlcohol || !item.dietary.includes('contains-alcohol')
    return meetsDiet && respectsAlcohol
  })
}

export function getMenuByCourse(course: MenuItem['course']): MenuItem[] {
  return menuItems.filter(item => item.course === course)
}

export function getPairingsForItems(items: MenuItem[]): string[] {
  return items
    .map(item => item.winePairing)
    .filter((pairing): pairing is string => Boolean(pairing))
}

export function getActiveDailySpecials(date: Date = new Date()): DailySpecial[] {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase() as DailySpecial['availableOn'][number]
  return dailySpecials.filter(special => special.availableOn.includes(weekday))
}
