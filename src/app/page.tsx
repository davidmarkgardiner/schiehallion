'use client'

import Image from 'next/image'
import Link from 'next/link'
import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import LoginForm from '@/components/LoginForm'
import SiteNavigation from '@/components/navigation/SiteNavigation'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const ConciergeChatWidget = lazy(() => import('@/components/concierge/ConciergeChatWidget'))

const sectionLinks = [
  { label: 'Rooms', href: '#rooms' },
  { label: 'Dining', href: '#dining' },
  { label: 'Experiences', href: '#experiences' },
  { label: 'Technology', href: '#technology' },
  { label: 'Operations', href: '#operations' },
  { label: 'Awards', href: '#awards' },
  { label: 'Contact', href: '#contact' },
]

const heroSlides = [
  {
    src: '/images/rooms/generated/suite/suite-artistic-1759248824246-ur9015.png',
    alt: 'Soft evening light over the Schiehallion loft suite with freestanding bath.',
    caption: 'Highland hospitality reimagined',
  },
  {
    src: '/images/rooms/generated/deluxe/deluxe-artistic-1759248801864-outd2c.png',
    alt: 'Deluxe guest room with window views across Aberfeldy.',
    caption: 'Loch-side sanctuaries',
  },
  {
    src: '/images/rooms/generated/family/family-artistic-1759248840189-b78zgy.png',
    alt: 'Family suite with interconnecting lounge and playful details.',
    caption: 'Gatherings with heart',
  },
]

const stayCollections = [
  {
    name: 'Highland View Double',
    vibe: 'Cosy double • Loch-side outlook',
    description:
      'Perfect for Highland Explorers planning a two-night getaway with fresh pastries delivered each morning.',
    occupancy: '2 adults · 1 child',
    packages: ['Bed & Breakfast', 'Dinner, Bed & Breakfast'],
    highlights: ['Super-king bed', 'Walk-in rainfall shower', 'Loch Tay welcome hamper'],
    image: '/images/rooms/generated/deluxe/deluxe-artistic-1759248801864-outd2c.png',
    imageAlt: 'Sunlit Highland View Double guestroom with super-king bed and lounge nook.',
  },
  {
    name: 'Riverside Twin Retreat',
    vibe: 'Twin • Work-friendly comfort',
    description:
      'Built for Business Travellers seeking a calm base before meetings in Perthshire and beyond.',
    occupancy: '2 adults',
    packages: ['Room Only', 'Corporate Express'],
    highlights: ['Ergonomic workspace', 'Ultrafast WiFi', 'Same-day laundry options'],
    image: '/images/rooms/generated/standard/standard-artistic-1759248767421-r0mln6.png',
    imageAlt: 'Riverside twin room with generous workspace and calm neutral palette.',
  },
  {
    name: 'Family Cairngorm Suite',
    vibe: 'Family • Interconnected',
    description:
      'Gives Event Planners a flexible hub for multi-room bookings and coordinated dining times.',
    occupancy: '2 adults · 2 children',
    packages: ['Family Adventure', 'Breakfast & Supper Club'],
    highlights: ['Separate kids nook', 'Games chest', 'Complimentary Beyond Adventure vouchers'],
    image: '/images/rooms/generated/family/family-artistic-1759248840189-b78zgy.png',
    imageAlt: 'Family Cairngorm Suite with lounge space and children’s nook.',
  },
  {
    name: 'Deluxe Schiehallion Loft',
    vibe: 'Suite • Romantic finish',
    description:
      'Our hero room for storytelling — perfect for campaign landing pages and influencer partnerships.',
    occupancy: '2 adults',
    packages: ['Celebration Stay', 'Seasonal Tasting Journey'],
    highlights: ['In-room telescope', 'Freestanding bath', 'Private concierge check-in'],
    image: '/images/rooms/generated/suite/suite-artistic-1759248824246-ur9015.png',
    imageAlt: 'Schiehallion loft suite with freestanding bath overlooking Aberfeldy.',
  },
]

