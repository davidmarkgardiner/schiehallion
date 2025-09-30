
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { lazy, Suspense } from 'react'

import LoginForm from '@/components/LoginForm'
import SiteNavigation from '@/components/navigation/SiteNavigation'
import RevealOnScroll from '@/components/motion/RevealOnScroll'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { useAuth } from '@/context/AuthContext'

const ConciergeChatWidget = lazy(() => import('@/components/concierge/ConciergeChatWidget'))

const landingSections = [
  { label: 'Rooms Overview', href: '/#rooms' },
  { label: 'Dining Journey', href: '/#dining' },
  { label: 'Experiences', href: '/#experiences' },
  { label: 'Technology', href: '/#technology' },
  { label: 'Concierge', href: '/#concierge' },
  { label: 'Operations', href: '/#operations' },
  { label: 'Recognition', href: '/#awards' },
  { label: 'Connect', href: '/#contact' },
]

const heroSlides = [
  {
    imageSrc: '/images/rooms/generated/suite/suite-artistic-1759248824246-ur9015.png',
    alt: 'Loft suite with sculptural freestanding bath overlooking Highland scenery',
    caption: 'Loft Perspectives',
  },
  {
    imageSrc: '/images/rooms/generated/deluxe/deluxe-artistic-1759248801864-outd2c.png',
    alt: 'Deluxe guest room with layered textures and warm lighting',
    caption: 'Textured Comfort',
  },
  {
    imageSrc: '/images/rooms/generated/standard/standard-artistic-1759248767421-r0mln6.png',
    alt: 'Elegant bedroom with window seat and tranquil tones',
    caption: 'Calm Outlooks',
  },
  {
    imageSrc: '/images/rooms/generated/family/family-artistic-1759248840189-b78zgy.png',
    alt: 'Family suite lounge with generous seating and natural materials',
    caption: 'Gathered Moments',
  },
]

const heroStats = [
  { label: 'Rooms & suites', value: '15+' },
  { label: 'Guest rating', value: '4.8/5' },
  { label: 'Local partners', value: '12' },
]

const roomStories = [
  {
    name: 'Highland View Double',
    vibe: 'Loch outlook',
    imageSrc: '/images/rooms/generated/standard/standard-artistic-1759248767421-r0mln6.png',
    alt: 'Sunlit double bedroom with Highland views',
    summary: 'A cocoon for weekend explorers with sunrise pastries and soft linens.',
    occupancy: '2 adults · 1 child',
    packages: ['Bed & Breakfast', 'Dinner Stay'],
    features: ['Super-king bed', 'Rainfall walk-in shower', 'Curated welcome hamper'],
  },
  {
    name: 'Riverside Twin Retreat',
    vibe: 'Work-friendly',
    imageSrc: '/images/rooms/generated/accessible/accessible-artistic-1759248857443-57441r.png',
    alt: 'Accessible twin bedroom with generous workspace',
    summary: 'Perfect for business travellers with ergonomic touches and ultrafast WiFi.',
    occupancy: '2 adults',
    packages: ['Room Only', 'Corporate Express'],
    features: ['Dedicated workspace', 'Same-day laundry', '24-hour concierge notes'],
  },
  {
    name: 'Family Cairngorm Suite',
    vibe: 'Interconnected',
    imageSrc: '/images/rooms/generated/family/family-artistic-1759248840189-b78zgy.png',
    alt: 'Family suite lounge with generous sofa and natural textures',
    summary: 'Playful nooks and flexible sleeping for Highland adventures together.',
    occupancy: '2 adults · 2 children',
    packages: ['Family Adventure', 'Breakfast & Supper'],
    features: ['Kids hideaway', 'Games library', 'Beyond Adventure perks'],
  },
  {
    name: 'Deluxe Schiehallion Loft',
    vibe: 'Romantic finish',
    imageSrc: '/images/rooms/generated/suite/suite-artistic-1759248824246-ur9015.png',
    alt: 'Deluxe loft suite with sculptural bath and skylight',
    summary: 'Our signature loft for celebratory stays with private concierge rituals.',
    occupancy: '2 adults',
    packages: ['Celebration Stay', 'Tasting Journey'],
    features: ['In-room telescope', 'Freestanding bath', 'Private arrival tasting'],
  },
]

