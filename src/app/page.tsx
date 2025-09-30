'use client'

import Image from 'next/image'
import Link from 'next/link'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'

import LoginForm from '@/components/LoginForm'
import SiteNavigation from '@/components/navigation/SiteNavigation'
import { useAuth } from '@/context/AuthContext'

const ConciergeChatWidget = lazy(() => import('@/components/concierge/ConciergeChatWidget'))

const landingSections = [
  { label: 'Story', href: '#story' },
  { label: 'Rooms', href: '#rooms' },
  { label: 'Dining', href: '#dining' },
  { label: 'Experiences', href: '#experiences' },
  { label: 'Technology', href: '#technology' },
  { label: 'Operations', href: '#operations' },
  { label: 'Awards', href: '#awards' },
  { label: 'Contact', href: '#contact' },
]

const heroImages = [
  {
    src: '/images/rooms/generated/suite/suite-artistic-1759248824246-ur9015.png',
    alt: 'Soft morning light inside the Schiehallion loft suite',
    caption: 'Loch Tay suites with tailored service',
  },
  {
    src: '/images/rooms/generated/deluxe/deluxe-artistic-1759248801864-outd2c.png',
    alt: 'Deluxe room featuring freestanding bath and herringbone floors',
    caption: 'Deluxe comforts with Highland textures',
  },
  {
    src: '/images/rooms/generated/family/family-artistic-1759248840189-b78zgy.png',
    alt: 'Family suite with warm timber panelling and seating nook',
    caption: 'Family suites crafted for together time',
  },
]

const roomCollections = [
  {
    name: 'Highland View Double',
    summary: 'Loch-side calm, super-king sleep, fresh pastries on cue.',
    image: '/images/rooms/generated/standard/standard-artistic-1759248767421-r0mln6.png',
    meta: 'Signature Double · 2 adults + child',
  },
  {
    name: 'Riverside Twin Retreat',
    summary: 'Twin comfort with ergonomic workspace and ultrafast Wi-Fi.',
    image: '/images/rooms/generated/accessible/accessible-artistic-1759248857443-57441r.png',
    meta: 'Twin · Work-ready sanctuary',
  },
  {
    name: 'Family Cairngorm Suite',
    summary: 'Interconnected rooms, games chest, and concierge planning.',
    image: '/images/rooms/generated/family/family-artistic-1759248840189-b78zgy.png',
    meta: 'Two-bedroom suite · 2 adults · 2 children',
  },
  {
    name: 'Deluxe Schiehallion Loft',
    summary: 'Freestanding bath, private check-in, telescope over Ben Lawers.',
    image: '/images/rooms/generated/deluxe/deluxe-artistic-1759248801864-outd2c.png',
    meta: 'Loft suite · Celebrations',
  },
]

const diningMoments = [
  {
    title: 'The Schiehallion Kitchen',
    description: 'Seasonal tasting journeys with Perthshire produce and sommelier pairings.',
    image: '/images/rooms/generated/suite/suite-artistic-1759248824246-ur9015.png',
    highlights: ['Four-course tasting', 'Vegan pairings', 'Wine flights'],
  },
  {
    title: 'Breakfast & Brunch',
    description: 'Sunrise spreads, Glen Lyon coffee, and take-away baskets for river guides.',
    image: '/images/rooms/generated/standard/standard-artistic-1759248767421-r0mln6.png',
    highlights: ['Fresh pastries', 'Express takeaway', 'Locally roasted beans'],
  },
  {
    title: 'Afternoon Rituals',
    description: 'Highland shortbread towers, live roast countdown, patisserie made in-house.',
    image: '/images/rooms/generated/accessible/accessible-artistic-1759248857443-57441r.png',
    highlights: ['Seasonal tea menu', 'Allergen aware', 'Sunday roast theatre'],
  },
]

const experienceStories = [
  {
    name: 'Dewars Aberfeldy Distillery',
    distance: '2 miles',
    description: 'Heritage tastings, storytelling lounges, bespoke whisky flights.',
  },
  {
    name: 'Beyond Adventure',
    distance: 'On the River Tay',
    description: 'Kayaking, paddleboarding, and private guides for every level.',
  },
  {
    name: 'Loch Tay & Ben Lawers',
    distance: '15 minutes',
    description: 'Sunrise hikes, photographer-led expeditions, snowline picnics.',
  },
  {
    name: 'Aberfeldy Watermill & Gallery',
    distance: '5 minute walk',
    description: 'Independent bookshop, art exhibitions, slow-travel inspiration.',
  },
]