const diningJourneys = [
  {
    title: 'The Schiehallion Kitchen',
    description:
      'Perthshire lamb, foraged chanterelles, and bakeries from Aberfeldy set the tone for every dinner service.',
    highlights: ['Seasonal tasting menus', 'Vegetarian & vegan pairings', 'Sommelier wine flights'],
    image: '/images/rooms/generated/deluxe/deluxe-artistic-1759248801864-outd2c.png',
    imageAlt: 'Chef plating seasonal tasting menu in the Schiehallion kitchen.',
  },
  {
    title: 'Breakfast & Brunch',
    description:
      'Sunrise spreads of Scottish classics, continental favourites, and mindful options for early adventures.',
    highlights: ['Freshly baked morning rolls', 'Locally roasted Glen Lyon coffee', 'Express takeaway for guides'],
    image: '/images/rooms/generated/standard/standard-artistic-1759248767421-r0mln6.png',
    imageAlt: 'Breakfast table with pastries, coffee, and seasonal fruit.',
  },
  {
    title: 'Afternoon Tea & Sunday Roast',
    description:
      'Weekend rituals return with sweet treats, Highland shortbread towers, and our famous roast service.',
    highlights: ['Live roast countdown timer', 'Allergen-aware patisserie', 'Kids discovery tasting plates'],
    image: '/images/rooms/generated/family/family-artistic-1759248840189-b78zgy.png',
    imageAlt: 'Afternoon tea spread with cakes and tea service.',
  },
]

const experienceHighlights = [
  {
    name: 'Dewars Aberfeldy Distillery',
    distance: '2 miles',
    focus: 'Cask tasting tours, heritage storyrooms, curated whisky flights.',
  },
  {
    name: 'Beyond Adventure',
    distance: 'On the River Tay',
    focus: 'Kayaking, paddleboarding, and bespoke river guides for families.',
  },
  {
    name: 'Loch Tay & Ben Lawers',
    distance: '15 minutes',
    focus: 'Mountain trails, sunrise hikes, and photographer-led expeditions.',
  },
  {
    name: 'Aberfeldy Watermill & Gallery',
    distance: '5 minutes walk',
    focus: 'Independent bookshop, art exhibitions, and slow-travel inspiration.',
  },
]

const experienceGallery = [
  {
    src: '/images/rooms/generated/accessible/accessible-artistic-1759248857443-57441r.png',
    alt: 'Accessible suite with river-inspired textures and bespoke lighting.',
  },
  {
    src: '/images/rooms/generated/deluxe/deluxe-artistic-1759248801864-outd2c.png',
    alt: 'Dining table prepared for a seasonal tasting journey.',
  },
  {
    src: '/images/rooms/generated/suite/suite-artistic-1759248824246-ur9015.png',
    alt: 'Skyline view from the Schiehallion loft suite at dusk.',
  },
]

const technologyFoundations = [
  {
    title: 'Unified booking surface',
    detail:
      'Next.js 15 powers web, PWA, and admin journeys with shared tokens, localisation, and built-in accessibility.',
  },
  {
    title: 'Real-time availability core',
    detail: 'Firestore synchronises room calendars, restaurant tables, and waitlists instantly across channels.',
  },
  {
    title: 'Edge-first performance',
    detail: 'Vercel edge caching, CDN image optimisation, and Lighthouse 90+ benchmarks on every release.',
  },
  {
    title: 'Payments & compliance',
    detail: 'Stripe handles secure checkouts, 3DS, and automated confirmations via SendGrid and Twilio.',
  },
]

const bookingFlow = [
  {
    stage: 'Discover & dream',
    detail: 'Story-first landing pages with persona-driven imagery and SEO-ready content.',
  },
  {
    stage: 'Build the stay',
    detail: 'Drag-and-drop room selection, package toggles, and multi-room carts with live availability.',
  },
  {
    stage: 'Dine & explore',
    detail: 'Restaurant reservations, waitlists, and local experiences stitched into one journey.',
  },
  {
    stage: 'Confirm & delight',
    detail: 'Stripe payments, instant confirmation, and AI concierge handover for pre-arrival nurture.',
  },
]

const operationsChapters = [
  {
    title: 'Operations command centre',
    bullets: ['Drag-and-drop room assignment board', 'Housekeeping snapshots', 'Overbooking guardrails & alerts'],
  },
  {
    title: 'Revenue studio',
    bullets: ['Dynamic pricing experiments', 'Package performance analytics', 'Competitor rate monitoring'],
  },
  {
    title: 'Guest relationship desk',
    bullets: ['Pre-arrival and post-stay automation', 'Loyalty segmentation', 'Unified messaging inbox'],
  },
]

const accolades = [
  {
    title: 'Scottish Hotel Awards 2024',
    detail: 'Boutique hotel of the year · Finalist',
  },
  {
    title: 'VisitScotland Quality Assurance',
    detail: '4-Star Gold accreditation · Ongoing',
  },
  {
    title: 'Sustainable Highlands Charter',
    detail: 'Carbon-aware operations and local sourcing commitments',
  },
  {
    title: 'Foodies Magazine Shortlist',
    detail: 'Seasonal tasting journey · Editors’ pick',
  },
]