const diningMoments = [
  {
    title: 'Morning Table',
    description: 'Freshly baked rolls, Glen Lyon coffee, and quick bites for dawn departures.',
    highlights: ['Seasonal patisserie', 'Express picnic prep', 'Allergen-friendly choices'],
    imageSrc: '/images/rooms/generated/deluxe/deluxe-artistic-1759248801864-outd2c.png',
    alt: 'Breakfast spread with pastries and coffee in a soft-lit dining room',
  },
  {
    title: 'Tasting Journey',
    description: 'Seven-course storytelling with Perthshire produce and sommelier pairings.',
    highlights: ['Foraged ingredients', 'Wine flights', 'Chef table moments'],
    imageSrc: '/images/rooms/generated/suite/suite-artistic-1759248824246-ur9015.png',
    alt: 'Elegant dining setting with soft candlelight',
  },
  {
    title: 'Weekend Rituals',
    description: 'Afternoon teas and Sunday roasts with live carve stations for families.',
    highlights: ['Highland desserts', 'Kids tasting plates', 'Roast countdown'],
    imageSrc: '/images/rooms/generated/standard/standard-artistic-1759248767421-r0mln6.png',
    alt: 'Dining room with banquette seating and warm timber finishes',
  },
]

const experienceHighlights = [
  {
    name: 'Dewars Distillery',
    distance: '2 miles',
    focus: 'Heritage tastings, cask storytelling, and private tours.',
    imageSrc: '/images/rooms/generated/accessible/accessible-artistic-1759248857443-57441r.png',
    alt: 'Bar lounge with warm timber palette ideal for whisky tastings',
  },
  {
    name: 'River Tay Adventures',
    distance: 'On the doorstep',
    focus: 'Kayaking, paddleboarding, and bespoke family expeditions.',
    imageSrc: '/images/rooms/generated/family/family-artistic-1759248840189-b78zgy.png',
    alt: 'Lounge seating with large windows facing nature, evoking outdoor experiences',
  },
  {
    name: 'Loch Tay Trails',
    distance: '15 minutes',
    focus: 'Guided sunrise hikes and photography walks among the Bens.',
    imageSrc: '/images/rooms/generated/suite/suite-artistic-1759248824246-ur9015.png',
    alt: 'Suite with telescope overlooking mountains, ideal for scenic exploration',
  },
]

const technologyPillars = [
  {
    title: 'Unified Bookings',
    detail: 'Next.js 15 experience layer powers web, PWA, and partner touchpoints.',
  },
  {
    title: 'Live Availability',
    detail: 'Firestore and Realtime Database sync rooms, tables, and experiences instantly.',
  },
  {
    title: 'Edge Delivery',
    detail: 'Vercel edge network and smart caching keep guests sub-100ms globally.',
  },
  {
    title: 'Secure Payments',
    detail: 'Stripe with 3D Secure, automated confirmations, and audit-ready logs.',
  },
]

const bookingFlow = [
  {
    stage: 'Dream',
    description: 'Hero storytelling, persona landing pages, and visual itineraries.',
    touchpoints: ['Dynamic hero modules', 'Personalised suggestions'],
  },
  {
    stage: 'Design',
    description: 'Drag-and-drop rooms, live packages, and preference capture.',
    touchpoints: ['Realtime room grid', 'Package compare'],
  },
  {
    stage: 'Savour',
    description: 'Dining reservations and local adventures in one itinerary builder.',
    touchpoints: ['Floor plan view', 'Experience marketplace'],
  },
  {
    stage: 'Confirm',
    description: 'Stripe checkout, instant confirmations, and concierge handover.',
    touchpoints: ['Payment intents', 'Automated welcome'],
  },
]

const conciergeFeatures = [
  {
    title: 'Virtual Highland Host',
    description: 'AI concierge curates itineraries, Gaelic greetings, and access needs.',
  },
  {
    title: 'Weather-smart Planning',
    description: 'Shifts guests from loch cruises to distillery tours on changing forecasts.',
  },
  {
    title: 'Culinary Guide',
    description: 'Instant menu guidance, allergen checks, and wine pairings.',
  },
  {
    title: 'Partner Integrations',
    description: 'Books tours, adventures, and tee times via connected APIs.',
  },
  {
    title: 'Upsell Intelligence',
    description: 'Suggests upgrades and late check-outs using guest segments.',
  },
  {
    title: 'Always-on Messaging',
    description: 'Unified inbox spanning chat, SMS, and email threads.',
  },
]

