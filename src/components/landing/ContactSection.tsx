import Link from 'next/link'
import { Suspense } from 'react'

import type { contactChannels } from '@/config/contact'

interface ContactSectionProps {
  channels: typeof contactChannels
  conciergeWidget: React.ReactNode
}

export default function ContactSection({ channels, conciergeWidget }: ContactSectionProps) {
  return (
    <section id="contact" className="bg-lundies-ivory py-24">
      <div className="mx-auto w-full max-w-6xl space-y-16 px-6">
        <header className="max-w-2xl space-y-4" data-reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-lundies-moss">Connect</p>
          <h2 className="text-3xl sm:text-4xl">Let's curate your Schiehallion stay</h2>
          <p className="text-base text-lundies-peat">
            Reach out to the team or launch the concierge to plan rooms, dining, and Aberfeldy adventures.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-[2fr,1fr]" data-reveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {channels.map((channel) => (
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
            <Suspense
              fallback={
                <div className="flex items-center gap-2 text-sm text-lundies-peat">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-lundies-moss border-t-transparent" />
                  <span>Loading concierge…</span>
                </div>
              }
            >
              {conciergeWidget}
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
