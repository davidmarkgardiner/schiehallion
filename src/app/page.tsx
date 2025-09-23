'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import LoginForm from '@/components/LoginForm'
import UserProfile from '@/components/UserProfile'

const navItems = [
  { label: 'Rooms', href: '#rooms' },
  { label: 'Dining', href: '#dining' },
  { label: 'Experiences', href: '#experiences' },
  { label: 'Technology', href: '#technology' },
  { label: 'Operations', href: '#operations' },
  { label: 'Connect', href: '#contact' },
]

const heroStats = [
  { label: 'Heritage rooms & suites', value: '15+' },
  { label: 'Guest rating', value: '4.8/5' },
  { label: 'Local partners', value: '12' },
]

const roomShowcase = [
  {
    name: 'Highland View Double',
    vibe: 'Cosy double • Loch-side outlook',
    occupancy: '2 adults · 1 child',
    packages: ['Bed & Breakfast', 'Dinner, Bed & Breakfast'],
    features: ['Super-king bed', 'Walk-in rainfall shower', 'Loch Tay welcome hamper'],
    notes:
      'Perfect for Highland Explorers planning a two-night getaway with fresh pastries delivered each morning.',
  },
  {
    name: 'Riverside Twin Retreat',
    vibe: 'Twin • Work-friendly comfort',
    occupancy: '2 adults',
    packages: ['Room Only', 'Corporate Express'],
    features: ['Ergonomic workspace', 'Ultrafast WiFi', 'Same-day laundry options'],
    notes:
      'Built for Business Travellers who need a calm base before meetings in Perthshire and beyond.',
  },
  {
    name: 'Family Cairngorm Suite',
    vibe: 'Family • Interconnected',
    occupancy: '2 adults · 2 children',
    packages: ['Family Adventure', 'Breakfast & Supper Club'],
    features: ['Separate kids nook', 'Games chest', 'Complimentary Beyond Adventure vouchers'],
    notes:
      'Give Event Planners a flexible hub for multi-room bookings and coordinated dining times.',
  },
  {
    name: 'Deluxe Schiehallion Loft',
    vibe: 'Suite • Romantic finish',
    occupancy: '2 adults',
    packages: ['Celebration Stay', 'Seasonal Tasting Journey'],
    features: ['In-room telescope', 'Freestanding bath', 'Private concierge check-in'],
    notes:
      'Our hero room for storytelling — perfect for campaign landing pages and influencer partnerships.',
  },
]