const technologyPillars = [
  {
    title: 'Unified Booking Surface',
    detail:
      'Next.js 15 powering responsive web, PWA, and admin journeys with shared tokens and inclusive patterns.',
  },
  {
    title: 'Real-time Availability Core',
    detail: 'Firestore + Realtime Database syncing room calendars, dining tables, and partner allotments.',
  },
  {
    title: 'Edge-first Performance',
    detail: 'CDN image optimisation, caching strategies, and sub-100ms first content worldwide.',
  },
  {
    title: 'Payments & Assurance',
    detail: 'Stripe integrations with 3D Secure, automated confirmations, and audit-ready histories.',
  },
]

const operationsHighlights = [
  {
    title: 'Operations Command Centre',
    points: ['Drag-and-drop room assignment', 'Housekeeping snapshots', 'Proactive maintenance alerts'],
  },
  {
    title: 'Revenue Studio',
    points: ['Dynamic pricing experiments', 'Package performance analytics', 'Competitive benchmarks'],
  },
  {
    title: 'Guest Relationship Desk',
    points: ['Unified inbox', 'Pre-arrival and post-stay flows', 'Loyalty segmentation'],
  },
]

const awards = [
  { label: 'Scottish Hotel Awards', detail: 'Boutique Hotel of the Year · 2023' },
  { label: 'Green Key Certification', detail: 'Sustainable operations accreditation' },
  { label: 'VisitScotland', detail: '5-Star Gold Guest Accommodation' },
  { label: 'Condé Nast Traveller', detail: 'Readers Choice Top 20 Highlands' },
]

const contactChannels = [
  { label: 'Visit', detail: '1-5 Dunkeld Street, Aberfeldy, PH15 2AA', href: 'https://maps.app.goo.gl/qxgTB1gYkn12' },
  { label: 'Reserve', detail: '+44 (0)1887 352 214', href: 'tel:+441887352214' },
  { label: 'Enquire', detail: 'hello@schiehallionhotel.co.uk', href: 'mailto:hello@schiehallionhotel.co.uk' },
]

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)

    handleChange()
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