const operationsHighlights = [
  {
    title: 'Operations Hub',
    bullets: ['Drag-and-drop room assignment', 'Housekeeping snapshots', 'Overbooking guardrails'],
  },
  {
    title: 'Revenue Studio',
    bullets: ['Dynamic pricing experiments', 'Package analytics', 'Competitor insights'],
  },
  {
    title: 'Guest Desk',
    bullets: ['Pre-arrival automation', 'Loyalty segments', 'Unified messaging'],
  },
]

const integrationPartners = [
  { name: 'Hotels.uk.com', focus: 'Inventory sync', status: 'API discovery complete' },
  { name: 'Booking.com XML', focus: 'Two-way updates', status: 'Schema mapping' },
  { name: 'Stripe', focus: '3D Secure · multi-currency', status: 'Sandbox live' },
  { name: 'SendGrid & Twilio', focus: 'Messaging', status: 'Template design' },
  { name: 'VisitScotland & Weather', focus: 'Live data', status: 'Contract drafting' },
]

const milestones = [
  {
    phase: 'Blueprint',
    detail: 'Stakeholder alignment, content audit, and visual articulation.',
  },
  {
    phase: 'Foundation',
    detail: 'Rooms catalogue, availability services, and baseline payments.',
  },
  {
    phase: 'Concierge & Dining',
    detail: 'Restaurant flows, AI concierge, and partner integrations.',
  },
  {
    phase: 'Operations Intelligence',
    detail: 'Dashboards, forecasting, and loyalty connected to live data.',
  },
]

const recognitionBadges = [
  {
    title: 'Green Tourism Gold',
    description: 'Sustainability accreditation submission for 2025 season.',
  },
  {
    title: 'AA Hotel of the Year',
    description: 'Shortlisted for Scotland, celebrating service and design.',
  },
  {
    title: 'Condé Nast Traveller Hot List',
    description: 'In review with imagery and digital journey assets.',
  },
]