const diningMoments = [
  {
    title: 'The Schiehallion Kitchen',
    description:
      'Local produce takes centre stage — think Perthshire lamb, foraged chanterelles, and artisan bakers from Aberfeldy.',
    highlights: ['Seasonal tasting menus', 'Vegetarian & vegan pairings', 'Sommelier wine flights'],
  },
  {
    title: 'Breakfast & Brunch',
    description:
      'Sunrise spreads with hearty Scottish classics, continental favourites, and mindful options for early adventures.',
    highlights: ['Freshly baked morning rolls', 'Locally roasted Glen Lyon coffee', 'Express takeaway for river guides'],
  },
  {
    title: 'Afternoon Tea & Sunday Roast',
    description:
      'Weekend rituals return with sweet treats, Highland shortbread towers, and a countdown to our famous roast service.',
    highlights: ['Live roast countdown timer', 'Allergen-aware patisserie', 'Kids discovery tasting plates'],
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

const technologyPillars = [
  {
    title: 'Unified Booking Surface',
    detail:
      'Next.js 15 experience layer that powers web, PWA, and admin journeys with shared design tokens and accessibility baked in.',
  },
  {
    title: 'Real-time Availability Core',
    detail:
      'Firestore and Realtime Database keep room calendars, restaurant tables, and waitlists instantly synced across channels.',
  },
  {
    title: 'Edge-first Performance',
    detail:
      'Vercel Edge network, caching strategies, and CDN image optimisation keep global guests under 100ms to first content.',
  },
  {
    title: 'Payments & Compliance',
    detail:
      'Stripe for secure checkouts, PCI-ready workflows, and automated confirmations via SendGrid and Twilio.',
  },
]

const conciergeFeatures = [
  {
    title: 'Virtual Highland Host',
    description:
      'AI concierge that curates itineraries, translates Gaelic greetings, and matches accessibility needs to the right rooms.',
  },
  {
    title: 'Weather-smart Planning',
    description:
      'Connects to live forecasts to shift guests from loch cruises to distillery tours when the clouds roll in.',
  },
  {
    title: 'Culinary Guide',
    description:
      'Handles menu queries, allergen checks, and wine pairings with chef-approved responses in seconds.',
  },
  {
    title: 'Partner Integrations',
    description:
      'Books distillery tours, adventure sessions, and tee times via channel-ready APIs.',
  },
  {
    title: 'Upsell Intelligence',
    description:
      'Suggests upgrades, late check-outs, and local experiences based on guest segments and booking history.',
  },
]

const bookingFlow = [
  {
    stage: '1. Discover & Dream',
    description:
      'Story-first landing pages with hero video, rich imagery, and SEO content for every persona.',
    touchpoints: ['Dynamic hero modules', 'Local attraction hub', 'Personalised recommendations'],
  },
  {
    stage: '2. Build the Stay',
    description:
      'Drag-and-drop room selection, package toggles, and multi-room cart with live availability.',
    touchpoints: ['Realtime room grid', 'Package comparison', 'Guest preference capture'],
  },
  {
    stage: '3. Dine & Explore',
    description:
      'Table reservations, waitlist management, and experience add-ons all in one journey.',
    touchpoints: ['Interactive floor plan', 'Experience marketplace', 'Automated partner booking'],
  },
  {
    stage: '4. Confirm & Delight',
    description:
      'Stripe payments, instant confirmation, and automated concierge handover for pre-arrival nurture.',
    touchpoints: ['Payment intents', 'Email & SMS triggers', 'AI concierge welcome'],
  },
]

const operationsHighlights = [
  {
    title: 'Operations Command Centre',
    bullets: ['Drag-and-drop room assignment board', 'Housekeeping and maintenance snapshots', 'Overbooking guardrails and alerts'],
  },
  {
    title: 'Revenue Studio',
    bullets: ['Dynamic pricing experiments', 'Package performance analytics', 'Competitor rate monitoring dashboards'],
  },
  {
    title: 'Guest Relationship Desk',
    bullets: ['Pre-arrival and post-stay automation', 'Loyalty segmentation', 'Unified messaging inbox'],
  },
]

const integrationPartners = [
  { name: 'Hotels.uk.com Channel Manager', focus: 'Rate parity & inventory sync', priority: 'Critical', status: 'API discovery complete' },
  { name: 'Booking.com XML', focus: 'Two-way availability updates', priority: 'Critical', status: 'Schema mapping underway' },
  { name: 'Stripe Payments', focus: '3D Secure & multi-currency', priority: 'Critical', status: 'Sandbox connected' },
  { name: 'SendGrid & Twilio', focus: 'Transactional messaging', priority: 'High', status: 'Template design in progress' },
  { name: 'VisitScotland & Weather APIs', focus: 'Live events & climate signals', priority: 'Medium', status: 'Data contract drafting' },
  { name: 'Google Business Reviews', focus: 'Reputation insights', priority: 'Medium', status: 'Aggregation backlog' },
]

const milestones = [
  {
    phase: 'Phase 0 · Experience Blueprint (Now)',
    detail: 'Stakeholder alignment, content audit, data architecture, and this visual-first articulation of the future state.',
  },
  {
    phase: 'Phase 1 · Booking Foundation',
    detail: 'Deliver room catalogue, availability services, and baseline payments with progressive enhancement.',
  },
  {
    phase: 'Phase 2 · AI Concierge & Dining',
    detail: 'Layer in restaurant floor management, AI concierge flows, and partner integrations.',
  },
  {
    phase: 'Phase 3 · Operations Intelligence',
    detail: 'Launch admin dashboards, forecasting engines, and loyalty programming tied to live data.',
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
  const alignmentClasses = align === 'center' ? 'mx-auto text-center' : ''

  return (
    <div className={`max-w-3xl ${alignmentClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-100 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base text-slate-300 sm:text-lg">{description}</p> : null}
    </div>
  )
}

export default function Home() {
  const { user, userProfile } = useAuth()
  const [showGuestRegistration, setShowGuestRegistration] = useState(false)

  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Schiehallion Hotel</h1>
            <p className="text-slate-400">Highland hospitality reimagined</p>
          </div>
          <LoginForm />
        </div>
      </main>
    )
  }

  return (
    <main className="relative overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute right-[-10%] top-1/3 h-[24rem] w-[24rem] rounded-full bg-sky-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[5%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      </div>

      <header className="relative">
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-12 sm:pt-16">
          <nav className="flex flex-wrap items-center justify-between gap-6 text-sm text-slate-200">
            <a href="#top" className="font-semibold tracking-wide text-slate-100">
              Schiehallion Hotel
            </a>
            <div className="flex items-center gap-6">
              <div className="flex flex-wrap items-center gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <UserProfile />
            </div>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">Highland hospitality reimagined</p>
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                A modern booking journey for Aberfeldy’s landmark hotel
              </h1>
              <p className="max-w-xl text-base text-slate-300 sm:text-lg">
                This first-pass interface stitches together rooms, dining, experiences, and intelligent guest services into one
                cohesive digital platform. Every section below maps directly to the architecture, data models, and product
                ambitions outlined in the Schiehallion documentation.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#rooms"
                  className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-300"
                >
                  Explore Rooms
                </a>
                <a
                  href="#technology"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white hover:bg-white/10"
                >
                  View Platform Plan
                </a>
              </div>
            </div>
            <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Why this matters</h2>
                <p className="text-sm text-slate-200">
                  Designed for mobile-first bookings, high repeat guests, and story-driven marketing campaigns. This canvas sets the
                  tone for visual design, content hierarchy, and future interactive prototypes.
                </p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-black/30 p-4 text-center shadow-inner">
                    <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</dt>
                    <dd className="mt-2 text-2xl font-semibold text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-2xl bg-emerald-400/10 p-4 text-sm text-emerald-100">
                Future Enhancements: integrate live availability widgets, hero photography, and real guest storytelling once data
                connections are in place.
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="rooms" className="relative border-t border-white/10 bg-slate-950/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Rooms & Suites"
            title="Curated stays for every Schiehallion persona"
            description="Each card mirrors a Firestore room document with packages, amenities, and storytelling hooks ready for CMS integration."
            align="left"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {roomShowcase.map((room) => (
              <article key={room.name} className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg">
                <div>
                  <h3 className="text-2xl font-semibold text-white">{room.name}</h3>
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">{room.vibe}</p>
                </div>
                <p className="text-sm text-slate-200">{room.notes}</p>
                <div className="grid gap-4 text-sm text-slate-100">
                  <p className="flex items-center justify-between rounded-2xl bg-black/30 px-4 py-3">
                    <span className="font-medium text-slate-300">Occupancy</span>
                    <span>{room.occupancy}</span>
                  </p>
                  <div className="rounded-2xl bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Packages</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {room.packages.map((pkg) => (
                        <li key={pkg} className="flex items-center justify-between gap-2 rounded-full bg-white/5 px-3 py-2">
                          <span>{pkg}</span>
                          <span className="text-emerald-200">Live pricing soon</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signature touches</p>
                    <ul className="mt-3 grid gap-2 text-sm">
                      {room.features.map((feature) => (
                        <li key={feature} className="rounded-full bg-white/5 px-3 py-2 text-slate-100">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="dining" className="relative border-t border-white/10 bg-gradient-to-b from-slate-950/60 to-slate-900/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Dining"
            title="Celebrating Perthshire produce from morning to late night"
            description="Structured for CMS-powered menu updates, live table availability, and storytelling content modules."
            align="left"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {diningMoments.map((moment) => (
              <article key={moment.title} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">{moment.title}</h3>
                <p className="text-sm text-slate-200">{moment.description}</p>
                <ul className="mt-auto space-y-2 text-sm text-emerald-100">
                  {moment.highlights.map((item) => (
                    <li key={item} className="rounded-full bg-emerald-400/10 px-3 py-2">{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-10 grid gap-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-sm text-emerald-50 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Restaurant Operations</p>
              <p className="mt-2 text-emerald-50">
                Interactive floor plan, waitlist management, and POS integrations will sit beneath this hospitality storytelling.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Guest Signals</p>
              <p className="mt-2">
                Capture dietary notes, celebration flags, and concierge tasks for the team dashboard.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Content Rhythm</p>
              <p className="mt-2">
                Schedule Sunday roast countdowns, chef’s journal entries, and seasonal photography drops.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="experiences" className="relative border-t border-white/10 bg-slate-950/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Experiences"
            title="Build itineraries that stretch beyond the hotel walls"
            description="Data-ready attraction cards link to partner APIs, distance calculations, and AI-generated recommendations."
            align="left"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {experienceHighlights.map((experience) => (
              <article key={experience.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-xl font-semibold text-white">{experience.name}</h3>
                  <span className="text-xs uppercase tracking-[0.25em] text-emerald-200">{experience.distance}</span>
                </div>
                <p className="mt-4 text-sm text-slate-200">{experience.focus}</p>
                <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Live data feed ready</span>
                  <span>Partner onboarding</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="technology" className="relative border-t border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Platform Architecture"
            title="Nano Banana foundations tuned for hospitality"
            description="Grounded in the architecture blueprint: client experiences on Next.js, real-time data via Firebase, and integrations powering conversions."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {technologyPillars.map((pillar) => (
              <article key={pillar.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-4 text-sm text-slate-200">{pillar.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 grid gap-6 rounded-3xl border border-white/10 bg-black/30 p-6 md:grid-cols-4">
            {bookingFlow.map((step) => (
              <article key={step.stage} className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                <h4 className="text-base font-semibold text-white">{step.stage}</h4>
                <p className="text-sm text-slate-200">{step.description}</p>
                <ul className="mt-auto space-y-1 text-xs text-emerald-100">
                  {step.touchpoints.map((touchpoint) => (
                    <li key={touchpoint} className="rounded-full bg-emerald-400/10 px-3 py-2">{touchpoint}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="concierge" className="relative border-t border-white/10 bg-slate-950/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="AI Concierge"
            title="Human warmth, AI speed"
            description="Gemini and OpenAI services power contextual recommendations, multi-language support, and upsell journeys."
            align="left"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {conciergeFeatures.map((feature) => (
              <article key={feature.title} className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6 text-emerald-50">
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-emerald-100">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="operations" className="relative border-t border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Operations"
            title="A command centre for the Schiehallion team"
            description="Admin dashboards align with the architecture plan: Cloud Functions orchestrate automations, Redis accelerates forecasting, and Firestore stores operational states."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {operationsHighlights.map((panel) => (
              <article key={panel.title} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white">{panel.title}</h3>
                <ul className="space-y-2 text-sm text-slate-200">
                  {panel.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-full bg-white/5 px-3 py-2">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="integrations" className="relative border-t border-white/10 bg-slate-950/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Ecosystem"
            title="Integration runway"
            description="Prioritised roadmap for critical channel, payment, messaging, and data services."
            align="left"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {integrationPartners.map((partner) => (
              <article key={partner.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white">{partner.name}</h3>
                <p className="mt-2 text-sm text-slate-200">{partner.focus}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.25em] text-slate-400">
                  <span className="rounded-full bg-white/5 px-3 py-1">Priority · {partner.priority}</span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-emerald-200">{partner.status}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className="relative border-t border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-950/80 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow="Delivery"
            title="From blueprint to live guest journeys"
            description="Phased plan aligning design sprints, engineering focus, and content production."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {milestones.map((milestone) => (
              <article key={milestone.phase} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white">{milestone.phase}</h3>
                <p className="mt-3 text-sm text-slate-200">{milestone.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative border-t border-white/10 bg-slate-950/70 py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <SectionHeader
            eyebrow="Stay in touch"
            title="Let’s craft the full Schiehallion experience"
            description="Next steps: translate this vision into detailed component libraries, connect live data sources, and prepare usability tests with target guests."
          />
          <div className="mt-10 grid gap-6 text-sm text-slate-200 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Visit</p>
              <p className="mt-3 text-sm text-slate-100">
                6 Dunkeld Street
                <br /> Aberfeldy, Perth & Kinross
                <br /> PH15 2AF
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Call</p>
              <p className="mt-3 text-lg font-semibold text-white">01887 820421</p>
              <p className="mt-2 text-xs text-slate-300">Front desk · 24/7</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Write</p>
              <p className="mt-3 text-sm text-slate-100">bookings@schiehallionhotel.co.uk</p>
              <p className="mt-2 text-xs text-slate-300">Booking enquiries & partnerships</p>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4 text-xs uppercase tracking-[0.25em] text-slate-300">
            <span className="rounded-full border border-white/10 px-4 py-2">Phase 0 Prototype</span>
            <span className="rounded-full border border-white/10 px-4 py-2">WCAG-first layout</span>
            <span className="rounded-full border border-white/10 px-4 py-2">Mobile friendly</span>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/60 py-10 text-xs text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Schiehallion Hotel · Perthshire, Scotland</p>
          <p>Part of the Nano Banana hospitality stack initiative.</p>
        </div>
      </footer>
    </main>
  )
}