export default function Home() {
  const { user } = useAuth()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [activeHero, setActiveHero] = useState(0)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) return

    const timer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroImages.length)
    }, 7000)

    return () => window.clearInterval(timer)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]')

    if (!revealElements.length) return

    if (prefersReducedMotion) {
      revealElements.forEach((element) => {
        element.classList.add('reveal-visible')
      })
      return
    }

    revealElements.forEach((element) => {
      element.classList.add('reveal-element')
    })

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible')
            obs.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )

    revealElements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [prefersReducedMotion])

  const heroCaptions = useMemo(() => heroImages.map((image) => image.caption), [])

  useEffect(() => {
    if (!showLogin) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLogin(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showLogin])

  useEffect(() => {
    if (user) {
      setShowLogin(false)
    }
  }, [user])

  return (
    <main className="relative bg-lundies-ivory text-lundies-charcoal">
      <SiteNavigation
        sectionLinks={landingSections}
        isSticky
        layout="landing"
        actionSlot={
          user ? (
            <Link
              href="/booking"
              className="inline-flex rounded-full border border-lundies-stone/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-lundies-charcoal transition hover:bg-white/70"
            >
              Manage booking
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="inline-flex rounded-full border border-lundies-stone/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-lundies-charcoal transition hover:bg-white/70"
            >
              Sign in
            </button>
          )
        }
      />

      <section
        id="story"
        className="relative flex min-h-[90vh] flex-col justify-end overflow-hidden border-b border-lundies-stone/40 bg-black/60"
      >
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`object-cover transition-opacity duration-[1200ms] ease-out ${
                index === activeHero ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/60" />
        </div>

        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-32 text-white">
          <div className="max-w-3xl space-y-6" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/70">Aberfeldy, Scotland</p>
            <h1 className="text-4xl leading-tight sm:text-5xl lg:text-6xl">
              A minimalist canvas for luxury Highland hospitality
            </h1>
            <p className="max-w-xl text-base text-white/80 sm:text-lg">
              We distilled the Schiehallion experience into a single flowing page: cinematic imagery, crafted typography, and a
              calm rhythm from arrival to farewell.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-lundies-charcoal transition hover:bg-white/90"
              >
                Book your stay
              </Link>
              <Link
                href="#rooms"
                className="rounded-full border border-white/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white hover:bg-white/10"
              >
                Explore rooms
              </Link>
            </div>
          </div>

          <div className="flex items-end justify-between" data-reveal>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/70">Now featuring</p>
              <p className="mt-3 text-lg font-light text-white">
                {heroCaptions[activeHero]}
              </p>
            </div>
            <div className="hidden items-center gap-4 sm:flex">
              <span className="text-xs uppercase tracking-[0.3em] text-white/50">Scroll</span>
              <div className="scroll-indicator" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section id="rooms" className="bg-lundies-ivory py-24">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6">
          <header className="max-w-2xl space-y-4" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Rooms & suites</p>
            <h2 className="text-3xl sm:text-4xl">Tailored stays for every travel story</h2>
            <p className="text-base text-lundies-peat">
              Each room is staged for photography, future availability widgets, and campaign-ready storytelling.
            </p>
          </header>

          <div className="space-y-16">
            {roomCollections.map((room, index) => (
              <article
                key={room.name}
                className={`grid gap-10 md:grid-cols-2 md:items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-lundies-stone/40" data-reveal>
                  <Image
                    src={room.image}
                    alt={room.name}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                </div>
                <div className="space-y-6" data-reveal>
                  <p className="text-xs uppercase tracking-[0.4em] text-lundies-moss">{room.meta}</p>
                  <h3 className="text-3xl">{room.name}</h3>
                  <p className="text-base text-lundies-peat">{room.summary}</p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/rooms"
                      className="rounded-full border border-lundies-stone px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-lundies-charcoal transition hover:bg-white"
                    >
                      Room details
                    </Link>
                    <Link
                      href="/booking"
                      className="rounded-full bg-lundies-heather px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-lundies-charcoal transition hover:bg-lundies-heather/80"
                    >
                      Check availability
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="dining" className="bg-white py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <header className="max-w-2xl space-y-4" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Dining journey</p>
            <h2 className="text-3xl sm:text-4xl">Culinary moments paced through the day</h2>
            <p className="text-base text-lundies-peat">
              Menus that celebrate Perthshire produce with immersive photography ready for story-led campaigns.
            </p>
          </header>

          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {diningMoments.map((moment) => (
              <article key={moment.title} className="space-y-6" data-reveal>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-lundies-stone/30">
                  <Image
                    src={moment.image}
                    alt={moment.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl">{moment.title}</h3>
                  <p className="text-sm text-lundies-peat">{moment.description}</p>
                  <ul className="space-y-2 text-xs uppercase tracking-[0.3em] text-lundies-moss">
                    {moment.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center justify-between border-b border-lundies-stone/50 pb-2">
                        <span>{highlight}</span>
                        <span className="text-lundies-charcoal/50">Soon in app</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="experiences" className="bg-lundies-ivory py-24">
        <div className="mx-auto w-full max-w-6xl space-y-12 px-6">
          <header className="max-w-2xl space-y-4" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Experiences</p>
            <h2 className="text-3xl sm:text-4xl">Curated adventures around Aberfeldy</h2>
            <p className="text-base text-lundies-peat">
              Designed as swipeable stories with partner integrations and live availability hooks.
            </p>
          </header>

          <div
            className="flex gap-8 overflow-x-auto pb-4"
            data-reveal
            role="list"
            aria-label="Experience highlights"
          >
            {experienceStories.map((experience) => (
              <div
                key={experience.name}
                role="listitem"
                className="min-w-[260px] max-w-xs flex-1 space-y-4 rounded-[2rem] border border-lundies-stone/60 bg-white/70 p-6 backdrop-blur"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-lundies-moss">{experience.distance}</p>
                <h3 className="text-2xl">{experience.name}</h3>
                <p className="text-sm text-lundies-peat">{experience.description}</p>
                <span className="text-xs uppercase tracking-[0.3em] text-lundies-charcoal/60">Concierge ready</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="technology" className="bg-white py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <header className="max-w-2xl space-y-4" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Technology</p>
            <h2 className="text-3xl sm:text-4xl">The platform behind the poise</h2>
            <p className="text-base text-lundies-peat">
              Modular services keep the guest journey quick, personalised, and future-friendly.
            </p>
          </header>

          <div className="mt-16 grid gap-8 md:grid-cols-2" data-reveal>
            {technologyPillars.map((pillar) => (
              <article
                key={pillar.title}
                className="space-y-4 rounded-[2rem] border border-lundies-stone/60 bg-lundies-linen/80 p-8 shadow-sm"
              >
                <h3 className="text-2xl">{pillar.title}</h3>
                <p className="text-sm text-lundies-peat">{pillar.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="operations" className="bg-lundies-ivory py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <header className="max-w-2xl space-y-4" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Operations</p>
            <h2 className="text-3xl sm:text-4xl">Empowering teams behind the scenes</h2>
            <p className="text-base text-lundies-peat">
              Interfaces choreographed for operations, revenue, and guest relations to collaborate in real time.
            </p>
          </header>

          <div className="mt-16 grid gap-8 md:grid-cols-3" data-reveal>
            {operationsHighlights.map((highlight) => (
              <article key={highlight.title} className="space-y-5 rounded-[2rem] border border-lundies-stone/60 bg-white/80 p-6">
                <h3 className="text-2xl">{highlight.title}</h3>
                <ul className="space-y-3 text-sm text-lundies-peat">
                  {highlight.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span aria-hidden="true" className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-lundies-moss" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="awards" className="bg-white py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <header className="max-w-xl space-y-4 text-center" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Recognition</p>
            <h2 className="text-3xl sm:text-4xl">Awards & credentials</h2>
            <p className="text-base text-lundies-peat">
              Trusted accolades underscore the craft, sustainability, and welcome at the heart of Schiehallion.
            </p>
          </header>

          <div className="mt-12 grid gap-6 sm:grid-cols-2" data-reveal>
            {awards.map((award) => (
              <div
                key={award.label}
                className="flex flex-col gap-2 rounded-[2rem] border border-lundies-stone/70 bg-lundies-linen/70 p-8 text-center"
              >
                <span className="text-xs uppercase tracking-[0.4em] text-lundies-moss">{award.label}</span>
                <span className="text-lg">{award.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="bg-lundies-ivory py-24">
        <div className="mx-auto w-full max-w-6xl space-y-16 px-6">
          <header className="max-w-2xl space-y-4" data-reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Connect</p>
            <h2 className="text-3xl sm:text-4xl">Let’s curate your Schiehallion stay</h2>
            <p className="text-base text-lundies-peat">
              Reach out to the team or launch the concierge to plan rooms, dining, and Aberfeldy adventures.
            </p>
          </header>

          <div className="grid gap-10 md:grid-cols-[2fr,1fr]" data-reveal>
            <div className="grid gap-6 sm:grid-cols-3">
              {contactChannels.map((channel) => (
                <div key={channel.label} className="space-y-2 rounded-[2rem] border border-lundies-stone/60 bg-white/80 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-lundies-moss">{channel.label}</p>
                  <Link
                    href={channel.href}
                    className="text-lg leading-tight text-lundies-charcoal transition hover:text-lundies-peat"
                  >
                    {channel.detail}
                  </Link>
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-[2rem] border border-lundies-stone/60 bg-white/80 p-6">
              <h3 className="text-xl">Virtual Highland Host</h3>
              <p className="text-sm text-lundies-peat">
                Launch the concierge to craft itineraries, translate Gaelic welcomes, and arrange partner bookings.
              </p>
              <Suspense fallback={<p className="text-sm text-lundies-peat">Loading concierge…</p>}>
                <ConciergeChatWidget />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-lundies-stone/60 bg-white/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 text-sm text-lundies-peat md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-lundies-charcoal">Schiehallion Hotel</p>
            <p className="mt-1">Luxury in the heart of Aberfeldy since 1870.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="transition hover:text-lundies-charcoal">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-lundies-charcoal">
              Terms
            </Link>
            <Link href="/rooms" className="transition hover:text-lundies-charcoal">
              Rooms
            </Link>
            <Link href="/restaurant" className="transition hover:text-lundies-charcoal">
              Dining
            </Link>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-lundies-peat/70">Design · Photography · Hospitality</p>
        </div>
      </footer>

      {!user && showLogin ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md space-y-6 rounded-3xl border border-lundies-stone/60 bg-white/95 p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="absolute right-4 top-4 rounded-full border border-lundies-stone/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-lundies-charcoal transition hover:bg-lundies-stone/30"
              aria-label="Close login"
            >
              Close
            </button>
            <div className="text-center">
              <h2 className="text-2xl text-lundies-charcoal">Welcome back</h2>
              <p className="mt-2 text-sm text-lundies-peat">Sign in to manage bookings and staff tools.</p>
            </div>
            <LoginForm />
          </div>
        </div>
      ) : null}
    </main>
  )
}
