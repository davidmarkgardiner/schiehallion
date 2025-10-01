import Image from 'next/image'

import type { diningMoments } from '@/data/landing'

interface DiningSectionProps {
  moments: typeof diningMoments
}

export default function DiningSection({ moments }: DiningSectionProps) {
  return (
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
          {moments.map((moment) => (
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
  )
}
