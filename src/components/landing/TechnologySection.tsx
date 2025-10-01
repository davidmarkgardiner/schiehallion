import type { technologyPillars } from '@/data/landing'

interface TechnologySectionProps {
  pillars: typeof technologyPillars
}

export default function TechnologySection({ pillars }: TechnologySectionProps) {
  return (
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
          {pillars.map((pillar) => (
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
  )
}
