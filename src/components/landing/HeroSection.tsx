'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { heroImages } from '@/data/landing'

interface HeroSectionProps {
  heroImages: typeof heroImages
  prefersReducedMotion: boolean
}

export default function HeroSection({ heroImages, prefersReducedMotion }: HeroSectionProps) {
  const [activeHero, setActiveHero] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) return

    const timer = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroImages.length)
    }, 7000)

    return () => window.clearInterval(timer)
  }, [prefersReducedMotion, heroImages.length])

  const heroCaptions = heroImages.map((image) => image.caption)

  return (
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
            <p className="mt-3 text-lg font-light text-white">{heroCaptions[activeHero]}</p>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">Scroll</span>
            <div className="scroll-indicator" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
