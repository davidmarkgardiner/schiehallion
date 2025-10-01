'use client'

import Link from 'next/link'
import { lazy, useEffect, useState } from 'react'

import ErrorBoundary from '@/components/ErrorBoundary'
import AwardsSection from '@/components/landing/AwardsSection'
import ContactSection from '@/components/landing/ContactSection'
import DiningSection from '@/components/landing/DiningSection'
import ExperiencesSection from '@/components/landing/ExperiencesSection'
import HeroSection from '@/components/landing/HeroSection'
import OperationsSection from '@/components/landing/OperationsSection'
import RoomsSection from '@/components/landing/RoomsSection'
import TechnologySection from '@/components/landing/TechnologySection'
import LoginForm from '@/components/LoginForm'
import SiteNavigation from '@/components/navigation/SiteNavigation'
import { contactChannels } from '@/config/contact'
import { useAuth } from '@/context/AuthContext'
import {
  awards,
  diningMoments,
  experienceStories,
  heroImages,
  landingSections,
  operationsHighlights,
  roomCollections,
  technologyPillars,
} from '@/data/landing'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'

const ConciergeChatWidget = lazy(() => import('@/components/concierge/ConciergeChatWidget'))

export default function Home() {
  const { user } = useAuth()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [showLogin, setShowLogin] = useState(false)

  useRevealOnScroll(prefersReducedMotion)

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

      <HeroSection heroImages={heroImages} prefersReducedMotion={prefersReducedMotion} />
      <RoomsSection rooms={roomCollections} />
      <DiningSection moments={diningMoments} />
      <ExperiencesSection experiences={experienceStories} />
      <TechnologySection pillars={technologyPillars} />
      <OperationsSection highlights={operationsHighlights} />
      <AwardsSection awards={awards} />
      <ContactSection
        channels={contactChannels}
        conciergeWidget={
          <ErrorBoundary
            fallback={
              <p className="text-sm text-lundies-peat">
                Concierge widget unavailable. Please contact us directly.
              </p>
            }
          >
            <ConciergeChatWidget />
          </ErrorBoundary>
        }
      />

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