function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}) {
  const alignment = align === 'center' ? 'mx-auto text-center' : ''

  return (
    <RevealOnScroll className={`max-w-3xl ${alignment}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-semibold leading-tight text-lundies-charcoal sm:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-lundies-peat sm:text-lg">{description}</p> : null}
    </RevealOnScroll>
  )
}

export default function Home() {
  const { user } = useAuth()

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-lundies-ivory px-4 py-10 text-lundies-charcoal">
        <div className="w-full max-w-md rounded-3xl border border-lundies-stone/60 bg-white/80 p-8 shadow-xl backdrop-blur">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Welcome back</p>
            <h1 className="mt-3 text-3xl font-semibold">Schiehallion Hotel</h1>
            <p className="mt-2 text-sm text-lundies-peat">Log in to explore the full prototype journey.</p>
          </div>
          <LoginForm />
        </div>
      </main>
    )
  }

  return (
    <main className="relative bg-white text-lundies-charcoal">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-lundies-heather/20 blur-[160px]" />
        <div className="absolute right-[-12%] top-[20%] h-[32rem] w-[32rem] rounded-full bg-lundies-sand/30 blur-[200px]" />
        <div className="absolute bottom-[-20%] left-[25%] h-[30rem] w-[30rem] rounded-full bg-lundies-peat/15 blur-[200px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-lundies-stone/30 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <SiteNavigation
            sectionLinks={landingSections}
            actionSlot={
              <Link
                href="#contact"
                className="rounded-full border border-lundies-charcoal/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-lundies-charcoal transition hover:bg-lundies-charcoal hover:text-white"
              >
                Plan Your Stay
              </Link>
            }
          />
        </div>
      </header>

      <section id="overview" className="relative min-h-screen overflow-hidden text-white">
        <Carousel className="absolute inset-0 h-full" opts={{ loop: true }}>
          <CarouselContent className="h-full">
            {heroSlides.map((slide, index) => (
              <CarouselItem key={slide.caption} className="relative h-full">
                <div className="absolute inset-0">
                  <Image
                    src={slide.imageSrc}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" aria-hidden="true" />
                <div className="absolute bottom-10 left-10 hidden rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/80 backdrop-blur md:inline-flex">
                  {slide.caption}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="pointer-events-none absolute inset-x-0 bottom-12 hidden justify-between px-8 md:flex">
            <CarouselPrevious className="!static h-12 w-12 rounded-full border border-white/30 bg-white/20 text-white hover:bg-white/40 pointer-events-auto" />
            <CarouselNext className="!static h-12 w-12 rounded-full border border-white/30 bg-white/20 text-white hover:bg-white/40 pointer-events-auto" />
          </div>
        </Carousel>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-12 px-6 pb-24 pt-40">
          <RevealOnScroll className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.6em] text-white/80">Highland hospitality refined</p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight sm:text-6xl">Highland luxury, distilled</h1>
            <p className="mt-6 max-w-xl text-base text-white/80 sm:text-lg">
              A single scrolling journey capturing rooms, dining, experiences, and the operational engine ready to welcome guests
              to Aberfeldy.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/booking"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-lundies-charcoal transition hover:bg-white/80"
              >
                Book Now
              </Link>
              <Link
                href="#rooms"
                className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/15"
              >
                Explore Rooms
              </Link>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <dl className="grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/20 bg-white/10 p-5 text-center backdrop-blur"
                >
                  <dt className="text-xs uppercase tracking-[0.5em] text-white/60">{stat.label}</dt>
                  <dd className="mt-3 text-3xl font-semibold text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </RevealOnScroll>
        </div>

        <div className="pointer-events-none absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center text-[10px] uppercase tracking-[0.5em] text-white/70">
          <span>Scroll</span>
          <div className="scroll-indicator-bar mt-3 h-12 w-px bg-white/50" />
        </div>
      </section>

      <section id="rooms" className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Rooms & Suites"
            title="Tailored stays for every guest"
            description="Modular room stories ready for CMS handover, pricing integrations, and campaign storytelling."
            align="left"
          />
          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            {roomStories.map((room, index) => (
              <RevealOnScroll
                key={room.name}
                className="group overflow-hidden rounded-[32px] border border-lundies-stone/50 bg-white shadow-[0_24px_60px_rgba(31,27,22,0.08)]"
                delay={index * 80}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={room.imageSrc}
                    alt={room.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                  />
                </div>
                <div className="space-y-6 px-8 pb-8 pt-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight">{room.name}</h3>
                    <span className="text-xs uppercase tracking-[0.4em] text-lundies-moss">{room.vibe}</span>
                  </div>
                  <p className="text-sm text-lundies-peat">{room.summary}</p>
                  <div className="grid gap-4 text-sm">
                    <div className="flex items-center justify-between rounded-2xl bg-lundies-linen/50 px-4 py-3">
                      <span className="font-medium text-lundies-moss">Occupancy</span>
                      <span>{room.occupancy}</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-lundies-moss">Packages</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {room.packages.map((pkg) => (
                          <li key={pkg} className="rounded-full border border-lundies-stone/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-lundies-charcoal">
                            {pkg}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.4em] text-lundies-moss">Signature touches</p>
                      <ul className="mt-3 space-y-2 text-sm text-lundies-peat">
                        {room.features.map((feature) => (
                          <li key={feature} className="rounded-2xl bg-lundies-linen/60 px-3 py-2">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section id="dining" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-lundies-linen/60" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Dining"
            title="Perthshire produce in motion"
            description="Three culinary moments that flex for daily menus, special events, and seasonality."
            align="left"
          />
          <div className="mt-16 grid gap-10 lg:grid-cols-3">
            {diningMoments.map((moment, index) => (
              <RevealOnScroll
                key={moment.title}
                className="overflow-hidden rounded-[28px] border border-lundies-stone/50 bg-white/80 shadow-xl backdrop-blur"
                delay={index * 80}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={moment.imageSrc}
                    alt={moment.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, 100vw"
                  />
                </div>
                <div className="space-y-5 px-6 pb-6 pt-5">
                  <h3 className="text-xl font-semibold">{moment.title}</h3>
                  <p className="text-sm text-lundies-peat">{moment.description}</p>
                  <ul className="space-y-2 text-sm text-lundies-charcoal">
                    {moment.highlights.map((item) => (
                      <li key={item} className="rounded-full bg-lundies-heather/20 px-3 py-2">{item}</li>
                    ))}
                  </ul>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section id="experiences" className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Experiences"
            title="Aberfeldy moments to share"
            description="A capsule of partner adventures ready for itinerary builders and campaign modules."
            align="left"
          />
          <RevealOnScroll className="mt-12">
            <Carousel opts={{ align: 'start', loop: true }}>
              <CarouselContent>
                {experienceHighlights.map((experience) => (
                  <CarouselItem key={experience.name} className="basis-full md:basis-1/2 xl:basis-1/3">
                    <div className="mx-2 flex h-full flex-col overflow-hidden rounded-[28px] border border-lundies-stone/50 bg-white/80 shadow-lg backdrop-blur">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={experience.imageSrc}
                          alt={experience.alt}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-5">
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="text-lg font-semibold">{experience.name}</h3>
                          <span className="text-xs uppercase tracking-[0.4em] text-lundies-moss">{experience.distance}</span>
                        </div>
                        <p className="text-sm text-lundies-peat">{experience.focus}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-8 flex items-center justify-end gap-3">
                <CarouselPrevious className="h-10 w-10 rounded-full border border-lundies-stone/40 bg-white text-lundies-charcoal hover:bg-lundies-linen" />
                <CarouselNext className="h-10 w-10 rounded-full border border-lundies-stone/40 bg-white text-lundies-charcoal hover:bg-lundies-linen" />
              </div>
            </Carousel>
          </RevealOnScroll>
        </div>
      </section>

      <section id="technology" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-lundies-ivory/80" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Technology"
            title="Platform foundations in place"
            description="The architecture powering rapid bookings, content control, and marketing performance."
            align="left"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {technologyPillars.map((pillar, index) => (
              <RevealOnScroll
                key={pillar.title}
                className="rounded-[28px] border border-lundies-stone/50 bg-white p-6 shadow-lg"
                delay={index * 80}
              >
                <h3 className="text-lg font-semibold text-lundies-charcoal">{pillar.title}</h3>
                <p className="mt-3 text-sm text-lundies-peat">{pillar.detail}</p>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll className="mt-14 rounded-[32px] border border-lundies-stone/50 bg-white/90 p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {bookingFlow.map((step) => (
                <div key={step.stage} className="max-w-[14rem]">
                  <p className="text-xs uppercase tracking-[0.4em] text-lundies-moss">{step.stage}</p>
                  <p className="mt-3 text-sm text-lundies-charcoal">{step.description}</p>
                  <ul className="mt-3 space-y-1 text-xs text-lundies-peat">
                    {step.touchpoints.map((touchpoint) => (
                      <li key={touchpoint} className="rounded-full bg-lundies-linen/70 px-3 py-1">{touchpoint}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section id="concierge" className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="AI Concierge"
            title="Human warmth, instant support"
            description="Conversational service that complements the Schiehallion team around the clock."
            align="left"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {conciergeFeatures.map((feature, index) => (
              <RevealOnScroll
                key={feature.title}
                className="rounded-[28px] border border-lundies-heather/40 bg-lundies-heather/20 p-6"
                delay={index * 60}
              >
                <h3 className="text-lg font-semibold text-lundies-charcoal">{feature.title}</h3>
                <p className="mt-3 text-sm text-lundies-peat">{feature.description}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section id="operations" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-lundies-linen/70" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Operations"
            title="Precision behind the scenes"
            description="Tools for the Schiehallion team to orchestrate every stay with ease."
            align="left"
          />
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {operationsHighlights.map((panel, index) => (
              <RevealOnScroll
                key={panel.title}
                className="rounded-[28px] border border-lundies-stone/50 bg-white/90 p-6 shadow-lg"
                delay={index * 80}
              >
                <h3 className="text-lg font-semibold text-lundies-charcoal">{panel.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-lundies-peat">
                  {panel.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-full bg-lundies-linen/70 px-3 py-2">{bullet}</li>
                  ))}
                </ul>
              </RevealOnScroll>
            ))}
          </div>

          <RevealOnScroll className="mt-16 rounded-[32px] border border-lundies-stone/60 bg-white/90 p-6 shadow-xl">
            <div className="flex flex-wrap items-center gap-4">
              {integrationPartners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex flex-col gap-1 rounded-2xl border border-lundies-stone/50 bg-lundies-linen/60 px-4 py-3 text-xs uppercase tracking-[0.3em] text-lundies-moss"
                >
                  <span className="text-lundies-charcoal">{partner.name}</span>
                  <span className="text-[11px] normal-case tracking-[0.1em] text-lundies-peat">{partner.focus}</span>
                  <span className="text-[10px] normal-case tracking-[0.1em] text-lundies-charcoal/70">{partner.status}</span>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="mt-16 grid gap-6 md:grid-cols-2">
            {milestones.map((milestone) => (
              <div key={milestone.phase} className="rounded-[28px] border border-lundies-stone/50 bg-white/90 p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-lundies-charcoal">{milestone.phase}</h3>
                <p className="mt-3 text-sm text-lundies-peat">{milestone.detail}</p>
              </div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      <section id="awards" className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Recognition"
            title="Proof of craft"
            description="Signals for partners, press, and guests as the platform evolves."
            align="left"
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {recognitionBadges.map((badge, index) => (
              <RevealOnScroll
                key={badge.title}
                className="flex flex-col items-start gap-3 rounded-[28px] border border-lundies-stone/50 bg-white/90 p-6 shadow-lg"
                delay={index * 80}
              >
                <span className="rounded-full border border-lundies-peat/30 bg-lundies-peat/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-lundies-peat">
                  {badge.title}
                </span>
                <p className="text-sm text-lundies-peat">{badge.description}</p>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-lundies-ivory/85" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <SectionHeader
            eyebrow="Stay in touch"
            title="Plan the full journey"
            description="Ready for content updates, data connections, and guest testing with priority audiences."
          />
          <RevealOnScroll className="mt-12 grid gap-6 text-sm text-lundies-peat sm:grid-cols-3">
            <div className="rounded-3xl border border-lundies-stone/60 bg-white/90 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-lundies-moss">Visit</p>
              <p className="mt-3 text-sm text-lundies-charcoal">
                6 Dunkeld Street
                <br /> Aberfeldy, Perth & Kinross
                <br /> PH15 2AF
              </p>
            </div>
            <div className="rounded-3xl border border-lundies-stone/60 bg-white/90 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-lundies-moss">Call</p>
              <p className="mt-3 text-lg font-semibold text-lundies-charcoal">01887 820421</p>
              <p className="mt-2 text-xs text-lundies-peat">Front desk · 24/7</p>
            </div>
            <div className="rounded-3xl border border-lundies-stone/60 bg-white/90 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-lundies-moss">Write</p>
              <p className="mt-3 text-sm text-lundies-charcoal">bookings@schiehallionhotel.co.uk</p>
              <p className="mt-2 text-xs text-lundies-peat">Reservations & partnerships</p>
            </div>
          </RevealOnScroll>
          <RevealOnScroll className="mt-12 flex flex-wrap justify-center gap-4 text-xs uppercase tracking-[0.4em] text-lundies-moss">
            <span className="rounded-full border border-lundies-stone/60 px-4 py-2">WCAG-first layout</span>
            <span className="rounded-full border border-lundies-stone/60 px-4 py-2">Mobile optimised</span>
            <span className="rounded-full border border-lundies-stone/60 px-4 py-2">Ready for CMS</span>
          </RevealOnScroll>
        </div>
      </section>

      <footer className="border-t border-lundies-stone/40 bg-white/90 py-10 text-xs text-lundies-charcoal">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Schiehallion Hotel · Perthshire, Scotland</p>
          <p>Crafted for the Nano Banana hospitality stack initiative.</p>
        </div>
      </footer>

      <Suspense fallback={null}>
        <ConciergeChatWidget />
      </Suspense>
    </main>
  )
}