const contactDetails = [
  {
    label: 'Visit',
    lines: ['6 Dunkeld Street', 'Aberfeldy, Perth & Kinross', 'PH15 2AF'],
  },
  {
    label: 'Call',
    lines: ['01887 820421', 'Front desk · 24/7'],
  },
  {
    label: 'Write',
    lines: ['bookings@schiehallionhotel.co.uk', 'Partnerships & enquiries'],
  },
]

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) {
      element.classList.remove('opacity-0', 'translate-y-8')
      element.classList.add('opacity-100', 'translate-y-0')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn('translate-y-8 opacity-0 transition duration-[900ms] ease-out will-change-transform', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}) {
  const alignment = align === 'center' ? 'mx-auto text-center' : ''

  return (
    <Reveal className={cn('max-w-3xl', alignment)}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-peat-500">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-3xl font-medium tracking-tight text-peat-900 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-peat-600 sm:text-lg">{description}</p> : null}
    </Reveal>
  )
}

export default function Home() {
  const { user } = useAuth()
  const [activeSlide, setActiveSlide] = useState(0)
  const [experienceSlide, setExperienceSlide] = useState(0)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 7000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (media.matches) return

    const interval = window.setInterval(() => {
      setExperienceSlide((current) => (current + 1) % experienceGallery.length)
    }, 8000)

    return () => window.clearInterval(interval)
  }, [])

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--surface-base)] p-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--border-soft)] bg-white/80 p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-serif text-3xl font-semibold text-peat-900">Schiehallion Hotel</h1>
            <p className="text-sm uppercase tracking-[0.3em] text-peat-500">Highland hospitality reimagined</p>
          </div>
          <LoginForm />
        </div>
      </main>
    )
  }

  return (
    <main className="relative overflow-hidden bg-transparent text-peat-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <SiteNavigation
            layout="minimal"
            sectionLinks={sectionLinks}
            actionSlot={
              <Link
                href="/booking"
                className="hidden whitespace-nowrap rounded-full border border-peat-500/40 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.32em] text-peat-700 transition hover:border-peat-500 hover:text-peat-900 sm:inline-flex"
              >
                Reserve
              </Link>
            }
          />
        </div>
      </header>

      <section id="hero" className="relative flex min-h-screen flex-col justify-end overflow-hidden pt-32 text-white">
        <div className="absolute inset-0">
          {heroSlides.map((slide, index) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className={cn(
                'object-cover transition-opacity duration-[1800ms] ease-out',
                index === activeSlide ? 'opacity-100' : 'opacity-0'
              )}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black/80" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28">
          <Reveal className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-white/70">Aberfeldy, Perthshire</p>
            <h1 className="mt-6 font-serif text-4xl leading-tight tracking-tight text-white sm:text-6xl">
              A single, scrolling story for rooms, dining, and Highland adventures
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/80 sm:text-lg">
              Immerse guests in a minimalist, luxury journey inspired by Lundies with Schiehallion warmth woven through
              every section. Scroll to explore our rooms, culinary rituals, local partners, and the technology bringing
              the experience to life.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/booking"
                className="rounded-full bg-white/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-peat-900 transition hover:bg-white"
              >
                Book your stay
              </Link>
              <a
                href="#rooms"
                className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white hover:bg-white/10"
              >
                Explore rooms
              </a>
            </div>
          </Reveal>
        </div>

        <div className="relative z-10 mb-12 flex items-center justify-center gap-4">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={cn(
                'h-2.5 w-8 rounded-full border border-white/40 transition',
                index === activeSlide ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
              )}
              aria-label={`Show hero slide: ${slide.caption}`}
            />
          ))}
        </div>

        <div className="relative z-10 pb-10 text-center">
          <a
            href="#rooms"
            className="group inline-flex flex-col items-center text-[10px] font-semibold uppercase tracking-[0.4em] text-white/70"
          >
            <span className="mb-2 h-10 w-px origin-top scale-y-75 bg-white/60 transition group-hover:scale-y-100 group-hover:bg-white" />
            Scroll
          </a>
        </div>
      </section>

      <div className="relative z-10 space-y-32 bg-transparent pb-24 pt-24">
        <section id="rooms">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Rooms & Suites"
              title="Calm, tactile spaces with stories ready for every persona"
              description="Layer immersive photography with concise copy to capture explorers, families, business travellers, and celebratory stays."
            />
            <div className="mt-16 space-y-16">
              {stayCollections.map((stay, index) => (
                <Reveal
                  key={stay.name}
                  className={cn(
                    'grid gap-10 rounded-[40px] border border-[var(--border-soft)] bg-white/70 p-10 backdrop-blur-sm shadow-[0_20px_60px_rgba(31,27,22,0.08)] md:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]',
                    index % 2 === 1 && 'md:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)] md:[&>*:first-child]:order-2'
                  )}
                >
                  <div className="relative overflow-hidden rounded-3xl">
                    <Image
                      src={stay.image}
                      alt={stay.imageAlt}
                      width={1200}
                      height={900}
                      className="h-full w-full object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-8">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-peat-500">{stay.vibe}</p>
                      <h3 className="mt-4 font-serif text-3xl text-peat-900">{stay.name}</h3>
                      <p className="mt-4 text-base text-peat-600">{stay.description}</p>
                    </div>
                    <div className="grid gap-4 text-sm text-peat-700 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[var(--border-soft)] bg-white/60 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-peat-500">Occupancy</p>
                        <p className="mt-3 text-lg text-peat-900">{stay.occupancy}</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--border-soft)] bg-white/60 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-peat-500">Packages</p>
                        <ul className="mt-3 space-y-2">
                          {stay.packages.map((pkg) => (
                            <li key={pkg} className="flex items-center justify-between gap-3 text-sm">
                              <span>{pkg}</span>
                              <span className="text-peat-500">Rates updating live soon</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-[var(--border-soft)] bg-white/60 p-5 sm:col-span-2">
                        <p className="text-xs uppercase tracking-[0.3em] text-peat-500">Signature touches</p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {stay.highlights.map((highlight) => (
                            <li
                              key={highlight}
                              className="rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.25em] text-peat-600"
                            >
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="dining" className="bg-white/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Dining"
              title="Culinary rituals from dawn to dusk"
              description="Let the produce shine. Use full-width imagery, restrained copy, and highlight badges to surface menu stories and operational details."
            />
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              {diningJourneys.map((moment) => (
                <Reveal
                  key={moment.title}
                  className="flex flex-col overflow-hidden rounded-[32px] border border-[var(--border-soft)] bg-white/80 backdrop-blur-sm"
                >
                  <div className="relative h-56">
                    <Image
                      src={moment.image}
                      alt={moment.imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    />
                  </div>
                  <div className="flex h-full flex-col gap-6 p-8">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-peat-500">{moment.title}</p>
                      <p className="mt-4 text-sm text-peat-600">{moment.description}</p>
                    </div>
                    <ul className="mt-auto space-y-2 text-sm text-peat-700">
                      {moment.highlights.map((item) => (
                        <li
                          key={item}
                          className="rounded-full border border-[var(--border-soft)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.25em]"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-12 grid gap-6 rounded-[32px] border border-[var(--border-soft)] bg-white/70 p-8 text-sm text-peat-600 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-peat-500">Restaurant operations</p>
                <p className="mt-3">
                  Interactive floor plans, waitlist management, and POS integrations sit beneath the storytelling layer.
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-peat-500">Guest signals</p>
                <p className="mt-3">Capture dietary notes, celebration flags, and concierge handovers for team dashboards.</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-peat-500">Content rhythm</p>
                <p className="mt-3">Schedule roast countdowns, chef journals, and seasonal photography drops.</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="experiences">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Experiences"
              title="Curate itineraries beyond the hotel walls"
              description="Blend concise copy, distance cues, and an immersive carousel to showcase local partners ready for integration."
            />
            <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr,0.8fr]">
              <Reveal className="overflow-hidden rounded-[40px] border border-[var(--border-soft)] bg-white/80 p-6">
                <div className="relative">
                  <div className="relative h-[26rem] overflow-hidden rounded-[32px]">
                    {experienceGallery.map((image, index) => (
                      <Image
                        key={image.src}
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className={cn(
                          'object-cover transition-opacity duration-[1200ms] ease-out',
                          index === experienceSlide ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                    ))}
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {experienceHighlights.map((experience) => (
                      <div key={experience.name} className="rounded-2xl border border-[var(--border-soft)] bg-white/70 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-peat-500">{experience.distance}</p>
                        <h3 className="mt-3 font-serif text-xl text-peat-900">{experience.name}</h3>
                        <p className="mt-3 text-sm text-peat-600">{experience.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal className="flex flex-col justify-between gap-10 rounded-[40px] border border-[var(--border-soft)] bg-white/70 p-8 text-sm text-peat-600">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-peat-500">Concierge intelligence</p>
                  <p className="mt-3">
                    AI concierge flows curate itineraries, translate Gaelic greetings, and adapt to changing weather so
                    every booking feels personal.
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-peat-500">Partner integrations</p>
                  <ul className="mt-3 space-y-2">
                    <li className="rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.25em]">
                      Hotels.uk.com channel manager · API ready
                    </li>
                    <li className="rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.25em]">
                      Stripe payments · Sandbox connected
                    </li>
                    <li className="rounded-full border border-[var(--border-soft)] bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.25em]">
                      SendGrid & Twilio messaging · Templates in design
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-peat-500">Experience marketplace</p>
                  <p className="mt-3">
                    Curate distillery tours, river adventures, and cultural highlights with live availability and upsell
                    prompts built into the booking flow.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section id="technology" className="bg-white/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Platform architecture"
              title="Technology foundations that honour the guest journey"
              description="A modular Next.js and Firebase stack delivers fast, inclusive experiences across every touchpoint."
            />
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {technologyFoundations.map((pillar) => (
                <Reveal
                  key={pillar.title}
                  className="rounded-[32px] border border-[var(--border-soft)] bg-white/80 p-8 text-sm text-peat-600"
                >
                  <h3 className="font-serif text-xl text-peat-900">{pillar.title}</h3>
                  <p className="mt-4">{pillar.detail}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-12 grid gap-6 rounded-[32px] border border-[var(--border-soft)] bg-white/70 p-8 md:grid-cols-4">
              {bookingFlow.map((step) => (
                <div key={step.stage} className="flex flex-col gap-3 text-sm text-peat-600">
                  <p className="text-xs uppercase tracking-[0.3em] text-peat-500">{step.stage}</p>
                  <p>{step.detail}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        <section id="operations">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Operations"
              title="From command centre to guest loyalty"
              description="Dashboards, automations, and analytics align teams around one source of truth."
            />
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {operationsChapters.map((panel) => (
                <Reveal
                  key={panel.title}
                  className="flex h-full flex-col gap-4 rounded-[32px] border border-[var(--border-soft)] bg-white/80 p-8"
                >
                  <h3 className="font-serif text-xl text-peat-900">{panel.title}</h3>
                  <ul className="space-y-2 text-sm text-peat-600">
                    {panel.bullets.map((bullet) => (
                      <li key={bullet} className="rounded-full border border-[var(--border-soft)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.25em]">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="awards" className="bg-white/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="Recognition"
              title="Credentials and partnerships"
              description="Quiet confidence anchored in awards, accreditation, and sustainable commitments."
              align="center"
            />
            <Reveal className="mt-12 grid gap-6 md:grid-cols-4">
              {accolades.map((accolade) => (
                <div
                  key={accolade.title}
                  className="rounded-[28px] border border-[var(--border-soft)] bg-white/80 p-6 text-center text-sm text-peat-600"
                >
                  <p className="font-serif text-lg text-peat-900">{accolade.title}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.3em]">{accolade.detail}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        <section id="contact">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <SectionHeading
              eyebrow="Stay in touch"
              title="Let’s craft the full Schiehallion experience"
              description="Translate this vision into detailed component libraries, connect live data sources, and prepare guest testing."
              align="center"
            />
            <Reveal className="mt-12 grid gap-6 text-sm text-peat-600 sm:grid-cols-3">
              {contactDetails.map((item) => (
                <div key={item.label} className="rounded-[28px] border border-[var(--border-soft)] bg-white/80 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-peat-500">{item.label}</p>
                  <div className="mt-4 space-y-2 text-sm text-peat-700">
                    {item.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </Reveal>
            <Reveal className="mt-10 flex flex-wrap justify-center gap-4 text-xs uppercase tracking-[0.3em] text-peat-500">
              <span className="rounded-full border border-[var(--border-soft)] px-4 py-2">Prototype · Phase 0</span>
              <span className="rounded-full border border-[var(--border-soft)] px-4 py-2">WCAG-first layout</span>
              <span className="rounded-full border border-[var(--border-soft)] px-4 py-2">Mobile ready</span>
            </Reveal>
          </div>
        </section>
      </div>

      <footer className="border-t border-[var(--border-soft)] bg-white/70 py-10 text-xs text-peat-600">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Schiehallion Hotel · Aberfeldy, Scotland</p>
          <p>Designed for the Nano Banana hospitality stack initiative.</p>
        </div>
      </footer>

      <Suspense fallback={null}>
        <ConciergeChatWidget />
      </Suspense>
    </main>
  )
}
