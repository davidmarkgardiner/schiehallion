import Image from 'next/image'
import Link from 'next/link'

import type { roomCollections } from '@/data/landing'

interface RoomsSectionProps {
  rooms: typeof roomCollections
}

export default function RoomsSection({ rooms }: RoomsSectionProps) {
  return (
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
          {rooms.map((room, index) => (
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
  )
}
